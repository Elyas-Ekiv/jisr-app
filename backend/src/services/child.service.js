const prisma = require('../config/db');
const { AppError } = require('../middlewares/error.middleware');
const { hashPassword, comparePassword } = require('../utils/password');
const activityService = require('./activity.service');
const billingService = require('./billing.service');

const getChildren = async (userId) => {
  return await prisma.child.findMany({
    where: { userId },
    include: {
      settings: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getChild = async (id, userId) => {
  const child = await prisma.child.findFirst({
    where: { id, userId },
    include: {
      settings: true,
      vocabulary: {
        include: {
          vocabulary: true,
        },
      },
    },
  });

  if (!child) {
    throw new AppError('Child not found', 404);
  }

  return child;
};

const createChild = async (data, userId) => {
  // ── Subscription-based child limit ────────────────────────────────────────
  const activeSub = await billingService.getActiveSubscription(userId);
  const childLimit = activeSub
    ? billingService.CHILD_LIMITS[activeSub.planId] || 1
    : billingService.CHILD_LIMITS['free-plan'];

  const currentCount = await prisma.child.count({ where: { userId } });
  if (currentCount >= childLimit) {
    const planName = activeSub ? activeSub.planName : 'Free';
    throw new AppError(
      `Your ${planName} plan allows up to ${childLimit} child profile${childLimit > 1 ? 's' : ''}. Please upgrade your plan to add more.`,
      403
    );
  }

  // Check username uniqueness
  if (data.username) {
    const existing = await prisma.child.findUnique({
      where: { username: data.username.toLowerCase() },
    });
    if (existing) {
      throw new AppError('This username is already taken', 400);
    }
  }

  // Hash the PIN
  let hashedPin = null;
  if (data.pin) {
    hashedPin = await hashPassword(data.pin);
  }

  const child = await prisma.child.create({
    data: {
      name: data.name,
      age: data.age,
      username: data.username ? data.username.toLowerCase() : null,
      pin: hashedPin,
      userId,
    },
  });

  // Create default AAC settings
  await prisma.aACSettings.create({
    data: {
      childId: child.id,
      primaryLanguage: 'en',
      voiceType: 'child',
      speechSpeed: 0.8,
      volume: 1.0,
      maxSentenceLength: 10,
      visibleImageCount: 0,
      vocabularyLevel: 'BASIC',
      speechMode: 'SENTENCE',
    },
  });

  // Create default locations
  const DEFAULT_LOCATIONS = [
    {
      name: 'Home',
      type: 'home',
      icon: '🏠',
      color: 'from-blue-400 to-blue-600',
      categories: [
        { category: 'needs',    enabled: true },
        { category: 'actions',  enabled: true },
        { category: 'feelings', enabled: true },
        { category: 'people',   enabled: true },
      ],
      enabled: true,
      order: 1,
    },
    {
      name: 'School',
      type: 'school',
      icon: '🏫',
      color: 'from-green-400 to-green-600',
      categories: [
        { category: 'needs',      enabled: true },
        { category: 'actions',    enabled: true },
        { category: 'social',     enabled: true },
        { category: 'activities', enabled: true },
      ],
      enabled: true,
      order: 2,
    },
    {
      name: 'Store',
      type: 'store',
      icon: '🛒',
      color: 'from-purple-400 to-purple-600',
      categories: [
        { category: 'needs',   enabled: true },
        { category: 'actions', enabled: true },
        { category: 'social',  enabled: true },
      ],
      enabled: true,
      order: 3,
    },
    {
      name: 'Restaurant',
      type: 'restaurant',
      icon: '🍽️',
      color: 'from-orange-400 to-orange-600',
      categories: [
        { category: 'needs',   enabled: true },
        { category: 'actions', enabled: true },
        { category: 'social',  enabled: true },
      ],
      enabled: true,
      order: 4,
    },
  ];

  const locationsData = DEFAULT_LOCATIONS.map(loc => ({
    ...loc,
    childId: child.id,
  }));
  await prisma.location.createMany({ data: locationsData });

  // Assign global vocabulary cards to the new child
  const globalVocab = await prisma.vocabulary.findMany({ where: { userId: null } });
  if (globalVocab.length > 0) {
    const vocabData = globalVocab.map(v => ({
      childId: child.id,
      vocabularyId: v.id,
    }));
    await prisma.childVocabulary.createMany({ data: vocabData });
  }

  // Log activity
  try {
    await activityService.logChildCreated(userId, child.id, child.name);
  } catch (error) {
    console.error('Failed to log child creation activity:', error);
  }

  return child;
};

const updateChild = async (id, data, userId) => {
  const existing = await prisma.child.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new AppError('Child not found', 404);
  }

  const updateData = {
    name: data.name,
    age: data.age,
  };

  // Handle username update
  if (data.username !== undefined) {
    const lowerUsername = data.username.toLowerCase();
    const duplicate = await prisma.child.findFirst({
      where: { username: lowerUsername, NOT: { id } },
    });
    if (duplicate) {
      throw new AppError('This username is already taken', 400);
    }
    updateData.username = lowerUsername;
  }

  // Handle PIN update
  if (data.pin) {
    updateData.pin = await hashPassword(data.pin);
  }

  return await prisma.child.update({
    where: { id },
    data: updateData,
  });
};

const deleteChild = async (id, userId) => {
  const existing = await prisma.child.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new AppError('Child not found', 404);
  }

  await prisma.child.delete({
    where: { id },
  });
};

/**
 * Authenticate a child by username + PIN.
 * Returns the child record and the parent userId for token generation.
 */
const authenticateChild = async (username, pin) => {
  const child = await prisma.child.findUnique({
    where: { username: username.toLowerCase() },
    include: { user: { select: { id: true, blocked: true } } },
  });

  if (!child || !child.pin) {
    throw new AppError('Invalid username or PIN', 401);
  }

  if (child.user.blocked) {
    throw new AppError('This account has been suspended', 403);
  }

  const valid = await comparePassword(pin, child.pin);
  if (!valid) {
    throw new AppError('Invalid username or PIN', 401);
  }

  return {
    child: {
      id: child.id,
      name: child.name,
      username: child.username,
      age: child.age,
      userId: child.userId,
    },
    parentUserId: child.userId,
  };
};

module.exports = {
  getChildren,
  getChild,
  createChild,
  updateChild,
  deleteChild,
  authenticateChild,
};


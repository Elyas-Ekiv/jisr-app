const prisma = require('../config/db');
const { AppError } = require('../middlewares/error.middleware');
const activityService = require('./activity.service');

const getAllVocabulary = async (userId, isAdmin = false) => {
  if (isAdmin) {
    return await prisma.vocabulary.findMany({
      orderBy: { order: 'asc' },
    });
  }

  // Return global cards (admin-created, userId = null, enabled) + user's own cards
  return await prisma.vocabulary.findMany({
    where: {
      OR: [
        { userId: null, enabled: true },
        { userId },
      ],
    },
    orderBy: { order: 'asc' },
  });
};

const getChildVocabulary = async (childId, userId) => {
  // Verify child belongs to user
  const child = await prisma.child.findFirst({
    where: { id: childId, userId },
  });

  if (!child) {
    throw new AppError('Child not found', 404);
  }

  const childVocab = await prisma.childVocabulary.findMany({
    where: { childId },
    include: {
      vocabulary: true,
    },
    orderBy: {
      vocabulary: {
        order: 'asc',
      },
    },
  });

  return childVocab.map(cv => cv.vocabulary);
};

const getVocabulary = async (id) => {
  const vocabulary = await prisma.vocabulary.findUnique({
    where: { id },
  });

  if (!vocabulary) {
    throw new AppError('Vocabulary not found', 404);
  }

  return vocabulary;
};

const createVocabulary = async (data, userId, role) => {
  return await prisma.vocabulary.create({
    data: {
      // Admin cards are global (null); user cards are scoped to their account
      userId: role === 'ADMIN' ? null : userId,
      text: data.text,
      category: data.category,
      level: data.level || 'BASIC',
      imageUrl: data.imageUrl || null,
      audioUrl: data.audioUrl || null,
      locations: Array.isArray(data.locations) ? data.locations : [],
      order: data.order || 0,
      enabled: data.enabled !== undefined ? data.enabled : true,
    },
  });
};

const updateVocabulary = async (id, data, userId, role) => {
  const existing = await prisma.vocabulary.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError('Vocabulary not found', 404);
  }

  // Non-admins may only edit their own cards
  if (role !== 'ADMIN' && existing.userId !== userId) {
    throw new AppError('You can only edit your own vocabulary cards', 403);
  }

  return await prisma.vocabulary.update({
    where: { id },
    data: {
      text: data.text,
      category: data.category,
      level: data.level,
      imageUrl: data.imageUrl !== undefined ? data.imageUrl : existing.imageUrl,
      audioUrl: data.audioUrl !== undefined ? data.audioUrl : existing.audioUrl,
      locations: data.locations !== undefined ? (Array.isArray(data.locations) ? data.locations : []) : existing.locations,
      order: data.order,
      enabled: data.enabled,
    },
  });
};

const deleteVocabulary = async (id, userId, role) => {
  const existing = await prisma.vocabulary.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError('Vocabulary not found', 404);
  }

  // Non-admins may only delete their own cards
  if (role !== 'ADMIN' && existing.userId !== userId) {
    throw new AppError('You can only delete your own vocabulary cards', 403);
  }

  await prisma.vocabulary.delete({
    where: { id },
  });
};

const assignToChild = async (vocabularyId, childId, userId) => {
  // Verify child belongs to user
  const child = await prisma.child.findFirst({
    where: { id: childId, userId },
  });

  if (!child) {
    throw new AppError('Child not found', 404);
  }

  // Verify vocabulary exists
  const vocabulary = await prisma.vocabulary.findUnique({
    where: { id: vocabularyId },
  });

  if (!vocabulary) {
    throw new AppError('Vocabulary not found', 404);
  }

  // Check if already assigned
  const existing = await prisma.childVocabulary.findUnique({
    where: {
      childId_vocabularyId: {
        childId,
        vocabularyId,
      },
    },
  });

  if (existing) {
    throw new AppError('Vocabulary already assigned to child', 400);
  }

  await prisma.childVocabulary.create({
    data: {
      childId,
      vocabularyId,
    },
  });

  // Log activity
  try {
    await activityService.logVocabularyAdded(userId, childId, vocabularyId, vocabulary.text);
  } catch (error) {
    console.error('Failed to log vocabulary assignment activity:', error);
    // Don't fail the request if activity logging fails
  }

  return { message: 'Vocabulary assigned successfully' };
};

const unassignFromChild = async (vocabularyId, childId, userId) => {
  // Verify child belongs to user
  const child = await prisma.child.findFirst({
    where: { id: childId, userId },
  });

  if (!child) {
    throw new AppError('Child not found', 404);
  }

  const existing = await prisma.childVocabulary.findUnique({
    where: {
      childId_vocabularyId: {
        childId,
        vocabularyId,
      },
    },
  });

  if (!existing) {
    throw new AppError('Vocabulary not assigned to child', 404);
  }

  await prisma.childVocabulary.delete({
    where: {
      childId_vocabularyId: {
        childId,
        vocabularyId,
      },
    },
  });

  return { message: 'Vocabulary unassigned successfully' };
};

module.exports = {
  getAllVocabulary,
  getChildVocabulary,
  getVocabulary,
  createVocabulary,
  updateVocabulary,
  deleteVocabulary,
  assignToChild,
  unassignFromChild,
};


const prisma = require('../config/db');
const { AppError } = require('../middlewares/error.middleware');
const { hashPassword } = require('../utils/password');

/* ----------------------------- Platform stats ----------------------------- */

const getPlatformStats = async () => {
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalChildren,
    totalVocabulary,
    totalOrders,
    totalPayments,
    activeUsers,
    pendingTickets,
    publishedPosts,
    revenueAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.child.count(),
    prisma.vocabulary.count(),
    prisma.order.count(),
    prisma.payment.count({ where: { status: 'COMPLETED' } }),
    prisma.user.count({ where: { createdAt: { gte: since30 } } }),
    prisma.supportTicket.count({ where: { status: 'PENDING' } }),
    prisma.blogPost.count({ where: { status: 'PUBLISHED' } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'COMPLETED' },
    }),
  ]);

  return {
    totalUsers,
    totalChildren,
    totalVocabulary,
    totalOrders,
    totalPayments,
    activeUsers,
    pendingTickets,
    publishedPosts,
    revenue: revenueAgg._sum.amount || 0,
  };
};

const getPlatformAnalytics = async () => {
  const stats = await getPlatformStats();

  const [recentUsers, recentOrders, usersByRole, ordersByStatus] = await Promise.all([
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        accountType: true,
        createdAt: true,
        _count: { select: { children: true } },
      },
    }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        plan: { select: { name: true, price: true } },
      },
    }),
    prisma.user.groupBy({
      by: ['role'],
      _count: { _all: true },
    }),
    prisma.order.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
  ]);

  // Last 6 months signup trend
  const trendStart = new Date();
  trendStart.setMonth(trendStart.getMonth() - 5);
  trendStart.setDate(1);
  trendStart.setHours(0, 0, 0, 0);

  const recentSignups = await prisma.user.findMany({
    where: { createdAt: { gte: trendStart } },
    select: { createdAt: true },
  });

  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const label = d.toLocaleString('en', { month: 'short' });
    const count = recentSignups.filter((u) => {
      const cu = new Date(u.createdAt);
      return cu.getMonth() === d.getMonth() && cu.getFullYear() === d.getFullYear();
    }).length;
    monthlyTrend.push({ month: label, value: count });
  }

  return {
    ...stats,
    recentUsers,
    recentOrders,
    usersByRole: usersByRole.map((r) => ({ role: r.role, count: r._count._all })),
    ordersByStatus: ordersByStatus.map((o) => ({ status: o.status, count: o._count._all })),
    monthlyTrend,
  };
};

/* ----------------------------- Children (admin) --------------------------- */

const listAllChildren = async ({ search, page = 1, limit = 50 } = {}) => {
  const where = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { username: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.child.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        username: true,
        age: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.child.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const adminUpdateChild = async (id, data) => {
  const existing = await prisma.child.findUnique({ where: { id } });
  if (!existing) throw new AppError('Child not found', 404);

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.username !== undefined) updateData.username = data.username || null;
  if (data.age !== undefined) updateData.age = data.age !== '' ? Number(data.age) : null;
  if (data.pin !== undefined && data.pin !== '') {
    const { hashPassword } = require('../utils/password');
    updateData.pin = await hashPassword(data.pin);
  }

  return prisma.child.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      username: true,
      age: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });
};

/* ------------------------------- Users CRUD ------------------------------- */

const listUsers = async ({ search, role, page = 1, limit = 20 } = {}) => {
  const where = {};
  if (role && role !== 'all') where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        accountType: true,
        emailVerified: true,
        blocked: true,
        restrictions: true,
        createdAt: true,
        _count: { select: { children: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

const updateUser = async (id, data) => {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new AppError('User not found', 404);

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.accountType !== undefined) updateData.accountType = data.accountType;
  if (data.emailVerified !== undefined) updateData.emailVerified = !!data.emailVerified;
  if (data.password) updateData.password = await hashPassword(data.password);

  return prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      accountType: true,
      emailVerified: true,
      createdAt: true,
    },
  });
};

const deleteUser = async (id, currentUserId) => {
  if (id === currentUserId) {
    throw new AppError('You cannot delete your own admin account', 400);
  }
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new AppError('User not found', 404);

  await prisma.user.delete({ where: { id } });
  return { success: true };
};

const createUser = async (data) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError('Email already in use', 400);

  const hashed = await hashPassword(data.password || 'TempPass123!');
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
      role: data.role || 'USER',
      accountType: data.accountType || 'parent',
      emailVerified: data.emailVerified ?? false,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      accountType: true,
      emailVerified: true,
      createdAt: true,
    },
  });
};

/* ----------------------------- Payment plans ----------------------------- */

const getAllPaymentPlans = async () =>
  prisma.paymentPlan.findMany({ orderBy: { createdAt: 'desc' } });

const createPaymentPlan = async (data) =>
  prisma.paymentPlan.create({
    data: {
      name: data.name,
      nameAr: data.nameAr || null,
      price: parseFloat(data.price),
      period: data.period,
      description: data.description,
      descriptionAr: data.descriptionAr || null,
      features: data.features || [],
      popular: !!data.popular,
      enabled: data.enabled !== undefined ? !!data.enabled : true,
    },
  });

const updatePaymentPlan = async (id, data) => {
  const existing = await prisma.paymentPlan.findUnique({ where: { id } });
  if (!existing) throw new AppError('Payment plan not found', 404);

  return prisma.paymentPlan.update({
    where: { id },
    data: {
      name: data.name,
      nameAr: data.nameAr !== undefined ? data.nameAr : existing.nameAr,
      price: data.price !== undefined ? parseFloat(data.price) : undefined,
      period: data.period,
      description: data.description,
      descriptionAr: data.descriptionAr !== undefined ? data.descriptionAr : existing.descriptionAr,
      features: data.features,
      popular: data.popular,
      enabled: data.enabled,
    },
  });
};

const deletePaymentPlan = async (id) => {
  const existing = await prisma.paymentPlan.findUnique({ where: { id } });
  if (!existing) throw new AppError('Payment plan not found', 404);
  await prisma.paymentPlan.delete({ where: { id } });
  return { success: true };
};

/* ------------------------------- Discounts ------------------------------- */

const getAllDiscounts = async () =>
  prisma.discount.findMany({ orderBy: { createdAt: 'desc' } });

const createDiscount = async (data) =>
  prisma.discount.create({
    data: {
      code: data.code.toUpperCase(),
      type: data.type,
      value: parseFloat(data.value),
      description: data.description,
      validFrom: new Date(data.validFrom),
      validTo: new Date(data.validTo),
      maxUses: data.maxUses ? parseInt(data.maxUses, 10) : null,
      currentUses: 0,
      enabled: data.enabled !== undefined ? !!data.enabled : true,
    },
  });

const updateDiscount = async (id, data) => {
  const existing = await prisma.discount.findUnique({ where: { id } });
  if (!existing) throw new AppError('Discount not found', 404);

  return prisma.discount.update({
    where: { id },
    data: {
      code: data.code ? data.code.toUpperCase() : undefined,
      type: data.type,
      value: data.value !== undefined ? parseFloat(data.value) : undefined,
      description: data.description,
      validFrom: data.validFrom ? new Date(data.validFrom) : undefined,
      validTo: data.validTo ? new Date(data.validTo) : undefined,
      maxUses: data.maxUses,
      enabled: data.enabled,
    },
  });
};

const deleteDiscount = async (id) => {
  const existing = await prisma.discount.findUnique({ where: { id } });
  if (!existing) throw new AppError('Discount not found', 404);
  await prisma.discount.delete({ where: { id } });
  return { success: true };
};

/* --------------------------------- Blog ---------------------------------- */

const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80) || `post-${Date.now()}`;

const listBlogPosts = async ({ search, status, page = 1, limit = 50 } = {}) => {
  const where = {};
  if (status && status !== 'all') where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.blogPost.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const createBlogPost = async (data) => {
  let slug = data.slug ? slugify(data.slug) : slugify(data.title);
  let suffix = 1;
  while (await prisma.blogPost.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${slugify(data.title)}-${suffix}`;
  }

  return prisma.blogPost.create({
    data: {
      slug,
      title: data.title,
      titleAr: data.titleAr || null,
      excerpt: data.excerpt,
      excerptAr: data.excerptAr || null,
      content: data.content,
      contentAr: data.contentAr || null,
      category: data.category || 'Guide',
      status: data.status || 'DRAFT',
      featured: !!data.featured,
      showOnHomepage: !!data.showOnHomepage,
      emoji: data.emoji || '📝',
      coverImageUrl: data.coverImageUrl,
      authorName: data.authorName || 'Jisr Team',
      publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
    },
  });
};

const updateBlogPost = async (id, data) => {
  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) throw new AppError('Post not found', 404);

  const update = {
    title: data.title,
    titleAr: data.titleAr !== undefined ? data.titleAr : existing.titleAr,
    excerpt: data.excerpt,
    excerptAr: data.excerptAr !== undefined ? data.excerptAr : existing.excerptAr,
    content: data.content,
    contentAr: data.contentAr !== undefined ? data.contentAr : existing.contentAr,
    category: data.category,
    status: data.status,
    featured: data.featured,
    showOnHomepage: data.showOnHomepage,
    emoji: data.emoji,
    coverImageUrl: data.coverImageUrl,
    authorName: data.authorName,
  };

  if (data.status === 'PUBLISHED' && !existing.publishedAt) {
    update.publishedAt = new Date();
  }

  return prisma.blogPost.update({ where: { id }, data: update });
};

const deleteBlogPost = async (id) => {
  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) throw new AppError('Post not found', 404);
  await prisma.blogPost.delete({ where: { id } });
  return { success: true };
};

/* ---------------------------- Site Settings ----------------------------- */

const SETTINGS_DEFAULTS = {
  branding: {
    siteName: 'Jisr',
    tagline: 'AAC for kids — built with love',
    logoUrl: '',
    primaryColor: '#0d9488',
    accentColor: '#fb7185',
  },
  hero: {
    eyebrow: 'AAC made joyful',
    title: 'Help every child find their voice',
    subtitle:
      'Jisr is a calm, accessible AAC platform that helps kids build language confidence at their own pace.',
    primaryCtaLabel: 'Start free',
    primaryCtaHref: '/signup',
    secondaryCtaLabel: 'Watch demo',
    secondaryCtaHref: '/blog',
    backgroundImageUrl: '',
  },
  features: [
    {
      icon: '🎯',
      title: 'Personalized boards',
      description:
        'Custom vocabulary, categories, voice, and pacing — tuned to each child.',
    },
    {
      icon: '🗣️',
      title: 'Natural speech',
      description: 'High-quality bilingual TTS in English and Arabic.',
    },
    {
      icon: '📈',
      title: 'Progress tracking',
      description:
        'Caregivers see growth in vocabulary, sentence length, and consistency.',
    },
  ],
  contact: {
    email: 'hello@jisr.app',
    phone: '+968 0000 0000',
    address: 'Muscat, Oman',
    twitter: '',
    instagram: '',
    facebook: '',
    linkedin: '',
  },
  seo: {
    metaTitle: 'Jisr — AAC platform for kids',
    metaDescription:
      'Helping every child find their voice with a calm, accessible AAC experience.',
    ogImageUrl: '',
  },
  flags: {
    maintenanceMode: false,
    showPricing: true,
    showBlog: true,
    enableSignups: true,
  },
};

const getAllSettings = async () => {
  const rows = await prisma.siteSetting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  // Merge with defaults so the UI always has a complete shape.
  return {
    branding: { ...SETTINGS_DEFAULTS.branding, ...(map.branding || {}) },
    hero: { ...SETTINGS_DEFAULTS.hero, ...(map.hero || {}) },
    features: Array.isArray(map.features) ? map.features : SETTINGS_DEFAULTS.features,
    contact: { ...SETTINGS_DEFAULTS.contact, ...(map.contact || {}) },
    seo: { ...SETTINGS_DEFAULTS.seo, ...(map.seo || {}) },
    flags: { ...SETTINGS_DEFAULTS.flags, ...(map.flags || {}) },
  };
};

const updateSettings = async (incoming) => {
  if (!incoming || typeof incoming !== 'object') {
    throw new AppError('Invalid settings payload', 400);
  }

  const allowedKeys = ['branding', 'hero', 'features', 'contact', 'seo', 'flags'];
  const ops = [];
  for (const key of allowedKeys) {
    if (incoming[key] !== undefined) {
      ops.push(
        prisma.siteSetting.upsert({
          where: { key },
          update: { value: incoming[key] },
          create: { key, value: incoming[key] },
        })
      );
    }
  }
  await Promise.all(ops);
  return getAllSettings();
};

/* ------------------------- Admin support tickets ------------------------ */

const listAllTickets = async ({ search, status, priority, page = 1, limit = 50 } = {}) => {
  const where = {};
  if (status && status !== 'all') where.status = status;
  if (priority && priority !== 'all') where.priority = priority;
  if (search) {
    where.OR = [
      { subject: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { messages: true } },
      },
    }),
    prisma.supportTicket.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const getTicketDetail = async (id) => {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });
  if (!ticket) throw new AppError('Ticket not found', 404);
  return ticket;
};

const updateTicket = async (id, data) => {
  const existing = await prisma.supportTicket.findUnique({ where: { id } });
  if (!existing) throw new AppError('Ticket not found', 404);

  return prisma.supportTicket.update({
    where: { id },
    data: {
      status: data.status,
      priority: data.priority,
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
};

const replyToTicket = async (id, message) => {
  const existing = await prisma.supportTicket.findUnique({ where: { id } });
  if (!existing) throw new AppError('Ticket not found', 404);

  await prisma.supportMessage.create({
    data: {
      ticketId: id,
      message,
      isFromUser: false,
    },
  });

  // If admin responds while resolved/closed, reopen as in-progress
  if (existing.status === 'PENDING' || existing.status === 'RESOLVED') {
    await prisma.supportTicket.update({
      where: { id },
      data: { status: 'IN_PROGRESS' },
    });
  }

  return getTicketDetail(id);
};

/* ─────────────────────── User block / restrictions ──────────────────────── */

const blockUser = async (id, currentUserId) => {
  if (id === currentUserId) throw new AppError('You cannot block your own account', 400);
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError('User not found', 404);
  if (user.role === 'ADMIN') throw new AppError('Cannot block another admin', 400);
  return prisma.user.update({
    where: { id },
    data: { blocked: true },
    select: { id: true, name: true, email: true, blocked: true, restrictions: true },
  });
};

const unblockUser = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError('User not found', 404);
  return prisma.user.update({
    where: { id },
    data: { blocked: false },
    select: { id: true, name: true, email: true, blocked: true, restrictions: true },
  });
};

const setUserRestrictions = async (id, restrictions) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError('User not found', 404);
  if (!Array.isArray(restrictions)) throw new AppError('restrictions must be an array', 400);
  return prisma.user.update({
    where: { id },
    data: { restrictions },
    select: { id: true, name: true, email: true, blocked: true, restrictions: true },
  });
};

/* ─────────────────────────── Media assets ────────────────────────────────── */

const path = require('path');
const fs = require('fs');

const config = require('../config/env');

const MEDIA_BASE_URL = (req) =>
  req
    ? `${req.protocol}://${req.get('host')}/uploads/media`
    : `${config.publicBaseUrl.replace(/\/$/, '')}/uploads/media`;

const listMediaAssets = async ({ search, category, active } = {}) => {
  const where = {};
  if (active !== undefined) where.active = active === 'true' || active === true;
  if (category && category !== 'all') where.category = category;
  if (search) {
    where.OR = [
      { originalName: { contains: search, mode: 'insensitive' } },
      { tags: { has: search } },
    ];
  }
  return prisma.mediaAsset.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
};

const createMediaAsset = async (data) => {
  return prisma.mediaAsset.create({ data });
};

const updateMediaAsset = async (id, data) => {
  const existing = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!existing) throw new AppError('Media asset not found', 404);
  return prisma.mediaAsset.update({
    where: { id },
    data: {
      category: data.category ?? existing.category,
      tags: data.tags ?? existing.tags,
      active: data.active !== undefined ? !!data.active : existing.active,
      originalName: data.originalName ?? existing.originalName,
    },
  });
};

const deleteMediaAsset = async (id) => {
  const existing = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!existing) throw new AppError('Media asset not found', 404);
  // Remove physical file
  const filePath = path.join(config.uploadDir, 'media', existing.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  await prisma.mediaAsset.delete({ where: { id } });
  return { success: true };
};

/* ----------------------------- Reviews ------------------------------------ */

const listReviews = async () => {
  return prisma.review.findMany({ orderBy: { order: 'asc' } });
};

const createReview = async (data) => {
  return prisma.review.create({
    data: {
      name: data.name,
      nameAr: data.nameAr || null,
      role: data.role,
      roleAr: data.roleAr || null,
      quote: data.quote,
      quoteAr: data.quoteAr || null,
      active: data.active !== false,
      order: typeof data.order === 'number' ? data.order : 0,
    },
  });
};

const updateReview = async (id, data) => {
  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) throw new AppError('Review not found', 404);
  return prisma.review.update({
    where: { id },
    data: {
      name: data.name !== undefined ? data.name : existing.name,
      nameAr: data.nameAr !== undefined ? data.nameAr : existing.nameAr,
      role: data.role !== undefined ? data.role : existing.role,
      roleAr: data.roleAr !== undefined ? data.roleAr : existing.roleAr,
      quote: data.quote !== undefined ? data.quote : existing.quote,
      quoteAr: data.quoteAr !== undefined ? data.quoteAr : existing.quoteAr,
      active: data.active !== undefined ? !!data.active : existing.active,
      order: data.order !== undefined ? data.order : existing.order,
    },
  });
};

const deleteReview = async (id) => {
  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) throw new AppError('Review not found', 404);
  await prisma.review.delete({ where: { id } });
};

const listPublicReviews = async () => {
  return prisma.review.findMany({ where: { active: true }, orderBy: { order: 'asc' } });
};

module.exports = {
  // stats
  getPlatformStats,
  getPlatformAnalytics,
  // users
  listUsers,
  updateUser,
  deleteUser,
  createUser,
  blockUser,
  unblockUser,
  setUserRestrictions,
  // plans
  getAllPaymentPlans,
  createPaymentPlan,
  updatePaymentPlan,
  deletePaymentPlan,
  // discounts
  getAllDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  // blog
  listBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  // settings
  getAllSettings,
  updateSettings,
  // tickets
  listAllTickets,
  getTicketDetail,
  updateTicket,
  replyToTicket,
  // media
  listMediaAssets,
  createMediaAsset,
  updateMediaAsset,
  deleteMediaAsset,
  // children
  listAllChildren,
  adminUpdateChild,
  // reviews
  listReviews,
  createReview,
  updateReview,
  deleteReview,
  listPublicReviews,
};

const express = require('express');
const adminService = require('../services/admin.service');
const prisma = require('../config/db');
const { catchAsync, AppError } = require('../middlewares/error.middleware');
const { optionalAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * Public site settings (read-only).
 * Hides admin-only flags but exposes branding/hero/features/contact/seo.
 */
router.get(
  '/settings',
  catchAsync(async (_req, res) => {
    const settings = await adminService.getAllSettings();
    const { branding, hero, features, contact, seo, flags } = settings;
    res.json({
      status: 'success',
      data: {
        branding,
        hero,
        features,
        contact,
        seo,
        flags: {
          maintenanceMode: !!flags.maintenanceMode,
          showPricing: flags.showPricing !== false,
          showBlog: flags.showBlog !== false,
          enableSignups: flags.enableSignups !== false,
        },
      },
    });
  })
);

/**
 * Public blog list — only published posts.
 */
router.get(
  '/blog',
  catchAsync(async (req, res) => {
    const { category, featured, limit = 50 } = req.query;
    const where = { status: 'PUBLISHED' };
    if (category && category !== 'all') where.category = category;
    if (featured === 'true') where.featured = true;

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: parseInt(limit, 10) || 50,
    });

    res.json({ status: 'success', data: posts });
  })
);

router.get(
  '/blog/:slug',
  catchAsync(async (req, res) => {
    const post = await prisma.blogPost.findUnique({
      where: { slug: req.params.slug },
    });
    if (!post || post.status !== 'PUBLISHED') {
      throw new AppError('Post not found', 404);
    }
    // Increment view count, but don't await for the response
    prisma.blogPost
      .update({ where: { id: post.id }, data: { views: { increment: 1 } } })
      .catch(() => {});
    res.json({ status: 'success', data: post });
  })
);

/**
 * Public payment plans — only enabled.
 */
router.get(
  '/plans',
  catchAsync(async (_req, res) => {
    const plans = await prisma.paymentPlan.findMany({
      where: { enabled: true },
      orderBy: { price: 'asc' },
    });
    res.json({ status: 'success', data: plans });
  })
);

/**
 * Public media library — only active assets.
 * Authenticated users see all active; unauthenticated see only active.
 */
router.get(
  '/media',
  optionalAuth,
  catchAsync(async (req, res) => {
    const { category, search } = req.query;
    const where = { active: true };
    if (category && category !== 'all') where.category = category;
    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }
    const assets = await prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ status: 'success', data: assets });
  })
);

/**
 * Public reviews — only active.
 */
router.get(
  '/reviews',
  catchAsync(async (_req, res) => {
    const reviews = await adminService.listPublicReviews();
    res.json({ status: 'success', data: reviews });
  })
);

module.exports = router;

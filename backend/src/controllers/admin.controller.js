const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const adminService = require('../services/admin.service');
const { catchAsync, AppError } = require('../middlewares/error.middleware');
const { UPLOAD_DIR } = require('../middlewares/upload.middleware');

/* Stats */
const getPlatformStats = catchAsync(async (_req, res) => {
  const stats = await adminService.getPlatformStats();
  res.json({ status: 'success', data: stats });
});

const getPlatformAnalytics = catchAsync(async (_req, res) => {
  const analytics = await adminService.getPlatformAnalytics();
  res.json({ status: 'success', data: analytics });
});

/* Users */
const listUsers = catchAsync(async (req, res) => {
  const data = await adminService.listUsers({
    search: req.query.search,
    role: req.query.role,
    page: parseInt(req.query.page, 10) || 1,
    limit: parseInt(req.query.limit, 10) || 20,
  });
  res.json({ status: 'success', data });
});

const createUser = catchAsync(async (req, res) => {
  const user = await adminService.createUser(req.body);
  res.status(201).json({ status: 'success', message: 'User created', data: user });
});

const updateUser = catchAsync(async (req, res) => {
  const user = await adminService.updateUser(req.params.id, req.body);
  res.json({ status: 'success', message: 'User updated', data: user });
});

const deleteUser = catchAsync(async (req, res) => {
  await adminService.deleteUser(req.params.id, req.user.id);
  res.json({ status: 'success', message: 'User deleted' });
});

/* Plans */
const getAllPaymentPlans = catchAsync(async (_req, res) => {
  const plans = await adminService.getAllPaymentPlans();
  res.json({ status: 'success', data: plans });
});

const createPaymentPlan = catchAsync(async (req, res) => {
  const plan = await adminService.createPaymentPlan(req.body);
  res.status(201).json({ status: 'success', message: 'Plan created', data: plan });
});

const updatePaymentPlan = catchAsync(async (req, res) => {
  const plan = await adminService.updatePaymentPlan(req.params.id, req.body);
  res.json({ status: 'success', message: 'Plan updated', data: plan });
});

const deletePaymentPlan = catchAsync(async (req, res) => {
  await adminService.deletePaymentPlan(req.params.id);
  res.json({ status: 'success', message: 'Plan deleted' });
});

/* Discounts */
const getAllDiscounts = catchAsync(async (_req, res) => {
  const discounts = await adminService.getAllDiscounts();
  res.json({ status: 'success', data: discounts });
});

const createDiscount = catchAsync(async (req, res) => {
  const discount = await adminService.createDiscount(req.body);
  res.status(201).json({ status: 'success', message: 'Discount created', data: discount });
});

const updateDiscount = catchAsync(async (req, res) => {
  const discount = await adminService.updateDiscount(req.params.id, req.body);
  res.json({ status: 'success', message: 'Discount updated', data: discount });
});

const deleteDiscount = catchAsync(async (req, res) => {
  await adminService.deleteDiscount(req.params.id);
  res.json({ status: 'success', message: 'Discount deleted' });
});

/* Blog */
const listBlogPosts = catchAsync(async (req, res) => {
  const data = await adminService.listBlogPosts({
    search: req.query.search,
    status: req.query.status,
    page: parseInt(req.query.page, 10) || 1,
    limit: parseInt(req.query.limit, 10) || 50,
  });
  res.json({ status: 'success', data });
});

const createBlogPost = catchAsync(async (req, res) => {
  if (!req.body.title || !req.body.excerpt || !req.body.content) {
    throw new AppError('Title, excerpt, and content are required', 400);
  }
  const post = await adminService.createBlogPost(req.body);
  res.status(201).json({ status: 'success', message: 'Post created', data: post });
});

const updateBlogPost = catchAsync(async (req, res) => {
  const post = await adminService.updateBlogPost(req.params.id, req.body);
  res.json({ status: 'success', message: 'Post updated', data: post });
});

const deleteBlogPost = catchAsync(async (req, res) => {
  await adminService.deleteBlogPost(req.params.id);
  res.json({ status: 'success', message: 'Post deleted' });
});

/* Site Settings */
const getSettings = catchAsync(async (_req, res) => {
  const data = await adminService.getAllSettings();
  res.json({ status: 'success', data });
});

const updateSettings = catchAsync(async (req, res) => {
  const data = await adminService.updateSettings(req.body);
  res.json({ status: 'success', message: 'Settings updated', data });
});

/* Tickets */
const listAllTickets = catchAsync(async (req, res) => {
  const data = await adminService.listAllTickets({
    search: req.query.search,
    status: req.query.status,
    priority: req.query.priority,
    page: parseInt(req.query.page, 10) || 1,
    limit: parseInt(req.query.limit, 10) || 50,
  });
  res.json({ status: 'success', data });
});

const getTicketDetail = catchAsync(async (req, res) => {
  const ticket = await adminService.getTicketDetail(req.params.id);
  res.json({ status: 'success', data: ticket });
});

const updateTicket = catchAsync(async (req, res) => {
  const ticket = await adminService.updateTicket(req.params.id, req.body);
  res.json({ status: 'success', message: 'Ticket updated', data: ticket });
});

const replyToTicket = catchAsync(async (req, res) => {
  if (!req.body.message) throw new AppError('Message is required', 400);
  const ticket = await adminService.replyToTicket(req.params.id, req.body.message);
  res.json({ status: 'success', message: 'Reply sent', data: ticket });
});

/* Block / restrictions */
const blockUser = catchAsync(async (req, res) => {
  const user = await adminService.blockUser(req.params.id, req.user.id);
  res.json({ status: 'success', message: 'User blocked', data: user });
});

const unblockUser = catchAsync(async (req, res) => {
  const user = await adminService.unblockUser(req.params.id);
  res.json({ status: 'success', message: 'User unblocked', data: user });
});

const setUserRestrictions = catchAsync(async (req, res) => {
  const { restrictions } = req.body;
  const user = await adminService.setUserRestrictions(req.params.id, restrictions);
  res.json({ status: 'success', message: 'Restrictions updated', data: user });
});

/* Children (admin) */
const listAllChildren = catchAsync(async (req, res) => {
  const data = await adminService.listAllChildren({
    search: req.query.search,
    page: parseInt(req.query.page, 10) || 1,
    limit: parseInt(req.query.limit, 10) || 50,
  });
  res.json({ status: 'success', data });
});

const adminUpdateChild = catchAsync(async (req, res) => {
  const child = await adminService.adminUpdateChild(req.params.id, req.body);
  res.json({ status: 'success', message: 'Child updated', data: child });
});

/* Media */
const listMediaAssets = catchAsync(async (req, res) => {
  const data = await adminService.listMediaAssets({
    search: req.query.search,
    category: req.query.category,
    active: req.query.active,
  });
  res.json({ status: 'success', data });
});

const createMediaAsset = catchAsync(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);
  const { category = 'general', tags = '' } = req.body;

  const isGif = req.file.mimetype === 'image/gif';
  const ext = isGif ? '.gif' : '.webp';
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const filename = `${unique}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  let finalBuffer;
  let finalMimeType;

  if (isGif) {
    // Preserve GIF animation — save as-is
    finalBuffer = req.file.buffer;
    finalMimeType = 'image/gif';
  } else {
    // Compress to WebP (quality 80, max 1200px wide)
    finalBuffer = await sharp(req.file.buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    finalMimeType = 'image/webp';
  }

  fs.writeFileSync(filepath, finalBuffer);

  const baseUrl = `${req.protocol}://${req.get('host')}/uploads/media`;
  const asset = await adminService.createMediaAsset({
    filename,
    originalName: req.file.originalname,
    url: `${baseUrl}/${filename}`,
    mimeType: finalMimeType,
    size: finalBuffer.length,
    category,
    tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    active: true,
  });

  res.status(201).json({ status: 'success', message: 'Asset uploaded', data: asset });
});

const updateMediaAsset = catchAsync(async (req, res) => {
  const asset = await adminService.updateMediaAsset(req.params.id, {
    category: req.body.category,
    tags: req.body.tags,
    active: req.body.active,
    originalName: req.body.originalName,
  });
  res.json({ status: 'success', message: 'Asset updated', data: asset });
});

const deleteMediaAsset = catchAsync(async (req, res) => {
  await adminService.deleteMediaAsset(req.params.id);
  res.json({ status: 'success', message: 'Asset deleted' });
});

/* Reviews */
const listReviews = catchAsync(async (_req, res) => {
  const data = await adminService.listReviews();
  res.json({ status: 'success', data });
});
const createReview = catchAsync(async (req, res) => {
  const review = await adminService.createReview(req.body);
  res.status(201).json({ status: 'success', data: review });
});
const updateReview = catchAsync(async (req, res) => {
  const review = await adminService.updateReview(req.params.id, req.body);
  res.json({ status: 'success', data: review });
});
const deleteReview = catchAsync(async (req, res) => {
  await adminService.deleteReview(req.params.id);
  res.json({ status: 'success', message: 'Review deleted' });
});

module.exports = {
  // stats
  getPlatformStats,
  getPlatformAnalytics,
  // users
  listUsers,
  createUser,
  updateUser,
  deleteUser,
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
  getSettings,
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
};

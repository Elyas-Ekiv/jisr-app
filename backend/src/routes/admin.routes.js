const express = require('express');
const controller = require('../controllers/admin.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/upload.middleware');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

/* Stats / analytics */
router.get('/stats', controller.getPlatformStats);
router.get('/analytics', controller.getPlatformAnalytics);

/* Users */
router.get('/users', controller.listUsers);
router.post('/users', controller.createUser);
router.put('/users/:id', controller.updateUser);
router.delete('/users/:id', controller.deleteUser);
router.put('/users/:id/block', controller.blockUser);
router.put('/users/:id/unblock', controller.unblockUser);
router.put('/users/:id/restrictions', controller.setUserRestrictions);

/* Payment plans */
router.get('/payment-plans', controller.getAllPaymentPlans);
router.post('/payment-plans', controller.createPaymentPlan);
router.put('/payment-plans/:id', controller.updatePaymentPlan);
router.delete('/payment-plans/:id', controller.deletePaymentPlan);

/* Discounts */
router.get('/discounts', controller.getAllDiscounts);
router.post('/discounts', controller.createDiscount);
router.put('/discounts/:id', controller.updateDiscount);
router.delete('/discounts/:id', controller.deleteDiscount);

/* Blog */
router.get('/blog', controller.listBlogPosts);
router.post('/blog', controller.createBlogPost);
router.put('/blog/:id', controller.updateBlogPost);
router.delete('/blog/:id', controller.deleteBlogPost);

/* Site settings (admin) */
router.get('/settings', controller.getSettings);
router.put('/settings', controller.updateSettings);

/* Support tickets (admin) */
router.get('/tickets', controller.listAllTickets);
router.get('/tickets/:id', controller.getTicketDetail);
router.put('/tickets/:id', controller.updateTicket);
router.post('/tickets/:id/reply', controller.replyToTicket);

/* Media library */
router.get('/media', controller.listMediaAssets);
router.post('/media', upload.single('file'), controller.createMediaAsset);
router.put('/media/:id', controller.updateMediaAsset);
router.delete('/media/:id', controller.deleteMediaAsset);

/* Children (admin) */
router.get('/children', controller.listAllChildren);
router.put('/children/:id', controller.adminUpdateChild);

/* Reviews */
router.get('/reviews', controller.listReviews);
router.post('/reviews', controller.createReview);
router.put('/reviews/:id', controller.updateReview);
router.delete('/reviews/:id', controller.deleteReview);

module.exports = router;

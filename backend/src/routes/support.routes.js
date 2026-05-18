const express = require('express');
const controller = require('../controllers/support.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireFeature } = require('../middlewares/restriction.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/support/tickets
 * @desc    Get user's support tickets
 * @access  Private
 */
router.get('/tickets', controller.getTickets);

/**
 * @route   GET /api/support/tickets/:id
 * @desc    Get a single ticket
 * @access  Private
 */
router.get('/tickets/:id', controller.getTicket);

/**
 * @route   POST /api/support/tickets
 * @desc    Create a new ticket
 * @access  Private
 */
router.post('/tickets', requireFeature('support'), controller.createTicket);

/**
 * @route   POST /api/support/tickets/:id/messages
 * @desc    Add message to ticket
 * @access  Private
 */
router.post('/tickets/:id/messages', controller.addMessage);

/**
 * @route   PUT /api/support/tickets/:id/status
 * @desc    Update ticket status
 * @access  Private
 */
router.put('/tickets/:id/status', controller.updateTicketStatus);

module.exports = router;

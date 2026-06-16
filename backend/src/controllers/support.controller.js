const supportService = require('../services/support.service');
const { catchAsync } = require('../middlewares/error.middleware');

/**
 * Get user's support tickets
 */
const getTickets = catchAsync(async (req, res) => {
  const { status, category, limit } = req.query;
  const tickets = await supportService.getTickets(req.user.id, {
    status: status || null,
    category: category || null,
    limit: parseInt(limit) || 50,
  });
  res.status(200).json({
    status: 'success',
    data: tickets,
  });
});

/**
 * Get a single ticket
 */
const getTicket = catchAsync(async (req, res) => {
  const { id } = req.params;
  const ticket = await supportService.getTicket(id, req.user.id);
  res.status(200).json({
    status: 'success',
    data: ticket,
  });
});

/**
 * Create a new ticket
 */
const createTicket = catchAsync(async (req, res) => {
  const ticket = await supportService.createTicket(req.user.id, req.body);
  res.status(201).json({
    status: 'success',
    message: 'Ticket created successfully',
    data: ticket,
  });
});

/**
 * Add message to ticket
 */
const addMessage = catchAsync(async (req, res) => {
  const { id } = req.params;
  const message = await supportService.addMessage(id, req.user.id, req.body.message);
  res.status(201).json({
    status: 'success',
    message: 'Message added successfully',
    data: message,
  });
});

/**
 * Update ticket status
 */
const updateTicketStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const ticket = await supportService.updateTicketStatus(id, req.user.id, status);
  res.status(200).json({
    status: 'success',
    message: 'Ticket status updated',
    data: ticket,
  });
});

module.exports = {
  getTickets,
  getTicket,
  createTicket,
  addMessage,
  updateTicketStatus,
};

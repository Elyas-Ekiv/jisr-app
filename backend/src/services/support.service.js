const prisma = require('../config/db');
const { AppError } = require('../middlewares/error.middleware');

/**
 * Get support tickets for a user
 */
const getTickets = async (userId, options = {}) => {
  const { status = null, category = null, limit = 50 } = options;

  const where = { userId };
  if (status) {
    where.status = status;
  }
  if (category) {
    where.category = category;
  }

  const tickets = await prisma.supportTicket.findMany({
    where,
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1, // Get latest message
      },
      _count: {
        select: { messages: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return tickets.map((ticket) => ({
    id: ticket.id,
    subject: ticket.subject,
    category: ticket.category,
    priority: ticket.priority,
    status: ticket.status,
    description: ticket.description,
    messages: ticket._count.messages,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    lastMessage: ticket.messages[0]?.createdAt || ticket.updatedAt,
  }));
};

/**
 * Get a single ticket
 */
const getTicket = async (ticketId, userId) => {
  const ticket = await prisma.supportTicket.findFirst({
    where: {
      id: ticketId,
      userId,
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          // Include user info if needed
        },
      },
    },
  });

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  return ticket;
};

/**
 * Create a new support ticket
 */
const createTicket = async (userId, data) => {
  const ticket = await prisma.supportTicket.create({
    data: {
      userId,
      subject: data.subject,
      category: data.category || 'OTHER',
      priority: data.priority || 'MEDIUM',
      description: data.message || data.description,
      status: 'PENDING',
    },
  });

  // Create initial message
  if (data.message) {
    await prisma.supportMessage.create({
      data: {
        ticketId: ticket.id,
        message: data.message,
        isFromUser: true,
      },
    });
  }

  return ticket;
};

/**
 * Add message to ticket
 */
const addMessage = async (ticketId, userId, message, isFromUser = true) => {
  // Verify ticket belongs to user
  const ticket = await prisma.supportTicket.findFirst({
    where: {
      id: ticketId,
      userId,
    },
  });

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  // Update ticket status if it was resolved/closed
  if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: 'PENDING' },
    });
  }

  return await prisma.supportMessage.create({
    data: {
      ticketId,
      message,
      isFromUser,
    },
  });
};

/**
 * Update ticket status
 */
const updateTicketStatus = async (ticketId, userId, status) => {
  const ticket = await prisma.supportTicket.findFirst({
    where: {
      id: ticketId,
      userId,
    },
  });

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  return await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status },
  });
};

module.exports = {
  getTickets,
  getTicket,
  createTicket,
  addMessage,
  updateTicketStatus,
};

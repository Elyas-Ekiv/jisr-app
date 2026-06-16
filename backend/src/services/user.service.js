const prisma = require('../config/db');
const { AppError } = require('../middlewares/error.middleware');
const { hashPassword, comparePassword } = require('../utils/password');

/**
 * Check if email is already registered
 */
const checkEmailExists = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, accountType: true },
  });
  return user;
};

const getAllUsers = async (isAdmin = false) => {
  if (!isAdmin) {
    throw new AppError('Admin access required', 403);
  }

  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      accountType: true,
      emailVerified: true,
      createdAt: true,
      _count: {
        select: {
          children: true,
          orders: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getUser = async (id, currentUserId, isAdmin = false) => {
  // Users can only see their own profile unless admin
  if (id !== currentUserId && !isAdmin) {
    throw new AppError('Access denied', 403);
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      accountType: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

const updateUser = async (id, data, currentUserId, isAdmin = false) => {
  // Users can only update their own profile unless admin
  if (id !== currentUserId && !isAdmin) {
    throw new AppError('Access denied', 403);
  }

  const existing = await prisma.user.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError('User not found', 404);
  }

  // If email is being changed, check if it's already taken
  if (data.email && data.email !== existing.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (emailExists) {
      throw new AppError('Email already in use', 400);
    }
  }

  const updateData = { ...data };
  delete updateData.currentPassword;

  if (data.password) {
    const isOwnProfile = id === currentUserId;
    if (isOwnProfile && !isAdmin) {
      if (!data.currentPassword) {
        throw new AppError('Current password is required', 400);
      }
      const match = await comparePassword(data.currentPassword, existing.password);
      if (!match) {
        throw new AppError('Current password is incorrect', 401);
      }
    }
    updateData.password = await hashPassword(data.password);
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      accountType: true,
      emailVerified: true,
    },
  });

  return user;
};

const deleteUser = async (id, currentUserId, isAdmin = false) => {
  if (!isAdmin) {
    throw new AppError('Admin access required', 403);
  }

  const existing = await prisma.user.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError('User not found', 404);
  }

  // Prevent deleting yourself
  if (id === currentUserId) {
    throw new AppError('Cannot delete your own account', 400);
  }

  await prisma.user.delete({
    where: { id },
  });
};

module.exports = {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  checkEmailExists,
};

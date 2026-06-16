const userService = require('../services/user.service');
const { catchAsync } = require('../middlewares/error.middleware');

const getAllUsers = catchAsync(async (req, res) => {
  const users = await userService.getAllUsers(req.user.role === 'ADMIN');
  res.status(200).json({
    status: 'success',
    data: users,
  });
});

const getUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = await userService.getUser(id, req.user.id, req.user.role === 'ADMIN');
  res.status(200).json({
    status: 'success',
    data: user,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = await userService.updateUser(id, req.body, req.user.id, req.user.role === 'ADMIN');
  res.status(200).json({
    status: 'success',
    message: 'User updated successfully',
    data: user,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  await userService.deleteUser(id, req.user.id, req.user.role === 'ADMIN');
  res.status(200).json({
    status: 'success',
    message: 'User deleted successfully',
  });
});

/**
 * Check if email exists
 */
const checkEmail = catchAsync(async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({
      status: 'fail',
      message: 'Email is required',
    });
  }

  const user = await userService.checkEmailExists(email);
  res.status(200).json({
    status: 'success',
    data: {
      exists: !!user,
      accountType: user?.accountType || null,
    },
  });
});

module.exports = {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  checkEmail,
};

const authService = require('../services/auth.service');
const { catchAsync } = require('../middlewares/error.middleware');

/**
 * Register new user
 */
const register = catchAsync(async (req, res) => {
  const { name, email, password, accountType, recoveryQuestion, recoveryAnswer } = req.body;

  const result = await authService.register({
    name,
    email,
    password,
    accountType,
    recoveryQuestion,
    recoveryAnswer,
  });

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: result,
  });
});

/**
 * Login user
 */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login(email, password);

  res.status(200).json({
    status: 'success',
    message: 'Login successful',
    data: result,
  });
});

/**
 * Refresh access token
 */
const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  const result = await authService.refreshToken(refreshToken);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

/**
 * Logout user
 */
const logout = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  await authService.logout(refreshToken);

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

/**
 * Get current user
 */
const getMe = catchAsync(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

/**
 * Child login via username + PIN
 */
const childLogin = catchAsync(async (req, res) => {
  const { username, pin } = req.body;

  const result = await authService.childLogin(username, pin);

  res.status(200).json({
    status: 'success',
    message: 'Child login successful',
    data: result,
  });
});

const recoveryQuestion = catchAsync(async (req, res) => {
  const { email } = req.body;
  const question = await authService.getRecoveryQuestion(email);
  res.status(200).json({
    status: 'success',
    data: { question },
  });
});

const resetPasswordRecovery = catchAsync(async (req, res) => {
  const { email, recoveryAnswer, newPassword } = req.body;
  await authService.resetPasswordWithRecovery(email, recoveryAnswer, newPassword);
  res.status(200).json({
    status: 'success',
    message: 'Password updated. Sign in with your new password.',
  });
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  childLogin,
  recoveryQuestion,
  resetPasswordRecovery,
};


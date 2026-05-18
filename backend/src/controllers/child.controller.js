const childService = require('../services/child.service');
const { catchAsync } = require('../middlewares/error.middleware');

const getChildren = catchAsync(async (req, res) => {
  const children = await childService.getChildren(req.user.id);
  res.status(200).json({
    status: 'success',
    data: children,
  });
});

const getChild = catchAsync(async (req, res) => {
  const { id } = req.params;
  const child = await childService.getChild(id, req.user.id);
  res.status(200).json({
    status: 'success',
    data: child,
  });
});

const createChild = catchAsync(async (req, res) => {
  const child = await childService.createChild(req.body, req.user.id);
  res.status(201).json({
    status: 'success',
    message: 'Child created successfully',
    data: child,
  });
});

const updateChild = catchAsync(async (req, res) => {
  const { id } = req.params;
  const child = await childService.updateChild(id, req.body, req.user.id);
  res.status(200).json({
    status: 'success',
    message: 'Child updated successfully',
    data: child,
  });
});

const deleteChild = catchAsync(async (req, res) => {
  const { id } = req.params;
  await childService.deleteChild(id, req.user.id);
  res.status(200).json({
    status: 'success',
    message: 'Child deleted successfully',
  });
});

module.exports = {
  getChildren,
  getChild,
  createChild,
  updateChild,
  deleteChild,
};


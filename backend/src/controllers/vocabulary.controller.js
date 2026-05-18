const vocabularyService = require('../services/vocabulary.service');
const { catchAsync } = require('../middlewares/error.middleware');

const getAllVocabulary = catchAsync(async (req, res) => {
  const vocabulary = await vocabularyService.getAllVocabulary(
    req.user.id,
    req.user.role === 'ADMIN'
  );
  res.status(200).json({
    status: 'success',
    data: vocabulary,
  });
});

const getChildVocabulary = catchAsync(async (req, res) => {
  const { childId } = req.query;
  if (!childId) {
    return res.status(400).json({
      status: 'fail',
      message: 'Child ID is required',
    });
  }
  const vocabulary = await vocabularyService.getChildVocabulary(childId, req.user.id);
  res.status(200).json({
    status: 'success',
    data: vocabulary,
  });
});

const getVocabulary = catchAsync(async (req, res) => {
  const { id } = req.params;
  const vocabulary = await vocabularyService.getVocabulary(id);
  res.status(200).json({
    status: 'success',
    data: vocabulary,
  });
});

const createVocabulary = catchAsync(async (req, res) => {
  const vocabulary = await vocabularyService.createVocabulary(req.body, req.user.id, req.user.role);
  res.status(201).json({
    status: 'success',
    message: 'Vocabulary created successfully',
    data: vocabulary,
  });
});

const updateVocabulary = catchAsync(async (req, res) => {
  const { id } = req.params;
  const vocabulary = await vocabularyService.updateVocabulary(id, req.body, req.user.id, req.user.role);
  res.status(200).json({
    status: 'success',
    message: 'Vocabulary updated successfully',
    data: vocabulary,
  });
});

const deleteVocabulary = catchAsync(async (req, res) => {
  const { id } = req.params;
  await vocabularyService.deleteVocabulary(id, req.user.id, req.user.role);
  res.status(200).json({
    status: 'success',
    message: 'Vocabulary deleted successfully',
  });
});

const assignToChild = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { childId } = req.body;
  const result = await vocabularyService.assignToChild(id, childId, req.user.id);
  res.status(200).json({
    status: 'success',
    message: result.message,
  });
});

const unassignFromChild = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { childId } = req.body;
  const result = await vocabularyService.unassignFromChild(id, childId, req.user.id);
  res.status(200).json({
    status: 'success',
    message: result.message,
  });
});

module.exports = {
  getAllVocabulary,
  getChildVocabulary,
  getVocabulary,
  createVocabulary,
  updateVocabulary,
  deleteVocabulary,
  assignToChild,
  unassignFromChild,
};


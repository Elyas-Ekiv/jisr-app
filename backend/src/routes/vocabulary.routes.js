const express = require('express');
const controller = require('../controllers/vocabulary.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireFeature } = require('../middlewares/restriction.middleware');
const { validate } = require('../middlewares/validation.middleware');
const validation = require('../validations/vocabulary.validation');

const router = express.Router();

// Get all vocabulary (public for authenticated users)
router.get('/', authenticate, controller.getAllVocabulary);

// Get child's vocabulary
router.get('/child', authenticate, controller.getChildVocabulary);

// Get single vocabulary item
router.get('/:id', authenticate, controller.getVocabulary);

// Create/update/delete vocabulary — all authenticated users allowed;
// service enforces ownership so non-admins can only modify their own cards.
router.post('/', authenticate, requireFeature('vocabulary'), validation.createValidation, validate, controller.createVocabulary);
router.put('/:id', authenticate, requireFeature('vocabulary'), validation.updateValidation, validate, controller.updateVocabulary);
router.delete('/:id', authenticate, requireFeature('vocabulary'), controller.deleteVocabulary);

// Assign/unassign vocabulary to child
router.post('/:id/assign', authenticate, validation.assignValidation, validate, controller.assignToChild);
router.delete('/:id/unassign', authenticate, validation.assignValidation, validate, controller.unassignFromChild);

module.exports = router;


const express = require('express');
const controller = require('../controllers/child.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireFeature } = require('../middlewares/restriction.middleware');
const { validate } = require('../middlewares/validation.middleware');
const validation = require('../validations/child.validation');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.getChildren);
router.get('/:id', controller.getChild);
router.post('/', requireFeature('children'), validation.createValidation, validate, controller.createChild);
router.put('/:id', validation.updateValidation, validate, controller.updateChild);
router.delete('/:id', controller.deleteChild);

module.exports = router;


const express = require('express');
const controller = require('../controllers/settings.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const validation = require('../validations/settings.validation');

const router = express.Router();

router.use(authenticate);

router.get('/:childId', controller.getSettings);
router.put('/:childId', validation.updateValidation, validate, controller.updateSettings);

module.exports = router;


const express = require('express');
const controller = require('../controllers/analytics.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/:childId', controller.getAnalytics);
router.post('/:childId/usage', controller.recordUsage);

module.exports = router;


const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// All location routes require authentication
router.use(authenticate);

router.get('/:childId', locationController.getLocations);
router.post('/:childId', locationController.createLocation);
router.put('/:childId/:locationId', locationController.updateLocation);
router.delete('/:childId/:locationId', locationController.deleteLocation);

module.exports = router;

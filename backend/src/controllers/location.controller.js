const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @desc    Get all locations for a child
 * @route   GET /api/locations/:childId
 * @access  Private
 */
const getLocations = async (req, res, next) => {
  try {
    const { childId } = req.params;

    // Verify child belongs to user
    const child = await prisma.child.findUnique({
      where: { id: childId },
    });

    if (!child || child.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access this childs locations',
      });
    }

    const locations = await prisma.location.findMany({
      where: { childId },
      orderBy: { order: 'asc' },
    });

    res.status(200).json({
      status: 'success',
      data: locations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new location for a child
 * @route   POST /api/locations/:childId
 * @access  Private
 */
const createLocation = async (req, res, next) => {
  try {
    const { childId } = req.params;
    const { name, type, icon, color, categories, enabled, order } = req.body;

    // Verify child belongs to user
    const child = await prisma.child.findUnique({
      where: { id: childId },
    });

    if (!child || child.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access this childs locations',
      });
    }

    // Check if name already exists
    const existing = await prisma.location.findFirst({
      where: {
        childId,
        name: { equals: name, mode: 'insensitive' },
      },
    });

    if (existing) {
      return res.status(400).json({
        status: 'error',
        message: 'A location with this name already exists',
      });
    }

    const location = await prisma.location.create({
      data: {
        childId,
        name,
        type,
        icon,
        color,
        categories,
        enabled,
        order,
      },
    });

    res.status(201).json({
      status: 'success',
      data: location,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a location
 * @route   PUT /api/locations/:childId/:locationId
 * @access  Private
 */
const updateLocation = async (req, res, next) => {
  try {
    const { childId, locationId } = req.params;
    const { name, type, icon, color, categories, enabled, order } = req.body;

    // Verify child belongs to user
    const child = await prisma.child.findUnique({
      where: { id: childId },
    });

    if (!child || child.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access this childs locations',
      });
    }

    // Check location exists and belongs to child
    const existingLocation = await prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!existingLocation || existingLocation.childId !== childId) {
      return res.status(404).json({
        status: 'error',
        message: 'Location not found',
      });
    }

    // If name changed, check uniqueness
    if (name && name.toLowerCase() !== existingLocation.name.toLowerCase()) {
      const nameTaken = await prisma.location.findFirst({
        where: {
          childId,
          name: { equals: name, mode: 'insensitive' },
        },
      });

      if (nameTaken) {
        return res.status(400).json({
          status: 'error',
          message: 'A location with this name already exists',
        });
      }
    }

    const updatedLocation = await prisma.location.update({
      where: { id: locationId },
      data: {
        name,
        type,
        icon,
        color,
        categories,
        enabled,
        order,
      },
    });

    res.status(200).json({
      status: 'success',
      data: updatedLocation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a location
 * @route   DELETE /api/locations/:childId/:locationId
 * @access  Private
 */
const deleteLocation = async (req, res, next) => {
  try {
    const { childId, locationId } = req.params;

    // Verify child belongs to user
    const child = await prisma.child.findUnique({
      where: { id: childId },
    });

    if (!child || child.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access this childs locations',
      });
    }

    // Check location exists and belongs to child
    const existingLocation = await prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!existingLocation || existingLocation.childId !== childId) {
      return res.status(404).json({
        status: 'error',
        message: 'Location not found',
      });
    }

    await prisma.location.delete({
      where: { id: locationId },
    });

    res.status(200).json({
      status: 'success',
      message: 'Location deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
};

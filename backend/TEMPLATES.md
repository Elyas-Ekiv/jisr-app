# 📋 Code Templates for Remaining Routes

Copy and paste these templates, then customize for each route.

---

## 1. Controller Template

**File:** `src/controllers/[name].controller.js`

```javascript
const service = require('../services/[name].service');
const { catchAsync } = require('../middlewares/error.middleware');

/**
 * Get all items
 */
const getItems = catchAsync(async (req, res) => {
  const items = await service.getItems(req.user.id);
  res.status(200).json({
    status: 'success',
    data: items,
  });
});

/**
 * Get item by ID
 */
const getItem = catchAsync(async (req, res) => {
  const { id } = req.params;
  const item = await service.getItem(id, req.user.id);
  res.status(200).json({
    status: 'success',
    data: item,
  });
});

/**
 * Create item
 */
const createItem = catchAsync(async (req, res) => {
  const item = await service.createItem(req.body, req.user.id);
  res.status(201).json({
    status: 'success',
    message: 'Item created successfully',
    data: item,
  });
});

/**
 * Update item
 */
const updateItem = catchAsync(async (req, res) => {
  const { id } = req.params;
  const item = await service.updateItem(id, req.body, req.user.id);
  res.status(200).json({
    status: 'success',
    message: 'Item updated successfully',
    data: item,
  });
});

/**
 * Delete item
 */
const deleteItem = catchAsync(async (req, res) => {
  const { id } = req.params;
  await service.deleteItem(id, req.user.id);
  res.status(200).json({
    status: 'success',
    message: 'Item deleted successfully',
  });
});

module.exports = {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
};
```

---

## 2. Service Template

**File:** `src/services/[name].service.js`

```javascript
const prisma = require('../config/db');
const { AppError } = require('../middlewares/error.middleware');

/**
 * Get all items for user
 */
const getItems = async (userId) => {
  const items = await prisma.[Model].findMany({
    where: {
      userId, // Adjust based on your model
    },
    // Add includes, selects, etc.
  });

  return items;
};

/**
 * Get item by ID
 */
const getItem = async (id, userId) => {
  const item = await prisma.[Model].findFirst({
    where: {
      id,
      userId, // Ensure user owns this item
    },
  });

  if (!item) {
    throw new AppError('Item not found', 404);
  }

  return item;
};

/**
 * Create item
 */
const createItem = async (data, userId) => {
  const item = await prisma.[Model].create({
    data: {
      ...data,
      userId,
    },
  });

  return item;
};

/**
 * Update item
 */
const updateItem = async (id, data, userId) => {
  // Check if item exists and belongs to user
  const existing = await prisma.[Model].findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new AppError('Item not found', 404);
  }

  const item = await prisma.[Model].update({
    where: { id },
    data,
  });

  return item;
};

/**
 * Delete item
 */
const deleteItem = async (id, userId) => {
  // Check if item exists and belongs to user
  const existing = await prisma.[Model].findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new AppError('Item not found', 404);
  }

  await prisma.[Model].delete({
    where: { id },
  });
};

module.exports = {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
};
```

---

## 3. Routes Template

**File:** `src/routes/[name].routes.js`

```javascript
const express = require('express');
const controller = require('../controllers/[name].controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const validation = require('../validations/[name].validation');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Public routes (authenticated users)
router.get('/', controller.getItems);
router.get('/:id', controller.getItem);
router.post('/', validation.createValidation, validate, controller.createItem);
router.put('/:id', validation.updateValidation, validate, controller.updateItem);
router.delete('/:id', controller.deleteItem);

// Admin-only routes (if needed)
// router.get('/admin/all', requireAdmin, controller.getAllItems);

module.exports = router;
```

---

## 4. Validation Template

**File:** `src/validations/[name].validation.js`

```javascript
const { body, param } = require('express-validator');

/**
 * Create validation rules
 */
const createValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  // Add more validation rules as needed
];

/**
 * Update validation rules
 */
const updateValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID is required'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  // Add more validation rules as needed
];

module.exports = {
  createValidation,
  updateValidation,
};
```

---

## 5. Children Routes Example (Complete)

### Controller: `src/controllers/child.controller.js`

```javascript
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
```

### Service: `src/services/child.service.js`

```javascript
const prisma = require('../config/db');
const { AppError } = require('../middlewares/error.middleware');

const getChildren = async (userId) => {
  return await prisma.child.findMany({
    where: { userId },
    include: {
      settings: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getChild = async (id, userId) => {
  const child = await prisma.child.findFirst({
    where: { id, userId },
    include: {
      settings: true,
      vocabulary: {
        include: {
          vocabulary: true,
        },
      },
    },
  });

  if (!child) {
    throw new AppError('Child not found', 404);
  }

  return child;
};

const createChild = async (data, userId) => {
  return await prisma.child.create({
    data: {
      name: data.name,
      age: data.age,
      userId,
    },
  });
};

const updateChild = async (id, data, userId) => {
  const existing = await prisma.child.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new AppError('Child not found', 404);
  }

  return await prisma.child.update({
    where: { id },
    data: {
      name: data.name,
      age: data.age,
    },
  });
};

const deleteChild = async (id, userId) => {
  const existing = await prisma.child.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new AppError('Child not found', 404);
  }

  await prisma.child.delete({
    where: { id },
  });
};

module.exports = {
  getChildren,
  getChild,
  createChild,
  updateChild,
  deleteChild,
};
```

### Routes: `src/routes/child.routes.js`

```javascript
const express = require('express');
const controller = require('../controllers/child.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const validation = require('../validations/child.validation');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.getChildren);
router.get('/:id', controller.getChild);
router.post('/', validation.createValidation, validate, controller.createChild);
router.put('/:id', validation.updateValidation, validate, controller.updateChild);
router.delete('/:id', controller.deleteChild);

module.exports = router;
```

### Validation: `src/validations/child.validation.js`

```javascript
const { body, param } = require('express-validator');

const createValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('age')
    .optional()
    .isInt({ min: 0, max: 18 })
    .withMessage('Age must be between 0 and 18'),
];

const updateValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID is required'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('age')
    .optional()
    .isInt({ min: 0, max: 18 })
    .withMessage('Age must be between 0 and 18'),
];

module.exports = {
  createValidation,
  updateValidation,
};
```

---

## Quick Reference: Prisma Model Names

- User → `prisma.user`
- Child → `prisma.child`
- Vocabulary → `prisma.vocabulary`
- AACSettings → `prisma.aACSettings`
- PaymentPlan → `prisma.paymentPlan`
- Discount → `prisma.discount`
- Order → `prisma.order`
- Payment → `prisma.payment`
- UsageAnalytics → `prisma.usageAnalytics`

---

**Tip:** Start with Children routes (Step 13) - it's the most important for your frontend!


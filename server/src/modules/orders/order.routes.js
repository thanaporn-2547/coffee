const router = require('express').Router();
const c = require('./order.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createOrderSchema, updateStatusSchema } = require('./order.schema');

router.use(authenticate);

// ✅ ต้องวาง /mine และ /my ก่อน /:id เสมอ
router.get('/mine', c.getMine);
router.post('/', validate(createOrderSchema), c.create);

// Admin only
router.get('/', authorize('admin'), c.getAll);

// /:id ต้องอยู่ล่างสุด
router.get('/:id', c.getById);
router.patch('/:id/status', authorize('admin'), validate(updateStatusSchema), c.updateStatus);

module.exports = router;
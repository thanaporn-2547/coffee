const router = require('express').Router();
const c = require('./category.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createCategorySchema, updateCategorySchema } = require('./category.schema');

router.get('/', c.getAll);
router.get('/:id', c.getById);
router.post('/', authenticate, authorize('admin'), validate(createCategorySchema), c.create);
router.put('/:id', authenticate, authorize('admin'), validate(updateCategorySchema), c.update);
router.delete('/:id', authenticate, authorize('admin'), c.remove);

module.exports = router;
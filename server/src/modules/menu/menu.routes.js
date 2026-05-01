const router = require('express').Router();
const c = require('./menu.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createMenuSchema, updateMenuSchema } = require('./menu.schema');

router.get('/', c.getAll);
router.get('/:id', c.getById);
router.post('/', authenticate, authorize('admin'), validate(createMenuSchema), c.create);
router.put('/:id', authenticate, authorize('admin'), validate(updateMenuSchema), c.update);
router.delete('/:id', authenticate, authorize('admin'), c.remove);

module.exports = router;
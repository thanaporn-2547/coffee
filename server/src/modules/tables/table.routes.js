const router = require('express').Router();
const c = require('./table.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createTableSchema, updateTableSchema } = require('./table.schema');

router.get('/', c.getAll);
router.get('/:id', c.getById);
router.post('/', authenticate, authorize('admin'), validate(createTableSchema), c.create);
router.put('/:id', authenticate, authorize('admin'), validate(updateTableSchema), c.update);
router.delete('/:id', authenticate, authorize('admin'), c.remove);

module.exports = router;
const router = require('express').Router();
const c = require('./reservation.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createReservationSchema, updateStatusSchema } = require('./reservation.schema');

router.use(authenticate);

router.get('/mine', c.getMine);
router.post('/', validate(createReservationSchema), c.create);
router.patch('/:id/cancel', c.cancel);

router.get('/', authorize('admin'), c.getAll);
router.get('/:id', c.getById);
router.patch('/:id/status', authorize('admin'), validate(updateStatusSchema), c.updateStatus);

module.exports = router;
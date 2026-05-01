const router = require('express').Router();
const c = require('./user.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { updateProfileSchema, changePasswordSchema, updateRoleSchema } = require('./user.schema');

router.use(authenticate);

router.get('/me', c.getMe);
router.put('/me', validate(updateProfileSchema), c.updateProfile);
router.put('/me/password', validate(changePasswordSchema), c.changePassword);

// Admin only
router.get('/', authorize('admin'), c.getAll);
router.get('/:id', authorize('admin'), c.getById);
router.put('/:id/role', authorize('admin'), validate(updateRoleSchema), c.updateRole);
router.delete('/:id', authorize('admin'), c.deleteUser);

module.exports = router;
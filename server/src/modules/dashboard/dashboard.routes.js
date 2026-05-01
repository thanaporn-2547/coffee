const router = require('express').Router();
const c = require('./dashboard.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');

router.get('/stats', authenticate, authorize('admin'), c.getStats);

module.exports = router;
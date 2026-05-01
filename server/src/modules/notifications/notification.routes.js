const router = require('express').Router();
const c = require('./notification.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.use(authenticate);
router.get('/', c.getMine);
router.patch('/:id/read', c.markAsRead);
router.patch('/read-all', c.markAllAsRead);

module.exports = router;
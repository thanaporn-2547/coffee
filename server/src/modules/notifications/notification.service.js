const prisma = require('../../config/db');

const getMyNotifications = (userId) =>
  prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 });

const markAsRead = (id, userId) =>
  prisma.notification.updateMany({ where: { id, userId }, data: { isRead: true } });

const markAllAsRead = (userId) =>
  prisma.notification.updateMany({ where: { userId }, data: { isRead: true } });

const create = (data) => prisma.notification.create({ data });

module.exports = { getMyNotifications, markAsRead, markAllAsRead, create };
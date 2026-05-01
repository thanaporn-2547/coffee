const service = require('./notification.service');
const { sendSuccess } = require('../../utils/response');

const getMine = async (req, res, next) => { try { sendSuccess(res, await service.getMyNotifications(req.user.id)); } catch (e) { next(e); } };
const markAsRead = async (req, res, next) => { try { sendSuccess(res, await service.markAsRead(req.params.id, req.user.id)); } catch (e) { next(e); } };
const markAllAsRead = async (req, res, next) => { try { sendSuccess(res, await service.markAllAsRead(req.user.id)); } catch (e) { next(e); } };

module.exports = { getMine, markAsRead, markAllAsRead };
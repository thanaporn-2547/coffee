const service = require('./order.service');
const { sendSuccess } = require('../../utils/response');

const getAll = async (req, res, next) => {
  try {
    sendSuccess(res, await service.getAll(req.query));
  } catch (e) { next(e); }
};

// ✅ ใช้ req.user.id ส่งตรงเข้า getMyOrders
const getMine = async (req, res, next) => {
  try {
    sendSuccess(res, await service.getMyOrders(req.user.id, req.query));
  } catch (e) { next(e); }
};

const getById = async (req, res, next) => {
  try {
    sendSuccess(res, await service.getById(req.params.id));
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    sendSuccess(res, await service.create(req.user.id, req.body), 'Order placed successfully', 201);
  } catch (e) { next(e); }
};

const updateStatus = async (req, res, next) => {
  try {
    sendSuccess(res, await service.updateStatus(req.params.id, req.body.status));
  } catch (e) { next(e); }
};

module.exports = { getAll, getMine, getById, create, updateStatus };
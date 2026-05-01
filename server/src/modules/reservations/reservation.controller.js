const service = require('./reservation.service');
const { sendSuccess } = require('../../utils/response');

const getAll = async (req, res, next) => {
  try { sendSuccess(res, await service.getAll(req.query)); } catch (e) { next(e); }
};
const getMine = async (req, res, next) => {
  try { sendSuccess(res, await service.getMyReservations(req.user.id, req.query)); } catch (e) { next(e); }
};
const getById = async (req, res, next) => {
  try { sendSuccess(res, await service.getById(req.params.id)); } catch (e) { next(e); }
};
const create = async (req, res, next) => {
  try { sendSuccess(res, await service.create(req.user.id, req.body), 'Reservation created', 201); } catch (e) { next(e); }
};
const updateStatus = async (req, res, next) => {
  try { sendSuccess(res, await service.updateStatus(req.params.id, req.body.status)); } catch (e) { next(e); }
};
const cancel = async (req, res, next) => {
  try { sendSuccess(res, await service.cancel(req.params.id, req.user.id), 'Reservation cancelled'); } catch (e) { next(e); }
};

module.exports = { getAll, getMine, getById, create, updateStatus, cancel };
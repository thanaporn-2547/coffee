const service = require('./menu.service');
const { sendSuccess } = require('../../utils/response');

const getAll = async (req, res, next) => { try { sendSuccess(res, await service.getAll(req.query)); } catch (e) { next(e); } };
const getById = async (req, res, next) => { try { sendSuccess(res, await service.getById(req.params.id)); } catch (e) { next(e); } };
const create = async (req, res, next) => { try { sendSuccess(res, await service.create(req.body), 'Menu item created', 201); } catch (e) { next(e); } };
const update = async (req, res, next) => { try { sendSuccess(res, await service.update(req.params.id, req.body)); } catch (e) { next(e); } };
const remove = async (req, res, next) => { try { await service.remove(req.params.id); sendSuccess(res, null, 'Menu item deleted'); } catch (e) { next(e); } };

module.exports = { getAll, getById, create, update, remove };
const userService = require('./user.service');
const { sendSuccess } = require('../../utils/response');

const getAll = async (req, res, next) => {
  try { sendSuccess(res, await userService.getAll(req.query)); } catch (e) { next(e); }
};
const getMe = async (req, res, next) => {
  try { sendSuccess(res, await userService.getById(req.user.id)); } catch (e) { next(e); }
};
const getById = async (req, res, next) => {
  try { sendSuccess(res, await userService.getById(req.params.id)); } catch (e) { next(e); }
};
const updateProfile = async (req, res, next) => {
  try { sendSuccess(res, await userService.updateProfile(req.user.id, req.body)); } catch (e) { next(e); }
};
const changePassword = async (req, res, next) => {
  try { await userService.changePassword(req.user.id, req.body); sendSuccess(res, null, 'Password changed'); } catch (e) { next(e); }
};
const updateRole = async (req, res, next) => {
  try { sendSuccess(res, await userService.updateRole(req.params.id, req.body.role)); } catch (e) { next(e); }
};
const deleteUser = async (req, res, next) => {
  try { await userService.deleteUser(req.params.id); sendSuccess(res, null, 'User deleted'); } catch (e) { next(e); }
};

module.exports = { getAll, getMe, getById, updateProfile, changePassword, updateRole, deleteUser };
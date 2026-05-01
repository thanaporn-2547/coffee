const service = require('./dashboard.service');
const { sendSuccess } = require('../../utils/response');

const getStats = async (req, res, next) => {
  try {
    sendSuccess(res, await service.getStats(), 'Dashboard stats');
  } catch (e) { next(e); }
};

module.exports = { getStats };
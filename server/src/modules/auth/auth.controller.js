const authService = require('./auth.service');
const { sendSuccess, sendError } = require('../../utils/response');

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    sendSuccess(res, user, 'Registration successful', 201);
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    sendSuccess(res, { user, accessToken }, 'Login successful');
  } catch (err) { next(err); }
};

const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    const result = await authService.refresh(token);
    sendSuccess(res, result, 'Token refreshed');
  } catch (err) { next(err); }
};

const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    await authService.logout(token);
    res.clearCookie('refreshToken');
    sendSuccess(res, null, 'Logged out successfully');
  } catch (err) { next(err); }
};

const me = async (req, res) => {
  sendSuccess(res, req.user, 'Current user');
};

module.exports = { register, login, refresh, logout, me };
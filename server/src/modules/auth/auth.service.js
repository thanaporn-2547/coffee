const bcrypt = require('bcryptjs');
const prisma = require('../../config/db');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../config/jwt');
const { generateRandomToken } = require('../../utils/token');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

const register = async ({ fullName, email, password, phone }) => {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw { statusCode: 409, message: 'Email already registered' };

  const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: { fullName, email, password: hashed, phone },
    select: { id: true, fullName: true, email: true, phone: true, role: true, createdAt: true },
  });
  return user;
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw { statusCode: 401, message: 'Invalid credentials' };

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw { statusCode: 401, message: 'Invalid credentials' };

  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

  const { password: _, ...userSafe } = user;
  return { user: userSafe, accessToken, refreshToken };
};

const refresh = async (token) => {
  if (!token) throw { statusCode: 401, message: 'Refresh token required' };

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw { statusCode: 401, message: 'Invalid refresh token' };
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) {
    throw { statusCode: 401, message: 'Refresh token expired or not found' };
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(payload);
  return { accessToken };
};

const logout = async (token) => {
  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }
};

module.exports = { register, login, refresh, logout };
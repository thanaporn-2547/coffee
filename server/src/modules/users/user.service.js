const bcrypt = require('bcryptjs');
const prisma = require('../../config/db');
const { getPagination, paginatedResponse } = require('../../utils/pagination');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

const selectSafe = { id: true, fullName: true, email: true, phone: true, role: true, createdAt: true, updatedAt: true };

const getAll = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const search = query.search || '';
  const where = search ? { OR: [{ fullName: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] } : {};
  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, skip, take: limit, select: selectSafe, orderBy: { createdAt: 'desc' } }),
    prisma.user.count({ where }),
  ]);
  return paginatedResponse(users, total, page, limit);
};

const getById = async (id) => {
  const user = await prisma.user.findUnique({ where: { id }, select: selectSafe });
  if (!user) throw { statusCode: 404, message: 'User not found' };
  return user;
};

const updateProfile = async (id, data) => {
  return prisma.user.update({ where: { id }, data, select: selectSafe });
};

const changePassword = async (id, { currentPassword, newPassword }) => {
  const user = await prisma.user.findUnique({ where: { id } });
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw { statusCode: 400, message: 'Current password is incorrect' };
  const hashed = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await prisma.user.update({ where: { id }, data: { password: hashed } });
};

const updateRole = async (id, role) => {
  return prisma.user.update({ where: { id }, data: { role }, select: selectSafe });
};

const deleteUser = async (id) => {
  await prisma.user.delete({ where: { id } });
};

module.exports = { getAll, getById, updateProfile, changePassword, updateRole, deleteUser };
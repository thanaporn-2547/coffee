const prisma = require('../../config/db');
const { emitToAll } = require('../../socket');

const getAll = async (query) => {
  const where = {};
  if (query.status) where.status = query.status;
  if (query.isActive !== undefined) where.isActive = query.isActive === 'true';
  return prisma.restaurantTable.findMany({ where, orderBy: { tableNumber: 'asc' } });
};

const getById = async (id) => {
  const table = await prisma.restaurantTable.findUnique({ where: { id } });
  if (!table) throw { statusCode: 404, message: 'Table not found' };
  return table;
};

const create = async (data) => {
  return prisma.restaurantTable.create({ data });
};

const update = async (id, data) => {
  const table = await prisma.restaurantTable.update({ where: { id }, data });
  emitToAll('table:updated', table);
  return table;
};

const remove = async (id) => {
  await prisma.restaurantTable.delete({ where: { id } });
};

module.exports = { getAll, getById, create, update, remove };
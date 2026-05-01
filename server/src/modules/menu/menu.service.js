const prisma = require('../../config/db');
const { getPagination, paginatedResponse } = require('../../utils/pagination');

const getAll = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const where = {};
  if (query.categoryId) where.categoryId = query.categoryId;
  if (query.isAvailable !== undefined) where.isAvailable = query.isAvailable === 'true';
  if (query.search) where.name = { contains: query.search, mode: 'insensitive' };
  const [items, total] = await Promise.all([
    prisma.menuItem.findMany({ where, skip, take: limit, include: { category: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.menuItem.count({ where }),
  ]);
  return paginatedResponse(items, total, page, limit);
};

const getById = async (id) => {
  const item = await prisma.menuItem.findUnique({ where: { id }, include: { category: true } });
  if (!item) throw { statusCode: 404, message: 'Menu item not found' };
  return item;
};

const create = (data) => prisma.menuItem.create({ data: { ...data, price: data.price.toString() }, include: { category: true } });
const update = (id, data) => {
  const updateData = { ...data };
  if (data.price !== undefined) updateData.price = data.price.toString();
  return prisma.menuItem.update({ where: { id }, data: updateData, include: { category: true } });
};
const remove = (id) => prisma.menuItem.delete({ where: { id } });

module.exports = { getAll, getById, create, update, remove };
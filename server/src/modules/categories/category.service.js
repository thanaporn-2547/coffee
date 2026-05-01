const prisma = require('../../config/db');

const getAll = () => prisma.menuCategory.findMany({ orderBy: { sortOrder: 'asc' } });
const getById = async (id) => {
  const cat = await prisma.menuCategory.findUnique({ where: { id }, include: { menuItems: true } });
  if (!cat) throw { statusCode: 404, message: 'Category not found' };
  return cat;
};
const create = (data) => prisma.menuCategory.create({ data });
const update = (id, data) => prisma.menuCategory.update({ where: { id }, data });
const remove = (id) => prisma.menuCategory.delete({ where: { id } });

module.exports = { getAll, getById, create, update, remove };
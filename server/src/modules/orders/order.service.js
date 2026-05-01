const prisma = require('../../config/db');
const { getPagination, paginatedResponse } = require('../../utils/pagination');
const { emitToUser, emitToAdmin } = require('../../socket');

const orderInclude = {
  user: { select: { id: true, fullName: true, email: true } },
  orderItems: {
    include: {
      menuItem: {
        select: { id: true, name: true, price: true, imageUrl: true },
      },
    },
  },
  reservation: {
    select: { id: true, timeSlot: true, reservationDate: true },
  },
};

const getAll = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const where = {};
  if (query.status) where.status = query.status;
  if (query.userId) where.userId = query.userId;

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);
  return paginatedResponse(items, total, page, limit);
};

// ✅ แยก getMyOrders ให้ query ตรง userId จริง ๆ
const getMyOrders = async (userId, query) => {
  const { page, limit, skip } = getPagination(query);

  const where = { userId };
  if (query.status) where.status = query.status;

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);
  return paginatedResponse(items, total, page, limit);
};

const getById = async (id) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: orderInclude,
  });
  if (!order) throw { statusCode: 404, message: 'Order not found' };
  return order;
};

const create = async (userId, { reservationId, items, notes }) => {
  const menuItemIds = items.map(i => i.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds } },
  });

  let totalPrice = 0;
  const orderItems = items.map(item => {
    const menuItem = menuItems.find(m => m.id === item.menuItemId);
    if (!menuItem) throw { statusCode: 404, message: `Menu item not found: ${item.menuItemId}` };
    if (!menuItem.isAvailable) throw { statusCode: 400, message: `${menuItem.name} is not available` };

    const unitPrice = parseFloat(menuItem.price);
    const subtotal = unitPrice * item.quantity;
    totalPrice += subtotal;

    return {
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      unitPrice: unitPrice.toString(),
      subtotal: subtotal.toString(),
      notes: item.notes || null,
    };
  });

  const order = await prisma.order.create({
    data: {
      userId,
      reservationId: reservationId || null,
      notes: notes || null,
      totalPrice: totalPrice.toString(),
      orderItems: { create: orderItems },
    },
    include: orderInclude,
  });

  // แจ้ง admin realtime
  emitToAdmin('order:new', order);

  return order;
};

const updateStatus = async (id, status) => {
  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: orderInclude,
  });

  // แจ้ง user และ admin realtime
  emitToUser(order.userId, 'order:updated', order);
  emitToAdmin('order:updated', order);

  return order;
};

module.exports = { getAll, getMyOrders, getById, create, updateStatus };
const prisma = require('../../config/db');
const { getPagination, paginatedResponse } = require('../../utils/pagination');
const { emitToUser, emitToAdmin } = require('../../socket');

const checkConflict = async (tableId, reservationDate, timeSlot, excludeId) => {
  const date = new Date(reservationDate);
  const start = new Date(date); start.setHours(0, 0, 0, 0);
  const end = new Date(date); end.setHours(23, 59, 59, 999);
  const where = {
    tableId, timeSlot,
    reservationDate: { gte: start, lte: end },
    status: { in: ['pending', 'confirmed'] },
  };
  if (excludeId) where.id = { not: excludeId };
  const conflict = await prisma.reservation.findFirst({ where });
  return !!conflict;
};

const getAll = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const where = {};
  if (query.status) where.status = query.status;
  if (query.userId) where.userId = query.userId;
  const [items, total] = await Promise.all([
    prisma.reservation.findMany({
      where, skip, take: limit,
      include: { user: { select: { id: true, fullName: true, email: true } }, table: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.reservation.count({ where }),
  ]);
  return paginatedResponse(items, total, page, limit);
};

const getMyReservations = async (userId, query) => {
  return getAll({ ...query, userId });
};

const getById = async (id) => {
  const r = await prisma.reservation.findUnique({
    where: { id },
    include: { user: { select: { id: true, fullName: true, email: true } }, table: true },
  });
  if (!r) throw { statusCode: 404, message: 'Reservation not found' };
  return r;
};

const create = async (userId, data) => {
  const hasConflict = await checkConflict(data.tableId, data.reservationDate, data.timeSlot);
  if (hasConflict) throw { statusCode: 409, message: 'This table is already reserved for the selected time slot' };
  const reservation = await prisma.reservation.create({
    data: { ...data, userId, reservationDate: new Date(data.reservationDate) },
    include: { table: true },
  });
  emitToAdmin('reservation:new', reservation);
  return reservation;
};

const updateStatus = async (id, status) => {
  const reservation = await prisma.reservation.update({
    where: { id }, data: { status },
    include: { user: true, table: true },
  });
  emitToUser(reservation.userId, 'reservation:updated', reservation);
  emitToAdmin('reservation:updated', reservation);
  if (status === 'confirmed' || status === 'cancelled') {
    const tableStatus = status === 'confirmed' ? 'reserved' : 'available';
    await prisma.restaurantTable.update({ where: { id: reservation.tableId }, data: { status: tableStatus } });
  }
  return reservation;
};

const cancel = async (id, userId) => {
  const r = await prisma.reservation.findUnique({ where: { id } });
  if (!r) throw { statusCode: 404, message: 'Reservation not found' };
  if (r.userId !== userId) throw { statusCode: 403, message: 'Forbidden' };
  if (!['pending', 'confirmed'].includes(r.status)) {
    throw { statusCode: 400, message: 'Cannot cancel this reservation' };
  }
  return updateStatus(id, 'cancelled');
};

module.exports = { getAll, getMyReservations, getById, create, updateStatus, cancel };
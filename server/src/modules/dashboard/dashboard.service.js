const prisma = require('../../config/db');

const getStats = async () => {
  const [
    totalUsers,
    totalOrders,
    totalReservations,
    revenueResult,
    recentOrders,
    recentReservations,
    ordersByStatus,
    reservationsByStatus,
    topDrinks,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'user' } }),
    prisma.order.count(),
    prisma.reservation.count(),
    prisma.order.aggregate({
      _sum: { totalPrice: true },
      where: { status: { in: ['completed', 'served'] } },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true } },
        orderItems: { include: { menuItem: { select: { name: true } } } },
      },
    }),
    prisma.reservation.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true } },
        table: true,
      },
    }),
    prisma.order.groupBy({ by: ['status'], _count: { status: true } }),
    prisma.reservation.groupBy({ by: ['status'], _count: { status: true } }),
    // top 5 เครื่องดื่มขายดี
    prisma.orderItem.groupBy({
      by: ['menuItemId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
  ]);

  // ดึงชื่อเครื่องดื่มจาก topDrinks
  const topDrinkIds = topDrinks.map(d => d.menuItemId);
  const topDrinkItems = await prisma.menuItem.findMany({
    where: { id: { in: topDrinkIds } },
    select: { id: true, name: true, imageUrl: true, price: true },
  });

  const topDrinksWithName = topDrinks.map(d => ({
    ...d,
    menuItem: topDrinkItems.find(i => i.id === d.menuItemId),
  }));

  return {
    totalUsers,
    totalOrders,
    totalReservations,
    totalRevenue: revenueResult._sum.totalPrice || 0,
    recentOrders,
    recentReservations,
    ordersByStatus,
    reservationsByStatus,
    topDrinks: topDrinksWithName,
  };
};

module.exports = { getStats };
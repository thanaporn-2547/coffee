import { useQuery } from '@tanstack/react-query';
import { Users, ShoppingBag, CalendarCheck, DollarSign } from 'lucide-react';
import api from '../../services/api';
import StatCard from '../../components/admin/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import { useSocketEvent } from '../../hooks/useSocket';
import { useQueryClient } from '@tanstack/react-query';

const AdminDashboardPage = () => {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats').then(r => r.data.data),
  });

  useSocketEvent('order:new', () => qc.invalidateQueries({ queryKey: ['dashboard-stats'] }));
  useSocketEvent('reservation:new', () => qc.invalidateQueries({ queryKey: ['dashboard-stats'] }));

  if (isLoading) return <LoadingSpinner className="py-20" size="lg" />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your restaurant</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={data?.totalUsers ?? 0} icon={Users} color="blue" />
        <StatCard title="Total Orders" value={data?.totalOrders ?? 0} icon={ShoppingBag} color="amber" />
        <StatCard title="Reservations" value={data?.totalReservations ?? 0} icon={CalendarCheck} color="purple" />
        <StatCard title="Revenue" value={formatCurrency(data?.totalRevenue ?? 0)} icon={DollarSign} color="green" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {data?.recentOrders?.map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{order.user.fullName}</p>
                  <p className="text-xs text-gray-400">{formatDateTime(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{formatCurrency(order.totalPrice)}</span>
                  <Badge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Reservations</h3>
          <div className="space-y-3">
            {data?.recentReservations?.map(r => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{r.user.fullName}</p>
                  <p className="text-xs text-gray-400">Table {r.table.tableNumber} · {r.timeSlot}</p>
                </div>
                <Badge status={r.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
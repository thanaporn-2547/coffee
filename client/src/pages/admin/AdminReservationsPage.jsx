import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarCheck, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatDateTime } from '../../utils/formatDate';
import { useSocketEvent } from '../../hooks/useSocket';

const STATUSES = ['', 'pending', 'confirmed', 'cancelled', 'completed'];

const AdminReservationsPage = () => {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null, status: null });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reservations', statusFilter],
    queryFn: () => api.get('/reservations', { params: { status: statusFilter || undefined, limit: 50 } }).then(r => r.data.data),
  });

  useSocketEvent('reservation:new', () => qc.invalidateQueries({ queryKey: ['admin-reservations'] }));
  useSocketEvent('reservation:updated', () => qc.invalidateQueries({ queryKey: ['admin-reservations'] }));

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/reservations/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-reservations'] });
      toast.success('Reservation status updated');
      setConfirmDialog({ open: false, id: null, status: null });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const nextActions = {
    pending: [{ label: 'Confirm', status: 'confirmed', color: 'bg-blue-500 hover:bg-blue-600' }, { label: 'Cancel', status: 'cancelled', color: 'bg-red-500 hover:bg-red-600' }],
    confirmed: [{ label: 'Complete', status: 'completed', color: 'bg-green-500 hover:bg-green-600' }, { label: 'Cancel', status: 'cancelled', color: 'bg-red-500 hover:bg-red-600' }],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reservations</h1>
        <p className="text-gray-500 text-sm mt-1">Manage all table reservations</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${statusFilter === s ? 'bg-amber-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? <LoadingSpinner className="py-20" size="lg" /> : data?.items?.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="No reservations found" />
      ) : (
        <div className="space-y-3">
          {data?.items?.map(r => (
            <div key={r.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center font-bold text-amber-700">
                    T{r.table?.tableNumber}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{r.user?.fullName}</p>
                    <p className="text-xs text-gray-500">{r.user?.email}</p>
                    <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
                      <span>📅 {formatDateTime(r.reservationDate)}</span>
                      <span>🕐 {r.timeSlot}</span>
                      <span>👥 {r.guestCount} guests</span>
                      {r.specialRequest && <span>📝 {r.specialRequest}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge status={r.status} />
                  <div className="flex gap-2">
                    {(nextActions[r.status] || []).map(action => (
                      <button key={action.status}
                        onClick={() => setConfirmDialog({ open: true, id: r.id, status: action.status, label: action.label })}
                        className={`px-3 py-1.5 ${action.color} text-white rounded-lg text-xs font-medium transition-colors`}>
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, id: null, status: null })}
        onConfirm={() => statusMutation.mutate({ id: confirmDialog.id, status: confirmDialog.status })}
        isLoading={statusMutation.isPending}
        title={`${confirmDialog.label} Reservation`}
        message={`Are you sure you want to ${confirmDialog.label?.toLowerCase()} this reservation?`}
        confirmLabel={confirmDialog.label}
        variant={confirmDialog.status === 'cancelled' ? 'danger' : 'warning'}
      />
    </div>
  );
};

export default AdminReservationsPage;
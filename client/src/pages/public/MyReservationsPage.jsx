import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatDateTime } from '../../utils/formatDate';
import { useSocketEvent } from '../../hooks/useSocket';

const MyReservationsPage = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [cancelDialog, setCancelDialog] = useState({ open: false, id: null });

  const { data, isLoading } = useQuery({
    queryKey: ['my-reservations'],
    queryFn: () => api.get('/reservations/mine').then(r => r.data.data),
  });

  useSocketEvent('reservation:updated', () => qc.invalidateQueries({ queryKey: ['my-reservations'] }));

  const cancelMutation = useMutation({
    mutationFn: (id) => api.patch(`/reservations/${id}/cancel`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-reservations'] });
      toast.success('Reservation cancelled');
      setCancelDialog({ open: false, id: null });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('myReservations.title')}</h1>

      {isLoading ? <LoadingSpinner className="py-20" size="lg" /> :
        (data?.items?.length === 0 || !data?.items) ? (
          <EmptyState icon={CalendarCheck}
            title={t('myReservations.empty')}
            description={t('myReservations.emptyDesc')}
            action={
              <Link to="/reservation"
                className="px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors">
                {t('myReservations.reserveNow')}
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {data.items.map(r => (
              <div key={r.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center font-bold text-amber-700 text-lg">
                      T{r.table?.tableNumber}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        Table {r.table?.tableNumber} — {r.table?.location}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                        <span>📅 {formatDateTime(r.reservationDate)}</span>
                        <span>🕐 {r.timeSlot}</span>
                        <span>👥 {r.guestCount} {t('reservation.guests2')}</span>
                      </div>
                      {r.specialRequest && (
                        <p className="text-xs text-gray-400 mt-1">📝 {r.specialRequest}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge status={r.status} />
                    {['pending', 'confirmed'].includes(r.status) && (
                      <button onClick={() => setCancelDialog({ open: true, id: r.id })}
                        className="text-xs text-red-500 hover:text-red-700 font-medium">
                        {t('myReservations.cancel')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }

      <ConfirmDialog
        isOpen={cancelDialog.open}
        onClose={() => setCancelDialog({ open: false, id: null })}
        onConfirm={() => cancelMutation.mutate(cancelDialog.id)}
        isLoading={cancelMutation.isPending}
        title={t('myReservations.confirmCancel')}
        message={t('myReservations.confirmCancelMsg')}
        confirmLabel={t('myReservations.cancel')}
        variant="danger"
      />
    </div>
  );
};

export default MyReservationsPage;
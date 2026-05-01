import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';

const schema = z.object({
  tableId: z.string().min(1),
  reservationDate: z.string().min(1),
  timeSlot: z.string().min(1),
  guestCount: z.coerce.number().int().min(1).max(20),
  specialRequest: z.string().optional(),
});

const TIME_SLOTS = ['11:00','12:00','13:00','14:00','17:00','18:00','19:00','20:00','21:00'];

const ReservationPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { guestCount: 2 },
  });
  const guestCount = watch('guestCount');

  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: () => api.get('/tables', { params: { isActive: true } }).then(r => r.data.data),
  });

  const mutation = useMutation({
    mutationFn: (data) => api.post('/reservations', {
      ...data,
      reservationDate: new Date(data.reservationDate).toISOString(),
    }),
    onSuccess: () => {
      toast.success('🎉 Table reserved!');
      navigate('/my-reservations');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to reserve table'),
  });

  const availableTables = tables.filter(t => t.isActive && t.capacity >= (guestCount || 1));

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{t('reservation.title')}</h1>
        <p className="text-gray-500 mt-1">{t('reservation.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('reservation.date')} *</label>
              <input {...register('reservationDate')} type="date"
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
              {errors.reservationDate && <p className="text-red-500 text-xs mt-1">{errors.reservationDate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('reservation.time')} *</label>
              <select {...register('timeSlot')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white">
                <option value="">{t('reservation.selectTime')}</option>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.timeSlot && <p className="text-red-500 text-xs mt-1">{errors.timeSlot.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('reservation.guests')} *</label>
              <input {...register('guestCount')} type="number" min={1} max={20}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
              {errors.guestCount && <p className="text-red-500 text-xs mt-1">{errors.guestCount.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('reservation.specialRequest')}</label>
            <textarea {...register('specialRequest')} rows={2}
              placeholder={t('reservation.specialRequestPlaceholder')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">{t('reservation.selectTable')}</h3>
          {isLoading ? <LoadingSpinner size="sm" /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableTables.length === 0 ? (
                <p className="col-span-3 text-center text-gray-400 text-sm py-4">
                  {t('reservation.noTables')} {guestCount} {t('reservation.guests2')}
                </p>
              ) : availableTables.map(table => (
                <label key={table.id} className="relative cursor-pointer">
                  <input {...register('tableId')} type="radio" value={table.id} className="peer sr-only" />
                  <div className="p-4 border-2 border-gray-200 rounded-xl peer-checked:border-amber-500 peer-checked:bg-amber-50 hover:border-amber-300 transition-colors">
                    <p className="font-bold text-gray-800">Table {table.tableNumber}</p>
                    <p className="text-xs text-gray-500">{table.capacity} {t('reservation.seats')}</p>
                    {table.location && <p className="text-xs text-gray-400">{table.location}</p>}
                    <div className="mt-2"><Badge status={table.status} /></div>
                  </div>
                </label>
              ))}
            </div>
          )}
          {errors.tableId && <p className="text-red-500 text-xs mt-2">{errors.tableId.message}</p>}
        </div>

        <button type="submit" disabled={mutation.isPending}
          className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-2xl transition-colors text-lg disabled:opacity-50">
          {mutation.isPending ? t('reservation.confirming') : t('reservation.confirm')}
        </button>
      </form>
    </div>
  );
};

export default ReservationPage;
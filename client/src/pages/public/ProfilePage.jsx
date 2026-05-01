import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const profileSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuthStore();

  const { register: rp, handleSubmit: hp, formState: { errors: ep } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user?.fullName, phone: user?.phone || '' },
  });

  const { register: rpass, handleSubmit: hpass, reset: resetPass, formState: { errors: epass } } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const profileMutation = useMutation({
    mutationFn: (data) => api.put('/users/me', data),
    onSuccess: (res) => { updateUser(res.data.data); toast.success('Profile updated!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const passwordMutation = useMutation({
    mutationFn: (data) => api.put('/users/me/password', data),
    onSuccess: () => { toast.success('Password changed!'); resetPass(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{t('profile.title')}</h1>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-2xl font-bold text-amber-700">
            {user?.fullName?.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-gray-800 text-lg">{user?.fullName}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={hp(d => profileMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.fullName')}</label>
            <input {...rp('fullName')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
            {ep.fullName && <p className="text-red-500 text-xs mt-1">{ep.fullName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.phone')}</label>
            <input {...rp('phone')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
          </div>
          <button type="submit" disabled={profileMutation.isPending}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
            {profileMutation.isPending ? t('profile.saving') : t('profile.save')}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-4">{t('profile.changePassword')}</h3>
        <form onSubmit={hpass(d => passwordMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.currentPassword')}</label>
            <input {...rpass('currentPassword')} type="password"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
            {epass.currentPassword && <p className="text-red-500 text-xs mt-1">{epass.currentPassword.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.newPassword')}</label>
            <input {...rpass('newPassword')} type="password"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
            {epass.newPassword && <p className="text-red-500 text-xs mt-1">{epass.newPassword.message}</p>}
          </div>
          <button type="submit" disabled={passwordMutation.isPending}
            className="px-6 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
            {passwordMutation.isPending ? t('profile.changing') : t('profile.changeBtn')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
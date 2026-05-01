import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRegister } from '../../hooks/useAuth';

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
});

const RegisterPage = () => {
  const { t } = useTranslation();
  const register_ = useRegister();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">{t('auth.registerTitle')}</h2>
        <p className="text-gray-500 mt-1">{t('auth.registerSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(d => register_.mutate(d))} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('auth.fullName')}
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input
              {...register('fullName')}
              placeholder="John Doe"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent text-sm transition-all"
            />
          </div>
          {errors.fullName && (
            <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('auth.email')}
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent text-sm transition-all"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('auth.password')}
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input
              {...register('password')}
              type="password"
              placeholder="Min 8 characters"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent text-sm transition-all"
            />
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('auth.phone')}
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input
              {...register('phone')}
              placeholder="08x-xxx-xxxx"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent text-sm transition-all"
            />
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-amber-700 mb-2">✨ สิทธิประโยชน์สมาชิก</p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              '🍽️ สั่งอาหารออนไลน์',
              '🪑 จองโต๊ะล่วงหน้า',
              '📦 ติดตามออเดอร์ Live',
              '🎁 โปรโมชันพิเศษ',
            ].map(b => (
              <p key={b} className="text-xs text-amber-600">{b}</p>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={register_.isPending}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-amber-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
        >
          <UserPlus size={18} />
          {register_.isPending ? t('auth.registering') : t('auth.registerBtn')}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-5">
        {t('auth.hasAccount')}{' '}
        <Link to="/login" className="text-amber-600 font-semibold hover:underline">
          {t('auth.signIn')}
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
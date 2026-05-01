import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLogin } from '../../hooks/useAuth';


const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const LoginPage = () => {
  const { t } = useTranslation();
  const login = useLogin();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">{t('auth.loginTitle')}</h2>
        <p className="text-gray-500 mt-1">{t('auth.loginSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(d => login.mutate(d))} className="space-y-5">
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
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent text-sm transition-all"
            />
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={login.isPending}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-amber-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 mt-2"
        >
          <LogIn size={18} />
          {login.isPending ? t('auth.loggingIn') : t('auth.loginBtn')}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">{t('auth.or')}</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <p className="text-center text-sm text-gray-500">
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="text-amber-600 font-semibold hover:underline">
          {t('auth.signUp')}
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
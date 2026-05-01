import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Search, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatCurrency';

const MenuPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [selectedCat, setSelectedCat] = useState('');
  const [search, setSearch] = useState('');
  const addItem = useCartStore(s => s.addItem);

  const { data: cats } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data.data),
  });

  const { data: menuData, isLoading } = useQuery({
    queryKey: ['menu', selectedCat, search],
    queryFn: () => api.get('/menu', {
      params: {
        categoryId: selectedCat || undefined,
        search: search || undefined,
        isAvailable: true,
        limit: 50,
      },
    }).then(r => r.data.data),
  });

  const handleAdd = (item) => {
    if (!isAuthenticated) {
      toast.error('กรุณาเข้าสู่ระบบก่อนสั่งอาหาร');
      navigate('/login');
      return;
    }
    addItem(item);
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{t('menu.title')}</h1>
        <p className="text-gray-500 mt-1">{t('menu.subtitle')}</p>
      </div>

      {/* Member notice */}
      {!isAuthenticated && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-5 py-3 rounded-2xl mb-6">
          <Lock size={18} className="text-amber-500 flex-shrink-0" />
          <p className="text-sm">
            กรุณา{' '}
            <Link to="/login" className="font-bold underline hover:text-amber-600">
              เข้าสู่ระบบ
            </Link>
            {' '}หรือ{' '}
            <Link to="/register" className="font-bold underline hover:text-amber-600">
              สมัครสมาชิก
            </Link>
            {' '}เพื่อสั่งอาหาร
          </p>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('menu.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCat('')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              !selectedCat
                ? 'bg-amber-500 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t('menu.all')}
          </button>
          {cats?.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                selectedCat === cat.id
                  ? 'bg-amber-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <LoadingSpinner className="py-20" size="lg" />
      ) : menuData?.items?.length === 0 ? (
        <EmptyState title={t('menu.notFound')} description={t('menu.notFoundDesc')} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menuData?.items?.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all hover:-translate-y-1 group"
            >
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-amber-100 to-orange-200 overflow-hidden">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>
                )}
                <span className="absolute top-3 right-3 bg-white text-amber-700 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                  {item.category?.name}
                </span>

                {/* Lock overlay for non-members */}
                {!isAuthenticated && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2">
                      <Lock size={14} className="text-amber-600" />
                      <span className="text-xs font-semibold text-gray-700">Members only</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                {item.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                )}
                <div className="flex items-center justify-between mt-4">
                  <span className="text-lg font-bold text-amber-600">
                    {formatCurrency(item.price)}
                  </span>

                  {isAuthenticated ? (
                    <button
                      onClick={() => handleAdd(item)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl transition-colors"
                    >
                      <ShoppingCart size={14} />
                      {t('menu.add')}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        toast.error('กรุณาเข้าสู่ระบบก่อนสั่งอาหาร');
                        navigate('/login');
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-amber-500 hover:text-white text-gray-500 text-xs font-semibold rounded-xl transition-all"
                    >
                      <Lock size={14} />
                      Login
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuPage;
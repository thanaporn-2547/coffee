import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, ArrowLeft, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatCurrency';

const MenuDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const addItem = useCartStore(s => s.addItem);

  const { data: item, isLoading, error } = useQuery({
    queryKey: ['menu-item', id],
    queryFn: () => api.get(`/menu/${id}`).then(r => r.data.data),
  });

  const handleAdd = () => {
    if (!isAuthenticated) {
      toast.error('กรุณาเข้าสู่ระบบก่อนสั่ง');
      navigate('/login');
      return;
    }
    addItem(item);
    toast.success(`${item.name} added to cart`);
  };

  if (isLoading) return <LoadingSpinner className="py-40" size="lg" />;
  if (error || !item) return (
    <div className="text-center py-40">
      <p className="text-gray-400">Item not found</p>
      <button onClick={() => navigate('/menu')} className="mt-4 text-amber-600 hover:underline text-sm">
        {t('common.back')}
      </button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm"
      >
        <ArrowLeft size={16} /> {t('common.back')}
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-64 bg-gradient-to-br from-amber-100 to-orange-200 relative overflow-hidden">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">🍽️</div>
          )}
        </div>

        <div className="p-8">
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
            {item.category?.name}
          </span>
          <h1 className="text-3xl font-bold text-gray-800 mt-3 mb-2">{item.name}</h1>
          {item.description && (
            <p className="text-gray-500 mb-6">{item.description}</p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-amber-600">
              {formatCurrency(item.price)}
            </span>

            {isAuthenticated ? (
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors"
              >
                <ShoppingCart size={20} />
                {t('menu.add')}
              </button>
            ) : (
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-amber-500 hover:text-white text-gray-600 font-semibold rounded-xl transition-all"
              >
                <Lock size={20} />
                เข้าสู่ระบบเพื่อสั่ง
              </button>
            )}
          </div>

          {/* non-member hint */}
          {!isAuthenticated && (
            <p className="text-xs text-gray-400 text-right mt-2">
              ต้องเป็นสมาชิกก่อนถึงจะสั่งอาหารได้
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuDetailPage;
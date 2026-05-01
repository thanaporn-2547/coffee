import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useCartStore from '../../store/cartStore';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatCurrency';

const CartPage = () => {
  const { t } = useTranslation();
  const { items, updateQuantity, removeItem } = useCartStore();
  const total = items.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);

  if (items.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-20">
      <EmptyState icon={ShoppingBag}
        title={t('cart.empty')}
        description={t('cart.emptyDesc')}
        action={
          <Link to="/menu"
            className="px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors">
            {t('cart.browseMenu')}
          </Link>
        }
      />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('cart.title')}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-16 h-16 bg-amber-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                  : '🍽️'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <p className="text-amber-600 font-medium text-sm">{formatCurrency(item.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center hover:bg-amber-200 text-amber-700">
                  <Plus size={14} />
                </button>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">{formatCurrency(parseFloat(item.price) * item.quantity)}</p>
                <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 mt-1">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit">
          <h3 className="font-semibold text-gray-800 mb-4">{t('cart.orderSummary')}</h3>
          <div className="space-y-2 mb-4">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm text-gray-600">
                <span>{item.name} x{item.quantity}</span>
                <span>{formatCurrency(parseFloat(item.price) * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4 mb-6">
            <div className="flex justify-between font-bold text-gray-800">
              <span>{t('cart.total')}</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          <Link to="/checkout"
            className="block text-center py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors">
            {t('cart.checkout')}
          </Link>
          <Link to="/menu"
            className="block text-center py-3 text-gray-500 hover:text-gray-700 text-sm mt-2">
            {t('cart.continueShopping')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
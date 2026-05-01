import { Link } from 'react-router-dom';
import { ShoppingCart, Coffee, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import { useLogout } from '../../hooks/useAuth';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const cartCount = useCartStore((s) => s.items.reduce((a, i) => a + i.quantity, 0));
  const logout = useLogout();
  const { t } = useTranslation();

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/menu', label: t('nav.menu') },
    { to: '/reservation', label: t('nav.reserve'), auth: true },
    { to: '/my-reservations', label: t('nav.myBookings'), auth: true },
    { to: '/my-orders', label: t('nav.myOrders'), auth: true },
  ];

  return (
    <nav className="bg-white border-b border-amber-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-amber-800 rounded-lg flex items-center justify-center">
              <Coffee size={18} className="text-amber-100" />
            </div>
            <span className="text-amber-900">Brew</span>
            <span className="text-amber-500">&</span>
            <span className="text-amber-900">Chill</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.filter(l => !l.auth || isAuthenticated).map(l => (
              <Link key={l.to} to={l.to}
                className="text-gray-600 hover:text-amber-700 text-sm font-medium transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <>
                <Link to="/cart" className="relative p-2 text-gray-600 hover:text-amber-700">
                  <ShoppingCart size={22} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin"
                    className="px-3 py-1.5 bg-amber-900 text-white text-sm rounded-lg hover:bg-amber-800 transition-colors">
                    {t('nav.admin')}
                  </Link>
                )}
                <div className="relative group">
                  <button className="flex items-center gap-2 p-2">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-amber-800 font-semibold text-sm">{user?.fullName?.charAt(0)}</span>
                    </div>
                  </button>
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link to="/profile" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 rounded-t-xl">
                      {t('nav.profile')}
                    </Link>
                    <button onClick={() => logout.mutate()}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-b-xl">
                      {t('nav.logout')}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-amber-700 text-sm font-medium">
                  {t('nav.login')}
                </Link>
                <Link to="/register"
                  className="px-4 py-2 bg-amber-700 text-white text-sm rounded-lg hover:bg-amber-800 transition-colors font-medium">
                  {t('nav.signup')}
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-amber-100">
            {navLinks.filter(l => !l.auth || isAuthenticated).map(l => (
              <Link key={l.to} to={l.to} onClick={() => setIsOpen(false)}
                className="block px-4 py-2.5 text-gray-700 hover:bg-amber-50 rounded-lg text-sm">
                {l.label}
              </Link>
            ))}
            <div className="px-4 py-2"><LanguageSwitcher /></div>
            {isAuthenticated ? (
              <button onClick={() => logout.mutate()}
                className="block w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg text-sm">
                {t('nav.logout')}
              </button>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)}
                className="block px-4 py-2.5 text-amber-700 font-medium text-sm">
                {t('nav.login')}
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
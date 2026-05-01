import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Table2, Coffee, BookOpen, CalendarCheck, ShoppingBag, LogOut } from 'lucide-react';
import { useLogout } from '../hooks/useAuth';
import useAuthStore from '../store/authStore';
import { useSocket } from '../hooks/useSocket';
import { cn } from '../utils/cn';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/tables', label: 'Tables', icon: Table2 },
  { to: '/admin/categories', label: 'Categories', icon: BookOpen },
  { to: '/admin/menu', label: 'Drinks Menu', icon: Coffee },
  { to: '/admin/reservations', label: 'Reservations', icon: CalendarCheck },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
];

const AdminLayout = () => {
  useSocket();
  const { user } = useAuthStore();
  const logout = useLogout();

  return (
    <div className="min-h-screen flex bg-amber-50">
      <aside className="w-64 bg-amber-950 text-white flex flex-col">
        <div className="p-6 border-b border-amber-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center">
              <Coffee size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">Brew & Chill</h1>
              <p className="text-xs text-amber-400 mt-0.5">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                isActive ? 'bg-amber-500 text-white' : 'text-amber-200 hover:bg-amber-800 hover:text-white'
              )}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-amber-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center font-bold text-sm">
              {user?.fullName?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.fullName}</p>
              <p className="text-xs text-amber-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={() => logout.mutate()}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-amber-300 hover:text-white hover:bg-amber-800 rounded-xl transition-colors">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
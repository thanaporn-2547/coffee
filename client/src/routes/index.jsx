import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

import HomePage from '../pages/public/HomePage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import MenuPage from '../pages/public/MenuPage';
import MenuDetailPage from '../pages/public/MenuDetailPage';
import ReservationPage from '../pages/public/ReservationPage';
import MyReservationsPage from '../pages/public/MyReservationsPage';
import CartPage from '../pages/public/CartPage';
import CheckoutPage from '../pages/public/CheckoutPage';
import MyOrdersPage from '../pages/public/MyOrdersPage';
import ProfilePage from '../pages/public/ProfilePage';
import NotFoundPage from '../pages/public/NotFoundPage';

import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminTablesPage from '../pages/admin/AdminTablesPage';
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage';
import AdminMenuPage from '../pages/admin/AdminMenuPage';
import AdminReservationsPage from '../pages/admin/AdminReservationsPage';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage';

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/menu', element: <MenuPage /> },
      { path: '/menu/:id', element: <MenuDetailPage /> },
      { path: '/reservation', element: <ProtectedRoute><ReservationPage /></ProtectedRoute> },
      { path: '/my-reservations', element: <ProtectedRoute><MyReservationsPage /></ProtectedRoute> },
      { path: '/cart', element: <ProtectedRoute><CartPage /></ProtectedRoute> },
      { path: '/checkout', element: <ProtectedRoute><CheckoutPage /></ProtectedRoute> },
      { path: '/my-orders', element: <ProtectedRoute><MyOrdersPage /></ProtectedRoute> },
      { path: '/profile', element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminRoute><AdminLayout /></AdminRoute>,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'tables', element: <AdminTablesPage /> },
      { path: 'categories', element: <AdminCategoriesPage /> },
      { path: 'menu', element: <AdminMenuPage /> },
      { path: 'reservations', element: <AdminReservationsPage /> },
      { path: 'orders', element: <AdminOrdersPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);

export default router;
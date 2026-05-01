import { Link } from 'react-router-dom';
import { ChefHat } from 'lucide-react';

const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
    <ChefHat size={64} className="text-amber-300 mb-4" />
    <h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>
    <p className="text-xl text-gray-500 mb-8">Oops! This page went out to eat and never came back.</p>
    <Link to="/" className="px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors">
      Back to Home
    </Link>
  </div>
);

export default NotFoundPage;
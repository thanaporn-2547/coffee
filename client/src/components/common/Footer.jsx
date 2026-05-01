import { Link } from 'react-router-dom';
import { Coffee } from 'lucide-react';

const Footer = () => (
  <footer className="bg-amber-950 text-amber-200 py-10 px-4">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-white">
        <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center">
          <Coffee size={16} className="text-white" />
        </div>
        <span className="font-bold">Brew & Chill Cafe</span>
      </div>
      <div className="flex gap-6 text-sm">
        <Link to="/menu" className="hover:text-white transition-colors">เมนู</Link>
        <Link to="/reservation" className="hover:text-white transition-colors">จองโต๊ะ</Link>
        <Link to="/login" className="hover:text-white transition-colors">เข้าสู่ระบบ</Link>
      </div>
      <div className="text-sm text-center">
        <p>เปิดทุกวัน 08:00 – 20:00 น.</p>
        <p className="text-amber-400 text-xs mt-1">© {new Date().getFullYear()} Brew & Chill Cafe</p>
      </div>
    </div>
  </footer>
);

export default Footer;
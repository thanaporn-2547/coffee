import { Outlet, Link } from 'react-router-dom';
import { Coffee, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { formatCurrency } from '../utils/formatCurrency';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const STATIC_SLIDES = [
  {
    title: 'Brew & Chill Cafe',
    subtitle: 'กาแฟดี บรรยากาศชิล เปิดทุกวัน 08:00 – 20:00 น.',
    fact: 'คั่วเมล็ดกาแฟสดทุกวัน จากไร่คัดสรร',
    imageUrl: 'https://loremflickr.com/800/600/coffee-shop,cafe?lock=301',
  },
  {
    title: 'Specialty Coffee',
    subtitle: 'กาแฟสเปเชียลตี้คัดสรรจากทั่วโลก',
    fact: 'Barista ผ่านการอบรมมาตรฐานสากล',
    imageUrl: 'https://69cb788a21aad77cf8fd601d.imgix.net/Specialty-Coffee-378214.png',
  },
  {
    title: 'Chill Space',
    subtitle: 'นั่งทำงาน อ่านหนังสือ หรือพักผ่อน บรรยากาศสบาย',
    fact: 'Wi-Fi ฟรี เต้าปลั๊กทุกโต๊ะ',
    imageUrl: 'https://69cb788a21aad77cf8fd601d.imgix.net/Chill-Space-939717.png',
  },
];

const AuthLayout = () => {
  const [slide, setSlide] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef(null);

  const { data: menuData } = useQuery({
    queryKey: ['auth-menu-slides'],
    queryFn: () => api.get('/menu', { params: { isAvailable: true, limit: 20 } }).then(r => r.data.data),
  });

  const menuItems = (menuData?.items ?? []).filter(i => i.imageUrl);

  const slides = [
    ...STATIC_SLIDES,
    ...menuItems.slice(0, 6).map(item => ({
      title: item.name,
      subtitle: item.description || '',
      price: item.price,
      category: item.category?.name,
      imageUrl: item.imageUrl,
    })),
  ];

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSlide(prev => (prev + 1) % slides.length), 4500);
  };

  useEffect(() => {
    if (slides.length === 0) return;
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [slides.length]);

  const goTo = (i) => {
    if (animating || i === slide) return;
    setAnimating(true);
    setSlide(i);
    startTimer();
    setTimeout(() => setAnimating(false), 600);
  };

  const current = slides[slide] ?? STATIC_SLIDES[0];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        {slides.map((s, i) => (
          <div key={i} className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
            style={{ backgroundImage: `url(${s.imageUrl})`, opacity: i === slide ? 1 : 0, zIndex: i === slide ? 1 : 0 }} />
        ))}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-amber-950/90 via-amber-900/40 to-amber-800/20" />

        <div className="relative z-20 flex flex-col justify-between h-full w-full p-10 min-h-screen">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg">
              <Coffee size={22} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">Brew & Chill</p>
              <p className="text-amber-300 text-xs">Specialty Coffee & Chill</p>
            </div>
          </div>

          {/* Content */}
          <div className={`transition-all duration-500 ${animating ? 'opacity-0 translate-y-6' : 'opacity-100 translate-y-0'}`}>
            {current.category && (
              <span className="inline-block text-xs bg-amber-500/40 border border-amber-400/40 text-amber-200 px-3 py-1 rounded-full mb-3 backdrop-blur-sm">
                {current.category}
              </span>
            )}
            <h2 className="text-4xl font-bold text-white mb-3 leading-tight drop-shadow-lg">{current.title}</h2>
            {current.subtitle && (
              <p className="text-amber-100 text-base leading-relaxed mb-4 max-w-sm">{current.subtitle}</p>
            )}
            {current.price && (
              <p className="text-3xl font-bold text-amber-300 mb-4">{formatCurrency(current.price)}</p>
            )}
            {current.fact && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 w-fit">
                <span className="text-amber-300 text-sm">☕</span>
                <p className="text-white/90 text-sm">{current.fact}</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {slides.map((_, i) => (
                  <button key={i} onClick={() => goTo(i)}
                    className={`rounded-full transition-all duration-300 ${i === slide ? 'w-6 h-2 bg-amber-400' : 'w-2 h-2 bg-white/30 hover:bg-white/60'}`} />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => goTo(slide === 0 ? slides.length - 1 : slide - 1)}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center transition-all backdrop-blur-sm">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => goTo((slide + 1) % slides.length)}
                className="w-10 h-10 rounded-xl bg-amber-600/80 hover:bg-amber-500 border border-amber-400/50 text-white flex items-center justify-center transition-all backdrop-blur-sm">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex flex-col min-h-screen bg-white">
        <div className="flex items-center justify-between px-8 py-5 border-b border-amber-100">
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <Coffee size={20} className="text-amber-700" />
            <span className="font-bold text-amber-900">Brew & Chill</span>
          </Link>
          <Link to="/" className="hidden lg:block text-sm text-gray-500 hover:text-amber-700 transition-colors">
            ← กลับหน้าหลัก
          </Link>
          <div className="flex gap-2 text-sm">
            <Link to="/login" className="px-4 py-2 text-gray-500 hover:text-amber-700 font-medium transition-colors rounded-lg hover:bg-amber-50">
              เข้าสู่ระบบ
            </Link>
            <Link to="/register" className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-medium rounded-lg transition-colors">
              สมัครสมาชิก
            </Link>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-10">
          <div className="w-full max-w-md"><Outlet /></div>
        </div>

        <div className="px-8 py-4 border-t border-amber-100 flex items-center justify-between text-xs text-gray-400">
          <span>© {new Date().getFullYear()} Brew & Chill Cafe</span>
          <div className="flex gap-4">
            <span>☕ 08:00–20:00</span>
            <span>📞 02-123-4567</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
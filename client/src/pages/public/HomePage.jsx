import { Link, useNavigate } from 'react-router-dom';
import { CalendarCheck, Coffee, Clock, ShoppingCart, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import { formatCurrency } from '../../utils/formatCurrency';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const addItem = useCartStore(s => s.addItem);
  const [selectedCat, setSelectedCat] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);

  const features = [
    { icon: CalendarCheck, title: t('home.feature1Title'), desc: t('home.feature1Desc'), color: 'text-amber-700 bg-amber-50' },
    { icon: Coffee, title: t('home.feature2Title'), desc: t('home.feature2Desc'), color: 'text-brown-600 bg-orange-50' },
    { icon: Clock, title: t('home.feature3Title'), desc: t('home.feature3Desc'), color: 'text-green-600 bg-green-50' },
  ];

  const { data: featuredMenuData } = useQuery({
    queryKey: ['hero-menu'],
    queryFn: () => api.get('/menu', { params: { isAvailable: true, limit: 20 } }).then(r => r.data.data),
  });

  const slideshowItems = (featuredMenuData?.items ?? []).filter(i => i.imageUrl);

  useEffect(() => {
    if (slideshowItems.length === 0) return;
    const timer = setInterval(() => setSlideIndex(prev => (prev + 1) % slideshowItems.length), 3000);
    return () => clearInterval(timer);
  }, [slideshowItems.length]);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data.data),
  });

  const activeCatId = selectedCat ?? categories[0]?.id;

  const { data: menuData, isLoading: menuLoading } = useQuery({
    queryKey: ['home-menu', activeCatId],
    queryFn: () => api.get('/menu', { params: { categoryId: activeCatId, isAvailable: true, limit: 8 } }).then(r => r.data.data),
    enabled: !!activeCatId,
  });

  const handleAdd = (item) => {
    if (!isAuthenticated) {
      toast.error('กรุณาเข้าสู่ระบบก่อนสั่งเครื่องดื่ม');
      navigate('/login');
      return;
    }
    addItem(item);
    toast.success(`${item.name} เพิ่มในตะกร้าแล้ว`);
  };

  const currentItem = slideshowItems[slideIndex];

  return (
    <div>
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-amber-900 to-orange-950" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-amber-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-orange-700/10 rounded-full blur-3xl" />

        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <span className="absolute top-16 left-[8%] text-5xl opacity-10 rotate-12">☕</span>
          <span className="absolute top-32 right-[12%] text-6xl opacity-10 -rotate-12">🧋</span>
          <span className="absolute bottom-24 left-[15%] text-5xl opacity-10 rotate-6">🍵</span>
          <span className="absolute bottom-32 right-[8%] text-6xl opacity-10 -rotate-6">🥤</span>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 text-amber-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Coffee size={14} />
                {t('home.badge')}
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                {t('home.title')}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                  {t('home.titleHighlight')}
                </span>
              </h1>
              <p className="text-lg text-amber-100/70 mb-10 max-w-lg leading-relaxed">{t('home.subtitle')}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/reservation"
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-2xl transition-all text-lg shadow-lg shadow-amber-500/30 hover:-translate-y-0.5">
                  {t('home.reserveBtn')}
                </Link>
                <Link to="/menu"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl transition-all text-lg border border-white/10 hover:-translate-y-0.5">
                  {t('home.menuBtn')}
                </Link>
              </div>
              <div className="flex gap-8 mt-12">
                {[{ value: '200+', label: 'Happy Customers' }, { value: '22', label: 'Drinks' }, { value: '4.9★', label: 'Rating' }].map(s => (
                  <div key={s.label}>
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                    <p className="text-xs text-amber-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Slideshow */}
            <div className="hidden lg:flex flex-col items-center gap-5">
              {slideshowItems.length > 0 && currentItem ? (
                <>
                  <div className="relative w-80 h-80 rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 group">
                    <img key={currentItem.id} src={currentItem.imageUrl} alt={currentItem.name}
                      className="w-full h-full object-cover transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <span className="text-xs text-amber-300 font-medium bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                        {currentItem.category?.name}
                      </span>
                      <p className="text-white font-bold text-lg mt-1.5">{currentItem.name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-amber-400 font-bold text-lg">{formatCurrency(currentItem.price)}</span>
                        <button onClick={() => handleAdd(currentItem)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold rounded-xl transition-colors">
                          {isAuthenticated ? <><ShoppingCart size={13} /> สั่ง</> : <><Lock size={13} /> Login</>}
                        </button>
                      </div>
                    </div>
                    <button onClick={() => setSlideIndex(prev => prev === 0 ? slideshowItems.length - 1 : prev - 1)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronLeft size={16} />
                    </button>
                    <button onClick={() => setSlideIndex(prev => (prev + 1) % slideshowItems.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="flex gap-1.5">
                    {slideshowItems.map((_, i) => (
                      <button key={i} onClick={() => setSlideIndex(i)}
                        className={`rounded-full transition-all ${i === slideIndex ? 'w-6 h-2 bg-amber-400' : 'w-2 h-2 bg-white/30 hover:bg-white/50'}`} />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {slideshowItems.slice(0, 5).map((item, i) => (
                      <button key={item.id} onClick={() => setSlideIndex(i)}
                        className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${i === slideIndex ? 'border-amber-400 scale-110' : 'border-white/20 opacity-60 hover:opacity-100'}`}>
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="w-80 h-80 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Coffee size={80} className="text-amber-400 opacity-50" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#fffbeb" />
          </svg>
        </div>
      </section>

      {/* ─── Drinks Menu ──────────────────────────────────── */}
      <section className="py-20 px-4 bg-amber-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-amber-700 font-semibold text-sm uppercase tracking-widest mb-2">Our Signature Drinks</p>
            <h2 className="text-3xl font-bold text-amber-900">{t('menu.title')}</h2>
            <div className="w-16 h-1 bg-amber-500 rounded-full mx-auto mt-3" />
          </div>

          {!isAuthenticated && (
            <div className="flex items-center gap-3 bg-amber-100 border border-amber-300 text-amber-900 px-5 py-3 rounded-2xl mb-8 max-w-2xl mx-auto">
              <Lock size={18} className="text-amber-600 flex-shrink-0" />
              <p className="text-sm">
                กรุณา{' '}
                <Link to="/login" className="font-bold underline hover:text-amber-700">เข้าสู่ระบบ</Link>
                {' '}หรือ{' '}
                <Link to="/register" className="font-bold underline hover:text-amber-700">สมัครสมาชิก</Link>
                {' '}เพื่อสั่งเครื่องดื่ม
              </p>
            </div>
          )}

          <div className="flex gap-2 flex-wrap justify-center mb-8">
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCat(cat.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeCatId === cat.id
                    ? 'bg-amber-700 text-white shadow-md shadow-amber-200'
                    : 'bg-white text-amber-800 border border-amber-200 hover:border-amber-400'
                }`}>
                {cat.name}
              </button>
            ))}
          </div>

          {menuLoading ? <LoadingSpinner className="py-16" size="lg" /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {menuData?.items?.map(item => (
                <div key={item.id}
                  className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 group">
                  <div className="relative h-44 bg-amber-50 overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">☕</div>
                    )}
                    {!isAuthenticated && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2">
                          <Lock size={14} className="text-amber-700" />
                          <span className="text-xs font-semibold text-gray-700">Members only</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-amber-900">{item.name}</h3>
                    {item.description && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-lg font-bold text-amber-700">{formatCurrency(item.price)}</span>
                      {isAuthenticated ? (
                        <button onClick={() => handleAdd(item)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold rounded-xl transition-colors">
                          <ShoppingCart size={14} />
                          {t('menu.add')}
                        </button>
                      ) : (
                        <button onClick={() => { toast.error('กรุณาเข้าสู่ระบบก่อน'); navigate('/login'); }}
                          className="flex items-center gap-1.5 px-3 py-2 bg-amber-100 hover:bg-amber-700 hover:text-white text-amber-700 text-xs font-semibold rounded-xl transition-all">
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

          <div className="text-center mt-10">
            <Link to="/menu"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 border-amber-500 text-amber-700 hover:bg-amber-700 hover:text-white font-semibold rounded-2xl transition-all hover:-translate-y-0.5 shadow-sm">
              <Coffee size={18} />
              ดูเมนูทั้งหมด
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-amber-900">{t('home.whyUs')}</h2>
            <div className="w-16 h-1 bg-amber-500 rounded-full mx-auto mt-3" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="text-center p-8 rounded-2xl border border-amber-100 hover:shadow-lg transition-all hover:-translate-y-1 group">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${color} group-hover:scale-110 transition-transform`}>
                  <Icon size={28} />
                </div>
                <h3 className="font-semibold text-amber-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-amber-900 to-orange-950 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <span className="absolute top-8 left-[10%] text-5xl opacity-10">☕</span>
          <span className="absolute bottom-8 right-[10%] text-5xl opacity-10">🧋</span>
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-3">{t('home.ctaTitle')}</h2>
          <p className="text-amber-200 mb-8">{t('home.ctaDesc')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-2xl transition-all shadow-lg hover:-translate-y-0.5">
              {t('home.ctaBtn')}
            </Link>
            <Link to="/menu"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl transition-all border border-white/20 hover:-translate-y-0.5">
              {t('home.menuBtn')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
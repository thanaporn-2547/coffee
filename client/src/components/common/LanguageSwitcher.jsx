import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const current = i18n.language;

  const languages = [
    { code: 'th', label: 'ไทย', flag: '🇹🇭' },
    { code: 'en', label: 'EN',  flag: 'en' },
  ];

  const toggle = () => {
    const next = current === 'th' ? 'en' : 'th';
    i18n.changeLanguage(next);
    localStorage.setItem('lang', next);
  };

  const currentLang = languages.find(l => l.code === current) ?? languages[0];

  return (
    <button
      onClick={toggle}
      title={current === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
    >
      <span style={{ fontSize: '16px', lineHeight: 1 }}>{currentLang.flag}</span>
      <span>{currentLang.label}</span>
    </button>
  );
};

export default LanguageSwitcher;
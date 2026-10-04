import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
  showIcon?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  className = '',
  showIcon = true 
}) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 ${className}`}>
      {showIcon && (
        <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ml-1.5 mr-1" />
      )}
      <button
        onClick={() => setLanguage('fr')}
        className={`px-2 py-1 rounded text-xs font-bold transition-all ${
          language === 'fr'
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
        title="Français (Cameroun)"
      >
        FR
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 rounded text-xs font-bold transition-all ${
          language === 'en'
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
        title="English (Cameroon)"
      >
        EN
      </button>
    </div>
  );
};

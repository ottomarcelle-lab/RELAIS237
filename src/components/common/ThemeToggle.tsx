import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '',
  showLabel = false 
}) => {
  const { theme, toggleTheme } = useTheme();
  const { language } = useLanguage();

  const isDark = theme === 'dark';
  const label = isDark 
    ? (language === 'fr' ? 'Mode Clair' : 'Light Mode') 
    : (language === 'fr' ? 'Mode Sombre' : 'Dark Mode');

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-800 transition-colors flex items-center gap-1.5 shadow-xs ${className}`}
      title={label}
      aria-label={label}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 animate-in spin-in-180 duration-300" />
      )}
      {showLabel && (
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{label}</span>
      )}
    </button>
  );
};

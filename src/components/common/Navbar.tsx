import React from 'react';
import { 
  Home, 
  PackagePlus, 
  Compass, 
  CreditCard, 
  User, 
  BookOpen, 
  ShieldCheck, 
  MapPin,
  HelpCircle 
} from 'lucide-react';
import { CameroonFlag } from './CameroonFlag';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { useLanguage } from '../../context/LanguageContext';
import { CityCameroon } from '../../types';

export type AppNavDestination = 'home' | 'send' | 'tracking' | 'history' | 'payments' | 'account' | 'kyc' | 'help';

interface NavbarProps {
  currentTab: 'app' | 'architecture';
  onSelectTab: (tab: 'app' | 'architecture') => void;
  activeAppDestination: AppNavDestination;
  onSelectDestination: (dest: AppNavDestination) => void;
  userCity: CityCameroon;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  activeAppDestination,
  onSelectDestination,
  userCity,
}) => {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button 
            onClick={() => {
              onSelectTab('app');
              onSelectDestination('home');
            }}
            className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2 group"
          >
            <img 
              src="/relais237-app-icon.png" 
              alt="RELAIS237 Icon" 
              className="w-8 h-8 rounded-xl shadow-xs border border-emerald-500/40 object-cover group-hover:scale-105 transition-transform" 
            />
            <span>RELAIS237</span>
            <CameroonFlag size="sm" />
          </button>

          {/* Active regions badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t('activeCities')}</span>
          </div>
        </div>

        {/* Zone 2: Navigation destinations */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          {currentTab === 'app' ? (
            <>
              <button
                onClick={() => onSelectDestination('home')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeAppDestination === 'home'
                    ? 'text-emerald-700 dark:text-white bg-emerald-50 dark:bg-slate-800 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                }`}
              >
                <Home className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t('home')}</span>
              </button>

              <button
                onClick={() => onSelectDestination('send')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeAppDestination === 'send'
                    ? 'text-emerald-700 dark:text-white bg-emerald-50 dark:bg-slate-800 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                }`}
              >
                <PackagePlus className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t('send')}</span>
              </button>

              <button
                onClick={() => onSelectDestination('tracking')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeAppDestination === 'tracking'
                    ? 'text-blue-700 dark:text-white bg-blue-50 dark:bg-slate-800 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-blue-500" />
                <span>{t('tracking')}</span>
              </button>

              <button
                onClick={() => onSelectDestination('payments')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeAppDestination === 'payments'
                    ? 'text-amber-700 dark:text-white bg-amber-50 dark:bg-slate-800 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('payments')}</span>
              </button>

              <button
                onClick={() => onSelectDestination('account')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeAppDestination === 'account'
                    ? 'text-purple-700 dark:text-white bg-purple-50 dark:bg-slate-800 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                }`}
              >
                <User className="w-3.5 h-3.5 text-purple-500" />
                <span>{t('account')}</span>
              </button>

              <button
                onClick={() => onSelectDestination('help')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeAppDestination === 'help'
                    ? 'text-teal-700 dark:text-white bg-teal-50 dark:bg-slate-800 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-teal-500" />
                <span>{t('helpCenter')}</span>
              </button>
            </>
          ) : (
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Documentation Système & Modèle de Données
            </span>
          )}
        </nav>

        {/* Zone 3: Theme Toggle + Language Switcher + Architecture Switch */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Day / Night Theme Toggle */}
          <ThemeToggle />

          {/* Bilingual Switcher */}
          <LanguageSwitcher />

          <button
            onClick={() => onSelectTab(currentTab === 'app' ? 'architecture' : 'app')}
            className={`text-xs px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap ${
              currentTab === 'architecture'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 dark:border-slate-800'
            }`}
          >
            {currentTab === 'app' ? (
              <>
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">{t('architecture')}</span>
                <span className="sm:hidden">Doc</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t('backToApp')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { 
  Home, 
  PackagePlus, 
  Compass, 
  CreditCard, 
  User 
} from 'lucide-react';
import { AppNavDestination } from './Navbar';
import { useLanguage } from '../../context/LanguageContext';

interface MobileTabBarProps {
  activeDestination: AppNavDestination;
  onSelectDestination: (dest: AppNavDestination) => void;
  hasActiveDelivery?: boolean;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  activeDestination,
  onSelectDestination,
  hasActiveDelivery,
}) => {
  const { t } = useLanguage();

  const tabs = [
    { id: 'home' as AppNavDestination, label: t('home'), icon: Home },
    { id: 'send' as AppNavDestination, label: t('send'), icon: PackagePlus },
    { id: 'tracking' as AppNavDestination, label: t('tracking').split(' ')[0], icon: Compass, badge: hasActiveDelivery },
    { id: 'payments' as AppNavDestination, label: t('payments'), icon: CreditCard },
    { id: 'account' as AppNavDestination, label: t('account').replace('Mon ', '').replace('My ', ''), icon: User },
  ];


  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 safe-area-bottom transition-colors">
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeDestination === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectDestination(tab.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition-colors relative ${
                isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

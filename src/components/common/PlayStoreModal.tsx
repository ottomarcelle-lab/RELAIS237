import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Smartphone, 
  Star, 
  ShieldCheck, 
  CheckCircle2, 
  Share2, 
  ExternalLink,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { CameroonFlag } from './CameroonFlag';
import { useLanguage } from '../../context/LanguageContext';

interface PlayStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlayStoreModal: React.FC<PlayStoreModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [installState, setInstallState] = useState<'idle' | 'installing' | 'installed'>('idle');

  if (!isOpen) return null;

  const handleInstallApp = () => {
    setInstallState('installing');
    setTimeout(() => {
      setInstallState('installed');
    }, 1800);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-900 dark:text-white">
        
        {/* Play Store Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-emerald-400 fill-current">
              <path d="M3.609 1.814L13.792 12 3.61 22.186a2.036 2.036 0 0 1-.61-1.472V3.286c0-.586.23-1.118.609-1.472zm11.597 11.598l2.253 2.253-11.83 6.83 9.577-9.083zm0-2.824L5.63 1.505l11.829 6.83-2.253 2.253zm1.414 1.414l3.18-1.836a1.442 1.442 0 0 1 0 2.496l-3.18 1.836-1.414-1.414 1.414-1.496z"/>
            </svg>
            <div>
              <span className="text-xs font-black tracking-wide text-white uppercase">Google Play Store</span>
              <p className="text-[10px] text-emerald-300 font-mono">Fiche Officielle & Téléchargement Mobile</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          
          {/* Main App Header with Official Play Store Icon */}
          <div className="flex items-start gap-4">
            <div className="relative shrink-0 group">
              <img 
                src="/relais237-app-icon.png" 
                alt="Icône officielle RELAIS237" 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-xl border-2 border-emerald-500/40 object-cover transform group-hover:scale-105 transition-transform"
              />
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md">
                ✓
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                RELAIS237 : Livraison Colis
              </h2>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                RELAIS237 Express SARL
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                <span>Douala & Yaoundé</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <CameroonFlag size="sm" />
                  <span>Cameroun</span>
                </span>
              </div>

              {/* Badges in header */}
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] rounded-md border border-emerald-200 dark:border-emerald-800">
                  Application Agréée
                </span>
                <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold text-[10px] rounded-md border border-amber-200 dark:border-amber-800">
                  PEGI 3
                </span>
              </div>
            </div>
          </div>

          {/* Stats Bar (Ratings, Downloads, Size) */}
          <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-slate-900 dark:text-white font-black text-sm">
                <span>4.9</span>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">1 240 avis</span>
            </div>

            <div className="border-x border-slate-200 dark:border-slate-800">
              <span className="text-slate-900 dark:text-white font-black text-sm block">10k+</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Téléchargements</span>
            </div>

            <div>
              <span className="text-slate-900 dark:text-white font-black text-sm block">12 Mo</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Android & PWA</span>
            </div>
          </div>

          {/* Action CTA Button */}
          <div>
            {installState === 'idle' && (
              <button
                onClick={handleInstallApp}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Installer sur mon Téléphone Portable</span>
              </button>
            )}

            {installState === 'installing' && (
              <div className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700">
                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span>Téléchargement & Ajout sur l'écran d'accueil...</span>
              </div>
            )}

            {installState === 'installed' && (
              <div className="w-full py-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 text-center animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Application installée ! L'icône est active sur votre téléphone.</span>
              </div>
            )}
          </div>

          {/* Icon Explanation Box */}
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Visuel Officiel Play Store & Écran Mobile</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Cette icône officielle vert émeraude avec le colis ailé doré, le camion express et l'emblème chevron triangulaire du Cameroun est l'image distinctive affichée sur Google Play Store et sur le bureau de votre téléphone.
            </p>
          </div>

          {/* Mobile Home Screen Simulation */}
          <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="relative">
              <img 
                src="/relais237-app-icon.png" 
                alt="App on phone screen" 
                className="w-12 h-12 rounded-xl shadow-md object-cover border border-emerald-500/30"
              />
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full absolute -bottom-0.5 -right-0.5 border border-white dark:border-slate-900" />
            </div>
            <div className="text-[11px]">
              <span className="font-extrabold text-slate-900 dark:text-white block">RELAIS237</span>
              <span className="text-slate-500 dark:text-slate-400 text-[10px]">
                Apparence sur l'écran d'accueil du smartphone
              </span>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center">
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white py-1"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};

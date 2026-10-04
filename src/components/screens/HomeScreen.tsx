import React, { useState, useEffect } from 'react';
import { 
  PackagePlus, 
  Truck, 
  Star, 
  ShieldCheck, 
  MapPin, 
  ChevronRight, 
  ChevronLeft, 
  Receipt, 
  History, 
  CreditCard, 
  User, 
  Award, 
  Clock, 
  Phone, 
  ArrowRight,
  MessageSquare,
  HelpCircle,
  Sparkles,
  Smartphone,
  Download
} from 'lucide-react';
import { Shipment, User as UserType } from '../../types';
import { SAMPLE_CUSTOMER_REVIEWS, TOP_COURIER_OF_MONTH } from '../../data/mockData';
import { CameroonFlag } from '../common/CameroonFlag';
import { useLanguage } from '../../context/LanguageContext';
import { PlayStoreModal } from '../common/PlayStoreModal';

interface HomeScreenProps {
  user: UserType;
  activeShipment?: Shipment;
  onNavigate: (tab: 'home' | 'send' | 'tracking' | 'history' | 'payments' | 'account' | 'help') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  activeShipment,
  onNavigate,
}) => {
  const { t, language } = useLanguage();
  const [showPlayStoreModal, setShowPlayStoreModal] = useState<boolean>(false);

  // Review carousel auto-scroll state
  const [currentReviewIndex, setCurrentReviewIndex] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % SAMPLE_CUSTOMER_REVIEWS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleNextReview = () => {
    setCurrentReviewIndex((prev) => (prev + 1) % SAMPLE_CUSTOMER_REVIEWS.length);
  };

  const handlePrevReview = () => {
    setCurrentReviewIndex((prev) => (prev - 1 + SAMPLE_CUSTOMER_REVIEWS.length) % SAMPLE_CUSTOMER_REVIEWS.length);
  };

  const currentReview = SAMPLE_CUSTOMER_REVIEWS[currentReviewIndex];
  const isShipmentActive = activeShipment && activeShipment.status !== 'delivered';

  const reviewComment = (language === 'en' && currentReview.comment_en) 
    ? currentReview.comment_en 
    : currentReview.comment;

  const reviewDate = (language === 'en' && currentReview.date_en) 
    ? currentReview.date_en 
    : currentReview.date;

  const courierVehicle = (language === 'en' && TOP_COURIER_OF_MONTH.vehicle_en) 
    ? TOP_COURIER_OF_MONTH.vehicle_en 
    : TOP_COURIER_OF_MONTH.vehicle;

  const courierBadgeTitle = (language === 'en' && TOP_COURIER_OF_MONTH.badgeTitle_en) 
    ? TOP_COURIER_OF_MONTH.badgeTitle_en 
    : TOP_COURIER_OF_MONTH.badgeTitle;

  const courierQuote = (language === 'en' && TOP_COURIER_OF_MONTH.testimonialQuote_en) 
    ? TOP_COURIER_OF_MONTH.testimonialQuote_en 
    : TOP_COURIER_OF_MONTH.testimonialQuote;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* 1. Welcome & City Availability Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-white to-emerald-100/40 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-lg relative overflow-hidden transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{t('kycCertifiedBadge')}</span>
              </span>
              <span className="text-slate-400 dark:text-slate-600">·</span>
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{user.city}, Cameroun</span>
              <CameroonFlag size="sm" />
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('welcome')}, {user.firstName} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
              {t('activeZoneDesc')}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 bg-white/90 dark:bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs self-start sm:self-auto shrink-0">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-[11px] leading-tight">
              <span className="font-bold text-slate-900 dark:text-white block">{t('activeZoneBadge')}</span>
              <span className="text-slate-500 dark:text-slate-400">{t('activeZoneDetail')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. GRAND BOUTON PRINCIPAL D'EXPÉDITION */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 transition-all rounded-2xl p-5 sm:p-6 shadow-xl shadow-emerald-950/20 text-white relative overflow-hidden group">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-lg">
            <span className="text-xs font-mono font-bold tracking-wider text-emerald-100 uppercase bg-emerald-800/60 px-2.5 py-0.5 rounded-full inline-block">
              {t('shipCtaTag')}
            </span>
            <h2 className="text-lg sm:text-2xl font-black tracking-tight">
              {t('shipCtaTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-50/90 leading-relaxed">
              {t('shipCtaDesc')}
            </p>
          </div>

          <button
            onClick={() => onNavigate('send')}
            className="px-6 py-3.5 bg-slate-950 hover:bg-slate-900 active:scale-[0.98] text-white font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2.5 shrink-0"
          >
            <PackagePlus className="w-5 h-5 text-emerald-400" />
            <span>{t('shipCtaBtn')}</span>
            <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Active shipment alert (if any ongoing delivery) */}
      {isShipmentActive && activeShipment && (
        <div className="bg-amber-50/80 dark:bg-slate-900 border border-amber-300 dark:border-amber-500/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md transition-colors">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">{activeShipment.trackingCode}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold font-mono">
                  {t('ongoingAlert')}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {t('ongoingDest')} <strong className="text-slate-900 dark:text-white">{activeShipment.recipientAddress.fullName}</strong> ({activeShipment.recipientAddress.neighborhood}, {activeShipment.recipientAddress.city})
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('tracking')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
          >
            <span>{t('trackGpsBtn')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. SECTION : MEILLEUR LIVREUR DU MOIS */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{t('bestCourierTitle')}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('bestCourierSubtitle')}</p>
            </div>
          </div>

          <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
            <span>4.98 / 5.0</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          {/* Courier Card Left */}
          <div className="sm:col-span-1 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-xl font-black">
              JP
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{TOP_COURIER_OF_MONTH.fullName}</h4>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">{courierBadgeTitle}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{courierVehicle}</p>
            </div>
            <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-100/80 dark:bg-emerald-950/50 py-1 px-2 rounded">
              {t('verifiedHelmetBadge')}
            </div>
          </div>

          {/* Courier Metrics & Quote Right */}
          <div className="sm:col-span-2 space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">684</span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{t('successfulTrips')}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">99.4%</span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{t('punctuality')}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-base font-extrabold text-amber-600 dark:text-amber-400 font-mono">0</span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{t('packageIncidents')}</p>
              </div>
            </div>

            <div className="bg-slate-50/80 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800/60 text-xs text-slate-700 dark:text-slate-300 italic">
              {courierQuote}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              <span>{t('operatesOn')} <strong className="text-slate-800 dark:text-white">{t('operatesOnDetail')}</strong></span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">{t('courierAvailableToday')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SECTION : CARROUSEL DES AVIS CLIENTS (DÉFILEMENT DYNAMIQUE) */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{t('customerReviewsTitle')}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('customerReviewsSubtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevReview}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors"
              title="Précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 px-1">
              {currentReviewIndex + 1}/{SAMPLE_CUSTOMER_REVIEWS.length}
            </span>
            <button
              onClick={handleNextReview}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors"
              title="Suivant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Testimonial Card */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-slate-800 border border-emerald-300 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center text-xs">
                {currentReview.authorName.charAt(0)}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{currentReview.authorName}</h4>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                  <MapPin className="w-3 h-3 text-rose-500" />
                  <span>{currentReview.neighborhood}, {currentReview.city}</span>
                  <span>·</span>
                  <span>{reviewDate}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-0.5">
              {[...Array(currentReview.rating)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed italic">
            « {reviewComment} »
          </p>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-900 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono">
              <ShieldCheck className="w-3 h-3" />
              <span>{t('verifiedDeliveryTag')} #{currentReview.verifiedDeliveryCode}</span>
            </span>
            <span className="font-mono text-slate-400 dark:text-slate-500">{t('doubleValidationSuccessTag')}</span>
          </div>
        </div>

        {/* Small bullets indicators */}
        <div className="flex justify-center gap-1.5 pt-1">
          {SAMPLE_CUSTOMER_REVIEWS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentReviewIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentReviewIndex ? 'w-6 bg-emerald-500' : 'w-2 bg-slate-200 dark:bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 5. QUICK NAVIGATION SHORTCUTS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigate('send')}
          className="p-3.5 bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-left space-y-1.5 transition-all shadow-xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <PackagePlus className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white block">{t('quickSend')}</span>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">{t('quickSendSub')}</p>
        </button>

        <button
          onClick={() => onNavigate('history')}
          className="p-3.5 bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-left space-y-1.5 transition-all shadow-xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <History className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white block">{t('quickHistory')}</span>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">{t('quickHistorySub')}</p>
        </button>

        <button
          onClick={() => onNavigate('payments')}
          className="p-3.5 bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-left space-y-1.5 transition-all shadow-xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CreditCard className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white block">{t('quickPayments')}</span>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">{t('quickPaymentsSub')}</p>
        </button>

        <button
          onClick={() => onNavigate('account')}
          className="p-3.5 bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-left space-y-1.5 transition-all shadow-xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <User className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white block">{t('quickAccount')}</span>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">{t('quickAccountSub')}</p>
        </button>
      </div>

      {/* 6. CENTRE D'ASSISTANCE & SUPPORT WHATSAPP (DOUALA & YAOUNDÉ) */}
      <div 
        onClick={() => onNavigate('help')}
        className="cursor-pointer bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 hover:from-emerald-500/20 hover:to-teal-500/15 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-sm group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-5 h-5 fill-[#25D366]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {language === 'fr' ? 'Besoin d\'aide ? FAQ & Support WhatsApp' : 'Need help? FAQs & WhatsApp Support'}
              </h3>
              <span className="text-[10px] font-bold bg-[#25D366]/20 text-emerald-700 dark:text-[#25D366] px-2 py-0.5 rounded-full border border-[#25D366]/30">
                Douala & Yaoundé
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {language === 'fr' 
                ? 'Conseillers dédiés disponibles 7j/7 par WhatsApp ou formulaire en ligne.'
                : 'Dedicated support agents available 7d/7 via WhatsApp or online ticket.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 self-end sm:self-auto shrink-0 group-hover:translate-x-1 transition-transform">
          <span>{language === 'fr' ? 'Ouvrir le Centre d\'Aide' : 'Open Help Center'}</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* 7. APPLICATION MOBILE & GOOGLE PLAY STORE (ICÔNE OFFICIELLE) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-2xl p-5 border border-slate-700/80 shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="relative shrink-0 group">
            <img 
              src="/relais237-app-icon.png" 
              alt="Icône Officielle RELAIS237" 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shadow-xl border-2 border-emerald-400/50 object-cover group-hover:scale-105 transition-transform" 
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-md">
              ✓
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/90 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Google Play & Android</span>
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="font-bold text-white">4.9</span> (1.2k avis)
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-black text-white mt-1">
              {language === 'fr' 
                ? 'Icône Officielle sur Play Store & Téléphone' 
                : 'Official Icon on Play Store & Mobile'}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 max-w-md">
              {language === 'fr'
                ? 'Retrouvez ce visuel officiel pour installer RELAIS237 directement sur l\'écran d\'accueil de votre smartphone.'
                : 'Look for this official app icon to install RELAIS237 directly onto your smartphone home screen.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowPlayStoreModal(true)}
          className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 relative z-10"
        >
          <Smartphone className="w-4 h-4" />
          <span>{language === 'fr' ? 'Fiche Play Store & Installer' : 'Play Store Listing & Install'}</span>
        </button>
      </div>

      {/* Play Store Download & Install Modal */}
      <PlayStoreModal 
        isOpen={showPlayStoreModal} 
        onClose={() => setShowPlayStoreModal(false)} 
      />

    </div>
  );
};

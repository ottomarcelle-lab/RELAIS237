import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  MessageSquare, 
  Share2, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  AlertCircle, 
  KeyRound, 
  Truck, 
  UserCheck, 
  ExternalLink,
  Lock,
  ArrowRight,
  History,
  Receipt,
  Compass,
  Star,
  ThumbsUp,
  Send,
  Radio,
  Zap,
  ShieldAlert,
  Bike,
  Activity,
  Sliders,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { Shipment, ShipmentStatus } from '../../types';
import { SAMPLE_PAST_SHIPMENTS } from '../../data/mockData';
import { CameroonFlag } from '../common/CameroonFlag';
import { ShipmentHistoryView } from './ShipmentHistoryView';
import { ReceiptModal } from './ReceiptModal';
import { useLanguage } from '../../context/LanguageContext';
import { usePermissions } from '../../context/PermissionsContext';

interface TrackingDashboardScreenProps {
  shipment: Shipment;
  onOpenValidationModal: () => void;
  isDelivered: boolean;
}

export const TrackingDashboardScreen: React.FC<TrackingDashboardScreenProps> = ({
  shipment,
  onOpenValidationModal,
  isDelivered,
}) => {
  const { t, language } = useLanguage();
  const { requestPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState<'live' | 'history'>('live');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedMatricule, setCopiedMatricule] = useState<boolean>(false);
  const [showSimulationControls, setShowSimulationControls] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [selectedReceiptShipment, setSelectedReceiptShipment] = useState<Shipment | null>(null);
  const [gpsCenteredToast, setGpsCenteredToast] = useState<boolean>(false);
  
  // Post-delivery rating state
  const [ratingStars, setRatingStars] = useState<number>(shipment.rating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [ratingComment, setRatingComment] = useState<string>(shipment.ratingComment || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Ponctualité irréprochable', 'Colis intact']);
  const [isRatingSubmitted, setIsRatingSubmitted] = useState<boolean>(!!shipment.rating);
  const [submittedRatingData, setSubmittedRatingData] = useState<{ stars: number; comment: string; tags: string[] } | null>(
    shipment.rating ? { stars: shipment.rating, comment: shipment.ratingComment || '', tags: ['Ponctualité'] } : null
  );

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) => 
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedRatingData({
      stars: ratingStars,
      comment: ratingComment,
      tags: selectedTags
    });
    setIsRatingSubmitted(true);
  };
  
  // Simulated courier GPS animation along delivery route (progress 0 to 100)
  const [progressPercent, setProgressPercent] = useState<number>(isDelivered ? 100 : 72);

  // Dynamic Distance & ETA Calculation based on Driver Movement
  const totalLegKm = shipment.distanceKm || (shipment.pickupAddress?.city !== shipment.recipientAddress?.city ? 245 : 12.8);
  const remainingDistanceKm = isDelivered 
    ? 0 
    : Math.max(0.1, Number(((100 - progressPercent) / 100 * totalLegKm).toFixed(2)));
  const liveSpeedKmh = isDelivered ? 0 : (remainingDistanceKm < 0.6 ? 18 : 34);
  const etaMinutes = isDelivered 
    ? 0 
    : Math.max(1, Math.round((remainingDistanceKm / liveSpeedKmh) * 60));
  const remainingDistanceText = isDelivered
    ? '0 km'
    : remainingDistanceKm >= 1
      ? `${remainingDistanceKm.toFixed(1)} km`
      : `${Math.round(remainingDistanceKm * 1000)} m`;

  const dynamicEtaDisplay = isDelivered
    ? (language === 'fr' ? 'Colis Livré & Validé' : 'Delivered & Confirmed')
    : remainingDistanceKm <= 0.35
      ? (language === 'fr' ? 'Arrivée imminente (~1 à 2 min)' : 'Arriving now (~1-2 min)')
      : `~${etaMinutes} min`;

  const getArrivalClockTime = (mins: number) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + mins);
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleCenterGps = async () => {
    const granted = await requestPermission('location');
    if (granted) {
      setGpsCenteredToast(true);
      setTimeout(() => setGpsCenteredToast(false), 2500);
      // simulate quick forward bump
      if (!isDelivered) {
        setProgressPercent((prev) => Math.min(94, Number((prev + 2.5).toFixed(1))));
      }
    }
  };

  const handleStepSimulation = () => {
    setProgressPercent((prev) => {
      if (prev >= 94) return 30; // loop back
      return Math.min(94, Number((prev + 8).toFixed(1)));
    });
  };

  // Continuous background driver progression towards recipient
  useEffect(() => {
    if (isDelivered) {
      setProgressPercent(100);
      return;
    }
    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 94) return 94; // waits for explicit delivery confirmation handshake
        return Number((prev + 1.2).toFixed(1));
      });
    }, 3200);
    return () => clearInterval(interval);
  }, [isDelivered]);

  const trackingCode = shipment.trackingCode || 'R237-8849-DLA';
  const deliveryPin = shipment.deliveryPin || '5824';
  const recipientName = shipment.recipientAddress.fullName;
  const recipientPhone = shipment.recipientAddress.phone;
  const landmark = shipment.recipientAddress.landmark;
  const courierName = shipment.courierName || 'Jean-Paul Etoa';
  const courierPhone = shipment.courierPhone || '+237 675 22 11 00';
  const courierVehicle = shipment.courierVehicle || 'Moto Boxer 150cc - LT 742 BX';

  // Driver license plate (Matricule officiel) - guaranteed un-truncated in full
  const courierMatricule = (
    shipment.courierMatricule 
    || shipment.courierVehicle?.match(/([A-Z]{2}\s?\d{3,4}\s?[A-Z]{1,2})/i)?.[1]
    || (shipment.pickupAddress?.city === 'Yaoundé' ? 'CE 412 BK' : 'LT 892 AK')
  ).toUpperCase().trim();

  const courierPhotoUrl = shipment.courierName?.includes('Kamga')
    ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    : shipment.courierName?.includes('Ibrahim') || shipment.courierName?.includes('Nana')
      ? 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80';

  // Build the complete list of history shipments
  const allPastShipments: Shipment[] = isDelivered 
    ? [
        {
          ...shipment,
          status: 'delivered',
          deliveredAt: new Date().toISOString(),
          receiptNumber: `REC-237-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${shipment.id.slice(-4)}`
        },
        ...SAMPLE_PAST_SHIPMENTS
      ]
    : SAMPLE_PAST_SHIPMENTS;

  const shareText = language === 'fr' 
    ? `Bonjour ${recipientName}, votre colis RELAIS237 est en cours de livraison par ${courierName} (${courierPhone}) !
📦 Code d'expédition : *${trackingCode}*
🔑 Code PIN secret de décharge : *${deliveryPin}*
📍 Destination : ${landmark}
⚠️ Important : Ne communiquez ce code PIN qu'après avoir inspecté le colis intact remis par le livreur.
Suivi direct : https://relais237.cm/track/${trackingCode}`
    : `Hello ${recipientName}, your RELAIS237 parcel is currently out for delivery with ${courierName} (${courierPhone})!
📦 Shipment code: *${trackingCode}*
🔑 Secret release PIN: *${deliveryPin}*
📍 Destination: ${landmark}
⚠️ Important: Only provide this secret PIN after inspecting the undamaged package handed over by the courier.
Live tracking: https://relais237.cm/track/${trackingCode}`;

  const copyToClipboard = (text: string, type: 'code' | 'link' | 'matricule') => {
    navigator.clipboard?.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else if (type === 'matricule') {
      setCopiedMatricule(true);
      setTimeout(() => setCopiedMatricule(false), 2000);
    }
  };

  return (
    <div className="p-4 sm:p-5 max-w-lg mx-auto w-full flex-1 flex flex-col justify-between space-y-4">
      {/* Top Segmented Navigation: Live Tracking vs History & Receipts */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <button
          onClick={() => setActiveTab('live')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'live'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>{t('liveTrackingTab')}</span>
          {!isDelivered && (
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping ml-0.5" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>{t('historyReceiptsTab')}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
            {allPastShipments.length}
          </span>
        </button>
      </div>

      {/* TAB 1: LIVE TRACKING VIEW */}
      {activeTab === 'live' && (
        <div className="space-y-4 flex-1 flex flex-col justify-between">
          {/* Top Bar with Tracking Code and Live Status */}
          <div className="bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs transition-colors">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">{t('trackingCodeLabel')}</span>
                <CameroonFlag size="sm" />
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">{trackingCode}</span>
                <button
                  onClick={() => copyToClipboard(trackingCode, 'code')}
                  className="text-slate-400 hover:text-emerald-500 transition-colors"
                  title={t('copyCode')}
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t('currentStatus')}</span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                isDelivered 
                  ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30' 
                  : 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30 animate-pulse'
              }`}>
                {isDelivered ? <CheckCircle2 className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                <span>{isDelivered ? t('packageDeliveredStatus') : t('outForDelivery')}</span>
              </span>
            </div>
          </div>

          {/* DYNAMIC ESTIMATED TIME OF ARRIVAL (ETA) BADGE - UPDATES BASED ON DISTANCE TO USER */}
          <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 dark:from-emerald-700 dark:via-teal-800 dark:to-slate-900 text-white rounded-2xl p-4 shadow-lg border border-emerald-400/40 relative overflow-hidden transition-all space-y-3">
            {/* Ambient visual badge background pulse */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-20 h-20 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

            {/* Header: Live Radar Tracking Status & Live Speed */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/20">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  {!isDelivered && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                  )}
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-100 flex items-center gap-1.5">
                  <Radio className={`w-3.5 h-3.5 ${!isDelivered ? 'animate-pulse text-emerald-200' : 'text-emerald-300'}`} />
                  <span>{t('dynamicEtaBadgeTitle')}</span>
                </span>
              </div>

              {/* Speed & Activity Badge */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold bg-emerald-950/60 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1 font-mono">
                  <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                  <span>{isDelivered ? '0 km/h' : `${liveSpeedKmh} km/h`}</span>
                </span>
                <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-xs">
                  {isDelivered ? t('packageDeliveredStatus') : (language === 'fr' ? 'En mouvement' : 'In motion')}
                </span>
              </div>
            </div>

            {/* Main Focal Row: Big Dynamic ETA Badge & Real-Time Distance to User Location */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <span className="text-[10px] text-emerald-100 font-semibold uppercase tracking-wide block">
                  {language === 'fr' ? 'Temps estimé avant arrivée (ETA) :' : 'Estimated time of arrival (ETA):'}
                </span>
                <div className="flex items-baseline flex-wrap gap-2 mt-0.5">
                  <div className="inline-flex items-center gap-1.5 bg-white text-slate-950 px-3 py-1 rounded-xl shadow-md border-2 border-emerald-300 font-black">
                    <Clock className="w-4 h-4 text-emerald-600 animate-spin" style={{ animationDuration: '10s' }} />
                    <span className="text-xl sm:text-2xl font-mono tracking-tight text-slate-900">
                      {dynamicEtaDisplay}
                    </span>
                  </div>

                  {!isDelivered && (
                    <span className="text-[11px] text-emerald-100 font-mono font-medium">
                      (~{getArrivalClockTime(etaMinutes)})
                    </span>
                  )}
                </div>
              </div>

              {/* Dynamic Distance to User's Location Box */}
              <div className="text-right bg-black/25 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 shrink-0">
                <span className="text-[9px] text-emerald-200 uppercase tracking-wide block font-semibold">
                  {language === 'fr' ? 'Distance du chauffeur :' : 'Driver distance:'}
                </span>
                <span className="text-lg sm:text-xl font-black font-mono text-white block">
                  {remainingDistanceText}
                </span>
                <span className="text-[9px] text-emerald-100 block">
                  {language === 'fr' ? 'de votre position' : 'from your location'}
                </span>
              </div>
            </div>

            {/* Dynamic Visual Route Progress Bar */}
            <div className="pt-2 border-t border-white/15 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-emerald-100 font-mono">
                <span className="flex items-center gap-1">
                  <Bike className="w-3 h-3 text-amber-300" />
                  <span>{language === 'fr' ? 'Départ du chauffeur' : 'Driver en route'}</span>
                </span>
                <span className="font-bold text-white bg-black/30 px-1.5 py-0.2 rounded">
                  {isDelivered ? '100%' : `${progressPercent.toFixed(0)}% ${t('routeProgressPercent')}`}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-300" />
                  <span>{language === 'fr' ? 'Votre adresse' : 'Your location'}</span>
                </span>
              </div>
              
              <div className="relative w-full h-2.5 bg-black/30 rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-amber-300 via-emerald-200 to-white rounded-full transition-all duration-700 ease-out shadow-xs"
                  style={{ width: `${Math.min(100, Math.max(5, progressPercent))}%` }}
                />
              </div>
            </div>

            {/* Interactive Dynamic Simulation Toolbar (Allows live testing of distance updates) */}
            {!isDelivered && (
              <div className="pt-2 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                <div className="flex items-center gap-1 text-emerald-100">
                  <Sliders className="w-3 h-3 text-amber-300" />
                  <span className="font-semibold">{language === 'fr' ? 'Test dynamique distance :' : 'Live distance simulator:'}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setProgressPercent(prev => Math.min(94, Number((prev + 8).toFixed(1))))}
                    className="px-2 py-1 bg-white/20 hover:bg-white/30 active:scale-95 text-white rounded-md text-[10px] font-bold transition-all shadow-xs"
                    title={language === 'fr' ? 'Faire approcher le chauffeur de 1 km' : 'Move driver 1 km closer'}
                  >
                    {t('simulateApproach')}
                  </button>

                  <button
                    onClick={() => setProgressPercent(92.5)}
                    className="px-2 py-1 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 rounded-md text-[10px] font-black transition-all shadow-xs"
                    title={language === 'fr' ? 'Simuler une arrivée imminente à 300m' : 'Simulate arrival in 300m'}
                  >
                    {t('simulateImminent')}
                  </button>

                  <button
                    onClick={() => setProgressPercent(35)}
                    className="px-1.5 py-1 bg-white/10 hover:bg-white/20 active:scale-95 text-emerald-100 rounded-md text-[10px] transition-all"
                    title={t('resetDistance')}
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Cameroon Geolocation Map Component */}
          <div className="relative w-full h-56 bg-slate-900 dark:bg-slate-950 rounded-2xl border border-slate-300 dark:border-slate-800 overflow-hidden shadow-inner">
            {/* SVG Styled Vector Map of Douala / Wouri Estuary */}
            <svg viewBox="0 0 400 240" className="w-full h-full object-cover">
              {/* Background Grid & River Wouri */}
              <rect width="400" height="240" fill="#090d16" />
              
              {/* Subtle map grid */}
              <path d="M 0,40 L 400,40 M 0,80 L 400,80 M 0,120 L 400,120 M 0,160 L 400,160 M 0,200 L 400,200" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
              <path d="M 80,0 L 80,240 M 160,0 L 160,240 M 240,0 L 240,240 M 320,0 L 320,240" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />

              {/* Fleuve Wouri representation */}
              <path 
                d="M 0,160 Q 90,130 140,150 T 260,200 T 400,180 L 400,240 L 0,240 Z" 
                fill="#0f172a" 
                opacity="0.8" 
              />
              <text x="30" y="210" fill="#475569" fontSize="9" fontFamily="sans-serif">{t('wouriRiverLabel')}</text>

              {/* Major Urban Arteries (Boulevards de Douala) */}
              <path d="M 50,130 L 120,95 L 210,80 L 340,40" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
              <path d="M 120,95 L 140,170" stroke="#1e293b" strokeWidth="2.5" />
              {/* Rond-point Deïdo / Axe Lourd */}
              <circle cx="210" cy="80" r="4" fill="#475569" />
              <text x="180" y="70" fill="#94a3b8" fontSize="7" fontFamily="sans-serif">{t('deidoRoundaboutLabel')}</text>

              {/* Delivery Route Trajectory (Animated Dash) */}
              <path 
                id="courierRoute"
                d="M 60,125 Q 140,85 210,80 T 330,45" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="3.5" 
                strokeLinecap="round"
                strokeDasharray="4 4"
              />

              {/* Start Point: Akwa (Sender) */}
              <circle cx="60" cy="125" r="5" fill="#10b981" />
              <circle cx="60" cy="125" r="1.5" fill="#ffffff" />
              <text x="45" y="142" fill="#94a3b8" fontSize="8" fontWeight="bold">Départ Akwa</text>

              {/* Relay Point: Saker Deïdo (Checkpoint) */}
              <circle cx="160" cy="88" r="3.5" fill="#f59e0b" />
              <text x="135" y="103" fill="#fbbf24" fontSize="7">Hub Relais Saker</text>

              {/* Destination Point: Bonamoussadi Carrefour Nelson Mandela */}
              <circle cx="330" cy="45" r="7" fill="#ef4444" opacity="0.3" className="animate-ping" />
              <circle cx="330" cy="45" r="5" fill="#ef4444" />
              <circle cx="330" cy="45" r="1.5" fill="#ffffff" />
              <text x="270" y="32" fill="#f87171" fontSize="8" fontWeight="bold">Bonamoussadi (Dest.)</text>

              {/* Dynamic Motorcycle Courier Marker along route */}
              <g transform={`translate(${60 + (progressPercent / 100) * 270}, ${125 - (progressPercent / 100) * 80})`}>
                {/* Courier Radar Pulse */}
                <circle cx="0" cy="0" r="12" fill="#10b981" opacity="0.2" className="animate-pulse" />
                <circle cx="0" cy="0" r="7" fill="#10b981" />
                {/* Direction Arrow */}
                <polygon points="-3,-3 5,0 -3,3" fill="#ffffff" />
              </g>
            </svg>

            {/* Floating Telemetry Box on Map */}
            <div className="absolute top-2 left-2 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-700/80 text-[10px] space-y-0.5 text-white">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Navigation className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
                <span>{t('gpsLiveTitle')}</span>
              </div>
              <div className="text-slate-300 font-mono text-[9px]">
                {isDelivered 
                  ? (language === 'fr' ? 'Arrivé à destination' : 'Arrived at destination') 
                  : (language === 'fr' ? `Vitesse : ${liveSpeedKmh} km/h · ETA ~${etaMinutes} min` : `Speed: ${liveSpeedKmh} km/h · ETA ~${etaMinutes} min`)}
              </div>
            </div>

            {/* Top Right GPS Permission & Locate Button */}
            <div className="absolute top-2 right-2 flex items-center gap-1.5">
              {gpsCenteredToast && (
                <span className="bg-emerald-600 text-white text-[9px] font-mono px-2 py-1 rounded-md shadow-md animate-in fade-in">
                  {language === 'fr' ? 'Position GPS actualisée !' : 'GPS Location centered!'}
                </span>
              )}
              <button
                onClick={handleCenterGps}
                className="bg-slate-900/90 hover:bg-slate-800 text-white px-2 py-1.5 rounded-lg border border-slate-700/80 text-[10px] flex items-center gap-1 transition-colors shadow-xs"
                title="Actualiser ma position GPS (ACCESS_FINE_LOCATION)"
              >
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-[9px] hidden sm:inline">GPS Live</span>
              </button>
            </div>

            {/* Courier mini card overlay with visible plate */}
            <div className="absolute bottom-2 left-2 right-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Bike className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{courierName}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[130px]">{courierVehicle}</span>
                    <span className="px-1.5 py-0.2 bg-amber-300 text-slate-950 font-mono font-black text-[9px] rounded border border-slate-900 whitespace-nowrap">
                      {courierMatricule}
                    </span>
                  </div>
                </div>
              </div>
              <a
                href={`tel:${courierPhone}`}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors shadow-xs"
              >
                <Phone className="w-3 h-3" />
                <span>{t('callCourier')}</span>
              </a>
            </div>
          </div>

          {/* DEDICATED CARD: CHAUFFEUR DÉPÊCHÉ POUR RÉCUPÉRER LE COLIS - MATRICULE BIEN VISIBLE EN ENTIER */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-amber-400/90 rounded-2xl p-4 shadow-md space-y-3.5 transition-colors">
            {/* Header: Title & Dispatched Badge */}
            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700/80 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0 shadow-xs">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {t('dispatchedDriverPickupTitle')}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {t('dispatchedDriverPickupSubtitle')}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800 shrink-0 flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                <span>{language === 'fr' ? 'Dépêché & Agréé' : 'Dispatched'}</span>
              </span>
            </div>

            {/* PROMINENT OFFICIAL CAMEROON LICENSE PLATE (MATRICULE BIEN VISIBLE EN ENTIER) */}
            <div className="bg-slate-50 dark:bg-slate-950/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t('fullPlateVisibleLabel')}</span>
                </span>
                <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400">
                  {language === 'fr' ? 'Plaque d\'immatriculation CMR' : 'CMR License Plate'}
                </span>
              </div>

              {/* Authentic High-Contrast Cameroon Vehicle Registration Plate */}
              <div className="bg-amber-300 dark:bg-amber-400 border-[3px] border-slate-950 rounded-xl px-4 py-3 shadow-md flex items-center justify-between gap-3 transition-transform hover:scale-[1.01]">
                {/* Left: CMR Emblem & National Flag */}
                <div className="flex items-center gap-2 pr-3 border-r-2 border-slate-950/40 shrink-0">
                  <CameroonFlag size="sm" />
                  <span className="font-mono text-xs sm:text-sm font-black text-slate-950 tracking-wider">CMR</span>
                </div>

                {/* Center: Full Un-truncated Matricule in Large Bold Monospace Font */}
                <div className="flex-1 text-center min-w-0">
                  <span className="block text-2xl sm:text-3xl font-black font-mono tracking-widest text-slate-950 select-all whitespace-nowrap drop-shadow-xs">
                    {courierMatricule}
                  </span>
                  <span className="text-[9px] font-bold text-slate-800 uppercase tracking-widest block -mt-0.5">
                    {language === 'fr' ? '★ Matricule Entier Vérifié ★' : '★ Full Verified Registration ★'}
                  </span>
                </div>

                {/* Right: Copy Button */}
                <button
                  onClick={() => copyToClipboard(courierMatricule, 'matricule')}
                  className="pl-2.5 py-1 text-slate-900 hover:text-emerald-800 transition-colors flex items-center gap-1 text-[10px] font-bold shrink-0"
                  title={language === 'fr' ? 'Copier le matricule entier' : 'Copy full registration plate'}
                >
                  {copiedMatricule ? (
                    <span className="flex items-center gap-1 text-emerald-900 font-extrabold text-[10px] bg-emerald-200/80 px-2 py-0.5 rounded">
                      <Check className="w-3.5 h-3.5" />
                      <span>{language === 'fr' ? 'Copié' : 'Copied'}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-950 hover:bg-amber-200 px-2 py-0.5 rounded transition-colors text-[10px]">
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{t('copyCode')}</span>
                    </span>
                  )}
                </button>
              </div>

              {/* Strict Security Instruction Warning */}
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-lg p-2.5 flex items-start gap-2 text-[10px] text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  <strong className="font-bold">{language === 'fr' ? 'Contrôle obligatoire : ' : 'Mandatory check: '}</strong>
                  {language === 'fr'
                    ? `Avant de confier ou décharger votre colis, exigez de vérifier que la moto du livreur porte scrupuleusement la plaque entière "${courierMatricule}". Ne remettez aucun colis sans cette vérification.`
                    : `Before releasing or receiving your parcel, always ensure that the courier's motorcycle bears the exact full plate "${courierMatricule}".`}
                </p>
              </div>
            </div>

            {/* Driver Identity, Photo & Contact Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <div className="relative shrink-0">
                  <img
                    src={courierPhotoUrl}
                    alt={courierName}
                    className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {courierName}
                    </p>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded font-mono">
                      ★ 4.9/5
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    {courierVehicle}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {courierPhone}
                  </p>
                </div>
              </div>

              {/* Call & WhatsApp Actions */}
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <a
                  href={`tel:${courierPhone}`}
                  className="flex-1 sm:flex-none px-3 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{t('callCourier')}</span>
                </a>

                <a
                  href={`https://wa.me/${courierPhone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
                    language === 'fr'
                      ? `Bonjour ${courierName}, je suis le client pour le colis ${trackingCode}. Je confirme votre venue avec la moto matricule ${courierMatricule}.`
                      : `Hello ${courierName}, I am the customer for parcel ${trackingCode}. Confirming your arrival with motorcycle plate ${courierMatricule}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none px-3 py-2 bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1da850] text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  title="Contacter le chauffeur sur WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-slate-950" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Security Code & PIN Box (Double check) */}
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-3.5 space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <KeyRound className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('securityPinSection')}</span>
              </div>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                {language === 'fr' ? 'Double Validation' : 'Double Handshake'}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
              {t('securityPinDesc')}
            </p>

            {/* Code Blocks */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white dark:bg-slate-900/90 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-center shadow-xs">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">{t('sharedCodeLabel')}</span>
                <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white">{trackingCode}</span>
              </div>
              <div className="bg-white dark:bg-slate-900/90 p-2.5 rounded-lg border border-amber-300 dark:border-amber-500/30 text-center shadow-xs">
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block mb-0.5">{t('secretPinLabel')}</span>
                <span className="font-mono text-base font-extrabold text-amber-600 dark:text-amber-400 tracking-wider">{deliveryPin}</span>
              </div>
            </div>

            {/* WhatsApp Share Button */}
            <button
              onClick={() => setShowShareModal(true)}
              className="w-full py-2 bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1da850] text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 fill-slate-950" />
              <span>{t('shareViaWhatsApp')}</span>
            </button>
          </div>

          {/* Recipient Details & Repère camerounais */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs transition-colors">
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">{recipientName} · {recipientPhone}</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 font-medium">{landmark}</p>
              </div>
            </div>
          </div>

          {/* Bottom CTA: Remise en main propre ou consultation du reçu */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            {!isDelivered ? (
              <button
                onClick={onOpenValidationModal}
                className="w-full h-11 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-800 dark:border-slate-700 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{t('simulateDeliveryHandshake')}</span>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="w-full py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-xl text-center text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{language === 'fr' ? 'Colis Remis et Code Validé sans contestation' : 'Package Delivered & Code Verified with zero dispute'}</span>
                </div>

                {/* POST-DELIVERY RATING CARD (1-5 Stars + Feedback) */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span>{t('deliveryRatingTitle')}</span>
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {t('deliveryRatingSubtitle')}
                      </p>
                    </div>
                    {isRatingSubmitted && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        {language === 'fr' ? 'Avis enregistré' : 'Review recorded'}
                      </span>
                    )}
                  </div>

                  {/* Stars Selector */}
                  <div className="flex items-center justify-center gap-1.5 py-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = (hoverRating || ratingStars) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          disabled={isRatingSubmitted}
                          onMouseEnter={() => !isRatingSubmitted && setHoverRating(star)}
                          onMouseLeave={() => !isRatingSubmitted && setHoverRating(0)}
                          onClick={() => setRatingStars(star)}
                          className="p-1 transition-transform active:scale-125 disabled:cursor-default"
                        >
                          <Star 
                            className={`w-7 h-7 transition-colors ${
                              isFilled 
                                ? 'text-amber-400 fill-amber-400 drop-shadow-xs' 
                                : 'text-slate-300 dark:text-slate-700'
                            }`} 
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Rating Label Text */}
                  <p className="text-center text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    {ratingStars === 5 && (language === 'fr' ? '⭐⭐⭐⭐⭐ Excellent service ! Livreur exemplaire.' : '⭐⭐⭐⭐⭐ Outstanding service! Exemplary courier.')}
                    {ratingStars === 4 && (language === 'fr' ? '⭐⭐⭐⭐ Très bien ! Rapide et efficace.' : '⭐⭐⭐⭐ Very good! Fast and reliable.')}
                    {ratingStars === 3 && (language === 'fr' ? '⭐⭐⭐ Correct dans l\'ensemble.' : '⭐⭐⭐ Fair overall.')}
                    {ratingStars === 2 && (language === 'fr' ? '⭐⭐ Décevant, quelques retards.' : '⭐⭐ Disappointing, delays noted.')}
                    {ratingStars === 1 && (language === 'fr' ? '⭐ Insatisfait du service.' : '⭐ Unsatisfied with service.')}
                  </p>

                  {!isRatingSubmitted ? (
                    <form onSubmit={handleSubmitRating} className="space-y-2.5 pt-1">
                      {/* Compliment Chips */}
                      <div className="flex flex-wrap items-center justify-center gap-1.5">
                        {[
                          'Ponctualité irréprochable',
                          'Colis intact & scellé',
                          'Chauffeur courtois',
                          'Bien orienté au quartier',
                          'Code PIN respecté'
                        ].map((tag) => {
                          const isSelected = selectedTags.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleToggleTag(tag)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                                isSelected
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                              }`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>

                      {/* Text Comment */}
                      <input
                        type="text"
                        value={ratingComment}
                        onChange={(e) => setRatingComment(e.target.value)}
                        placeholder={t('commentPlaceholder')}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                      />

                      <button
                        type="submit"
                        className="w-full py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{t('submitRatingBtn')}</span>
                      </button>
                    </form>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                      <p className="text-[11px] text-slate-700 dark:text-slate-300 italic">
                        "{ratingComment || (language === 'fr' ? 'Livraison rapide et sécurisée sans problème.' : 'Quick and secure delivery.')}"
                      </p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {selectedTags.map((tag) => (
                          <span key={tag} className="text-[9px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 px-1.5 py-0.2 rounded font-medium">
                            ✓ {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedReceiptShipment(shipment)}
                  className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
                >
                  <Receipt className="w-4 h-4" />
                  <span>{t('viewDeliveryReceipt')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SHIPMENTS HISTORY & RECEIPTS VIEW */}
      {activeTab === 'history' && (
        <div className="flex-1 flex flex-col justify-between">
          <ShipmentHistoryView
            pastShipments={allPastShipments}
            onSelectReceipt={(shp) => setSelectedReceiptShipment(shp)}
          />
        </div>
      )}

      {/* WHATSAPP SHARE MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-sm rounded-2xl p-4 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-slate-950 fill-slate-950" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {language === 'fr' ? 'Partage WhatsApp Sécurisé' : 'Secure WhatsApp Sharing'}
                </h4>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold px-2 py-1"
              >
                {t('close')}
              </button>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              {language === 'fr' ? 'Message pré-rédigé pour' : 'Pre-filled message for'} <span className="font-semibold text-slate-900 dark:text-white">{recipientName}</span> (+237 {recipientPhone}) :
            </p>

            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
              {shareText}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => copyToClipboard(shareText, 'link')}
                className="flex-1 py-2 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? t('codeCopied') : (language === 'fr' ? 'Copier texte' : 'Copy text')}</span>
              </button>

              <a
                href={`https://wa.me/237${recipientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 text-xs bg-[#25D366] hover:bg-[#20ba59] text-slate-950 rounded-lg font-bold flex items-center justify-center gap-1.5 shadow-md"
              >
                <MessageSquare className="w-3.5 h-3.5 fill-slate-950" />
                <span>{language === 'fr' ? 'Ouvrir WhatsApp' : 'Open WhatsApp'}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL DIGITAL RECEIPT MODAL */}
      {selectedReceiptShipment && (
        <ReceiptModal
          shipment={selectedReceiptShipment}
          isOpen={!!selectedReceiptShipment}
          onClose={() => setSelectedReceiptShipment(null)}
        />
      )}
    </div>
  );
};

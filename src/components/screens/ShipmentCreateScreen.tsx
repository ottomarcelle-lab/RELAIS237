import React, { useState, useRef } from 'react';
import { 
  Package, 
  MapPin, 
  Phone, 
  User, 
  Camera, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Scale, 
  DollarSign, 
  Info, 
  Compass, 
  FileCheck2,
  Contact,
  Image as ImageIcon,
  Truck,
  Building2,
  Bike,
  Clock,
  ShieldCheck,
  Check,
  Navigation,
  Calculator,
  ArrowLeftRight,
  Minus,
  Plus,
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
  Zap
} from 'lucide-react';
import { CITIES_CAMEROON, NEIGHBORHOODS_DOUALA, NEIGHBORHOODS_YAOUNDE } from '../../data/mockData';
import { AppContact, CityCameroon, ParcelDetails, Shipment } from '../../types';
import { CameroonFlag } from '../common/CameroonFlag';
import { ContactsPickerModal } from '../common/ContactsPickerModal';
import { useLanguage } from '../../context/LanguageContext';
import { usePermissions } from '../../context/PermissionsContext';

interface ShipmentCreateScreenProps {
  onShipmentCreated: (shipmentData: Partial<Shipment>) => void;
  senderCity: CityCameroon;
}

export const ShipmentCreateScreen: React.FC<ShipmentCreateScreenProps> = ({
  onShipmentCreated,
  senderCity = 'Douala',
}) => {
  const { t, language } = useLanguage();
  const { requestPermission } = usePermissions();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Pick-up and Destination Cities State (Interactive Route & Distance)
  const [pickupCity, setPickupCity] = useState<CityCameroon>(senderCity || 'Douala');
  const [recipientCity, setRecipientCity] = useState<CityCameroon>(
    senderCity === 'Douala' ? 'Yaoundé' : 'Douala'
  );

  // 2. Pickup Mode State (Enlèvement à domicile vs Dépôt en agence)
  const [pickupMode, setPickupMode] = useState<'home' | 'agency'>('home');
  const [senderNeighborhood, setSenderNeighborhood] = useState<string>(
    pickupCity === 'Douala' ? 'Akwa' : 'Bastos'
  );
  const [senderLandmark, setSenderLandmark] = useState<string>(
    pickupCity === 'Douala' 
      ? 'Rue Joss, face Direction Générale Orange, portail noir'
      : 'Carrefour Bastos, à côté de la Station Tradex, portail vert'
  );
  const [selectedDropoffAgency, setSelectedDropoffAgency] = useState<string>(
    pickupCity === 'Douala'
      ? 'Agence Centrale Akwa - Boulevard de la Liberté (Face Activa)'
      : 'Agence Centrale Bastos - Avenue Rosa Parks (Face Ambassade USA)'
  );

  // Dispatched Driver details when home pickup is chosen (adapted to pickupCity)
  const dispatchedDriver = pickupCity === 'Douala' ? {
    name: 'Ibrahim Nana',
    vehicle: 'Moto Boxer 150cc · Plaque LT 892 AK',
    phone: '+237 674 882 109',
    eta: '15 à 25 minutes',
    rating: 4.95,
    deliveries: 1240,
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
  } : {
    name: 'Jean-Paul Kamga',
    vehicle: 'Moto Haojue 125cc · Plaque CE 412 BK',
    phone: '+237 699 441 028',
    eta: '15 à 25 minutes',
    rating: 4.92,
    deliveries: 980,
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  };

  // 3. Recipient form state
  const [recipientName, setRecipientName] = useState('Marie-Claire Biya');
  const [recipientPhone, setRecipientPhone] = useState('699143829');
  const [neighborhood, setNeighborhood] = useState(recipientCity === 'Douala' ? 'Bonamoussadi' : 'Bastos');
  const [landmark, setLandmark] = useState('Carrefour Nelson Mandela, face Boulangerie Saker, portail bleu');
  const [useGpsCoordinates, setUseGpsCoordinates] = useState<boolean>(true);
  const [latitude, setLatitude] = useState<number>(4.0885);
  const [longitude, setLongitude] = useState<number>(9.7360);

  // Contacts picker modal state
  const [isContactsModalOpen, setIsContactsModalOpen] = useState<boolean>(false);
  const [contactPickedToast, setContactPickedToast] = useState<string | null>(null);

  // 4. Parcel details & Weight state
  const [parcelCategory, setParcelCategory] = useState<'documents' | 'electronics' | 'clothing' | 'food_dry' | 'medicine' | 'other'>('documents');
  const [weightKg, setWeightKg] = useState<number>(3.0);
  const [description, setDescription] = useState('Dossier de documents notariés + boîte de vitamines scellée');
  const [estimatedValueXaf, setEstimatedValueXaf] = useState<number>(35000);
  
  // Mandatory parcel photo & safety inspection
  const [parcelPhoto, setParcelPhoto] = useState<string>('/src/assets/images/parcel_photo_cameroon_1791064170034.jpg');
  const [prohibitedItemsConfirmed, setProhibitedItemsConfirmed] = useState<boolean>(true);
  const [isPhotoInspected, setIsPhotoInspected] = useState<boolean>(true);

  // 5. Interactive Route & Distance Calculator calculations
  const isInterCity = pickupCity !== recipientCity;
  const distanceKm = isInterCity ? 245 : 15; // 245 km sur la N3 Axe Lourd Douala - Yaoundé, ou ~15 km en intra-ville

  // Base transport rate calculation rules:
  // Intercity (245 km): 2 500 FCFA for first 2 kg + 200 FCFA per extra kg
  // Intracity (15 km): 1 000 FCFA for first 1 kg + 150 FCFA per extra kg
  const baseIncludedKg = isInterCity ? 2 : 1;
  const baseRate = isInterCity ? 2500 : 1000;
  const perExtraKgRate = isInterCity ? 200 : 150;
  const extraKg = Math.max(0, Number((weightKg - baseIncludedKg).toFixed(1)));
  const extraWeightFee = Math.round(extraKg * perExtraKgRate);
  const baseTransportRate = baseRate + extraWeightFee;

  // Home pickup fee (500 FCFA si enlèvement à domicile par chauffeur moto, 0 FCFA si dépôt agence)
  const homePickupFee = pickupMode === 'home' ? 500 : 0;

  // Assurance (0.5% de la valeur déclarée)
  const insuranceFee = Math.round(estimatedValueXaf * 0.005);

  // Total final TTC
  const totalAmount = baseTransportRate + homePickupFee + insuranceFee;

  // Swap pick-up city and destination city
  const handleSwapCities = () => {
    const nextPickup = recipientCity;
    const nextDest = pickupCity;
    setPickupCity(nextPickup);
    setRecipientCity(nextDest);
    setSenderNeighborhood(nextPickup === 'Douala' ? 'Akwa' : 'Bastos');
    setSenderLandmark(
      nextPickup === 'Douala'
        ? 'Rue Joss, face Direction Générale Orange, portail noir'
        : 'Carrefour Bastos, à côté de la Station Tradex, portail vert'
    );
    setSelectedDropoffAgency(
      nextPickup === 'Douala'
        ? 'Agence Centrale Akwa - Boulevard de la Liberté (Face Activa)'
        : 'Agence Centrale Bastos - Avenue Rosa Parks (Face Ambassade USA)'
    );
    setNeighborhood(nextDest === 'Douala' ? 'Bonamoussadi' : 'Bastos');
  };

  const handleStepWeight = (delta: number) => {
    setWeightKg((prev) => {
      const next = Math.max(0.5, Math.min(50, Number((prev + delta).toFixed(1))));
      return next;
    });
  };

  const getWeightCategory = (kg: number) => {
    if (kg <= 3) return { label: language === 'fr' ? 'Colis Léger' : 'Light Parcel', color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800' };
    if (kg <= 10) return { label: language === 'fr' ? 'Colis Moyen' : 'Medium Parcel', color: 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/80 border-blue-300 dark:border-blue-800' };
    if (kg <= 25) return { label: language === 'fr' ? 'Colis Lourd' : 'Heavy Load', color: 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-800' };
    return { label: language === 'fr' ? 'Fret Spécial' : 'Special Freight', color: 'text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/80 border-purple-300 dark:border-purple-800' };
  };

  // Cameroonian realistic parcel presets
  const PARCEL_PRESETS = [
    { name: language === 'fr' ? '📄 Documents CNI' : '📄 Docs / ID', kg: 0.5, val: 10000, cat: 'documents' as const, desc: 'Enveloppe scellée A4, documents légaux' },
    { name: language === 'fr' ? '📱 Téléphone' : '📱 Smartphone', kg: 1.5, val: 95000, cat: 'electronics' as const, desc: 'Téléphone dans sa boîte scellée' },
    { name: language === 'fr' ? '📦 Carton Vêtements' : '📦 Clothes Box', kg: 3.0, val: 35000, cat: 'clothing' as const, desc: 'Carton moyen de vêtements et chaussures' },
    { name: language === 'fr' ? '🍲 Vivres du pays' : '🍲 Foodstuffs', kg: 8.0, val: 25000, cat: 'food_dry' as const, desc: 'Vivres secs, bâtons de manioc, épices' },
    { name: language === 'fr' ? '🧰 Sac Équipement' : '🧰 Equipment Load', kg: 15.0, val: 60000, cat: 'other' as const, desc: 'Matériel lourd et outillage professionnel' },
  ];

  const handleApplyPreset = (preset: typeof PARCEL_PRESETS[0]) => {
    setWeightKg(preset.kg);
    setEstimatedValueXaf(preset.val);
    setParcelCategory(preset.cat);
    setDescription(preset.desc);
  };

  const handlePhoneCarrier = (phoneNum: string) => {
    if (phoneNum.startsWith('67') || phoneNum.startsWith('68')) return 'MTN MoMo';
    if (phoneNum.startsWith('69') || phoneNum.startsWith('65')) return 'Orange Money';
    return 'Mobile 237';
  };

  const handlePickFromContacts = async () => {
    const granted = await requestPermission('contacts');
    if (granted) {
      setIsContactsModalOpen(true);
    }
  };

  const handleSelectContact = (contact: AppContact) => {
    setRecipientName(contact.name);
    setRecipientPhone(contact.phone);
    setRecipientCity(contact.city);
    setNeighborhood(contact.neighborhood);
    setLandmark(contact.landmark);
    setContactPickedToast(contact.name);
    setTimeout(() => setContactPickedToast(null), 3000);
  };

  const handleTriggerPhoto = async () => {
    const granted = await requestPermission('camera');
    if (granted) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setParcelPhoto(URL.createObjectURL(file));
      setIsPhotoInspected(true);
    }
  };

  const handleToggleGps = async () => {
    if (!useGpsCoordinates) {
      const granted = await requestPermission('location');
      if (granted) {
        setUseGpsCoordinates(true);
      }
    } else {
      setUseGpsCoordinates(false);
    }
  };

  const handleValidateOrder = () => {
    // Generate unique tracking code e.g. "R237-8849-DLA"
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const citySuffix = recipientCity === 'Douala' ? 'DLA' : 'YDE';
    const trackingCode = `R237-${randomDigits}-${citySuffix}`;
    const deliveryPin = Math.floor(1000 + Math.random() * 9000).toString();

    onShipmentCreated({
      trackingCode,
      deliveryPin,
      pickupMode,
      pickupFeeXaf: homePickupFee,
      distanceKm,
      weightKg,
      courierName: pickupMode === 'home' ? dispatchedDriver.name : 'Chauffeur Navette Relais',
      courierVehicle: pickupMode === 'home' ? dispatchedDriver.vehicle : 'Fourgonnette Express Axe Lourd (Plaque LT 742 BX)',
      courierMatricule: pickupMode === 'home' ? (pickupCity === 'Douala' ? 'LT 892 AK' : 'CE 412 BK') : 'LT 742 BX',
      courierPhone: pickupMode === 'home' ? dispatchedDriver.phone : '+237 670 237 001',
      pickupAddress: {
        fullName: 'Expéditeur Client',
        phone: '+237 674 892 210',
        city: pickupCity,
        neighborhood: senderNeighborhood,
        landmark: pickupMode === 'home' ? senderLandmark : selectedDropoffAgency,
        latitude: pickupCity === 'Douala' ? 4.0511 : 3.8480,
        longitude: pickupCity === 'Douala' ? 9.7679 : 11.5021
      },
      recipientAddress: {
        fullName: recipientName,
        phone: '+237 ' + recipientPhone,
        city: recipientCity,
        neighborhood,
        landmark,
        latitude,
        longitude
      },
      parcel: {
        category: parcelCategory,
        weightCategory: weightKg <= 3 ? 'light' : weightKg <= 10 ? 'medium' : 'heavy',
        description,
        parcelPhotoUrl: parcelPhoto,
        isInspectedForContraband: isPhotoInspected,
        prohibitedItemsConfirmed,
        estimatedValueXaf
      },
      priceXaf: baseTransportRate,
      insuranceFeeXaf: insuranceFee,
      totalXaf: totalAmount,
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto w-full flex-1 flex flex-col justify-between bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl transition-colors">
      <div className="space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{t('newShipmentTitle')}</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('newShipmentSubtitle')}</p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
            {t('step1of2')}
          </span>
        </div>

        {/* SECTION 1: MODE DE PRISE EN CHARGE DU COLIS (DOMICILE vs AGENCE) */}
        <div className="space-y-3 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Truck className="w-4 h-4 text-emerald-500" />
              <span>{t('pickupModeTitle')}</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {pickupMode === 'home' ? '+500 FCFA' : '0 FCFA Gratuit'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Option A: Enlèvement à domicile */}
            <button
              type="button"
              onClick={() => setPickupMode('home')}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                pickupMode === 'home'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/30 text-emerald-900 dark:text-emerald-100'
                  : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Bike className="w-4 h-4" />
                </div>
                {pickupMode === 'home' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">{t('pickupHome')}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {t('pickupHomeDesc')}
                </p>
              </div>
            </button>

            {/* Option B: Dépôt en agence */}
            <button
              type="button"
              onClick={() => setPickupMode('agency')}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                pickupMode === 'agency'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/30 text-emerald-900 dark:text-emerald-100'
                  : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                {pickupMode === 'agency' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">{t('pickupAgency')}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {t('pickupAgencyDesc')}
                </p>
              </div>
            </button>
          </div>

          {/* DÉPÊCHEMENT DU CHAUFFEUR CHEZ LE CLIENT SI ENLÈVEMENT À DOMICILE */}
          {pickupMode === 'home' ? (
            <div className="p-3 bg-white dark:bg-slate-950 border border-emerald-300 dark:border-emerald-800/60 rounded-xl space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                    {t('dispatchedDriverTitle')}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  {dispatchedDriver.eta}
                </span>
              </div>

              {/* Courier info card */}
              <div className="flex items-center gap-3">
                <img 
                  src={dispatchedDriver.photoUrl} 
                  alt={dispatchedDriver.name} 
                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shrink-0" 
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {dispatchedDriver.name}
                    </p>
                    <span className="text-[10px] text-amber-500 font-bold">★ {dispatchedDriver.rating}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-mono truncate">
                    {dispatchedDriver.vehicle}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                    {dispatchedDriver.phone} (MTN)
                  </p>
                </div>
              </div>

              {/* Saisie de l'adresse de collecte chez l'expéditeur */}
              <div className="pt-1 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-0.5">
                      {t('originCityLabel')}
                    </label>
                    <select
                      value={pickupCity}
                      onChange={(e) => {
                        const newCity = e.target.value as CityCameroon;
                        setPickupCity(newCity);
                        setSenderNeighborhood(newCity === 'Douala' ? 'Akwa' : 'Bastos');
                        setSenderLandmark(
                          newCity === 'Douala' 
                            ? 'Rue Joss, face Direction Générale Orange, portail noir'
                            : 'Carrefour Bastos, à côté de la Station Tradex, portail vert'
                        );
                        setSelectedDropoffAgency(
                          newCity === 'Douala'
                            ? 'Agence Centrale Akwa - Boulevard de la Liberté (Face Activa)'
                            : 'Agence Centrale Bastos - Avenue Rosa Parks (Face Ambassade USA)'
                        );
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-xs"
                    >
                      <option value="Douala">Douala (Littoral)</option>
                      <option value="Yaoundé">Yaoundé (Centre)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-0.5">
                      Quartier de départ *
                    </label>
                    <input
                      type="text"
                      value={senderNeighborhood}
                      onChange={(e) => setSenderNeighborhood(e.target.value)}
                      placeholder="Ex: Akwa, Bonanjo..."
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-0.5">
                    Repère précis chez vous (pour le chauffeur moto) *
                  </label>
                  <input
                    type="text"
                    value={senderLandmark}
                    onChange={(e) => setSenderLandmark(e.target.value)}
                    placeholder="Ex: Face Boulangerie, Carrefour, portail..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  {t('agencySelectLabel')} ({pickupCity})
                </label>
                <button
                  type="button"
                  onClick={handleSwapCities}
                  className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-mono"
                  title="Inverser les villes"
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  <span>{pickupCity === 'Douala' ? 'Vers Yaoundé' : 'Vers Douala'}</span>
                </button>
              </div>
              <select
                value={selectedDropoffAgency}
                onChange={(e) => setSelectedDropoffAgency(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                {pickupCity === 'Douala' ? (
                  <>
                    <option value="Agence Centrale Akwa - Boulevard de la Liberté (Face Activa)">
                      Douala · Agence Centrale Akwa (Boulevard de la Liberté, face Activa)
                    </option>
                    <option value="Agence Bonamoussadi - Rond-Point Carrefour Saker">
                      Douala · Agence Bonamoussadi (Rond-Point Saker)
                    </option>
                    <option value="Agence Bonapriso - Rue Njo-Njo (Près Clinique)">
                      Douala · Agence Bonapriso (Rue Njo-Njo)
                    </option>
                    <option value="Agence Deïdo - Rond-point Deïdo">
                      Douala · Agence Deïdo (Rond-point Deïdo)
                    </option>
                  </>
                ) : (
                  <>
                    <option value="Agence Centrale Bastos - Avenue Rosa Parks (Face Ambassade USA)">
                      Yaoundé · Agence Centrale Bastos (Face Ambassade USA)
                    </option>
                    <option value="Agence Mokolo - Carrefour Marché Mokolo">
                      Yaoundé · Agence Mokolo (Carrefour Marché)
                    </option>
                    <option value="Agence Omnisports - Face Stade Ahmadou Ahidjo">
                      Yaoundé · Agence Omnisports (Face Stade)
                    </option>
                    <option value="Agence Biyem-Assi - Rond-Point Express">
                      Yaoundé · Agence Biyem-Assi (Rond-Point Express)
                    </option>
                  </>
                )}
              </select>
              <p className="text-[10px] text-slate-500">
                Déposez votre colis scellé muni de votre code de suivi. Ouvert de 07h30 à 19h30.
              </p>
            </div>
          )}
        </div>

        {/* SECTION 2: DESTINATAIRE & CONTACTS ANDROID */}
        <div className="space-y-3 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <User className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t('recipientSection')}</span>
            </div>

            {/* Android Contacts Picker CTA */}
            <button
              type="button"
              onClick={handlePickFromContacts}
              className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              title="android.permission.READ_CONTACTS"
            >
              <Contact className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{language === 'fr' ? 'Contacts SIM/Tél' : 'Address Book'}</span>
            </button>
          </div>

          {contactPickedToast && (
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-lg text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Contact <strong>{contactPickedToast}</strong> importé avec succès !</span>
              </span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">{t('recipientNameLabel')}</label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Ex: Marie-Claire Biya"
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">{t('destCityLabel')}</label>
              <select
                value={recipientCity}
                onChange={(e) => setRecipientCity(e.target.value as CityCameroon)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-xs"
              >
                {CITIES_CAMEROON.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block mt-1 font-mono">
                {isInterCity ? `🛣️ Axe Lourd N3 (${distanceKm} km)` : `🛵 Intra-urbain (~${distanceKm} km)`}
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300">{t('recipientPhoneLabel')}</label>
                <span className="text-[9px] text-amber-500 font-mono">{handlePhoneCarrier(recipientPhone)}</span>
              </div>
              <div className="flex items-center">
                <span className="bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-300 dark:border-slate-700 rounded-l-lg px-2 py-2 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                  +237
                </span>
                <input
                  type="tel"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                  placeholder="699 14 38 29"
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-r-lg px-2.5 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Repère camerounais du destinataire */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-500" />
                <span>{t('landmarkLabel')}</span>
              </label>
              <button
                type="button"
                onClick={handleToggleGps}
                className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                title="android.permission.ACCESS_FINE_LOCATION"
              >
                <Compass className="w-3 h-3" />
                <span>{useGpsCoordinates ? `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : t('useGpsCoords')}</span>
              </button>
            </div>
            
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="Ex: Face Boulangerie Saker, portail bleu, carrefour..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
            />
            <p className="text-[10px] text-slate-500 mt-1">{t('landmarkHint')}</p>
          </div>
        </div>

        {/* SECTION 3: PHOTO DU COLIS & POIDS AU KILO RÉEL */}
        <div className="space-y-3 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Camera className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t('parcelPhotoSection')}</span>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              {t('visualVerified')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-24 h-20 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 shrink-0 relative group">
              <img
                src={parcelPhoto}
                alt="Photo Colis Inspecté"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <FileCheck2 className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                {t('parcelPhotoHint')}
              </p>
              
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleTriggerPhoto}
                  className="px-2.5 py-1 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t('retakePhoto')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Saisie précise du poids au kilo pour le client camerounais lambda */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t('weightInKgLabel')}</span>
              </label>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded">
                {weightKg} kg
              </span>
            </div>

            {/* Quick Kg buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[1, 2, 3, 5, 10, 15, 20].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWeightKg(w)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-colors shrink-0 ${
                    weightKg === w
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {w} kg
                </button>
              ))}
            </div>

            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {t('weightInKgHelp')} : {isInterCity ? 'Base 2 500 FCFA (2 kg) + 200 FCFA/kg supp' : 'Base 1 000 FCFA (1 kg) + 150 FCFA/kg supp'}
            </p>
          </div>

          {/* Avertissement produits illégaux */}
          <div className="bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800/60 space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-800 dark:text-amber-300">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{t('prohibitedWarningTitle')}</span>
            </div>
            <p className="text-[10px] leading-tight text-amber-800/90 dark:text-amber-200/90">
              {t('prohibitedWarningDesc')}
            </p>
            <label className="flex items-start gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={prohibitedItemsConfirmed}
                onChange={(e) => setProhibitedItemsConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-slate-400 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-700 dark:text-slate-200 font-medium leading-tight">
                {t('prohibitedCheckbox')}
              </span>
            </label>
          </div>
        </div>

        {/* SECTION 4: CALCULATEUR INTERACTIF DE COÛT (POIDS EN KG & DISTANCE TRAJET) */}
        <div className="bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/40 border-2 border-emerald-500/40 dark:border-emerald-600/50 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm dark:shadow-xl transition-all">
          
          {/* Header with Calculator icon */}
          <div className="flex items-center justify-between pb-3 border-b border-emerald-200/70 dark:border-emerald-800/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{t('interactiveCalculatorTitle')}</span>
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {t('interactiveCalculatorSubtitle')}
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-[10px] text-emerald-700 dark:text-emerald-300 font-mono font-bold">
              <Sparkles className="w-3 h-3 text-emerald-500 animate-pulse" />
              <span>{language === 'fr' ? 'Temps réel' : 'Live'}</span>
            </div>
          </div>

          {/* 1. Interactive Cities & Distance Route Module */}
          <div className="bg-white dark:bg-slate-950 p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t('routeDistanceTitle')}</span>
              </span>
              <button
                type="button"
                onClick={handleSwapCities}
                className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-semibold flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 border border-emerald-200 dark:border-emerald-800 transition-colors"
                title={t('swapCitiesBtn')}
              >
                <ArrowLeftRight className="w-3 h-3" />
                <span>{t('swapCitiesBtn')}</span>
              </button>
            </div>

            {/* City departure & destination cards */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Départ (Enlèvement)</span>
                  <CameroonFlag size="sm" />
                </div>
                <select
                  value={pickupCity}
                  onChange={(e) => {
                    const newCity = e.target.value as CityCameroon;
                    setPickupCity(newCity);
                    setSenderNeighborhood(newCity === 'Douala' ? 'Akwa' : 'Bastos');
                  }}
                  className="w-full bg-white dark:bg-slate-950 font-bold text-xs text-slate-900 dark:text-white rounded-lg px-2 py-1 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Douala">Douala (Littoral)</option>
                  <option value="Yaoundé">Yaoundé (Centre)</option>
                </select>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Arrivée (Destination)</span>
                  <CameroonFlag size="sm" />
                </div>
                <select
                  value={recipientCity}
                  onChange={(e) => {
                    const newCity = e.target.value as CityCameroon;
                    setRecipientCity(newCity);
                    setNeighborhood(newCity === 'Douala' ? 'Bonamoussadi' : 'Bastos');
                  }}
                  className="w-full bg-white dark:bg-slate-950 font-bold text-xs text-slate-900 dark:text-white rounded-lg px-2 py-1 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Douala">Douala (Littoral)</option>
                  <option value="Yaoundé">Yaoundé (Centre)</option>
                </select>
              </div>
            </div>

            {/* Distance and Route Badge Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg border border-emerald-200 dark:border-emerald-800 text-[11px]">
              <div className="flex items-center gap-1.5 font-medium text-emerald-900 dark:text-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isInterCity ? t('interCityRouteDesc') : t('intraCityRouteDesc')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  {distanceKm} km
                </span>
                <span className="text-[10px] text-slate-600 dark:text-slate-300 font-mono">
                  {isInterCity ? '⏱️ 4h - 6h' : '⏱️ 35 - 45 min'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Interactive Weight Adjuster & Slider */}
          <div className="bg-white dark:bg-slate-950 p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800 dark:text-slate-200">
                <Scale className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t('weightAdjusterTitle')}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getWeightCategory(weightKg).color}`}>
                {getWeightCategory(weightKg).label}
              </span>
            </div>

            {/* Stepper + Number Input + Value display */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleStepWeight(-0.5)}
                  disabled={weightKg <= 0.5}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold text-sm transition-colors"
                  title="-0.5 kg"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1">
                  <input
                    type="number"
                    min="0.5"
                    max="50"
                    step="0.5"
                    value={weightKg}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0.5;
                      setWeightKg(Math.max(0.5, Math.min(50, val)));
                    }}
                    className="w-12 bg-transparent text-center font-mono font-extrabold text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                  <span className="text-xs font-bold text-slate-500 font-mono">kg</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleStepWeight(0.5)}
                  disabled={weightKg >= 50}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold text-sm transition-colors"
                  title="+0.5 kg"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{language === 'fr' ? 'Supplément poids' : 'Extra weight fee'}</span>
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {extraKg > 0 ? `+${extraWeightFee} FCFA (${extraKg} kg × ${perExtraKgRate})` : 'Inclus (0 FCFA)'}
                </span>
              </div>
            </div>

            {/* Smooth Interactive Range Slider */}
            <div className="space-y-1">
              <input
                type="range"
                min="0.5"
                max="30"
                step="0.5"
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
              />
              <div className="flex justify-between text-[9px] text-slate-600 dark:text-slate-300 font-mono">
                <span>0.5 kg</span>
                <span>5 kg</span>
                <span>10 kg</span>
                <span>20 kg</span>
                <span>30 kg</span>
              </div>
            </div>

            {/* Quick Kg Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5">
              {[0.5, 1, 2, 3, 5, 8, 10, 15, 20, 25, 30].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWeightKg(w)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold transition-all shrink-0 ${
                    weightKg === w
                      ? 'bg-emerald-600 text-white shadow-xs scale-105'
                      : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {w} kg
                </button>
              ))}
            </div>

            {/* Cameroonian realistic presets */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block">
                {t('popularPresetsTitle')}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PARCEL_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="px-2 py-1 rounded-md text-[10px] bg-slate-100 hover:bg-emerald-50 dark:bg-slate-900 dark:hover:bg-slate-800 hover:border-emerald-300 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-all flex items-center gap-1"
                  >
                    <span>{p.name}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">({p.kg} kg)</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Detailed Cost Breakdown Formula (Table) */}
          <div className="bg-slate-50/90 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
              <span>{t('rateFormulaTitle')}</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">{isInterCity ? 'Axe Lourd N3' : 'Intra-ville'}</span>
            </div>

            {/* Line 1: Base Transit */}
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span>
                Trajet {pickupCity} ➔ {recipientCity} ({distanceKm} km · forfait {baseIncludedKg} kg) :
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{baseRate} FCFA</span>
            </div>

            {/* Line 2: Weight Surcharge */}
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span>
                Supplément poids au-delà de {baseIncludedKg} kg ({extraKg > 0 ? `${extraKg} kg × ${perExtraKgRate} FCFA/kg` : 'Aucun'}) :
              </span>
              <span className={`font-mono font-bold ${extraWeightFee > 0 ? 'text-slate-900 dark:text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {extraWeightFee > 0 ? `+${extraWeightFee} FCFA` : 'Inclus (0 FCFA)'}
              </span>
            </div>

            {/* Line 3: Pickup mode fee */}
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1">
                {pickupMode === 'home' ? <Bike className="w-3.5 h-3.5 text-emerald-500" /> : <Building2 className="w-3.5 h-3.5 text-blue-500" />}
                <span>
                  {pickupMode === 'home' ? 'Chauffeur moto dépêché à domicile' : 'Dépôt par vos soins en agence'} :
                </span>
              </span>
              <span className={`font-mono font-bold ${homePickupFee > 0 ? 'text-slate-900 dark:text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {homePickupFee > 0 ? `+${homePickupFee} FCFA` : t('freeDropoff')}
              </span>
            </div>

            {/* Line 4: Insurance fee */}
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Assurance marchandise (0.5% de {estimatedValueXaf.toLocaleString()} FCFA) :</span>
              <span className="font-mono">{insuranceFee} FCFA</span>
            </div>
          </div>

          {/* 4. Grand Total Box Before Final Order Submission */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-800 text-white rounded-xl p-4 shadow-md flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-emerald-100 uppercase tracking-wider font-semibold block">
                {t('totalToPay')} (Tarif Populaire Garanti)
              </span>
              <div className="text-2xl font-black font-mono tracking-tight flex items-baseline gap-1">
                <span>{totalAmount.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')}</span>
                <span className="text-xs font-normal text-emerald-200">FCFA</span>
              </div>
              <p className="text-[10px] text-emerald-100/90 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-300" />
                <span>{t('guaranteedRateNotice')}</span>
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-emerald-200 block">{t('estimatedTime')}</span>
              <span className="text-xs font-bold text-white font-mono bg-emerald-800/80 px-2 py-1 rounded-lg border border-emerald-400/30 block mt-0.5">
                {isInterCity ? '4h à 6h (N3)' : '35 à 45 min'}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Action Button: Final Order Submission */}
      <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={handleValidateOrder}
          disabled={!recipientName || !recipientPhone || !prohibitedItemsConfirmed}
          className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group"
        >
          <span>{t('proceedToPayment')} ({totalAmount.toLocaleString()} FCFA)</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Contacts Picker Modal */}
      <ContactsPickerModal
        isOpen={isContactsModalOpen}
        onClose={() => setIsContactsModalOpen(false)}
        onSelectContact={handleSelectContact}
      />
    </div>
  );
};

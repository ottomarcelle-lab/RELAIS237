import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Calendar, 
  FileCheck2, 
  MessageSquare, 
  History, 
  CreditCard, 
  LogOut, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Lock,
  Globe,
  Sun,
  Moon,
  Camera,
  Contact,
  Image as ImageIcon,
  Settings,
  Smartphone,
  Code,
  Copy,
  Check,
  RotateCcw,
  Play,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AndroidPermissionType, CityCameroon, User as UserType } from '../../types';
import { CameroonFlag } from '../common/CameroonFlag';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { ThemeToggle } from '../common/ThemeToggle';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { usePermissions } from '../../context/PermissionsContext';
import { PlayStoreModal } from '../common/PlayStoreModal';

interface AccountScreenProps {
  user: UserType;
  onUpdateCity: (city: CityCameroon) => void;
  onNavigate: (tab: 'home' | 'send' | 'tracking' | 'history' | 'payments' | 'account' | 'help') => void;
  onResetKyc: () => void;
}

export const AccountScreen: React.FC<AccountScreenProps> = ({
  user,
  onUpdateCity,
  onNavigate,
  onResetKyc,
}) => {
  const { t, language } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { permissions, setPermissionStatus, requestPermission, resetPermissions, openAppSettings } = usePermissions();
  const [city, setCity] = useState<CityCameroon>(user.city);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [showPlayStoreModal, setShowPlayStoreModal] = useState<boolean>(false);
  const [showCodeViewer, setShowCodeViewer] = useState<boolean>(false);
  const [codeTab, setCodeTab] = useState<'manifest' | 'flutter'>('manifest');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const androidManifestSnippet = `<!-- android/app/src/main/AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="cm.relais237.app">

    <!-- Accès à l'appareil photo (pour la photo du colis et scan CNI) -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />

    <!-- Accès à la galerie photo -->
    <!-- Pour Android 13+ (API 33+) -->
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <!-- Pour Android 12 et versions inférieures -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />

    <!-- Accès à la géolocalisation (pour le suivi du colis) -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <!-- Accès aux contacts (pour sélectionner le récepteur) -->
    <uses-permission android:name="android.permission.READ_CONTACTS" />
</manifest>`;

  const flutterDartSnippet = `// lib/services/permission_service.dart
import 'package:permission_handler/permission_handler.dart';

// Exemple pour la caméra (photo colis scellé & scan CNI)
Future<void> demanderAccesCamera() async {
  PermissionStatus status = await Permission.camera.request();

  if (status.isGranted) {
    // La permission est accordée : Ouvrir l'appareil photo
  } else if (status.isDenied) {
    // La permission est refusée
  } else if (status.isPermanentlyDenied) {
    // Le client a coché "Ne plus demander" -> Rediriger vers les paramètres du téléphone
    openAppSettings();
  }
}

// Exemple pour les contacts (sélection destinataire MTN/Orange)
Future<void> demanderAccesContacts() async {
  PermissionStatus status = await Permission.contacts.request();
  if (status.isPermanentlyDenied) openAppSettings();
}

// Exemple pour la géolocalisation (suivi livreur moto Douala/Yaoundé)
Future<void> demanderAccesPosition() async {
  PermissionStatus status = await Permission.locationWhenInUse.request();
  if (status.isPermanentlyDenied) openAppSettings();
}`;

  const handleCopyCode = () => {
    const textToCopy = codeTab === 'manifest' ? androidManifestSnippet : flutterDartSnippet;
    navigator.clipboard?.writeText(textToCopy);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSimulatePermanentDenial = () => {
    setPermissionStatus('camera', 'permanentlyDenied');
    requestPermission('camera');
  };

  const handleSaveCity = (newCity: CityCameroon) => {
    setCity(newCity);
    onUpdateCity(newCity);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleTogglePermission = (type: AndroidPermissionType) => {
    const current = permissions[type];
    if (current === 'granted') {
      setPermissionStatus(type, 'denied');
    } else {
      requestPermission(type);
    }
  };

  const permList: {
    type: AndroidPermissionType;
    icon: any;
    name_fr: string;
    name_en: string;
    manifest: string;
    purpose_fr: string;
    purpose_en: string;
  }[] = [
    {
      type: 'camera',
      icon: Camera,
      name_fr: 'Appareil Photo',
      name_en: 'Camera',
      manifest: 'android.permission.CAMERA',
      purpose_fr: 'Photo obligatoire du colis & vérification CNI',
      purpose_en: 'Mandatory parcel photo & CNI verification'
    },
    {
      type: 'location',
      icon: MapPin,
      name_fr: 'Position GPS Précise',
      name_en: 'Precise GPS Location',
      manifest: 'android.permission.ACCESS_FINE_LOCATION',
      purpose_fr: 'Suivi live du coursier moto à Douala/Yaoundé',
      purpose_en: 'Live motorbike courier tracking in Douala/Yaoundé'
    },
    {
      type: 'contacts',
      icon: Contact,
      name_fr: 'Carnet de Contacts',
      name_en: 'Address Book / Contacts',
      manifest: 'android.permission.READ_CONTACTS',
      purpose_fr: 'Sélection rapide du destinataire (MTN/Orange)',
      purpose_en: 'Quick recipient selection (MTN/Orange)'
    },
    {
      type: 'media',
      icon: ImageIcon,
      name_fr: 'Galerie & Médias (Android 13+)',
      name_en: 'Media & Gallery (Android 13+)',
      manifest: 'android.permission.READ_MEDIA_IMAGES',
      purpose_fr: 'Téléversement CNI & export des reçus PDF',
      purpose_en: 'CNI upload & PDF receipts export'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-lg transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-extrabold text-2xl flex items-center justify-center shrink-0">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </h1>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-mono font-bold px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{t('kycCertifiedBadge')}</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-mono flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.phone} ({user.phoneCarrier})</span>
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>{t('activeResidence')} <strong className="text-slate-900 dark:text-slate-200">{user.city}, Cameroun</strong></span>
                <CameroonFlag size="sm" />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('help')}
              className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{t('helpCenter')}</span>
            </button>
            <button
              onClick={() => onNavigate('history')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <History className="w-3.5 h-3.5 text-blue-500" />
              <span>{t('history')}</span>
            </button>
            <button
              onClick={() => onNavigate('payments')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('payments')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preferences Section: Theme Provider & Language */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Day / Night Theme Selector */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('themePreferencesTitle')}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('daytimeOutdoorHelp')}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => setTheme('light')}
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                theme === 'light'
                  ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/40'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>{t('lightMode')}</span>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                theme === 'dark'
                  ? 'bg-slate-950 border-emerald-500 text-white ring-2 ring-emerald-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              <Moon className="w-4 h-4 text-emerald-400" />
              <span>{t('darkMode')}</span>
            </button>
          </div>
        </div>

        {/* Language Preferences */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('languageOption')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'fr' ? 'Bilinguisme officiel du Cameroun (Français & English)' : 'Cameroon official bilingualism (French & English)'}
              </p>
            </div>
          </div>
          <div className="pt-3 flex justify-end">
            <LanguageSwitcher showIcon={true} />
          </div>
        </div>
      </div>

      {/* NEW: Android & Flutter Permissions Management (permission_handler ^11.0.0) */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  {language === 'fr' ? 'Permissions Android & Flutter' : 'Android & Flutter Permissions'}
                </h2>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  permission_handler: ^11.0.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === 'fr' 
                  ? 'Gestion des accès système déclarés dans AndroidManifest.xml' 
                  : 'System permissions declared in AndroidManifest.xml'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCodeViewer(!showCodeViewer)}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
              title="Inspecter le code"
            >
              <Code className="w-3.5 h-3.5 text-blue-500" />
              <span>{showCodeViewer ? (language === 'fr' ? 'Masquer Code' : 'Hide Code') : (language === 'fr' ? 'Voir Manifest / Dart' : 'View Code')}</span>
              {showCodeViewer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={openAppSettings}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
              title="openAppSettings()"
            >
              <Settings className="w-3.5 h-3.5 text-emerald-500" />
              <span>openAppSettings()</span>
            </button>
          </div>
        </div>

        {/* Code Snippets Viewer (Accordion) */}
        {showCodeViewer && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden text-xs font-mono shadow-md animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCodeTab('manifest')}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                    codeTab === 'manifest' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  AndroidManifest.xml
                </button>
                <button
                  onClick={() => setCodeTab('flutter')}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                    codeTab === 'flutter' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  permission_handler (Dart)
                </button>
              </div>

              <button
                onClick={handleCopyCode}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] flex items-center gap-1 transition-colors"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copié !' : 'Copier'}</span>
              </button>
            </div>

            <pre className="p-3 text-[11px] text-emerald-300 overflow-x-auto max-h-56 leading-relaxed">
              <code>{codeTab === 'manifest' ? androidManifestSnippet : flutterDartSnippet}</code>
            </pre>
          </div>
        )}

        {/* Permissions Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {permList.map((perm) => {
            const Icon = perm.icon;
            const isGranted = permissions[perm.type] === 'granted';

            return (
              <div
                key={perm.type}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 shadow-xs"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isGranted ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {language === 'fr' ? perm.name_fr : perm.name_en}
                    </h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">
                      {perm.manifest}
                    </span>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-tight">
                      {language === 'fr' ? perm.purpose_fr : perm.purpose_en}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleTogglePermission(perm.type)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono transition-colors shrink-0 ${
                    isGranted 
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200' 
                      : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-800 hover:bg-rose-200'
                  }`}
                >
                  {isGranted ? 'Granted' : 'Denied'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Test Buttons & Sandbox Controls */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              {language === 'fr' ? 'Tester flux Flutter :' : 'Test Flutter Flow:'}
            </span>
            <button
              onClick={() => requestPermission('camera')}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded text-[11px] font-mono flex items-center gap-1 transition-colors"
            >
              <Play className="w-2.5 h-2.5 text-emerald-500" />
              <span>Permission.camera.request()</span>
            </button>
            <button
              onClick={() => requestPermission('location')}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded text-[11px] font-mono flex items-center gap-1 transition-colors"
            >
              <Play className="w-2.5 h-2.5 text-blue-500" />
              <span>Permission.location.request()</span>
            </button>
            <button
              onClick={() => requestPermission('contacts')}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded text-[11px] font-mono flex items-center gap-1 transition-colors"
            >
              <Play className="w-2.5 h-2.5 text-amber-500" />
              <span>Permission.contacts.request()</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulatePermanentDenial}
              className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800/60 rounded text-[11px] font-semibold transition-colors"
              title="Simule le refus permanent pour tester le bouton openAppSettings"
            >
              {language === 'fr' ? 'Simuler Refus Définitif' : 'Simulate Permanently Denied'}
            </button>
            <button
              onClick={resetPermissions}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-[11px] font-semibold transition-colors flex items-center gap-1"
              title="Réinitialiser"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{language === 'fr' ? 'Réinitialiser' : 'Reset'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KYC & Identity Dossier */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{t('accountKycTitle')}</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Conformité Loi ANTIC & Ministère des Postes et Télécommunications</p>
            </div>
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-800">
            {t('level2Certified')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">{t('idDocLabel')}</span>
            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-emerald-500" />
              <span>Carte Nationale d'Identité (CNI Cameroun)</span>
            </p>
            <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">N° 1189204481 · {language === 'fr' ? 'Recto & Verso archivés' : 'Front & Back archived'}</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">{t('authChannelLabel')}</span>
            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#25D366]" />
              <span>WhatsApp OTP Business</span>
            </p>
            <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{language === 'fr' ? 'Vérifié au' : 'Verified at'} {user.phone}</p>
          </div>
        </div>

        <div className="bg-slate-50/80 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
          <span className="font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t('dataSecurityTitle')}</span>
          </span>
          <p>
            {t('dataSecurityText')}
          </p>
        </div>
      </div>

      {/* Region & Availability Setting */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm transition-colors">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{t('accountRegionTitle')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('accountRegionDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div 
            onClick={() => handleSaveCity('Douala')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              city === 'Douala'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500/40'
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Douala (Littoral)</span>
              {city === 'Douala' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Akwa, Bonanjo, Deïdo, Bonamoussadi, Ndokoti, Bassa, Makepe...
            </p>
            <span className="inline-block mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
              ● Hub Central Douala Actif
            </span>
          </div>

          <div 
            onClick={() => handleSaveCity('Yaoundé')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              city === 'Yaoundé'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500/40'
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Yaoundé (Centre)</span>
              {city === 'Yaoundé' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Bastos, Mokolo, Omnisport, Tsinga, Mendong, Nlongkak...
            </p>
            <span className="inline-block mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
              ● Hub Central Yaoundé Actif
            </span>
          </div>
        </div>

        {savedSuccess && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t('cityUpdatedSuccess')} {city} !</span>
          </p>
        )}
      </div>

      {/* App Info & Play Store */}
      <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <img 
            src="/relais237-app-icon.png" 
            alt="Icône Officielle RELAIS237" 
            className="w-12 h-12 rounded-xl border border-emerald-500/40 shadow-sm object-cover shrink-0" 
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">RELAIS237 Mobile</span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800 font-bold">
                v1.4.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Icône certifiée Google Play Store & Application Android PWA
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowPlayStoreModal(true)}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Fiche Play Store</span>
        </button>
      </div>

      {/* Play Store Modal */}
      <PlayStoreModal
        isOpen={showPlayStoreModal}
        onClose={() => setShowPlayStoreModal(false)}
      />

      {/* Logout / Reset Demo */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={onResetKyc}
          className="px-4 py-2 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-slate-800 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t('resetDemoBtn')}</span>
        </button>
      </div>
    </div>
  );
};

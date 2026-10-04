import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, 
  Upload, 
  CheckCircle2, 
  MessageSquare, 
  Phone, 
  UserCheck, 
  ArrowRight, 
  Eye, 
  RefreshCw, 
  AlertCircle,
  FileCheck,
  Camera
} from 'lucide-react';
import { CITIES_CAMEROON } from '../../data/mockData';
import { CityCameroon, KycStatus } from '../../types';
import { CameroonFlag } from '../common/CameroonFlag';
import { useLanguage } from '../../context/LanguageContext';
import { usePermissions } from '../../context/PermissionsContext';

interface KycAuthScreenProps {
  onKycComplete: (userData: {
    firstName: string;
    lastName: string;
    phone: string;
    city: CityCameroon;
    cniNumber: string;
  }) => void;
  onRequestWhatsAppOtp: (phone: string) => void;
  enteredOtp: string;
  setEnteredOtp: (otp: string) => void;
}

export const KycAuthScreen: React.FC<KycAuthScreenProps> = ({
  onKycComplete,
  onRequestWhatsAppOtp,
  enteredOtp,
  setEnteredOtp,
}) => {
  const { t, language } = useLanguage();
  const { requestPermission } = usePermissions();
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'form' | 'cni' | 'otp' | 'success'>('form');

  // Form states
  const [lastName, setLastName] = useState('Eto\'o Tchakounte');
  const [firstName, setFirstName] = useState('Samuel');
  const [birthDate, setBirthDate] = useState('1994-08-22');
  const [city, setCity] = useState<CityCameroon>('Douala');
  const [phone, setPhone] = useState('674892210');
  const [cniNumber, setCniNumber] = useState('1189204481');
  
  // CNI photos states
  const [cniFrontUploaded, setCniFrontUploaded] = useState<boolean>(true);
  const [cniBackUploaded, setCniBackUploaded] = useState<boolean>(true);
  const [cniFrontPreview, setCniFrontPreview] = useState<string | null>(null);
  const [cniBackPreview, setCniBackPreview] = useState<string | null>(null);

  const handleTriggerCniUpload = async (type: 'front' | 'back') => {
    const granted = await requestPermission('camera');
    if (granted) {
      if (type === 'front') {
        frontInputRef.current?.click();
      } else {
        backInputRef.current?.click();
      }
    }
  };

  // OTP states
  const [timer, setTimer] = useState<number>(54);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Helper for carrier detection
  const getCarrier = (num: string) => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('67') || clean.startsWith('68') || clean.startsWith('650') || clean.startsWith('651') || clean.startsWith('652') || clean.startsWith('653') || clean.startsWith('654')) {
      return { name: 'MTN Cameroon', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' };
    }
    if (clean.startsWith('69') || clean.startsWith('655') || clean.startsWith('656') || clean.startsWith('657') || clean.startsWith('658') || clean.startsWith('659')) {
      return { name: 'Orange Cameroun', color: 'text-orange-500 bg-orange-500/10 border-orange-500/30' };
    }
    return { name: 'Opérateur 237', color: 'text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700' };
  };

  const carrier = getCarrier(phone);

  const handleSendOtp = () => {
    if (!phone || phone.length < 8) return;
    onRequestWhatsAppOtp('+237 ' + phone);
    setStep('otp');
    setTimer(60);
  };

  const handleVerifyOtp = () => {
    setIsVerifying(true);
    setOtpError(null);

    setTimeout(() => {
      setIsVerifying(false);
      if (enteredOtp.length === 6) {
        setStep('success');
        setTimeout(() => {
          onKycComplete({
            firstName,
            lastName,
            phone: '+237 ' + phone,
            city,
            cniNumber
          });
        }, 1200);
      } else {
        setOtpError(language === 'fr' 
          ? 'Le code à 6 chiffres est invalide. Veuillez réessayer.' 
          : 'The 6-digit code is invalid. Please try again.');
      }
    }, 600);
  };

  const handleFileUpload = (type: 'front' | 'back', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (type === 'front') {
        setCniFrontUploaded(true);
        setCniFrontPreview(url);
      } else {
        setCniBackUploaded(true);
        setCniBackPreview(url);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto w-full flex-1 flex flex-col justify-between bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl transition-colors">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/80 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{t('kycTitle')}</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('kycSubtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
            <CameroonFlag size="sm" />
            <span>CMR-237</span>
          </div>
        </div>

        {/* Stepper indicator */}
        <div className="grid grid-cols-3 gap-1.5 mb-5">
          <div className={`h-1.5 rounded-full transition-all ${step === 'form' ? 'bg-emerald-500' : 'bg-emerald-600/40'}`} />
          <div className={`h-1.5 rounded-full transition-all ${step === 'cni' ? 'bg-emerald-500' : step === 'otp' || step === 'success' ? 'bg-emerald-600/40' : 'bg-slate-200 dark:bg-slate-800'}`} />
          <div className={`h-1.5 rounded-full transition-all ${step === 'otp' || step === 'success' ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
        </div>

        {/* STEP 1: FORMULAIRE INFORMATIONS PERSONNELLES */}
        {step === 'form' && (
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-white mb-1">{t('kycNoticeTitle')}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {t('kycNoticeDesc')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">{t('lastName')}</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ex: Eto'o"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">{t('firstName')}</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ex: Samuel"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">{t('birthDate')}</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">{t('cityResidency')}</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value as CityCameroon)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  {CITIES_CAMEROON.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.region})
                    </option>
                  ))}
                </select>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block mt-1 font-mono">
                  ● Actif à Douala & Yaoundé
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">{t('country')}</label>
                <div className="w-full bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-300 flex items-center justify-between">
                  <span>Cameroun</span>
                  <CameroonFlag size="sm" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300">{t('phoneNumber')}</label>
                <span className={`text-[10px] px-2 py-0.5 rounded border ${carrier.color}`}>
                  {carrier.name}
                </span>
              </div>
              <div className="flex items-center">
                <span className="bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-300 dark:border-slate-700 rounded-l-lg px-3 py-2 text-xs text-slate-600 dark:text-slate-400 font-mono flex items-center gap-1">
                  <CameroonFlag size="sm" />
                  +237
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                  placeholder="674 89 22 10"
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-r-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 font-mono tracking-wider focus:outline-none focus:border-emerald-500"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">{t('phoneHint')}</p>
            </div>
          </div>
        )}

        {/* STEP 2: VERIFICATION D'IDENTITE CNI RECTO / VERSO */}
        {step === 'cni' && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-xs">
              <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">Vérification CNI Camerounaise</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Conformément à la réglementation postale, le téléversement net du Recto et du Verso est obligatoire.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">{t('cniNumberLabel')}</label>
              <input
                type="text"
                value={cniNumber}
                onChange={(e) => setCniNumber(e.target.value)}
                placeholder="1189204481"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white font-mono tracking-widest focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* CNI Recto */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">{t('cniFrontLabel')}</span>
                {cniFrontUploaded && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {t('fileReady')}</span>}
              </div>
              
              <div 
                onClick={() => handleTriggerCniUpload('front')}
                className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer bg-slate-50 dark:bg-slate-900/60 transition-colors group"
              >
                <input
                  ref={frontInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('front', e)}
                  className="hidden"
                />
                {cniFrontPreview ? (
                  <div className="w-full h-24 rounded-lg overflow-hidden relative">
                    <img src={cniFrontPreview} alt="CNI Recto" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-xs text-white font-medium">
                      Remplacer la photo
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 w-full">
                    {/* Visual CNI Mockup Representation */}
                    <div className="w-20 h-14 rounded-md bg-gradient-to-br from-emerald-100 via-slate-100 to-amber-100 dark:from-emerald-950 dark:via-slate-800 dark:to-amber-950 border border-slate-300 dark:border-slate-700 p-1 flex flex-col justify-between shrink-0 shadow-sm">
                      <div className="flex items-center justify-between text-[6px] text-slate-700 dark:text-slate-300 font-bold">
                        <span>RÉPUBLIQUE DU CAMEROUN</span>
                        <CameroonFlag size="sm" />
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-5 bg-slate-300 dark:bg-slate-700 rounded-[2px]" />
                        <div className="space-y-0.5">
                          <div className="w-8 h-1 bg-slate-400 dark:bg-slate-600 rounded-xs" />
                          <div className="w-6 h-1 bg-slate-400 dark:bg-slate-600 rounded-xs" />
                        </div>
                      </div>
                      <div className="text-[5px] text-emerald-600 dark:text-emerald-400 font-mono font-bold tracking-tighter">
                        CNI N° {cniNumber || '1189204481'}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{t('cniUploadBtn')}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{t('cniFrontHint')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CNI Verso */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">{t('cniBackLabel')}</span>
                {cniBackUploaded && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {t('fileReady')}</span>}
              </div>

              <div 
                onClick={() => handleTriggerCniUpload('back')}
                className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer bg-slate-50 dark:bg-slate-900/60 transition-colors group"
              >
                <input
                  ref={backInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('back', e)}
                  className="hidden"
                />
                {cniBackPreview ? (
                  <div className="w-full h-24 rounded-lg overflow-hidden relative">
                    <img src={cniBackPreview} alt="CNI Verso" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-xs text-white font-medium">
                      Remplacer la photo
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 w-full">
                    {/* Visual CNI Verso Mockup */}
                    <div className="w-20 h-14 rounded-md bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950 border border-slate-300 dark:border-slate-700 p-1 flex flex-col justify-between shrink-0 shadow-sm">
                      <div className="flex items-center justify-between text-[6px] text-slate-600 dark:text-slate-400">
                        <span>PEACE - WORK - FATHERLAND</span>
                        <div className="w-2 h-2 rounded-full border border-amber-500/60" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-xs" />
                        <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-xs" />
                      </div>
                      <div className="text-[5px] font-mono text-slate-500 tracking-tighter truncate">
                        IDCMRETO<span className="text-emerald-500">237</span>&lt;&lt;&lt;&lt;&lt;&lt;940822
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{t('cniUploadBtn')}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{t('cniBackHint')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: VERIFICATION WHATSAPP OTP */}
        {step === 'otp' && (
          <div className="space-y-5 text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] flex items-center justify-center mx-auto shadow-lg shadow-[#25D366]/10">
              <MessageSquare className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('otpTitle')}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                {t('otpDesc')}
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-300 dark:border-slate-800 text-xs font-mono text-emerald-600 dark:text-emerald-400">
                <CameroonFlag size="sm" />
                <span>+237 {phone}</span>
              </div>
            </div>

            {/* OTP Input Boxes */}
            <div className="flex justify-center gap-2 max-w-xs mx-auto">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={enteredOtp[index] || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    const otpArr = enteredOtp.split('');
                    otpArr[index] = val;
                    const newOtp = otpArr.join('');
                    setEnteredOtp(newOtp);
                  }}
                  className="w-10 h-12 text-center text-lg font-bold font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              ))}
            </div>

            {otpError && (
              <p className="text-xs text-rose-500 flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {otpError}
              </p>
            )}

            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
              <span>Code non reçu ?</span>
              {timer > 0 ? (
                <span className="text-slate-400 font-mono">{t('resendIn')} {timer}s</span>
              ) : (
                <button
                  onClick={handleSendOtp}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium inline-flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  {t('resendOtp')}
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS KYC */}
        {step === 'success' && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/40 animate-pulse">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('kycSuccessTitle')}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {t('kycSuccessDesc')} (CNI N° {cniNumber})
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Buttons */}
      <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800/80">
        {step === 'form' && (
          <button
            onClick={() => setStep('cni')}
            disabled={!lastName || !firstName || !phone}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>{t('continueToCni')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {step === 'cni' && (
          <div className="flex gap-2">
            <button
              onClick={() => setStep('form')}
              className="px-4 h-11 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 font-semibold text-xs rounded-xl transition-colors"
            >
              Retour
            </button>
            <button
              onClick={handleSendOtp}
              disabled={!cniNumber || !cniFrontUploaded || !cniBackUploaded}
              className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t('continueToOtp')}</span>
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="flex gap-2">
            <button
              onClick={() => setStep('cni')}
              className="px-4 h-11 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 font-semibold text-xs rounded-xl transition-colors"
            >
              Retour
            </button>
            <button
              onClick={handleVerifyOtp}
              disabled={enteredOtp.length < 6 || isVerifying}
              className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t('verifyingCode')}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('confirmRegistration')}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

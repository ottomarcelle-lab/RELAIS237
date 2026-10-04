import React, { useState } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle, 
  RefreshCw, 
  Lock, 
  Receipt,
  Download
} from 'lucide-react';
import { PaymentMethodType, PaymentStatus, Shipment } from '../../types';
import { CameroonFlag } from '../common/CameroonFlag';
import { useLanguage } from '../../context/LanguageContext';

interface PaymentScreenProps {
  shipment: Partial<Shipment>;
  onPaymentSuccess: (transactionRef: string) => void;
  defaultPhone: string;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  shipment,
  onPaymentSuccess,
  defaultPhone,
}) => {
  const { t, language } = useLanguage();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('mtn_momo');
  const [phoneNumber, setPhoneNumber] = useState(defaultPhone.replace('+237', '').trim() || '674892210');
  
  // USSD Push Simulator State
  const [ussdPromptOpen, setUssdPromptOpen] = useState<boolean>(false);
  const [ussdPin, setUssdPin] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentDone, setPaymentDone] = useState<boolean>(false);
  const [transactionRef, setTransactionRef] = useState<string>('');

  const totalAmount = shipment.totalXaf || 1700;
  const baseRate = shipment.priceXaf || 1500;
  const insuranceFee = shipment.insuranceFeeXaf || 200;
  const trackingCode = shipment.trackingCode || 'R237-8849-DLA';

  const handleLaunchPayment = () => {
    setIsProcessing(true);
    // Simulate API push notification from gateway to user phone
    setTimeout(() => {
      setIsProcessing(false);
      setUssdPromptOpen(true);
    }, 800);
  };

  const handleConfirmUssdPin = () => {
    if (ussdPin.length < 4) return;
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setUssdPromptOpen(false);
      const ref = selectedMethod === 'mtn_momo' 
        ? `MOMO-CMR-${Math.floor(100000 + Math.random() * 900000)}` 
        : `OM-CMR-${Math.floor(100000 + Math.random() * 900000)}`;
      setTransactionRef(ref);
      setPaymentDone(true);
    }, 1200);
  };

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto w-full flex-1 flex flex-col justify-between relative bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl transition-colors">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{t('momoPaymentTitle')}</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('momoPaymentSubtitle')}</p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
            {language === 'fr' ? 'Étape 2/2' : 'Step 2/2'}
          </span>
        </div>

        {/* Recap card */}
        <div className="bg-slate-50 dark:bg-slate-900/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Expédition</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{trackingCode}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Course Moto Express</span>
            <span className="font-mono text-slate-800 dark:text-slate-200">{baseRate.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Assurance & Traçabilité</span>
            <span className="font-mono text-slate-800 dark:text-slate-200">{insuranceFee.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900 dark:text-white">Montant Total à débiter</span>
            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {totalAmount.toLocaleString('fr-FR')} FCFA
            </span>
          </div>
        </div>

        {/* Payment Operator Selection */}
        {!paymentDone && (
          <div className="space-y-3">
            <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
              {t('chooseOperator')}
            </label>

            {/* MTN Mobile Money */}
            <div 
              onClick={() => setSelectedMethod('mtn_momo')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                selectedMethod === 'mtn_momo'
                  ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-500 shadow-md ring-1 ring-amber-500/40'
                  : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#FFCC00] text-slate-950 flex flex-col items-center justify-center font-extrabold text-xs shadow-xs shrink-0">
                  <span className="text-[10px] leading-none">MTN</span>
                  <span className="text-[9px] leading-none font-bold">MoMo</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">MTN Mobile Money</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 font-mono">*126#</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('momoDesc')}</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                selectedMethod === 'mtn_momo' ? 'border-amber-500 bg-amber-500' : 'border-slate-300 dark:border-slate-600'
              }`}>
                {selectedMethod === 'mtn_momo' && <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-950" />}
              </div>
            </div>

            {/* Orange Money */}
            <div 
              onClick={() => setSelectedMethod('orange_money')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                selectedMethod === 'orange_money'
                  ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-500 shadow-md ring-1 ring-orange-500/40'
                  : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#FF7900] text-white flex flex-col items-center justify-center font-extrabold text-xs shadow-xs shrink-0">
                  <span className="text-[10px] leading-none">Orange</span>
                  <span className="text-[9px] leading-none font-bold">Money</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Orange Money Cameroun</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-600 dark:text-orange-300 font-mono">#150#</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('omDesc')}</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                selectedMethod === 'orange_money' ? 'border-orange-500 bg-orange-500' : 'border-slate-300 dark:border-slate-600'
              }`}>
                {selectedMethod === 'orange_money' && <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-950" />}
              </div>
            </div>

            {/* Phone Number Input */}
            <div className="pt-2">
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('payerNumberLabel')}
              </label>
              <div className="flex items-center">
                <span className="bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-300 dark:border-slate-700 rounded-l-lg px-3 py-2 text-xs text-slate-600 dark:text-slate-400 font-mono flex items-center gap-1">
                  <CameroonFlag size="sm" />
                  +237
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
                  placeholder="674 89 22 10"
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-r-lg px-3 py-2 text-xs text-slate-900 dark:text-white font-mono tracking-wider focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Payment Confirmation Receipt */}
        {paymentDone && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/60 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('paymentSuccessTitle')}</h4>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400/90">{t('paymentSuccessDesc')}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">{t('txnRef')}</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">{transactionRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Opérateur :</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {selectedMethod === 'mtn_momo' ? 'MTN Mobile Money (*126#)' : 'Orange Money (#150#)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Numéro débité :</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">+237 {phoneNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Montant :</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{totalAmount.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* USSD PUSH PROMPT MODAL SIMULATOR */}
      {ussdPromptOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 w-full max-w-xs rounded-2xl p-4 shadow-2xl text-center space-y-3 animate-in fade-in zoom-in-95">
            <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center ${
              selectedMethod === 'mtn_momo' ? 'bg-[#FFCC00] text-slate-950' : 'bg-[#FF7900] text-white'
            }`}>
              <Lock className="w-5 h-5" />
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {selectedMethod === 'mtn_momo' ? 'MTN MoMo Cameroon (*126#)' : 'Orange Money Cameroun (#150#)'}
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-snug">
                Autorisez-vous le paiement de <span className="font-bold text-emerald-600 dark:text-emerald-400">{totalAmount} FCFA</span> à RELAIS237 pour l'expédition {trackingCode} ?
              </p>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">Entrez votre code secret PIN :</label>
              <input
                type="password"
                maxLength={5}
                value={ussdPin}
                onChange={(e) => setUssdPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-32 mx-auto text-center font-mono text-lg font-bold bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg py-1.5 text-slate-900 dark:text-white tracking-widest focus:outline-none focus:border-amber-400"
              />
              <p className="text-[9px] text-slate-400 mt-1">Exemple testeur : tapez 1234</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setUssdPromptOpen(false)}
                className="flex-1 py-2 text-xs bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 rounded-lg font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmUssdPin}
                disabled={ussdPin.length < 4 || isProcessing}
                className={`flex-1 py-2 text-xs font-bold rounded-lg text-slate-950 transition-colors flex items-center justify-center gap-1 ${
                  selectedMethod === 'mtn_momo' ? 'bg-[#FFCC00] hover:bg-yellow-400' : 'bg-[#FF7900] hover:bg-orange-500 text-white'
                }`}
              >
                {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action CTA */}
      <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
        {!paymentDone ? (
          <button
            onClick={handleLaunchPayment}
            disabled={!phoneNumber || isProcessing}
            className={`w-full h-11 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
              selectedMethod === 'mtn_momo'
                ? 'bg-[#FFCC00] hover:bg-yellow-400 shadow-yellow-950/20'
                : 'bg-[#FF7900] hover:bg-orange-500 text-white shadow-orange-950/20'
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t('pushSending')}</span>
              </>
            ) : (
              <>
                <Smartphone className="w-4 h-4" />
                <span>{t('payWithOperator')} {selectedMethod === 'mtn_momo' ? 'MoMo' : 'OM'} ({totalAmount.toLocaleString('fr-FR')} FCFA)</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => onPaymentSuccess(transactionRef)}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>{t('seeLiveTracking')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

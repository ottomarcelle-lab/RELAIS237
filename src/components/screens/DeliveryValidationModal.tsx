import React, { useState } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  XCircle, 
  X, 
  RefreshCw, 
  Lock, 
  Check, 
  PenTool,
  Truck,
  UserCheck
} from 'lucide-react';
import { Shipment } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface DeliveryValidationModalProps {
  shipment: Shipment;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelivered: () => void;
}

export const DeliveryValidationModal: React.FC<DeliveryValidationModalProps> = ({
  shipment,
  isOpen,
  onClose,
  onConfirmDelivered,
}) => {
  const { t, language } = useLanguage();
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [courierCodeInput, setCourierCodeInput] = useState<string>(shipment.trackingCode || 'R237-8849-DLA');
  const [validationState, setValidationState] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [hasSignature, setHasSignature] = useState<boolean>(true);

  if (!isOpen) return null;

  const expectedPin = shipment.deliveryPin || '5824';
  const expectedCode = shipment.trackingCode || 'R237-8849-DLA';

  const handleVerifyCodes = () => {
    setValidationState('checking');
    setTimeout(() => {
      if (enteredPin.trim() === expectedPin) {
        setValidationState('success');
        setTimeout(() => {
          onConfirmDelivered();
          onClose();
        }, 1400);
      } else {
        setValidationState('error');
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">{t('doubleValidationTitle')}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('doubleValidationDesc')}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step-by-Step Handshake Protocol */}
        <div className="space-y-3">
          {/* Step A: Livreur shows the tracking code */}
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('stepCourierShowsCode')}</span>
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                {language === 'fr' ? 'Conforme' : 'Matched'}
              </span>
            </div>
            <div className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white text-center shadow-xs">
              {expectedCode}
            </div>
          </div>

          {/* Step B: Recipient gives the secret PIN */}
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t('stepRecipientGivesPin')}</span>
              </span>
              <button 
                onClick={() => setEnteredPin(expectedPin)}
                className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-mono font-semibold"
              >
                {language === 'fr' ? `Auto-saisir (${expectedPin})` : `Auto-fill (${expectedPin})`}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={4}
                value={enteredPin}
                onChange={(e) => {
                  setEnteredPin(e.target.value.replace(/\D/g, ''));
                  if (validationState === 'error') setValidationState('idle');
                }}
                placeholder={t('recipientPinPlaceholder')}
                className="w-full text-center text-lg font-mono font-bold tracking-widest bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg py-2 text-amber-600 dark:text-amber-400 focus:outline-none focus:border-emerald-500 shadow-xs"
              />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
              {t('stepRecipientPrompt')}
            </p>
          </div>

          {/* Step C: Tactile Delivery Signature Simulation */}
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-blue-500" />
                <span>{t('digitalDischargeSign')}</span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Marie-Claire Biya</span>
            </div>
            {/* Signature Pad Mockup */}
            <div className="h-14 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center relative overflow-hidden shadow-xs">
              <svg viewBox="0 0 200 60" className="w-48 h-12 stroke-emerald-500 fill-none stroke-2">
                <path d="M 20,40 Q 50,10 80,35 T 120,20 T 160,45 T 180,25" />
              </svg>
              <span className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-400 dark:text-slate-500">
                ANTIC-CMR 15:45
              </span>
            </div>
          </div>
        </div>

        {/* Validation Feedback */}
        {validationState === 'error' && (
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <XCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{t('validationError')} ({expectedPin})</span>
          </div>
        )}

        {validationState === 'success' && (
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span className="font-bold">{t('validationSuccess')}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-colors"
          >
            {t('close')}
          </button>
          <button
            onClick={handleVerifyCodes}
            disabled={enteredPin.length < 4 || validationState === 'checking'}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center gap-1.5"
          >
            {validationState === 'checking' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t('verifyingHandshake')}</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{t('verifyAndReleaseBtn')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

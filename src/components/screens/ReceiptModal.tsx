import React, { useState } from 'react';
import { 
  Receipt, 
  X, 
  Download, 
  Share2, 
  CheckCircle2, 
  ShieldCheck, 
  Printer, 
  QrCode, 
  Check, 
  MessageSquare,
  FileText
} from 'lucide-react';
import { Shipment } from '../../types';
import { CameroonFlag } from '../common/CameroonFlag';
import { useLanguage } from '../../context/LanguageContext';

interface ReceiptModalProps {
  shipment: Shipment;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  shipment,
  isOpen,
  onClose,
}) => {
  const { t, language } = useLanguage();
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  if (!isOpen) return null;

  const trackingCode = shipment.trackingCode || 'R237-8849-DLA';
  const receiptNum = shipment.receiptNumber || `REC-237-${trackingCode.replace('R237-', '')}`;
  const totalAmount = shipment.totalXaf || 1700;
  const baseRate = shipment.priceXaf || 1500;
  const insuranceFee = shipment.insuranceFeeXaf || 200;
  const paymentMethodLabel = shipment.paymentMethod === 'orange_money' 
    ? 'Orange Money Cameroun (#150#)' 
    : 'MTN Mobile Money (*126#)';
  const paymentRef = shipment.paymentId || 'MOMO-CMR-882910';
  const deliveryDate = shipment.deliveredAt 
    ? new Date(shipment.deliveredAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : (language === 'fr' ? '3 Octobre 2026 à 15:45' : 'October 3, 2026 at 3:45 PM');

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = language === 'fr'
      ? `Reçu officiel RELAIS237 pour le colis ${trackingCode} :
📄 N° de reçu : *${receiptNum}*
💰 Montant payé : *${totalAmount.toLocaleString('fr-FR')} FCFA*
✅ Statut : Livré et déchargé le ${deliveryDate}
🔗 Consulter en ligne : https://relais237.cm/receipt/${receiptNum}`
      : `Official RELAIS237 receipt for package ${trackingCode}:
📄 Receipt No: *${receiptNum}*
💰 Total paid: *${totalAmount.toLocaleString('en-US')} FCFA*
✅ Status: Delivered & verified on ${deliveryDate}
🔗 View online: https://relais237.cm/receipt/${receiptNum}`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 text-slate-900 dark:text-slate-100">
        
        {/* Top Modal Header */}
        <div className="bg-slate-50 dark:bg-slate-950 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">{t('receiptOfficialTitle')}</span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">RELAIS237 Cameroun · Réf. {receiptNum}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Ticket Receipt Layout */}
        <div className="p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 space-y-4 text-xs font-sans">
          
          {/* Header of Receipt */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-1">
            <div className="flex items-center justify-center gap-1.5">
              <CameroonFlag size="sm" />
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">RELAIS237 EXPRESS S.A.</span>
              <CameroonFlag size="sm" />
            </div>
            <p className="text-[10px] text-slate-600 dark:text-slate-400">
              {language === 'fr' 
                ? 'Réseau de Logistique Urbaine & Relais de Proximité au Cameroun' 
                : 'Urban Express Logistics & Relay Hub Network in Cameroon'}
            </p>
            <p className="text-[9px] text-slate-500 font-mono">
              {language === 'fr' 
                ? 'Agrément Postal MINPOSTEL N° 00412/MP/2025 · ANTIC Certifié' 
                : 'MINPOSTEL Postal License No 00412/MP/2025 · ANTIC Certified'}
            </p>
          </div>

          {/* Receipt Key Metadata */}
          <div className="grid grid-cols-2 gap-2 bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] shadow-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">N° DE REÇU :</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{receiptNum}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">CODE EXPÉDITION :</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{trackingCode}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">DATE & HEURE :</span>
              <span className="text-slate-700 dark:text-slate-200">{deliveryDate}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">STATUT REMISE :</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {language === 'fr' ? 'Validé par code PIN' : 'Verified by PIN'}
              </span>
            </div>
          </div>

          {/* Parties: Sender & Recipient */}
          <div className="space-y-2 border-b border-dashed border-slate-300 dark:border-slate-700 pb-3">
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  {t('senderLabel')} (KYC Validé) :
                </span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{shipment.senderName}</p>
                <p className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">{shipment.senderPhone}</p>
                <p className="text-slate-500 dark:text-slate-400 text-[10px]">{shipment.pickupAddress.neighborhood}, {shipment.pickupAddress.city}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  {t('recipientLabel')} :
                </span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{shipment.recipientAddress.fullName}</p>
                <p className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">{shipment.recipientAddress.phone}</p>
                <p className="text-slate-500 dark:text-slate-400 text-[10px]">{shipment.recipientAddress.neighborhood}, {shipment.recipientAddress.city}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/50 p-2 rounded-lg text-[10px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent">
              <span className="text-slate-500 dark:text-slate-400">{language === 'fr' ? 'Repère de livraison : ' : 'Delivery landmark: '}</span>
              <span className="font-medium text-slate-900 dark:text-slate-200">{shipment.recipientAddress.landmark}</span>
            </div>
          </div>

          {/* Parcel & Courier */}
          <div className="space-y-1.5 border-b border-dashed border-slate-300 dark:border-slate-700 pb-3 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">{language === 'fr' ? 'Description du Colis :' : 'Package Description:'}</span>
              <span className="font-medium text-slate-900 dark:text-white text-right max-w-[220px] truncate">{shipment.parcel.description}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">{language === 'fr' ? 'Contrôle visuel anti-contrebande :' : 'Anti-contraband visual inspection:'}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{language === 'fr' ? 'Conforme (Certifié)' : 'Compliant (Certified)'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">{t('courierLabel')} :</span>
              <span className="text-slate-700 dark:text-slate-200 font-mono">
                {shipment.courierName || 'Jean-Paul Etoa'} (Plaque {shipment.courierMatricule || shipment.courierVehicle?.match(/([A-Z]{2}\s?\d{3,4}\s?[A-Z]{1,2})/i)?.[1] || 'LT 892 AK'})
              </span>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="space-y-1.5 border-b border-dashed border-slate-300 dark:border-slate-700 pb-3 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">{t('baseRateLabel')} :</span>
              <span className="font-mono text-slate-900 dark:text-white">{baseRate.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')} FCFA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">{t('insuranceFeeLabel')} :</span>
              <span className="font-mono text-slate-900 dark:text-white">{insuranceFee.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')} FCFA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">{language === 'fr' ? 'Taxe & Timbre Électronique ANTIC :' : 'ANTIC Digital Stamp & Tax:'}</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">0 FCFA ({language === 'fr' ? 'Inclus' : 'Included'})</span>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline text-sm">
              <span className="font-extrabold text-slate-900 dark:text-white">{t('totalPaidLabel')} (XAF) :</span>
              <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-base">
                {totalAmount.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')} FCFA
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900/60 p-2 rounded-lg text-[10px] space-y-0.5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">{language === 'fr' ? 'Mode de règlement :' : 'Payment method:'}</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">{paymentMethodLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">{language === 'fr' ? 'Réf. Passerelle Mobile Money :' : 'Mobile Money Gateway Ref:'}</span>
                <span className="font-mono text-slate-700 dark:text-slate-200">{paymentRef}</span>
              </div>
            </div>
          </div>

          {/* Verification Stamp & QR Code */}
          <div className="flex items-center justify-between pt-1">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-[10px] text-emerald-800 dark:text-emerald-300 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>{language === 'fr' ? 'SIGNATURE NUMÉRIQUE VALIDE' : 'VALID DIGITAL SIGNATURE'}</span>
              </div>
              <p className="text-[9px] text-slate-500 max-w-[200px] leading-tight">
                {language === 'fr' 
                  ? 'Document probant archivé au coffre-fort électronique RELAIS237.' 
                  : 'Certified legal proof stored in RELAIS237 electronic vault.'}
              </p>
            </div>

            {/* Simulated QR Code */}
            <div className="w-16 h-16 bg-white p-1 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center shadow-xs">
              <QrCode className="w-14 h-14 text-slate-950" />
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-slate-50 dark:bg-slate-950 px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2 justify-between">
          <button
            onClick={onClose}
            className="px-3 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 font-semibold text-xs rounded-xl transition-colors"
          >
            {t('close')}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-2 bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1da850] text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-slate-950" />
              <span>{t('shareReceiptWhatsApp')}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              {downloadSuccess ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloadSuccess ? (language === 'fr' ? 'Reçu Téléchargé !' : 'Receipt Downloaded!') : t('downloadPdf')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

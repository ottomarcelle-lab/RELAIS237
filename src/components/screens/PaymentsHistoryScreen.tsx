import React, { useState } from 'react';
import { 
  CreditCard, 
  Receipt, 
  Search, 
  CheckCircle2, 
  Download, 
  ShieldCheck, 
  ArrowRight,
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { Shipment } from '../../types';
import { CameroonFlag } from '../common/CameroonFlag';
import { useLanguage } from '../../context/LanguageContext';

interface PaymentsHistoryScreenProps {
  shipments: Shipment[];
  onSelectReceipt: (shipment: Shipment) => void;
}

export const PaymentsHistoryScreen: React.FC<PaymentsHistoryScreenProps> = ({
  shipments,
  onSelectReceipt,
}) => {
  const { t, language } = useLanguage();
  const [operatorFilter, setOperatorFilter] = useState<'all' | 'mtn_momo' | 'orange_money'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const paidShipments = shipments.filter(s => s.paymentStatus === 'successful' || s.paymentId);

  const filteredPayments = paidShipments.filter(shp => {
    const isMtn = shp.paymentMethod === 'mtn_momo' || (shp.paymentId && shp.paymentId.includes('MOMO'));
    const isOrange = shp.paymentMethod === 'orange_money' || (shp.paymentId && shp.paymentId.includes('OM'));

    const matchesOperator = 
      operatorFilter === 'all' ||
      (operatorFilter === 'mtn_momo' && isMtn) ||
      (operatorFilter === 'orange_money' && isOrange);

    const matchesSearch = 
      shp.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (shp.paymentId && shp.paymentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      shp.recipientAddress.fullName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesOperator && matchesSearch;
  });

  const totalSpent = paidShipments.reduce((acc, curr) => acc + (curr.totalXaf || 0), 0);
  const mtnSpent = paidShipments
    .filter(s => s.paymentMethod === 'mtn_momo' || (s.paymentId && s.paymentId.includes('MOMO')))
    .reduce((acc, curr) => acc + (curr.totalXaf || 0), 0);
  const orangeSpent = totalSpent - mtnSpent;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2 shadow-sm transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t('paymentsHistoryTitle')}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('paymentsHistorySubtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
            <CameroonFlag size="sm" />
            <span>XAF · FCFA</span>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">{t('totalSpentTitle')}</span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono mt-1">
            {totalSpent.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')} <span className="text-xs text-emerald-600 dark:text-emerald-400 font-normal">FCFA</span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{paidShipments.length} {t('validatedTxns')}</p>
        </div>

        <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">MTN Mobile Money</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono font-bold">*126#</span>
          </div>
          <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-1">
            {mtnSpent.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')} <span className="text-xs font-normal">FCFA</span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{t('instantUssdDebit')}</p>
        </div>

        <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Orange Money</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-700 dark:text-orange-300 font-mono font-bold">#150#</span>
          </div>
          <div className="text-xl font-extrabold text-orange-600 dark:text-orange-400 font-mono mt-1">
            {orangeSpent.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')} <span className="text-xs font-normal">FCFA</span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{t('securePushNotif')}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'fr' ? "Rechercher par référence (MOMO-...), code expédition, destinataire..." : "Search by reference (MOMO-...), tracking code, recipient..."}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs self-start sm:self-auto shadow-xs">
          <button
            onClick={() => setOperatorFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              operatorFilter === 'all' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('allFilterPayments')} ({paidShipments.length})
          </button>
          <button
            onClick={() => setOperatorFilter('mtn_momo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
              operatorFilter === 'mtn_momo' ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>MTN MoMo</span>
          </button>
          <button
            onClick={() => setOperatorFilter('orange_money')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
              operatorFilter === 'orange_money' ? 'bg-orange-500 text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Orange Money</span>
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {filteredPayments.length === 0 ? (
          <div className="text-center py-10 bg-white/60 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 space-y-2">
            <CreditCard className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('noTxnFound')}</p>
            <p className="text-[11px] text-slate-500">{t('adjustTxnFilters')}</p>
          </div>
        ) : (
          filteredPayments.map((shp) => {
            const isMtn = shp.paymentMethod === 'mtn_momo' || (shp.paymentId && shp.paymentId.includes('MOMO'));
            const dateStr = shp.deliveredAt || shp.createdAt;
            const formattedDate = new Date(dateStr).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });

            return (
              <div
                key={shp.id}
                className="bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 transition-all space-y-3 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isMtn ? 'bg-[#FFCC00] text-slate-950' : 'bg-[#FF7900] text-white'
                    }`}>
                      {isMtn ? 'MoMo' : 'OM'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {language === 'fr' ? 'Paiement' : 'Payment'} {isMtn ? 'MTN Mobile Money' : 'Orange Money'}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3 h-3" />
                          {language === 'fr' ? 'Succès' : 'Success'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {t('txnRef')} {shp.paymentId || 'MOMO-CMR-908124'} · {formattedDate}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono block">
                      {shp.totalXaf.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')} FCFA
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {language === 'fr' 
                        ? `Course ${shp.priceXaf} FCFA + Assurance ${shp.insuranceFeeXaf} FCFA`
                        : `Delivery ${shp.priceXaf} FCFA + Insurance ${shp.insuranceFeeXaf} FCFA`}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                    {t('forParcelTo')} <strong className="text-slate-900 dark:text-white font-mono">{shp.trackingCode}</strong> {language === 'fr' ? 'à destination de' : 'heading to'} <strong className="text-slate-800 dark:text-slate-300">{shp.recipientAddress.fullName}</strong> ({shp.recipientAddress.city})
                  </div>

                  <button
                    onClick={() => onSelectReceipt(shp)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
                  >
                    <Receipt className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{t('viewOfficialReceipt')}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

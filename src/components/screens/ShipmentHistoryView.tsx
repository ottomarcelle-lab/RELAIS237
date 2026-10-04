import React, { useState } from 'react';
import { 
  PackageCheck, 
  Search, 
  Receipt, 
  MapPin, 
  Calendar, 
  User, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink,
  Filter,
  FileText
} from 'lucide-react';
import { Shipment } from '../../types';
import { CameroonFlag } from '../common/CameroonFlag';
import { useLanguage } from '../../context/LanguageContext';

interface ShipmentHistoryViewProps {
  pastShipments: Shipment[];
  onSelectReceipt: (shipment: Shipment) => void;
  onSelectTrackLive?: (shipment: Shipment) => void;
}

export const ShipmentHistoryView: React.FC<ShipmentHistoryViewProps> = ({
  pastShipments,
  onSelectReceipt,
  onSelectTrackLive,
}) => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cityFilter, setCityFilter] = useState<'all' | 'Douala' | 'Yaoundé'>('all');

  const filteredShipments = pastShipments.filter((shp) => {
    const matchesSearch = 
      shp.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shp.recipientAddress.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shp.recipientAddress.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shp.parcel.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCity = 
      cityFilter === 'all' || 
      shp.recipientAddress.city === cityFilter;

    return matchesSearch && matchesCity;
  });

  const totalDelivered = pastShipments.filter(s => s.status === 'delivered').length;
  const totalAmountSpent = pastShipments.reduce((acc, curr) => acc + (curr.totalXaf || 0), 0);

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchHistoryPlaceholder')}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
          />
        </div>

        {/* City Filter Tabs */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
            <button
              onClick={() => setCityFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                cityFilter === 'all' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t('allFilter')} ({pastShipments.length})
            </button>
            <button
              onClick={() => setCityFilter('Douala')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                cityFilter === 'Douala' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Douala
            </button>
            <button
              onClick={() => setCityFilter('Yaoundé')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                cityFilter === 'Yaoundé' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Yaoundé
            </button>
          </div>

          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            {filteredShipments.length} {t('packagesFound')}
          </span>
        </div>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <PackageCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t('deliveredStat')}</span>
            <span className="font-extrabold text-slate-900 dark:text-white font-mono">{totalDelivered} {language === 'fr' ? 'colis' : 'parcels'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t('totalSpentStat')}</span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{totalAmountSpent.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')} FCFA</span>
          </div>
        </div>
      </div>

      {/* Shipment Items List */}
      <div className="space-y-3">
        {filteredShipments.length === 0 ? (
          <div className="text-center py-8 bg-white/60 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 space-y-2">
            <PackageCheck className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-400">{t('noShipmentsFound')}</p>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              {t('adjustSearchFilters')}
            </p>
          </div>
        ) : (
          filteredShipments.map((shp) => {
            const formattedDate = shp.deliveredAt 
              ? new Date(shp.deliveredAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              : (language === 'fr' ? 'Récemment' : 'Recently');

            const isMoMo = shp.paymentMethod === 'mtn_momo' || (shp.paymentId && shp.paymentId.includes('MOMO'));

            return (
              <div 
                key={shp.id}
                className="bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2.5 transition-all shadow-xs"
              >
                {/* Card Top: Tracking Code + Date + Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">{shp.trackingCode}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">· {formattedDate}</span>
                  </div>

                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>{t('deliveredBadge')}</span>
                  </span>
                </div>

                {/* Recipient & Location */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{shp.recipientAddress.fullName}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-normal">({shp.recipientAddress.phone})</span>
                    </div>
                    <span className="text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                      {shp.totalXaf.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')} FCFA
                    </span>
                  </div>

                  <div className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span className="leading-snug">
                      <strong className="text-slate-800 dark:text-slate-300">{shp.recipientAddress.neighborhood}</strong> ({shp.recipientAddress.city}) · {shp.recipientAddress.landmark}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 px-2 py-1 rounded border border-slate-200 dark:border-slate-800/60 truncate">
                    📦 <span className="text-slate-800 dark:text-slate-300 font-medium">{shp.parcel.description}</span>
                  </div>
                </div>

                {/* Bottom Actions: View Receipt & Re-order */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    <span className={`w-2 h-2 rounded-full ${isMoMo ? 'bg-[#FFCC00]' : 'bg-[#FF7900]'}`} />
                    <span>{isMoMo ? 'MTN MoMo' : 'Orange Money'}</span>
                  </div>

                  <button
                    onClick={() => onSelectReceipt(shp)}
                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-600/20 dark:hover:bg-emerald-600/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Receipt className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{t('viewReceipt')}</span>
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

import React, { useState } from 'react';
import { Search, X, Contact, Phone, MapPin, CheckCircle2, UserPlus } from 'lucide-react';
import { AppContact } from '../../types';
import { SAMPLE_CAMEROON_CONTACTS } from '../../data/mockData';
import { CameroonFlag } from './CameroonFlag';
import { useLanguage } from '../../context/LanguageContext';

interface ContactsPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContact: (contact: AppContact) => void;
}

export const ContactsPickerModal: React.FC<ContactsPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectContact,
}) => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const filteredContacts = SAMPLE_CAMEROON_CONTACTS.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.neighborhood.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q)
    );
  });

  const getCarrierBadge = (phone: string) => {
    if (phone.startsWith('67') || phone.startsWith('68')) {
      return { name: 'MTN', color: 'bg-[#FFCC00] text-slate-950 font-bold' };
    }
    if (phone.startsWith('69') || phone.startsWith('65')) {
      return { name: 'Orange', color: 'bg-[#FF7900] text-white font-bold' };
    }
    return { name: 'Camtel', color: 'bg-blue-600 text-white font-bold' };
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-slate-900 dark:text-slate-100 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Contact className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {language === 'fr' ? 'Contacts Cameroun (SIM & Téléphone)' : 'Cameroon Contacts (SIM & Phone)'}
                </h3>
                <CameroonFlag size="sm" />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                android.permission.READ_CONTACTS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'fr' ? 'Rechercher par nom, téléphone (+237), quartier...' : 'Search by name, phone, neighborhood...'}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
              autoFocus
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="p-3 space-y-2 overflow-y-auto flex-1">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 space-y-1">
              <Contact className="w-8 h-8 mx-auto text-slate-400" />
              <p>{language === 'fr' ? 'Aucun contact trouvé' : 'No contact found'}</p>
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const carrier = getCarrierBadge(contact.phone);

              return (
                <button
                  key={contact.id}
                  onClick={() => {
                    onSelectContact(contact);
                    onClose();
                  }}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 hover:bg-emerald-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-left transition-all flex items-start justify-between gap-3 group shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {contact.name}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded ${carrier.color}`}>
                        {carrier.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>+237 {contact.phone}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                      <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                      <span>{contact.neighborhood} ({contact.city}) · {contact.landmark}</span>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 mt-1">
                    <span>{language === 'fr' ? 'Choisir' : 'Select'}</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between font-mono">
          <span>{filteredContacts.length} contacts chargés</span>
          <span>PermissionStatus.granted</span>
        </div>
      </div>
    </div>
  );
};

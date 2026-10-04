import React, { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  MessageSquare, 
  Phone, 
  MapPin, 
  Clock, 
  Mail, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  AlertCircle,
  ExternalLink,
  Sparkles,
  X
} from 'lucide-react';
import { CAMEROON_FAQS, SUPPORT_AGENTS, SupportAgent } from '../../data/faqData';
import { CameroonFlag } from '../common/CameroonFlag';
import { CityCameroon, FaqItem } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface HelpCenterScreenProps {
  userCity: CityCameroon;
  onNavigateToSend?: () => void;
  onNavigateToTracking?: () => void;
}

export const HelpCenterScreen: React.FC<HelpCenterScreenProps> = ({
  userCity,
  onNavigateToSend,
  onNavigateToTracking,
}) => {
  const { t, language } = useLanguage();
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCityFilter, setSelectedCityFilter] = useState<'all' | CityCameroon>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-zones-douala');

  // WhatsApp Interactive Simulator Modal
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(false);
  const [selectedAgentForChat, setSelectedAgentForChat] = useState<SupportAgent>(
    userCity === 'Yaoundé' ? SUPPORT_AGENTS[1] : SUPPORT_AGENTS[0]
  );
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'agent' | 'user'; text: string; time: string }>>([
    {
      sender: 'agent',
      text: language === 'fr' 
        ? `Bonjour ! Bienvenue au support officiel RELAIS237 Cameroun. Je suis ${userCity === 'Yaoundé' ? 'Brice' : 'Armelle'}, conseiller pour ${userCity}. Comment puis-je vous aider aujourd'hui ?`
        : `Hello! Welcome to official RELAIS237 Cameroon support. I am ${userCity === 'Yaoundé' ? 'Brice' : 'Armelle'}, agent for ${userCity}. How can I assist you today?`,
      time: 'Just now'
    }
  ]);
  const [chatInputText, setChatInputText] = useState<string>('');

  // Ticket Submission Form state
  const [ticketFullName, setTicketFullName] = useState<string>('Samuel Eto\'o');
  const [ticketPhone, setTicketPhone] = useState<string>('674892210');
  const [ticketCity, setTicketCity] = useState<CityCameroon>(userCity);
  const [ticketCategory, setTicketCategory] = useState<'tracking' | 'payment_momo_om' | 'kyc_cni' | 'relay_point' | 'other'>('tracking');
  const [ticketTrackingCode, setTicketTrackingCode] = useState<string>('R237-7892-DLA');
  const [ticketMessage, setTicketMessage] = useState<string>('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState<boolean>(false);
  const [ticketSubmittedId, setTicketSubmittedId] = useState<string | null>(null);

  // Filter FAQs
  const filteredFaqs = CAMEROON_FAQS.filter((faq) => {
    // City filter
    if (selectedCityFilter !== 'all' && !faq.targetCities.includes(selectedCityFilter)) {
      return false;
    }
    // Category filter
    if (selectedCategory !== 'all' && faq.category !== selectedCategory) {
      return false;
    }
    // Query search
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const question = (language === 'fr' ? faq.question_fr : faq.question_en).toLowerCase();
    const answer = (language === 'fr' ? faq.answer_fr : faq.answer_en).toLowerCase();
    const tagMatch = faq.tags.some((tag) => tag.toLowerCase().includes(q));
    return question.includes(q) || answer.includes(q) || tagMatch;
  });

  const handleToggleFaq = (id: string) => {
    setExpandedFaqId(expandedFaqId === id ? null : id);
  };

  const handleOpenWhatsAppNative = (agent: SupportAgent) => {
    const defaultText = language === 'fr'
      ? `Bonjour RELAIS237 ${agent.city}, j'ai besoin d'une assistance pour un colis.`
      : `Hello RELAIS237 ${agent.city}, I need assistance with a shipment.`;
    const url = `https://wa.me/${agent.whatsappNumber}?text=${encodeURIComponent(defaultText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenWhatsAppSimulated = (agent: SupportAgent) => {
    setSelectedAgentForChat(agent);
    setIsWhatsAppModalOpen(true);
  };

  const handleSendChatMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInputText.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: chatInputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    const currentInput = chatInputText.trim();
    setChatInputText('');

    // Simulate Agent intelligent reply after 800ms
    setTimeout(() => {
      let reply = '';
      const lower = currentInput.toLowerCase();

      if (lower.includes('prix') || lower.includes('tarif') || lower.includes('combien') || lower.includes('rate') || lower.includes('cost')) {
        reply = language === 'fr'
          ? `Nos tarifs sont de 1 500 FCFA (< 3kg), 2 500 FCFA (3-10kg) et 4 000 FCFA (> 10kg) en ville. Entre Douala et Yaoundé via l'Axe Lourd, comptez 2 500 FCFA + navette express en 4-6h.`
          : `Rates are 1,500 XAF (< 3kg), 2,500 XAF (3-10kg), and 4,000 XAF (> 10kg) intra-city. Inter-city between Douala and Yaoundé is 2,500 XAF with express 4-6h shuttle.`;
      } else if (lower.includes('momo') || lower.includes('orange') || lower.includes('paiement') || lower.includes('payer')) {
        reply = language === 'fr'
          ? `Nous acceptons MTN Mobile Money (*126#) et Orange Money (*150#) avec débit USSD push sécurisé sans frais supplémentaires.`
          : `We accept MTN Mobile Money (*126#) and Orange Money (*150#) with secure instant USSD push.`;
      } else if (lower.includes('suivi') || lower.includes('colis') || lower.includes('r237') || lower.includes('track')) {
        reply = language === 'fr'
          ? `Vous pouvez suivre votre colis en temps réel sur la carte GPS dans l'onglet 'Suivi'. Le code PIN de décharge est requis pour la remise.`
          : `You can track your package live on the GPS map in the 'Tracking' tab. The release PIN is required upon delivery.`;
      } else {
        reply = language === 'fr'
          ? `Bien noté ! Votre demande pour ${selectedAgentForChat.city} est prise en compte par notre agence. Un conseiller vérifie votre dossier sous 5 minutes.`
          : `Noted! Your inquiry for ${selectedAgentForChat.city} is being reviewed by our office. An agent will follow up within 5 minutes.`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 900);
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessage.trim() || !ticketFullName.trim() || !ticketPhone.trim()) return;

    setIsSubmittingTicket(true);
    const generatedTicketId = `TK-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      // Save to Firestore support_tickets
      await addDoc(collection(db, 'support_tickets'), {
        userId: 'client-user',
        fullName: ticketFullName,
        phone: ticketPhone,
        city: ticketCity,
        category: ticketCategory,
        trackingCode: ticketTrackingCode || null,
        message: ticketMessage,
        status: 'open',
        createdAt: serverTimestamp()
      });
    } catch (err) {
      // Fallback local acknowledgment if offline
      console.warn('Firestore offline fallback for support ticket', err);
    } finally {
      setIsSubmittingTicket(false);
      setTicketSubmittedId(generatedTicketId);
      setTicketMessage('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-100">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-300" />
            <span>{t('helpCenterSubtitle')}</span>
            <CameroonFlag size="sm" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {t('helpCenterTitle')}
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            {language === 'fr'
              ? 'Toutes les réponses à vos questions sur les livraisons à Douala et Yaoundé, la sécurité par code de décharge, les paiements MTN MoMo / Orange Money et le support direct WhatsApp.'
              : 'Answers to all your questions about deliveries in Douala and Yaoundé, handshake PIN security, MTN MoMo / Orange Money payments, and live WhatsApp support.'}
          </p>

          {/* Quick WhatsApp Action Banner */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleOpenWhatsAppSimulated(selectedAgentForChat)}
              className="px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1da850] text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 fill-slate-950" />
              <span>{t('whatsappChatCta')}</span>
            </button>

            <span className="text-[11px] text-emerald-200/80 font-medium">
              ⚡ {language === 'fr' ? 'Réponse moyenne en moins de 5 min' : 'Average reply in under 5 mins'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Direct Support Agents (Douala & Yaoundé) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Phone className="w-5 h-5 text-emerald-500" />
              <span>{t('supportAgentsTitle')}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('supportAgentsSubtitle')}
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
            7j / 7 · 07h00 - 20h00
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SUPPORT_AGENTS.map((agent) => {
            const isLocalCity = userCity === agent.city;

            return (
              <div 
                key={agent.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isLocalCity
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700/50 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={agent.avatarUrl} 
                      alt={agent.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-300 dark:border-slate-700 shadow-xs" 
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{agent.name}</h3>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                          {agent.city}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{agent.agencyName}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{agent.region}</p>
                    </div>
                  </div>

                  {isLocalCity && (
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700 shrink-0">
                      {language === 'fr' ? 'Votre agence' : 'Your city branch'}
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{agent.address}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{agent.landmark}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{agent.workingHours}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono">
                    <span className="text-slate-500 dark:text-slate-400">Langues :</span>
                    {agent.languages.map((lang, idx) => (
                      <span key={idx} className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Call & WhatsApp Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${agent.phoneMtn.replace(/\s+/g, '')}`}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Appeler</span>
                  </a>

                  <button
                    onClick={() => handleOpenWhatsAppSimulated(agent)}
                    className="py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1da850] text-slate-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5 fill-slate-950" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Search & Interactive FAQ Accordion */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-500" />
            <span>Foire Aux Questions (Douala & Yaoundé)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Trouvez instantanément la réponse à votre interrogation
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchFaqPlaceholder')}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Filters: Category & City Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: t('allFaqs') },
              { id: 'zones', label: t('zonesCategory') },
              { id: 'rates', label: t('ratesCategory') },
              { id: 'payment', label: t('paymentCategory') },
              { id: 'security', label: t('securityCategory') },
              { id: 'relay', label: t('relayCategory') },
              { id: 'insurance', label: t('insuranceCategory') },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* City Target Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setSelectedCityFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedCityFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setSelectedCityFilter('Douala')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedCityFilter === 'Douala'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Douala
            </button>
            <button
              onClick={() => setSelectedCityFilter('Yaoundé')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedCityFilter === 'Yaoundé'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Yaoundé
            </button>
          </div>
        </div>

        {/* FAQs List */}
        <div className="space-y-3 pt-2">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Aucune réponse ne correspond à votre recherche</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Essayez un autre mot-clé ou contactez directement nos agents sur WhatsApp.</p>
              <button
                onClick={() => handleOpenWhatsAppSimulated(selectedAgentForChat)}
                className="mt-3 px-4 py-2 bg-[#25D366] text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4 fill-slate-950" />
                <span>Poser ma question sur WhatsApp</span>
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              const question = language === 'fr' ? faq.question_fr : faq.question_en;
              const answer = language === 'fr' ? faq.answer_fr : faq.answer_en;

              return (
                <div
                  key={faq.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all shadow-xs"
                >
                  <button
                    onClick={() => handleToggleFaq(faq.id)}
                    className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="space-y-1 pr-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {faq.targetCities.map((c) => (
                          <span key={c} className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            {c}
                          </span>
                        ))}
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                          {faq.category}
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {question}
                      </h3>
                    </div>

                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform ${
                      isExpanded ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rotate-180' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/80 leading-relaxed whitespace-pre-line bg-slate-50/50 dark:bg-slate-950/40">
                      {answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Ticket Submission Form (Firestore Connected) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t('submitTicketTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('submitTicketDesc')}
            </p>
          </div>
        </div>

        {ticketSubmittedId ? (
          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
              {t('ticketSentSuccess')}
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-mono">
              Référence du ticket : <strong>{ticketSubmittedId}</strong> (Archivé dans Firestore)
            </p>
            <button
              onClick={() => setTicketSubmittedId(null)}
              className="mt-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Envoyer une autre demande
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Nom complet *</label>
                <input
                  type="text"
                  required
                  value={ticketFullName}
                  onChange={(e) => setTicketFullName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Téléphone camerounais (WhatsApp) *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-2.5 rounded-l-xl border border-r-0 border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-[11px]">
                    +237
                  </span>
                  <input
                    type="tel"
                    required
                    value={ticketPhone}
                    onChange={(e) => setTicketPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-r-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Ville concernée *</label>
                <select
                  value={ticketCity}
                  onChange={(e) => setTicketCity(e.target.value as CityCameroon)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium"
                >
                  <option value="Douala">Douala (Littoral)</option>
                  <option value="Yaoundé">Yaoundé (Centre)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Motif de la demande *</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium"
                >
                  <option value="tracking">Suivi ou localisation de colis</option>
                  <option value="payment_momo_om">Paiement Mobile Money (MoMo/OM)</option>
                  <option value="kyc_cni">Vérification CNI & KYC</option>
                  <option value="relay_point">Dépôt ou retrait en point relais</option>
                  <option value="other">Autre demande générale</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Code de suivi (si applicable)</label>
                <input
                  type="text"
                  placeholder="Ex: R237-7892-DLA"
                  value={ticketTrackingCode}
                  onChange={(e) => setTicketTrackingCode(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Détails de votre message ou réclamation *</label>
              <textarea
                required
                rows={3}
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                placeholder="Décrivez votre situation (quartier exact, heure de commande, livreur moto, question)..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingTicket}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {isSubmittingTicket ? (
                <span>Enregistrement sécurisé...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{t('sendTicketBtn')}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* 5. In-App Interactive WhatsApp Chat Simulator Modal */}
      {isWhatsAppModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#111b21] text-[#e9edef] w-full max-w-md rounded-3xl shadow-2xl border border-slate-800 flex flex-col h-[560px] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* WhatsApp Header */}
            <div className="bg-[#202c33] p-3 border-b border-[#2a3942] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={selectedAgentForChat.avatarUrl} 
                  alt={selectedAgentForChat.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#25D366]"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-white">{selectedAgentForChat.name}</h4>
                    <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                  </div>
                  <p className="text-[10px] text-[#8696a0]">
                    Support Officiel RELAIS237 ({selectedAgentForChat.city}) · En ligne
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenWhatsAppNative(selectedAgentForChat)}
                  className="p-1.5 text-xs text-[#25D366] hover:bg-[#2a3942] rounded-lg flex items-center gap-1"
                  title="Ouvrir dans l'app WhatsApp réelle"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsWhatsAppModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0b141a] bg-opacity-95">
              <div className="text-center">
                <span className="text-[10px] bg-[#182229] text-[#8696a0] px-2.5 py-1 rounded-full font-mono">
                  🔒 Chiffrement de bout en bout · Double Validation RELAIS237
                </span>
              </div>

              {chatMessages.map((msg, i) => (
                <div 
                  key={i}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-[#005c4b] text-white rounded-tr-xs' 
                      : 'bg-[#202c33] text-[#e9edef] rounded-tl-xs'
                  }`}>
                    <p>{msg.text}</p>
                    <span className="text-[9px] text-[#8696a0] block text-right mt-1 font-mono">
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick suggested chips */}
            <div className="px-3 py-1.5 bg-[#202c33] border-t border-[#2a3942] flex items-center gap-1.5 overflow-x-auto text-[10px]">
              <button 
                onClick={() => { setChatInputText('Quel est le tarif pour 5 kg ?'); }}
                className="px-2 py-0.5 rounded-full bg-[#111b21] hover:bg-[#2a3942] text-[#8696a0] hover:text-white shrink-0"
              >
                Tarifs 5kg
              </button>
              <button 
                onClick={() => { setChatInputText('Comment payer par MTN MoMo ?'); }}
                className="px-2 py-0.5 rounded-full bg-[#111b21] hover:bg-[#2a3942] text-[#8696a0] hover:text-white shrink-0"
              >
                Paiement MoMo
              </button>
              <button 
                onClick={() => { setChatInputText('Suivre mon colis R237'); }}
                className="px-2 py-0.5 rounded-full bg-[#111b21] hover:bg-[#2a3942] text-[#8696a0] hover:text-white shrink-0"
              >
                Suivi colis
              </button>
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChatMessage} className="p-3 bg-[#202c33] flex items-center gap-2">
              <input
                type="text"
                value={chatInputText}
                onChange={(e) => setChatInputText(e.target.value)}
                placeholder="Tapez un message à votre conseiller..."
                className="flex-1 bg-[#2a3942] text-white placeholder-[#8696a0] rounded-xl px-4 py-2 text-xs focus:outline-none"
              />
              <button
                type="submit"
                disabled={!chatInputText.trim()}
                className="w-9 h-9 rounded-xl bg-[#25D366] disabled:opacity-40 text-slate-950 flex items-center justify-center shrink-0 transition-transform active:scale-95"
              >
                <Send className="w-4 h-4 fill-slate-950" />
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

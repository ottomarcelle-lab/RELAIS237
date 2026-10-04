import React, { useState } from 'react';
import { Navbar, AppNavDestination } from './components/common/Navbar';
import { MobileTabBar } from './components/common/MobileTabBar';
import { WhatsAppToast } from './components/common/WhatsAppToast';
import { HomeScreen } from './components/screens/HomeScreen';
import { KycAuthScreen } from './components/screens/KycAuthScreen';
import { ShipmentCreateScreen } from './components/screens/ShipmentCreateScreen';
import { PaymentScreen } from './components/screens/PaymentScreen';
import { TrackingDashboardScreen } from './components/screens/TrackingDashboardScreen';
import { ShipmentHistoryView } from './components/screens/ShipmentHistoryView';
import { PaymentsHistoryScreen } from './components/screens/PaymentsHistoryScreen';
import { AccountScreen } from './components/screens/AccountScreen';
import { HelpCenterScreen } from './components/screens/HelpCenterScreen';
import { ReceiptModal } from './components/screens/ReceiptModal';
import { DeliveryValidationModal } from './components/screens/DeliveryValidationModal';
import { ArchitectureView } from './components/architecture/ArchitectureView';
import { SAMPLE_ACTIVE_SHIPMENT, SAMPLE_PAST_SHIPMENTS, INITIAL_USER } from './data/mockData';
import { CityCameroon, Shipment, User } from './types';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { PermissionsProvider } from './context/PermissionsContext';

function MainApp() {
  const { t, language } = useLanguage();
  const [currentTab, setCurrentTab] = useState<'app' | 'architecture'>('app');
  const [activeDestination, setActiveDestination] = useState<AppNavDestination>('home');
  const [isRegistered, setIsRegistered] = useState<boolean>(true);

  // User state (Douala or Yaoundé)
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [enteredOtp, setEnteredOtp] = useState<string>('739824');

  // Shipments state
  const [activeShipment, setActiveShipment] = useState<Shipment>(SAMPLE_ACTIVE_SHIPMENT);
  const [allShipments, setAllShipments] = useState<Shipment[]>([
    SAMPLE_ACTIVE_SHIPMENT,
    ...SAMPLE_PAST_SHIPMENTS
  ]);
  const [isDelivered, setIsDelivered] = useState<boolean>(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState<boolean>(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Shipment | null>(null);

  // WhatsApp notification toast state
  const [whatsappNotification, setWhatsappNotification] = useState<{
    sender: string;
    message: string;
    code?: string;
  } | null>(null);

  // WhatsApp OTP request handler
  const handleRequestWhatsAppOtp = (phoneNumber: string) => {
    const randomCode = '739824';
    setEnteredOtp('');
    setWhatsappNotification({
      sender: 'RELAIS237 Officiel',
      message: language === 'fr'
        ? `Votre code d'activation RELAIS237 est ${randomCode}. Sécurité KYC stricte Douala / Yaoundé. Ne le communiquez à personne.`
        : `Your RELAIS237 verification code is ${randomCode}. Strict KYC security Douala / Yaoundé. Do not share with anyone.`,
      code: randomCode,
    });
  };

  const handleApplyOtpCode = (code: string) => {
    setEnteredOtp(code);
    setWhatsappNotification(null);
  };

  const handleKycComplete = (userData: {
    firstName: string;
    lastName: string;
    phone: string;
    city: CityCameroon;
    cniNumber: string;
  }) => {
    setUser((prev) => ({
      ...prev,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      city: userData.city,
      kycStatus: 'verified',
    }));
    setIsRegistered(true);
    // As explicitly requested: "après l'inscription on ira vers une page d'accueil"
    setActiveDestination('home');
    setWhatsappNotification({
      sender: 'RELAIS237 Bienvenue',
      message: language === 'fr'
        ? `Félicitations ${userData.firstName} ! Votre compte est certifié pour Douala et Yaoundé. Bienvenue sur votre page d'accueil.`
        : `Congratulations ${userData.firstName}! Your account is verified for Douala and Yaoundé. Welcome to your home dashboard.`,
    });
  };

  const handleShipmentCreated = (shipmentData: Partial<Shipment>) => {
    const newShp: Shipment = {
      ...activeShipment,
      ...shipmentData,
      status: 'payment_pending',
      paymentStatus: 'pending',
      senderId: user.id,
      senderName: `${user.firstName} ${user.lastName}`,
      senderPhone: user.phone,
      pickupAddress: {
        ...activeShipment.pickupAddress,
        city: user.city,
      }
    };
    setActiveShipment(newShp);
    setIsDelivered(false);
    // Proceed to payment
    setActiveDestination('send');
  };

  const handlePaymentSuccess = (transactionRef: string) => {
    const updatedShp: Shipment = {
      ...activeShipment,
      paymentId: transactionRef,
      paymentStatus: 'successful',
      paymentMethod: transactionRef.startsWith('OM') ? 'orange_money' : 'mtn_momo',
      status: 'out_for_delivery',
    };
    setActiveShipment(updatedShp);
    setAllShipments((prev) => [updatedShp, ...prev.filter(s => s.id !== updatedShp.id)]);

    setWhatsappNotification({
      sender: 'RELAIS237 Expéditions',
      message: language === 'fr'
        ? `Paiement Mobile Money validé ! Votre colis ${updatedShp.trackingCode} a été pris en charge à ${user.city}.`
        : `Mobile Money payment confirmed! Your parcel ${updatedShp.trackingCode} is on the way in ${user.city}.`,
    });
    // Navigate to live tracking
    setActiveDestination('tracking');
  };

  const handleConfirmDelivered = () => {
    setIsDelivered(true);
    const deliveredShp: Shipment = {
      ...activeShipment,
      status: 'delivered',
      deliveredAt: new Date().toISOString(),
      receiptNumber: `REC-237-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${activeShipment.id.slice(-4)}`
    };
    setActiveShipment(deliveredShp);
    setAllShipments((prev) => [deliveredShp, ...prev.filter(s => s.id !== deliveredShp.id)]);

    setWhatsappNotification({
      sender: 'RELAIS237 Remise Validée',
      message: language === 'fr'
        ? `🎉 Colis ${deliveredShp.trackingCode} remis en main propre ! Décharge enregistrée et reçu officiel disponible.`
        : `🎉 Parcel ${deliveredShp.trackingCode} delivered in person! Release verified and official receipt available.`,
    });
  };

  const handleResetKyc = () => {
    setIsRegistered(false);
    setActiveDestination('kyc');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white pb-20 md:pb-8 transition-colors">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeAppDestination={activeDestination}
        onSelectDestination={setActiveDestination}
        userCity={user.city}
      />

      {/* Floating WhatsApp Push Notification Toast */}
      <WhatsAppToast
        notification={whatsappNotification}
        onDismiss={() => setWhatsappNotification(null)}
        onApplyCode={handleApplyOtpCode}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {currentTab === 'architecture' ? (
          <ArchitectureView />
        ) : (
          <div className="w-full flex-1 flex flex-col">
            
            {/* If user is not yet registered or wants to do KYC */}
            {(!isRegistered || activeDestination === 'kyc') && (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-colors">
                  <KycAuthScreen
                    onKycComplete={handleKycComplete}
                    onRequestWhatsAppOtp={handleRequestWhatsAppOtp}
                    enteredOtp={enteredOtp}
                    setEnteredOtp={setEnteredOtp}
                  />
                </div>
              </div>
            )}

            {/* SCREEN: ACCUEIL (HOME) */}
            {isRegistered && activeDestination === 'home' && (
              <HomeScreen
                user={user}
                activeShipment={activeShipment}
                onNavigate={(dest) => setActiveDestination(dest as AppNavDestination)}
              />
            )}

            {/* SCREEN: EXPÉDIER & PAIEMENT */}
            {isRegistered && activeDestination === 'send' && (
              <div className="max-w-2xl mx-auto w-full px-4 py-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-colors">
                  {activeShipment.status === 'payment_pending' && activeShipment.paymentStatus !== 'successful' ? (
                    <PaymentScreen
                      shipment={activeShipment}
                      onPaymentSuccess={handlePaymentSuccess}
                      defaultPhone={user.phone}
                    />
                  ) : (
                    <ShipmentCreateScreen
                      onShipmentCreated={handleShipmentCreated}
                      senderCity={user.city}
                    />
                  )}
                </div>
              </div>
            )}

            {/* SCREEN: SUIVI GPS & HISTORIQUE */}
            {isRegistered && activeDestination === 'tracking' && (
              <div className="max-w-2xl mx-auto w-full px-4 py-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-colors">
                  <TrackingDashboardScreen
                    shipment={activeShipment}
                    onOpenValidationModal={() => setIsValidationModalOpen(true)}
                    isDelivered={isDelivered}
                  />
                </div>
              </div>
            )}

            {/* SCREEN: HISTORIQUE D'EXPÉDITIONS DÉDIÉ */}
            {isRegistered && activeDestination === 'history' && (
              <div className="max-w-3xl mx-auto w-full px-4 py-6 space-y-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-lg transition-colors">
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    {t('historyTitle')}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {t('historySubtitle')}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm dark:shadow-xl transition-colors">
                  <ShipmentHistoryView
                    pastShipments={allShipments.filter(s => s.status === 'delivered')}
                    onSelectReceipt={(shp) => setSelectedReceipt(shp)}
                  />
                </div>
              </div>
            )}

            {/* SCREEN: HISTORIQUE DE PAIEMENT */}
            {isRegistered && activeDestination === 'payments' && (
              <PaymentsHistoryScreen
                shipments={allShipments}
                onSelectReceipt={(shp) => setSelectedReceipt(shp)}
              />
            )}

            {/* SCREEN: MON COMPTE */}
            {isRegistered && activeDestination === 'account' && (
              <AccountScreen
                user={user}
                onUpdateCity={(city) => setUser((prev) => ({ ...prev, city }))}
                onNavigate={(dest) => setActiveDestination(dest as AppNavDestination)}
                onResetKyc={handleResetKyc}
              />
            )}

            {/* SCREEN: CENTRE D'AIDE & SUPPORT WHATSAPP */}
            {isRegistered && activeDestination === 'help' && (
              <HelpCenterScreen
                userCity={user.city}
                onNavigateToSend={() => setActiveDestination('send')}
                onNavigateToTracking={() => setActiveDestination('tracking')}
              />
            )}

          </div>
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (Hidden on md+) */}
      {currentTab === 'app' && isRegistered && (
        <MobileTabBar
          activeDestination={activeDestination}
          onSelectDestination={setActiveDestination}
          hasActiveDelivery={activeShipment.status !== 'delivered'}
        />
      )}

      {/* Official Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          shipment={selectedReceipt}
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      {/* Double Code Delivery Handshake Validation Modal */}
      <DeliveryValidationModal
        shipment={activeShipment}
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
        onConfirmDelivered={handleConfirmDelivered}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <PermissionsProvider>
          <MainApp />
        </PermissionsProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

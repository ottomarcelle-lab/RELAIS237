import React from 'react';
import { Camera, MapPin, Contact, Image, Shield, AlertCircle, Settings } from 'lucide-react';
import { AndroidPermissionType } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface AndroidPermissionModalProps {
  permissionType: AndroidPermissionType | null;
  isOpen: boolean;
  onGrant: (type: AndroidPermissionType) => void;
  onDeny: (type: AndroidPermissionType) => void;
  isPermanentlyDenied?: boolean;
}

export const AndroidPermissionModal: React.FC<AndroidPermissionModalProps> = ({
  permissionType,
  isOpen,
  onGrant,
  onDeny,
  isPermanentlyDenied = false,
}) => {
  const { language } = useLanguage();

  if (!isOpen || !permissionType) return null;

  const permissionDetails = {
    camera: {
      icon: Camera,
      title_fr: 'Autoriser RELAIS237 à prendre des photos et enregistrer des vidéos ?',
      title_en: 'Allow RELAIS237 to take pictures and record video?',
      desc_fr: 'Nécessaire pour photographier obligatoirement le colis scellé avant prise en charge moto et pour le scan de la Carte Nationale d\'Identité (CNI).',
      desc_en: 'Required for mandatory parcel inspection photography before bike pickup and for National Identity Card (CNI) scanning.',
      manifestKey: 'android.permission.CAMERA',
    },
    location: {
      icon: MapPin,
      title_fr: 'Autoriser RELAIS237 à accéder à la position de cet appareil ?',
      title_en: 'Allow RELAIS237 to access this device\'s location?',
      desc_fr: 'Nécessaire pour géolocaliser l\'adresse exacte à Douala/Yaoundé et suivre le livreur mototaxi en temps réel sur la carte.',
      desc_en: 'Required to pinpoint the exact delivery address in Douala/Yaoundé and track the motorbike courier live on the GPS map.',
      manifestKey: 'android.permission.ACCESS_FINE_LOCATION',
    },
    contacts: {
      icon: Contact,
      title_fr: 'Autoriser RELAIS237 à accéder à vos contacts ?',
      title_en: 'Allow RELAIS237 to access your contacts?',
      desc_fr: 'Permet de sélectionner instantanément le numéro de téléphone et le nom du destinataire camerounais (MTN / Orange) sans risque d\'erreur.',
      desc_en: 'Enables quick selection of the Cameroonian recipient\'s phone number and name (MTN / Orange) without typos.',
      manifestKey: 'android.permission.READ_CONTACTS',
    },
    media: {
      icon: Image,
      title_fr: 'Autoriser RELAIS237 à accéder aux photos et médias sur cet appareil ?',
      title_en: 'Allow RELAIS237 to access photos and media on your device?',
      desc_fr: 'Permet d\'importer des photos de votre CNI depuis la galerie et de sauvegarder vos reçus de livraison officiels.',
      desc_en: 'Enables importing your National ID photos from the gallery and saving official delivery receipts.',
      manifestKey: 'android.permission.READ_MEDIA_IMAGES',
    }
  }[permissionType];

  const Icon = permissionDetails.icon;
  const title = language === 'fr' ? permissionDetails.title_fr : permissionDetails.title_en;
  const desc = language === 'fr' ? permissionDetails.desc_fr : permissionDetails.desc_en;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#1e1f22] text-[#e3e3e3] border border-[#3b3d42] w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
        
        {/* Android Material Dialog Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-inner">
            <Icon className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
              {permissionDetails.manifestKey}
            </span>
            <h3 className="text-base font-semibold text-white leading-snug pt-1">
              {title}
            </h3>
          </div>

          <p className="text-xs text-[#a8a8a8] leading-relaxed">
            {desc}
          </p>
        </div>

        {/* Android Native Permission Options (Android 12/13/14 Material 3 style) */}
        {!isPermanentlyDenied ? (
          <div className="space-y-2 pt-2">
            <button
              onClick={() => onGrant(permissionType)}
              className="w-full py-3 px-4 bg-[#2b2d31] hover:bg-[#35373c] active:bg-[#3d4046] text-white text-xs font-semibold rounded-2xl transition-colors text-left flex items-center justify-between group"
            >
              <span>
                {language === 'fr' ? 'Lorsque vous utilisez l\'application' : 'While using the app'}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Permission.request()</span>
            </button>

            <button
              onClick={() => onGrant(permissionType)}
              className="w-full py-3 px-4 bg-[#2b2d31] hover:bg-[#35373c] active:bg-[#3d4046] text-white text-xs font-semibold rounded-2xl transition-colors text-left"
            >
              <span>
                {language === 'fr' ? 'Uniquement cette fois-ci' : 'Only this time'}
              </span>
            </button>

            <button
              onClick={() => onDeny(permissionType)}
              className="w-full py-3 px-4 bg-transparent hover:bg-[#2b2d31] text-[#b0b3b8] hover:text-white text-xs font-semibold rounded-2xl transition-colors text-left"
            >
              <span>
                {language === 'fr' ? 'Ne pas autoriser' : 'Don\'t allow'}
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-2xl text-xs text-amber-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                {language === 'fr' 
                  ? 'Permission refusée en permanence. Utilisez openAppSettings() dans Flutter pour activer l\'accès dans les Paramètres Android.' 
                  : 'Permission permanently denied. In Flutter, openAppSettings() redirects to Android App Settings.'}
              </p>
            </div>

            <button
              onClick={() => onGrant(permissionType)}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <Settings className="w-4 h-4" />
              <span>
                {language === 'fr' ? 'Ouvrir les Paramètres (openAppSettings)' : 'Open App Settings (openAppSettings)'}
              </span>
            </button>
          </div>
        )}

        <div className="pt-2 border-t border-[#2e3035] flex items-center justify-between text-[10px] text-[#7a7d84] font-mono">
          <span>Flutter package: permission_handler ^11.0.0</span>
          <span>Android 14+</span>
        </div>
      </div>
    </div>
  );
};

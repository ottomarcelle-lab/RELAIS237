import React, { useState } from 'react';
import { 
  Database, 
  Server, 
  Cpu, 
  Shield, 
  Smartphone, 
  WifiOff, 
  Code, 
  Copy, 
  Check, 
  Download, 
  FileText, 
  Layers, 
  GitBranch, 
  Lock, 
  Globe, 
  Zap,
  MessageSquare,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { CameroonFlag } from '../common/CameroonFlag';

export const ArchitectureView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'stack' | 'db' | 'android' | 'flows' | 'cameroon_constraints'>('stack');
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [copiedManifest, setCopiedManifest] = useState<boolean>(false);
  const [copiedDart, setCopiedDart] = useState<boolean>(false);

  const sqlSchema = `-- =====================================================================
-- RELAIS237 - SCHÉMA DE BASE DE DONNÉES POSTGRESQL 16 + POSTGIS
-- Production Architecture for Express & Relay Delivery in Cameroon
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. ÉNUMÉRATIONS MÉTIER
CREATE TYPE user_role_enum AS ENUM ('sender', 'recipient', 'courier', 'relay_agent', 'admin');
CREATE TYPE kyc_status_enum AS ENUM ('pending_submission', 'under_review', 'verified', 'rejected');
CREATE TYPE payment_method_enum AS ENUM ('mtn_momo', 'orange_money', 'cash_on_delivery');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'processing', 'successful', 'failed', 'refunded');
CREATE TYPE shipment_status_enum AS ENUM (
  'draft',
  'payment_pending',
  'assigned_to_courier',
  'picked_up',
  'in_transit',
  'arrived_at_relay',
  'out_for_delivery',
  'delivered',
  'cancelled'
);

-- 2. TABLE DES UTILISATEURS (USERS)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  birth_date DATE NOT NULL,
  city VARCHAR(50) NOT NULL, -- Douala, Yaoundé, Bafoussam...
  country VARCHAR(50) NOT NULL DEFAULT 'Cameroun',
  phone_number VARCHAR(20) NOT NULL UNIQUE, -- Format international: +2376xxxxxxxx
  phone_carrier VARCHAR(30), -- MTN, Orange, Camtel
  phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  role user_role_enum NOT NULL DEFAULT 'sender',
  kyc_status kyc_status_enum NOT NULL DEFAULT 'pending_submission',
  avatar_url TEXT,
  fcm_device_token TEXT, -- Pour push notifications
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_kyc ON users(kyc_status);

-- 3. TABLE DES IDENTIFICATIONS & KYC STRICT (CNI RECTO/VERSO + WHATSAPP OTP)
CREATE TABLE identifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cni_number VARCHAR(20) NOT NULL UNIQUE, -- Numéro national à 10 chiffres
  cni_front_url TEXT NOT NULL, -- Stockage S3 sécurisé chiffré AES-256
  cni_back_url TEXT NOT NULL,
  cni_expiry_date DATE,
  whatsapp_otp_verified_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  status kyc_status_enum NOT NULL DEFAULT 'under_review',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_identifications_user ON identifications(user_id);
CREATE INDEX idx_identifications_cni ON identifications(cni_number);

-- 4. TABLE DES POINTS RELAIS PARTENAIRES (RELAY_POINTS)
CREATE TABLE relay_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  manager_name VARCHAR(100) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  city VARCHAR(50) NOT NULL,
  neighborhood VARCHAR(100) NOT NULL,
  landmark TEXT NOT NULL, -- Ex: "Face Boulangerie Saker, Carrefour Nelson Mandela"
  geom GEOMETRY(Point, 4326) NOT NULL, -- Coordonnées GPS PostGIS (SRID WGS84)
  opening_hours VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_relay_points_geom ON relay_points USING GIST(geom);

-- 5. TABLE DES COMMANDES D'EXPÉDITION (SHIPMENTS)
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_code VARCHAR(30) NOT NULL UNIQUE, -- Ex: 'R237-8849-DLA'
  delivery_pin_hash VARCHAR(255) NOT NULL, -- Hash bcrypt du code PIN 4 chiffres pour décharge
  sender_id UUID NOT NULL REFERENCES users(id),
  recipient_full_name VARCHAR(150) NOT NULL,
  recipient_phone VARCHAR(20) NOT NULL,
  recipient_city VARCHAR(50) NOT NULL,
  recipient_neighborhood VARCHAR(100) NOT NULL,
  recipient_landmark TEXT NOT NULL,
  recipient_geom GEOMETRY(Point, 4326),
  
  -- Spécifications du colis et contrôle visuel
  parcel_category VARCHAR(50) NOT NULL,
  parcel_weight_category VARCHAR(20) NOT NULL, -- 'light', 'medium', 'heavy'
  parcel_description TEXT NOT NULL,
  parcel_photo_url TEXT NOT NULL, -- Photo intégrale obligatoire
  prohibited_items_certified BOOLEAN NOT NULL DEFAULT FALSE,
  estimated_value_xaf NUMERIC(12, 2) NOT NULL DEFAULT 0,
  
  -- Tarification en FCFA
  price_xaf NUMERIC(10, 2) NOT NULL,
  insurance_fee_xaf NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_xaf NUMERIC(10, 2) NOT NULL,
  
  -- Coursier et logistique
  courier_id UUID REFERENCES users(id),
  relay_point_id UUID REFERENCES relay_points(id),
  status shipment_status_enum NOT NULL DEFAULT 'draft',
  
  -- Validation de décharge finale
  delivered_at TIMESTAMPTZ,
  recipient_signature_url TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shipments_tracking ON shipments(tracking_code);
CREATE INDEX idx_shipments_sender ON shipments(sender_id);
CREATE INDEX idx_shipments_courier ON shipments(courier_id);
CREATE INDEX idx_shipments_recipient_geom ON shipments USING GIST(recipient_geom);

-- 6. TABLE DES PAIEMENTS MOBILE MONEY (PAYMENTS)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  amount_xaf NUMERIC(10, 2) NOT NULL,
  method payment_method_enum NOT NULL, -- 'mtn_momo' ou 'orange_money'
  payer_phone VARCHAR(20) NOT NULL,
  gateway_provider VARCHAR(50) NOT NULL, -- 'MTN_OPEN_API', 'ORANGE_WEB_PAYMENT', 'CAMPAY'
  external_transaction_id VARCHAR(100) UNIQUE,
  status payment_status_enum NOT NULL DEFAULT 'pending',
  ussd_prompt_pushed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  raw_callback_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_shipment ON payments(shipment_id);
CREATE INDEX idx_payments_external_ref ON payments(external_transaction_id);

-- 7. TABLE DES ÉVÉNEMENTS & POSITIONS GPS EN TEMPS RÉEL (TRACKING_EVENTS)
CREATE TABLE tracking_events (
  id BIGSERIAL PRIMARY KEY,
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  courier_id UUID REFERENCES users(id),
  status shipment_status_enum NOT NULL,
  location_name VARCHAR(150),
  geom GEOMETRY(Point, 4326) NOT NULL, -- Position GPS exacte du coursier
  heading_degrees SMALLINT, -- Direction de la boussole
  speed_kmh SMALLINT, -- Vitesse moto en km/h
  battery_level SMALLINT, -- Niveau batterie du coursier
  network_type VARCHAR(10), -- '4G', '3G', 'EDGE'
  notes TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tracking_shipment ON tracking_events(shipment_id);
CREATE INDEX idx_tracking_geom ON tracking_events USING GIST(geom);
CREATE INDEX idx_tracking_recorded_at ON tracking_events(recorded_at DESC);
`;

  const androidManifestXml = `<!-- android/app/src/main/AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.relais237.app">

    <!-- 1. Accès à l'appareil photo (pour la photo du colis & scan CNI) -->
    <uses-permission android:name="android.permission.CAMERA" />

    <!-- 2. Accès à la galerie photo -->
    <!-- Pour Android 13+ (API 33+) -->
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <!-- Pour Android 12 et versions inférieures -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />

    <!-- 3. Accès à la géolocalisation (pour le suivi du colis & mototaxi) -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <!-- 4. Accès aux contacts (pour sélectionner le récepteur camerounais) -->
    <uses-permission android:name="android.permission.READ_CONTACTS" />

    <!-- 5. Réseau & Push USSD Mobile Money -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CALL_PHONE" />

    <application
        android:label="RELAIS237"
        android:name="\${applicationName}"
        android:icon="@mipmap/ic_launcher">
        <!-- Configuration Flutter MainActivity -->
    </application>
</manifest>`;

  const flutterDartCode = `// lib/services/permission_service.dart
// RELAIS237 - Service de gestion des permissions Android & Flutter
import 'package:permission_handler/permission_handler.dart';

class PermissionService {
  /// 1. Demande d'accès Caméra (Photo obligatoire du colis & vérification CNI)
  static Future<bool> demanderAccesCamera() async {
    PermissionStatus status = await Permission.camera.request();

    if (status.isGranted) {
      // La permission est accordée : Ouvrir l'appareil photo
      return true;
    } else if (status.isDenied) {
      // La permission est refusée temporairement
      return false;
    } else if (status.isPermanentlyDenied) {
      // Le client a coché "Ne plus demander" -> Rediriger vers les paramètres du téléphone
      await openAppSettings();
      return false;
    }
    return false;
  }

  /// 2. Demande d'accès Position GPS (Suivi temps réel Douala / Yaoundé)
  static Future<bool> demanderAccesLocalisation() async {
    PermissionStatus status = await Permission.locationWhenInUse.request();
    if (status.isGranted) return true;
    if (status.isPermanentlyDenied) {
      await openAppSettings();
    }
    return false;
  }

  /// 3. Demande d'accès Contacts (Sélection du récepteur camerounais MTN/Orange)
  static Future<bool> demanderAccesContacts() async {
    PermissionStatus status = await Permission.contacts.request();
    if (status.isGranted) return true;
    if (status.isPermanentlyDenied) {
      await openAppSettings();
    }
    return false;
  }

  /// 4. Demande d'accès Galerie (Android 13+ READ_MEDIA_IMAGES / Android 12 Storage)
  static Future<bool> demanderAccesGalerie() async {
    PermissionStatus status = await Permission.photos.request();
    if (status.isGranted) return true;
    if (status.isPermanentlyDenied) {
      await openAppSettings();
    }
    return false;
  }
}
`;

  const copySqlToClipboard = () => {
    navigator.clipboard?.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const copyManifestToClipboard = () => {
    navigator.clipboard?.writeText(androidManifestXml);
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 2000);
  };

  const copyDartToClipboard = () => {
    navigator.clipboard?.writeText(flutterDartCode);
    setCopiedDart(true);
    setTimeout(() => setCopiedDart(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header section */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
                Dossier d'Architecture Système & Spécifications
              </span>
              <CameroonFlag size="sm" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Architecture Technique & Modèle de Données RELAIS237
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
              Spécifications d'ingénierie complètes pour une plateforme de livraison et relais colis 
              au Cameroun (KYC CNI certifié, Mobile Money MoMo/OM, WhatsApp OTP, Suivi GPS PostGIS, Permissions Android / Flutter).
            </p>
          </div>

          <button
            onClick={copySqlToClipboard}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs"
          >
            {copiedSql ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copiedSql ? 'Schéma SQL Copié !' : 'Copier Schéma SQL DDL'}</span>
          </button>
        </div>

        {/* Sub-navigation tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-2 border-t border-slate-200 dark:border-slate-900">
          <button
            onClick={() => setActiveSubTab('stack')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'stack'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>A. Stack Technique Recommandée</span>
          </button>

          <button
            onClick={() => setActiveSubTab('db')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'db'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>B. Modèle de Données & Schéma SQL</span>
          </button>

          <button
            onClick={() => setActiveSubTab('android')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'android'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>D. AndroidManifest & Permissions Flutter</span>
          </button>

          <button
            onClick={() => setActiveSubTab('flows')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'flows'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>C. Flux Utilisateurs & Sécurité</span>
          </button>

          <button
            onClick={() => setActiveSubTab('cameroon_constraints')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'cameroon_constraints'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-amber-500" />
            <span>E. Optimisations Marché Cameroun</span>
          </button>
        </div>
      </div>


      {/* SUB-TAB 1: STACK TECHNIQUE RECOMMANDÉE */}
      {activeSubTab === 'stack' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mobile Stack */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Frontend Mobile</h3>
                  <span className="text-[11px] text-emerald-400 font-semibold">Flutter (Dart) 3.24+</span>
                </div>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li><strong className="text-white">Raison :</strong> 60 FPS garantis sur smartphones Android d'entrée de gamme (Infinix, Tecno, Itel, Samsung A-series très répandus au Cameroun).</li>
                <li><strong className="text-white">Offline-First :</strong> Cache local Hive / SQLite pour fonctionner même lors des coupures de réseau 3G/4G.</li>
                <li><strong className="text-white">Taille APK :</strong> Optimisation ProGuard & Split Per-ABI (&lt; 18 Mo pour téléchargements économiques en forfait data).</li>
              </ul>
            </div>

            {/* Backend Stack */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Backend API & Realtime</h3>
                  <span className="text-[11px] text-emerald-400 font-semibold">Node.js / NestJS (TypeScript)</span>
                </div>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li><strong className="text-white">Architecture :</strong> Modulaire NestJS avec validation DTO stricte (class-validator).</li>
                <li><strong className="text-white">Base :</strong> PostgreSQL 16 + extension PostGIS pour calculs géodésiques rapides (distances coursier-relais).</li>
                <li><strong className="text-white">Temps Réel :</strong> Redis Pub/Sub + WebSockets (Socket.IO) avec fallback HTTP Long-polling pour réseau instable.</li>
              </ul>
            </div>

            {/* Integrations Stack */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Passerelles Cameroun</h3>
                  <span className="text-[11px] text-amber-400 font-semibold">MoMo, OM & WhatsApp API</span>
                </div>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li><strong className="text-white">Paiement :</strong> MTN MoMo Collection API (*126#) + Orange Money Web Payment (#150#) avec agrégateur secours (Campay / Maviance).</li>
                <li><strong className="text-white">WhatsApp OTP :</strong> Meta Cloud API / Infobip pour délivrabilité garantie à 99% (les SMS classiques ont souvent 15 min de retard).</li>
                <li><strong className="text-white">Stockage CNI :</strong> AWS S3 / Cloudflare R2 avec chiffrement AES-256 et liens éphémères (Presigned URLs 5 min).</li>
              </ul>
            </div>
          </div>

          {/* Architecture Diagram Visualization */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Diagramme d'Architecture Logique Globale RELAIS237</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] text-blue-400 font-mono font-bold">CLIENT APP</span>
                <p className="font-bold text-white">App Mobile Flutter</p>
                <p className="text-[10px] text-slate-400">Expéditeur · Récepteur · Livreur Moto</p>
                <div className="text-[9px] text-emerald-400 font-mono mt-1">Hive Cache + WebRTC/WS</div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] text-amber-400 font-mono font-bold">GATEWAY & TRAFIC</span>
                <p className="font-bold text-white">Cloudflare & Nginx</p>
                <p className="text-[10px] text-slate-400">SSL Termination · Rate Limiting anti-DDoS</p>
                <div className="text-[9px] text-amber-400 font-mono mt-1">Compression WebP / Gzip</div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] text-emerald-400 font-mono font-bold">CORE SERVICES</span>
                <p className="font-bold text-white">NestJS Microservices</p>
                <p className="text-[10px] text-slate-400">Auth KYC · Shipment · Tracking GPS · Escrow</p>
                <div className="text-[9px] text-emerald-400 font-mono mt-1">BullMQ Queue + Redis</div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] text-purple-400 font-mono font-bold">PERSISTENCE & APIS</span>
                <p className="font-bold text-white">PostgreSQL + PostGIS</p>
                <p className="text-[10px] text-slate-400">MTN MoMo · Orange Money · WhatsApp API</p>
                <div className="text-[9px] text-purple-400 font-mono mt-1">AES-256 Storage</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: MODÈLE DE DONNÉES & SCHÉMA SQL */}
      {activeSubTab === 'db' && (
        <div className="space-y-6">
          {/* Table summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {[
              { name: 'users', count: '12 cols', desc: 'Identité, Tél, Rôles' },
              { name: 'identifications', count: '10 cols', desc: 'CNI Recto/Verso KYC' },
              { name: 'shipments', count: '22 cols', desc: 'Colis, PIN, Adresses' },
              { name: 'payments', count: '11 cols', desc: 'MoMo & OM Séquestre' },
              { name: 'tracking_events', count: '11 cols', desc: 'GPS PostGIS temps réel' },
              { name: 'relay_points', count: '9 cols', desc: 'Hubs boutiques relais' },
            ].map((tbl) => (
              <div key={tbl.name} className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-left">
                <span className="text-[10px] font-mono text-emerald-400 font-bold block">{tbl.name}</span>
                <span className="text-xs font-bold text-white">{tbl.count}</span>
                <p className="text-[9px] text-slate-400 mt-0.5">{tbl.desc}</p>
              </div>
            ))}
          </div>

          {/* DDL Code Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>schema_relais237_cameroon.sql</span>
              </div>
              <button
                onClick={copySqlToClipboard}
                className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-semibold transition-colors flex items-center gap-1.5"
              >
                {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSql ? 'Copié' : 'Copier'}</span>
              </button>
            </div>

            <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-[500px]">
              <code>{sqlSchema}</code>
            </pre>
          </div>
        </div>
      )}

      {/* SUB-TAB: ANDROID MANIFEST & PERMISSIONS FLUTTER */}
      {activeSubTab === 'android' && (
        <div className="space-y-6">
          {/* Top Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold block">1. CAMERA</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Photo Colis & CNI</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Contrôle visuel obligatoire anti-armes/drogues & scan CNI biométrique.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-bold block">2. FINE_LOCATION</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white">GPS Précis PostGIS</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Positionnement métrique pour mototaxis à Akwa, Deïdo, Bastos, Mokolo.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold block">3. READ_CONTACTS</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Carnet Récepteur</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Sélection 1-clic des contacts SIM camerounais sans erreur de saisie MTN/Orange.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono font-bold block">4. READ_MEDIA_IMAGES</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Android 13+ & 12-</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Import des scans CNI depuis la galerie et archivage des reçus de décharge.</p>
            </div>
          </div>

          {/* AndroidManifest.xml Code Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-white">android/app/src/main/AndroidManifest.xml</span>
              </div>
              <button
                onClick={copyManifestToClipboard}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                {copiedManifest ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedManifest ? 'Copié !' : 'Copier XML'}</span>
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-emerald-300 bg-slate-950/90 overflow-x-auto leading-relaxed max-h-72">
              <code>{androidManifestXml}</code>
            </pre>
          </div>

          {/* Flutter pubspec & Dart Service */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* pubspec.yaml */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg p-4 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Code className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono font-bold text-white">pubspec.yaml</span>
              </div>
              <pre className="p-3 text-[11px] font-mono text-amber-200 bg-slate-950 rounded-lg overflow-x-auto">
{`dependencies:
  flutter:
    sdk: flutter
  permission_handler: ^11.0.0
  geolocator: ^12.0.0
  camera: ^0.11.0
  image_picker: ^1.1.2`}
              </pre>
              <div className="text-[11px] text-slate-400 leading-snug space-y-1">
                <p>• <strong className="text-slate-200">permission_handler ^11.0.0</strong> gère les cycles de vie des permissions d'exécution (Runtime Permissions) sur Android 6 à 14+.</p>
                <p>• Prise en charge automatique de <code className="text-emerald-400 font-mono">openAppSettings()</code> si l'utilisateur coche <em>"Ne plus demander"</em>.</p>
              </div>
            </div>

            {/* Dart Service lib/services/permission_service.dart */}
            <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
              <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-mono font-bold text-white">lib/services/permission_service.dart</span>
                </div>
                <button
                  onClick={copyDartToClipboard}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
                >
                  {copiedDart ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDart ? 'Copié !' : 'Copier Dart'}</span>
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-blue-200 bg-slate-950/90 overflow-x-auto leading-relaxed max-h-72">
                <code>{flutterDartCode}</code>
              </pre>
            </div>
          </div>

          {/* Permission Lifecycle Explanation */}
          <div className="bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Cycle de Vie des Permissions (Flutter PermissionStatus)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 block mb-1">status.isGranted</span>
                <p className="text-[11px] text-slate-700 dark:text-slate-300">Accès accordé. L'application ouvre instantanément la caméra, la carte GPS ou le carnet de contacts.</p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg">
                <span className="font-mono font-bold text-amber-700 dark:text-amber-400 block mb-1">status.isDenied</span>
                <p className="text-[11px] text-slate-700 dark:text-slate-300">Refus temporaire. Une boîte d'explication pédagogique s'affiche avant une seconde demande.</p>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg">
                <span className="font-mono font-bold text-rose-700 dark:text-rose-400 block mb-1">status.isPermanentlyDenied</span>
                <p className="text-[11px] text-slate-700 dark:text-slate-300">Refus définitif. Appel automatique de <code className="font-mono text-rose-500">openAppSettings()</code> pour guider l'utilisateur dans les Paramètres Android.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: FLUX UTILISATEURS & SÉCURITÉ */}
      {activeSubTab === 'flows' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Flow 1: KYC WhatsApp */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono">1</div>
                <span>Flux Inscription & KYC Strict</span>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <span className="font-semibold text-emerald-400">1. Saisie des données civiles</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Nom, prénom, date naissance, ville de résidence camerounaise.</p>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <span className="font-semibold text-emerald-400">2. Upload CNI Recto & Verso</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Contrôle de netteté, détection OCR du numéro de CNI à 10 chiffres.</p>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <span className="font-semibold text-emerald-400">3. OTP WhatsApp 6 chiffres</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Envoi instantané via Meta Cloud API, validation en moins de 60s.</p>
                </div>
              </div>
            </div>

            {/* Flow 2: Commande & Paiement */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono">2</div>
                <span>Flux Expédition & Paiement MoMo/OM</span>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <span className="font-semibold text-amber-400">1. Définition destination & Repère</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Quartier + Carrefour / Repère visuel + Coordonnées GPS précises.</p>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <span className="font-semibold text-amber-400">2. Photo intégrale du colis</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Vérification visuelle et engagement anti-contrebande (armes/drogues).</p>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <span className="font-semibold text-amber-400">3. Débit USSD sous séquestre</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Push USSD MTN (*126#) ou Orange (#150#). Argent séquestré jusqu'à la livraison.</p>
                </div>
              </div>
            </div>

            {/* Flow 3: Double Handshake Livraison */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-mono">3</div>
                <span>Flux Double Validation de Remise</span>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <span className="font-semibold text-blue-400">1. Partage WhatsApp du code</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">L'expéditeur transmet le lien contenant le tracking et le PIN secret au récepteur.</p>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <span className="font-semibold text-blue-400">2. Rencontre & Comparaison</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Le récepteur vérifie le code du coursier et lui donne le PIN secret uniquement si le colis est conforme.</p>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <span className="font-semibold text-blue-400">3. Signature & Déblocage des fonds</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Émargement numérique horodaté, clôture de la commande et paiement du livreur.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: CONTRAINTES & SPÉCIFICITÉS MARCHÉ CAMEROUN */}
      {activeSubTab === 'cameroon_constraints' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <WifiOff className="w-4 h-4" />
                <span>1. Connectivité Internet Variable (2G/3G/4G & Coupures)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Au Cameroun, la couverture data fluctue rapidement entre les quartiers (zones blanches à Deïdo, Bonamoussadi ou Mendong). 
                L'application intègre une architecture <strong className="text-white">Offline-First</strong> :
              </p>
              <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                <li>Compression WebP côté client : les photos de colis et de CNI passent de 6 Mo à ~180 Ko avant l'upload.</li>
                <li>Queue locale de synchronisation : si le livreur perd la 4G, la signature et les points GPS sont mis en mémoire tampon et synchronisés dès le retour du réseau.</li>
              </ul>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Globe className="w-4 h-4" />
                <span>2. Système d'Adressage Urbain Informel</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Les villes camerounaises (Douala, Yaoundé) ne disposent pas d'un système de numérotation de rue exhaustif. 
                L'application combine deux piliers obligatoires :
              </p>
              <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                <li><strong className="text-white">Repères Visuels Populaires :</strong> Carrefours célèbres ("Carrefour Nelson Mandela", "Rond-point Express"), stations-service (Tradex, Total, Oilibya), boulangeries (Saker, Zepol).</li>
                <li><strong className="text-white">Épingle GPS Haute Résolution :</strong> Permet au mototaxi de se guider directement au mètre près.</li>
              </ul>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                <MessageSquare className="w-4 h-4" />
                <span>3. Omniprésence de WhatsApp au Cameroun</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Plus de 85% des utilisateurs de smartphones au Cameroun privilégient WhatsApp sur les forfaits "WhatsApp Illimité".
              </p>
              <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                <li>L'authentification OTP via WhatsApp garantit un taux de délivrabilité proche de 100% contre ~70% pour les SMS classiques locaux.</li>
                <li>Le partage du code de décharge en un clic via <code className="text-emerald-400 font-mono">wa.me</code> évite toute erreur de frappe.</li>
              </ul>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                <Shield className="w-4 h-4" />
                <span>4. Conformité Réglementaire Camerounaise (ANTIC & Loi Postale)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Conformité stricte avec la Loi N° 2010/012 du 21 décembre 2010 relative à la cybersécurité et la cybercriminalité au Cameroun :
              </p>
              <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                <li>Conservation sécurisée et chiffrée des scans CNI sous séquestre pour traçabilité légale.</li>
                <li>Interdiction stricte de transport de marchandises dangereuses ou non déclarées avec avertissement légal obligatoire.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

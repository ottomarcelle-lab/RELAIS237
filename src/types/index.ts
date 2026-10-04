/**
 * Types & Enums for RELAIS237 - Application de Livraison et Relais Colis au Cameroun
 */

export type CityCameroon = 'Douala' | 'Yaoundé';

export type UserRole = 'sender' | 'recipient' | 'courier' | 'relay_agent' | 'admin';

export type KycStatus = 'pending_submission' | 'under_review' | 'verified' | 'rejected';

export type PaymentMethodType = 'mtn_momo' | 'orange_money' | 'cash_on_delivery';

export type PaymentStatus = 'pending' | 'processing' | 'successful' | 'failed' | 'refunded';

export interface CustomerReview {
  id: string;
  authorName: string;
  city: CityCameroon;
  neighborhood: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  avatarUrl?: string;
  verifiedDeliveryCode: string;
}

export interface BestCourier {
  id: string;
  fullName: string;
  phone: string;
  city: CityCameroon;
  vehicle: string;
  rating: number;
  totalDeliveries: number;
  onTimeRate: number; // e.g. 99.4%
  badgeTitle: string;
  avatarUrl?: string;
  memberSince: string;
  testimonialQuote: string;
}


export type ShipmentStatus = 
  | 'draft'
  | 'payment_pending'
  | 'assigned_to_courier'
  | 'picked_up'
  | 'in_transit'
  | 'arrived_at_relay'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  city: CityCameroon;
  country: string; // 'Cameroun'
  phone: string; // e.g. "+237 670 00 00 00"
  phoneCarrier: 'MTN' | 'Orange' | 'Camtel' | 'Autre';
  phoneVerified: boolean;
  kycStatus: KycStatus;
  role: UserRole;
  createdAt: string;
  avatarUrl?: string;
}

export interface IdentificationKyc {
  id: string;
  userId: string;
  cniNumber: string;
  cniFrontUrl: string;
  cniBackUrl: string;
  cniExpiryDate: string;
  faceMatchScore?: number;
  reviewedBy?: string;
  reviewedAt?: string;
  verificationMethod: 'WHATSAPP_OTP_CNI';
  whatsappOtpVerifiedAt?: string;
  status: KycStatus;
}

export interface ParcelDetails {
  weightCategory: 'light' | 'medium' | 'heavy'; // <2kg, 2-5kg, >5kg
  description: string;
  category: 'documents' | 'electronics' | 'clothing' | 'food_dry' | 'medicine' | 'other';
  parcelPhotoUrl: string;
  isInspectedForContraband: boolean;
  prohibitedItemsConfirmed: boolean; // Confirms no weapons, narcotics, explosives, illegal goods
  estimatedValueXaf: number;
}

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  city: CityCameroon;
  neighborhood: string; // Quartier (ex: Akwa, Bonapriso, Bastos, Mokolo)
  landmark: string; // Repère camerounais (ex: "Face Station Tradex, Carrefour Nelson Mandela")
  latitude: number;
  longitude: number;
  deliveryInstructions?: string;
}

export interface Shipment {
  id: string;
  trackingCode: string; // e.g. "R237-7892-DLA"
  deliveryPin: string; // 4-digit code e.g. "4921" shared with recipient
  senderId: string;
  senderName: string;
  senderPhone: string;
  pickupAddress: DeliveryAddress;
  recipientAddress: DeliveryAddress;
  parcel: ParcelDetails;
  status: ShipmentStatus;
  courierId?: string;
  courierName?: string;
  courierPhone?: string;
  courierVehicle?: string; // e.g. "Moto Boxer 150cc - LT 892 AK"
  courierMatricule?: string; // e.g. "LT 892 AK" - Matricule / Plaque officielle visible en entier
  relayPointId?: string;
  priceXaf: number;
  insuranceFeeXaf: number;
  totalXaf: number;
  pickupMode?: 'home' | 'agency';
  pickupFeeXaf?: number;
  distanceKm?: number;
  weightKg?: number;
  rating?: number;
  ratingComment?: string;
  paymentId?: string;
  paymentMethod?: PaymentMethodType;
  paymentStatus: PaymentStatus;
  createdAt: string;
  deliveredAt?: string;
  receiptNumber?: string;
  estimatedDeliveryTime: string;
  currentGps: {
    lat: number;
    lng: number;
    heading: number;
    speedKmh: number;
    lastUpdated: string;
  };
}

export interface PaymentTransaction {
  id: string;
  shipmentId: string;
  userId: string;
  amountXaf: number;
  method: PaymentMethodType;
  carrierNumber: string;
  externalTransactionRef: string; // MoMo / OM reference
  status: PaymentStatus;
  ussdPromptSent: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface TrackingPoint {
  id: string;
  shipmentId: string;
  latitude: number;
  longitude: number;
  status: ShipmentStatus;
  statusLabel: string;
  locationName: string;
  timestamp: string;
  notes?: string;
}

export interface RelayPoint {
  id: string;
  name: string;
  managerName: string;
  phone: string;
  city: CityCameroon;
  neighborhood: string;
  landmark: string;
  latitude: number;
  longitude: number;
  openingHours: string;
  capacityScore: number;
}

export type AndroidPermissionType = 'camera' | 'location' | 'contacts' | 'media';

export interface AppContact {
  id: string;
  name: string;
  phone: string;
  city: CityCameroon;
  neighborhood: string;
  landmark: string;
}

export interface SupportTicket {
  id?: string;
  userId?: string;
  fullName: string;
  phone: string;
  city: CityCameroon;
  category: 'tracking' | 'payment_momo_om' | 'kyc_cni' | 'relay_point' | 'other';
  trackingCode?: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
}

export interface FaqItem {
  id: string;
  category: 'zones' | 'rates' | 'payment' | 'security' | 'relay' | 'insurance';
  question_fr: string;
  question_en: string;
  answer_fr: string;
  answer_en: string;
  targetCities: CityCameroon[];
  tags: string[];
}


import { CityCameroon, RelayPoint, Shipment, User } from '../types';

export const CITIES_CAMEROON: { name: CityCameroon; region: string; postalCode: string; description: string }[] = [
  { name: 'Douala', region: 'Littoral', postalCode: 'LT', description: 'Capitale économique · Akwa, Bonanjo, Deïdo, Bonamoussadi, Ndokoti' },
  { name: 'Yaoundé', region: 'Centre', postalCode: 'CE', description: 'Capitale politique · Bastos, Mokolo, Omnisport, Tsinga, Mendong' },
];

export const SAMPLE_CUSTOMER_REVIEWS = [
  {
    id: 'rev_1',
    authorName: 'Christelle Ngo Matip',
    city: 'Douala' as CityCameroon,
    neighborhood: 'Bonamoussadi',
    rating: 5,
    comment: 'Franchement le système de double validation par code PIN est révolutionnaire à Douala ! Mon colis de médicaments est arrivé intact en 32 minutes de Akwa à Bonamoussadi.',
    comment_en: 'Honestly, the double validation PIN system is a game-changer in Douala! My medicine package arrived intact in 32 minutes from Akwa to Bonamoussadi.',
    date: 'Il y a 2 jours',
    date_en: '2 days ago',
    verifiedDeliveryCode: 'R237-8849-DLA'
  },
  {
    id: 'rev_2',
    authorName: 'Patrice Kamgaing',
    city: 'Yaoundé' as CityCameroon,
    neighborhood: 'Bastos',
    rating: 5,
    comment: 'Paiement MTN MoMo sans aucun souci, prompt USSD direct sur mon téléphone et livreur très courtois. Enfin un service de livraison sérieux au Cameroun.',
    comment_en: 'MTN MoMo payment went smoothly, instant USSD prompt on my phone and the courier was very polite. Finally a reliable delivery service in Cameroon.',
    date: 'Il y a 3 jours',
    date_en: '3 days ago',
    verifiedDeliveryCode: 'R237-5192-YDE'
  },
  {
    id: 'rev_3',
    authorName: 'Aïssatou Mohamadou',
    city: 'Douala' as CityCameroon,
    neighborhood: 'Akwa',
    rating: 5,
    comment: 'J\'avais peur pour des documents originaux de justice, mais la photo du colis prise au départ et la vérification CNI m\'ont totalement rassurée. Bravo RELAIS237 !',
    comment_en: 'I was worried about original legal papers, but the parcel photo taken at pickup and National ID check completely reassured me. Bravo RELAIS237!',
    date: 'Il y a 5 jours',
    date_en: '5 days ago',
    verifiedDeliveryCode: 'R237-6410-DLA'
  },
  {
    id: 'rev_4',
    authorName: 'Guy-Bertrand Fotso',
    city: 'Yaoundé' as CityCameroon,
    neighborhood: 'Mokolo',
    rating: 5,
    comment: 'Même avec les embouteillages légendaires de Mokolo, le mototaxi est passé par les raccourcis et a trouvé mon repère face à la pharmacie du premier coup.',
    comment_en: 'Even with the legendary Mokolo traffic jams, the motorcycle courier took shortcuts and found my landmark across the pharmacy on the first try.',
    date: 'Il y a 1 semaine',
    date_en: '1 week ago',
    verifiedDeliveryCode: 'R237-3310-YDE'
  }
];

export const TOP_COURIER_OF_MONTH = {
  id: 'cour_dla_08',
  fullName: 'Jean-Paul Etoa',
  phone: '+237 675 22 11 00',
  city: 'Douala' as CityCameroon,
  vehicle: 'Moto TVS HLX 150cc - LT 742 BX (Casque Jaune Certifié)',
  vehicle_en: 'Motorbike TVS HLX 150cc - LT 742 BX (Certified Yellow Helmet)',
  rating: 4.98,
  totalDeliveries: 684,
  onTimeRate: 99.4,
  badgeTitle: 'Livreur d\'Or du Mois · Douala & Périphérie',
  badgeTitle_en: 'Top Gold Courier of the Month · Douala & Suburbs',
  memberSince: 'Mars 2025',
  memberSince_en: 'March 2025',
  testimonialQuote: '« Pour moi, chaque colis est sacré. La sécurité des biens et le respect du code secret avec le client sont ma priorité numéro un. »',
  testimonialQuote_en: '“To me, every parcel is sacred. The safety of goods and respecting the secret PIN with the customer are my number one priority.”'
};



export const NEIGHBORHOODS_DOUALA = [
  'Akwa (Centre d\'affaires)',
  'Bonanjo (Plateau administratif)',
  'Bonamoussadi (Zone résidentielle)',
  'Deïdo (Rond-point & 4 Chemins)',
  'Ndokoti (Carrefour commercial)',
  'Bali (Rue des manguiers)',
  'Makepe (Carrefour Rhône-Poulenc)',
  'Bassa / Zone Industrielle',
  'Logpom (Bassong)',
  'Bonapriso (Rue Njo-Njo)'
];

export const NEIGHBORHOODS_YAOUNDE = [
  'Bastos (Ambassades)',
  'Mokolo (Grand marché)',
  'Omnisport (Stade Ahmadou Ahidjo)',
  'Biyem-Assi (Rond-point Express)',
  'Nlongkak (Rond-point)',
  'Tsinga (Sous-préfecture)',
  'Mvan (Gare routière)',
  'Mendong (Montée des sœurs)',
  'Essos (Hôpital CNPS)',
  'Centre-ville (Poste Centrale)'
];

export const SAMPLE_RELAY_POINTS: RelayPoint[] = [
  {
    id: 'relay-dla-01',
    name: 'Point Relais Saker Akwa',
    managerName: 'Mbella Christine',
    phone: '+237 677 12 34 56',
    city: 'Douala',
    neighborhood: 'Akwa',
    landmark: 'En face de l\'Hôtel Prince de Galles, Boulevard de la Liberté',
    latitude: 4.0511,
    longitude: 9.7043,
    openingHours: '07h30 - 20h00',
    capacityScore: 95
  },
  {
    id: 'relay-dla-02',
    name: 'Point Relais Tradex Ndokoti',
    managerName: 'Kenfack Paulin',
    phone: '+237 699 45 67 89',
    city: 'Douala',
    neighborhood: 'Ndokoti',
    landmark: 'Station Tradex carrefour Ndokoti, à côté de la pharmacie',
    latitude: 4.0438,
    longitude: 9.7422,
    openingHours: '06h00 - 22h00',
    capacityScore: 88
  },
  {
    id: 'relay-yde-01',
    name: 'Point Relais Bastos Express',
    managerName: 'Ngo Bisseck Suzanne',
    phone: '+237 671 88 99 00',
    city: 'Yaoundé',
    neighborhood: 'Bastos',
    landmark: 'Carrefour Bastos, boutique bio face ambassade de Belgique',
    latitude: 3.8920,
    longitude: 11.5125,
    openingHours: '08h00 - 19h30',
    capacityScore: 92
  }
];

export const INITIAL_USER: User = {
  id: 'usr_237_7891',
  firstName: 'Samuel',
  lastName: 'Eto\'o Tchakounte',
  birthDate: '1992-06-18',
  city: 'Douala',
  country: 'Cameroun',
  phone: '+237 674 89 22 10',
  phoneCarrier: 'MTN',
  phoneVerified: true,
  kycStatus: 'verified',
  role: 'sender',
  createdAt: '2026-02-14T09:30:00Z',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
};

export const SAMPLE_ACTIVE_SHIPMENT: Shipment = {
  id: 'shp_dla_9941',
  trackingCode: 'R237-8849-DLA',
  deliveryPin: '5824',
  senderId: 'usr_237_7891',
  senderName: 'Samuel Eto\'o T.',
  senderPhone: '+237 674 89 22 10',
  pickupAddress: {
    fullName: 'Samuel Eto\'o T.',
    phone: '+237 674 89 22 10',
    city: 'Douala',
    neighborhood: 'Akwa',
    landmark: 'Boulevard de la Liberté, face Direction MTN Akwa',
    latitude: 4.0520,
    longitude: 9.7025,
    deliveryInstructions: 'Bureau 2ème étage, sonner à l\'interphone'
  },
  recipientAddress: {
    fullName: 'Marie-Claire Biya',
    phone: '+237 699 14 38 29',
    city: 'Douala',
    neighborhood: 'Bonamoussadi',
    landmark: 'Carrefour Nelson Mandela, face Boulangerie Saker, portail bleu',
    latitude: 4.0885,
    longitude: 9.7360,
    deliveryInstructions: 'Remettre uniquement après vérification du code PIN'
  },
  parcel: {
    weightCategory: 'light',
    description: 'Documents juridiques urgents + boîte de médicaments scellée',
    category: 'documents',
    parcelPhotoUrl: '/src/assets/images/parcel_photo_cameroon_1791064170034.jpg',
    isInspectedForContraband: true,
    prohibitedItemsConfirmed: true,
    estimatedValueXaf: 45000
  },
  status: 'out_for_delivery',
  courierId: 'cour_dla_08',
  courierName: 'Jean-Paul Etoa',
  courierPhone: '+237 675 22 11 00',
  courierVehicle: 'Moto TVS HLX 150cc - LT 742 BX (Casque Jaune Relais237)',
  courierMatricule: 'LT 742 BX',
  priceXaf: 1500,
  insuranceFeeXaf: 200,
  totalXaf: 1700,
  paymentId: 'pay_momo_88291',
  paymentStatus: 'successful',
  paymentMethod: 'mtn_momo',
  createdAt: '2026-10-03T11:45:00Z',
  estimatedDeliveryTime: 'Aujourd\'hui vers 16h15',
  currentGps: {
    lat: 4.0725,
    lng: 9.7210,
    heading: 42,
    speedKmh: 34,
    lastUpdated: 'Il y a 2 minutes'
  }
};

export const SAMPLE_PAST_SHIPMENTS: Shipment[] = [
  {
    id: 'shp_dla_8820',
    trackingCode: 'R237-6410-DLA',
    deliveryPin: '9312',
    senderId: 'usr_237_7891',
    senderName: 'Samuel Eto\'o T.',
    senderPhone: '+237 674 89 22 10',
    pickupAddress: {
      fullName: 'Samuel Eto\'o T.',
      phone: '+237 674 89 22 10',
      city: 'Douala',
      neighborhood: 'Akwa',
      landmark: 'Rue Pau, immeuble Activa',
      latitude: 4.0489,
      longitude: 9.6994
    },
    recipientAddress: {
      fullName: 'Fabrice Ondoa',
      phone: '+237 677 82 19 04',
      city: 'Douala',
      neighborhood: 'Bonanjo',
      landmark: 'Place du Gouvernement, face Cour d\'Appel du Littoral',
      latitude: 4.0421,
      longitude: 9.6890,
      deliveryInstructions: 'Décharge au secrétariat général'
    },
    parcel: {
      weightCategory: 'medium',
      description: 'Pièces détachées groupe électrogène & filtre à carburant',
      category: 'other',
      parcelPhotoUrl: '/src/assets/images/parcel_photo_cameroon_1791064170034.jpg',
      isInspectedForContraband: true,
      prohibitedItemsConfirmed: true,
      estimatedValueXaf: 65000
    },
    status: 'delivered',
    courierId: 'cour_dla_03',
    courierName: 'Alain Ndongo',
    courierPhone: '+237 678 90 12 34',
    courierVehicle: 'Moto Boxer 150cc - LT 319 CH',
    priceXaf: 2200,
    insuranceFeeXaf: 300,
    totalXaf: 2500,
    paymentId: 'MOMO-CMR-908124',
    paymentMethod: 'mtn_momo',
    paymentStatus: 'successful',
    createdAt: '2026-09-28T08:15:00Z',
    deliveredAt: '2026-09-28T09:42:00Z',
    receiptNumber: 'REC-237-20260928-8820',
    estimatedDeliveryTime: 'Livré avec succès',
    currentGps: {
      lat: 4.0421,
      lng: 9.6890,
      heading: 0,
      speedKmh: 0,
      lastUpdated: '28 Septembre 2026'
    }
  },
  {
    id: 'shp_yde_7714',
    trackingCode: 'R237-5192-YDE',
    deliveryPin: '4185',
    senderId: 'usr_237_7891',
    senderName: 'Samuel Eto\'o T.',
    senderPhone: '+237 674 89 22 10',
    pickupAddress: {
      fullName: 'Samuel Eto\'o T.',
      phone: '+237 674 89 22 10',
      city: 'Yaoundé',
      neighborhood: 'Bastos',
      landmark: 'Carrefour Bastos, face Ambassade de France',
      latitude: 3.8940,
      longitude: 11.5160
    },
    recipientAddress: {
      fullName: 'Gervaise Ngo Bisseck',
      phone: '+237 694 55 12 88',
      city: 'Yaoundé',
      neighborhood: 'Mokolo',
      landmark: 'Carrefour Marché Mokolo, boutique cosmétique N° 44',
      latitude: 3.8760,
      longitude: 11.4980,
      deliveryInstructions: 'Remettre en main propre à Mme Ngo'
    },
    parcel: {
      weightCategory: 'light',
      description: 'Échantillons cosmétiques bio & crèmes de karité artisanales',
      category: 'clothing',
      parcelPhotoUrl: '/src/assets/images/parcel_photo_cameroon_1791064170034.jpg',
      isInspectedForContraband: true,
      prohibitedItemsConfirmed: true,
      estimatedValueXaf: 30000
    },
    status: 'delivered',
    courierId: 'cour_yde_02',
    courierName: 'Paul Biloa',
    courierPhone: '+237 699 33 21 00',
    courierVehicle: 'Moto TVS Neo 125cc - CE 890 AA',
    priceXaf: 1600,
    insuranceFeeXaf: 200,
    totalXaf: 1800,
    paymentId: 'OM-CMR-441829',
    paymentMethod: 'orange_money',
    paymentStatus: 'successful',
    createdAt: '2026-09-15T10:00:00Z',
    deliveredAt: '2026-09-15T11:15:00Z',
    receiptNumber: 'REC-237-20260915-7714',
    estimatedDeliveryTime: 'Livré avec succès',
    currentGps: {
      lat: 3.8760,
      lng: 11.4980,
      heading: 0,
      speedKmh: 0,
      lastUpdated: '15 Septembre 2026'
    }
  },
  {
    id: 'shp_dla_6619',
    trackingCode: 'R237-4029-DLA',
    deliveryPin: '7721',
    senderId: 'usr_237_7891',
    senderName: 'Samuel Eto\'o T.',
    senderPhone: '+237 674 89 22 10',
    pickupAddress: {
      fullName: 'Samuel Eto\'o T.',
      phone: '+237 674 89 22 10',
      city: 'Douala',
      neighborhood: 'Deïdo',
      landmark: 'Rond-point Deïdo, Pharmacie des 4 Chemins',
      latitude: 4.0620,
      longitude: 9.7120
    },
    recipientAddress: {
      fullName: 'André Zambo Anguissa',
      phone: '+237 670 11 99 22',
      city: 'Douala',
      neighborhood: 'Ndokoti',
      landmark: 'Carrefour Ndokoti, entrée marché Congo, face Station Total',
      latitude: 4.0440,
      longitude: 9.7430
    },
    parcel: {
      weightCategory: 'light',
      description: 'Passeport biométrique & documents d\'adhésion originaux',
      category: 'documents',
      parcelPhotoUrl: '/src/assets/images/parcel_photo_cameroon_1791064170034.jpg',
      isInspectedForContraband: true,
      prohibitedItemsConfirmed: true,
      estimatedValueXaf: 100000
    },
    status: 'delivered',
    courierId: 'cour_dla_08',
    courierName: 'Jean-Paul Etoa',
    courierPhone: '+237 675 22 11 00',
    courierVehicle: 'Moto TVS HLX 150cc - LT 742 BX',
    priceXaf: 1500,
    insuranceFeeXaf: 500,
    totalXaf: 2000,
    paymentId: 'MOMO-CMR-339102',
    paymentMethod: 'mtn_momo',
    paymentStatus: 'successful',
    createdAt: '2026-09-04T14:20:00Z',
    deliveredAt: '2026-09-04T15:10:00Z',
    receiptNumber: 'REC-237-20260904-6619',
    estimatedDeliveryTime: 'Livré avec succès',
    currentGps: {
      lat: 4.0440,
      lng: 9.7430,
      heading: 0,
      speedKmh: 0,
      lastUpdated: '04 Septembre 2026'
    }
  }
];

export const SAMPLE_CAMEROON_CONTACTS = [
  {
    id: 'ct_1',
    name: 'Marie-Claire Biya',
    phone: '699143829',
    city: 'Douala' as CityCameroon,
    neighborhood: 'Bonamoussadi',
    landmark: 'Carrefour Nelson Mandela, face Boulangerie Saker, portail bleu'
  },
  {
    id: 'ct_2',
    name: 'Dr. Kamgaing Patrice',
    phone: '675882190',
    city: 'Yaoundé' as CityCameroon,
    neighborhood: 'Bastos',
    landmark: 'Rond-point Ambassade du Nigéria, face Clinique Bastos'
  },
  {
    id: 'ct_3',
    name: 'Boutique Électro Akwa',
    phone: '674123456',
    city: 'Douala' as CityCameroon,
    neighborhood: 'Akwa',
    landmark: 'Boulevard de la Liberté, face Direction Orange Cameroun'
  },
  {
    id: 'ct_4',
    name: 'Maman Yaoundé (Mokolo)',
    phone: '690987654',
    city: 'Yaoundé' as CityCameroon,
    neighborhood: 'Mokolo',
    landmark: 'Marché Mokolo, entrée sapeurs-pompiers, hangar C3'
  },
  {
    id: 'ct_5',
    name: 'Christian Mbella (Ndokoti)',
    phone: '681234908',
    city: 'Douala' as CityCameroon,
    neighborhood: 'Ndokoti',
    landmark: 'Carrefour Ndokoti sous la passerelle, côté Station Total'
  }
];


import { CityCameroon, FaqItem } from '../types';

export interface SupportAgent {
  id: string;
  name: string;
  city: CityCameroon;
  region: string;
  agencyName: string;
  address: string;
  landmark: string;
  phoneMtn: string;
  phoneOrange: string;
  whatsappNumber: string;
  email: string;
  workingHours: string;
  avatarUrl?: string;
  languages: string[];
}

export const SUPPORT_AGENTS: SupportAgent[] = [
  {
    id: 'agent-dla',
    name: 'Armelle Ngono',
    city: 'Douala',
    region: 'Région du Littoral',
    agencyName: 'Agence Centrale Douala Akwa',
    address: 'Avenue de la Liberté / Rue Joss, Akwa',
    landmark: 'Face Immeuble Activa Assurances, près de la Salle des Fêtes d\'Akwa',
    phoneMtn: '+237 670 237 001',
    phoneOrange: '+237 690 237 001',
    whatsappNumber: '237670237001',
    email: 'support.douala@relais237.cm',
    workingHours: 'Lundi - Dimanche : 07h00 - 20h00',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    languages: ['Français', 'English', 'Douala (Duala)', 'Pidgin English']
  },
  {
    id: 'agent-yde',
    name: 'Brice Ondoua',
    city: 'Yaoundé',
    region: 'Région du Centre',
    agencyName: 'Agence Centrale Yaoundé Bastos',
    address: 'Carrefour Bastos, Avenue Rosa Parks',
    landmark: 'À côté de la Station Tradex Bastos, face Ambassade des États-Unis',
    phoneMtn: '+237 670 237 002',
    phoneOrange: '+237 690 237 002',
    whatsappNumber: '237670237002',
    email: 'support.yaounde@relais237.cm',
    workingHours: 'Lundi - Dimanche : 07h00 - 20h00',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    languages: ['Français', 'English', 'Ewondo', 'Pidgin English']
  }
];

export const CAMEROON_FAQS: FaqItem[] = [
  {
    id: 'faq-zones-douala',
    category: 'zones',
    targetCities: ['Douala'],
    tags: ['Douala', 'Quartiers', 'Zones', 'Couverture', 'Akwa', 'Bonamoussadi'],
    question_fr: 'Quels sont les quartiers couverts pour la livraison à domicile à Douala ?',
    question_en: 'Which neighborhoods are covered for home delivery in Douala?',
    answer_fr: 'À Douala, nos coursiers mototaxis et véhicules desservent l\'ensemble des arrondissements :\n• Douala 1er : Akwa, Bonanjo, Bonapriso, Bali, Koumassi.\n• Douala 2ème : New Bell, Nkololoun, Babylone, Ngangue.\n• Douala 3ème : Ndogbong, Cité des Palmiers, Bassa, Logbaba, Nyalla, Yassa.\n• Douala 4ème : Bonabéri (Quatre-Étages, Mabanda, Grand Hangar, Bojongo).\n• Douala 5ème : Deïdo, Bonamoussadi, Makepe, Kotto, Logpom, PK8 à PK14.\nToutes les livraisons s\'effectuent au point de repère exact indiqué par le client.',
    answer_en: 'In Douala, our motorbike and car couriers cover all districts:\n• Douala 1: Akwa, Bonanjo, Bonapriso, Bali, Koumassi.\n• Douala 2: New Bell, Nkololoun, Babylone, Ngangue.\n• Douala 3: Ndogbong, Cité des Palmiers, Bassa, Logbaba, Nyalla, Yassa.\n• Douala 4: Bonabéri (Quatre-Étages, Mabanda, Grand Hangar, Bojongo).\n• Douala 5: Deïdo, Bonamoussadi, Makepe, Kotto, Logpom, PK8 to PK14.\nAll deliveries are routed to the specific landmark indicated by the customer.'
  },
  {
    id: 'faq-zones-yaounde',
    category: 'zones',
    targetCities: ['Yaoundé'],
    tags: ['Yaoundé', 'Quartiers', 'Zones', 'Bastos', 'Omnisports', 'Mokolo'],
    question_fr: 'Quels sont les quartiers couverts pour la livraison à domicile à Yaoundé ?',
    question_en: 'Which neighborhoods are covered for home delivery in Yaoundé?',
    answer_fr: 'À Yaoundé, la capitale aux 7 collines, notre réseau dessert l\'ensemble des zones urbaines :\n• Centre-ville & Résidentiel : Bastos, Centre Administratif, Hippodrome, Golf, Santa Barbara.\n• Yaoundé 1er & 2ème : Nlongkak, Djoungolo, Elig-Edzoa, Tsinga, Mokolo, Madagascar, Messa.\n• Yaoundé 3ème & 4ème : Biyem-Assi, Mendong, Simbock, Nsam, Mvan, Kondengui, Mimboman, Odza.\n• Yaoundé 5ème & 6ème : Essos, Omnisports, Ngousso, Melen, Etoug-Ebe, Nkolbisson.\nNos livreurs connaissent parfaitement les carrefours et reliefs de la ville.',
    answer_en: 'In Yaoundé, our network covers all urban zones:\n• Downtown & Residential: Bastos, Administrative Center, Hippodrome, Golf, Santa Barbara.\n• Yaoundé 1 & 2: Nlongkak, Djoungolo, Elig-Edzoa, Tsinga, Mokolo, Madagascar, Messa.\n• Yaoundé 3 & 4: Biyem-Assi, Mendong, Simbock, Nsam, Mvan, Kondengui, Mimboman, Odza.\n• Yaoundé 5 & 6: Essos, Omnisports, Ngousso, Melen, Etoug-Ebe, Nkolbisson.\nOur couriers have in-depth knowledge of city landmarks, roundabouts, and hills.'
  },
  {
    id: 'faq-delais-axe-lourd',
    category: 'rates',
    targetCities: ['Douala', 'Yaoundé'],
    tags: ['Axe Lourd', 'Nationale 3', 'Inter-villes', 'Délais', 'Express'],
    question_fr: 'Combien de temps prend l\'envoi d\'un colis entre Douala et Yaoundé (Axe Lourd N3) ?',
    question_en: 'How long does a parcel transfer take between Douala and Yaoundé (N3 Highway)?',
    answer_fr: 'Grâce à nos navettes express quotidiennes reliant Douala et Yaoundé via l\'Axe Lourd (Nationale 3) :\n• Service Express Jour Même : Dépôt avant 10h00 le matin pour une mise à disposition ou livraison à domicile entre 16h00 et 18h00 (délai de 4 à 6 heures).\n• Service Standard : Dépôt dans l\'après-midi, disponible dès 08h30 le lendemain matin.\nLe colis est tracé en continu par télémétrie GPS de son départ jusqu\'à l\'arrivée à l\'agence relais partenaire.',
    answer_en: 'Thanks to our daily express shuttles between Douala and Yaoundé via the N3 Highway:\n• Same-Day Express Service: Drop off before 10:00 AM for home delivery or pickup between 4:00 PM and 6:00 PM (4 to 6 hours transit).\n• Standard Service: Afternoon drop-off, ready for pickup next morning at 8:30 AM.\nThe shipment is continuously GPS-tracked from origin to the destination partner relay branch.'
  },
  {
    id: 'faq-tarifs-intra',
    category: 'rates',
    targetCities: ['Douala', 'Yaoundé'],
    tags: ['Tarifs', 'Prix', 'FCFA', 'Poids', 'Calculateur'],
    question_fr: 'Quelle est la grille tarifaire pour les livraisons à l\'intérieur d\'une même ville ?',
    question_en: 'What are the delivery rates within the same city?',
    answer_fr: 'Nos tarifs sont fixes, transparents et sans surprise :\n• Colis Léger (< 3 kg, plis, passeports, vêtements, petits téléphones) : 1 500 FCFA.\n• Colis Moyen (3 à 10 kg, cartons d\'épicerie, équipements, ordinateurs) : 2 500 FCFA.\n• Colis Lourd (10 à 25 kg, petit électroménager, cartons volumineux) : 4 000 FCFA.\nUne assurance garantie de 0,5% est ajoutée pour indemniser la marchandise à 100% en cas de sinistre.',
    answer_en: 'Our rates are fixed, transparent, and without hidden fees:\n• Light Parcel (< 3 kg, letters, passports, clothing, smartphones): 1,500 XAF.\n• Medium Parcel (3 to 10 kg, food boxes, electronics, laptops): 2,500 XAF.\n• Heavy Parcel (10 to 25 kg, small appliances, bulky boxes): 4,000 XAF.\nA 0.5% warranty insurance fee is added for 100% item coverage against damage or loss.'
  },
  {
    id: 'faq-momo-om',
    category: 'payment',
    targetCities: ['Douala', 'Yaoundé'],
    tags: ['MTN MoMo', 'Orange Money', 'USSD', 'Paiement', 'Code Secret'],
    question_fr: 'Comment se déroule le paiement par MTN Mobile Money ou Orange Money ?',
    question_en: 'How does payment with MTN Mobile Money or Orange Money work?',
    answer_fr: 'Le paiement est 100% digitalisé et sans espèces :\n1. Vous sélectionnez votre opérateur (MTN MoMo ou Orange Money) et saisissez votre numéro camerounais à 9 chiffres (+237 6xx xxx xxx).\n2. Une invite USSD Push s\'affiche automatiquement sur votre téléphone portable.\n3. Vous confirmez en saisissant votre code secret habituel (via *126# pour MTN ou *150# pour Orange).\n4. Dès confirmation, le reçu officiel numéroté (ex: REC-2026-...) est généré avec QR code certifié.',
    answer_en: 'Payment is completely cashless and digital:\n1. Choose your provider (MTN MoMo or Orange Money) and enter your 9-digit phone number (+237 6xx xxx xxx).\n2. An instant USSD Push notification appears on your phone screen.\n3. Confirm with your secret PIN code (dialing *126# for MTN or *150# for Orange).\n4. Upon approval, an official numbered receipt (e.g., REC-2026-...) is generated with a certified QR code.'
  },
  {
    id: 'faq-double-pin',
    category: 'security',
    targetCities: ['Douala', 'Yaoundé'],
    tags: ['Sécurité', 'Double PIN', 'Code de décharge', 'Fraude', 'WhatsApp'],
    question_fr: 'Comment fonctionne le système de Double Code PIN sécurisé lors de la remise ?',
    question_en: 'How does the secure Double PIN Code system work during package handover?',
    answer_fr: 'Pour éliminer tout risque de vol ou d\'erreur de destinataire, RELAIS237 applique un protocole strict de décharge bilatérale :\n• Lors de la commande, un Code PIN confidentiel à 4 chiffres (ex: 4921) est généré et envoyé UNIQUEMENT au destinataire par message officiel WhatsApp.\n• Lorsque le coursier arrive au carrefour ou à domicile, il doit demander ce code au destinataire.\n• L\'application coursier bloque l\'état "Livré" tant que le code PIN exact n\'a pas été validé sur place.',
    answer_en: 'To eliminate theft or mistaken handover, RELAIS237 enforces a strict bilateral handshake protocol:\n• When the order is placed, a confidential 4-digit PIN (e.g. 4921) is generated and sent ONLY to the recipient via official WhatsApp.\n• When the courier arrives at the landmark or doorstep, they request this PIN.\n• The courier app cannot mark the parcel as "Delivered" without typing the exact PIN provided by the recipient.'
  },
  {
    id: 'faq-destinataire-absent',
    category: 'relay',
    targetCities: ['Douala', 'Yaoundé'],
    tags: ['Absent', 'Point Relais', 'Garde', 'Boulangerie Saker', 'Partenaire'],
    question_fr: 'Que se passe-t-il si le destinataire est absent au moment de la livraison ?',
    question_en: 'What happens if the recipient is unavailable during delivery?',
    answer_fr: 'Si le destinataire ne répond pas après 3 tentatives d\'appel et message WhatsApp :\n1. Le coursier dépose le colis scellé dans le Point Relais Partenaire le plus proche du quartier (agences partenaires sécurisées, boutiques de proximité agréées).\n2. Le destinataire reçoit un SMS et WhatsApp contenant l\'adresse exacte du point relais et un code de retrait.\n3. Le colis y est gardé en toute sécurité pendant 48 heures gratuitement. Le destinataire peut le retirer muni de sa CNI et de son code.',
    answer_en: 'If the recipient cannot be reached after 3 phone calls and WhatsApp notifications:\n1. The courier transfers the sealed package to the closest partner relay station (certified neighborhood shops or bakeries).\n2. The recipient receives a WhatsApp message with the exact location address and a pickup barcode.\n3. The parcel is held in safe custody for 48 hours for free. The recipient can retrieve it anytime presenting their ID and PIN.'
  },
  {
    id: 'faq-objets-interdits',
    category: 'insurance',
    targetCities: ['Douala', 'Yaoundé'],
    tags: ['Interdit', 'Contrôle', 'Photo', 'Inspection', 'Loi Camerounaise'],
    question_fr: 'Quels sont les articles strictement interdits et comment se fait le contrôle ?',
    question_en: 'Which items are strictly prohibited and how is inspection conducted?',
    answer_fr: 'Conformément aux lois de la République du Cameroun et aux directives de l\'ANTIC :\n• Sont interdits : Armes, munitions, stupéfiants, drogues, devises en espèces non déclarées, explosifs, produits chimiques dangereux et contrefaçons.\n• Contrôle visuel obligatoire : Avant la fermeture du sachet de sécurité ou carton scellé, le livreur moto doit prendre une photo nette du contenu et du scellé via l\'application (permission Caméra requise).\n• En cas de doute, le coursier est habilité à refuser la prise en charge.',
    answer_en: 'In compliance with Cameroonian law and ANTIC postal regulations:\n• Prohibited items: Weapons, ammunition, narcotics, unregistered cash bundles, explosives, hazardous chemicals, and counterfeit items.\n• Mandatory visual inspection: Before closing the tamper-evident security bag or sealed box, the courier takes a clear photograph of the item inside the app (Camera permission required).\n• If prohibited cargo is suspected, the courier has the authority to decline the shipment.'
  },
  {
    id: 'faq-kyc-cni',
    category: 'security',
    targetCities: ['Douala', 'Yaoundé'],
    tags: ['KYC', 'CNI', 'ANTIC', 'Minpostel', 'Vérification'],
    question_fr: 'Pourquoi la vérification par Carte Nationale d\'Identité (CNI) est-elle exigée ?',
    question_en: 'Why is National Identity Card (CNI) verification mandatory?',
    answer_fr: 'La vérification d\'identité (KYC niveau 2) est imposée par la réglementation postale camerounaise pour protéger expéditeurs et destinataires contre les arnaques et usurpations d\'identité. Le scan de votre CNI (Recto & Verso) et la validation WhatsApp OTP permettent de certifier que chaque compte est rattaché à une personne physique authentifiée.',
    answer_en: 'Identity verification (Level 2 KYC) is mandated by Cameroonian postal and telecommunications regulations to prevent parcel fraud and identity theft. Scanning your National ID (Front & Back) paired with WhatsApp OTP verification certifies that every account corresponds to an authenticated citizen or resident.'
  }
];

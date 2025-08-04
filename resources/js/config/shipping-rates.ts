export interface ShippingRate {
  region: string;
  province: string;
  cities: string[];
  standard_rate: number;
  express_rate: number;
  overnight_rate?: number;
  weight_tiers?: {
    max_weight: number; // in kg
    standard_rate: number;
    express_rate: number;
    overnight_rate?: number;
  }[];
  estimated_days: {
    standard: string;
    express: string;
    overnight?: string;
  };
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  estimated_days: string;
  price: number;
  weight_tiers?: {
    max_weight: number;
    price: number;
  }[];
}

// Weight-based shipping tiers (in kg)
export const WEIGHT_TIERS = [
  { max_weight: 0.5, multiplier: 1.0, name: "Light (0-0.5kg)" },
  { max_weight: 1.0, multiplier: 1.2, name: "Small (0.5-1kg)" },
  { max_weight: 2.0, multiplier: 1.5, name: "Medium (1-2kg)" },
  { max_weight: 5.0, multiplier: 2.0, name: "Large (2-5kg)" },
  { max_weight: 10.0, multiplier: 2.5, name: "Heavy (5-10kg)" },
  { max_weight: Infinity, multiplier: 3.0, name: "Oversized (10kg+)" }
];

// Helper function to get weight tier for a given weight
export const getWeightTier = (weight: number): typeof WEIGHT_TIERS[0] => {
  return WEIGHT_TIERS.find(tier => weight <= tier.max_weight) || WEIGHT_TIERS[WEIGHT_TIERS.length - 1];
};

// Helper function to calculate weight-adjusted shipping rate
export const calculateWeightAdjustedRate = (baseRate: number, weight: number): number => {
  const tier = getWeightTier(weight);
  return Math.round(baseRate * tier.multiplier);
};

export const PHILIPPINE_SHIPPING_RATES: ShippingRate[] = [
  // Metro Manila (Far from Cebu)
  {
    region: "National Capital Region (NCR)",
    province: "Metro Manila",
    cities: [
      "Manila", "Quezon City", "Caloocan", "Las Piñas", "Makati", "Malabon", "Mandaluyong", 
      "Marikina", "Muntinlupa", "Navotas", "Parañaque", "Pasay", "Pasig", "San Juan", 
      "Taguig", "Valenzuela", "Pateros"
    ],
    standard_rate: 350,
    express_rate: 450,
    overnight_rate: 550,
    estimated_days: {
      standard: "5-7 business days",
      express: "3-4 business days",
      overnight: "Next business day"
    }
  },

  // Luzon - Central Luzon (Far from Cebu)
  {
    region: "Central Luzon",
    province: "Bulacan",
    cities: ["Malolos", "Meycauayan", "San Jose del Monte", "Santa Maria", "Marilao", "Bocaue", "Guiguinto", "Balagtas", "Pandi", "Plaridel", "Pulilan", "Calumpit", "Paombong", "Hagonoy", "San Rafael", "Angat", "Norzagaray", "San Miguel", "Doña Remedios Trinidad"],
    standard_rate: 380,
    express_rate: 480,
    overnight_rate: 580,
    estimated_days: {
      standard: "6-8 business days",
      express: "4-5 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "Central Luzon",
    province: "Pampanga",
    cities: ["San Fernando", "Angeles", "Mabalacat", "San Jose", "Mexico", "Arayat", "Bacolor", "Candaba", "Floridablanca", "Guagua", "Lubao", "Magalang", "Masantol", "Porac", "San Luis", "San Simon", "Santa Ana", "Santa Rita", "Santo Tomas", "Sasmuan"],
    standard_rate: 380,
    express_rate: 480,
    overnight_rate: 580,
    estimated_days: {
      standard: "6-8 business days",
      express: "4-5 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "Central Luzon",
    province: "Nueva Ecija",
    cities: ["Cabanatuan", "Palayan", "San Jose", "Gapan", "Muñoz", "Talavera", "Guimba", "Peñaranda", "San Leonardo", "Santa Rosa", "Aliaga", "Bongabon", "Cabiao", "Carranglan", "Cuyapo", "Gabaldon", "General Mamerto Natividad", "General Tinio", "Jaen", "Laur", "Licab", "Llanera", "Lupao", "Nampicuan", "Pantabangan", "Quezon", "Rizal", "San Antonio", "San Isidro", "San Mariano", "Santa Fe", "Santo Domingo", "Tayug", "Zaragoza"],
    standard_rate: 400,
    express_rate: 500,
    overnight_rate: 600,
    estimated_days: {
      standard: "6-8 business days",
      express: "4-5 business days",
      overnight: "Next business day"
    }
  },

  // Luzon - CALABARZON (Medium Distance)
  {
    region: "CALABARZON",
    province: "Cavite",
    cities: ["Dasmariñas", "Bacoor", "Imus", "General Trias", "Trece Martires", "Tagaytay", "Silang", "General Mariano Alvarez", "Rosario", "Kawit", "Noveleta", "Tanza", "Naic", "Indang", "Alfonso", "Amadeo", "Carmona", "General Emilio Aguinaldo", "Magallanes", "Maragondon", "Mendez", "Ternate"],
    standard_rate: 300,
    express_rate: 400,
    overnight_rate: 500,
    estimated_days: {
      standard: "4-6 business days",
      express: "2-3 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "CALABARZON",
    province: "Laguna",
    cities: ["San Pablo", "Santa Rosa", "Biñan", "Cabuyao", "San Pedro", "Calamba", "Los Baños", "Sta. Cruz", "San Fernando", "Bay", "Alaminos", "Calauan", "Cavinti", "Famy", "Kalayaan", "Liliw", "Luisiana", "Lumban", "Mabitac", "Magdalena", "Majayjay", "Nagcarlan", "Paete", "Pagsanjan", "Pakil", "Pangil", "Pila", "Rizal", "Siniloan", "Victoria"],
    standard_rate: 300,
    express_rate: 400,
    overnight_rate: 500,
    estimated_days: {
      standard: "4-6 business days",
      express: "2-3 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "CALABARZON",
    province: "Batangas",
    cities: ["Batangas City", "Lipa", "Tanauan", "Santo Tomas", "San Pablo", "Malvar", "Talisay", "San Jose", "Ibaan", "Bauan", "San Juan", "Taysan", "Rosario", "Padre Garcia", "San Nicolas", "Lemery", "Taal", "Balayan", "Calaca", "Calatagan", "Lian", "Nasugbu", "Tuy", "Mabini", "San Luis", "Tingloy", "Agoncillo", "Alitagtag", "Balete", "Cuenca", "Laurel", "Mataas na Kahoy", "San Pascual"],
    standard_rate: 320,
    express_rate: 420,
    overnight_rate: 520,
    estimated_days: {
      standard: "4-6 business days",
      express: "2-3 business days",
      overnight: "Next business day"
    }
  },

  // Luzon - Other Regions (Farthest from Cebu)
  {
    region: "Ilocos Region",
    province: "Pangasinan",
    cities: ["Dagupan", "San Carlos", "Urdaneta", "Alaminos", "Manaoag", "San Fabian", "Lingayen", "Binmaley", "Calasiao", "Mangaldan", "Mapandan", "San Jacinto", "Sta. Barbara", "Malasiqui", "Bayambang", "Basista", "Mangatarem", "San Nicolas", "Tayug", "Asingan", "Sta. Maria", "San Manuel", "Binalonan", "Pozorrubio", "Sison", "San Quintin", "Natividad", "San Nicolas", "San Fabian", "Manaoag", "San Jacinto", "Mapandan", "Calasiao", "Binmaley", "Lingayen", "San Fabian", "Mangaldan", "Sta. Barbara", "Malasiqui", "Bayambang", "Basista", "Mangatarem", "San Nicolas", "Tayug", "Asingan", "Sta. Maria", "San Manuel", "Binalonan", "Pozorrubio", "Sison", "San Quintin", "Natividad"],
    standard_rate: 450,
    express_rate: 550,
    overnight_rate: 650,
    estimated_days: {
      standard: "7-9 business days",
      express: "5-6 business days",
      overnight: "Next business day"
    }
  },

  // Visayas - Central Visayas (Business Location)
  {
    region: "Central Visayas",
    province: "Cebu",
    cities: ["Cebu City", "Mandaue", "Lapu-Lapu", "Talisay", "Toledo", "Danao", "Carcar", "Naga", "Talisay", "Minglanilla", "Consolacion", "Compostela", "Liloan", "San Fernando", "Cordova", "Aloguinsan", "Alcantara", "Alcoy", "Alegria", "Argao", "Asturias", "Badian", "Balamban", "Bantayan", "Barili", "Boljoon", "Borbon", "Carmen", "Catmon", "Compostela", "Daanbantayan", "Dalaguete", "Dumanjug", "Ginatilan", "Liloan", "Madridejos", "Malabuyoc", "Medellin", "Minglanilla", "Moalboal", "Oslob", "Pilar", "Pinamungajan", "Poro", "Ronda", "Samboan", "San Fernando", "San Francisco", "San Remigio", "Santa Fe", "Santander", "Sibonga", "Sogod", "Tabogon", "Tabuelan", "Tuburan", "Tudela"],
    standard_rate: 150,
    express_rate: 250,
    overnight_rate: 350,
    estimated_days: {
      standard: "1-2 business days",
      express: "Same day",
      overnight: "Next business day"
    }
  },
  {
    region: "Central Visayas",
    province: "Bohol",
    cities: ["Tagbilaran", "Candijay", "Carmen", "Dauis", "Dimiao", "Duero", "Garcia Hernandez", "Guindulman", "Inabanga", "Jagna", "Lila", "Loay", "Loboc", "Loon", "Mabini", "Panglao", "Pilar", "Sierra Bullones", "Sikatuna", "Talibon", "Trinidad", "Tubigon", "Ubay", "Valencia"],
    standard_rate: 180,
    express_rate: 280,
    overnight_rate: 380,
    estimated_days: {
      standard: "2-3 business days",
      express: "1-2 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "Central Visayas",
    province: "Negros Oriental",
    cities: ["Dumaguete", "Bais", "Bayawan", "Canlaon", "Guihulngan", "Tanjay", "Amlan", "Ayungon", "Bacong", "Basay", "Bindoy", "Dauin", "Jimalalud", "La Libertad", "Mabinay", "Manjuyod", "Pamplona", "San Jose", "Santa Catalina", "Siaton", "Sibulan", "Tayasan", "Valencia", "Vallehermoso", "Zamboanguita"],
    standard_rate: 180,
    express_rate: 280,
    overnight_rate: 380,
    estimated_days: {
      standard: "2-3 business days",
      express: "1-2 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "Central Visayas",
    province: "Siquijor",
    cities: ["Siquijor", "Enrique Villanueva", "Larena", "Lazi", "Maria", "San Juan"],
    standard_rate: 200,
    express_rate: 300,
    overnight_rate: 400,
    estimated_days: {
      standard: "2-4 business days",
      express: "1-2 business days",
      overnight: "Next business day"
    }
  },

  // Western Visayas (Nearby)
  {
    region: "Western Visayas",
    province: "Negros Occidental",
    cities: ["Bacolod", "Silay", "Talisay", "Victorias", "Cadiz", "Sagay", "Escalante", "San Carlos", "Bago", "La Carlota", "Himamaylan", "Kabankalan", "Sipalay", "Binalbagan", "Hinigaran", "Pulupandan", "Valladolid", "San Enrique", "Pontevedra", "La Castellana", "Moises Padilla", "Isabela", "Cauayan", "Candoni", "Ilog", "Hinoba-an", "Toboso", "Calatrava", "Salvador Benedicto", "Don Salvador Benedicto"],
    standard_rate: 220,
    express_rate: 320,
    overnight_rate: 420,
    estimated_days: {
      standard: "3-4 business days",
      express: "1-2 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "Western Visayas",
    province: "Iloilo",
    cities: ["Iloilo City", "Passi", "Roxas", "Jaro", "La Paz", "Molo", "Mandurriao", "Arevalo", "Oton", "Santa Barbara", "San Miguel", "Pavia", "Leganes", "Zarraga", "New Lucena", "San Enrique", "Pototan", "Dingle", "Barotac Nuevo", "Barotac Viejo", "Banate", "Anilao", "Duenas", "San Rafael", "Janiuay", "Badiangan", "Maasin", "Tigbauan", "Guimbal", "Tubungan", "Igbaras", "Miagao", "San Joaquin", "Tigbauan", "Oton", "Pavia", "Leganes", "Zarraga", "New Lucena", "San Enrique", "Pototan", "Dingle", "Barotac Nuevo", "Barotac Viejo", "Banate", "Anilao", "Duenas", "San Rafael", "Janiuay", "Badiangan", "Maasin", "Tigbauan", "Guimbal", "Tubungan", "Igbaras", "Miagao", "San Joaquin"],
    standard_rate: 250,
    express_rate: 350,
    overnight_rate: 450,
    estimated_days: {
      standard: "3-5 business days",
      express: "2-3 business days",
      overnight: "Next business day"
    }
  },

  // Mindanao (Farthest from Cebu)
  
  // Davao Region
  {
    region: "Davao Region",
    province: "Davao del Sur",
    cities: ["Davao City", "Digos", "Sta. Cruz", "Bansalan", "Hagonoy", "Kiblawan", "Magsaysay", "Malalag", "Matanao", "Padada", "Sulop"],
    standard_rate: 500,
    express_rate: 600,
    overnight_rate: 700,
    estimated_days: {
      standard: "8-10 business days",
      express: "6-7 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "Davao Region",
    province: "Davao del Norte",
    cities: ["Tagum", "Panabo", "Island Garden City of Samal", "Carmen", "Asuncion", "Kapalong", "New Corella", "Sto. Tomas", "Talaingod", "San Isidro", "Braulio E. Dujali"],
    standard_rate: 500,
    express_rate: 600,
    overnight_rate: 700,
    estimated_days: {
      standard: "8-10 business days",
      express: "6-7 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "Davao Region",
    province: "Davao Oriental",
    cities: ["Mati", "Digos", "Lupon", "Banaybanay", "San Isidro", "Governor Generoso", "Caraga", "Baganga", "Cateel", "Manay", "Tarragona", "Boston"],
    standard_rate: 520,
    express_rate: 620,
    overnight_rate: 720,
    estimated_days: {
      standard: "8-10 business days",
      express: "6-7 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "Davao Region",
    province: "Davao de Oro",
    cities: ["Nabunturan", "Monkayo", "Mawab", "Macrohon", "Compostela", "Laak", "Montevista", "New Bataan", "Maragusan", "Pantukan"],
    standard_rate: 510,
    express_rate: 610,
    overnight_rate: 710,
    estimated_days: {
      standard: "8-10 business days",
      express: "6-7 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "Davao Region",
    province: "Davao Occidental",
    cities: ["Malita", "Santa Maria", "Don Marcelino", "Jose Abad Santos", "Sarangani"],
    standard_rate: 530,
    express_rate: 630,
    overnight_rate: 730,
    estimated_days: {
      standard: "8-10 business days",
      express: "6-7 business days",
      overnight: "Next business day"
    }
  },

  // Northern Mindanao
  {
    region: "Northern Mindanao",
    province: "Misamis Oriental",
    cities: ["Cagayan de Oro", "Gingoog", "El Salvador", "Alubijid", "Balingasag", "Balingoan", "Binuangan", "Claveria", "Gitagum", "Initao", "Jasaan", "Kinoguitan", "Lagonglong", "Laguindingan", "Libertad", "Lugait", "Magsaysay", "Manticao", "Medina", "Naawan", "Opol", "Salay", "Sugbongcogon", "Tagoloan", "Talisayan", "Villanueva"],
    standard_rate: 480,
    express_rate: 580,
    overnight_rate: 680,
    estimated_days: {
      standard: "7-9 business days",
      express: "5-6 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "Northern Mindanao",
    province: "Bukidnon",
    cities: ["Malaybalay", "Valencia", "Manolo Fortich", "Quezon", "Maramag", "Don Carlos", "Kibawe", "Kadingilan", "Pangantucan", "Talakag", "Cabanglasan", "San Fernando", "Lantapan", "Impasugong", "Sumilao", "Libona", "Baungon", "Dangcagan", "Kitaotao", "Damulog", "Kalarangan"],
    standard_rate: 490,
    express_rate: 590,
    overnight_rate: 690,
    estimated_days: {
      standard: "7-9 business days",
      express: "5-6 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "Northern Mindanao",
    province: "Lanao del Norte",
    cities: ["Iligan", "Tubod", "Kapatagan", "Baroy", "Kolambugan", "Maigo", "Lala", "Sapad", "Sultan Naga Dimaporo", "Bacolod", "Baloi", "Kauswagan", "Linamon", "Magsaysay", "Munai", "Nunungan", "Pantar", "Poona Piagapo", "Salvador", "Tangcal", "Tagoloan"],
    standard_rate: 470,
    express_rate: 570,
    overnight_rate: 670,
    estimated_days: {
      standard: "7-9 business days",
      express: "5-6 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "Northern Mindanao",
    province: "Misamis Occidental",
    cities: ["Oroquieta", "Ozamiz", "Tangub", "Plaridel", "Calamba", "Lopez Jaena", "Panaon", "Jimenez", "Aloran", "Baliangao", "Bonifacio", "Clarin", "Concepcion", "Don Victoriano Chiongbian", "Sapang Dalaga", "Sinacaban", "Tudela"],
    standard_rate: 460,
    express_rate: 560,
    overnight_rate: 660,
    estimated_days: {
      standard: "7-9 business days",
      express: "5-6 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "Northern Mindanao",
    province: "Camiguin",
    cities: ["Mambajao", "Mahinog", "Guinsiliban", "Sagay", "Catarman"],
    standard_rate: 450,
    express_rate: 550,
    overnight_rate: 650,
    estimated_days: {
      standard: "7-9 business days",
      express: "5-6 business days",
      overnight: "Next business day"
    }
  },

  // Soccsksargen
  {
    region: "Soccsksargen",
    province: "South Cotabato",
    cities: ["Koronadal", "General Santos", "Surallah", "Polomolok", "Tupi", "Tantangan", "Tampakan", "Sto. Niño", "Norala", "Lake Sebu", "Banga", "Sta. Cruz", "Tboli", "Tupi", "Tantangan", "Tampakan", "Sto. Niño", "Norala", "Lake Sebu", "Banga", "Sta. Cruz", "Tboli"],
    standard_rate: 480,
    express_rate: 580,
    overnight_rate: 680,
    estimated_days: {
      standard: "7-9 business days",
      express: "5-6 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "Soccsksargen",
    province: "Cotabato",
    cities: ["Kidapawan", "Midsayap", "Kabacan", "Libungan", "Pigcawayan", "Alamada", "Banisilan", "Carmen", "Aleosan", "Antipas", "Arakan", "Magpet", "Makilala", "Matalam", "Pres. Roxas", "Tulunan", "Pikit", "Pigkawayan", "Alamada", "Banisilan", "Carmen", "Aleosan", "Antipas", "Arakan", "Magpet", "Makilala", "Matalam", "Pres. Roxas", "Tulunan"],
    standard_rate: 490,
    express_rate: 590,
    overnight_rate: 690,
    estimated_days: {
      standard: "7-9 business days",
      express: "5-6 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "Soccsksargen",
    province: "Sultan Kudarat",
    cities: ["Tacurong", "Isulan", "Bagumbayan", "Esperanza", "Lutayan", "Columbio", "Kalamansig", "Lebak", "Palimbang", "Sen. Ninoy Aquino"],
    standard_rate: 470,
    express_rate: 570,
    overnight_rate: 670,
    estimated_days: {
      standard: "7-9 business days",
      express: "5-6 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "Soccsksargen",
    province: "Sarangani",
    cities: ["Alabel", "Glan", "Malungon", "Maasim", "Maitum", "Kiamba", "Malapatan"],
    standard_rate: 485,
    express_rate: 585,
    overnight_rate: 685,
    estimated_days: {
      standard: "7-9 business days",
      express: "5-6 business days",
      overnight: "Next business day"
    }
  },

  // Caraga
  {
    region: "Caraga",
    province: "Agusan del Norte",
    cities: ["Butuan", "Cabadbaran", "Nasipit", "Tubay", "Jabonga", "Kitcharao", "Las Nieves", "Magallanes", "Remedios T. Romualdez", "Santiago", "Tubay"],
    standard_rate: 520,
    express_rate: 620,
    overnight_rate: 720,
    estimated_days: {
      standard: "8-10 business days",
      express: "6-7 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "Caraga",
    province: "Agusan del Sur",
    cities: ["Prosperidad", "Bayugan", "San Francisco", "Bunawan", "Rosario", "Sta. Josefa", "Trento", "Veruela", "Sibagat", "Loreto", "La Paz", "Esperanza", "Talacogon", "San Luis", "Loreto", "La Paz", "Esperanza", "Talacogon", "San Luis"],
    standard_rate: 530,
    express_rate: 630,
    overnight_rate: 730,
    estimated_days: {
      standard: "8-10 business days",
      express: "6-7 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "Caraga",
    province: "Surigao del Norte",
    cities: ["Surigao", "Dapa", "Placer", "Bacuag", "Gigaquit", "Sison", "Tagana-an", "Alegria", "Tubod", "Mainit", "Malimono", "San Francisco", "San Isidro", "Socorro", "Claver", "Dinagat", "Libjo", "Loreto", "Tubajon", "Basilisa", "Cagdianao", "Dinagat", "Libjo", "Loreto", "Tubajon", "Basilisa", "Cagdianao"],
    standard_rate: 540,
    express_rate: 640,
    overnight_rate: 740,
    estimated_days: {
      standard: "8-10 business days",
      express: "6-7 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "Caraga",
    province: "Surigao del Sur",
    cities: ["Tandag", "Bislig", "Cagwait", "Marihatag", "San Agustin", "Barobo", "Lianga", "Lingig", "Tagbina", "Hinatuan", "Carrascal", "Cantilan", "Madrid", "Carmen", "Lanuza", "Cortes", "Bayabas", "Tago", "San Miguel", "Sta. Monica", "San Benito", "Pilar", "Sta. Cecilia"],
    standard_rate: 550,
    express_rate: 650,
    overnight_rate: 750,
    estimated_days: {
      standard: "8-10 business days",
      express: "6-7 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "Caraga",
    province: "Dinagat Islands",
    cities: ["San Jose", "Basilisa", "Cagdianao", "Dinagat", "Libjo", "Loreto", "Tubajon"],
    standard_rate: 560,
    express_rate: 660,
    overnight_rate: 760,
    estimated_days: {
      standard: "8-10 business days",
      express: "6-7 business days",
      overnight: "Next business day"
    }
  },

  // Zamboanga Peninsula
  {
    region: "Zamboanga Peninsula",
    province: "Zamboanga del Norte",
    cities: ["Dipolog", "Dapitan", "Pagadian", "Polanco", "Katipunan", "Roxas", "Manukan", "Sindangan", "Liloy", "Labason", "Tampilisan", "Kalawit", "Salug", "Gutalac", "Siayan", "Sibuco", "Sibutad", "Baliguian", "Godod", "Bacungan", "Leon B. Postigo", "Sergio Osmeña Sr.", "Jose Dalman", "Piñan", "Mutia", "La Libertad", "Sapang Dalaga", "Concepcion", "Polanco", "Katipunan", "Roxas", "Manukan", "Sindangan", "Liloy", "Labason", "Tampilisan", "Kalawit", "Salug", "Gutalac", "Siayan", "Sibuco", "Sibutad", "Baliguian", "Godod", "Bacungan", "Leon B. Postigo", "Sergio Osmeña Sr.", "Jose Dalman", "Piñan", "Mutia", "La Libertad", "Sapang Dalaga", "Concepcion"],
    standard_rate: 440,
    express_rate: 540,
    overnight_rate: 640,
    estimated_days: {
      standard: "7-9 business days",
      express: "5-6 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "Zamboanga Peninsula",
    province: "Zamboanga del Sur",
    cities: ["Pagadian", "Zamboanga", "Molave", "Aurora", "Dumingag", "Josefina", "Mahayag", "Midsalip", "Tambulig", "Tukuran", "Vincenzo A. Sagun", "Aurora", "Dumingag", "Josefina", "Mahayag", "Midsalip", "Tambulig", "Tukuran", "Vincenzo A. Sagun"],
    standard_rate: 430,
    express_rate: 530,
    overnight_rate: 630,
    estimated_days: {
      standard: "7-9 business days",
      express: "5-6 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "Zamboanga Peninsula",
    province: "Zamboanga Sibugay",
    cities: ["Ipil", "Kabasalan", "Roseller T. Lim", "Titay", "Tungawan", "Alicia", "Buug", "Diplahan", "Imelda", "Kabasalan", "Mabuhay", "Malangas", "Naga", "Olutanga", "Payao", "RT Lim", "Siay", "Talusan", "Titay", "Tungawan"],
    standard_rate: 435,
    express_rate: 535,
    overnight_rate: 635,
    estimated_days: {
      standard: "7-9 business days",
      express: "5-6 business days",
      overnight: "Next business day"
    }
  },

  // Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)
  {
    region: "Bangsamoro",
    province: "Maguindanao",
    cities: ["Cotabato City", "Shariff Aguak", "Upi", "Ampatuan", "Buluan", "Datu Odin Sinsuat", "Datu Paglas", "Datu Piang", "Datu Salibo", "Datu Saudi-Ampatuan", "Datu Unsay", "Gen. S.K. Pendatun", "Guindulungan", "Kabuntalan", "Mamasapano", "Mangudadatu", "Matanog", "Northern Kabuntalan", "Pagalungan", "Paglat", "Pandag", "Parang", "Rajah Buayan", "Shariff Saydona Mustapha", "Sultan Kudarat", "Sultan Mastura", "Sultan sa Barongis", "Talayan", "Talitay", "Upi"],
    standard_rate: 460,
    express_rate: 560,
    overnight_rate: 660,
    estimated_days: {
      standard: "7-9 business days",
      express: "5-6 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "Bangsamoro",
    province: "Lanao del Sur",
    cities: ["Marawi", "Malabang", "Wao", "Bayang", "Binidayan", "Buadiposo-Buntong", "Bubong", "Butig", "Calanogas", "Ditsaan-Ramain", "Ganassi", "Kapai", "Kapatagan", "Lumbaca-Unayan", "Lumbatan", "Lumbayanague", "Madalum", "Madamba", "Maguing", "Malabang", "Marantao", "Marogong", "Masiu", "Mulondo", "Pagayawan", "Piagapo", "Poona Bayabao", "Pualas", "Saguiaran", "Sultan Dumalondong", "Tagoloan II", "Tamparan", "Taraka", "Tubaran", "Tugaya", "Wao"],
    standard_rate: 465,
    express_rate: 565,
    overnight_rate: 665,
    estimated_days: {
      standard: "7-9 business days",
      express: "5-6 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "Bangsamoro",
    province: "Basilan",
    cities: ["Isabela", "Lamitan", "Akbar", "Al-Barka", "Hadji Mohammad Ajul", "Hadji Muhtamad", "Lantawan", "Maluso", "Sumisip", "Tabuan-Lasa", "Tipo-Tipo", "Tuburan", "Ungkaya Pukan"],
    standard_rate: 420,
    express_rate: 520,
    overnight_rate: 620,
    estimated_days: {
      standard: "7-9 business days",
      express: "5-6 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "Bangsamoro",
    province: "Sulu",
    cities: ["Jolo", "Indanan", "Kalingalan Caluang", "Lugus", "Luuk", "Maimbung", "Old Panamao", "Omar", "Pandami", "Panglima Estino", "Pangutaran", "Parang", "Pata", "Patikul", "Siasi", "Talipao", "Tapul", "Tongkil"],
    standard_rate: 410,
    express_rate: 510,
    overnight_rate: 610,
    estimated_days: {
      standard: "7-9 business days",
      express: "5-6 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "Bangsamoro",
    province: "Tawi-Tawi",
    cities: ["Bongao", "Mapun", "Panglima Sugala", "Sapa-Sapa", "Sibutu", "Simunul", "Sitangkai", "South Ubian", "Tandubas", "Turtle Islands"],
    standard_rate: 400,
    express_rate: 500,
    overnight_rate: 600,
    estimated_days: {
      standard: "7-9 business days",
      express: "5-6 business days",
      overnight: "Next business day"
    }
  }
];

// Default shipping rates for other countries
export const INTERNATIONAL_SHIPPING_RATES = {
  "United States": {
    standard_rate: 2500,
    express_rate: 3500,
    estimated_days: {
      standard: "7-14 business days",
      express: "3-5 business days"
    }
  },
  "Canada": {
    standard_rate: 2800,
    express_rate: 3800,
    estimated_days: {
      standard: "8-15 business days",
      express: "4-6 business days"
    }
  },
  "Australia": {
    standard_rate: 3000,
    express_rate: 4000,
    estimated_days: {
      standard: "7-12 business days",
      express: "3-5 business days"
    }
  },
  "United Kingdom": {
    standard_rate: 3200,
    express_rate: 4200,
    estimated_days: {
      standard: "8-14 business days",
      express: "4-6 business days"
    }
  }
};

// Helper functions
export const findShippingRate = (country: string, province: string, city: string): ShippingRate | null => {
  if (country.toLowerCase() !== 'philippines') {
    return null;
  }

  // First try to find exact match with province and city
  let rate = PHILIPPINE_SHIPPING_RATES.find(rate => 
    rate.province.toLowerCase() === province.toLowerCase() &&
    city && rate.cities.some(c => c.toLowerCase() === city.toLowerCase())
  );

  // If no exact match found, try to find by province only
  if (!rate) {
    rate = PHILIPPINE_SHIPPING_RATES.find(rate => 
      rate.province.toLowerCase() === province.toLowerCase()
    );
  }

  return rate || null;
};

export const getShippingMethods = (country: string, province: string, city: string, totalWeight: number = 0): ShippingMethod[] => {
  const rate = findShippingRate(country, province, city);
  
  if (!rate) {
    // Default rates for unknown locations
    const baseStandardRate = 150;
    const baseExpressRate = 250;
    
    return [
      {
        id: 'standard',
        name: 'Standard Shipping',
        description: 'Regular ground shipping',
        estimated_days: '5-7 business days',
        price: calculateWeightAdjustedRate(baseStandardRate, totalWeight)
      },
      {
        id: 'express',
        name: 'Express Shipping',
        description: 'Faster delivery service',
        estimated_days: '2-3 business days',
        price: calculateWeightAdjustedRate(baseExpressRate, totalWeight)
      }
    ];
  }

  const methods: ShippingMethod[] = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      description: 'Regular ground shipping',
      estimated_days: rate.estimated_days.standard,
      price: calculateWeightAdjustedRate(rate.standard_rate, totalWeight)
    },
    {
      id: 'express',
      name: 'Express Shipping',
      description: 'Faster delivery service',
      estimated_days: rate.estimated_days.express,
      price: calculateWeightAdjustedRate(rate.express_rate, totalWeight)
    }
  ];

  if (rate.overnight_rate) {
    methods.push({
      id: 'overnight',
      name: 'Overnight Shipping',
      description: 'Next business day delivery',
      estimated_days: rate.estimated_days.overnight!,
      price: calculateWeightAdjustedRate(rate.overnight_rate, totalWeight)
    });
  }

  return methods;
};

export const calculateShippingFee = (country: string, province: string, city: string, method: string, totalWeight: number = 0): number => {
  const rate = findShippingRate(country, province, city);
  
  if (!rate) {
    // Default rates for unknown locations
    const baseRate = method === 'express' ? 250 : 150;
    return calculateWeightAdjustedRate(baseRate, totalWeight);
  }

  let baseRate: number;
  switch (method) {
    case 'express':
      baseRate = rate.express_rate;
      break;
    case 'overnight':
      baseRate = rate.overnight_rate || rate.express_rate;
      break;
    default:
      baseRate = rate.standard_rate;
  }

  return calculateWeightAdjustedRate(baseRate, totalWeight);
};

export const getBaseShippingMethods = (country: string, province: string, city: string): ShippingMethod[] => {
  const rate = findShippingRate(country, province, city);
  
  if (!rate) {
    // Default rates for unknown locations
    const baseStandardRate = 150;
    const baseExpressRate = 250;
    
    return [
      {
        id: 'standard',
        name: 'Standard Shipping',
        description: 'Regular ground shipping',
        estimated_days: '5-7 business days',
        price: baseStandardRate
      },
      {
        id: 'express',
        name: 'Express Shipping',
        description: 'Faster delivery service',
        estimated_days: '2-3 business days',
        price: baseExpressRate
      }
    ];
  }

  const methods: ShippingMethod[] = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      description: 'Regular ground shipping',
      estimated_days: rate.estimated_days.standard,
      price: rate.standard_rate
    },
    {
      id: 'express',
      name: 'Express Shipping',
      description: 'Faster delivery service',
      estimated_days: rate.estimated_days.express,
      price: rate.express_rate
    }
  ];

  if (rate.overnight_rate) {
    methods.push({
      id: 'overnight',
      name: 'Overnight Shipping',
      description: 'Next business day delivery',
      estimated_days: rate.estimated_days.overnight!,
      price: rate.overnight_rate
    });
  }

  return methods;
}; 
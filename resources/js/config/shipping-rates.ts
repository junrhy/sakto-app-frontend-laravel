export interface ShippingRate {
  region: string;
  province: string;
  cities: string[];
  standard_rate: number;
  express_rate: number;
  overnight_rate?: number;
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
}

export const PHILIPPINE_SHIPPING_RATES: ShippingRate[] = [
  // Metro Manila
  {
    region: "National Capital Region (NCR)",
    province: "Metro Manila",
    cities: [
      "Manila", "Quezon City", "Caloocan", "Las Piñas", "Makati", "Malabon", "Mandaluyong", 
      "Marikina", "Muntinlupa", "Navotas", "Parañaque", "Pasay", "Pasig", "San Juan", 
      "Taguig", "Valenzuela", "Pateros"
    ],
    standard_rate: 150,
    express_rate: 250,
    overnight_rate: 350,
    estimated_days: {
      standard: "3-5 business days",
      express: "1-2 business days",
      overnight: "Next business day"
    }
  },

  // Luzon - Central Luzon
  {
    region: "Central Luzon",
    province: "Bulacan",
    cities: ["Malolos", "Meycauayan", "San Jose del Monte", "Santa Maria", "Marilao", "Bocaue", "Guiguinto", "Balagtas", "Pandi", "Plaridel", "Pulilan", "Calumpit", "Paombong", "Hagonoy", "San Rafael", "Angat", "Norzagaray", "San Miguel", "Doña Remedios Trinidad"],
    standard_rate: 200,
    express_rate: 300,
    overnight_rate: 450,
    estimated_days: {
      standard: "3-5 business days",
      express: "1-2 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "Central Luzon",
    province: "Pampanga",
    cities: ["San Fernando", "Angeles", "Mabalacat", "San Jose", "Mexico", "Arayat", "Bacolor", "Candaba", "Floridablanca", "Guagua", "Lubao", "Magalang", "Masantol", "Porac", "San Luis", "San Simon", "Santa Ana", "Santa Rita", "Santo Tomas", "Sasmuan"],
    standard_rate: 200,
    express_rate: 300,
    overnight_rate: 450,
    estimated_days: {
      standard: "3-5 business days",
      express: "1-2 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "Central Luzon",
    province: "Nueva Ecija",
    cities: ["Cabanatuan", "Palayan", "San Jose", "Gapan", "Muñoz", "Talavera", "Guimba", "Peñaranda", "San Leonardo", "Santa Rosa", "Aliaga", "Bongabon", "Cabiao", "Carranglan", "Cuyapo", "Gabaldon", "General Mamerto Natividad", "General Tinio", "Jaen", "Laur", "Licab", "Llanera", "Lupao", "Nampicuan", "Pantabangan", "Quezon", "Rizal", "San Antonio", "San Isidro", "San Mariano", "Santa Fe", "Santo Domingo", "Tayug", "Zaragoza"],
    standard_rate: 250,
    express_rate: 350,
    estimated_days: {
      standard: "4-6 business days",
      express: "2-3 business days"
    }
  },

  // Luzon - CALABARZON
  {
    region: "CALABARZON",
    province: "Cavite",
    cities: ["Dasmariñas", "Bacoor", "Imus", "General Trias", "Trece Martires", "Tagaytay", "Silang", "General Mariano Alvarez", "Rosario", "Kawit", "Noveleta", "Tanza", "Naic", "Indang", "Alfonso", "Amadeo", "Carmona", "General Emilio Aguinaldo", "Magallanes", "Maragondon", "Mendez", "Ternate"],
    standard_rate: 180,
    express_rate: 280,
    overnight_rate: 400,
    estimated_days: {
      standard: "3-5 business days",
      express: "1-2 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "CALABARZON",
    province: "Laguna",
    cities: ["San Pablo", "Santa Rosa", "Biñan", "Cabuyao", "San Pedro", "Calamba", "Los Baños", "Sta. Cruz", "San Fernando", "Bay", "Alaminos", "Calauan", "Cavinti", "Famy", "Kalayaan", "Liliw", "Luisiana", "Lumban", "Mabitac", "Magdalena", "Majayjay", "Nagcarlan", "Paete", "Pagsanjan", "Pakil", "Pangil", "Pila", "Rizal", "Siniloan", "Victoria"],
    standard_rate: 180,
    express_rate: 280,
    overnight_rate: 400,
    estimated_days: {
      standard: "3-5 business days",
      express: "1-2 business days",
      overnight: "Next business day"
    }
  },
  {
    region: "CALABARZON",
    province: "Batangas",
    cities: ["Batangas City", "Lipa", "Tanauan", "Santo Tomas", "San Pablo", "Malvar", "Talisay", "San Jose", "Ibaan", "Bauan", "San Juan", "Taysan", "Rosario", "Padre Garcia", "San Nicolas", "Lemery", "Taal", "Balayan", "Calaca", "Calatagan", "Lian", "Nasugbu", "Tuy", "Mabini", "San Luis", "Tingloy", "Agoncillo", "Alitagtag", "Balete", "Cuenca", "Laurel", "Mataas na Kahoy", "San Pascual"],
    standard_rate: 200,
    express_rate: 300,
    estimated_days: {
      standard: "4-6 business days",
      express: "2-3 business days"
    }
  },

  // Luzon - Other Regions
  {
    region: "Ilocos Region",
    province: "Pangasinan",
    cities: ["Dagupan", "San Carlos", "Urdaneta", "Alaminos", "Manaoag", "San Fabian", "Lingayen", "Binmaley", "Calasiao", "Mangaldan", "Mapandan", "San Jacinto", "Sta. Barbara", "Malasiqui", "Bayambang", "Basista", "Mangatarem", "San Nicolas", "Tayug", "Asingan", "Sta. Maria", "San Manuel", "Binalonan", "Pozorrubio", "Sison", "San Quintin", "Natividad", "San Nicolas", "San Fabian", "Manaoag", "San Jacinto", "Mapandan", "Calasiao", "Binmaley", "Lingayen", "San Fabian", "Mangaldan", "Sta. Barbara", "Malasiqui", "Bayambang", "Basista", "Mangatarem", "San Nicolas", "Tayug", "Asingan", "Sta. Maria", "San Manuel", "Binalonan", "Pozorrubio", "Sison", "San Quintin", "Natividad"],
    standard_rate: 300,
    express_rate: 400,
    estimated_days: {
      standard: "5-7 business days",
      express: "3-4 business days"
    }
  },

  // Visayas
  {
    region: "Central Visayas",
    province: "Cebu",
    cities: ["Cebu City", "Mandaue", "Lapu-Lapu", "Talisay", "Toledo", "Danao", "Carcar", "Naga", "Talisay", "Minglanilla", "Consolacion", "Compostela", "Liloan", "San Fernando", "Cordova", "Aloguinsan", "Alcantara", "Alcoy", "Alegria", "Argao", "Asturias", "Badian", "Balamban", "Bantayan", "Barili", "Boljoon", "Borbon", "Carmen", "Catmon", "Compostela", "Daanbantayan", "Dalaguete", "Dumanjug", "Ginatilan", "Liloan", "Madridejos", "Malabuyoc", "Medellin", "Minglanilla", "Moalboal", "Oslob", "Pilar", "Pinamungajan", "Poro", "Ronda", "Samboan", "San Fernando", "San Francisco", "San Remigio", "Santa Fe", "Santander", "Sibonga", "Sogod", "Tabogon", "Tabuelan", "Tuburan", "Tudela"],
    standard_rate: 350,
    express_rate: 450,
    estimated_days: {
      standard: "5-7 business days",
      express: "3-4 business days"
    }
  },

  // Mindanao
  {
    region: "Davao Region",
    province: "Davao del Sur",
    cities: ["Davao City", "Digos", "Sta. Cruz", "Bansalan", "Hagonoy", "Kiblawan", "Magsaysay", "Malalag", "Matanao", "Padada", "Sulop"],
    standard_rate: 400,
    express_rate: 500,
    estimated_days: {
      standard: "6-8 business days",
      express: "4-5 business days"
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

  return PHILIPPINE_SHIPPING_RATES.find(rate => 
    rate.province.toLowerCase() === province.toLowerCase() &&
    rate.cities.some(c => c.toLowerCase() === city.toLowerCase())
  ) || null;
};

export const getShippingMethods = (country: string, province: string, city: string): ShippingMethod[] => {
  const rate = findShippingRate(country, province, city);
  
  if (!rate) {
    // Default rates for unknown locations
    return [
      {
        id: 'standard',
        name: 'Standard Shipping',
        description: 'Regular ground shipping',
        estimated_days: '5-7 business days',
        price: 300
      },
      {
        id: 'express',
        name: 'Express Shipping',
        description: 'Faster delivery service',
        estimated_days: '2-3 business days',
        price: 450
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

export const calculateShippingFee = (country: string, province: string, city: string, method: string): number => {
  const rate = findShippingRate(country, province, city);
  
  if (!rate) {
    // Default rates for unknown locations
    return method === 'express' ? 450 : 300;
  }

  switch (method) {
    case 'express':
      return rate.express_rate;
    case 'overnight':
      return rate.overnight_rate || rate.express_rate;
    default:
      return rate.standard_rate;
  }
}; 
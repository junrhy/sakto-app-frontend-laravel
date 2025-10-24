export interface PricingPlan {
    id: string;
    name: string;
    description: string;
    prices: {
        usd: number;
        php: number;
        eur: number;
        gbp: number;
        [key: string]: number;
    };
    price?: number; // Computed based on currency
    currency?: string; // Set dynamically
    period: string;
    features: string[];
    buttonText: string;
    buttonLink: string;
    popular?: boolean;
}

export interface ServicePricing {
    plans: PricingPlan[];
}

// Centralized pricing configuration
export const pricingConfig: Record<string, ServicePricing> = {
    logistics: {
        plans: [
            {
                id: 'basic',
                name: 'Basic',
                description: 'Perfect for small fleets and startups',
                prices: {
                    usd: 12,
                    php: 700,
                    eur: 11,
                    gbp: 9.5,
                },
                period: '/month',
                features: [
                    'Up to 10 vehicles',
                    'GPS tracking',
                    'Email support',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'Ideal for growing logistics companies',
                prices: {
                    usd: 20,
                    php: 1100,
                    eur: 18,
                    gbp: 16,
                },
                period: '/month',
                features: [
                    'Up to 50 vehicles',
                    'Advanced analytics',
                    'Priority support',
                    'API access',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
                popular: true,
            },
            {
                id: 'business',
                name: 'Business',
                description: 'For large enterprises and corporations',
                prices: {
                    usd: 35,
                    php: 2000,
                    eur: 32,
                    gbp: 28,
                },
                period: '/month',
                features: [
                    'Unlimited vehicles',
                    'Custom integrations',
                    '24/7 automated support',
                    'Advanced API access',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
        ],
    },
    medical: {
        plans: [
            {
                id: 'basic',
                name: 'Basic',
                description: 'Perfect for small clinics',
                prices: {
                    usd: 12,
                    php: 700,
                    eur: 11,
                    gbp: 9.5,
                },
                period: '/month',
                features: [
                    'Up to 5 practitioners',
                    'Patient management',
                    'Email support',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'Ideal for growing medical practices',
                prices: {
                    usd: 20,
                    php: 1100,
                    eur: 18,
                    gbp: 16,
                },
                period: '/month',
                features: [
                    'Up to 20 practitioners',
                    'Advanced scheduling',
                    'Priority support',
                    'API access',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
                popular: true,
            },
            {
                id: 'business',
                name: 'Business',
                description: 'For large hospitals and medical centers',
                prices: {
                    usd: 35,
                    php: 2000,
                    eur: 32,
                    gbp: 28,
                },
                period: '/month',
                features: [
                    'Unlimited practitioners',
                    'Custom integrations',
                    '24/7 automated support',
                    'Advanced API access',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
        ],
    },
    community: {
        plans: [
            {
                id: 'basic',
                name: 'Basic',
                description: 'Perfect for small communities',
                prices: {
                    usd: 12,
                    php: 700,
                    eur: 11,
                    gbp: 9.5,
                },
                period: '/month',
                features: [
                    'Up to 100 members',
                    'Basic community features',
                    'Email support',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'Ideal for growing communities',
                prices: {
                    usd: 20,
                    php: 1100,
                    eur: 18,
                    gbp: 16,
                },
                period: '/month',
                features: [
                    'Up to 500 members',
                    'Advanced moderation tools',
                    'Priority support',
                    'API access',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
                popular: true,
            },
            {
                id: 'business',
                name: 'Business',
                description: 'For large communities and organizations',
                prices: {
                    usd: 35,
                    php: 2000,
                    eur: 32,
                    gbp: 28,
                },
                period: '/month',
                features: [
                    'Unlimited members',
                    'Custom integrations',
                    '24/7 automated support',
                    'Advanced API access',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
        ],
    },
    travel: {
        plans: [
            {
                id: 'basic',
                name: 'Basic',
                description: 'Perfect for small travel agencies',
                prices: {
                    usd: 12,
                    php: 700,
                    eur: 11,
                    gbp: 9.5,
                },
                period: '/month',
                features: [
                    'Up to 10 bookings',
                    'Basic itinerary management',
                    'Email support',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'Ideal for growing travel businesses',
                prices: {
                    usd: 20,
                    php: 1100,
                    eur: 18,
                    gbp: 16,
                },
                period: '/month',
                features: [
                    'Up to 100 bookings',
                    'Advanced booking management',
                    'Priority support',
                    'API access',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
                popular: true,
            },
            {
                id: 'business',
                name: 'Business',
                description: 'For large travel companies',
                prices: {
                    usd: 35,
                    php: 2000,
                    eur: 32,
                    gbp: 28,
                },
                period: '/month',
                features: [
                    'Unlimited bookings',
                    'Custom integrations',
                    '24/7 automated support',
                    'Advanced API access',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
        ],
    },
    delivery: {
        plans: [
            {
                id: 'basic',
                name: 'Basic',
                description: 'Perfect for small delivery services',
                prices: {
                    usd: 12,
                    php: 700,
                    eur: 11,
                    gbp: 9.5,
                },
                period: '/month',
                features: [
                    'Up to 50 deliveries',
                    'Basic tracking',
                    'Email support',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'Ideal for growing delivery businesses',
                prices: {
                    usd: 20,
                    php: 1100,
                    eur: 18,
                    gbp: 16,
                },
                period: '/month',
                features: [
                    'Up to 200 deliveries',
                    'Advanced tracking',
                    'Priority support',
                    'API access',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
                popular: true,
            },
            {
                id: 'business',
                name: 'Business',
                description: 'For large delivery companies',
                prices: {
                    usd: 35,
                    php: 2000,
                    eur: 32,
                    gbp: 28,
                },
                period: '/month',
                features: [
                    'Unlimited deliveries',
                    'Custom integrations',
                    '24/7 automated support',
                    'Advanced API access',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
        ],
    },
    jobs: {
        plans: [
            {
                id: 'basic',
                name: 'Basic',
                description: 'Perfect for small job boards',
                prices: {
                    usd: 12,
                    php: 700,
                    eur: 11,
                    gbp: 9.5,
                },
                period: '/month',
                features: [
                    'Up to 50 job postings',
                    'Basic applicant management',
                    'Email support',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'Ideal for growing job platforms',
                prices: {
                    usd: 20,
                    php: 1100,
                    eur: 18,
                    gbp: 16,
                },
                period: '/month',
                features: [
                    'Up to 200 job postings',
                    'Advanced applicant management',
                    'Priority support',
                    'API access',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
                popular: true,
            },
            {
                id: 'business',
                name: 'Business',
                description: 'For large job platforms',
                prices: {
                    usd: 35,
                    php: 2000,
                    eur: 32,
                    gbp: 28,
                },
                period: '/month',
                features: [
                    'Unlimited job postings',
                    'Custom integrations',
                    '24/7 automated support',
                    'Advanced API access',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
        ],
    },
    shop: {
        plans: [
            {
                id: 'basic',
                name: 'Basic',
                description: 'Perfect for small online stores',
                prices: {
                    usd: 12,
                    php: 700,
                    eur: 11,
                    gbp: 9.5,
                },
                period: '/month',
                features: [
                    'Up to 100 products',
                    'Basic inventory management',
                    'Email support',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'Ideal for growing online stores',
                prices: {
                    usd: 20,
                    php: 1100,
                    eur: 18,
                    gbp: 16,
                },
                period: '/month',
                features: [
                    'Up to 500 products',
                    'Advanced inventory management',
                    'Priority support',
                    'API access',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
                popular: true,
            },
            {
                id: 'business',
                name: 'Business',
                description: 'For large online stores',
                prices: {
                    usd: 35,
                    php: 2000,
                    eur: 32,
                    gbp: 28,
                },
                period: '/month',
                features: [
                    'Unlimited products',
                    'Custom integrations',
                    '24/7 automated support',
                    'Advanced API access',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
        ],
    },
    fnb: {
        plans: [
            {
                id: 'basic',
                name: 'Basic',
                description: 'Perfect for small cafes and food stalls',
                prices: {
                    usd: 49,
                    php: 2500,
                    eur: 44,
                    gbp: 38,
                },
                period: '/month',
                features: [
                    'Up to 5 tables',
                    'Up to 150 reservations',
                    'Up to 50 menu items',
                    'Email confirmations',
                    'SMS confirmations',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'Ideal for growing restaurants',
                prices: {
                    usd: 99,
                    php: 5000,
                    eur: 88,
                    gbp: 78,
                },
                period: '/month',
                features: [
                    'Up to 20 tables',
                    'Up to 1,000 reservations',
                    'Up to 250 menu items',
                    '5 Online Stores',
                    'Kitchen display system',
                    'Email confirmations',
                    'SMS confirmations',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
                popular: true,
            },
            {
                id: 'business',
                name: 'Business',
                description: 'For large restaurants and chains',
                prices: {
                    usd: 199,
                    php: 10000,
                    eur: 188,
                    gbp: 168,
                },
                period: '/month',
                features: [
                    'Unlimited tables',
                    'Unlimited reservations',
                    'Unlimited Online Stores',
                    'Unlimited menu items',
                    'Email confirmations',
                    'SMS confirmations',
                    'Kitchen display system',
                    'Customer display system',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
        ],
    },
    education: {
        plans: [
            {
                id: 'basic',
                name: 'Basic',
                description: 'Perfect for small schools and tutors',
                prices: {
                    usd: 12,
                    php: 700,
                    eur: 11,
                    gbp: 9.5,
                },
                period: '/month',
                features: [
                    'Up to 50 students',
                    'Course management',
                    'Basic assessments',
                    'Email support',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'Ideal for growing educational institutions',
                prices: {
                    usd: 20,
                    php: 1100,
                    eur: 18,
                    gbp: 16,
                },
                period: '/month',
                features: [
                    'Up to 500 students',
                    'Advanced analytics',
                    'Live virtual classes',
                    'Discussion forums',
                    'Priority support',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
                popular: true,
            },
            {
                id: 'business',
                name: 'Business',
                description: 'For large schools and universities',
                prices: {
                    usd: 35,
                    php: 2000,
                    eur: 32,
                    gbp: 28,
                },
                period: '/month',
                features: [
                    'Unlimited students',
                    'Custom integrations',
                    'White-label option',
                    'Advanced reporting',
                    '24/7 automated support',
                    'Advanced API access',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
        ],
    },
    finance: {
        plans: [
            {
                id: 'basic',
                name: 'Basic',
                description: 'Perfect for individuals and freelancers',
                prices: {
                    usd: 12,
                    php: 700,
                    eur: 11,
                    gbp: 9.5,
                },
                period: '/month',
                features: [
                    'Expense tracking',
                    'Budget management',
                    'Basic reports',
                    'Email support',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'Ideal for small to medium businesses',
                prices: {
                    usd: 20,
                    php: 1100,
                    eur: 18,
                    gbp: 16,
                },
                period: '/month',
                features: [
                    'Bank account sync',
                    'Invoice management',
                    'Advanced analytics',
                    'Multi-currency support',
                    'Priority support',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
                popular: true,
            },
            {
                id: 'business',
                name: 'Business',
                description: 'For large enterprises',
                prices: {
                    usd: 35,
                    php: 2000,
                    eur: 32,
                    gbp: 28,
                },
                period: '/month',
                features: [
                    'Unlimited accounts',
                    'Custom integrations',
                    'API access',
                    'Advanced reporting',
                    '24/7 automated support',
                    'Advanced analytics',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
        ],
    },
    agriculture: {
        plans: [
            {
                id: 'basic',
                name: 'Basic',
                description: 'Perfect for small family farms',
                prices: {
                    usd: 12,
                    php: 700,
                    eur: 11,
                    gbp: 9.5,
                },
                period: '/month',
                features: [
                    'Up to 10 hectares',
                    'Crop tracking',
                    'Weather updates',
                    'Email support',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'Ideal for commercial farms',
                prices: {
                    usd: 20,
                    php: 1100,
                    eur: 18,
                    gbp: 16,
                },
                period: '/month',
                features: [
                    'Up to 100 hectares',
                    'Equipment management',
                    'Yield analytics',
                    'Inventory tracking',
                    'Priority support',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
                popular: true,
            },
            {
                id: 'business',
                name: 'Business',
                description: 'For large agricultural operations',
                prices: {
                    usd: 35,
                    php: 2000,
                    eur: 32,
                    gbp: 28,
                },
                period: '/month',
                features: [
                    'Unlimited hectares',
                    'Multi-farm support',
                    'Advanced analytics',
                    'Custom integrations',
                    '24/7 automated support',
                    'Advanced API access',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
        ],
    },
    construction: {
        plans: [
            {
                id: 'basic',
                name: 'Basic',
                description: 'Perfect for small contractors',
                prices: {
                    usd: 12,
                    php: 700,
                    eur: 11,
                    gbp: 9.5,
                },
                period: '/month',
                features: [
                    'Up to 5 active projects',
                    'Team management',
                    'Budget tracking',
                    'Email support',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'Ideal for growing construction firms',
                prices: {
                    usd: 20,
                    php: 1100,
                    eur: 18,
                    gbp: 16,
                },
                period: '/month',
                features: [
                    'Up to 25 active projects',
                    'Equipment tracking',
                    'Material management',
                    'Safety compliance',
                    'Priority support',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
                popular: true,
            },
            {
                id: 'business',
                name: 'Business',
                description: 'For large construction companies',
                prices: {
                    usd: 35,
                    php: 2000,
                    eur: 32,
                    gbp: 28,
                },
                period: '/month',
                features: [
                    'Unlimited projects',
                    'Multi-site support',
                    'Custom integrations',
                    'Advanced reporting',
                    '24/7 automated support',
                    'Advanced API access',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
        ],
    },
};

export const getPricingForService = (
    serviceName: string,
    currency: string = 'usd',
    symbol: string = '$',
): ServicePricing | undefined => {
    const config = pricingConfig[serviceName];
    if (!config) return undefined;

    // Update price based on currency and add symbol for all plans
    return {
        plans: config.plans.map((plan) => ({
            ...plan,
            price: plan.prices[currency.toLowerCase()] || plan.prices.usd,
            currency: symbol,
        })),
    };
};

export interface PricingPlan {
    id: string;
    name: string;
    description: string;
    tagline?: string;
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
                id: 'starter',
                name: 'Starter',
                description: 'Try our logistics platform risk-free for 14 days',
                tagline:
                    'Test drive all features with zero commitment and zero cost',
                prices: {
                    usd: 0,
                    php: 0,
                    eur: 0,
                    gbp: 0,
                },
                period: '/month',
                features: ['Explore all core features before committing'],
                buttonText: 'Start Free Trial',
                buttonLink: 'register',
            },
            {
                id: 'basic',
                name: 'Basic',
                description: 'Perfect for small fleets and startups',
                tagline:
                    'Start tracking your fleet with essential GPS and reporting tools',
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
                    'Email & SMS Integrations',
                    'Email support',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'Ideal for growing logistics companies',
                tagline:
                    'Scale your operations with advanced analytics and priority support',
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
                    'Email & SMS Integrations',
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
                tagline:
                    'Enterprise-grade fleet management with unlimited vehicles and custom integrations',
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
                    'Email & SMS Integrations',
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
                id: 'starter',
                name: 'Starter',
                description: 'Try our medical platform risk-free for 14 days',
                tagline:
                    'Test drive all features with zero commitment and zero cost',
                prices: {
                    usd: 0,
                    php: 0,
                    eur: 0,
                    gbp: 0,
                },
                period: '/month',
                features: ['Explore all core features before committing'],
                buttonText: 'Start Free Trial',
                buttonLink: 'register',
            },
            {
                id: 'basic',
                name: 'Basic',
                description: 'Perfect for small clinics',
                tagline:
                    'Streamline patient care with essential management and scheduling tools',
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
                    'Email & SMS Integrations',
                    'Email support',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'Ideal for growing medical practices',
                tagline:
                    'Enhance your practice with advanced scheduling and priority support',
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
                    'Email & SMS Integrations',
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
                tagline:
                    'Hospital-grade platform with unlimited practitioners and full integrations',
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
                    'Email & SMS Integrations',
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
                id: 'starter',
                name: 'Starter',
                description: 'Try our community platform risk-free for 14 days',
                tagline:
                    'Test drive all features with zero commitment and zero cost',
                prices: {
                    usd: 0,
                    php: 0,
                    eur: 0,
                    gbp: 0,
                },
                period: '/month',
                features: ['Explore all core features before committing'],
                buttonText: 'Start Free Trial',
                buttonLink: 'register',
            },
            {
                id: 'basic',
                name: 'Basic',
                description: 'Perfect for small communities',
                tagline:
                    'Build and engage your community with essential collaboration tools',
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
                    'Email & SMS Integrations',
                    'Email support',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'Ideal for growing communities',
                tagline:
                    'Grow your community with advanced moderation and engagement features',
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
                    'Email & SMS Integrations',
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
                tagline:
                    'Enterprise community platform with unlimited members and custom integrations',
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
                    'Email & SMS Integrations',
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
                id: 'starter',
                name: 'Starter',
                description: 'Try our travel platform risk-free for 14 days',
                tagline:
                    'Test drive all features with zero commitment and zero cost',
                prices: {
                    usd: 0,
                    php: 0,
                    eur: 0,
                    gbp: 0,
                },
                period: '/month',
                features: ['Explore all core features before committing'],
                buttonText: 'Start Free Trial',
                buttonLink: 'register',
            },
            {
                id: 'basic',
                name: 'Basic',
                description: 'Perfect for small travel agencies',
                tagline:
                    'Launch your travel business with essential booking and itinerary tools',
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
                    'Email & SMS Integrations',
                    'Email support',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'Ideal for growing travel businesses',
                tagline:
                    'Expand your reach with advanced booking management and automation',
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
                    'Email & SMS Integrations',
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
                tagline:
                    'Enterprise travel platform with unlimited bookings and full integrations',
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
                    'Email & SMS Integrations',
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
                id: 'starter',
                name: 'Starter',
                description: 'Try our delivery platform risk-free for 14 days',
                tagline:
                    'Test drive all features with zero commitment and zero cost',
                prices: {
                    usd: 0,
                    php: 0,
                    eur: 0,
                    gbp: 0,
                },
                period: '/month',
                features: ['Explore all core features before committing'],
                buttonText: 'Start Free Trial',
                buttonLink: 'register',
            },
            {
                id: 'basic',
                name: 'Basic',
                description: 'Perfect for small delivery services',
                tagline:
                    'Start delivering with real-time tracking and essential management tools',
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
                    'Email & SMS Integrations',
                    'Email support',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'Ideal for growing delivery businesses',
                tagline:
                    'Scale your delivery operations with advanced tracking and automation',
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
                    'Email & SMS Integrations',
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
                tagline:
                    'Enterprise delivery platform with unlimited capacity and full integrations',
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
                    'Email & SMS Integrations',
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
                id: 'starter',
                name: 'Starter',
                description: 'Start your job board business risk-free for 14 days',
                tagline:
                    'Test drive all features to create and manage your job board with zero commitment and zero cost',
                prices: {
                    usd: 0,
                    php: 0,
                    eur: 0,
                    gbp: 0,
                },
                period: '/month',
                features: ['Explore all core features before committing'],
                buttonText: 'Start Free Trial',
                buttonLink: 'register',
            },
            {
                id: 'basic',
                name: 'Starter',
                description: 'Perfect for starting your job board business',
                tagline:
                    'Launch your job board with essential management tools and application tracking',
                prices: {
                    usd: 12,
                    php: 700,
                    eur: 11,
                    gbp: 9.5,
                },
                period: '/month',
                features: [
                    'Single job board',
                    'Job board management',
                    'Application tracking',
                    'Email & SMS Integrations',
                    'Email support',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
            {
                id: 'pro',
                name: 'Professional',
                description: 'Ideal for growing job board businesses',
                tagline:
                    'Scale your recruitment business with multiple job boards and advanced management',
                prices: {
                    usd: 20,
                    php: 1100,
                    eur: 18,
                    gbp: 16,
                },
                period: '/month',
                features: [
                    'Multiple job boards',
                    'Advanced applicant management',
                    'Analytics & reporting',
                    'Email & SMS Integrations',
                    'Priority support',
                    'API access',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
                popular: true,
            },
            {
                id: 'business',
                name: 'Enterprise',
                description: 'Perfect for established job board businesses',
                tagline:
                    'Enterprise job board platform with unlimited boards and full integrations',
                prices: {
                    usd: 35,
                    php: 2000,
                    eur: 32,
                    gbp: 28,
                },
                period: '/month',
                features: [
                    'Unlimited job boards',
                    'Custom integrations',
                    'Email & SMS Integrations',
                    '24/7 automated support',
                    'Advanced API access',
                    'Priority support & custom features',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
        ],
    },
    shop: {
        plans: [
            {
                id: 'starter',
                name: 'Starter',
                description: 'Try our shop platform risk-free for 14 days',
                tagline:
                    'Test drive all features with zero commitment and zero cost',
                prices: {
                    usd: 0,
                    php: 0,
                    eur: 0,
                    gbp: 0,
                },
                period: '/month',
                features: ['Explore all core features before committing'],
                buttonText: 'Start Free Trial',
                buttonLink: 'register',
            },
            {
                id: 'basic',
                name: 'Basic',
                description: 'Perfect for small online stores',
                tagline:
                    'Launch your online store with essential e-commerce and inventory tools',
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
                    'Email & SMS Integrations',
                    'Email support',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'Ideal for growing online stores',
                tagline:
                    'Grow your sales with advanced inventory management and analytics',
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
                    'Email & SMS Integrations',
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
                tagline:
                    'Enterprise e-commerce platform with unlimited products and full integrations',
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
                    'Email & SMS Integrations',
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
                id: 'starter',
                name: 'Starter',
                description:
                    'Try Neulify F&B risk-free for 14 days with no credit card required',
                tagline:
                    'Test drive all features with zero commitment and zero cost',
                prices: {
                    usd: 0,
                    php: 0,
                    eur: 0,
                    gbp: 0,
                },
                period: '/month',
                features: ['Explore all core features before committing'],
                buttonText: 'Start Free Trial',
                buttonLink: 'register',
            },
            {
                id: 'basic',
                name: 'Basic',
                description: 'Get organized and save time',
                tagline:
                    'Perfect for cafés, stalls, or small diners ready to modernize reservations and menus',
                prices: {
                    usd: 59,
                    php: 3400,
                    eur: 54,
                    gbp: 47,
                },
                period: '/month',
                features: [
                    'Up to 10 tables',
                    'Up to 300 reservations',
                    'Up to 100 menu items',
                    'Email & SMS Integrations',
                    'Basic analytics dashboard',
                    '1 online store',
                    'Free updates + live chat support',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'Grow faster and serve smarter',
                tagline:
                    'Ideal for restaurants with high volume that want smooth operations and happy customers',
                prices: {
                    usd: 119,
                    php: 6900,
                    eur: 109,
                    gbp: 94,
                },
                period: '/month',
                features: [
                    'Up to 30 tables',
                    'Up to 2,000 reservations',
                    'Up to 500 menu items',
                    'Up to 5 Online Stores',
                    'Kitchen display system',
                    'Customer display system',
                    'Email & SMS Integrations',
                    'Priority support',
                    'Full analytics dashboard',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
                popular: true,
            },
            {
                id: 'business',
                name: 'Business',
                description: 'Run like a chain — with enterprise power',
                tagline:
                    'For multi-branch restaurants that want total automation, real-time analytics, and centralized management',
                prices: {
                    usd: 249,
                    php: 14400,
                    eur: 229,
                    gbp: 197,
                },
                period: '/month',
                features: [
                    'Unlimited tables, reservations, and menu items',
                    'Unlimited Online Stores',
                    'Kitchen & customer displays',
                    'Email & SMS Integrations',
                    'Full analytics dashboard',
                    'Chain-wide dashboard',
                    'Centralized menu & staff management',
                    'Dedicated success manager',
                    'Custom integrations',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
        ],
    },
    education: {
        plans: [
            {
                id: 'starter',
                name: 'Starter',
                description: 'Try our education platform risk-free for 14 days',
                tagline:
                    'Test drive all features with zero commitment and zero cost',
                prices: {
                    usd: 0,
                    php: 0,
                    eur: 0,
                    gbp: 0,
                },
                period: '/month',
                features: ['Explore all core features before committing'],
                buttonText: 'Start Free Trial',
                buttonLink: 'register',
            },
            {
                id: 'basic',
                name: 'Basic',
                description: 'Perfect for small schools and tutors',
                tagline:
                    'Start teaching online with essential course management and assessments',
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
                    'Email & SMS Integrations',
                    'Email support',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'Ideal for growing educational institutions',
                tagline:
                    'Enhance learning with live classes, analytics, and interactive tools',
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
                    'Email & SMS Integrations',
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
                tagline:
                    'Enterprise learning platform with unlimited students and white-label options',
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
                    'Email & SMS Integrations',
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
                id: 'starter',
                name: 'Starter',
                description: 'Try our finance platform risk-free for 14 days',
                tagline:
                    'Test drive all features with zero commitment and zero cost',
                prices: {
                    usd: 0,
                    php: 0,
                    eur: 0,
                    gbp: 0,
                },
                period: '/month',
                features: ['Explore all core features before committing'],
                buttonText: 'Start Free Trial',
                buttonLink: 'register',
            },
            {
                id: 'basic',
                name: 'Basic',
                description: 'Perfect for individuals and freelancers',
                tagline:
                    'Take control of your finances with essential tracking and budgeting tools',
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
                    'Email & SMS Integrations',
                    'Email support',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'Ideal for small to medium businesses',
                tagline:
                    'Automate accounting with bank sync, invoicing, and multi-currency support',
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
                    'Email & SMS Integrations',
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
                tagline:
                    'Enterprise financial platform with unlimited accounts and full integrations',
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
                    'Email & SMS Integrations',
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
                id: 'starter',
                name: 'Starter',
                description:
                    'Try our agriculture platform risk-free for 14 days',
                tagline:
                    'Test drive all features with zero commitment and zero cost',
                prices: {
                    usd: 0,
                    php: 0,
                    eur: 0,
                    gbp: 0,
                },
                period: '/month',
                features: ['Explore all core features before committing'],
                buttonText: 'Start Free Trial',
                buttonLink: 'register',
            },
            {
                id: 'basic',
                name: 'Basic',
                description: 'Perfect for small family farms',
                tagline:
                    'Optimize your farm with essential crop tracking and weather updates',
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
                    'Email & SMS Integrations',
                    'Email support',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'Ideal for commercial farms',
                tagline:
                    'Maximize yields with equipment management and advanced analytics',
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
                    'Email & SMS Integrations',
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
                tagline:
                    'Enterprise farm management with multi-farm support and full integrations',
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
                    'Email & SMS Integrations',
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
                id: 'starter',
                name: 'Starter',
                description:
                    'Try our construction platform risk-free for 14 days',
                tagline:
                    'Test drive all features with zero commitment and zero cost',
                prices: {
                    usd: 0,
                    php: 0,
                    eur: 0,
                    gbp: 0,
                },
                period: '/month',
                features: ['Explore all core features before committing'],
                buttonText: 'Start Free Trial',
                buttonLink: 'register',
            },
            {
                id: 'basic',
                name: 'Basic',
                description: 'Perfect for small contractors',
                tagline:
                    'Manage projects efficiently with team coordination and budget tracking',
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
                    'Email & SMS Integrations',
                    'Email support',
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'Ideal for growing construction firms',
                tagline:
                    'Scale operations with equipment tracking and safety compliance tools',
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
                    'Email & SMS Integrations',
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
                tagline:
                    'Enterprise construction platform with multi-site support and full integrations',
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
                    'Email & SMS Integrations',
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

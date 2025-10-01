export interface PricingPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
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
                price: 299,
                currency: '₱',
                period: '/month',
                features: [
                    'Up to 10 vehicles',
                    'GPS tracking',
                    'Email support'
                ],
                buttonText: 'Get Started',
                buttonLink: 'register'
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'Ideal for growing logistics companies',
                price: 599,
                currency: '₱',
                period: '/month',
                features: [
                    'Up to 50 vehicles',
                    'Advanced analytics',
                    'Priority support',
                    'API access'
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
                popular: true,
            },
            {
                id: 'business',
                name: 'Business',
                description: 'For large enterprises and corporations',
                price: 999,
                currency: '₱',
                period: '/month',
                features: [
                    'Unlimited vehicles',
                    'Custom integrations',
                    '24/7 phone support',
                    'Dedicated account manager'
                ],
                buttonText: 'Contact Sales',
                buttonLink: 'contact'
            }
        ]
    },
    medical: {
        plans: [
            {
                id: 'basic',
                name: 'Basic',
                description: 'Perfect for small clinics',
                price: 399,
                currency: '₱',
                period: '/month',
                features: [
                    'Up to 5 practitioners',
                    'Patient management',
                    'Email support'
                ],
                buttonText: 'Get Started',
                buttonLink: 'register'
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'Ideal for growing medical practices',
                price: 799,
                currency: '₱',
                period: '/month',
                features: [
                    'Up to 20 practitioners',
                    'Advanced scheduling',
                    'Priority support',
                    'API access'
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
                popular: true,
            },
            {
                id: 'business',
                name: 'Business',
                description: 'For large hospitals and medical centers',
                price: 1499,
                currency: '₱',
                period: '/month',
                features: [
                    'Unlimited practitioners',
                    'Custom integrations',
                    '24/7 phone support',
                    'Dedicated account manager'
                ],
                buttonText: 'Contact Sales',
                buttonLink: 'contact'
            }
        ]
    },
    community: {
        plans: [
            {
                id: 'basic',
                name: 'Basic',
                description: 'Perfect for small communities',
                price: 299,
                currency: '₱',
                period: '/month',
                features: [
                    'Up to 100 members',
                    'Basic community features',
                    'Email support'
                ],
                buttonText: 'Get Started',
                buttonLink: 'register'
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'Ideal for growing communities',
                price: 599,
                currency: '₱',
                period: '/month',
                features: [
                    'Up to 500 members',
                    'Advanced moderation tools',
                    'Priority support',
                    'API access'
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
                popular: true,
            },
            {
                id: 'business',
                name: 'Business',
                description: 'For large communities and organizations',
                price: 999,
                currency: '₱',
                period: '/month',
                features: [
                    'Unlimited members',
                    'Custom integrations',
                    '24/7 phone support',
                    'Dedicated account manager'
                ],
                buttonText: 'Contact Sales',
                buttonLink: 'contact'
            }
        ]
    },
    travel: {
        plans: [
            {
                id: 'basic',
                name: 'Basic',
                description: 'Perfect for small travel agencies',
                price: 199,
                currency: '₱',
                period: '/month',
                features: [
                    'Up to 10 bookings',
                    'Basic itinerary management',
                    'Email support'
                ],
                buttonText: 'Get Started',
                buttonLink: 'register'
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'Ideal for growing travel businesses',
                price: 499,
                currency: '₱',
                period: '/month',
                features: [
                    'Up to 100 bookings',
                    'Advanced booking management',
                    'Priority support',
                    'API access'
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
                popular: true,
            },
            {
                id: 'business',
                name: 'Business',
                description: 'For large travel companies',
                price: 899,
                currency: '₱',
                period: '/month',
                features: [
                    'Unlimited bookings',
                    'Custom integrations',
                    '24/7 phone support',
                    'Dedicated account manager'
                ],
                buttonText: 'Contact Sales',
                buttonLink: 'contact'
            }
        ]
    },
    delivery: {
        plans: [
            {
                id: 'basic',
                name: 'Basic',
                description: 'Perfect for small delivery services',
                price: 199,
                currency: '₱',
                period: '/month',
                features: [
                    'Up to 50 deliveries',
                    'Basic tracking',
                    'Email support'
                ],
                buttonText: 'Get Started',
                buttonLink: 'register'
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'Ideal for growing delivery businesses',
                price: 399,
                currency: '₱',
                period: '/month',
                features: [
                    'Up to 200 deliveries',
                    'Advanced tracking',
                    'Priority support',
                    'API access'
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
                popular: true,
            },
            {
                id: 'business',
                name: 'Business',
                description: 'For large delivery companies',
                price: 799,
                currency: '₱',
                period: '/month',
                features: [
                    'Unlimited deliveries',
                    'Custom integrations',
                    '24/7 phone support',
                    'Dedicated account manager'
                ],
                buttonText: 'Contact Sales',
                buttonLink: 'contact'
            }
        ]
    },
    jobs: {
        plans: [
            {
                id: 'basic',
                name: 'Basic',
                description: 'Perfect for small job boards',
                price: 299,
                currency: '₱',
                period: '/month',
                features: [
                    'Up to 50 job postings',
                    'Basic applicant management',
                    'Email support'
                ],
                buttonText: 'Get Started',
                buttonLink: 'register'
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'Ideal for growing job platforms',
                price: 599,
                currency: '₱',
                period: '/month',
                features: [
                    'Up to 200 job postings',
                    'Advanced applicant management',
                    'Priority support',
                    'API access'
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
                popular: true,
            },
            {
                id: 'business',
                name: 'Business',
                description: 'For large job platforms',
                price: 999,
                currency: '₱',
                period: '/month',
                features: [
                    'Unlimited job postings',
                    'Custom integrations',
                    '24/7 phone support',
                    'Dedicated account manager'
                ],
                buttonText: 'Contact Sales',
                buttonLink: 'contact'
            }
        ]
    },
    shop: {
        plans: [
            {
                id: 'basic',
                name: 'Basic',
                description: 'Perfect for small online stores',
                price: 199,
                currency: '₱',
                period: '/month',
                features: [
                    'Up to 100 products',
                    'Basic inventory management',
                    'Email support'
                ],
                buttonText: 'Get Started',
                buttonLink: 'register'
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'Ideal for growing online stores',
                price: 399,
                currency: '₱',
                period: '/month',
                features: [
                    'Up to 500 products',
                    'Advanced inventory management',
                    'Priority support',
                    'API access'
                ],
                buttonText: 'Get Started',
                buttonLink: 'register',
                popular: true,
            },
            {
                id: 'business',
                name: 'Business',
                description: 'For large online stores',
                price: 799,
                currency: '₱',
                period: '/month',
                features: [
                    'Unlimited products',
                    'Custom integrations',
                    '24/7 phone support',
                    'Dedicated account manager'
                ],
                buttonText: 'Contact Sales',
                buttonLink: 'contact'
            }
        ]
    }
};

export const getPricingForService = (serviceName: string): ServicePricing | undefined => {
    return pricingConfig[serviceName];
};
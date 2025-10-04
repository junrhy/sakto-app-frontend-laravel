// Menu configuration for better maintainability
export interface MenuItem {
    id: string;
    title: string;
    href: string;
    urlCheck?: string; // Custom URL check pattern if different from id
}

export interface MenuCategory {
    id: string;
    title: string;
    items: MenuItem[];
}

export const menuCategories: MenuCategory[] = [
    {
        id: 'business',
        title: 'Business',
        items: [
            { id: 'retail', title: 'Retail', href: '/retail?app=retail' },
            { id: 'fnb', title: 'F&B', href: '/pos-restaurant?app=fnb' },
            {
                id: 'warehousing',
                title: 'Warehousing',
                href: '/warehousing?app=warehousing',
            },
            {
                id: 'transportation',
                title: 'Transportation',
                href: '/transportation?app=transportation',
            },
            {
                id: 'transportation-settings',
                title: 'Settings',
                href: '/transportation/settings?app=transportation',
            },
        ],
    },
    {
        id: 'rental',
        title: 'Rental',
        items: [
            {
                id: 'rental-items',
                title: 'Rental Items',
                href: '/rental-items?app=rental-items',
            },
            {
                id: 'rental-properties',
                title: 'Rental Properties',
                href: '/rental-properties?app=rental-properties',
            },
        ],
    },
    {
        id: 'medical',
        title: 'Medical',
        items: [
            { id: 'clinic', title: 'Clinic', href: '/clinic?app=clinic' },
            {
                id: 'clinic-settings',
                title: 'Settings',
                href: '/clinic/settings?app=clinic',
            },
            {
                id: 'queue-system',
                title: 'Queue System',
                href: '/queue?app=queue-system',
                urlCheck: 'queue',
            },
            {
                id: 'mortuary',
                title: 'Mortuary',
                href: '/mortuary?app=mortuary',
            },
            {
                id: 'healthcare',
                title: 'Healthcare',
                href: '/health-insurance?app=health-insurance',
            },
        ],
    },
    {
        id: 'financial',
        title: 'Financial',
        items: [
            { id: 'lending', title: 'Lending', href: '/loan?app=loan' },
            { id: 'payroll', title: 'Payroll', href: '/payroll?app=payroll' },
            { id: 'billers', title: 'Billers', href: '/billers?app=billers' },
            {
                id: 'bill-payments',
                title: 'Bill Payments',
                href: '/bill-payments?app=bill-payments',
            },
        ],
    },
    {
        id: 'communication',
        title: 'Communication',
        items: [
            {
                id: 'sms-semaphore',
                title: 'Philippine SMS',
                href: '/sms-semaphore?app=sms',
            },
            {
                id: 'sms-twilio',
                title: 'International SMS',
                href: '/sms-twilio?app=sms',
            },
            {
                id: 'sms-whatsapp',
                title: 'WhatsApp',
                href: '/sms-whatsapp?app=sms',
            },
            {
                id: 'whatsapp-setup',
                title: 'WhatsApp Setup',
                href: '/whatsapp-accounts?app=sms',
            },
            {
                id: 'sms-viber',
                title: 'Viber',
                href: '/sms-viber?app=sms',
            },
            {
                id: 'viber-setup',
                title: 'Viber Setup',
                href: '/viber-accounts?app=sms',
            },
            { id: 'email', title: 'Email', href: '/email?app=email' },
            {
                id: 'contacts',
                title: 'Contacts',
                href: '/contacts?app=contacts',
            },
        ],
    },
    {
        id: 'content',
        title: 'Content & Events',
        items: [
            {
                id: 'genealogy',
                title: 'Genealogy',
                href: '/genealogy?app=genealogy',
            },
            { id: 'events', title: 'Events', href: '/events?app=events' },
            {
                id: 'challenges',
                title: 'Challenges',
                href: '/challenges?app=challenges',
            },
            {
                id: 'content-creator',
                title: 'Content Creator',
                href: '/content-creator?app=content-creator',
            },
            {
                id: 'products',
                title: 'Products',
                href: '/products?app=products',
            },
            { id: 'pages', title: 'Pages', href: '/pages?app=pages' },
            { id: 'courses', title: 'Courses', href: '/courses?app=courses' },
        ],
    },
    {
        id: 'travel',
        title: 'Travel',
        items: [{ id: 'travel', title: 'Travel', href: '/travel?app=travel' }],
    },
];

// Helper functions for menu logic
export const shouldShowMenuItem = (
    item: MenuItem,
    hasModuleAccess: (id: string) => boolean,
    appParam: string | null,
    url: string,
) => {
    const checkUrl = item.urlCheck || item.id;

    // Handle submenu items (like clinic-settings) that should be visible when parent module is accessible
    if (item.id.includes('-')) {
        const parentModule = item.id.split('-')[0];
        const hasParentAccess = hasModuleAccess(parentModule);
        // Check if we're in the parent module context - either via appParam or URL contains the module
        const isCurrentApp =
            appParam === parentModule ||
            url.includes(`/${parentModule}`) ||
            url.includes(`?app=${parentModule}`);
        return hasParentAccess && isCurrentApp;
    }

    return (
        hasModuleAccess(item.id) &&
        (appParam === item.id || url.includes(checkUrl))
    );
};

export const getVisibleItems = (
    category: MenuCategory,
    hasModuleAccess: (id: string) => boolean,
    appParam: string | null,
    url: string,
) => {
    return category.items.filter((item) =>
        shouldShowMenuItem(item, hasModuleAccess, appParam, url),
    );
};

export const shouldShowCategory = (
    category: MenuCategory,
    hasModuleAccess: (id: string) => boolean,
    appParam: string | null,
    url: string,
) => {
    return getVisibleItems(category, hasModuleAccess, appParam, url).length > 0;
};

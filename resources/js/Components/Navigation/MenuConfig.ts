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
            { id: 'retail', title: 'Retail', href: '/dashboard?app=retail' },
            { id: 'fnb', title: 'F&B', href: '/dashboard?app=fnb' },
            { id: 'warehousing', title: 'Warehousing', href: '/dashboard?app=warehousing' },
            { id: 'transportation', title: 'Transportation', href: '/dashboard?app=transportation' },
        ]
    },
    {
        id: 'rental',
        title: 'Rental',
        items: [
            { id: 'rental-items', title: 'Rental Items', href: '/dashboard?app=rental-items' },
            { id: 'rental-properties', title: 'Rental Properties', href: '/dashboard?app=rental-properties' },
        ]
    },
    {
        id: 'medical',
        title: 'Medical',
        items: [
            { id: 'clinic', title: 'Clinic', href: '/dashboard?app=clinic' },
            { id: 'queue-system', title: 'Queue System', href: '/dashboard?app=queue-system', urlCheck: 'queue' },
            { id: 'mortuary', title: 'Mortuary', href: '/dashboard?app=mortuary' },
            { id: 'healthcare', title: 'Healthcare', href: '/dashboard?app=healthcare' },
        ]
    },
    {
        id: 'financial',
        title: 'Financial',
        items: [
            { id: 'lending', title: 'Lending', href: '/dashboard?app=lending' },
            { id: 'payroll', title: 'Payroll', href: '/dashboard?app=payroll' },
            { id: 'billers', title: 'Billers', href: '/dashboard?app=billers' },
            { id: 'bill-payments', title: 'Bill Payments', href: '/dashboard?app=bill-payments' },
        ]
    },
    {
        id: 'communication',
        title: 'Communication',
        items: [
            { id: 'sms', title: 'SMS', href: '/dashboard?app=sms' },
            { id: 'email', title: 'Email', href: '/dashboard?app=email' },
            { id: 'contacts', title: 'Contacts', href: '/dashboard?app=contacts' },
        ]
    },
    {
        id: 'content',
        title: 'Content & Events',
        items: [
            { id: 'genealogy', title: 'Genealogy', href: '/dashboard?app=genealogy' },
            { id: 'events', title: 'Events', href: '/dashboard?app=events' },
            { id: 'challenges', title: 'Challenges', href: '/dashboard?app=challenges' },
            { id: 'content-creator', title: 'Content Creator', href: '/dashboard?app=content-creator' },
            { id: 'products', title: 'Products', href: '/dashboard?app=products' },
            { id: 'pages', title: 'Pages', href: '/dashboard?app=pages' },
            { id: 'courses', title: 'Courses', href: '/dashboard?app=courses' },
        ]
    },
    {
        id: 'travel',
        title: 'Travel',
        items: [
            { id: 'travel', title: 'Travel', href: '/dashboard?app=travel' },
        ]
    }
];

// Helper functions for menu logic
export const shouldShowMenuItem = (
    item: MenuItem, 
    hasModuleAccess: (id: string) => boolean,
    appParam: string | null,
    url: string
) => {
    const checkUrl = item.urlCheck || item.id;
    return hasModuleAccess(item.id) && (appParam === item.id || url.includes(checkUrl));
};

export const getVisibleItems = (
    category: MenuCategory, 
    hasModuleAccess: (id: string) => boolean,
    appParam: string | null,
    url: string
) => {
    return category.items.filter(item => 
        shouldShowMenuItem(item, hasModuleAccess, appParam, url)
    );
};

export const shouldShowCategory = (
    category: MenuCategory, 
    hasModuleAccess: (id: string) => boolean,
    appParam: string | null,
    url: string
) => {
    return getVisibleItems(category, hasModuleAccess, appParam, url).length > 0;
};

// Menu configuration for better maintainability
export interface MenuItem {
    id: string;
    title: string;
    href: string;
    urlCheck?: string; // Custom URL check pattern if different from id
    moduleCheck?: string; // Custom module to check for access (instead of using id)
    appParamCheck?: string | string[]; // Custom appParam values that should show this item (for submenu items)
    parentId?: string; // ID of parent menu item (for submenu items)
    isSubmenu?: boolean; // Explicitly mark as submenu item
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
            {
                id: 'retail',
                title: 'Retail POS',
                href: '/pos-retail?app=retail',
            },
            {
                id: 'retail-inventory',
                title: 'Inventory',
                href: '/inventory?app=retail',
                urlCheck: 'inventory',
                moduleCheck: 'retail',
                appParamCheck: ['retail'],
                parentId: 'retail',
                isSubmenu: true,
            },
            {
                id: 'retail-sales',
                title: 'Sales',
                href: '/retail-sale?app=retail',
                urlCheck: 'retail-sale',
                moduleCheck: 'retail',
                appParamCheck: ['retail'],
                parentId: 'retail',
                isSubmenu: true,
            },
            {
                id: 'retail-discounts',
                title: 'Discounts',
                href: '/inventory/discounts?app=retail',
                urlCheck: 'inventory/discounts',
                moduleCheck: 'retail',
                appParamCheck: ['retail'],
                parentId: 'retail',
                isSubmenu: true,
            },
            {
                id: 'fnb',
                title: 'F&B',
                href: '/pos-restaurant?app=fnb&tab=reservations',
            },
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
                parentId: 'transportation',
                isSubmenu: true,
            },
            {
                id: 'parcel-delivery',
                title: 'Parcel Delivery',
                href: '/parcel-delivery?app=parcel-delivery',
            },
            {
                id: 'parcel-delivery-couriers',
                title: 'Couriers',
                href: '/parcel-delivery/couriers?app=parcel-delivery',
                urlCheck: 'parcel-delivery/couriers',
                moduleCheck: 'parcel-delivery',
                appParamCheck: ['parcel-delivery'],
                parentId: 'parcel-delivery',
                isSubmenu: true,
            },
            {
                id: 'parcel-delivery-track',
                title: 'Track Delivery',
                href: '/parcel-delivery/track?app=parcel-delivery',
                urlCheck: 'parcel-delivery/track',
                moduleCheck: 'parcel-delivery',
                appParamCheck: ['parcel-delivery'],
                parentId: 'parcel-delivery',
                isSubmenu: true,
            },
            {
                id: 'food-delivery',
                title: 'Food Delivery',
                href: '/food-delivery?app=food-delivery',
            },
            {
                id: 'food-delivery-orders',
                title: 'My Orders',
                href: '/food-delivery/orders?app=food-delivery',
                urlCheck: 'food-delivery/orders',
                moduleCheck: 'food-delivery',
                appParamCheck: ['food-delivery'],
                parentId: 'food-delivery',
                isSubmenu: true,
            },
            {
                id: 'food-delivery-track',
                title: 'Track Order',
                href: '/food-delivery/track?app=food-delivery',
                urlCheck: 'food-delivery/track',
                moduleCheck: 'food-delivery',
                appParamCheck: ['food-delivery'],
                parentId: 'food-delivery',
                isSubmenu: true,
            },
            {
                id: 'food-delivery-restaurant-dashboard',
                title: 'Restaurant Dashboard',
                href: '/food-delivery/restaurant/dashboard?app=food-delivery',
                urlCheck: 'food-delivery/restaurant',
                moduleCheck: 'food-delivery',
                appParamCheck: ['food-delivery'],
                parentId: 'food-delivery',
                isSubmenu: true,
            },
            {
                id: 'food-delivery-admin-restaurants',
                title: 'Admin: Restaurants',
                href: '/food-delivery/admin/restaurants?app=food-delivery',
                urlCheck: 'food-delivery/admin',
                moduleCheck: 'food-delivery',
                appParamCheck: ['food-delivery'],
                parentId: 'food-delivery',
                isSubmenu: true,
            },
            {
                id: 'food-delivery-admin-orders',
                title: 'Admin: Orders',
                href: '/food-delivery/admin/orders?app=food-delivery',
                urlCheck: 'food-delivery/admin',
                moduleCheck: 'food-delivery',
                appParamCheck: ['food-delivery'],
                parentId: 'food-delivery',
                isSubmenu: true,
            },
            {
                id: 'food-delivery-admin-drivers',
                title: 'Admin: Drivers',
                href: '/food-delivery/admin/drivers?app=food-delivery',
                urlCheck: 'food-delivery/admin',
                moduleCheck: 'food-delivery',
                appParamCheck: ['food-delivery'],
                parentId: 'food-delivery',
                isSubmenu: true,
            },
            {
                id: 'food-delivery-admin-menu',
                title: 'Admin: Menu',
                href: '/food-delivery/admin/menu?app=food-delivery',
                urlCheck: 'food-delivery/admin',
                moduleCheck: 'food-delivery',
                appParamCheck: ['food-delivery'],
                parentId: 'food-delivery',
                isSubmenu: true,
            },
            {
                id: 'food-delivery-admin-analytics',
                title: 'Admin: Analytics',
                href: '/food-delivery/admin/analytics?app=food-delivery',
                urlCheck: 'food-delivery/admin',
                moduleCheck: 'food-delivery',
                appParamCheck: ['food-delivery'],
                parentId: 'food-delivery',
                isSubmenu: true,
            },
            {
                id: 'food-delivery-driver-dashboard',
                title: 'Driver Dashboard',
                href: '/food-delivery/driver/dashboard?app=food-delivery',
                urlCheck: 'food-delivery/driver',
                moduleCheck: 'food-delivery',
                appParamCheck: ['food-delivery'],
                parentId: 'food-delivery',
                isSubmenu: true,
            },
            {
                id: 'jobs',
                title: 'Jobs',
                href: '/jobs?app=jobs',
            },
            {
                id: 'jobs-applicants',
                title: 'Applicants',
                href: '/jobs/applicants?app=jobs',
                urlCheck: 'jobs/applicants',
                moduleCheck: 'jobs',
                appParamCheck: ['jobs'],
                parentId: 'jobs',
                isSubmenu: true,
            },
            {
                id: 'jobs-applications',
                title: 'Applications',
                href: '/jobs/applications?app=jobs',
                urlCheck: 'jobs/applications',
                moduleCheck: 'jobs',
                appParamCheck: ['jobs'],
                parentId: 'jobs',
                isSubmenu: true,
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
                parentId: 'clinic',
                isSubmenu: true,
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
            {
                id: 'lending',
                title: 'Lending',
                href: '/loan?app=loan',
                urlCheck: 'cbu',
                moduleCheck: 'lending',
                appParamCheck: ['loan', 'lending'],
            },
            {
                id: 'cbu',
                title: 'CBU',
                href: '/loan/cbu?app=loan',
                urlCheck: 'cbu',
                moduleCheck: 'lending',
                appParamCheck: ['loan', 'lending'],
                parentId: 'lending',
                isSubmenu: true,
            },
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
            {
                id: 'chat',
                title: 'Chat',
                href: '/chat?app=chat',
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
            {
                id: 'file-storage',
                title: 'File Storage',
                href: '/file-storage?app=file-storage',
            },
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
    // Use moduleCheck if provided, otherwise use item.id
    const moduleToCheck = item.moduleCheck || item.id;

    // List of standalone modules that have dashes but are not submenus
    const standaloneModules = [
        'content-creator',
        'rental-items',
        'rental-properties',
        'bill-payments',
        'queue-system',
        'health-insurance',
        'file-storage',
        'parcel-delivery',
        'food-delivery',
    ];

    // Handle submenu items (like clinic-settings) that should be visible when parent module is accessible
    // Skip this logic for standalone modules that happen to have dashes in their names
    // Also skip if item has appParamCheck (let that logic handle it)
    if (item.id.includes('-') && !standaloneModules.includes(item.id) && !item.appParamCheck) {
        // Try to find parent module - check if item.id starts with any standalone module
        let parentModule = item.id.split('-')[0];
        // Check if there's a longer parent module name (e.g., "parcel-delivery" for "parcel-delivery-couriers")
        for (const standalone of standaloneModules) {
            if (item.id.startsWith(standalone + '-')) {
                parentModule = standalone;
                break;
            }
        }
        const hasParentAccess = hasModuleAccess(parentModule);
        // Check if we're in the parent module context - either via appParam or URL contains the module
        const isCurrentApp =
            appParam === parentModule ||
            url.includes(`/${parentModule}`) ||
            url.includes(`?app=${parentModule}`);
        return hasParentAccess && isCurrentApp;
    }

    // Check if user has access to the module
    const hasAccess = hasModuleAccess(moduleToCheck);

    if (!hasAccess) {
        return false;
    }

    // Handle items with appParamCheck (like CBU that should show when app=loan or app=lending)
    if (item.appParamCheck) {
        const allowedAppParams = Array.isArray(item.appParamCheck)
            ? item.appParamCheck
            : [item.appParamCheck];
        const matchesAppParam = appParam && allowedAppParams.includes(appParam);
        const matchesUrl = url.includes(checkUrl);
        return matchesAppParam || matchesUrl;
    }

    // Default logic: show if user has access (don't restrict by appParam for main menu items)
    // Only check URL for items that have a specific urlCheck pattern
    if (item.urlCheck && item.urlCheck !== item.id) {
        // If there's a custom urlCheck, show when URL matches
        return url.includes(item.urlCheck);
    }
    
    // For main menu items, show if user has access (regardless of current appParam)
    return true;
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

// Group menu items into main items and submenu items
export interface GroupedMenuItem extends MenuItem {
    submenuItems?: MenuItem[];
}

export const groupMenuItems = (
    items: MenuItem[],
): { mainItems: GroupedMenuItem[]; submenuItems: MenuItem[] } => {
    const mainItems: GroupedMenuItem[] = [];
    const submenuItems: MenuItem[] = [];

    items.forEach((item) => {
        if (item.isSubmenu || item.parentId) {
            submenuItems.push(item);
        } else {
            mainItems.push(item);
        }
    });

    // Group submenu items under their parent items
    mainItems.forEach((mainItem) => {
        const relatedSubmenus = submenuItems.filter(
            (submenu) => submenu.parentId === mainItem.id,
        );
        if (relatedSubmenus.length > 0) {
            mainItem.submenuItems = relatedSubmenus;
        }
    });

    return { mainItems, submenuItems };
};

export const shouldShowCategory = (
    category: MenuCategory,
    hasModuleAccess: (id: string) => boolean,
    appParam: string | null,
    url: string,
) => {
    return getVisibleItems(category, hasModuleAccess, appParam, url).length > 0;
};

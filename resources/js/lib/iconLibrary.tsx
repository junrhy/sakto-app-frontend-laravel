import React from 'react';
import {
    RxAccessibility,
    RxActivityLog,
    RxArchive,
    RxArrowDown,
    RxArrowLeft,
    RxArrowRight,
    RxArrowUp,
    RxBell,
    RxBox,
    RxCalendar,
    RxCamera,
    RxCardStack,
    RxChatBubble,
    RxCheck,
    RxChevronDown,
    RxChevronLeft,
    RxChevronRight,
    RxChevronUp,
    RxClipboard,
    RxCode,
    RxColumns,
    RxCross2,
    RxDashboard,
    RxDownload,
    RxEnvelopeClosed,
    RxExternalLink,
    RxFace,
    RxFile,
    RxGear,
    RxGlobe,
    RxGrid,
    RxGroup,
    RxHeart,
    RxHome,
    RxIdCard,
    RxImage,
    RxLayers,
    RxLayout,
    RxLink1,
    RxLockClosed,
    RxMagnifyingGlass,
    RxMinus,
    RxMobile,
    RxMoon,
    RxPencil1,
    RxPerson,
    RxPlay,
    RxPlus,
    RxReload,
    RxRocket,
    RxRows,
    RxShare1,
    RxStar,
    RxStop,
    RxSun,
    RxTable,
    RxTarget,
    RxTokens,
    RxTrash,
    RxUpdate,
    RxUpload,
    RxVideo,
} from 'react-icons/rx';
import { FaUsers } from 'react-icons/fa';

// Icon Library - Direct mapping of icon names to components
export const ICON_LIBRARY = {
    // Business & Productivity
    RxDashboard: RxDashboard,
    RxHome: RxHome,

    // Technology & Development
    RxRocket: RxRocket,
    RxLayers: RxLayers,
    RxGear: RxGear,
    RxCode: RxCode,

    // People & Communication
    RxPerson: RxPerson,
    RxGroup: RxGroup,
    FaUsers: FaUsers,
    RxChatBubble: RxChatBubble,
    RxEnvelopeClosed: RxEnvelopeClosed,
    RxIdCard: RxIdCard,
    RxShare1: RxShare1,

    // Health & Medical
    RxHeart: RxHeart,

    // Food & Beverage
    RxFace: RxFace,

    // Finance & Money
    RxCardStack: RxCardStack,
    RxClipboard: RxClipboard,

    // Transportation & Travel
    RxGlobe: RxGlobe,

    // Real Estate & Property
    RxTokens: RxTokens,

    // Education & Learning
    RxTarget: RxTarget,
    RxFile: RxFile,

    // Events & Calendar
    RxCalendar: RxCalendar,

    // Content & Media
    RxPencil1: RxPencil1,
    RxImage: RxImage,
    RxVideo: RxVideo,
    RxCamera: RxCamera,

    // Digital & Technology
    RxMobile: RxMobile,

    // Games & Entertainment
    RxStar: RxStar,

    // Security & Safety
    RxLockClosed: RxLockClosed,

    // Analytics & Reports
    RxActivityLog: RxActivityLog,

    // Time & Scheduling
    RxBell: RxBell,

    // UI Controls
    RxPlus: RxPlus,
    RxMinus: RxMinus,
    RxCheck: RxCheck,
    RxCross2: RxCross2,

    // Navigation
    RxArrowUp: RxArrowUp,
    RxArrowDown: RxArrowDown,
    RxArrowLeft: RxArrowLeft,
    RxArrowRight: RxArrowRight,
    RxChevronUp: RxChevronUp,
    RxChevronDown: RxChevronDown,
    RxChevronLeft: RxChevronLeft,
    RxChevronRight: RxChevronRight,

    // Media Controls
    RxPlay: RxPlay,
    RxStop: RxStop,

    // File Operations
    RxDownload: RxDownload,
    RxUpload: RxUpload,
    RxLink1: RxLink1,
    RxExternalLink: RxExternalLink,

    // Data Management
    RxBox: RxBox,
    RxArchive: RxArchive,
    RxTrash: RxTrash,
    RxReload: RxReload,
    RxUpdate: RxUpdate,

    // Layout & Structure
    RxGrid: RxGrid,
    RxTable: RxTable,
    RxColumns: RxColumns,
    RxRows: RxRows,
    RxLayout: RxLayout,

    // Themes
    RxSun: RxSun,
    RxMoon: RxMoon,

    // Utilities
    RxMagnifyingGlass: RxMagnifyingGlass,
    RxAccessibility: RxAccessibility,

    // Default fallback
    default: RxDashboard,
} as const;

// Type for icon names
export type IconName = keyof typeof ICON_LIBRARY;

// Function to get icon component by name
export const getIconByName = (name: string): React.ComponentType<any> => {
    // Check if it's already a direct icon name
    if (ICON_LIBRARY[name as IconName]) {
        return ICON_LIBRARY[name as IconName];
    }

    // For backward compatibility, try to find by semantic name
    const semanticMappings: Record<string, IconName> = {
        // Business & Productivity
        dashboard: 'RxDashboard',
        home: 'RxHome',
        office: 'RxHome',
        building: 'RxHome',
        store: 'RxHome',
        market: 'RxHome',
        warehouse: 'RxHome',
        factory: 'RxHome',

        // Technology & Development
        rocket: 'RxRocket',
        layers: 'RxLayers',
        gear: 'RxGear',
        machine: 'RxGear',
        code: 'RxCode',

        // People & Communication
        person: 'RxPerson',
        people: 'FaUsers',
        group: 'FaUsers',
        users: 'FaUsers',
        team: 'FaUsers',
        chat: 'RxChatBubble',
        email: 'RxEnvelopeClosed',
        contacts: 'RxIdCard',
        share: 'RxShare1',

        // Health & Medical
        heart: 'RxHeart',
        medical: 'RxHeart',
        clinic: 'RxHeart',
        hospital: 'RxHeart',
        health: 'RxHeart',
        medicine: 'RxHeart',
        stethoscope: 'RxHeart',

        // Food & Beverage
        food: 'RxFace',
        restaurant: 'RxFace',
        cafe: 'RxFace',
        kitchen: 'RxFace',
        dining: 'RxFace',

        // Finance & Money
        money: 'RxCardStack',
        payment: 'RxCardStack',
        billing: 'RxClipboard',
        receipt: 'RxClipboard',
        calculator: 'RxGear',

        // Transportation & Travel
        transport: 'RxRocket',
        delivery: 'RxRocket',
        travel: 'RxGlobe',
        car: 'RxRocket',
        truck: 'RxRocket',
        bus: 'RxRocket',
        train: 'RxRocket',
        plane: 'RxRocket',
        ship: 'RxRocket',
        bike: 'RxRocket',
        motorcycle: 'RxRocket',

        // Real Estate & Property
        'real-estate': 'RxHome',
        property: 'RxHome',
        house: 'RxHome',
        apartment: 'RxHome',
        rental: 'RxTokens',
        rent: 'RxTokens',

        // Education & Learning
        education: 'RxTarget',
        learning: 'RxTarget',
        course: 'RxTarget',
        training: 'RxTarget',
        school: 'RxTarget',
        university: 'RxTarget',
        book: 'RxFile',
        library: 'RxFile',

        // Events & Calendar
        events: 'RxCalendar',
        calendar: 'RxCalendar',
        schedule: 'RxCalendar',
        appointment: 'RxCalendar',
        meeting: 'RxCalendar',

        // Content & Media
        content: 'RxPencil1',
        creator: 'RxPencil1',
        blog: 'RxPencil1',
        writing: 'RxPencil1',
        media: 'RxImage',
        image: 'RxImage',
        video: 'RxVideo',
        camera: 'RxCamera',

        // Digital & Technology
        digital: 'RxMobile',
        product: 'RxMobile',
        app: 'RxMobile',
        software: 'RxMobile',
        website: 'RxFile',
        page: 'RxFile',
        web: 'RxGlobe',

        // Games & Entertainment
        game: 'RxStar',
        gaming: 'RxStar',
        entertainment: 'RxStar',
        fun: 'RxStar',
        challenge: 'RxStar',

        // Family & Genealogy
        family: 'RxShare1',
        genealogy: 'RxShare1',
        tree: 'RxShare1',
        heritage: 'RxShare1',

        // Utilities & Services
        utility: 'RxClipboard',
        service: 'RxClipboard',
        tool: 'RxGear',
        equipment: 'RxGear',

        // Security & Safety
        security: 'RxLockClosed',
        safety: 'RxLockClosed',
        lock: 'RxLockClosed',
        key: 'RxLockClosed',
        safe: 'RxLockClosed',

        // Analytics & Reports
        analytics: 'RxActivityLog',
        reports: 'RxActivityLog',
        chart: 'RxActivityLog',
        statistics: 'RxActivityLog',
        data: 'RxActivityLog',
        metrics: 'RxActivityLog',

        // Time & Scheduling
        time: 'RxCalendar',
        timer: 'RxCalendar',
        alarm: 'RxBell',
        reminder: 'RxBell',

        // Shopping & E-commerce
        shopping: 'RxHome',
        cart: 'RxHome',
        ecommerce: 'RxHome',
        retail: 'RxDashboard',

        // Default fallback
        unknown: 'RxDashboard',
        misc: 'RxDashboard',
    };

    const iconName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const mappedIcon = semanticMappings[iconName];

    return mappedIcon ? ICON_LIBRARY[mappedIcon] : ICON_LIBRARY.default;
};

// Function to get icon component with fallback
export const getIconWithFallback = (
    name: string,
    fallback: string = 'default',
): React.ComponentType<any> => {
    return (
        getIconByName(name) || getIconByName(fallback) || ICON_LIBRARY.default
    );
};

// Function to get all available icon names
export const getAllIconNames = (): IconName[] => {
    return Object.keys(ICON_LIBRARY) as IconName[];
};

// Function to get icons by category (for admin interface)
export const getIconsByCategory = () => {
    return {
        'Business & Productivity': ['RxDashboard', 'RxHome'],
        'Technology & Development': [
            'RxRocket',
            'RxLayers',
            'RxGear',
            'RxCode',
        ],
        'People & Communication': [
            'RxPerson',
            'RxGroup',
            'RxChatBubble',
            'RxEnvelopeClosed',
            'RxIdCard',
            'RxShare1',
        ],
        'Health & Medical': ['RxHeart'],
        'Food & Beverage': ['RxFace'],
        'Finance & Money': ['RxCardStack', 'RxClipboard'],
        'Transportation & Travel': ['RxRocket', 'RxGlobe'],
        'Real Estate & Property': ['RxHome', 'RxTokens'],
        'Education & Learning': ['RxTarget', 'RxFile'],
        'Events & Calendar': ['RxCalendar'],
        'Content & Media': ['RxPencil1', 'RxImage', 'RxVideo', 'RxCamera'],
        'Digital & Technology': ['RxMobile', 'RxFile', 'RxGlobe'],
        'Games & Entertainment': ['RxStar'],
        'Family & Genealogy': ['RxShare1'],
        'Utilities & Services': ['RxClipboard', 'RxGear'],
        'Security & Safety': ['RxLockClosed'],
        'Analytics & Reports': ['RxActivityLog'],
        'Time & Scheduling': ['RxCalendar', 'RxBell'],
        'Shopping & E-commerce': ['RxHome', 'RxDashboard'],
        'UI Controls': ['RxPlus', 'RxMinus', 'RxCheck', 'RxCross2'],
        Navigation: [
            'RxArrowUp',
            'RxArrowDown',
            'RxArrowLeft',
            'RxArrowRight',
            'RxChevronUp',
            'RxChevronDown',
            'RxChevronLeft',
            'RxChevronRight',
        ],
        'Media Controls': ['RxPlay', 'RxStop'],
        'File Operations': [
            'RxDownload',
            'RxUpload',
            'RxLink1',
            'RxExternalLink',
        ],
        'Data Management': [
            'RxBox',
            'RxArchive',
            'RxTrash',
            'RxReload',
            'RxUpdate',
        ],
        'Layout & Structure': [
            'RxGrid',
            'RxTable',
            'RxColumns',
            'RxRows',
            'RxLayout',
        ],
        Themes: ['RxSun', 'RxMoon'],
        Utilities: ['RxMagnifyingGlass', 'RxAccessibility'],
    };
};

// Smart icon suggestion based on app title
export const getSmartIconSuggestion = (title: string): IconName => {
    const lowerTitle = title.toLowerCase();

    // Business & Productivity
    if (
        lowerTitle.includes('retail') ||
        lowerTitle.includes('store') ||
        lowerTitle.includes('shop')
    ) {
        return 'RxDashboard';
    }
    if (lowerTitle.includes('office') || lowerTitle.includes('business')) {
        return 'RxHome';
    }
    if (lowerTitle.includes('warehouse') || lowerTitle.includes('inventory')) {
        return 'RxHome';
    }

    // Technology
    if (lowerTitle.includes('transport') || lowerTitle.includes('delivery')) {
        return 'RxRocket';
    }
    if (lowerTitle.includes('tech') || lowerTitle.includes('software')) {
        return 'RxMobile';
    }

    // Health & Medical
    if (
        lowerTitle.includes('clinic') ||
        lowerTitle.includes('medical') ||
        lowerTitle.includes('health')
    ) {
        return 'RxHeart';
    }
    if (lowerTitle.includes('hospital') || lowerTitle.includes('healthcare')) {
        return 'RxHeart';
    }

    // Food & Beverage
    if (
        lowerTitle.includes('food') ||
        lowerTitle.includes('restaurant') ||
        lowerTitle.includes('cafe')
    ) {
        return 'RxFace';
    }
    if (lowerTitle.includes('kitchen') || lowerTitle.includes('dining')) {
        return 'RxFace';
    }

    // Finance
    if (
        lowerTitle.includes('lending') ||
        lowerTitle.includes('loan') ||
        lowerTitle.includes('finance')
    ) {
        return 'RxCardStack';
    }
    if (lowerTitle.includes('payment') || lowerTitle.includes('billing')) {
        return 'RxCardStack';
    }

    // Real Estate
    if (lowerTitle.includes('real estate') || lowerTitle.includes('property')) {
        return 'RxHome';
    }
    if (lowerTitle.includes('rental') || lowerTitle.includes('rent')) {
        return 'RxTokens';
    }

    // Education
    if (
        lowerTitle.includes('course') ||
        lowerTitle.includes('education') ||
        lowerTitle.includes('learning')
    ) {
        return 'RxTarget';
    }
    if (lowerTitle.includes('school') || lowerTitle.includes('training')) {
        return 'RxTarget';
    }

    // Events
    if (lowerTitle.includes('event') || lowerTitle.includes('calendar')) {
        return 'RxCalendar';
    }
    if (lowerTitle.includes('appointment') || lowerTitle.includes('meeting')) {
        return 'RxCalendar';
    }

    // Content
    if (
        lowerTitle.includes('content') ||
        lowerTitle.includes('creator') ||
        lowerTitle.includes('blog')
    ) {
        return 'RxPencil1';
    }
    if (lowerTitle.includes('media') || lowerTitle.includes('video')) {
        return 'RxImage';
    }

    // Digital
    if (lowerTitle.includes('digital') || lowerTitle.includes('product')) {
        return 'RxMobile';
    }
    if (lowerTitle.includes('website') || lowerTitle.includes('page')) {
        return 'RxFile';
    }

    // Games
    if (lowerTitle.includes('game') || lowerTitle.includes('gaming')) {
        return 'RxStar';
    }
    if (lowerTitle.includes('challenge') || lowerTitle.includes('fun')) {
        return 'RxStar';
    }

    // Family
    if (lowerTitle.includes('family') || lowerTitle.includes('genealogy')) {
        return 'RxShare1';
    }

    // Communication
    if (lowerTitle.includes('sms') || lowerTitle.includes('message')) {
        return 'RxChatBubble';
    }
    if (lowerTitle.includes('email') || lowerTitle.includes('mail')) {
        return 'RxEnvelopeClosed';
    }
    if (lowerTitle.includes('contact') || lowerTitle.includes('customer')) {
        return 'RxIdCard';
    }

    // Jobs & Recruitment
    if (
        lowerTitle.includes('job') ||
        lowerTitle.includes('recruitment') ||
        lowerTitle.includes('hr') ||
        lowerTitle.includes('applicant')
    ) {
        return 'FaUsers';
    }

    // Default fallback
    return 'default';
};

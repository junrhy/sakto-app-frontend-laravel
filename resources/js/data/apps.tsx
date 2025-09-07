import React from 'react';
import { 
    RxDashboard,
    RxHome,
    RxRocket,
    RxLayers,
    RxPerson,
    RxGlobe,
    RxChatBubble,
    RxEnvelopeClosed,
    RxIdCard,
    RxHeart,
    RxFace,
    RxShare1,
    RxAccessibility,
    RxTokens,
    RxCalendar,
    RxPencil1,
    RxMobile,
    RxFile,
    RxStar,
    RxCross1,
    RxActivityLog,
    RxPause,
    RxLockClosed,
    RxBookmark,
    RxTarget,
    RxCardStack,
    RxClipboard,
    RxGroup,
} from 'react-icons/rx';

export interface App {
    icon: JSX.Element;
    title: string;
    route: string;
    bgColor: string;
    visible: boolean;
    description: string;
    price: number;
    rating: number;
    categories: string[];
    comingSoon: boolean;
    pricingType: 'free' | 'one-time' | 'subscription';
    includedInPlans?: string[];
}

type AppTitle = 
    | 'Retail'
    | 'F&B'
    | 'Clinic'
    | 'Lending'
    | 'Rental'
    | 'Real Estate'
    | 'Transportation'
    | 'Warehousing'
    | 'Payroll'
    | 'Travel'
    | 'SMS'
    | 'Email'
    | 'Contacts'
    | 'Genealogy'
    | 'Events'
    | 'Challenges'
    | 'Content Creator'
    | 'Digital Products'
    | 'Pages'
    | 'Healthcare'
    | 'Mortuary'
    | 'Bill Payments'
    | 'Billers'
    | 'Courses';

// Map of app titles to their respective icons
const iconMap: Record<AppTitle, JSX.Element> = {
    'Retail': <RxDashboard />,
    'F&B': <RxFace />,
    'Clinic': <RxHeart />,
    'Lending': <RxAccessibility />,
    'Rental': <RxTokens />,
    'Real Estate': <RxHome />,
    'Transportation': <RxRocket />,
    'Warehousing': <RxLayers />,
    'Payroll': <RxPerson />,
    'Travel': <RxGlobe />,
    'SMS': <RxChatBubble />,
    'Email': <RxEnvelopeClosed />,
    'Contacts': <RxIdCard />,
    'Genealogy': <RxShare1 />,
    'Events': <RxCalendar />,
    'Challenges': <RxStar />,
    'Content Creator': <RxPencil1 />,
    'Digital Products': <RxMobile />,
    'Pages': <RxFile />,
    'Healthcare': <RxActivityLog />,
    'Mortuary': <RxCross1 />,
    'Bill Payments': <RxCardStack />,
    'Billers': <RxClipboard />,
    'Courses': <RxTarget />
};

// Map of app titles to their respective background colors
const bgColorMap: Record<AppTitle, string> = {
    'Retail': 'bg-blue-100 dark:bg-blue-900/30',
    'F&B': 'bg-orange-100 dark:bg-orange-900/30',
    'Clinic': 'bg-red-100 dark:bg-red-900/30',
    'Lending': 'bg-green-100 dark:bg-green-900/30',
    'Rental': 'bg-purple-100 dark:bg-purple-900/30',
    'Real Estate': 'bg-indigo-100 dark:bg-indigo-900/30',
    'Transportation': 'bg-yellow-100 dark:bg-yellow-900/30',
    'Warehousing': 'bg-gray-100 dark:bg-gray-900/30',
    'Payroll': 'bg-pink-100 dark:bg-pink-900/30',
    'Travel': 'bg-cyan-100 dark:bg-cyan-900/30',
    'SMS': 'bg-emerald-100 dark:bg-emerald-900/30',
    'Email': 'bg-blue-100 dark:bg-blue-900/30',
    'Contacts': 'bg-teal-100 dark:bg-teal-900/30',
    'Genealogy': 'bg-amber-100 dark:bg-amber-900/30',
    'Events': 'bg-violet-100 dark:bg-violet-900/30',
    'Challenges': 'bg-rose-100 dark:bg-rose-900/30',
    'Content Creator': 'bg-sky-100 dark:bg-sky-900/30',
    'Digital Products': 'bg-lime-100 dark:bg-lime-900/30',
    'Pages': 'bg-slate-100 dark:bg-slate-900/30',
    'Healthcare': 'bg-red-100 dark:bg-red-900/30',
    'Mortuary': 'bg-gray-100 dark:bg-gray-900/30',
    'Bill Payments': 'bg-emerald-100 dark:bg-emerald-900/30',
    'Billers': 'bg-indigo-100 dark:bg-indigo-900/30',
    'Courses': 'bg-purple-100 dark:bg-purple-900/30'
};

// Function to get apps from backend
export const getApps = async (): Promise<App[]> => {
    try {
        const response = await fetch('/api/apps');
        const data = await response.json();
        
        // Add icons and background colors to the apps data from backend
        return data.apps.map((app: Omit<App, 'icon' | 'bgColor'>) => ({
            ...app,
            icon: iconMap[app.title as AppTitle] || <RxDashboard />, // Type-safe access with fallback
            bgColor: bgColorMap[app.title as AppTitle] || 'bg-gray-100 dark:bg-gray-900/30' // Type-safe access with fallback
        }));
    } catch (error) {
        console.error('Failed to fetch apps:', error);
        return [];
    }
}; 
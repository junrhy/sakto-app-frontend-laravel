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
    RxMobile
} from 'react-icons/rx';
import { FaTrophy } from 'react-icons/fa';

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
    | 'Family Tree'
    | 'Events'
    | 'Challenges'
    | 'ContentCreator'
    | 'DigitalProducts';

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
    'Family Tree': <RxShare1 />,
    'Events': <RxCalendar />,
    'Challenges': <FaTrophy />,
    'ContentCreator': <RxPencil1 />,
    'DigitalProducts': <RxMobile />
};

// Function to get apps from backend
export const getApps = async (): Promise<App[]> => {
    try {
        const response = await fetch('/api/apps');
        const data = await response.json();
        
        // Add icons to the apps data from backend
        return data.apps.map((app: Omit<App, 'icon'>) => ({
            ...app,
            icon: iconMap[app.title as AppTitle] || <RxDashboard /> // Type-safe access with fallback
        }));
    } catch (error) {
        console.error('Failed to fetch apps:', error);
        return [];
    }
}; 
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
    RxTokens
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
    includedInPlans?: string[]; // Array of subscription plan slugs that include this app
}

export const apps: App[] = [
    {
        icon: <RxDashboard />,
        title: 'Retail',
        route: '/dashboard?app=retail',
        bgColor: 'text-slate-600',
        visible: false,
        description: 'Complete POS system with inventory tracking, sales analytics, and customer management for retail stores',
        price: 0,
        rating: 4.5,
        categories: ['Business', 'Sales', 'Inventory'],
        comingSoon: true,
        pricingType: 'free',
        includedInPlans: ['pro-plan', 'business-plan']
    },
    {
        icon: <RxFace />,
        title: 'F&B',
        route: '/dashboard?app=fnb',
        bgColor: 'text-slate-600',
        visible: true,
        description: 'Restaurant management system with table ordering, kitchen display, and menu customization features',
        price: 0,
        rating: 4.8,
        categories: ['Food', 'Business', 'Inventory'],
        comingSoon: false,
        pricingType: 'free',
        includedInPlans: ['basic-plan', 'pro-plan', 'business-plan']
    },
    {
        icon: <RxHeart />,
        title: 'Clinic',
        route: '/dashboard?app=clinic',
        bgColor: 'text-slate-600',
        visible: true,
        description: 'Medical practice management with patient records, appointment scheduling, and billing system',
        price: 0,
        rating: 4.7,
        categories: ['Medical', 'Healthcare', 'Appointments'],
        comingSoon: false,
        pricingType: 'free',
        includedInPlans: ['pro-plan', 'business-plan']
    },
    {
        icon: <RxAccessibility />,
        title: 'Lending',
        route: '/dashboard?app=lending',
        bgColor: 'text-slate-600',
        visible: true,
        description: 'Loan management system with payment tracking, interest calculation, and automated billing features',
        price: 0,
        rating: 4.6,
        categories: ['Finance', 'Business', 'Payments'],
        comingSoon: false,
        pricingType: 'free',
        includedInPlans: ['pro-plan', 'business-plan']
    },
    {
        icon: <RxTokens />,
        title: 'Rental',
        route: '/dashboard?app=rental-item',
        bgColor: 'text-slate-600',
        visible: true,
        description: 'Equipment and item rental system with booking calendar, maintenance tracking, and automated returns',
        price: 0,
        rating: 4.5,
        categories: ['Business', 'Inventory', 'Bookings'],
        comingSoon: false,
        pricingType: 'free',
        includedInPlans: ['basic-plan', 'pro-plan', 'business-plan']
    },
    {
        icon: <RxHome />,
        title: 'Real Estate',
        route: '/dashboard?app=real-estate',
        bgColor: 'text-slate-600',
        visible: true,
        description: 'Property management solution with tenant tracking, rent collection, and maintenance request handling',
        price: 0,
        rating: 4.4,
        categories: ['Real Estate', 'Business', 'Bookings'],
        comingSoon: false,
        pricingType: 'free',
        includedInPlans: ['business-plan']
    },
    {
        icon: <RxRocket />,
        title: 'Transportation',
        route: '/dashboard?app=transportation',
        bgColor: 'text-slate-600',
        visible: false,
        description: 'Fleet management system with route optimization, vehicle maintenance tracking, and driver scheduling',
        price: 599,
        rating: 4.5,
        categories: ['Transportation', 'Business', 'Logistics'],
        comingSoon: true,
        pricingType: 'subscription',
        includedInPlans: ['business-plan']
    },
    {
        icon: <RxLayers />,
        title: 'Warehousing',
        route: '/dashboard?app=warehousing',
        bgColor: 'text-slate-600',
        visible: false,
        description: 'Advanced warehouse management with inventory tracking, order fulfillment, and space optimization tools',
        price: 599,
        rating: 4.3,
        categories: ['Logistics', 'Inventory', 'Business'],
        comingSoon: true,
        pricingType: 'one-time',
        includedInPlans: ['business-plan']
    },
    {
        icon: <RxPerson />,
        title: 'Payroll',
        route: '/dashboard?app=payroll',
        bgColor: 'text-slate-600',
        visible: true,
        description: 'Employee payroll system with tax calculation, attendance tracking, and automated salary disbursement',
        price: 0,
        rating: 4.6,
        categories: ['HR', 'Finance', 'Business'],
        comingSoon: false,
        pricingType: 'free',
        includedInPlans: ['basic-plan', 'pro-plan', 'business-plan']
    },
    {
        icon: <RxGlobe />,
        title: 'Travel',
        route: '/dashboard?app=travel',
        bgColor: 'text-slate-600',
        visible: false,
        description: 'Travel agency management with package booking, itinerary planning, and customer relationship tools',
        price: 0,
        rating: 4.2,
        categories: ['Travel', 'Bookings', 'Business'],
        comingSoon: true,
        pricingType: 'free',
        includedInPlans: ['pro-plan', 'business-plan']
    },
    {
        icon: <RxChatBubble />,
        title: 'SMS',
        route: '/dashboard?app=sms',
        bgColor: 'text-slate-600',
        visible: false,
        description: 'Send SMS to your customers and clients. Supports Twilio and Semaphore. Easily integrate with your existing apps.',
        price: 149,
        rating: 4.4,
        categories: ['Communication', 'Marketing', 'Business'],
        comingSoon: true,
        pricingType: 'subscription',
        includedInPlans: ['basic-plan', 'pro-plan', 'business-plan']
    },
    {
        icon: <RxEnvelopeClosed />,
        title: 'Email',
        route: '/dashboard?app=email',
        bgColor: 'text-slate-600',
        visible: false,
        description: 'Send emails to your customers and clients. Supports multiple email providers and templates. Easy to integrate with your existing apps.',
        price: 149,
        rating: 4.3,
        categories: ['Communication', 'Marketing', 'Business'],
        comingSoon: false,
        pricingType: 'subscription',
        includedInPlans: ['pro-plan', 'business-plan']
    },
    {
        icon: <RxIdCard />,
        title: 'Contacts',
        route: '/dashboard?app=contacts',
        bgColor: 'text-slate-600',
        visible: true,
        description: 'Manage your contacts and address book. Keep track of customer information, leads, and business relationships all in one place.',
        price: 0,
        rating: 4.4,
        categories: ['Business', 'Communication', 'CRM'],
        comingSoon: false,
        pricingType: 'free',
        includedInPlans: ['basic-plan', 'pro-plan', 'business-plan']
    },
    {
        icon: <RxShare1 />,
        title: 'Family Tree',
        route: '/dashboard?app=family-tree',
        bgColor: 'text-slate-600',
        visible: false,
        description: 'Create and manage family trees with an interactive viewer, relationship mapping, and genealogy tracking features.',
        price: 149,
        rating: 4.0,
        categories: ['Family', 'Genealogy', 'Personal'],
        comingSoon: false,
        pricingType: 'subscription',
        includedInPlans: ['basic-plan', 'pro-plan', 'business-plan']
    }
]; 
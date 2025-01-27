import React from 'react';
import { 
    FaStore, 
    FaUtensils, 
    FaHospital, 
    FaHandHoldingUsd,
    FaBuilding,
    FaBus,
    FaWarehouse,
    FaQuestionCircle,
    FaPlane,
    FaBoxOpen,
    FaUsers,
    FaComments,
    FaEnvelope
} from 'react-icons/fa';

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
}

export const apps: App[] = [
    {
        icon: <FaStore />,
        title: 'Retail',
        route: '/dashboard?app=retail',
        bgColor: 'text-blue-500',
        visible: true,
        description: 'Complete POS system with inventory tracking, sales analytics, and customer management for retail stores',
        price: 0,
        rating: 4.5,
        categories: ['Business', 'Sales', 'Inventory'],
        comingSoon: false,
        pricingType: 'free'
    },
    {
        icon: <FaUtensils />,
        title: 'F&B',
        route: '/dashboard?app=fnb',
        bgColor: 'text-orange-500',
        visible: true,
        description: 'Restaurant management system with table ordering, kitchen display, and menu customization features',
        price: 0,
        rating: 4.8,
        categories: ['Food', 'Business', 'Inventory'],
        comingSoon: false,
        pricingType: 'free'
    },
    {
        icon: <FaHospital />,
        title: 'Clinic',
        route: '/dashboard?app=clinic',
        bgColor: 'text-green-500',
        visible: true,
        description: 'Medical practice management with patient records, appointment scheduling, and billing system',
        price: 0,
        rating: 4.7,
        categories: ['Medical', 'Healthcare', 'Appointments'],
        comingSoon: false,
        pricingType: 'free'
    },
    {
        icon: <FaHandHoldingUsd />,
        title: 'Lending',
        route: '/dashboard?app=lending',
        bgColor: 'text-purple-500',
        visible: true,
        description: 'Loan management system with payment tracking, interest calculation, and automated billing features',
        price: 0,
        rating: 4.6,
        categories: ['Finance', 'Business', 'Payments'],
        comingSoon: false,
        pricingType: 'free'
    },
    {
        icon: <FaBoxOpen />,
        title: 'Rental',
        route: '/dashboard?app=rental-item',
        bgColor: 'text-indigo-500',
        visible: true,
        description: 'Equipment and item rental system with booking calendar, maintenance tracking, and automated returns',
        price: 0,
        rating: 4.5,
        categories: ['Business', 'Inventory', 'Bookings'],
        comingSoon: false,
        pricingType: 'free'
    },
    {
        icon: <FaBuilding />,
        title: 'Real Estate',
        route: '/dashboard?app=real-estate',
        bgColor: 'text-red-500',
        visible: true,
        description: 'Property management solution with tenant tracking, rent collection, and maintenance request handling',
        price: 0,
        rating: 4.4,
        categories: ['Real Estate', 'Business', 'Bookings'],
        comingSoon: false,
        pricingType: 'free'
    },
    {
        icon: <FaBus />,
        title: 'Transportation',
        route: '/dashboard?app=transportation',
        bgColor: 'text-yellow-500',
        visible: false,
        description: 'Fleet management system with route optimization, vehicle maintenance tracking, and driver scheduling',
        price: 20,
        rating: 4.5,
        categories: ['Transportation', 'Business', 'Logistics'],
        comingSoon: true,
        pricingType: 'subscription'
    },
    {
        icon: <FaWarehouse />,
        title: 'Warehousing',
        route: '/dashboard?app=warehousing',
        bgColor: 'text-teal-500',
        visible: false,
        description: 'Advanced warehouse management with inventory tracking, order fulfillment, and space optimization tools',
        price: 20,
        rating: 4.3,
        categories: ['Logistics', 'Inventory', 'Business'],
        comingSoon: true,
        pricingType: 'one-time'
    },
    {
        icon: <FaUsers />,
        title: 'Payroll',
        route: '/dashboard?app=payroll',
        bgColor: 'text-cyan-500',
        visible: true,
        description: 'Employee payroll system with tax calculation, attendance tracking, and automated salary disbursement',
        price: 0,
        rating: 4.6,
        categories: ['HR', 'Finance', 'Business'],
        comingSoon: false,
        pricingType: 'free'
    },
    {
        icon: <FaPlane />,
        title: 'Travel',
        route: '/dashboard?app=travel',
        bgColor: 'text-pink-500',
        visible: true,
        description: 'Travel agency management with package booking, itinerary planning, and customer relationship tools',
        price: 0,
        rating: 4.2,
        categories: ['Travel', 'Bookings', 'Business'],
        comingSoon: false,
        pricingType: 'free'
    },
    {
        icon: <FaComments />,
        title: 'SMS',
        route: '/dashboard?app=sms',
        bgColor: 'text-violet-500',
        visible: true,
        description: 'Send SMS to your customers and clients. Supports Twilio and Semaphore. Easily integrate with your existing apps.',
        price: 0,
        rating: 4.4,
        categories: ['Communication', 'Marketing', 'Business'],
        comingSoon: false,
        pricingType: 'free'
    },
    {
        icon: <FaEnvelope />,
        title: 'Email',
        route: '/dashboard?app=email',
        bgColor: 'text-emerald-500',
        visible: true,
        description: 'Send emails to your customers and clients. Supports multiple email providers and templates. Easy to integrate with your existing apps.',
        price: 0,
        rating: 4.3,
        categories: ['Communication', 'Marketing', 'Business'],
        comingSoon: false,
        pricingType: 'free'
    }
]; 
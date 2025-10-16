import { Card, CardContent } from '@/Components/ui/card';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Briefcase,
    GraduationCap,
    HardHat,
    Landmark,
    Package,
    Plane,
    ShoppingBag,
    Sprout,
    Stethoscope,
    Truck,
    Users,
    UtensilsCrossed,
} from 'lucide-react';
import React from 'react';

interface Solution {
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    color: string;
    bgColor: string;
    comingSoon: boolean;
}

export default function MobileSolutions() {
    const solutions: Solution[] = [
        {
            name: 'Community',
            description:
                'Enterprise community management platform for organizations to connect teams, manage events, and streamline communications',
            icon: Users,
            href: '/community',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            comingSoon: false,
        },
        {
            name: 'Medical',
            description:
                'B2B healthcare management system for medical facilities to streamline appointments, patient records, and clinic operations',
            icon: Stethoscope,
            href: '/medical',
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            comingSoon: false,
        },
        {
            name: 'Logistics',
            description:
                'Business logistics platform for companies to manage shipments, optimize delivery routes, and track fleet operations',
            icon: Truck,
            href: '/logistics',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20',
            comingSoon: false,
        },
        {
            name: 'Shop',
            description:
                'B2B e-commerce platform for businesses to manage wholesale operations, inventory, and corporate purchasing',
            icon: ShoppingBag,
            href: '/shop',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            comingSoon: true,
        },
        {
            name: 'Delivery',
            description:
                'Enterprise delivery management solution for businesses to coordinate food service, catering, and supply chain operations',
            icon: Package,
            href: '/delivery',
            color: 'text-red-600',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
            comingSoon: true,
        },
        {
            name: 'Jobs',
            description:
                'Corporate recruitment platform for businesses to manage hiring, employee onboarding, and workforce planning',
            icon: Briefcase,
            href: '/jobs',
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
            comingSoon: true,
        },
        {
            name: 'Travel',
            description: 'Business travel management system for corporate bookings, expense tracking, and employee travel coordination',
            icon: Plane,
            href: '/travel',
            color: 'text-cyan-600',
            bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
            comingSoon: true,
        },
        {
            name: 'F&B',
            description: 'Restaurant and hospitality management platform for food service businesses to handle operations, inventory, and orders',
            icon: UtensilsCrossed,
            href: '/fnb',
            color: 'text-amber-600',
            bgColor: 'bg-amber-50 dark:bg-amber-900/20',
            comingSoon: true,
        },
        {
            name: 'Education',
            description:
                'Educational institution management system for schools and training centers to manage courses, students, and administration',
            icon: GraduationCap,
            href: '/education',
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
            comingSoon: true,
        },
        {
            name: 'Finance',
            description:
                'Business financial management platform for enterprises to handle accounting, budgeting, and financial reporting',
            icon: Landmark,
            href: '/finance',
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
            comingSoon: true,
        },
        {
            name: 'Agriculture',
            description:
                'Agribusiness management system for farms and agricultural enterprises to optimize operations, yields, and supply chains',
            icon: Sprout,
            href: '/agriculture',
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            comingSoon: true,
        },
        {
            name: 'Construction',
            description:
                'Construction project management platform for contractors and builders to manage projects, teams, and resources',
            icon: HardHat,
            href: '/construction',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20',
            comingSoon: true,
        },
    ];

    return (
        <>
            <Head title="Neulify" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                {/* Header */}
                <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="mx-auto max-w-4xl">
                        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                            Neulify
                        </h1>
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                            Choose a solution to get started
                        </p>
                    </div>
                </div>

                {/* Solutions Grid */}
                <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {solutions.map((solution) => {
                            const Icon = solution.icon;
                            const isDisabled = solution.comingSoon;

                            const cardContent = (
                                <Card
                                    className={`h-full border-2 transition-all duration-300 ${
                                        isDisabled
                                            ? 'cursor-not-allowed opacity-60'
                                            : 'hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg dark:hover:border-gray-600'
                                    }`}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-start space-x-4">
                                            {/* Icon */}
                                            <div
                                                className={`flex-shrink-0 rounded-xl p-3 ${solution.bgColor} transition-transform duration-300 ${
                                                    !isDisabled &&
                                                    'group-hover:scale-110'
                                                }`}
                                            >
                                                <Icon
                                                    className={`h-6 w-6 sm:h-8 sm:w-8 ${solution.color}`}
                                                />
                                            </div>

                                            {/* Content */}
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-2 flex items-center justify-between gap-2">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                                                        {solution.name}
                                                    </h3>
                                                    {isDisabled ? (
                                                        <span className="flex-shrink-0 rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                            Coming Soon
                                                        </span>
                                                    ) : (
                                                        <ArrowRight className="h-5 w-5 flex-shrink-0 text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                                                    )}
                                                </div>
                                                <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                                                    {solution.description}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );

                            return isDisabled ? (
                                <div key={solution.name}>{cardContent}</div>
                            ) : (
                                <Link
                                    key={solution.name}
                                    href={solution.href}
                                    className="group"
                                >
                                    {cardContent}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="mx-auto max-w-4xl px-4 py-6 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        © {new Date().getFullYear()} Neulify. All rights
                        reserved.
                    </p>
                </div>
            </div>
        </>
    );
}

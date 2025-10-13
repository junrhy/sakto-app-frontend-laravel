import { Card, CardContent } from '@/Components/ui/card';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Briefcase,
    Package,
    Plane,
    ShoppingBag,
    Stethoscope,
    Truck,
    Users,
} from 'lucide-react';
import React from 'react';

interface Solution {
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    color: string;
    bgColor: string;
}

export default function MobileSolutions() {
    const solutions: Solution[] = [
        {
            name: 'Community',
            description:
                'Connect with your community, manage events, and stay informed',
            icon: Users,
            href: '/community',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        },
        {
            name: 'Medical',
            description:
                'Book appointments, manage health records, and access healthcare',
            icon: Stethoscope,
            href: '/medical',
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
        },
        {
            name: 'Logistics',
            description:
                'Track shipments, manage deliveries, and optimize transportation',
            icon: Truck,
            href: '/logistics',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        },
        {
            name: 'Shop',
            description:
                'Browse products, place orders, and manage your shopping',
            icon: ShoppingBag,
            href: '/shop',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        },
        {
            name: 'Delivery',
            description:
                'Order food and groceries with fast delivery to your door',
            icon: Package,
            href: '/delivery',
            color: 'text-red-600',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
        },
        {
            name: 'Jobs',
            description:
                'Find opportunities, post listings, and grow your career',
            icon: Briefcase,
            href: '/jobs',
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
        },
        {
            name: 'Travel',
            description: 'Book flights, hotels, and plan your perfect trip',
            icon: Plane,
            href: '/travel',
            color: 'text-cyan-600',
            bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
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
                            return (
                                <Link
                                    key={solution.name}
                                    href={solution.href}
                                    className="group"
                                >
                                    <Card className="h-full border-2 transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg dark:hover:border-gray-600">
                                        <CardContent className="p-6">
                                            <div className="flex items-start space-x-4">
                                                {/* Icon */}
                                                <div
                                                    className={`flex-shrink-0 rounded-xl p-3 ${solution.bgColor} transition-transform duration-300 group-hover:scale-110`}
                                                >
                                                    <Icon
                                                        className={`h-6 w-6 sm:h-8 sm:w-8 ${solution.color}`}
                                                    />
                                                </div>

                                                {/* Content */}
                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                                                            {solution.name}
                                                        </h3>
                                                        <ArrowRight className="h-5 w-5 flex-shrink-0 text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                                                    </div>
                                                    <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                                                        {solution.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
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

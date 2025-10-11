import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    Users, 
    Stethoscope, 
    Truck, 
    ShoppingBag, 
    Package, 
    Briefcase, 
    Plane,
    ArrowRight 
} from 'lucide-react';
import { Card, CardContent } from '@/Components/ui/card';

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
            description: 'Connect with your community, manage events, and stay informed',
            icon: Users,
            href: '/community',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        },
        {
            name: 'Medical',
            description: 'Book appointments, manage health records, and access healthcare',
            icon: Stethoscope,
            href: '/medical',
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
        },
        {
            name: 'Logistics',
            description: 'Track shipments, manage deliveries, and optimize transportation',
            icon: Truck,
            href: '/logistics',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        },
        {
            name: 'Shop',
            description: 'Browse products, place orders, and manage your shopping',
            icon: ShoppingBag,
            href: '/shop',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        },
        {
            name: 'Delivery',
            description: 'Order food and groceries with fast delivery to your door',
            icon: Package,
            href: '/delivery',
            color: 'text-red-600',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
        },
        {
            name: 'Jobs',
            description: 'Find opportunities, post listings, and grow your career',
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
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-6 sticky top-0 z-10 shadow-sm">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-2">
                            Neulify
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center">
                            Choose a solution to get started
                        </p>
                    </div>
                </div>

                {/* Solutions Grid */}
                <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {solutions.map((solution) => {
                            const Icon = solution.icon;
                            return (
                                <Link
                                    key={solution.name}
                                    href={solution.href}
                                    className="group"
                                >
                                    <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 hover:border-gray-300 dark:hover:border-gray-600">
                                        <CardContent className="p-6">
                                            <div className="flex items-start space-x-4">
                                                {/* Icon */}
                                                <div className={`flex-shrink-0 p-3 rounded-xl ${solution.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                                                    <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${solution.color}`} />
                                                </div>
                                                
                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                                                            {solution.name}
                                                        </h3>
                                                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
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
                <div className="max-w-4xl mx-auto px-4 py-6 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        © {new Date().getFullYear()} Neulify. All rights reserved.
                    </p>
                </div>
            </div>
        </>
    );
}


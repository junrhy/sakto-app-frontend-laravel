import React from 'react';
import { Link } from '@inertiajs/react';
import BottomNav from '@/Components/BottomNav';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { 
    TagIcon,
    ShoppingBagIcon,
    DevicePhoneMobileIcon,
    BookOpenIcon,
    CakeIcon,
    ComputerDesktopIcon,
    TruckIcon,
    HomeIcon,
    SparklesIcon,
    WrenchIcon 
} from '@heroicons/react/24/outline';

interface Props {
    auth: {
        user: {
            name: string;
        };
    };
}

const categories = [
    { name: 'Clothing', icon: TagIcon },
    { name: 'Shoes', icon: ShoppingBagIcon },
    { name: 'Consumer Electronics', icon: DevicePhoneMobileIcon },
    { name: 'Books, Movies, Music & Games', icon: BookOpenIcon },
    { name: 'Food and Beverage', icon: CakeIcon },
    { name: 'Electronics & Gadgets', icon: ComputerDesktopIcon },
    { name: 'Apparel and Accessories', icon: ShoppingBagIcon },
    { name: 'Furniture and Decor', icon: HomeIcon },
    { name: 'Health & Beauty', icon: SparklesIcon },
    { name: 'Auto and Parts', icon: WrenchIcon },
];

export default function Shop({ auth }: Props) {
    return (
        <div className="relative min-h-screen pb-16">
            <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <ApplicationLogo className="h-10 w-auto fill-current text-white" />
                            <span className="ml-2 text-xl font-bold text-white">Sakto</span>
                        </div>
                        <Link 
                            href="/help"
                            className="text-white hover:text-blue-100 transition-colors duration-200"
                        >
                            <span className="text-md font-semibold">Help</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 pt-[100px] md:pt-[80px]">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold mb-6">Categories</h1>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {categories.map((category) => (
                            <Link
                                key={category.name}
                                href={`/shop/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                            >
                                <category.icon className="w-8 h-8 text-gray-600 mb-2" />
                                <span className="text-sm text-center font-medium text-gray-800">
                                    {category.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            
            <BottomNav />
        </div>
    );
} 
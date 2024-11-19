import React, { useState } from 'react';
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
    WrenchIcon,
    ChevronUpIcon,
    ChevronDownIcon 
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
    const [showCategories, setShowCategories] = useState(false);

    return (
        <div className="relative min-h-screen pb-16">
            <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 z-10">
                <div className="px-4 py-4">
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

            <div className="px-4 pt-[100px] md:pt-[80px]">
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <button 
                            onClick={() => setShowCategories(!showCategories)}
                            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                        >
                            {showCategories ? (
                                <>
                                    Categories
                                    <ChevronUpIcon className="w-5 h-5" />
                                </>
                            ) : (
                                <>
                                    Categories
                                    <ChevronDownIcon className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 transition-all duration-300 ${
                        showCategories ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0 overflow-hidden'
                    }`}>
                        {categories.map((category) => (
                            <Link
                                key={category.name}
                                href={`/shop/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                                className="flex flex-col items-center p-4 bg-white rounded-lg transition-all duration-200 hover:scale-105"
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
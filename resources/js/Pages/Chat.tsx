import React from 'react';
import { Link } from '@inertiajs/react';
import BottomNav from '@/Components/BottomNav';
import ApplicationLogo from '@/Components/ApplicationLogo';

interface Props {
    auth: {
        user: {
            name: string;
        };
    };
}

export default function Chat({ auth }: Props) {
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

            <div className="container mx-auto px-4 pt-[100px] landscape:pt-[80px] md:pt-[100px]">
                {/* Add your chat content here */}
                <div className="max-w-4xl mx-auto">
                    <h1>Chat Content Goes Here</h1>
                </div>
            </div>
            
            <BottomNav />
        </div>
    );
} 
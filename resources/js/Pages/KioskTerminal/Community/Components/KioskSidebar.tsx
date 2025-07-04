import React from 'react';
import { Calendar, Users, DollarSign, UserCheck, FileText, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KioskSidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const menuItems = [
    {
        id: 'events',
        label: 'Event Check-in',
        icon: Calendar,
        description: 'Manage event check-ins'
    },
    {
        id: 'health_insurance',
        label: 'Healthcare',
        icon: UserCheck,
        description: 'Healthcare contributions'
    },
    {
        id: 'mortuary',
        label: 'Mortuary',
        icon: FileText,
        description: 'Mortuary contributions'
    }
];

export default function KioskSidebar({ activeTab, onTabChange }: KioskSidebarProps) {
    return (
        <div className="w-80 bg-white border-r-2 border-gray-200 h-screen flex flex-col">
            {/* Navigation Menu */}
            <nav className="flex-1 p-4 space-y-2 pt-6">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={cn(
                                "w-full flex items-center gap-4 p-4 rounded-lg text-left transition-all duration-200 group",
                                isActive 
                                    ? "bg-blue-50 border-2 border-blue-300 text-blue-900 shadow-sm" 
                                    : "hover:bg-gray-50 hover:border-2 hover:border-gray-200 text-gray-700"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                                isActive 
                                    ? "bg-blue-600 text-white" 
                                    : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                            )}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-lg">{item.label}</div>
                                <div className={cn(
                                    "text-sm transition-colors",
                                    isActive ? "text-blue-700" : "text-gray-500"
                                )}>
                                    {item.description}
                                </div>
                            </div>
                            {isActive && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
} 
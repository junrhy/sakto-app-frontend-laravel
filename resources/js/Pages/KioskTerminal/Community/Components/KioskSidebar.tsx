import React from 'react';
import { Calendar, Users, DollarSign, UserCheck, FileText, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/Components/ui/badge';
import { format } from 'date-fns';

interface KioskSidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    auth: {
        user: any;
        selectedTeamMember?: {
            identifier: string;
            first_name: string;
            last_name: string;
            full_name: string;
            email: string;
            roles: string[];
            allowed_apps: string[];
            profile_picture?: string;
        };
    };
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

export default function KioskSidebar({ activeTab, onTabChange, auth }: KioskSidebarProps) {
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

            {/* Footer with team member info */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="space-y-3">
                    {/* Team member info */}
                    <div className="flex items-center space-x-2">
                        {auth.selectedTeamMember?.profile_picture ? (
                            <img 
                                src={auth.selectedTeamMember.profile_picture} 
                                alt="Profile" 
                                className="w-6 h-6 rounded-full border border-gray-300"
                            />
                        ) : (
                            <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                                <UserCheck className="h-3 w-3 text-white" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                                {auth.selectedTeamMember ? auth.selectedTeamMember.full_name : auth.user.name}
                            </div>
                            {auth.selectedTeamMember && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {auth.selectedTeamMember.roles.map((role, index) => (
                                        <Badge 
                                            key={index} 
                                            variant="secondary" 
                                            className="text-xs px-1.5 py-0.5 bg-gray-200 text-gray-700 border-gray-300"
                                        >
                                            {role}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 
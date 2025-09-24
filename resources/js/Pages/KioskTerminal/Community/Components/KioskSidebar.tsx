import { Badge } from '@/Components/ui/badge';
import { cn } from '@/lib/utils';
import { Calendar, FileText, UserCheck } from 'lucide-react';

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
        description: 'Manage event check-ins',
    },
    {
        id: 'health_insurance',
        label: 'Healthcare',
        icon: UserCheck,
        description: 'Healthcare contributions',
    },
    {
        id: 'mortuary',
        label: 'Mortuary',
        icon: FileText,
        description: 'Mortuary contributions',
    },
];

export default function KioskSidebar({
    activeTab,
    onTabChange,
    auth,
}: KioskSidebarProps) {
    return (
        <div className="flex h-screen w-80 flex-col border-r-2 border-gray-200 bg-white">
            {/* Navigation Menu */}
            <nav className="flex-1 space-y-2 p-4 pt-6">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={cn(
                                'group flex w-full items-center gap-4 rounded-lg p-4 text-left transition-all duration-200',
                                isActive
                                    ? 'border-2 border-blue-300 bg-blue-50 text-blue-900 shadow-sm'
                                    : 'text-gray-700 hover:border-2 hover:border-gray-200 hover:bg-gray-50',
                            )}
                        >
                            <div
                                className={cn(
                                    'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                                    isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200',
                                )}
                            >
                                <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <div className="text-lg font-semibold">
                                    {item.label}
                                </div>
                                <div
                                    className={cn(
                                        'text-sm transition-colors',
                                        isActive
                                            ? 'text-blue-700'
                                            : 'text-gray-500',
                                    )}
                                >
                                    {item.description}
                                </div>
                            </div>
                            {isActive && (
                                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Footer with team member info */}
            <div className="border-t border-gray-200 bg-gray-50 p-4">
                <div className="space-y-3">
                    {/* Team member info */}
                    <div className="flex items-center space-x-2">
                        {auth.selectedTeamMember?.profile_picture ? (
                            <img
                                src={auth.selectedTeamMember.profile_picture}
                                alt="Profile"
                                className="h-6 w-6 rounded-full border border-gray-300"
                            />
                        ) : (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-400">
                                <UserCheck className="h-3 w-3 text-white" />
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-gray-900">
                                {auth.selectedTeamMember
                                    ? auth.selectedTeamMember.full_name
                                    : auth.user.name}
                            </div>
                            {auth.selectedTeamMember && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                    {auth.selectedTeamMember.roles.map(
                                        (role, index) => (
                                            <Badge
                                                key={index}
                                                variant="secondary"
                                                className="border-gray-300 bg-gray-200 px-1.5 py-0.5 text-xs text-gray-700"
                                            >
                                                {role}
                                            </Badge>
                                        ),
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

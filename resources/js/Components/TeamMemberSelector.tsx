import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Button } from '@/Components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import { Badge } from '@/Components/ui/badge';
import { Users, Shield, LogOut } from 'lucide-react';

interface TeamMember {
    identifier: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    roles: string[];
    allowed_apps: string[];
    profile_picture?: string;
}

interface Props {
    teamMembers?: TeamMember[];
    selectedTeamMember?: TeamMember | null;
}

export default function TeamMemberSelector({ teamMembers = [], selectedTeamMember }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const handleSwitchMember = (memberId: string) => {
        router.post(route('team-member.switch'), {
            team_member_id: memberId
        });
        setIsOpen(false);
    };

    const handleClearSelection = () => {
        router.post(route('team-member.clear'));
        setIsOpen(false);
    };

    if (!selectedTeamMember) {
        return null;
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 px-3 py-2 h-auto">
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={selectedTeamMember.profile_picture} />
                        <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs">
                            {getInitials(selectedTeamMember.first_name, selectedTeamMember.last_name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-24">
                            {selectedTeamMember.first_name}
                        </span>
                        {selectedTeamMember.roles.includes('admin') && (
                            <Badge variant="secondary" className="text-xs px-1 py-0 h-4 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                <Shield className="w-2 h-2 mr-1" />
                                Admin
                            </Badge>
                        )}
                    </div>
                </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Team Members</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {teamMembers.map((member) => (
                    <DropdownMenuItem
                        key={member.identifier}
                        onClick={() => handleSwitchMember(member.identifier)}
                        className={`flex items-center space-x-3 p-3 ${
                            selectedTeamMember.identifier === member.identifier
                                ? 'bg-blue-50 dark:bg-blue-900/20'
                                : ''
                        }`}
                    >
                        <Avatar className="w-8 h-8">
                            <AvatarImage src={member.profile_picture} />
                            <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs">
                                {getInitials(member.first_name, member.last_name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {member.full_name}
                                </span>
                                {member.roles.includes('admin') && (
                                    <Badge variant="secondary" className="text-xs px-1 py-0 h-4 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                        <Shield className="w-2 h-2 mr-1" />
                                        Admin
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {member.email}
                            </p>
                        </div>
                        {selectedTeamMember.identifier === member.identifier && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                    </DropdownMenuItem>
                ))}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleClearSelection} className="text-red-600 dark:text-red-400">
                    <LogOut className="w-4 h-4 mr-2" />
                    Switch Account
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
} 
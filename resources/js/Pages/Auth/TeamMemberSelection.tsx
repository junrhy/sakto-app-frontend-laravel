import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Badge } from '@/Components/ui/badge';
import { User, Users, Shield } from 'lucide-react';

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
    teamMembers: TeamMember[];
    auth: {
        project: {
            identifier: string;
        };
    };
}

export default function TeamMemberSelection({ teamMembers, auth }: Props) {
    const [selectedMember, setSelectedMember] = useState<string | null>(null);

    const handleSelectMember = (memberId: string) => {
        setSelectedMember(memberId);
    };

    const handleContinue = () => {
        if (selectedMember) {
            router.visit(route('team-member.authenticate'), {
                method: 'get',
                data: { team_member_id: selectedMember }
            });
        }
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    return (
        <>
            <Head title="Select Profile" />
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl">
                    <Card className="shadow-xl border-0">
                        <CardHeader className="text-center pb-6">
                            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                                <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                                Select Profile
                            </CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-400">
                                Choose which profile you want to use
                            </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                {teamMembers.map((member) => (
                                    <div
                                        key={member.identifier}
                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                            selectedMember === member.identifier
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                        onClick={() => handleSelectMember(member.identifier)}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <Avatar className="w-12 h-12">
                                                <AvatarImage src={member.profile_picture} />
                                                <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                                                    {getInitials(member.first_name, member.last_name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                                        {member.first_name}
                                                    </h3>
                                                    {member.roles.includes('admin') && (
                                                        <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                            <Shield className="w-3 h-3 mr-1" />
                                                            Admin
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {member.roles.slice(0, 3).map((role) => (
                                                        <Badge key={role} variant="outline" className="text-xs">
                                                            {role}
                                                        </Badge>
                                                    ))}
                                                    {member.roles.length > 3 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{member.roles.length - 3} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="flex justify-between items-center pt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => router.visit(route('logout', { project: auth.project.identifier }), { method: 'post' })}
                                    className="flex items-center space-x-2"
                                >
                                    <User className="w-4 h-4" />
                                    <span>Logout</span>
                                </Button>
                                
                                <Button
                                    onClick={handleContinue}
                                    disabled={!selectedMember}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                                >
                                    Continue
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
} 
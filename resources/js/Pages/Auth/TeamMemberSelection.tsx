import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Head, router } from '@inertiajs/react';
import { Shield, User, Users } from 'lucide-react';
import { useState } from 'react';

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
                data: { team_member_id: selectedMember },
            });
        }
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    return (
        <>
            <Head title="Select Profile" />

            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
                <div className="w-full max-w-2xl">
                    <Card className="border-0 shadow-xl">
                        <CardHeader className="pb-6 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
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
                                        className={`cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                                            selectedMember === member.identifier
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                                        }`}
                                        onClick={() =>
                                            handleSelectMember(
                                                member.identifier,
                                            )
                                        }
                                    >
                                        <div className="flex items-center space-x-4">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage
                                                    src={member.profile_picture}
                                                />
                                                <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                                                    {getInitials(
                                                        member.first_name,
                                                        member.last_name,
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="truncate text-lg font-semibold text-gray-900 dark:text-white">
                                                        {member.first_name}
                                                    </h3>
                                                    {member.roles.includes(
                                                        'admin',
                                                    ) && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                        >
                                                            <Shield className="mr-1 h-3 w-3" />
                                                            Admin
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {member.roles
                                                        .slice(0, 3)
                                                        .map((role) => (
                                                            <Badge
                                                                key={role}
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                {role}
                                                            </Badge>
                                                        ))}
                                                    {member.roles.length >
                                                        3 && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            +
                                                            {member.roles
                                                                .length -
                                                                3}{' '}
                                                            more
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-6">
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        router.visit(
                                            route('logout', {
                                                project:
                                                    auth.project.identifier,
                                            }),
                                            { method: 'post' },
                                        )
                                    }
                                    className="flex items-center space-x-2"
                                >
                                    <User className="h-4 w-4" />
                                    <span>Logout</span>
                                </Button>

                                <Button
                                    onClick={handleContinue}
                                    disabled={!selectedMember}
                                    className="bg-blue-600 px-6 text-white hover:bg-blue-700"
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

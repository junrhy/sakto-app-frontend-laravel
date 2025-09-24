import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeOff, Lock, Shield } from 'lucide-react';
import { useState } from 'react';

interface TeamMember {
    identifier: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    profile_picture?: string;
}

interface Props {
    teamMember: TeamMember;
}

export default function TeamMemberAuthentication({ teamMember }: Props) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        team_member_id: teamMember.identifier,
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('team-member.authenticate.post'));
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    return (
        <>
            <Head title="Team Member Authentication" />

            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
                <div className="w-full max-w-md">
                    <Card className="border-0 shadow-xl">
                        <CardHeader className="pb-6 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                <Lock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                                Enter Password
                            </CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-400">
                                Please enter the password for this team member
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Team Member Info */}
                            <div className="text-center">
                                <Avatar className="mx-auto mb-3 h-16 w-16">
                                    <AvatarImage
                                        src={teamMember.profile_picture}
                                    />
                                    <AvatarFallback className="bg-blue-100 text-lg text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                                        {getInitials(
                                            teamMember.first_name,
                                            teamMember.last_name,
                                        )}
                                    </AvatarFallback>
                                </Avatar>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {teamMember.full_name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {teamMember.email}
                                </p>
                            </div>

                            {/* Password Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="password"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    'password',
                                                    e.target.value,
                                                )
                                            }
                                            className={`pr-10 ${
                                                errors.password
                                                    ? 'border-red-500 focus:border-red-500'
                                                    : ''
                                            }`}
                                            placeholder="Enter your password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            router.visit(
                                                route('team-member.select'),
                                            )
                                        }
                                        className="flex flex-1 items-center justify-center space-x-2"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        <span>Back</span>
                                    </Button>

                                    <Button
                                        type="submit"
                                        disabled={processing || !data.password}
                                        className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                        {processing
                                            ? 'Authenticating...'
                                            : 'Continue'}
                                    </Button>
                                </div>
                            </form>

                            {/* Security Note */}
                            <div className="pt-4 text-center">
                                <div className="inline-flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                                    <Shield className="h-3 w-3" />
                                    <span>
                                        Your password is encrypted and secure
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

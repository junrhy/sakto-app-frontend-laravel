import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Badge } from '@/Components/ui/badge';
import { ArrowLeft, Lock, Eye, EyeOff, Shield } from 'lucide-react';

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
        post(route('team-member.authenticate'));
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    return (
        <>
            <Head title="Team Member Authentication" />
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <Card className="shadow-xl border-0">
                        <CardHeader className="text-center pb-6">
                            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                                <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
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
                                <Avatar className="w-16 h-16 mx-auto mb-3">
                                    <AvatarImage src={teamMember.profile_picture} />
                                    <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-lg">
                                        {getInitials(teamMember.first_name, teamMember.last_name)}
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
                                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className={`pr-10 ${
                                                errors.password ? 'border-red-500 focus:border-red-500' : ''
                                            }`}
                                            placeholder="Enter your password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
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
                                        onClick={() => router.visit(route('team-member.select'))}
                                        className="flex-1 flex items-center justify-center space-x-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        <span>Back</span>
                                    </Button>
                                    
                                    <Button
                                        type="submit"
                                        disabled={processing || !data.password}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        {processing ? 'Authenticating...' : 'Continue'}
                                    </Button>
                                </div>
                            </form>

                            {/* Security Note */}
                            <div className="text-center pt-4">
                                <div className="inline-flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                                    <Shield className="w-3 h-3" />
                                    <span>Your password is encrypted and secure</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
} 
import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import TeamsLayout from '@/Layouts/TeamsLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { ArrowLeft, Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface TeamMember {
    identifier: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
}

interface Props {
    teamMember: TeamMember;
    errors?: {
        current_password?: string;
        password?: string;
        password_confirmation?: string;
        error?: string;
    };
}

export default function UpdatePassword({ teamMember, errors }: Props) {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        post(route('team-member.password.update'), {
            onSuccess: () => {
                toast.success('Password updated successfully!');
                reset();
            },
            onError: () => {
                toast.error('Failed to update password. Please check your input.');
            },
        });
    };

    return (
        <TeamsLayout>
            <Head title="Update Team Member Password" />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-md mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Update Password</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Update your team member password
                            </p>
                        </div>

                        {/* Team Member Info */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="w-5 h-5" />
                                    Team Member Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Name:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {teamMember.full_name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Email:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {teamMember.email}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Password Update Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="w-5 h-5" />
                                    Update Password
                                </CardTitle>
                                <CardDescription>
                                    Enter your current password and choose a new password for your team member account.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {errors?.error && (
                                    <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                                        <AlertDescription className="text-red-800 dark:text-red-200">
                                            {errors.error}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <form onSubmit={submit} className="space-y-6">
                                    {/* Current Password */}
                                    <div className="space-y-2">
                                        <Label htmlFor="current_password">Current Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="current_password"
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                value={data.current_password}
                                                onChange={(e) => setData('current_password', e.target.value)}
                                                className={`pr-10 ${errors?.current_password ? 'border-red-500' : ''}`}
                                                placeholder="Enter your current password"
                                                required
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                        {errors?.current_password && (
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.current_password}
                                            </p>
                                        )}
                                    </div>

                                    {/* New Password */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password">New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showNewPassword ? 'text' : 'password'}
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                className={`pr-10 ${errors?.password ? 'border-red-500' : ''}`}
                                                placeholder="Enter your new password"
                                                required
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                        {errors?.password && (
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.password}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Password must be at least 8 characters long.
                                        </p>
                                    </div>

                                    {/* Confirm New Password */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="password_confirmation"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                className={`pr-10 ${errors?.password_confirmation ? 'border-red-500' : ''}`}
                                                placeholder="Confirm your new password"
                                                required
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                        {errors?.password_confirmation && (
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.password_confirmation}
                                            </p>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex gap-3">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            {processing ? 'Updating...' : 'Update Password'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => window.history.back()}
                                            disabled={processing}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Security Notice */}
                        <Card className="mt-6 border-yellow-200 dark:border-yellow-800">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                        <p className="font-medium mb-1">Security Notice</p>
                                        <p>
                                            This will only update your team member account password. 
                                            The main account password remains unchanged and can only be 
                                            updated by administrators in the Security tab.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </TeamsLayout>
    );
} 
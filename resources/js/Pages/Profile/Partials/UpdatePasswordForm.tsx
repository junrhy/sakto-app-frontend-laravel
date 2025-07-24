import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { CheckCircle, AlertCircle, Lock, Eye, EyeOff, Shield } from 'lucide-react';

export default function UpdatePasswordForm({
    className = '',
    hideHeader = false,
}: {
    className?: string;
    hideHeader?: boolean;
}) {
    const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();
        setAlert(null);

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setAlert({
                    type: 'success',
                    message: 'Password updated successfully.'
                });
                reset();
                setShowCurrentPassword(false);
                setShowNewPassword(false);
                setShowConfirmPassword(false);
            },
            onError: (errors) => {
                setAlert({
                    type: 'error',
                    message: 'Failed to update password. Please check your current password and try again.'
                });
                
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden backdrop-blur-sm dark:backdrop-blur-md ${className}`}>
            {!hideHeader && (
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-100 dark:from-gray-800 dark:via-purple-900/20 dark:to-indigo-900/20">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center ring-1 ring-purple-200 dark:ring-purple-800">
                                <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Update Password
                            </h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                Ensure your account is using a long, random password to stay secure.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {alert && (
                <div className={`mx-6 mt-6 p-4 rounded-lg border backdrop-blur-sm ${
                    alert.type === 'success' 
                        ? 'bg-green-50/80 border-green-200 dark:bg-green-900/30 dark:border-green-800/50' 
                        : 'bg-red-50/80 border-red-200 dark:bg-red-900/30 dark:border-red-800/50'
                }`}>
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            {alert.type === 'success' ? (
                                <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm font-medium ${
                                alert.type === 'success' 
                                    ? 'text-green-800 dark:text-green-200' 
                                    : 'text-red-800 dark:text-red-200'
                            }`}>
                                {alert.message}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={updatePassword} className="p-6 space-y-6">
                <div className="space-y-2">
                    <InputLabel
                        htmlFor="current_password"
                        value="Current Password"
                        className="text-sm font-medium text-gray-700 dark:text-gray-200"
                    />

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-4 w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-purple-500 dark:group-focus-within:text-purple-400 transition-colors duration-200" />
                        </div>
                        <TextInput
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) =>
                                setData('current_password', e.target.value)
                            }
                            type={showCurrentPassword ? "text" : "password"}
                            className="pl-10 pr-10 block w-full border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 rounded-lg transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-600"
                            autoComplete="current-password"
                            placeholder="Enter your current password"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                            {showCurrentPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                            ) : (
                                <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                            )}
                        </button>
                    </div>

                    <InputError
                        message={errors.current_password}
                        className="mt-1"
                    />
                </div>

                <div className="space-y-2">
                    <InputLabel 
                        htmlFor="password" 
                        value="New Password" 
                        className="text-sm font-medium text-gray-700 dark:text-gray-200"
                    />

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-4 w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-purple-500 dark:group-focus-within:text-purple-400 transition-colors duration-200" />
                        </div>
                        <TextInput
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            type={showNewPassword ? "text" : "password"}
                            className="pl-10 pr-10 block w-full border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 rounded-lg transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-600"
                            autoComplete="new-password"
                            placeholder="Enter your new password"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                            {showNewPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                            ) : (
                                <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                            )}
                        </button>
                    </div>

                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div className="space-y-2">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm New Password"
                        className="text-sm font-medium text-gray-700 dark:text-gray-200"
                    />

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-4 w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-purple-500 dark:group-focus-within:text-purple-400 transition-colors duration-200" />
                        </div>
                        <TextInput
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            type={showConfirmPassword ? "text" : "password"}
                            className="pl-10 pr-10 block w-full border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 rounded-lg transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-600"
                            autoComplete="new-password"
                            placeholder="Confirm your new password"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                            ) : (
                                <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                            )}
                        </button>
                    </div>

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-1"
                    />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                    <PrimaryButton 
                        disabled={processing}
                        className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-500 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg dark:shadow-purple-900/25"
                    >
                        {processing ? 'Updating...' : 'Update Password'}
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="transition ease-in-out duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span className="font-medium">Password updated successfully!</span>
                        </div>
                    </Transition>
                </div>
            </form>
        </section>
    );
}

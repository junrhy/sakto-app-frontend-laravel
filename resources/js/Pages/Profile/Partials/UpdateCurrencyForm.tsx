import { useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { CheckCircle, AlertCircle, DollarSign, Hash, Percent } from 'lucide-react';

export default function UpdateCurrencyForm({ className = '', currency, hideHeader = false }: { className?: string, currency: any, hideHeader?: boolean }) {
    const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const { data, setData, patch, errors, processing } = useForm({
        symbol: currency.symbol,
        decimal_separator: currency.decimal_separator,
        thousands_separator: currency.thousands_separator,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setAlert(null);
        
        patch(route('profile.currency'), {
            onSuccess: () => {
                setAlert({
                    type: 'success',
                    message: 'Currency settings updated successfully.'
                });
            },
            onError: () => {
                setAlert({
                    type: 'error',
                    message: 'Failed to update currency settings.'
                });
            }
        });
    };

    return (
        <section className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden backdrop-blur-sm dark:backdrop-blur-md ${className}`}>
            {!hideHeader && (
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-yellow-50 via-orange-50 to-yellow-100 dark:from-gray-800 dark:via-yellow-900/20 dark:to-orange-900/20">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg flex items-center justify-center ring-1 ring-yellow-200 dark:ring-yellow-800">
                                <DollarSign className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Currency Settings
                            </h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                Update your currency preferences and format settings.
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

            <form onSubmit={submit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <InputLabel 
                            htmlFor="currency_symbol" 
                            value="Currency Symbol" 
                            className="text-sm font-medium text-gray-700 dark:text-gray-200"
                        />
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <DollarSign className="h-4 w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-yellow-500 dark:group-focus-within:text-yellow-400 transition-colors duration-200" />
                            </div>
                            <TextInput
                                id="currency_symbol"
                                className="pl-10 block w-full border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 rounded-lg transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-600"
                                value={data.symbol}
                                onChange={(e) => setData('symbol', e.target.value)}
                                required
                                placeholder="e.g., $, €, ¥"
                            />
                        </div>
                        <InputError message={errors.symbol} className="mt-1" />
                    </div>

                    <div className="space-y-2">
                        <InputLabel 
                            htmlFor="decimal_separator" 
                            value="Decimal Separator" 
                            className="text-sm font-medium text-gray-700 dark:text-gray-200"
                        />
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Percent className="h-4 w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-yellow-500 dark:group-focus-within:text-yellow-400 transition-colors duration-200" />
                            </div>
                            <TextInput
                                id="decimal_separator"
                                className="pl-10 block w-full border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 rounded-lg transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-600"
                                value={data.decimal_separator}
                                onChange={(e) => setData('decimal_separator', e.target.value)}
                                required
                                placeholder="e.g., . or ,"
                            />
                        </div>
                        <InputError message={errors.decimal_separator} className="mt-1" />
                    </div>

                    <div className="space-y-2">
                        <InputLabel 
                            htmlFor="thousands_separator" 
                            value="Thousands Separator" 
                            className="text-sm font-medium text-gray-700 dark:text-gray-200"
                        />
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Hash className="h-4 w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-yellow-500 dark:group-focus-within:text-yellow-400 transition-colors duration-200" />
                            </div>
                            <TextInput
                                id="thousands_separator"
                                className="pl-10 block w-full border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 rounded-lg transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-600"
                                value={data.thousands_separator}
                                onChange={(e) => setData('thousands_separator', e.target.value)}
                                required
                                placeholder="e.g., , or ."
                            />
                        </div>
                        <InputError message={errors.thousands_separator} className="mt-1" />
                    </div>
                </div>

                <div className="bg-gray-50/80 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                        Preview
                    </h3>
                    <div className="text-lg font-mono text-gray-900 dark:text-white bg-white dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700">
                        {data.symbol}1{data.thousands_separator}234{data.decimal_separator}56
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        This is how your currency will be displayed
                    </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                    <PrimaryButton 
                        disabled={processing}
                        className="px-6 py-2.5 bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-500 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg dark:shadow-yellow-900/25"
                    >
                        {processing ? 'Saving...' : 'Save Currency Settings'}
                    </PrimaryButton>
                </div>
            </form>
        </section>
    );
} 
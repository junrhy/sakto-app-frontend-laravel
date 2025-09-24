import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle,
    DollarSign,
    Hash,
    Percent,
} from 'lucide-react';
import { FormEventHandler, useState } from 'react';

export default function UpdateCurrencyForm({
    className = '',
    currency,
    hideHeader = false,
}: {
    className?: string;
    currency: any;
    hideHeader?: boolean;
}) {
    const [alert, setAlert] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

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
                    message: 'Currency settings updated successfully.',
                });
            },
            onError: () => {
                setAlert({
                    type: 'error',
                    message: 'Failed to update currency settings.',
                });
            },
        });
    };

    return (
        <section
            className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900 dark:backdrop-blur-md ${className}`}
        >
            {!hideHeader && (
                <div className="border-b border-gray-200 bg-gradient-to-r from-yellow-50 via-orange-50 to-yellow-100 px-6 py-5 dark:border-gray-800 dark:from-gray-800 dark:via-yellow-900/20 dark:to-orange-900/20">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 ring-1 ring-yellow-200 dark:bg-yellow-900/50 dark:ring-yellow-800">
                                <DollarSign className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Currency Settings
                            </h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                Update your currency preferences and format
                                settings.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {alert && (
                <div
                    className={`mx-6 mt-6 rounded-lg border p-4 backdrop-blur-sm ${
                        alert.type === 'success'
                            ? 'border-green-200 bg-green-50/80 dark:border-green-800/50 dark:bg-green-900/30'
                            : 'border-red-200 bg-red-50/80 dark:border-red-800/50 dark:bg-red-900/30'
                    }`}
                >
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            {alert.type === 'success' ? (
                                <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p
                                className={`text-sm font-medium ${
                                    alert.type === 'success'
                                        ? 'text-green-800 dark:text-green-200'
                                        : 'text-red-800 dark:text-red-200'
                                }`}
                            >
                                {alert.message}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={submit} className="space-y-6 p-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                        <InputLabel
                            htmlFor="currency_symbol"
                            value="Currency Symbol"
                            className="text-sm font-medium text-gray-700 dark:text-gray-200"
                        />
                        <div className="group relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <DollarSign className="h-4 w-4 text-gray-400 transition-colors duration-200 group-focus-within:text-yellow-500 dark:text-gray-500 dark:group-focus-within:text-yellow-400" />
                            </div>
                            <TextInput
                                id="currency_symbol"
                                className="block w-full rounded-lg border-gray-300 pl-10 transition-all duration-200 hover:border-gray-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:hover:border-gray-600"
                                value={data.symbol}
                                onChange={(e) =>
                                    setData('symbol', e.target.value)
                                }
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
                        <div className="group relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Percent className="h-4 w-4 text-gray-400 transition-colors duration-200 group-focus-within:text-yellow-500 dark:text-gray-500 dark:group-focus-within:text-yellow-400" />
                            </div>
                            <TextInput
                                id="decimal_separator"
                                className="block w-full rounded-lg border-gray-300 pl-10 transition-all duration-200 hover:border-gray-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:hover:border-gray-600"
                                value={data.decimal_separator}
                                onChange={(e) =>
                                    setData('decimal_separator', e.target.value)
                                }
                                required
                                placeholder="e.g., . or ,"
                            />
                        </div>
                        <InputError
                            message={errors.decimal_separator}
                            className="mt-1"
                        />
                    </div>

                    <div className="space-y-2">
                        <InputLabel
                            htmlFor="thousands_separator"
                            value="Thousands Separator"
                            className="text-sm font-medium text-gray-700 dark:text-gray-200"
                        />
                        <div className="group relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Hash className="h-4 w-4 text-gray-400 transition-colors duration-200 group-focus-within:text-yellow-500 dark:text-gray-500 dark:group-focus-within:text-yellow-400" />
                            </div>
                            <TextInput
                                id="thousands_separator"
                                className="block w-full rounded-lg border-gray-300 pl-10 transition-all duration-200 hover:border-gray-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:hover:border-gray-600"
                                value={data.thousands_separator}
                                onChange={(e) =>
                                    setData(
                                        'thousands_separator',
                                        e.target.value,
                                    )
                                }
                                required
                                placeholder="e.g., , or ."
                            />
                        </div>
                        <InputError
                            message={errors.thousands_separator}
                            className="mt-1"
                        />
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/50">
                    <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                        Preview
                    </h3>
                    <div className="rounded border border-gray-200 bg-white px-3 py-2 font-mono text-lg text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                        {data.symbol}1{data.thousands_separator}234
                        {data.decimal_separator}56
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        This is how your currency will be displayed
                    </p>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-800">
                    <PrimaryButton
                        disabled={processing}
                        className="transform rounded-lg bg-yellow-600 px-6 py-2.5 font-medium shadow-lg transition-all duration-200 hover:scale-105 hover:bg-yellow-700 focus:ring-yellow-500 dark:bg-yellow-600 dark:shadow-yellow-900/25 dark:hover:bg-yellow-700 dark:focus:ring-yellow-500"
                    >
                        {processing ? 'Saving...' : 'Save Currency Settings'}
                    </PrimaryButton>
                </div>
            </form>
        </section>
    );
}

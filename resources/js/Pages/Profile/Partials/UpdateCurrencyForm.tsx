import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function UpdateCurrencyForm({ className = '' }: { className?: string }) {
    const { data, setData, patch, errors, processing } = useForm({
        currency_symbol: '$', // Default value, should come from user preferences
        decimal_separator: '.',
        thousands_separator: ',',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.currency'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Currency Settings
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Update your currency preferences and format settings.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="currency_symbol" value="Currency Symbol" />
                    <TextInput
                        id="currency_symbol"
                        className="mt-1 block w-full"
                        value={data.currency_symbol}
                        onChange={(e) => setData('currency_symbol', e.target.value)}
                        required
                    />
                </div>

                <div>
                    <InputLabel htmlFor="decimal_separator" value="Decimal Separator" />
                    <TextInput
                        id="decimal_separator"
                        className="mt-1 block w-full"
                        value={data.decimal_separator}
                        onChange={(e) => setData('decimal_separator', e.target.value)}
                        required
                    />
                </div>

                <div>
                    <InputLabel htmlFor="thousands_separator" value="Thousands Separator" />
                    <TextInput
                        id="thousands_separator"
                        className="mt-1 block w-full"
                        value={data.thousands_separator}
                        onChange={(e) => setData('thousands_separator', e.target.value)}
                        required
                    />
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>
                </div>
            </form>
        </section>
    );
} 
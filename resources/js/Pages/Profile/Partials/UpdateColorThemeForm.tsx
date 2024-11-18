import { useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';

export default function UpdateColorThemeForm({ className = '' }: { className?: string }) {
    const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const { data, setData, patch, errors, processing } = useForm({
        color: 'zinc', // default shadcn color
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setAlert(null);
        
        patch(route('profile.color'), {
            onSuccess: () => {
                setAlert({
                    type: 'success',
                    message: 'Color theme updated successfully.'
                });
            },
            onError: () => {
                setAlert({
                    type: 'error',
                    message: 'Failed to update color theme.'
                });
            }
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Color Theme
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Choose your preferred color scheme.
                </p>
            </header>

            {alert && (
                <div className={`mt-4 p-4 rounded-md ${
                    alert.type === 'success' 
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300' 
                        : 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                }`}>
                    {alert.message}
                </div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="color" value="Color Scheme" />
                    <select
                        id="color"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                        value={data.color}
                        onChange={(e) => setData('color', e.target.value)}
                    >
                        <option value="zinc">Zinc</option>
                        <option value="slate">Slate</option>
                        <option value="stone">Stone</option>
                        <option value="gray">Gray</option>
                        <option value="neutral">Neutral</option>
                        <option value="red">Red</option>
                        <option value="rose">Rose</option>
                        <option value="orange">Orange</option>
                        <option value="green">Green</option>
                        <option value="blue">Blue</option>
                        <option value="yellow">Yellow</option>
                        <option value="violet">Violet</option>
                    </select>
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>
                </div>
            </form>
        </section>
    );
} 
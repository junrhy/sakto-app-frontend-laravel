import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';

export default function UpdateThemeForm({ className = '' }: { className?: string }) {
    const { data, setData, patch, errors, processing } = useForm({
        theme: 'system', // 'light' | 'dark' | 'system'
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.theme'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Theme Settings
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Choose your preferred theme mode.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="theme" value="Theme" />
                    <select
                        id="theme"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                        value={data.theme}
                        onChange={(e) => setData('theme', e.target.value)}
                    >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System</option>
                    </select>
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>
                </div>
            </form>
        </section>
    );
} 
import { useTheme } from '@/Components/ThemeProvider';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Globe, Monitor, Moon, Sun } from 'lucide-react';
import UpdateCurrencyForm from './UpdateCurrencyForm';

interface PreferencesSettingsProps {
    currency: any;
}

export default function PreferencesSettings({
    currency,
}: PreferencesSettingsProps) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Theme Settings
                    </CardTitle>
                    <CardDescription>
                        Select your preferred theme for the application
                        interface.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {(() => {
                        const { theme, setTheme } = useTheme();
                        const options = [
                            { value: 'light', label: 'Light', icon: Sun },
                            { value: 'dark', label: 'Dark', icon: Moon },
                            { value: 'system', label: 'System', icon: Monitor },
                        ];
                        return (
                            <div className="flex flex-col items-start gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70 sm:flex-row sm:items-center">
                                <span className="min-w-[70px] font-medium text-gray-700 dark:text-gray-200">
                                    Theme:
                                </span>
                                <div className="flex gap-2">
                                    {options.map(
                                        ({ value, label, icon: Icon }) => (
                                            <Button
                                                key={value}
                                                type="button"
                                                variant={
                                                    theme === value
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-colors duration-150 ${
                                                    theme === value
                                                        ? 'bg-blue-50 text-blue-900 ring-2 ring-blue-500 hover:bg-blue-100 dark:bg-blue-900/60 dark:text-blue-200 dark:ring-blue-400 dark:hover:bg-blue-900/80'
                                                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-200 dark:hover:bg-gray-800/80'
                                                } `}
                                                aria-pressed={theme === value}
                                                onClick={() =>
                                                    setTheme(
                                                        value as
                                                            | 'light'
                                                            | 'dark'
                                                            | 'system',
                                                    )
                                                }
                                            >
                                                <Icon className="h-5 w-5" />
                                                <span className="hidden sm:inline">
                                                    {label}
                                                </span>
                                            </Button>
                                        ),
                                    )}
                                </div>
                            </div>
                        );
                    })()}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Currency Settings
                    </CardTitle>
                    <CardDescription>
                        Set your preferred currency for transactions and
                        displays.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UpdateCurrencyForm
                        currency={currency}
                        className="max-w-xl"
                        hideHeader={true}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Globe, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/Components/ThemeProvider';
import UpdateCurrencyForm from './UpdateCurrencyForm';

interface PreferencesSettingsProps {
    currency: any;
}

export default function PreferencesSettings({ currency }: PreferencesSettingsProps) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Theme Settings
                    </CardTitle>
                    <CardDescription>
                        Select your preferred theme for the application interface.
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
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700">
                                <span className="text-gray-700 dark:text-gray-200 font-medium min-w-[70px]">Theme:</span>
                                <div className="flex gap-2">
                                    {options.map(({ value, label, icon: Icon }) => (
                                        <Button
                                            key={value}
                                            type="button"
                                            variant={theme === value ? 'default' : 'outline'}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-150
                                                ${theme === value
                                                    ? 'ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/80'
                                                    : 'bg-white dark:bg-gray-900/60 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/80'}
                                            `}
                                            aria-pressed={theme === value}
                                            onClick={() => setTheme(value as "light" | "dark" | "system")}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="hidden sm:inline">{label}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Currency Settings
                    </CardTitle>
                    <CardDescription>
                        Set your preferred currency for transactions and displays.
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

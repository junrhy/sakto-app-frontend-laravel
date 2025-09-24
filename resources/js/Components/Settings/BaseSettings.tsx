import ApplicationLogo from '@/Components/ApplicationLogo';
import { ThemeProvider } from '@/Components/ThemeProvider';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface Props {
    title: string;
    description?: string;
    backUrl: string;
    children: React.ReactNode;
    auth: {
        user: {
            name: string;
        };
    };
}

export default function BaseSettings({
    title,
    description,
    backUrl,
    children,
    auth,
}: Props) {
    return (
        <ThemeProvider>
            <Head title={`${title} Settings`} />
            <div className="relative min-h-screen bg-white pb-16 dark:bg-gray-900">
                <div className="fixed left-0 right-0 top-0 z-10 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                    <div className="container mx-auto px-4 pt-4">
                        <div className="mb-4 flex flex-col items-center">
                            <div className="mb-2 flex w-full items-center justify-between">
                                <div className="flex items-center">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-white hover:text-white/80"
                                        onClick={() => router.visit(backUrl)}
                                    >
                                        <ArrowLeft className="h-6 w-6" />
                                    </Button>
                                    <ApplicationLogo className="h-10 w-auto fill-current text-white" />
                                    <span className="ml-2 text-xl font-bold text-white">
                                        Settings
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 pt-24">
                    <Card>
                        <CardHeader>
                            <CardTitle>{title} Settings</CardTitle>
                            {description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {description}
                                </p>
                            )}
                        </CardHeader>
                        <CardContent>{children}</CardContent>
                    </Card>
                </div>
            </div>
        </ThemeProvider>
    );
}

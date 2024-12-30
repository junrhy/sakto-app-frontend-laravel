import { Head, Link } from '@inertiajs/react';
import BottomNav from '@/Components/BottomNav';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Search } from 'lucide-react';
import { ThemeProvider } from "@/Components/ThemeProvider";
import { ModeToggle } from "@/Components/ModeToggle";

interface PageProps {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
}

interface App {
    id: number;
    name: string;
    description: string;
    icon: string;
    category: string;
    price: string;
    rating: number;
}

const mockApps: App[] = [
    {
        id: 1,
        name: "Patient Records",
        description: "Manage patient records efficiently",
        icon: "🏥",
        category: "Medical",
        price: "Free",
        rating: 4.5
    },
    {
        id: 2,
        name: "Appointment Scheduler",
        description: "Schedule and manage appointments",
        icon: "📅",
        category: "Productivity",
        price: "$9.99/mo",
        rating: 4.8
    },
    {
        id: 3,
        name: "Billing Manager",
        description: "Streamline your billing process",
        icon: "💰",
        category: "Finance",
        price: "$19.99/mo",
        rating: 4.2
    },
];

export default function Apps({ auth }: PageProps) {
    return (
        <ThemeProvider>
            <div className="relative min-h-screen pb-16 bg-white dark:bg-gray-900">
                <Head title="Apps" />

                <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 z-10">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <ApplicationLogo className="h-10 w-auto fill-current text-white" />
                                <span className="ml-2 text-xl font-bold text-white">Sakto</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <ModeToggle />
                                <Link 
                                    href="/help"
                                    className="text-white hover:text-blue-100 transition-colors duration-200"
                                >
                                    <span className="text-md font-semibold">Help</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 pt-[100px] landscape:pt-[80px] md:pt-[100px]">
                    <div className="py-12">
                        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                                {/* Search and Filter Section */}
                                <div className="mb-8">
                                    <div className="flex gap-4 mb-4">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            <Input
                                                placeholder="Search apps..."
                                                className="pl-10 bg-white dark:bg-gray-800"
                                            />
                                        </div>
                                        <Button variant="outline">All Categories</Button>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        <Badge variant="secondary">Medical</Badge>
                                        <Badge variant="secondary">Productivity</Badge>
                                        <Badge variant="secondary">Finance</Badge>
                                        <Badge variant="secondary">Communication</Badge>
                                    </div>
                                </div>

                                {/* Apps Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {mockApps.map((app) => (
                                        <Card key={app.id} className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
                                            <CardHeader>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-4xl">{app.icon}</div>
                                                    <div>
                                                        <CardTitle className="text-gray-900 dark:text-gray-100">{app.name}</CardTitle>
                                                        <CardDescription className="text-gray-500 dark:text-gray-400">{app.category}</CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    {app.description}
                                                </p>
                                            </CardContent>
                                            <CardFooter className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-yellow-500">⭐</span>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{app.rating}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{app.price}</span>
                                                    <Button>Install</Button>
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <BottomNav />
            </div>
        </ThemeProvider>
    );
}

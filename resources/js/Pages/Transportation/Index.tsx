import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/Components/ui/tabs';
import { 
    DashboardStats, 
    ShipmentTracking, 
    FleetManagement, 
    CargoMonitoring,
    BookingManagement,
    PricingManagement,
    OpenStreetMapTruckLocation
} from './components';
import { 
    BarChart3Icon, 
    TruckIcon, 
    PackageIcon, 
    CalendarIcon, 
    CreditCardIcon,
    MapIcon
} from 'lucide-react';

export default function Transportation() {
    const [activeTab, setActiveTab] = useState('dashboard');

    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <TruckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-100">
                            Transportation Management
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Manage your fleet, shipments, and logistics operations
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Transportation Management" />

            <div className="p-6 space-y-6">
                <Tabs 
                    value={activeTab} 
                    onValueChange={handleTabChange}
                    className="w-full"
                >
                    <div className="overflow-x-auto mb-8">
                        <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-900/50 p-1 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 shadow-sm">
                            <TabsTrigger 
                                value="dashboard" 
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-700"
                            >
                                <BarChart3Icon className="mr-2 h-4 w-4" />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger 
                                value="shipments" 
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-700"
                            >
                                <PackageIcon className="mr-2 h-4 w-4" />
                                Shipments
                            </TabsTrigger>
                            <TabsTrigger 
                                value="fleet" 
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-700"
                            >
                                <TruckIcon className="mr-2 h-4 w-4" />
                                Fleet
                            </TabsTrigger>
                            <TabsTrigger 
                                value="tracking" 
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-700"
                            >
                                <MapIcon className="mr-2 h-4 w-4" />
                                Live Tracking
                            </TabsTrigger>
                            <TabsTrigger 
                                value="cargo" 
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-700"
                            >
                                <PackageIcon className="mr-2 h-4 w-4" />
                                Cargo
                            </TabsTrigger>
                            <TabsTrigger 
                                value="bookings" 
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-700"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                Bookings
                            </TabsTrigger>
                            <TabsTrigger 
                                value="pricing" 
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-700"
                            >
                                <CreditCardIcon className="mr-2 h-4 w-4" />
                                Pricing
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Dashboard Tab */}
                    <TabsContent value="dashboard" className="space-y-6">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-blue-200 dark:border-gray-700">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                    <BarChart3Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Transportation Overview</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Monitor your fleet performance and key metrics</p>
                                </div>
                            </div>
                            <DashboardStats />
                        </div>
                    </TabsContent>

                    {/* Shipments Tab */}
                    <TabsContent value="shipments" className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <ShipmentTracking />
                        </div>
                    </TabsContent>

                    {/* Fleet Tab */}
                    <TabsContent value="fleet" className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <FleetManagement />
                        </div>
                    </TabsContent>

                    {/* Live Tracking Tab */}
                    <TabsContent value="tracking" className="space-y-6">
                        <OpenStreetMapTruckLocation />
                    </TabsContent>

                    {/* Cargo Tab */}
                    <TabsContent value="cargo" className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <CargoMonitoring />
                        </div>
                    </TabsContent>

                    {/* Bookings Tab */}
                    <TabsContent value="bookings" className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <BookingManagement />
                        </div>
                    </TabsContent>

                    {/* Pricing Tab */}
                    <TabsContent value="pricing" className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <PricingManagement />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}

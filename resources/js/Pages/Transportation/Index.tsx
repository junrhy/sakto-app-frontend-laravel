import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    BarChart3Icon,
    CalendarIcon,
    CreditCardIcon,
    MapIcon,
    PackageIcon,
    TruckIcon,
} from 'lucide-react';
import { useState } from 'react';
import {
    BookingManagement,
    CargoMonitoring,
    DashboardStats,
    FleetManagement,
    OpenStreetMapTruckLocation,
    PricingManagement,
    ShipmentTracking,
} from './components';

export default function Transportation() {
    const [activeTab, setActiveTab] = useState('dashboard');

    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                        <TruckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-100">
                            Transportation Management
                        </h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Manage your fleet, shipments, and logistics
                            operations
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Transportation Management" />

            <div className="space-y-6 p-6">
                <Tabs
                    value={activeTab}
                    onValueChange={handleTabChange}
                    className="w-full"
                >
                    {/* Mobile Dropdown */}
                    <div className="mb-8 md:hidden">
                        <Select value={activeTab} onValueChange={handleTabChange}>
                            <SelectTrigger className="w-full">
                                <SelectValue>
                                    {activeTab === 'dashboard' && (
                                        <div className="flex items-center">
                                            <BarChart3Icon className="mr-2 h-4 w-4" />
                                            Overview
                                        </div>
                                    )}
                                    {activeTab === 'shipments' && (
                                        <div className="flex items-center">
                                            <PackageIcon className="mr-2 h-4 w-4" />
                                            Shipments
                                        </div>
                                    )}
                                    {activeTab === 'fleet' && (
                                        <div className="flex items-center">
                                            <TruckIcon className="mr-2 h-4 w-4" />
                                            Fleet
                                        </div>
                                    )}
                                    {activeTab === 'tracking' && (
                                        <div className="flex items-center">
                                            <MapIcon className="mr-2 h-4 w-4" />
                                            Live Tracking
                                        </div>
                                    )}
                                    {activeTab === 'cargo' && (
                                        <div className="flex items-center">
                                            <PackageIcon className="mr-2 h-4 w-4" />
                                            Cargo
                                        </div>
                                    )}
                                    {activeTab === 'bookings' && (
                                        <div className="flex items-center">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            Bookings
                                        </div>
                                    )}
                                    {activeTab === 'pricing' && (
                                        <div className="flex items-center">
                                            <CreditCardIcon className="mr-2 h-4 w-4" />
                                            Pricing
                                        </div>
                                    )}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="dashboard">
                                    <div className="flex items-center">
                                        <BarChart3Icon className="mr-2 h-4 w-4" />
                                        Overview
                                    </div>
                                </SelectItem>
                                <SelectItem value="shipments">
                                    <div className="flex items-center">
                                        <PackageIcon className="mr-2 h-4 w-4" />
                                        Shipments
                                    </div>
                                </SelectItem>
                                <SelectItem value="fleet">
                                    <div className="flex items-center">
                                        <TruckIcon className="mr-2 h-4 w-4" />
                                        Fleet
                                    </div>
                                </SelectItem>
                                <SelectItem value="tracking">
                                    <div className="flex items-center">
                                        <MapIcon className="mr-2 h-4 w-4" />
                                        Live Tracking
                                    </div>
                                </SelectItem>
                                <SelectItem value="cargo">
                                    <div className="flex items-center">
                                        <PackageIcon className="mr-2 h-4 w-4" />
                                        Cargo
                                    </div>
                                </SelectItem>
                                <SelectItem value="bookings">
                                    <div className="flex items-center">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        Bookings
                                    </div>
                                </SelectItem>
                                <SelectItem value="pricing">
                                    <div className="flex items-center">
                                        <CreditCardIcon className="mr-2 h-4 w-4" />
                                        Pricing
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Desktop Tabs */}
                    <div className="mb-8 hidden overflow-x-auto md:block">
                        <TabsList className="inline-flex h-12 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-1 text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-400">
                            <TabsTrigger
                                value="dashboard"
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border data-[state=active]:border-gray-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md dark:data-[state=active]:border-gray-700 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100"
                            >
                                <BarChart3Icon className="mr-2 h-4 w-4" />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="shipments"
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border data-[state=active]:border-gray-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md dark:data-[state=active]:border-gray-700 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100"
                            >
                                <PackageIcon className="mr-2 h-4 w-4" />
                                Shipments
                            </TabsTrigger>
                            <TabsTrigger
                                value="fleet"
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border data-[state=active]:border-gray-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md dark:data-[state=active]:border-gray-700 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100"
                            >
                                <TruckIcon className="mr-2 h-4 w-4" />
                                Fleet
                            </TabsTrigger>
                            <TabsTrigger
                                value="tracking"
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border data-[state=active]:border-gray-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md dark:data-[state=active]:border-gray-700 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100"
                            >
                                <MapIcon className="mr-2 h-4 w-4" />
                                Live Tracking
                            </TabsTrigger>
                            <TabsTrigger
                                value="cargo"
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border data-[state=active]:border-gray-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md dark:data-[state=active]:border-gray-700 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100"
                            >
                                <PackageIcon className="mr-2 h-4 w-4" />
                                Cargo
                            </TabsTrigger>
                            <TabsTrigger
                                value="bookings"
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border data-[state=active]:border-gray-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md dark:data-[state=active]:border-gray-700 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                Bookings
                            </TabsTrigger>
                            <TabsTrigger
                                value="pricing"
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border data-[state=active]:border-gray-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md dark:data-[state=active]:border-gray-700 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100"
                            >
                                <CreditCardIcon className="mr-2 h-4 w-4" />
                                Pricing
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Dashboard Tab */}
                    <TabsContent value="dashboard" className="space-y-6">
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <div className="mb-4 flex items-center space-x-3">
                                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                                    <BarChart3Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        Transportation Overview
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Monitor your fleet performance and key
                                        metrics
                                    </p>
                                </div>
                            </div>
                            <DashboardStats />
                        </div>
                    </TabsContent>

                    {/* Shipments Tab */}
                    <TabsContent value="shipments" className="space-y-6">
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <ShipmentTracking />
                        </div>
                    </TabsContent>

                    {/* Fleet Tab */}
                    <TabsContent value="fleet" className="space-y-6">
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <FleetManagement />
                        </div>
                    </TabsContent>

                    {/* Live Tracking Tab */}
                    <TabsContent value="tracking" className="space-y-6">
                        <OpenStreetMapTruckLocation />
                    </TabsContent>

                    {/* Cargo Tab */}
                    <TabsContent value="cargo" className="space-y-6">
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <CargoMonitoring />
                        </div>
                    </TabsContent>

                    {/* Bookings Tab */}
                    <TabsContent value="bookings" className="space-y-6">
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <BookingManagement />
                        </div>
                    </TabsContent>

                    {/* Pricing Tab */}
                    <TabsContent value="pricing" className="space-y-6">
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <PricingManagement />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}

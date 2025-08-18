import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { useDashboardStats } from "../hooks";

export default function DashboardStats() {
    const { stats, loading, error } = useDashboardStats();

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Loading...</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">-</div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-500 dark:text-red-400">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-red-500 dark:text-red-400">{error}</div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Shipments</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.activeShipments}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Trucks</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.availableTrucks}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Delayed Shipments</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.delayedShipments}</div>
                </CardContent>
            </Card>
        </div>
    );
}

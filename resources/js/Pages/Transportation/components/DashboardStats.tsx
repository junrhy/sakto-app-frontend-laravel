import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { useDashboardStats } from "../hooks";
import { 
    TruckIcon, 
    PackageIcon, 
    ClockIcon, 
    TrendingUpIcon,
    TrendingDownIcon,
    AlertTriangleIcon
} from "lucide-react";

export default function DashboardStats() {
    const { stats, loading, error } = useDashboardStats();

    if (loading) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            </CardTitle>
                            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Error</CardTitle>
                        <AlertTriangleIcon className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const statsData = [
        {
            title: "Active Shipments",
            value: stats.activeShipments,
            icon: PackageIcon,
            color: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-100 dark:bg-blue-900/30",
            trend: "+12%",
            trendIcon: TrendingUpIcon,
            trendColor: "text-green-600 dark:text-green-400"
        },
        {
            title: "Available Trucks",
            value: stats.availableTrucks,
            icon: TruckIcon,
            color: "text-green-600 dark:text-green-400",
            bgColor: "bg-green-100 dark:bg-green-900/30",
            trend: "+5%",
            trendIcon: TrendingUpIcon,
            trendColor: "text-green-600 dark:text-green-400"
        },
        {
            title: "Delayed Shipments",
            value: stats.delayedShipments,
            icon: ClockIcon,
            color: "text-orange-600 dark:text-orange-400",
            bgColor: "bg-orange-100 dark:bg-orange-900/30",
            trend: "-8%",
            trendIcon: TrendingDownIcon,
            trendColor: "text-green-600 dark:text-green-400"
        },
        {
            title: "Total Revenue",
            value: `$${stats.totalRevenue || '0'}`,
            icon: TrendingUpIcon,
            color: "text-purple-600 dark:text-purple-400",
            bgColor: "bg-purple-100 dark:bg-purple-900/30",
            trend: "+15%",
            trendIcon: TrendingUpIcon,
            trendColor: "text-green-600 dark:text-green-400"
        }
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {statsData.map((stat, index) => (
                <Card key={index} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {stat.title}
                        </CardTitle>
                        <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {stat.value}
                            </div>
                            <div className="flex items-center space-x-1">
                                <stat.trendIcon className={`h-3 w-3 ${stat.trendColor}`} />
                                <span className={`text-xs font-medium ${stat.trendColor}`}>
                                    {stat.trend}
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            vs last month
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

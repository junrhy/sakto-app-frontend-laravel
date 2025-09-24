import { Card, CardContent } from '@/Components/ui/card';
import { ScrollArea } from '@/Components/ui/scroll-area';
import {
    AlertCircle,
    Calendar,
    DollarSign,
    Package,
    TrendingUp,
} from 'lucide-react';

interface RentalItem {
    id: string;
    name: string;
    category: string;
    daily_rate: number;
    total_rented: number;
    total_revenue: number;
    status: 'available' | 'rented' | 'maintenance';
    last_rented?: string;
}

interface RentalOverview {
    total_items: number;
    available_items: number;
    rented_items: number;
    total_revenue: number;
    categories: {
        name: string;
        count: number;
    }[];
    upcoming_returns: {
        item_name: string;
        return_date: string;
        customer: string;
    }[];
}

export function RentalItemStatsWidget() {
    // This would typically come from your API
    const items: RentalItem[] = [
        {
            id: '1',
            name: 'Professional Camera',
            category: 'Electronics',
            daily_rate: 50,
            total_rented: 15,
            total_revenue: 750,
            status: 'rented',
            last_rented: '2024-03-15',
        },
        {
            id: '2',
            name: 'Power Drill Set',
            category: 'Tools',
            daily_rate: 25,
            total_rented: 8,
            total_revenue: 200,
            status: 'available',
            last_rented: '2024-03-10',
        },
    ];

    const overview: RentalOverview = {
        total_items: 2,
        available_items: 1,
        rented_items: 1,
        total_revenue: 950,
        categories: [
            { name: 'Electronics', count: 1 },
            { name: 'Tools', count: 1 },
        ],
        upcoming_returns: [
            {
                item_name: 'Professional Camera',
                return_date: '2024-03-22',
                customer: 'John Smith',
            },
        ],
    };

    return (
        <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                    Rental Overview
                </h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                        Total Revenue:
                    </span>
                    <span className="text-sm font-medium">
                        ${overview.total_revenue.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="mb-6 grid grid-cols-2 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-blue-500" />
                                <span className="text-sm">Available Items</span>
                            </div>
                            <span className="text-sm font-medium">
                                {overview.available_items}
                            </span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-green-500" />
                                <span className="text-sm">Daily Revenue</span>
                            </div>
                            <span className="text-sm font-medium">
                                ${(overview.total_revenue / 30).toFixed(2)}
                            </span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-purple-500" />
                                <span className="text-sm">Rented Items</span>
                            </div>
                            <span className="text-sm font-medium">
                                {overview.rented_items}
                            </span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-orange-500" />
                                <span className="text-sm">
                                    Utilization Rate
                                </span>
                            </div>
                            <span className="text-sm font-medium">
                                {(
                                    (overview.rented_items /
                                        overview.total_items) *
                                    100
                                ).toFixed(1)}
                                %
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Category Distribution */}
            <div className="mb-6">
                <h4 className="mb-2 text-sm font-medium">
                    Category Distribution
                </h4>
                <div className="space-y-4">
                    {overview.categories.map((category) => (
                        <div
                            key={category.name}
                            className="flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{category.name}</span>
                            </div>
                            <span className="text-sm font-medium">
                                {category.count} items
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Upcoming Returns */}
            <div className="mb-6">
                <h4 className="mb-2 text-sm font-medium">Upcoming Returns</h4>
                <ScrollArea className="h-[120px]">
                    <div className="space-y-4">
                        {overview.upcoming_returns.map((return_item) => (
                            <Card key={return_item.item_name}>
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                                        </div>
                                        <div className="min-w-0 flex-grow">
                                            <div className="flex items-center justify-between">
                                                <span className="truncate font-medium">
                                                    {return_item.item_name}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {new Date(
                                                        return_item.return_date,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="mt-2 truncate text-sm text-gray-500">
                                                {return_item.customer}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Recent Items */}
            <ScrollArea className="h-[calc(100%-24rem)]">
                <div className="space-y-4">
                    {items.map((item) => (
                        <Card key={item.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <Package className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <div className="min-w-0 flex-grow">
                                        <div className="flex items-center justify-between">
                                            <span className="truncate font-medium">
                                                {item.name}
                                            </span>
                                            <span
                                                className={`rounded-full px-2 py-1 text-sm ${
                                                    item.status === 'available'
                                                        ? 'bg-green-100 text-green-800'
                                                        : item.status ===
                                                            'rented'
                                                          ? 'bg-blue-100 text-blue-800'
                                                          : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                            >
                                                {item.status
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    item.status.slice(1)}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-4">
                                            <span className="text-sm text-gray-500">
                                                ${item.daily_rate}/day
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {item.total_rented} rentals
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}

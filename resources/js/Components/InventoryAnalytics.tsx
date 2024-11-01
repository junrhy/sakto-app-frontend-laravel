import { Product } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface AnalyticsProps {
    products: Product[];
}

export default function InventoryAnalytics({ products }: AnalyticsProps) {
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    const lowStockItems = products.filter(p => p.quantity <= 10).length;
    const outOfStockItems = products.filter(p => p.quantity === 0).length;
    const averagePrice = totalValue / products.length;

    const stockDistributionData = {
        labels: products.map(p => p.name),
        datasets: [
            {
                label: 'Stock Quantity',
                data: products.map(p => p.quantity),
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
        ],
    };

    const valueDistributionData = {
        labels: products.map(p => p.name),
        datasets: [
            {
                label: 'Product Value',
                data: products.map(p => p.price * p.quantity),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
            },
        ],
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Low Stock Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{lowStockItems}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Out of Stock</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{outOfStockItems}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Average Price</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${averagePrice.toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Stock Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Bar data={stockDistributionData} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Value Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Line data={valueDistributionData} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 
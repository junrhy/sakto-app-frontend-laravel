import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { CheckCircle, Clock } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface CustomerOrder {
    id: number;
    order_number: string;
    table_number: string;
    customer_name?: string | null;
    customer_notes?: string | null;
    items: Array<{
        id: number;
        name: string;
        quantity: number;
        price: number;
    }>;
    status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    sent_at: string;
    prepared_at?: string | null;
    ready_at?: string | null;
    completed_at?: string | null;
    created_at: string;
}

interface CustomerDisplayProps {
    clientIdentifier: string;
    customerOrders: CustomerOrder[];
    error?: string;
    videoUrl?: string;
}

export const CustomerDisplay: React.FC<CustomerDisplayProps> = ({ 
    clientIdentifier, 
    customerOrders: initialOrders, 
    error,
    videoUrl 
}) => {
    const [loading, setLoading] = useState(false);
    const [customerOrders, setCustomerOrders] = useState(initialOrders);

    // Fetch orders data
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/fnb/customer-display/${clientIdentifier}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.data && data.data.props && data.data.props.customerOrders) {
                    setCustomerOrders(data.data.props.customerOrders);
                }
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    // Convert YouTube URL to embeddable format
    const getEmbedUrl = (url: string) => {
        if (!url) return '';
        
        // If already an embed URL, return as is
        if (url.includes('youtube.com/embed/')) {
            return url;
        }
        
        // Extract video ID from various YouTube URL formats
        const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        
        if (videoId && videoId[1]) {
            return `https://www.youtube.com/embed/${videoId[1]}?autoplay=1&mute=1&loop=1&playlist=${videoId[1]}`;
        }
        
        return url;
    };

    // Auto-refresh orders every 15 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchOrders();
        }, 15000);

        return () => clearInterval(interval);
    }, [clientIdentifier]);


    // Get time elapsed
    const getTimeElapsed = (sentAt: string) => {
        const sent = new Date(sentAt);
        const now = new Date();
        const diff = now.getTime() - sent.getTime();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m`;
        }
        return `${seconds}s`;
    };

    return (
                <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pl-6 pb-6">
            <div className="w-full">

                {/* Error Display */}
                {error && (
                    <div className="mb-4 rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Error loading orders
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    {error}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Layout */}
                <div className={`grid grid-cols-1 gap-6 ${videoUrl ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
                    {/* Orders Section */}
                    <div className={`space-y-4 pt-8 ${videoUrl ? '' : 'mr-6'}`}>
                        {/* Status Columns */}
                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {/* Preparing Column */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-blue-100 to-cyan-100 p-4 shadow-md">
                            <div className="flex items-center space-x-2">
                                <Clock className="h-6 w-6 text-blue-600" />
                                <h2 className="text-xl font-bold text-blue-800">
                                    Preparing
                                </h2>
                            </div>
                            <span className="rounded-full bg-blue-200 px-3 py-1 text-sm font-bold text-blue-800 shadow-sm">
                                {customerOrders.filter(order => order.status === 'preparing').length}
                            </span>
                        </div>
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                            {customerOrders.filter(order => order.status === 'preparing').map((order) => (
                                <Card key={order.id} className="border-2 border-blue-300 bg-white rounded-lg transition-all hover:shadow-xl hover:scale-105">
                                    <CardHeader className="border-b border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50">
                                        <CardTitle className="text-3xl font-bold text-gray-900">
                                            {order.order_number.split('-').slice(1).join('-')}
                                        </CardTitle>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Ready Column */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 p-4 shadow-md">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                                <h2 className="text-xl font-bold text-green-800">
                                    Ready for Pickup
                                </h2>
                            </div>
                            <span className="rounded-full bg-green-200 px-3 py-1 text-sm font-bold text-green-800 shadow-sm">
                                {customerOrders.filter(order => order.status === 'ready').length}
                            </span>
                        </div>
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                            {customerOrders.filter(order => order.status === 'ready').map((order) => (
                                <Card key={order.id} className="border-2 border-green-300 bg-white rounded-lg transition-all hover:shadow-xl hover:scale-105">
                                    <CardHeader className="border-b border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
                                        <CardTitle className="text-3xl font-bold text-gray-900">
                                            {order.order_number.split('-').slice(1).join('-')}
                                        </CardTitle>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </div>
                    </div>

                    
                </div>

                {/* Video Section */}
                {videoUrl && (
                        <div className="flex items-center justify-center min-h-screen bg-gray-900 p-6">
                            <div className="relative aspect-video w-full max-w-4xl mx-auto rounded-lg overflow-hidden shadow-lg">
                                <iframe
                                    src={getEmbedUrl(videoUrl)}
                                    title="Advertisement"
                                    className="w-full h-full"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    )}

                {/* Empty State */}
                {customerOrders.length === 0 && (
                    <div className="flex h-64 items-center justify-center">
                        <div className="text-center">
                            <Clock className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-gray-500">
                                No orders to display
                            </p>
                        </div>
                    </div>
                )}

                </div>
            </div>
        </div>
    );
};

export default CustomerDisplay;

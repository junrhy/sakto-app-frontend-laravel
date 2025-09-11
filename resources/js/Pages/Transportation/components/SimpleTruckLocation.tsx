import React, { useEffect, useState, useCallback } from 'react';
import { TruckIcon, MapPinIcon, ClockIcon, Gauge, RefreshCwIcon } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import axios from 'axios';

// Types
interface TruckLocation {
    id: number;
    plate_number: string;
    model: string;
    status: string;
    driver?: string;
    driver_contact?: string;
    location: {
        latitude: string;
        longitude: string;
        address?: string;
        last_update: string;
    };
    movement: {
        speed?: number;
        heading?: number;
    };
    is_online: boolean;
}

interface SimpleTruckLocationProps {
    className?: string;
}

// Helper function to format last update time
const formatLastUpdate = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

// Helper function to get status color
const getStatusColor = (status: string): string => {
    switch (status) {
        case 'Available': return 'text-green-600 bg-green-100';
        case 'In Transit': return 'text-blue-600 bg-blue-100';
        case 'Maintenance': return 'text-yellow-600 bg-yellow-100';
        default: return 'text-gray-600 bg-gray-100';
    }
};

export default function SimpleTruckLocation({ className = '' }: SimpleTruckLocationProps) {
    const [trucks, setTrucks] = useState<TruckLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const fetchTruckLocations = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get('/transportation/fleet/real-time-locations');
            if (response.data && Array.isArray(response.data)) {
                setTrucks(response.data);
                setError(null);
            } else {
                setError('Invalid data format received');
                setTrucks([]);
            }
        } catch (err) {
            setError('Failed to fetch truck locations');
            console.error('Error fetching truck locations:', err);
            setTrucks([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTruckLocations();
    }, [fetchTruckLocations]);

    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(fetchTruckLocations, 30000); // Refresh every 30 seconds
            return () => clearInterval(interval);
        }
    }, [autoRefresh, fetchTruckLocations]);

    if (loading && trucks.length === 0) {
        return (
            <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-500 dark:text-gray-400">Loading truck locations...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && trucks.length === 0) {
        return (
            <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="text-red-500 text-4xl mb-2">⚠️</div>
                        <p className="text-red-600 dark:text-red-400 font-medium">Failed to load truck locations</p>
                        <p className="text-red-500 dark:text-red-400 text-sm mt-1">{error}</p>
                        <Button 
                            onClick={fetchTruckLocations} 
                            variant="outline" 
                            size="sm" 
                            className="mt-3"
                        >
                            <RefreshCwIcon className="h-4 w-4 mr-2" />
                            Retry
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                            <MapPinIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Live Truck Tracking</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Real-time location of your fleet vehicles
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Auto-refresh:</span>
                            <Button
                                variant={autoRefresh ? "default" : "outline"}
                                size="sm"
                                onClick={() => setAutoRefresh(!autoRefresh)}
                            >
                                {autoRefresh ? 'ON' : 'OFF'}
                            </Button>
                        </div>
                        
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchTruckLocations}
                            disabled={loading}
                        >
                            <RefreshCwIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>
                
                {/* Stats */}
                <div className="mt-4 flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Online: {trucks.filter(truck => truck.is_online).length}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Offline: {trucks.filter(truck => !truck.is_online).length}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <TruckIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Total: {trucks.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Truck List */}
            <div className="p-6">
                {trucks.length > 0 ? (
                    <div className="space-y-4">
                        {trucks.map((truck) => {
                            const lat = parseFloat(truck.location.latitude);
                            const lng = parseFloat(truck.location.longitude);
                            
                            return (
                                <div key={truck.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-3 h-3 rounded-full ${truck.is_online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">{truck.plate_number}</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{truck.model}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2">
                                            <Badge className={`text-xs ${getStatusColor(truck.status)}`}>
                                                {truck.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Location:</span>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {truck.location.address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`}
                                            </p>
                                        </div>
                                        
                                        {truck.driver && (
                                            <div>
                                                <span className="text-gray-600 dark:text-gray-400">Driver:</span>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">{truck.driver}</p>
                                            </div>
                                        )}
                                        
                                        {truck.movement.speed && (
                                            <div>
                                                <span className="text-gray-600 dark:text-gray-400">Speed:</span>
                                                <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                                                    <Gauge className="h-3 w-3 mr-1" />
                                                    {truck.movement.speed} km/h
                                                </p>
                                            </div>
                                        )}
                                        
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Last Update:</span>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                                                <ClockIcon className="h-3 w-3 mr-1" />
                                                {formatLastUpdate(truck.location.last_update)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <div className="text-center">
                            <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 dark:text-gray-400">No truck locations available</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

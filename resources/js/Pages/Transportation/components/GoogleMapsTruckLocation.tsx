import React, { useEffect, useState, useCallback } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
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

interface GoogleMapsTruckLocationProps {
    className?: string;
}

// Google Maps API Key - You'll need to replace this with your actual API key
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

// Map component
const MapComponent: React.FC<{ trucks: TruckLocation[] }> = ({ trucks }) => {
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

    useEffect(() => {
        const mapElement = document.getElementById('google-map');
        if (!mapElement) return;

        const mapInstance = new google.maps.Map(mapElement, {
            center: { lat: 14.5995, lng: 120.9842 }, // Default to Manila, Philippines
            zoom: 10,
            styles: [
                {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{ visibility: 'off' }]
                }
            ]
        });

        setMap(mapInstance);
    }, []);

    useEffect(() => {
        if (!map) return;

        // Clear existing markers
        markers.forEach(marker => marker.setMap(null));

        const newMarkers: google.maps.Marker[] = [];

        trucks.forEach(truck => {
            const lat = parseFloat(truck.location.latitude);
            const lng = parseFloat(truck.location.longitude);

            if (isNaN(lat) || isNaN(lng)) return;

            // Create custom truck icon
            const truckIcon = {
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="14" fill="${truck.is_online ? '#10B981' : '#6B7280'}" stroke="white" stroke-width="2"/>
                        <path d="M8 12h16v8H8z" fill="white"/>
                        <path d="M10 14h12v4H10z" fill="${truck.is_online ? '#10B981' : '#6B7280'}"/>
                        <circle cx="12" cy="22" r="2" fill="white"/>
                        <circle cx="20" cy="22" r="2" fill="white"/>
                    </svg>
                `)}`,
                scaledSize: new google.maps.Size(32, 32),
                anchor: new google.maps.Point(16, 16)
            };

            const marker = new google.maps.Marker({
                position: { lat, lng },
                map: map,
                icon: truckIcon,
                title: truck.plate_number
            });

            // Create info window content
            const infoWindowContent = `
                <div style="padding: 12px; min-width: 250px; font-family: system-ui, -apple-system, sans-serif;">
                    <div style="display: flex; align-items: center; margin-bottom: 12px;">
                        <div style="width: 20px; height: 20px; margin-right: 8px; color: #2563eb;">🚛</div>
                        <div>
                            <h4 style="margin: 0; font-weight: 600; color: #111827; font-size: 14px;">${truck.plate_number}</h4>
                            <p style="margin: 0; color: #6b7280; font-size: 12px;">${truck.model}</p>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 8px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <span style="color: #6b7280; font-size: 12px;">Status:</span>
                            <span style="padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; background-color: ${
                                truck.status === 'Available' ? '#dcfce7' : 
                                truck.status === 'In Transit' ? '#dbeafe' : 
                                truck.status === 'Maintenance' ? '#fef3c7' : '#f3f4f6'
                            }; color: ${
                                truck.status === 'Available' ? '#166534' : 
                                truck.status === 'In Transit' ? '#1e40af' : 
                                truck.status === 'Maintenance' ? '#92400e' : '#374151'
                            };">${truck.status}</span>
                        </div>
                        
                        ${truck.driver ? `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                <span style="color: #6b7280; font-size: 12px;">Driver:</span>
                                <span style="color: #111827; font-size: 12px; font-weight: 500;">${truck.driver}</span>
                            </div>
                        ` : ''}
                        
                        ${truck.movement.speed ? `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                <span style="color: #6b7280; font-size: 12px;">Speed:</span>
                                <span style="color: #111827; font-size: 12px; font-weight: 500;">${truck.movement.speed} km/h</span>
                            </div>
                        ` : ''}
                        
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <span style="color: #6b7280; font-size: 12px;">Last Update:</span>
                            <span style="color: #111827; font-size: 12px; font-weight: 500;">${formatLastUpdate(truck.location.last_update)}</span>
                        </div>
                        
                        ${truck.location.address ? `
                            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                                <p style="margin: 0; color: #6b7280; font-size: 11px;">${truck.location.address}</p>
                            </div>
                        ` : ''}
                        
                        <div style="display: flex; align-items: center; margin-top: 8px;">
                            <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${truck.is_online ? '#10B981' : '#6B7280'}; margin-right: 6px;"></div>
                            <span style="color: #6b7280; font-size: 11px;">${truck.is_online ? 'Online' : 'Offline'}</span>
                        </div>
                    </div>
                </div>
            `;

            const infoWindow = new google.maps.InfoWindow({
                content: infoWindowContent
            });

            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });

            newMarkers.push(marker);
        });

        setMarkers(newMarkers);

        // Fit bounds to show all trucks
        if (trucks.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            trucks.forEach(truck => {
                const lat = parseFloat(truck.location.latitude);
                const lng = parseFloat(truck.location.longitude);
                if (!isNaN(lat) && !isNaN(lng)) {
                    bounds.extend({ lat, lng });
                }
            });
            map.fitBounds(bounds);
        }
    }, [map, trucks]);

    return <div id="google-map" style={{ width: '100%', height: '100%' }} />;
};

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

// Loading component
const LoadingComponent = () => (
    <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
        </div>
    </div>
);

// Error component
const ErrorComponent = ({ error }: { error: Error }) => (
    <div className="flex items-center justify-center h-96 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <div className="text-center">
            <div className="text-red-500 text-4xl mb-2">⚠️</div>
            <p className="text-red-600 dark:text-red-400 font-medium">Failed to load map</p>
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">{error.message}</p>
        </div>
    </div>
);

// Render function for Wrapper
const renderWrapper = (status: Status) => {
    switch (status) {
        case Status.LOADING:
            return <LoadingComponent />;
        case Status.FAILURE:
            return <ErrorComponent error={new Error('Failed to load Google Maps')} />;
        case Status.SUCCESS:
            return <div />; // This will be replaced by MapComponent
        default:
            return <LoadingComponent />;
    }
};

export default function GoogleMapsTruckLocation({ className = '' }: GoogleMapsTruckLocationProps) {
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

            {/* Map */}
            <div className="h-96">
                {trucks.length > 0 ? (
                    <Wrapper apiKey={GOOGLE_MAPS_API_KEY} render={renderWrapper}>
                        <MapComponent trucks={trucks} />
                    </Wrapper>
                ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-700 rounded-lg">
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

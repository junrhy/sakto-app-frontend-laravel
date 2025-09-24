import { Button } from '@/Components/ui/button';
import axios from 'axios';
import { MapPinIcon, RefreshCwIcon, TruckIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

// Types
interface CurrentShipment {
    id: number;
    origin: string;
    destination: string;
    status: string;
    cargo?: string;
    weight?: number;
    departure_date?: string;
    arrival_date?: string;
}

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
    current_shipment?: CurrentShipment | null;
}

interface OpenStreetMapTruckLocationProps {
    className?: string;
}

// Helper function to format last update time
const formatLastUpdate = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

// Helper function to get status color
const getStatusColor = (status: string): string => {
    switch (status) {
        case 'Available':
            return 'text-green-600 bg-green-100';
        case 'In Transit':
            return 'text-blue-600 bg-blue-100';
        case 'Maintenance':
            return 'text-yellow-600 bg-yellow-100';
        default:
            return 'text-gray-600 bg-gray-100';
    }
};

export default function OpenStreetMapTruckLocation({
    className = '',
}: OpenStreetMapTruckLocationProps) {
    const [trucks, setTrucks] = useState<TruckLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const [selectedTruck, setSelectedTruck] = useState<number | null>(null);

    const focusOnTruck = useCallback(
        async (truckId: number) => {
            if (!mapInstanceRef.current) return;

            const truck = trucks.find((t) => t.id === truckId);
            if (!truck) return;

            const lat = parseFloat(truck.location.latitude);
            const lng = parseFloat(truck.location.longitude);

            if (isNaN(lat) || isNaN(lng)) return;

            const L = await import('leaflet');
            mapInstanceRef.current.setView([lat, lng], 15);
            setSelectedTruck(truckId);
        },
        [trucks],
    );

    const fetchTruckLocations = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                '/transportation/fleet/real-time-locations',
            );
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

    // Initialize map when map container is available
    useEffect(() => {
        console.log('Map useEffect triggered', {
            mapRef: mapRef.current,
            mapInstance: mapInstanceRef.current,
        });

        if (mapInstanceRef.current) {
            console.log('Skipping map init - already exists');
            return;
        }

        // Wait for the DOM element to be available
        const initMapWhenReady = () => {
            if (!mapRef.current) {
                console.log('Map ref not ready, retrying...');
                setTimeout(initMapWhenReady, 100);
                return;
            }

            console.log('Map ref is ready, initializing...');

            // Dynamically import Leaflet to avoid SSR issues
            const initMap = async () => {
                try {
                    console.log('Starting map initialization...');
                    const L = await import('leaflet');
                    console.log('Leaflet imported successfully');

                    // Fix for default markers
                    delete (L.Icon.Default.prototype as any)._getIconUrl;
                    L.Icon.Default.mergeOptions({
                        iconRetinaUrl:
                            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                        iconUrl:
                            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                        shadowUrl:
                            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                    });

                    console.log('Creating map instance...');
                    const map = L.map(mapRef.current!, {
                        scrollWheelZoom: false,
                    }).setView([14.5995, 120.9842], 10); // Default to Manila, Philippines

                    console.log('Adding tile layer...');
                    L.tileLayer(
                        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
                        {
                            attribution:
                                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                            subdomains: 'abcd',
                            maxZoom: 20,
                        },
                    ).addTo(map);

                    mapInstanceRef.current = map;
                    console.log('Map initialized successfully!');

                    // If trucks are already loaded, focus on them
                    if (trucks.length > 0) {
                        console.log(
                            'Trucks already loaded, focusing on them...',
                        );
                        setTimeout(() => {
                            const bounds = L.latLngBounds([]);
                            let hasValidBounds = false;

                            trucks.forEach((truck) => {
                                const lat = parseFloat(truck.location.latitude);
                                const lng = parseFloat(
                                    truck.location.longitude,
                                );
                                if (!isNaN(lat) && !isNaN(lng)) {
                                    bounds.extend([lat, lng]);
                                    hasValidBounds = true;
                                }
                            });

                            if (hasValidBounds) {
                                map.fitBounds(bounds, { padding: [20, 20] });
                                console.log('Map focused on trucks');
                            }
                        }, 100);
                    }
                } catch (error) {
                    console.error('Error initializing map:', error);
                }
            };

            initMap();
        };

        initMapWhenReady();

        // Cleanup function
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Update markers when trucks change
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        const updateMarkers = async () => {
            const L = await import('leaflet');

            // Clear existing markers
            markersRef.current.forEach((marker) => {
                mapInstanceRef.current.removeLayer(marker);
            });
            markersRef.current = [];

            const bounds = L.latLngBounds([]);
            let hasValidBounds = false;

            trucks.forEach((truck) => {
                const lat = parseFloat(truck.location.latitude);
                const lng = parseFloat(truck.location.longitude);

                if (isNaN(lat) || isNaN(lng)) return;

                // Create custom truck icon
                const truckIcon = L.divIcon({
                    html: `
                        <div style="
                            width: 36px; 
                            height: 36px; 
                            background-color: #9CA3AF; 
                            border: 2px solid white; 
                            border-radius: 50%; 
                            display: flex; 
                            align-items: center; 
                            justify-content: center; 
                            font-size: 18px;
                            padding: 4px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                        ">
                            🚛
                        </div>
                    `,
                    className: 'custom-truck-icon',
                    iconSize: [40, 40],
                    iconAnchor: [20, 20],
                });

                const marker = L.marker([lat, lng], { icon: truckIcon }).addTo(
                    mapInstanceRef.current,
                );

                // Create popup content
                const popupContent = `
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
                                    truck.status === 'Available'
                                        ? '#dcfce7'
                                        : truck.status === 'In Transit'
                                          ? '#dbeafe'
                                          : truck.status === 'Maintenance'
                                            ? '#fef3c7'
                                            : '#f3f4f6'
                                }; color: ${
                                    truck.status === 'Available'
                                        ? '#166534'
                                        : truck.status === 'In Transit'
                                          ? '#1e40af'
                                          : truck.status === 'Maintenance'
                                            ? '#92400e'
                                            : '#374151'
                                };">${truck.status}</span>
                            </div>
                            
                            ${
                                truck.driver
                                    ? `
                                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                    <span style="color: #6b7280; font-size: 12px;">Driver:</span>
                                    <span style="color: #111827; font-size: 12px; font-weight: 500;">${truck.driver}</span>
                                </div>
                            `
                                    : ''
                            }
                            
                            ${
                                truck.movement.speed
                                    ? `
                                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                    <span style="color: #6b7280; font-size: 12px;">Speed:</span>
                                    <span style="color: #111827; font-size: 12px; font-weight: 500;">${truck.movement.speed} km/h</span>
                                </div>
                            `
                                    : ''
                            }
                            
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                <span style="color: #6b7280; font-size: 12px;">Last Update:</span>
                                <span style="color: #111827; font-size: 12px; font-weight: 500;">${formatLastUpdate(truck.location.last_update)}</span>
                            </div>
                            
                            ${
                                truck.current_shipment
                                    ? `
                                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                                    <div style="display: flex; align-items: center; margin-bottom: 8px;">
                                        <div style="width: 16px; height: 16px; margin-right: 6px; color: #059669;">📦</div>
                                        <span style="color: #111827; font-size: 12px; font-weight: 600;">Current Shipment</span>
                                    </div>
                                    
                                    <div style="margin-bottom: 6px;">
                                        <div style="display: flex; align-items: center; margin-bottom: 4px;">
                                            <div style="width: 12px; height: 12px; margin-right: 6px; color: #dc2626;">📍</div>
                                            <span style="color: #6b7280; font-size: 11px; font-weight: 500;">Origin:</span>
                                        </div>
                                        <p style="margin: 0 0 8px 18px; color: #111827; font-size: 11px; line-height: 1.4;">${truck.current_shipment.origin}</p>
                                    </div>
                                    
                                    <div style="margin-bottom: 6px;">
                                        <div style="display: flex; align-items: center; margin-bottom: 4px;">
                                            <div style="width: 12px; height: 12px; margin-right: 6px; color: #059669;">🎯</div>
                                            <span style="color: #6b7280; font-size: 11px; font-weight: 500;">Destination:</span>
                                        </div>
                                        <p style="margin: 0 0 8px 18px; color: #111827; font-size: 11px; line-height: 1.4;">${truck.current_shipment.destination}</p>
                                    </div>
                                    
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                        <span style="color: #6b7280; font-size: 11px;">Shipment Status:</span>
                                        <span style="padding: 1px 6px; border-radius: 8px; font-size: 10px; font-weight: 500; background-color: ${
                                            truck.current_shipment.status ===
                                            'Scheduled'
                                                ? '#fef3c7'
                                                : truck.current_shipment
                                                        .status === 'In Transit'
                                                  ? '#dbeafe'
                                                  : '#f3f4f6'
                                        }; color: ${
                                            truck.current_shipment.status ===
                                            'Scheduled'
                                                ? '#92400e'
                                                : truck.current_shipment
                                                        .status === 'In Transit'
                                                  ? '#1e40af'
                                                  : '#374151'
                                        };">${truck.current_shipment.status}</span>
                                    </div>
                                    
                                    ${
                                        truck.current_shipment.cargo
                                            ? `
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                            <span style="color: #6b7280; font-size: 11px;">Cargo:</span>
                                            <span style="color: #111827; font-size: 11px; font-weight: 500;">${truck.current_shipment.cargo}</span>
                                        </div>
                                    `
                                            : ''
                                    }
                                    
                                    ${
                                        truck.current_shipment.weight
                                            ? `
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                            <span style="color: #6b7280; font-size: 11px;">Weight:</span>
                                            <span style="color: #111827; font-size: 11px; font-weight: 500;">${truck.current_shipment.weight} kg</span>
                                        </div>
                                    `
                                            : ''
                                    }
                                </div>
                            `
                                    : ''
                            }
                            
                            ${
                                truck.location.address
                                    ? `
                                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                                    <p style="margin: 0; color: #6b7280; font-size: 11px;">${truck.location.address}</p>
                                </div>
                            `
                                    : ''
                            }
                            
                            <div style="display: flex; align-items: center; margin-top: 8px;">
                                <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${truck.is_online ? '#10B981' : '#6B7280'}; margin-right: 6px;"></div>
                                <span style="color: #6b7280; font-size: 11px;">${truck.is_online ? 'Online' : 'Offline'}</span>
                            </div>
                        </div>
                    </div>
                `;

                marker.bindPopup(popupContent);
                markersRef.current.push(marker);
                bounds.extend([lat, lng]);
                hasValidBounds = true;
            });

            // Fit map to show all trucks
            if (hasValidBounds) {
                mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
            }
        };

        updateMarkers();
    }, [trucks]);

    if (loading && trucks.length === 0) {
        return (
            <div
                className={`rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`}
            >
                <div className="flex h-64 items-center justify-center">
                    <div className="text-center">
                        <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                        <p className="text-gray-500 dark:text-gray-400">
                            Loading truck locations...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && trucks.length === 0) {
        return (
            <div
                className={`rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`}
            >
                <div className="flex h-64 items-center justify-center">
                    <div className="text-center">
                        <div className="mb-2 text-4xl text-red-500">⚠️</div>
                        <p className="font-medium text-red-600 dark:text-red-400">
                            Failed to load truck locations
                        </p>
                        <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                            {error}
                        </p>
                        <Button
                            onClick={fetchTruckLocations}
                            variant="outline"
                            size="sm"
                            className="mt-3"
                        >
                            <RefreshCwIcon className="mr-2 h-4 w-4" />
                            Retry
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`}
        >
            {/* Header */}
            <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/50">
                            <MapPinIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Live Truck Tracking
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Real-time location of your fleet vehicles
                                (OpenStreetMap)
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Auto-refresh:
                            </span>
                            <Button
                                variant={autoRefresh ? 'default' : 'outline'}
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
                            <RefreshCwIcon
                                className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                            />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-4 flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Online:{' '}
                            {trucks.filter((truck) => truck.is_online).length}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="h-3 w-3 rounded-full bg-gray-400"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Offline:{' '}
                            {trucks.filter((truck) => !truck.is_online).length}
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

            {/* Main Content */}
            <div className="flex h-[600px]">
                {/* Sidebar */}
                <div className="w-80 border-r border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
                    <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            Truck List
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {trucks.length} vehicles
                        </p>
                    </div>

                    <div className="h-full overflow-y-auto">
                        {trucks.map((truck) => (
                            <div
                                key={truck.id}
                                onClick={() => focusOnTruck(truck.id)}
                                className={`cursor-pointer border-b border-gray-200 p-4 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 ${
                                    selectedTruck === truck.id
                                        ? 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : ''
                                }`}
                            >
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div
                                            className={`h-3 w-3 rounded-full ${
                                                truck.is_online
                                                    ? 'bg-green-500'
                                                    : 'bg-gray-400'
                                            }`}
                                        ></div>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            {truck.plate_number}
                                        </span>
                                    </div>
                                    <div
                                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                                            truck.is_online
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                                        }`}
                                    >
                                        {truck.is_online ? 'Online' : 'Offline'}
                                    </div>
                                </div>

                                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex justify-between">
                                        <span>Driver:</span>
                                        <span className="font-medium">
                                            {truck.driver || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Status:</span>
                                        <span className="font-medium">
                                            {truck.status}
                                        </span>
                                    </div>
                                    {truck.movement.speed && (
                                        <div className="flex justify-between">
                                            <span>Speed:</span>
                                            <span className="font-medium">
                                                {truck.movement.speed} km/h
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span>Last Update:</span>
                                        <span className="text-xs font-medium">
                                            {formatLastUpdate(
                                                truck.location.last_update,
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {truck.current_shipment && (
                                    <div className="mt-2 rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
                                        <div className="mb-2 flex items-center">
                                            <span className="mr-2 text-sm text-green-600">
                                                📦
                                            </span>
                                            <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                                                Current Shipment
                                            </span>
                                        </div>
                                        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                                            <div className="flex items-start">
                                                <span className="mr-2 mt-0.5 text-xs text-red-500">
                                                    📍
                                                </span>
                                                <div className="flex-1">
                                                    <span className="text-gray-500 dark:text-gray-400">
                                                        From:
                                                    </span>
                                                    <p className="font-medium leading-tight text-gray-700 dark:text-gray-200">
                                                        {
                                                            truck
                                                                .current_shipment
                                                                .origin
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start">
                                                <span className="mr-2 mt-0.5 text-xs text-green-500">
                                                    🎯
                                                </span>
                                                <div className="flex-1">
                                                    <span className="text-gray-500 dark:text-gray-400">
                                                        To:
                                                    </span>
                                                    <p className="font-medium leading-tight text-gray-700 dark:text-gray-200">
                                                        {
                                                            truck
                                                                .current_shipment
                                                                .destination
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between border-t border-blue-200 pt-1 dark:border-blue-700">
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    Status:
                                                </span>
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                        truck.current_shipment
                                                            .status ===
                                                        'Scheduled'
                                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                            : truck
                                                                    .current_shipment
                                                                    .status ===
                                                                'In Transit'
                                                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                                                    }`}
                                                >
                                                    {
                                                        truck.current_shipment
                                                            .status
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {truck.location.address && (
                                    <div className="mt-2 truncate text-xs text-gray-500 dark:text-gray-400">
                                        📍 {truck.location.address}
                                    </div>
                                )}
                            </div>
                        ))}

                        {trucks.length === 0 && (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                <TruckIcon className="mx-auto mb-2 h-12 w-12 opacity-50" />
                                <p>No trucks available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Map */}
                <div className="flex-1">
                    <div
                        ref={mapRef}
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>
            </div>
        </div>
    );
}

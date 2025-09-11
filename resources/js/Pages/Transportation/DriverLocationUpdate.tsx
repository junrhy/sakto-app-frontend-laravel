import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { MapPinIcon, ClockIcon, NavigationIcon, Gauge, RefreshCwIcon, CheckCircleIcon, AlertCircleIcon, ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import axios from 'axios';

interface Truck {
    id: number;
    plate_number: string;
    model: string;
    status: string;
    driver?: string;
    current_latitude?: number;
    current_longitude?: number;
    last_location_update?: string;
    current_address?: string;
    speed?: number;
    heading?: number;
}

interface LocationUpdateData {
    latitude: string;
    longitude: string;
    address?: string;
    speed?: string;
    heading?: string;
}

export default function DriverLocationUpdate() {
    const { identifier } = usePage().props as any;
    const [trucks, setTrucks] = useState<Truck[]>([]);
    const [selectedTruck, setSelectedTruck] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [currentStep, setCurrentStep] = useState<'truck-selection' | 'location-update'>('truck-selection');
    const [locationData, setLocationData] = useState<LocationUpdateData>({
        latitude: '',
        longitude: '',
        address: '',
        speed: '',
        heading: ''
    });

    // Fetch available trucks
    const fetchTrucks = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/driver/trucks', {
                params: { client_identifier: identifier }
            });
            setTrucks(response.data);
        } catch (error) {
            console.error('Error fetching trucks:', error);
            setMessage({ type: 'error', text: 'Failed to load trucks' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrucks();
    }, []);

    // Get current location using browser geolocation
    const getCurrentLocation = () => {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            setMessage({ 
                type: 'error', 
                text: 'Geolocation is not supported by this browser. Please enter coordinates manually.' 
            });
            return;
        }

        // Check if we're on HTTPS or localhost
        if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
            setMessage({ 
                type: 'error', 
                text: 'Location access requires HTTPS. Please enter coordinates manually or use HTTPS.' 
            });
            return;
        }

        setMessage({ type: 'success', text: 'Getting your current location...' });

        // Try with high accuracy first, then fallback to lower accuracy
        const tryGetLocation = (options: PositionOptions, attempt: number = 1) => {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude.toString();
                    const lng = position.coords.longitude.toString();
                    
                    setLocationData(prev => ({
                        ...prev,
                        latitude: lat,
                        longitude: lng
                    }));

                    // Try to get address using reverse geocoding
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
                            {
                                headers: {
                                    'User-Agent': 'SaktoApp/1.0'
                                }
                            }
                        );
                        
                        if (response.ok) {
                            const data = await response.json();
                            if (data.display_name) {
                                setLocationData(prev => ({
                                    ...prev,
                                    address: data.display_name
                                }));
                            }
                        }
                    } catch (error) {
                        console.log('Could not get address:', error);
                        // Don't show error for address lookup failure
                    }

                    setMessage({ type: 'success', text: 'Location obtained successfully!' });
                },
                (error) => {
                    // If high accuracy fails and this is the first attempt, try with lower accuracy
                    if (attempt === 1 && options.enableHighAccuracy) {
                        console.log('High accuracy failed, trying with lower accuracy...');
                        tryGetLocation({
                            enableHighAccuracy: false,
                            timeout: 15000,
                            maximumAge: 300000
                        }, 2);
                        return;
                    }

                    let errorMessage = 'Unable to get your current location. ';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage += 'Please allow location access in your browser settings and try again.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage += 'Location information is unavailable. Please check your GPS/WiFi settings.';
                            break;
                        case error.TIMEOUT:
                            errorMessage += 'Location request timed out. Please try again.';
                            break;
                        default:
                            errorMessage += 'An unknown error occurred. Please try again or enter coordinates manually.';
                            break;
                    }
                    setMessage({ type: 'error', text: errorMessage });
                },
                options
            );
        };

        // Start with high accuracy
        tryGetLocation({
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
        });
    };

    // Update truck location
    const updateLocation = async () => {
        if (!selectedTruck) {
            setMessage({ type: 'error', text: 'Please select a truck' });
            return;
        }

        if (!locationData.latitude || !locationData.longitude) {
            setMessage({ type: 'error', text: 'Please enter coordinates or get current location' });
            return;
        }

        try {
            setUpdating(true);
            setMessage(null);

            const updateData = {
                latitude: parseFloat(locationData.latitude),
                longitude: parseFloat(locationData.longitude),
                address: locationData.address || '',
                speed: locationData.speed ? parseFloat(locationData.speed) : null,
                heading: locationData.heading ? parseFloat(locationData.heading) : null
            };

            await axios.post(`/driver/trucks/${selectedTruck}/location`, {
                ...updateData,
                client_identifier: identifier
            });

            setMessage({ type: 'success', text: 'Location updated successfully!' });
            
            // Clear form
            setLocationData({
                latitude: '',
                longitude: '',
                address: '',
                speed: '',
                heading: ''
            });

            // Refresh trucks list
            fetchTrucks();

        } catch (error: any) {
            console.error('Error updating location:', error);
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Failed to update location' 
            });
        } finally {
            setUpdating(false);
        }
    };

    const selectedTruckData = trucks.find(truck => truck.id === selectedTruck);

    // Handle truck selection and move to next step
    const handleTruckSelection = (truckId: number) => {
        setSelectedTruck(truckId);
        setCurrentStep('location-update');
    };

    // Go back to truck selection
    const goBackToTruckSelection = () => {
        setCurrentStep('truck-selection');
        setSelectedTruck(null);
        setLocationData({
            latitude: '',
            longitude: '',
            address: '',
            speed: '',
            heading: ''
        });
        setMessage(null);
    };

    return (
        <>
            <Head title="Driver Location Update" />
            
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
                <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-6 sm:mb-8">
                        <div className="flex items-center justify-center mb-3 sm:mb-4">
                            <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                                <MapPinIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Driver Location Update
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2 px-2">
                            Update your truck's current location and status
                        </p>
                    </div>

                    {/* Message Alert */}
                    {message && (
                        <Alert className={`mb-4 sm:mb-6 mx-1 sm:mx-0 ${message.type === 'error' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'}`}>
                            {message.type === 'error' ? (
                                <AlertCircleIcon className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                            ) : (
                                <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                            )}
                            <AlertDescription className={`${message.type === 'error' ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'} text-sm sm:text-base`}>
                                {message.text}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Single Card Container */}
                    <Card className="mx-1 sm:mx-0">
                        <CardHeader className="pb-3 sm:pb-6">
                            <CardTitle className="flex items-center text-lg sm:text-xl">
                                {currentStep === 'location-update' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={goBackToTruckSelection}
                                        className="mr-2 p-1 h-8 w-8"
                                    >
                                        <ArrowLeftIcon className="h-4 w-4" />
                                    </Button>
                                )}
                                <NavigationIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                {currentStep === 'truck-selection' ? 'Select Truck' : 'Update Location'}
                            </CardTitle>
                            <CardDescription className="text-sm sm:text-base">
                                {currentStep === 'truck-selection' 
                                    ? 'Choose the truck you\'re driving to update its location'
                                    : (
                                        <div className="text-center">
                                            <div className="font-bold text-3xl sm:text-4xl text-blue-600 dark:text-blue-400">{selectedTruckData?.plate_number}</div>
                                        </div>
                                    )
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-0">
                            {/* Truck Selection Step */}
                            {currentStep === 'truck-selection' && (
                                <div>
                                    {loading ? (
                                        <div className="flex items-center justify-center py-6 sm:py-8">
                                            <RefreshCwIcon className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-blue-600" />
                                            <span className="ml-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading trucks...</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 sm:space-y-3">
                                            {trucks.map((truck) => (
                                                <div
                                                    key={truck.id}
                                                    onClick={() => handleTruckSelection(truck.id)}
                                                    className="p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors touch-manipulation border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-gray-100 truncate mb-1">
                                                                {truck.plate_number}
                                                            </h4>
                                                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                                                {truck.model} • {truck.driver || 'No driver assigned'}
                                                            </p>
                                                        </div>
                                                        <Badge variant={truck.status === 'Available' ? 'default' : 'secondary'} className="ml-2 flex-shrink-0 text-xs">
                                                            {truck.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Location Update Step */}
                            {currentStep === 'location-update' && (
                                <div>
                                    {/* Current Location Button */}
                                    <div className="mb-4">
                                        <Button
                                            onClick={getCurrentLocation}
                                            variant="outline"
                                            className="w-full h-11 sm:h-10 text-sm sm:text-base touch-manipulation"
                                            disabled={updating}
                                        >
                                            <MapPinIcon className="h-4 w-4 mr-2" />
                                            Get Current Location
                                        </Button>
                                    </div>

                                    {/* Coordinates */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                                        <div>
                                            <Label htmlFor="latitude" className="text-sm sm:text-base">Latitude</Label>
                                            <Input
                                                id="latitude"
                                                type="number"
                                                step="any"
                                                placeholder="e.g., 14.5995"
                                                value={locationData.latitude}
                                                onChange={(e) => setLocationData(prev => ({ ...prev, latitude: e.target.value }))}
                                                disabled={updating}
                                                className="h-11 sm:h-10 text-sm sm:text-base"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="longitude" className="text-sm sm:text-base">Longitude</Label>
                                            <Input
                                                id="longitude"
                                                type="number"
                                                step="any"
                                                placeholder="e.g., 120.9842"
                                                value={locationData.longitude}
                                                onChange={(e) => setLocationData(prev => ({ ...prev, longitude: e.target.value }))}
                                                disabled={updating}
                                                className="h-11 sm:h-10 text-sm sm:text-base"
                                            />
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="mb-4">
                                        <Label htmlFor="address" className="text-sm sm:text-base">Address (Optional)</Label>
                                        <Input
                                            id="address"
                                            placeholder="Enter address or leave blank for auto-detection"
                                            value={locationData.address}
                                            onChange={(e) => setLocationData(prev => ({ ...prev, address: e.target.value }))}
                                            disabled={updating}
                                            className="h-11 sm:h-10 text-sm sm:text-base"
                                        />
                                    </div>

                                    {/* Speed and Heading */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                                        <div>
                                            <Label htmlFor="speed" className="text-sm sm:text-base">Speed (km/h)</Label>
                                            <Input
                                                id="speed"
                                                type="number"
                                                placeholder="e.g., 60"
                                                value={locationData.speed}
                                                onChange={(e) => setLocationData(prev => ({ ...prev, speed: e.target.value }))}
                                                disabled={updating}
                                                className="h-11 sm:h-10 text-sm sm:text-base"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="heading" className="text-sm sm:text-base">Heading (degrees)</Label>
                                            <Input
                                                id="heading"
                                                type="number"
                                                placeholder="e.g., 45"
                                                value={locationData.heading}
                                                onChange={(e) => setLocationData(prev => ({ ...prev, heading: e.target.value }))}
                                                disabled={updating}
                                                className="h-11 sm:h-10 text-sm sm:text-base"
                                            />
                                        </div>
                                    </div>

                                    {/* Update Button */}
                                    <Button
                                        onClick={updateLocation}
                                        className="w-full h-12 sm:h-10 text-sm sm:text-base touch-manipulation font-medium"
                                        disabled={updating || !locationData.latitude || !locationData.longitude}
                                    >
                                        {updating ? (
                                            <>
                                                <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircleIcon className="h-4 w-4 mr-2" />
                                                Update Location
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </div>
        </>
    );
}

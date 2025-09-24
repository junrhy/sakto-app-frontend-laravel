import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    AlertCircleIcon,
    ArrowLeftIcon,
    CheckCircleIcon,
    ClockIcon,
    MapPinIcon,
    NavigationIcon,
    RefreshCwIcon,
    SmartphoneIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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

interface SensorData {
    acceleration: {
        x: number;
        y: number;
        z: number;
    };
    rotationRate: {
        alpha: number;
        beta: number;
        gamma: number;
    };
    orientation: {
        alpha: number; // compass heading (0-360)
        beta: number; // front-to-back tilt
        gamma: number; // left-to-right tilt
    };
}

interface CalibrationData {
    isCalibrated: boolean;
    stationaryAcceleration: {
        x: number;
        y: number;
        z: number;
    };
    baselineOrientation: {
        alpha: number;
        beta: number;
        gamma: number;
    };
}

export default function DriverLocationUpdate() {
    const { identifier } = usePage().props as any;
    const [trucks, setTrucks] = useState<Truck[]>([]);
    const [selectedTruck, setSelectedTruck] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);
    const [currentStep, setCurrentStep] = useState<
        'truck-selection' | 'location-update'
    >('truck-selection');
    const [locationData, setLocationData] = useState<LocationUpdateData>({
        latitude: '',
        longitude: '',
        address: '',
        speed: '',
        heading: '',
    });

    // Sensor-related state
    const [sensorData, setSensorData] = useState<SensorData | null>(null);
    const [calibrationData, setCalibrationData] = useState<CalibrationData>({
        isCalibrated: false,
        stationaryAcceleration: { x: 0, y: 0, z: 0 },
        baselineOrientation: { alpha: 0, beta: 0, gamma: 0 },
    });
    const [isSensorActive, setIsSensorActive] = useState(false);
    const [sensorSupported, setSensorSupported] = useState(false);
    const [estimatedSpeed, setEstimatedSpeed] = useState<number>(0);
    const [estimatedHeading, setEstimatedHeading] = useState<number>(0);

    // Refs for sensor data processing
    const lastAccelerationRef = useRef<{
        x: number;
        y: number;
        z: number;
    } | null>(null);
    const lastTimestampRef = useRef<number | null>(null);
    const velocityRef = useRef<{ x: number; y: number; z: number }>({
        x: 0,
        y: 0,
        z: 0,
    });

    // Fetch available trucks
    const fetchTrucks = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/driver/trucks', {
                params: { client_identifier: identifier },
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
        checkSensorSupport();

        // Cleanup sensor listeners on unmount
        return () => {
            if (isSensorActive) {
                window.removeEventListener(
                    'devicemotion',
                    handleDeviceMotion,
                    true,
                );
                window.removeEventListener(
                    'deviceorientation',
                    handleDeviceOrientation,
                    true,
                );
            }
        };
    }, []);

    // Automatically update location data when sensor readings change
    useEffect(() => {
        updateLocationDataWithSensors();
    }, [
        estimatedSpeed,
        estimatedHeading,
        calibrationData.isCalibrated,
        isSensorActive,
    ]);

    // Auto-submit when all data is available
    useEffect(() => {
        const shouldAutoSubmit =
            locationData.latitude &&
            locationData.longitude &&
            calibrationData.isCalibrated &&
            isSensorActive &&
            !updating;

        if (shouldAutoSubmit) {
            // Initial submission after 2 seconds
            const initialTimer = setTimeout(() => {
                updateLocation();
            }, 2000);

            // Then submit every 30 seconds for continuous updates
            const intervalTimer = setInterval(() => {
                if (
                    locationData.latitude &&
                    locationData.longitude &&
                    !updating
                ) {
                    updateLocation();
                }
            }, 30000); // 30 seconds interval

            return () => {
                clearTimeout(initialTimer);
                clearInterval(intervalTimer);
            };
        }
    }, [
        locationData.latitude,
        locationData.longitude,
        calibrationData.isCalibrated,
        isSensorActive,
        updating,
    ]);

    // Check if device motion and orientation sensors are supported
    const checkSensorSupport = () => {
        const motionSupported = 'DeviceMotionEvent' in window;
        const orientationSupported = 'DeviceOrientationEvent' in window;
        setSensorSupported(motionSupported && orientationSupported);
    };

    // Calibrate sensors when vehicle is stationary
    const calibrateSensors = () => {
        if (!sensorData) return;

        setCalibrationData({
            isCalibrated: true,
            stationaryAcceleration: {
                x: sensorData.acceleration.x,
                y: sensorData.acceleration.y,
                z: sensorData.acceleration.z,
            },
            baselineOrientation: {
                alpha: sensorData.orientation.alpha,
                beta: sensorData.orientation.beta,
                gamma: sensorData.orientation.gamma,
            },
        });

        // Reset velocity calculations
        velocityRef.current = { x: 0, y: 0, z: 0 };
        lastAccelerationRef.current = null;
        lastTimestampRef.current = null;

        setMessage({
            type: 'success',
            text: 'Sensors calibrated successfully! Please keep your phone stable during calibration.',
        });
    };

    // Calculate speed from accelerometer data
    const calculateSpeed = (
        acceleration: { x: number; y: number; z: number },
        timestamp: number,
    ) => {
        if (
            !calibrationData.isCalibrated ||
            !lastAccelerationRef.current ||
            !lastTimestampRef.current
        ) {
            return 0;
        }

        const dt = (timestamp - lastTimestampRef.current) / 1000; // Convert to seconds
        if (dt <= 0) return estimatedSpeed;

        // Remove gravity and calibration bias
        const calibratedAccel = {
            x: acceleration.x - calibrationData.stationaryAcceleration.x,
            y: acceleration.y - calibrationData.stationaryAcceleration.y,
            z: acceleration.z - calibrationData.stationaryAcceleration.z,
        };

        // Integrate acceleration to get velocity change
        const deltaV = {
            x: calibratedAccel.x * dt,
            y: calibratedAccel.y * dt,
            z: calibratedAccel.z * dt,
        };

        // Update velocity
        velocityRef.current.x += deltaV.x;
        velocityRef.current.y += deltaV.y;
        velocityRef.current.z += deltaV.z;

        // Calculate speed magnitude (in m/s)
        const speed = Math.sqrt(
            velocityRef.current.x ** 2 +
                velocityRef.current.y ** 2 +
                velocityRef.current.z ** 2,
        );

        // Convert to km/h
        return speed * 3.6;
    };

    // Calculate heading from orientation data
    const calculateHeading = (orientation: {
        alpha: number;
        beta: number;
        gamma: number;
    }) => {
        if (!calibrationData.isCalibrated) return 0;

        // Use the alpha value (compass heading) and adjust for calibration
        let heading =
            orientation.alpha - calibrationData.baselineOrientation.alpha;

        // Normalize to 0-360 degrees
        while (heading < 0) heading += 360;
        while (heading >= 360) heading -= 360;

        return heading;
    };

    // Handle device motion events
    const handleDeviceMotion = (event: DeviceMotionEvent) => {
        if (!event.acceleration || !event.rotationRate) return;

        const timestamp = Date.now();
        const acceleration = {
            x: event.acceleration.x || 0,
            y: event.acceleration.y || 0,
            z: event.acceleration.z || 0,
        };

        const rotationRate = {
            alpha: event.rotationRate.alpha || 0,
            beta: event.rotationRate.beta || 0,
            gamma: event.rotationRate.gamma || 0,
        };

        // Calculate speed
        const speed = calculateSpeed(acceleration, timestamp);
        setEstimatedSpeed(speed);

        // Update sensor data
        setSensorData((prev) => ({
            acceleration,
            rotationRate,
            orientation: prev?.orientation || { alpha: 0, beta: 0, gamma: 0 },
        }));

        // Update refs for next calculation
        lastAccelerationRef.current = acceleration;
        lastTimestampRef.current = timestamp;
    };

    // Handle device orientation events
    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
        if (event.alpha === null || event.beta === null || event.gamma === null)
            return;

        const orientation = {
            alpha: event.alpha,
            beta: event.beta,
            gamma: event.gamma,
        };

        // Calculate heading
        const heading = calculateHeading(orientation);
        setEstimatedHeading(heading);

        // Update sensor data
        setSensorData((prev) => ({
            acceleration: prev?.acceleration || { x: 0, y: 0, z: 0 },
            rotationRate: prev?.rotationRate || { alpha: 0, beta: 0, gamma: 0 },
            orientation,
        }));
    };

    // Start sensor monitoring
    const startSensorMonitoring = () => {
        if (!sensorSupported) {
            setMessage({
                type: 'error',
                text: 'Device sensors are not supported on this device.',
            });
            return;
        }

        // Request permission for iOS 13+
        if (
            typeof (DeviceMotionEvent as any).requestPermission === 'function'
        ) {
            (DeviceMotionEvent as any)
                .requestPermission()
                .then((response: string) => {
                    if (response === 'granted') {
                        setupSensorListeners();
                    } else {
                        setMessage({
                            type: 'error',
                            text: 'Permission denied for device motion sensors.',
                        });
                    }
                });
        } else {
            setupSensorListeners();
        }
    };

    // Setup sensor event listeners
    const setupSensorListeners = () => {
        window.addEventListener('devicemotion', handleDeviceMotion, true);
        window.addEventListener(
            'deviceorientation',
            handleDeviceOrientation,
            true,
        );
        setIsSensorActive(true);
        setMessage({
            type: 'success',
            text: 'Sensor monitoring started. Please calibrate when stationary.',
        });
    };

    // Stop sensor monitoring
    const stopSensorMonitoring = () => {
        window.removeEventListener('devicemotion', handleDeviceMotion, true);
        window.removeEventListener(
            'deviceorientation',
            handleDeviceOrientation,
            true,
        );
        setIsSensorActive(false);
        setSensorData(null);
        setEstimatedSpeed(0);
        setEstimatedHeading(0);
        setMessage({ type: 'success', text: 'Sensor monitoring stopped.' });
    };

    // Automatically update location data with sensor readings
    const updateLocationDataWithSensors = () => {
        if (calibrationData.isCalibrated && isSensorActive) {
            setLocationData((prev) => ({
                ...prev,
                speed:
                    estimatedSpeed > 0 ? estimatedSpeed.toFixed(1) : prev.speed,
                heading:
                    estimatedHeading >= 0
                        ? estimatedHeading.toFixed(0)
                        : prev.heading,
            }));
        }
    };

    // Use sensor data in location update (manual trigger)
    const useSensorData = () => {
        if (estimatedSpeed > 0) {
            setLocationData((prev) => ({
                ...prev,
                speed: estimatedSpeed.toFixed(1),
            }));
        }
        if (estimatedHeading >= 0) {
            setLocationData((prev) => ({
                ...prev,
                heading: estimatedHeading.toFixed(0),
            }));
        }
        setMessage({
            type: 'success',
            text: 'Sensor data applied to location update.',
        });
    };

    // Start GPS - combines location detection and sensor monitoring
    const startGPS = () => {
        // First get current location
        getCurrentLocation();

        // Then start sensors if supported
        if (sensorSupported) {
            startSensorMonitoring();
        }
    };

    // Get current location using browser geolocation
    const getCurrentLocation = () => {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            setMessage({
                type: 'error',
                text: 'Geolocation is not supported by this browser. Please enter coordinates manually.',
            });
            return;
        }

        // Check if we're on HTTPS or localhost
        if (
            location.protocol !== 'https:' &&
            location.hostname !== 'localhost' &&
            location.hostname !== '127.0.0.1'
        ) {
            setMessage({
                type: 'error',
                text: 'Location access requires HTTPS. Please enter coordinates manually or use HTTPS.',
            });
            return;
        }

        setMessage({
            type: 'success',
            text: 'Getting your current location...',
        });

        // Try with high accuracy first, then fallback to lower accuracy
        const tryGetLocation = (
            options: PositionOptions,
            attempt: number = 1,
        ) => {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude.toString();
                    const lng = position.coords.longitude.toString();

                    setLocationData((prev) => ({
                        ...prev,
                        latitude: lat,
                        longitude: lng,
                    }));

                    // Try to get address using reverse geocoding
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
                            {
                                headers: {
                                    'User-Agent': 'SaktoApp/1.0',
                                },
                            },
                        );

                        if (response.ok) {
                            const data = await response.json();
                            if (data.display_name) {
                                setLocationData((prev) => ({
                                    ...prev,
                                    address: data.display_name,
                                }));
                            }
                        }
                    } catch (error) {
                        console.log('Could not get address:', error);
                        // Don't show error for address lookup failure
                    }

                    setMessage({
                        type: 'success',
                        text: 'Location obtained successfully!',
                    });
                },
                (error) => {
                    // If low accuracy fails and this is the first attempt, try with high accuracy
                    if (attempt === 1 && !options.enableHighAccuracy) {
                        console.log(
                            'Low accuracy failed, trying with high accuracy...',
                        );
                        tryGetLocation(
                            {
                                enableHighAccuracy: true,
                                timeout: 30000, // 30 seconds for high accuracy
                                maximumAge: 300000,
                            },
                            2,
                        );
                        return;
                    }

                    let errorMessage = 'Unable to get your current location. ';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage +=
                                'Please allow location access in your browser settings and try again.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage +=
                                'Location information is unavailable. Please check your GPS/WiFi settings.';
                            break;
                        case error.TIMEOUT:
                            errorMessage +=
                                "Location request timed out. This can happen when GPS signal is weak or you're indoors. Try moving to an open area or enter coordinates manually.";
                            break;
                        default:
                            errorMessage +=
                                'An unknown error occurred. Please try again or enter coordinates manually.';
                            break;
                    }
                    setMessage({ type: 'error', text: errorMessage });
                },
                options,
            );
        };

        // Start with lower accuracy for faster response, then try high accuracy
        tryGetLocation({
            enableHighAccuracy: false,
            timeout: 20000, // 20 seconds
            maximumAge: 300000, // 5 minutes
        });
    };

    // Update truck location
    const updateLocation = async () => {
        if (!selectedTruck) {
            setMessage({ type: 'error', text: 'Please select a truck' });
            return;
        }

        if (!locationData.latitude || !locationData.longitude) {
            setMessage({
                type: 'error',
                text: 'Please enter coordinates or get current location',
            });
            return;
        }

        try {
            setUpdating(true);
            setMessage(null);

            const updateData = {
                latitude: parseFloat(locationData.latitude),
                longitude: parseFloat(locationData.longitude),
                address: locationData.address || '',
                speed: locationData.speed
                    ? parseFloat(locationData.speed)
                    : null,
                heading: locationData.heading
                    ? parseFloat(locationData.heading)
                    : null,
            };

            await axios.post(`/driver/trucks/${selectedTruck}/location`, {
                ...updateData,
                client_identifier: identifier,
            });

            setMessage({
                type: 'success',
                text: 'Location updated successfully!',
            });

            // Clear form
            setLocationData({
                latitude: '',
                longitude: '',
                address: '',
                speed: '',
                heading: '',
            });

            // Refresh trucks list
            fetchTrucks();
        } catch (error: any) {
            console.error('Error updating location:', error);
            setMessage({
                type: 'error',
                text:
                    error.response?.data?.message ||
                    'Failed to update location',
            });
        } finally {
            setUpdating(false);
        }
    };

    const selectedTruckData = trucks.find(
        (truck) => truck.id === selectedTruck,
    );

    // Handle truck selection and move to next step
    const handleTruckSelection = (truckId: number) => {
        setSelectedTruck(truckId);
        setCurrentStep('location-update');
    };

    // Go back to truck selection
    const goBackToTruckSelection = () => {
        // Stop GPS tracking and reset everything
        if (isSensorActive) {
            stopSensorMonitoring();
        }

        // Reset all state
        setCurrentStep('truck-selection');
        setSelectedTruck(null);
        setLocationData({
            latitude: '',
            longitude: '',
            address: '',
            speed: '',
            heading: '',
        });
        setMessage(null);

        // Reset sensor-related state
        setSensorData(null);
        setCalibrationData({
            isCalibrated: false,
            stationaryAcceleration: { x: 0, y: 0, z: 0 },
            baselineOrientation: { alpha: 0, beta: 0, gamma: 0 },
        });
        setIsSensorActive(false);
        setEstimatedSpeed(0);
        setEstimatedHeading(0);

        // Reset sensor calculation refs
        lastAccelerationRef.current = null;
        lastTimestampRef.current = null;
        velocityRef.current = { x: 0, y: 0, z: 0 };
    };

    return (
        <>
            <Head title="Driver Location Update" />

            <div className="min-h-screen bg-gray-50 py-4 dark:bg-gray-900 sm:py-8">
                <div className="mx-auto max-w-4xl px-3 sm:px-4 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 text-center sm:mb-8">
                        <div className="mb-3 flex items-center justify-center sm:mb-4">
                            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/50 sm:p-3">
                                <MapPinIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 sm:h-8 sm:w-8" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
                            Truck Location
                        </h1>
                        <p className="mt-2 px-2 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                            Update your truck's current location
                        </p>
                    </div>

                    {/* Message Alert */}
                    {message && (
                        <Alert
                            className={`mx-1 mb-4 sm:mx-0 sm:mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'}`}
                        >
                            {message.type === 'error' ? (
                                <AlertCircleIcon className="h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                            ) : (
                                <CheckCircleIcon className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                            )}
                            <AlertDescription
                                className={`${message.type === 'error' ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'} text-sm sm:text-base`}
                            >
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
                                        className="mr-2 h-8 w-8 p-1"
                                    >
                                        <ArrowLeftIcon className="h-4 w-4" />
                                    </Button>
                                )}
                                <NavigationIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                {currentStep === 'truck-selection'
                                    ? 'Select Truck'
                                    : 'Update Location'}
                            </CardTitle>
                            <CardDescription className="text-sm sm:text-base">
                                {currentStep === 'truck-selection' ? (
                                    "Choose the truck you're driving to update its location"
                                ) : (
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 sm:text-4xl">
                                            {selectedTruckData?.plate_number}
                                        </div>
                                        {selectedTruckData?.driver && (
                                            <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                                                Driver:{' '}
                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                    {selectedTruckData.driver}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-0">
                            {/* Truck Selection Step */}
                            {currentStep === 'truck-selection' && (
                                <div>
                                    {loading ? (
                                        <div className="flex items-center justify-center py-6 sm:py-8">
                                            <RefreshCwIcon className="h-5 w-5 animate-spin text-blue-600 sm:h-6 sm:w-6" />
                                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                                                Loading trucks...
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 sm:space-y-3">
                                            {trucks.map((truck) => (
                                                <div
                                                    key={truck.id}
                                                    onClick={() =>
                                                        handleTruckSelection(
                                                            truck.id,
                                                        )
                                                    }
                                                    className="cursor-pointer touch-manipulation rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 active:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 dark:active:bg-gray-700 sm:p-4"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="min-w-0 flex-1">
                                                            <h4 className="mb-1 truncate text-lg font-bold text-gray-900 dark:text-gray-100 sm:text-xl">
                                                                {
                                                                    truck.plate_number
                                                                }
                                                            </h4>
                                                            <p className="truncate text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                                                                {truck.model}
                                                            </p>
                                                            {truck.driver && (
                                                                <p className="truncate text-xs font-medium text-blue-600 dark:text-blue-400 sm:text-sm">
                                                                    Driver:{' '}
                                                                    {
                                                                        truck.driver
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                        <Badge
                                                            variant={
                                                                truck.status ===
                                                                'Available'
                                                                    ? 'default'
                                                                    : 'secondary'
                                                            }
                                                            className="ml-2 flex-shrink-0 text-xs"
                                                        >
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
                                <div className="space-y-6">
                                    {/* Step 1: Start GPS */}
                                    <div className="space-y-3">
                                        <div className="flex items-center">
                                            <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                                    1
                                                </span>
                                            </div>
                                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                                Start GPS
                                            </h3>
                                        </div>

                                        <div className="ml-9 space-y-2">
                                            {!isSensorActive ? (
                                                <Button
                                                    onClick={startGPS}
                                                    variant="outline"
                                                    className="h-11 w-full touch-manipulation text-sm sm:h-10 sm:text-base"
                                                    disabled={updating}
                                                >
                                                    <MapPinIcon className="mr-2 h-4 w-4" />
                                                    Start GPS
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={calibrateSensors}
                                                    variant="outline"
                                                    className="h-11 w-full touch-manipulation text-sm sm:h-10 sm:text-base"
                                                    disabled={
                                                        updating || !sensorData
                                                    }
                                                >
                                                    <SmartphoneIcon className="mr-2 h-4 w-4" />
                                                    Calibrate Sensors
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Step 2: Location Details */}
                                    <div className="space-y-3">
                                        <div className="flex items-center">
                                            <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                                                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                                                    2
                                                </span>
                                            </div>
                                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                                Location Details
                                            </h3>
                                        </div>

                                        <div className="ml-9 space-y-4">
                                            {/* Coordinates */}
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                                                <div>
                                                    <Label
                                                        htmlFor="latitude"
                                                        className="text-sm sm:text-base"
                                                    >
                                                        Latitude
                                                    </Label>
                                                    <Input
                                                        id="latitude"
                                                        type="number"
                                                        step="any"
                                                        placeholder="e.g., 14.5995"
                                                        value={
                                                            locationData.latitude
                                                        }
                                                        onChange={(e) =>
                                                            setLocationData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    latitude:
                                                                        e.target
                                                                            .value,
                                                                }),
                                                            )
                                                        }
                                                        disabled={updating}
                                                        className="h-11 text-sm sm:h-10 sm:text-base"
                                                    />
                                                </div>
                                                <div>
                                                    <Label
                                                        htmlFor="longitude"
                                                        className="text-sm sm:text-base"
                                                    >
                                                        Longitude
                                                    </Label>
                                                    <Input
                                                        id="longitude"
                                                        type="number"
                                                        step="any"
                                                        placeholder="e.g., 120.9842"
                                                        value={
                                                            locationData.longitude
                                                        }
                                                        onChange={(e) =>
                                                            setLocationData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    longitude:
                                                                        e.target
                                                                            .value,
                                                                }),
                                                            )
                                                        }
                                                        disabled={updating}
                                                        className="h-11 text-sm sm:h-10 sm:text-base"
                                                    />
                                                </div>
                                            </div>

                                            {/* Address */}
                                            <div>
                                                <Label
                                                    htmlFor="address"
                                                    className="text-sm sm:text-base"
                                                >
                                                    Address (Optional)
                                                </Label>
                                                <Input
                                                    id="address"
                                                    placeholder="Enter address or leave blank for auto-detection"
                                                    value={locationData.address}
                                                    onChange={(e) =>
                                                        setLocationData(
                                                            (prev) => ({
                                                                ...prev,
                                                                address:
                                                                    e.target
                                                                        .value,
                                                            }),
                                                        )
                                                    }
                                                    disabled={updating}
                                                    className="h-11 text-sm sm:h-10 sm:text-base"
                                                />
                                            </div>

                                            {/* Speed and Heading */}
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                                                <div>
                                                    <Label
                                                        htmlFor="speed"
                                                        className="flex items-center text-sm sm:text-base"
                                                    >
                                                        Speed (km/h)
                                                        {calibrationData.isCalibrated &&
                                                            isSensorActive && (
                                                                <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                                                                    Auto
                                                                </span>
                                                            )}
                                                    </Label>
                                                    <Input
                                                        id="speed"
                                                        type="number"
                                                        placeholder="e.g., 60"
                                                        value={
                                                            locationData.speed
                                                        }
                                                        onChange={(e) =>
                                                            setLocationData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    speed: e
                                                                        .target
                                                                        .value,
                                                                }),
                                                            )
                                                        }
                                                        disabled={updating}
                                                        className={`h-11 text-sm sm:h-10 sm:text-base ${
                                                            calibrationData.isCalibrated &&
                                                            isSensorActive
                                                                ? 'border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20'
                                                                : ''
                                                        }`}
                                                    />
                                                </div>
                                                <div>
                                                    <Label
                                                        htmlFor="heading"
                                                        className="flex items-center text-sm sm:text-base"
                                                    >
                                                        Heading (degrees)
                                                        {calibrationData.isCalibrated &&
                                                            isSensorActive && (
                                                                <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                                                                    Auto
                                                                </span>
                                                            )}
                                                    </Label>
                                                    <Input
                                                        id="heading"
                                                        type="number"
                                                        placeholder="e.g., 45"
                                                        value={
                                                            locationData.heading
                                                        }
                                                        onChange={(e) =>
                                                            setLocationData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    heading:
                                                                        e.target
                                                                            .value,
                                                                }),
                                                            )
                                                        }
                                                        disabled={updating}
                                                        className={`h-11 text-sm sm:h-10 sm:text-base ${
                                                            calibrationData.isCalibrated &&
                                                            isSensorActive
                                                                ? 'border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20'
                                                                : ''
                                                        }`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 3: Auto-Submit Status */}
                                    <div className="space-y-3">
                                        <div className="flex items-center">
                                            <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                                                <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                                                    3
                                                </span>
                                            </div>
                                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                                Auto-Submit Status
                                            </h3>
                                        </div>

                                        <div className="ml-9">
                                            {updating ? (
                                                <div className="flex items-center justify-center rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
                                                    <RefreshCwIcon className="mr-2 h-5 w-5 animate-spin text-orange-600 dark:text-orange-400" />
                                                    <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                                                        Submitting location
                                                        update...
                                                    </span>
                                                </div>
                                            ) : locationData.latitude &&
                                              locationData.longitude ? (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-center rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                                                        <CheckCircleIcon className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
                                                        <span className="text-sm font-medium text-green-900 dark:text-green-100">
                                                            {calibrationData.isCalibrated &&
                                                            isSensorActive
                                                                ? 'Auto-submitting every 30 seconds...'
                                                                : 'Location ready - will auto-submit when sensors are calibrated'}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        onClick={updateLocation}
                                                        className="h-11 w-full touch-manipulation text-sm font-medium sm:h-10 sm:text-base"
                                                        disabled={updating}
                                                    >
                                                        <CheckCircleIcon className="mr-2 h-4 w-4" />
                                                        Submit Now (Manual)
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/20">
                                                    <ClockIcon className="mr-2 h-5 w-5 text-gray-600 dark:text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        Waiting for GPS data...
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

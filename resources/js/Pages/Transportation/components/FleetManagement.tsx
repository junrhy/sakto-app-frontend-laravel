import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { usePage } from '@inertiajs/react';
import { Pencil2Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { CopyIcon, MapPinIcon, ShareIcon, TruckIcon } from 'lucide-react';
import { useState } from 'react';
import { useFleetManagement } from '../hooks';
import { Truck, TruckFormData } from '../types';
import { FuelHistory, FuelUpdateDialog } from './index';

export default function FleetManagement() {
    const { auth } = usePage().props as any;
    const identifier = auth?.user?.identifier;
    const {
        trucks,
        fuelHistory,
        maintenanceRecords,
        loading,
        error,
        addTruck,
        editTruck,
        deleteTruck,
        scheduleMaintenance,
        updateFuelLevel,
        getFuelHistory,
        getMaintenanceHistory,
    } = useFleetManagement();

    const [truckSearch, setTruckSearch] = useState('');
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isFuelUpdateDialogOpen, setIsFuelUpdateDialogOpen] = useState(false);
    const [isLocationUpdateDialogOpen, setIsLocationUpdateDialogOpen] =
        useState(false);
    const [editingTruck, setEditingTruck] = useState<TruckFormData>({
        plateNumber: '',
        model: '',
        capacity: '',
        driver: '',
    });
    const [editingTruckId, setEditingTruckId] = useState<string>('');
    const [updatingTruckFuelId, setUpdatingTruckFuelId] = useState<string>('');
    const [updatingTruckLocationId, setUpdatingTruckLocationId] =
        useState<string>('');
    const [newTruck, setNewTruck] = useState({
        plateNumber: '',
        model: '',
        capacity: '',
    });
    const [locationUpdateData, setLocationUpdateData] = useState({
        latitude: '',
        longitude: '',
        address: '',
        speed: '',
        heading: '',
    });

    const filteredTrucks = trucks.filter((truck) => {
        const searchTerm = truckSearch.toLowerCase();
        return (
            (truck.plate_number &&
                truck.plate_number.toLowerCase().includes(searchTerm)) ||
            (truck.model && truck.model.toLowerCase().includes(searchTerm)) ||
            (truck.driver && truck.driver.toLowerCase().includes(searchTerm))
        );
    });

    const handleAddTruck = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addTruck(newTruck);
            setNewTruck({ plateNumber: '', model: '', capacity: '' });
        } catch (error) {
            console.error('Failed to add truck:', error);
        }
    };

    const handleEditTruck = (truck: Truck) => {
        setEditingTruckId(truck.id);
        setEditingTruck({
            plateNumber: truck.plate_number,
            model: truck.model,
            capacity: truck.capacity.toString(),
            driver: truck.driver || '',
            driverContact: truck.driver_contact || '',
        });
        setIsEditDialogOpen(true);
    };

    const saveEditedTruck = async (truckId: string) => {
        try {
            const currentTruck = trucks.find((t) => t.id === truckId);
            if (currentTruck) {
                await editTruck({
                    ...currentTruck,
                    plate_number: editingTruck.plateNumber,
                    model: editingTruck.model,
                    capacity: parseInt(editingTruck.capacity),
                    driver: editingTruck.driver,
                    driver_contact: editingTruck.driverContact,
                    status: 'Available',
                    last_maintenance: '',
                    fuel_level: '0',
                    mileage: 0,
                });
            }
            setIsEditDialogOpen(false);
        } catch (error) {
            console.error('Failed to edit truck:', error);
        }
    };

    const openFuelUpdateDialog = (truckId: string) => {
        setUpdatingTruckFuelId(truckId);
        setIsFuelUpdateDialogOpen(true);
    };

    const handleScheduleMaintenance = async (truckId: string) => {
        try {
            await scheduleMaintenance(truckId);
        } catch (error) {
            console.error('Failed to schedule maintenance:', error);
        }
    };

    const handleDeleteTruck = async (truckId: string) => {
        if (confirm('Are you sure you want to delete this truck?')) {
            try {
                await deleteTruck(truckId);
            } catch (error) {
                console.error('Failed to delete truck:', error);
            }
        }
    };

    const handleViewFuelHistory = async (truckId: string) => {
        try {
            await getFuelHistory(truckId);
        } catch (error) {
            console.error('Failed to fetch fuel history:', error);
        }
    };

    const handleViewMaintenanceHistory = async (truckId: string) => {
        try {
            await getMaintenanceHistory(truckId);
        } catch (error) {
            console.error('Failed to fetch maintenance history:', error);
        }
    };

    const openLocationUpdateDialog = (truckId: string) => {
        setUpdatingTruckLocationId(truckId);
        // Pre-fill with current location if available
        const truck = trucks.find((t) => t.id === truckId);
        if (truck && truck.current_latitude && truck.current_longitude) {
            setLocationUpdateData({
                latitude: truck.current_latitude.toString(),
                longitude: truck.current_longitude.toString(),
                address: truck.current_address || '',
                speed: truck.speed?.toString() || '',
                heading: truck.heading?.toString() || '',
            });
        } else {
            setLocationUpdateData({
                latitude: '',
                longitude: '',
                address: '',
                speed: '',
                heading: '',
            });
        }
        setIsLocationUpdateDialogOpen(true);
    };

    const handleLocationUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(
                `/transportation/fleet/${updatingTruckLocationId}/location`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({
                        latitude: parseFloat(locationUpdateData.latitude),
                        longitude: parseFloat(locationUpdateData.longitude),
                        address: locationUpdateData.address || null,
                        speed: locationUpdateData.speed
                            ? parseFloat(locationUpdateData.speed)
                            : null,
                        heading: locationUpdateData.heading
                            ? parseFloat(locationUpdateData.heading)
                            : null,
                    }),
                },
            );

            if (response.ok) {
                setIsLocationUpdateDialogOpen(false);
                setLocationUpdateData({
                    latitude: '',
                    longitude: '',
                    address: '',
                    speed: '',
                    heading: '',
                });
                // Refresh the page to show updated data
                window.location.reload();
            } else {
                const errorData = await response.json();
                console.error('Failed to update location:', errorData);
                alert('Failed to update location. Please try again.');
            }
        } catch (error) {
            console.error('Failed to update location:', error);
            alert('Failed to update location. Please try again.');
        }
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert(
                'Geolocation is not supported by this browser. Please enter coordinates manually.',
            );
            return;
        }

        // Show loading state
        const button = document.querySelector(
            '[data-geolocation-button]',
        ) as HTMLButtonElement;
        if (button) {
            button.disabled = true;
            button.textContent = 'Getting Location...';
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocationUpdateData({
                    ...locationUpdateData,
                    latitude: position.coords.latitude.toString(),
                    longitude: position.coords.longitude.toString(),
                });

                // Reset button
                if (button) {
                    button.disabled = false;
                    button.innerHTML =
                        '<svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>Get Current Location';
                }
            },
            (error) => {
                console.error('Geolocation error:', error);

                // Reset button
                if (button) {
                    button.disabled = false;
                    button.innerHTML =
                        '<svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>Get Current Location';
                }

                let errorMessage = 'Unable to get your current location. ';

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage +=
                            'Location access was denied. Please allow location access in your browser settings or enter coordinates manually.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage +=
                            'Location information is unavailable. Please check your internet connection or enter coordinates manually.';
                        break;
                    case error.TIMEOUT:
                        errorMessage +=
                            'Location request timed out. Please try again or enter coordinates manually.';
                        break;
                    default:
                        errorMessage +=
                            'An unknown error occurred. Please enter coordinates manually.';
                        break;
                }

                alert(errorMessage);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000, // 5 minutes
            },
        );
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-100">
                        Fleet Management
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="py-4 text-center text-gray-600 dark:text-gray-400">
                        Loading fleet data...
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-100">
                        Fleet Management
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="py-4 text-center text-red-500 dark:text-red-400">
                        Error: {error}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800">
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                            <TruckIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Fleet Management
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Manage your vehicle fleet and maintenance
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {filteredTrucks.length} trucks
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <ShareIcon className="mr-2 h-4 w-4" />
                                    Driver URL
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>
                                        Driver Location Update URL
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Share this URL with your drivers so they
                                        can update their truck locations:
                                    </p>
                                    <div className="flex items-center space-x-2">
                                        <Input
                                            value={`${window.location.origin}/driver/${identifier}/location-update`}
                                            readOnly
                                            className="flex-1"
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                navigator.clipboard.writeText(
                                                    `${window.location.origin}/driver/${identifier}/location-update`,
                                                );
                                            }}
                                        >
                                            <CopyIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        <strong>Note:</strong> This URL is
                                        public and allows drivers to update
                                        truck locations without logging in.
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
            <div className="p-6">
                <div className="space-y-4">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="max-w-md flex-1">
                            <Input
                                placeholder="Search trucks..."
                                value={truckSearch}
                                onChange={(e) => setTruckSearch(e.target.value)}
                                className="w-full border-gray-200 bg-gray-50 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-900"
                            />
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="bg-green-600 text-white shadow-sm hover:bg-green-700">
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    Add New Truck
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle className="text-gray-900 dark:text-gray-100">
                                        Add New Truck
                                    </DialogTitle>
                                </DialogHeader>
                                <form
                                    onSubmit={handleAddTruck}
                                    className="space-y-4"
                                >
                                    <Input
                                        placeholder="Plate Number"
                                        value={newTruck.plateNumber}
                                        onChange={(e) =>
                                            setNewTruck({
                                                ...newTruck,
                                                plateNumber: e.target.value,
                                            })
                                        }
                                    />
                                    <Input
                                        placeholder="Model"
                                        value={newTruck.model}
                                        onChange={(e) =>
                                            setNewTruck({
                                                ...newTruck,
                                                model: e.target.value,
                                            })
                                        }
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Capacity (tons)"
                                        value={newTruck.capacity}
                                        onChange={(e) =>
                                            setNewTruck({
                                                ...newTruck,
                                                capacity: e.target.value,
                                            })
                                        }
                                    />
                                    <Button type="submit">Add Truck</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Dialog
                        open={isEditDialogOpen}
                        onOpenChange={setIsEditDialogOpen}
                    >
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="text-gray-900 dark:text-gray-100">
                                    Edit Truck
                                </DialogTitle>
                            </DialogHeader>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    saveEditedTruck(editingTruckId);
                                }}
                                className="space-y-4"
                            >
                                <Input
                                    placeholder="Plate Number"
                                    value={editingTruck.plateNumber}
                                    onChange={(e) =>
                                        setEditingTruck({
                                            ...editingTruck,
                                            plateNumber: e.target.value,
                                        })
                                    }
                                />
                                <Input
                                    placeholder="Model"
                                    value={editingTruck.model}
                                    onChange={(e) =>
                                        setEditingTruck({
                                            ...editingTruck,
                                            model: e.target.value,
                                        })
                                    }
                                />
                                <Input
                                    type="number"
                                    placeholder="Capacity (tons)"
                                    value={editingTruck.capacity}
                                    onChange={(e) =>
                                        setEditingTruck({
                                            ...editingTruck,
                                            capacity: e.target.value,
                                        })
                                    }
                                />
                                <Input
                                    placeholder="Driver"
                                    value={editingTruck.driver || ''}
                                    onChange={(e) =>
                                        setEditingTruck({
                                            ...editingTruck,
                                            driver: e.target.value,
                                        })
                                    }
                                />
                                <Input
                                    placeholder="Driver Contact Number"
                                    value={editingTruck.driverContact || ''}
                                    onChange={(e) =>
                                        setEditingTruck({
                                            ...editingTruck,
                                            driverContact: e.target.value,
                                        })
                                    }
                                />
                                <Button type="submit">Save Changes</Button>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                        <Table>
                            <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
                                <TableRow className="border-gray-200 dark:border-gray-700">
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                                        Plate Number
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                                        Model
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                                        Driver
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                                        Status
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                                        Fuel Level
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTrucks.map((truck) => (
                                    <TableRow
                                        key={truck.id}
                                        className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50"
                                    >
                                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                                            {truck.plate_number}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-gray-100">
                                            {truck.model}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {truck.driver ||
                                                        'Unassigned'}
                                                </span>
                                                {truck.driver_contact && (
                                                    <span className="text-xs text-muted-foreground dark:text-gray-400">
                                                        📞{' '}
                                                        {truck.driver_contact}
                                                    </span>
                                                )}
                                                {truck.status ===
                                                    'In Transit' && (
                                                    <span className="text-xs text-muted-foreground dark:text-gray-400">
                                                        On delivery
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    truck.status === 'Available'
                                                        ? 'default'
                                                        : truck.status ===
                                                            'In Transit'
                                                          ? 'secondary'
                                                          : 'destructive'
                                                }
                                            >
                                                {truck.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                                <div
                                                    className="h-2.5 rounded-full bg-blue-600 dark:bg-blue-500"
                                                    style={{
                                                        width: `${parseFloat(truck.fuel_level || '0')}%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleEditTruck(truck)
                                                    }
                                                    className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                >
                                                    <Pencil2Icon className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDeleteTruck(
                                                            truck.id,
                                                        )
                                                    }
                                                    className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    <TrashIcon className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleScheduleMaintenance(
                                                            truck.id,
                                                        )
                                                    }
                                                    disabled={
                                                        truck.status !==
                                                        'Available'
                                                    }
                                                    className="h-8 px-2 text-xs hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                                                >
                                                    Maintenance
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        openFuelUpdateDialog(
                                                            truck.id,
                                                        )
                                                    }
                                                    className="h-8 px-2 text-xs hover:bg-green-50 dark:hover:bg-green-900/20"
                                                >
                                                    Fuel
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        openLocationUpdateDialog(
                                                            truck.id,
                                                        )
                                                    }
                                                    className="h-8 px-2 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                >
                                                    <MapPinIcon className="mr-1 h-3 w-3" />
                                                    Location
                                                </Button>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 px-2 text-xs hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                                        >
                                                            History
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-2xl">
                                                        <DialogHeader>
                                                            <DialogTitle className="text-gray-900 dark:text-gray-100">
                                                                Fuel History -{' '}
                                                                {
                                                                    truck.plate_number
                                                                }
                                                            </DialogTitle>
                                                        </DialogHeader>
                                                        <FuelHistory
                                                            truckId={truck.id}
                                                        />
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            <FuelUpdateDialog
                isOpen={isFuelUpdateDialogOpen}
                onClose={() => setIsFuelUpdateDialogOpen(false)}
                truckId={updatingTruckFuelId}
            />

            {/* Location Update Dialog */}
            <Dialog
                open={isLocationUpdateDialogOpen}
                onOpenChange={setIsLocationUpdateDialogOpen}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-gray-100">
                            Update Truck Location
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleLocationUpdate} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Latitude
                                </label>
                                <Input
                                    type="number"
                                    step="any"
                                    placeholder="e.g., 14.5995"
                                    value={locationUpdateData.latitude}
                                    onChange={(e) =>
                                        setLocationUpdateData({
                                            ...locationUpdateData,
                                            latitude: e.target.value,
                                        })
                                    }
                                    required
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Range: -90 to 90
                                </p>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Longitude
                                </label>
                                <Input
                                    type="number"
                                    step="any"
                                    placeholder="e.g., 120.9842"
                                    value={locationUpdateData.longitude}
                                    onChange={(e) =>
                                        setLocationUpdateData({
                                            ...locationUpdateData,
                                            longitude: e.target.value,
                                        })
                                    }
                                    required
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Range: -180 to 180
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={getCurrentLocation}
                                className="text-sm"
                                data-geolocation-button
                            >
                                <MapPinIcon className="mr-2 h-4 w-4" />
                                Get Current Location
                            </Button>
                        </div>

                        {/* Common Location Suggestions */}
                        <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Common Locations:
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setLocationUpdateData({
                                            ...locationUpdateData,
                                            latitude: '14.5995',
                                            longitude: '120.9842',
                                            address: 'Manila, Philippines',
                                        })
                                    }
                                    className="rounded border p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                    <div className="font-medium">Manila</div>
                                    <div className="text-gray-500">
                                        14.5995, 120.9842
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setLocationUpdateData({
                                            ...locationUpdateData,
                                            latitude: '10.3157',
                                            longitude: '123.8854',
                                            address: 'Cebu City, Philippines',
                                        })
                                    }
                                    className="rounded border p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                    <div className="font-medium">Cebu City</div>
                                    <div className="text-gray-500">
                                        10.3157, 123.8854
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setLocationUpdateData({
                                            ...locationUpdateData,
                                            latitude: '7.1907',
                                            longitude: '125.4553',
                                            address: 'Davao City, Philippines',
                                        })
                                    }
                                    className="rounded border p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                    <div className="font-medium">
                                        Davao City
                                    </div>
                                    <div className="text-gray-500">
                                        7.1907, 125.4553
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setLocationUpdateData({
                                            ...locationUpdateData,
                                            latitude: '16.4023',
                                            longitude: '120.5960',
                                            address: 'Baguio City, Philippines',
                                        })
                                    }
                                    className="rounded border p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                    <div className="font-medium">
                                        Baguio City
                                    </div>
                                    <div className="text-gray-500">
                                        16.4023, 120.5960
                                    </div>
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Address
                            </label>
                            <Input
                                placeholder="e.g., Manila, Philippines"
                                value={locationUpdateData.address}
                                onChange={(e) =>
                                    setLocationUpdateData({
                                        ...locationUpdateData,
                                        address: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Speed (km/h)
                                </label>
                                <Input
                                    type="number"
                                    step="any"
                                    placeholder="e.g., 60"
                                    value={locationUpdateData.speed}
                                    onChange={(e) =>
                                        setLocationUpdateData({
                                            ...locationUpdateData,
                                            speed: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Heading (degrees)
                                </label>
                                <Input
                                    type="number"
                                    step="any"
                                    placeholder="e.g., 45"
                                    value={locationUpdateData.heading}
                                    onChange={(e) =>
                                        setLocationUpdateData({
                                            ...locationUpdateData,
                                            heading: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    setIsLocationUpdateDialogOpen(false)
                                }
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Update Location</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

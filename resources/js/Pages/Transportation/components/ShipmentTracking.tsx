import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Calendar } from '@/Components/ui/calendar';
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/Components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    CalendarIcon,
    ClockIcon,
    Cross2Icon,
    Pencil2Icon,
    PlusIcon,
    TrashIcon,
} from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { PackageIcon } from 'lucide-react';
import { useState } from 'react';
import { useFleetManagement, useShipmentTracking } from '../hooks';
import { Helper, Shipment, ShipmentFormData } from '../types';
import ShipmentTrackingHistory from './ShipmentTrackingHistory';
import StatusUpdateDialog from './StatusUpdateDialog';

export default function ShipmentTracking() {
    const {
        shipments,
        trackingHistory,
        loading,
        error,
        addShipment,
        editShipment,
        deleteShipment,
        updateShipmentStatus,
        getTrackingHistory,
    } = useShipmentTracking();

    const { trucks } = useFleetManagement();

    // Filter available trucks only
    const availableTrucks = trucks.filter(
        (truck) => truck.status === 'Available',
    );

    const [shipmentSearch, setShipmentSearch] = useState('');
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isStatusUpdateDialogOpen, setIsStatusUpdateDialogOpen] =
        useState(false);
    const [isTrackingHistoryDialogOpen, setIsTrackingHistoryDialogOpen] =
        useState(false);
    const [viewingShipmentId, setViewingShipmentId] = useState<string>('');
    const [editingShipment, setEditingShipment] = useState<ShipmentFormData>({
        truckId: '',
        driver: '',
        helpers: [],
        destination: '',
        origin: '',
        departureDate: '',
        arrivalDate: '',
        cargo: '',
        weight: '',
        customerContact: '',
        priority: 'Medium',
    });
    const [editingShipmentId, setEditingShipmentId] = useState<string>('');
    const [updatingShipmentStatusId, setUpdatingShipmentStatusId] =
        useState<string>('');
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    const [newShipment, setNewShipment] = useState<ShipmentFormData>({
        truckId: '',
        driver: '',
        helpers: [],
        destination: '',
        origin: '',
        departureDate: today,
        arrivalDate: today,
        cargo: '',
        weight: '',
        customerContact: '',
        priority: 'Medium',
    });

    const filteredShipments = shipments.filter((shipment) => {
        const searchTerm = shipmentSearch.toLowerCase();
        return (
            (shipment.driver &&
                shipment.driver.toLowerCase().includes(searchTerm)) ||
            (shipment.helpers &&
                shipment.helpers.some(
                    (helper) =>
                        helper.name.toLowerCase().includes(searchTerm) ||
                        helper.role.toLowerCase().includes(searchTerm),
                )) ||
            (shipment.destination &&
                shipment.destination.toLowerCase().includes(searchTerm)) ||
            (shipment.origin &&
                shipment.origin.toLowerCase().includes(searchTerm)) ||
            (shipment.cargo &&
                shipment.cargo.toLowerCase().includes(searchTerm)) ||
            (shipment.truck &&
                shipment.truck.plate_number &&
                shipment.truck.plate_number
                    .toLowerCase()
                    .includes(searchTerm)) ||
            (shipment.truck &&
                shipment.truck.model &&
                shipment.truck.model.toLowerCase().includes(searchTerm))
        );
    });

    const handleAddShipment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Filter out empty helpers (helpers without names)
            const filteredHelpers = (newShipment.helpers || []).filter(
                (helper) => helper.name.trim() !== '',
            );
            const shipmentData = {
                ...newShipment,
                helpers: filteredHelpers,
            };
            console.log(
                'Submitting shipment with helpers:',
                shipmentData.helpers,
            );
            await addShipment(shipmentData);
            setNewShipment({
                truckId: '',
                driver: '',
                helpers: [],
                destination: '',
                origin: '',
                departureDate: today,
                arrivalDate: today,
                cargo: '',
                weight: '',
                customerContact: '',
                priority: 'Medium',
            });
        } catch (error) {
            console.error('Failed to add shipment:', error);
        }
    };

    const handleEditShipment = (shipment: Shipment) => {
        setEditingShipmentId(shipment.id);
        setEditingShipment({
            truckId: shipment.truck_id || '',
            driver: shipment.driver || '',
            helpers: shipment.helpers || [],
            destination: shipment.destination || '',
            origin: shipment.origin || '',
            departureDate: shipment.departure_date || '',
            arrivalDate: shipment.arrival_date || '',
            cargo: shipment.cargo || '',
            weight: (shipment.weight || 0).toString(),
            customerContact: shipment.customer_contact || '',
            priority: shipment.priority || 'Medium',
        });
        setIsEditDialogOpen(true);
    };

    const saveEditedShipment = async (shipmentId: string) => {
        try {
            const shipment = shipments.find((s) => s.id === shipmentId);
            if (shipment) {
                // Filter out empty helpers (helpers without names)
                const filteredHelpers = (editingShipment.helpers || []).filter(
                    (helper) => helper.name.trim() !== '',
                );
                await editShipment({
                    id: shipment.id,
                    truck_id: editingShipment.truckId,
                    driver: editingShipment.driver,
                    helpers: filteredHelpers,
                    destination: editingShipment.destination,
                    origin: editingShipment.origin,
                    departure_date: editingShipment.departureDate,
                    arrival_date: editingShipment.arrivalDate,
                    cargo: editingShipment.cargo,
                    weight: parseFloat(editingShipment.weight) || 0,
                    customer_contact: editingShipment.customerContact,
                    priority: editingShipment.priority,
                    status: shipment.status,
                    current_location: shipment.current_location,
                    estimated_delay: shipment.estimated_delay,
                });
            }
            setIsEditDialogOpen(false);
        } catch (error) {
            console.error('Failed to edit shipment:', error);
        }
    };

    const openStatusUpdateDialog = (shipmentId: string) => {
        setUpdatingShipmentStatusId(shipmentId);
        setIsStatusUpdateDialogOpen(true);
    };

    const openTrackingHistoryDialog = (shipmentId: string) => {
        setViewingShipmentId(shipmentId);
        setIsTrackingHistoryDialogOpen(true);
    };

    // Helper management functions
    const addHelper = (
        helpers: Helper[],
        setHelpers: (helpers: Helper[]) => void,
    ) => {
        setHelpers([...helpers, { name: '', role: '' }]);
    };

    const removeHelper = (
        helpers: Helper[],
        setHelpers: (helpers: Helper[]) => void,
        index: number,
    ) => {
        setHelpers(helpers.filter((_, i) => i !== index));
    };

    const updateHelper = (
        helpers: Helper[],
        setHelpers: (helpers: Helper[]) => void,
        index: number,
        field: 'name' | 'role',
        value: string,
    ) => {
        const updatedHelpers = [...helpers];
        updatedHelpers[index] = { ...updatedHelpers[index], [field]: value };
        setHelpers(updatedHelpers);
    };

    const handleDeleteShipment = async (shipmentId: string) => {
        if (confirm('Are you sure you want to delete this shipment?')) {
            try {
                await deleteShipment(shipmentId);
            } catch (error) {
                console.error('Failed to delete shipment:', error);
            }
        }
    };

    // Function to handle truck selection and populate driver details
    const handleTruckSelection = (
        truckId: string,
        isEditForm: boolean = false,
    ) => {
        const selectedTruck = trucks.find(
            (truck) => truck.id.toString() === truckId,
        );
        const driverName = selectedTruck?.driver || '';

        if (isEditForm) {
            setEditingShipment((prev) => ({
                ...prev,
                truckId: truckId,
                driver: driverName,
            }));
        } else {
            setNewShipment((prev) => ({
                ...prev,
                truckId: truckId,
                driver: driverName,
            }));
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-100">
                        Shipment Tracking
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="py-4 text-center text-gray-600 dark:text-gray-400">
                        Loading shipment data...
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
                        Shipment Tracking
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
                        <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                            <PackageIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Shipment Tracking
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Monitor and manage all shipments
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {filteredShipments.length} shipments
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div className="max-w-md flex-1">
                        <Input
                            placeholder="Search shipments, trucks, drivers, helpers..."
                            value={shipmentSearch}
                            onChange={(e) => setShipmentSearch(e.target.value)}
                            className="w-full border-gray-200 bg-gray-50 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
                        />
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 text-white shadow-sm hover:bg-blue-700">
                                <PlusIcon className="mr-2 h-4 w-4" />
                                New Shipment
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-gray-900 dark:text-gray-100">
                                    Add New Shipment
                                </DialogTitle>
                            </DialogHeader>
                            <form
                                onSubmit={handleAddShipment}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Truck
                                    </label>
                                    <Select
                                        value={newShipment.truckId || ''}
                                        onValueChange={(value) =>
                                            handleTruckSelection(value, false)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a truck">
                                                {newShipment.truckId &&
                                                    availableTrucks.find(
                                                        (truck) =>
                                                            truck.id ===
                                                            newShipment.truckId,
                                                    ) &&
                                                    `${availableTrucks.find((truck) => truck.id === newShipment.truckId)?.plate_number} - ${availableTrucks.find((truck) => truck.id === newShipment.truckId)?.model}`}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableTrucks.map((truck) => (
                                                <SelectItem
                                                    key={truck.id}
                                                    value={truck.id.toString()}
                                                >
                                                    {truck.plate_number} -{' '}
                                                    {truck.model} (
                                                    {truck.driver ||
                                                        'No Driver'}
                                                    )
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {availableTrucks.length === 0 && (
                                        <p className="text-sm text-muted-foreground dark:text-gray-400">
                                            No available trucks
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Driver
                                    </label>
                                    <Input
                                        placeholder="Driver"
                                        value={newShipment.driver}
                                        onChange={(e) =>
                                            setNewShipment({
                                                ...newShipment,
                                                driver: e.target.value,
                                            })
                                        }
                                    />
                                    {newShipment.truckId &&
                                        availableTrucks.find(
                                            (truck) =>
                                                truck.id.toString() ===
                                                newShipment.truckId,
                                        )?.driver && (
                                            <p className="text-xs text-muted-foreground dark:text-gray-400">
                                                Auto-populated from selected
                                                truck
                                            </p>
                                        )}
                                </div>

                                {/* Helpers Section */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Helpers
                                        </label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                addHelper(
                                                    newShipment.helpers || [],
                                                    (helpers) =>
                                                        setNewShipment({
                                                            ...newShipment,
                                                            helpers,
                                                        }),
                                                )
                                            }
                                        >
                                            <PlusIcon className="mr-1 h-4 w-4" />
                                            Add Helper
                                        </Button>
                                    </div>
                                    {newShipment.helpers &&
                                        newShipment.helpers.map(
                                            (helper, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Input
                                                        placeholder="Helper name"
                                                        value={helper.name}
                                                        onChange={(e) =>
                                                            updateHelper(
                                                                newShipment.helpers ||
                                                                    [],
                                                                (helpers) =>
                                                                    setNewShipment(
                                                                        {
                                                                            ...newShipment,
                                                                            helpers,
                                                                        },
                                                                    ),
                                                                index,
                                                                'name',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="flex-1"
                                                    />
                                                    <Input
                                                        placeholder="Role"
                                                        value={helper.role}
                                                        onChange={(e) =>
                                                            updateHelper(
                                                                newShipment.helpers ||
                                                                    [],
                                                                (helpers) =>
                                                                    setNewShipment(
                                                                        {
                                                                            ...newShipment,
                                                                            helpers,
                                                                        },
                                                                    ),
                                                                index,
                                                                'role',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="flex-1"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            removeHelper(
                                                                newShipment.helpers ||
                                                                    [],
                                                                (helpers) =>
                                                                    setNewShipment(
                                                                        {
                                                                            ...newShipment,
                                                                            helpers,
                                                                        },
                                                                    ),
                                                                index,
                                                            )
                                                        }
                                                    >
                                                        <Cross2Icon className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ),
                                        )}
                                    {(!newShipment.helpers ||
                                        newShipment.helpers.length === 0) && (
                                        <p className="text-sm text-muted-foreground dark:text-gray-400">
                                            No helpers added
                                        </p>
                                    )}
                                </div>

                                <Input
                                    placeholder="Origin"
                                    value={newShipment.origin}
                                    onChange={(e) =>
                                        setNewShipment({
                                            ...newShipment,
                                            origin: e.target.value,
                                        })
                                    }
                                />
                                <Input
                                    placeholder="Destination"
                                    value={newShipment.destination}
                                    onChange={(e) =>
                                        setNewShipment({
                                            ...newShipment,
                                            destination: e.target.value,
                                        })
                                    }
                                />
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Departure Date
                                    </label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {newShipment.departureDate ? (
                                                    format(
                                                        new Date(
                                                            newShipment.departureDate,
                                                        ),
                                                        'PPP',
                                                    )
                                                ) : (
                                                    <span className="text-muted-foreground dark:text-gray-400">
                                                        Pick a date
                                                    </span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={
                                                    newShipment.departureDate
                                                        ? new Date(
                                                              newShipment.departureDate,
                                                          )
                                                        : undefined
                                                }
                                                onSelect={(date) =>
                                                    setNewShipment({
                                                        ...newShipment,
                                                        departureDate: date
                                                            ? date
                                                                  .toISOString()
                                                                  .split('T')[0]
                                                            : today,
                                                    })
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Arrival Date
                                    </label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {newShipment.arrivalDate ? (
                                                    format(
                                                        new Date(
                                                            newShipment.arrivalDate,
                                                        ),
                                                        'PPP',
                                                    )
                                                ) : (
                                                    <span className="text-muted-foreground dark:text-gray-400">
                                                        Pick a date
                                                    </span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={
                                                    newShipment.arrivalDate
                                                        ? new Date(
                                                              newShipment.arrivalDate,
                                                          )
                                                        : undefined
                                                }
                                                onSelect={(date) =>
                                                    setNewShipment({
                                                        ...newShipment,
                                                        arrivalDate: date
                                                            ? date
                                                                  .toISOString()
                                                                  .split('T')[0]
                                                            : today,
                                                    })
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <Input
                                    placeholder="Cargo"
                                    value={newShipment.cargo}
                                    onChange={(e) =>
                                        setNewShipment({
                                            ...newShipment,
                                            cargo: e.target.value,
                                        })
                                    }
                                />
                                <Input
                                    placeholder="Weight (tons)"
                                    value={newShipment.weight}
                                    onChange={(e) =>
                                        setNewShipment({
                                            ...newShipment,
                                            weight: e.target.value,
                                        })
                                    }
                                />
                                <Input
                                    placeholder="Customer Contact"
                                    value={newShipment.customerContact}
                                    onChange={(e) =>
                                        setNewShipment({
                                            ...newShipment,
                                            customerContact: e.target.value,
                                        })
                                    }
                                />
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Priority
                                    </label>
                                    <Select
                                        value={newShipment.priority || ''}
                                        onValueChange={(value) =>
                                            setNewShipment({
                                                ...newShipment,
                                                priority: value as
                                                    | 'Low'
                                                    | 'Medium'
                                                    | 'High',
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Low">
                                                Low
                                            </SelectItem>
                                            <SelectItem value="Medium">
                                                Medium
                                            </SelectItem>
                                            <SelectItem value="High">
                                                High
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="submit">Add Shipment</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                    <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
                            <TableRow className="border-gray-200 dark:border-gray-700">
                                <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                                    ID
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                                    Truck
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                                    Driver
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                                    Helpers
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                                    Route
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                                    Status
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                                    Priority
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredShipments.map((shipment) => (
                                <TableRow
                                    key={shipment.id}
                                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50"
                                >
                                    <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                                        {shipment.id}
                                    </TableCell>
                                    <TableCell>
                                        {shipment.truck ? (
                                            <div className="text-sm">
                                                <div className="font-medium">
                                                    {
                                                        shipment.truck
                                                            .plate_number
                                                    }
                                                </div>
                                                <div className="text-muted-foreground dark:text-gray-400">
                                                    {shipment.truck.model}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground dark:text-gray-400">
                                                No truck assigned
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>{shipment.driver}</TableCell>
                                    <TableCell>
                                        {shipment.helpers &&
                                        shipment.helpers.length > 0 ? (
                                            <div className="space-y-1">
                                                {shipment.helpers.map(
                                                    (helper, index) => (
                                                        <div
                                                            key={index}
                                                            className="text-sm"
                                                        >
                                                            <div className="font-medium">
                                                                {helper.name}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground dark:text-gray-400">
                                                                {helper.role}
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground dark:text-gray-400">
                                                No helpers
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {shipment.origin} →{' '}
                                        {shipment.destination}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                shipment.status === 'Delivered'
                                                    ? 'default'
                                                    : shipment.status ===
                                                        'In Transit'
                                                      ? 'secondary'
                                                      : shipment.status ===
                                                          'Delayed'
                                                        ? 'destructive'
                                                        : 'outline'
                                            }
                                        >
                                            {shipment.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {shipment.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleEditShipment(shipment)
                                                }
                                                className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                            >
                                                <Pencil2Icon className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    openStatusUpdateDialog(
                                                        shipment.id,
                                                    )
                                                }
                                                className="h-8 px-2 text-xs hover:bg-green-50 dark:hover:bg-green-900/20"
                                            >
                                                Update
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    openTrackingHistoryDialog(
                                                        shipment.id,
                                                    )
                                                }
                                                className="h-8 w-8 p-0 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                            >
                                                <ClockIcon className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleDeleteShipment(
                                                        shipment.id,
                                                    )
                                                }
                                                className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                <TrashIcon className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Edit Shipment Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-gray-100">
                            Edit Shipment
                        </DialogTitle>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            saveEditedShipment(editingShipmentId);
                        }}
                        className="space-y-4"
                    >
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Truck
                            </label>
                            <Select
                                value={editingShipment.truckId || ''}
                                onValueChange={(value) =>
                                    handleTruckSelection(value, true)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a truck">
                                        {editingShipment.truckId &&
                                            trucks.find(
                                                (truck) =>
                                                    truck.id ===
                                                    editingShipment.truckId,
                                            ) &&
                                            `${trucks.find((truck) => truck.id === editingShipment.truckId)?.plate_number} - ${trucks.find((truck) => truck.id === editingShipment.truckId)?.model}`}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {trucks.map((truck) => (
                                        <SelectItem
                                            key={truck.id}
                                            value={truck.id.toString()}
                                        >
                                            {truck.plate_number} - {truck.model}{' '}
                                            ({truck.driver || 'No Driver'})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Driver
                            </label>
                            <Input
                                placeholder="Driver"
                                value={editingShipment.driver}
                                onChange={(e) =>
                                    setEditingShipment({
                                        ...editingShipment,
                                        driver: e.target.value,
                                    })
                                }
                            />
                            {editingShipment.truckId &&
                                trucks.find(
                                    (truck) =>
                                        truck.id === editingShipment.truckId,
                                )?.driver && (
                                    <p className="text-xs text-muted-foreground dark:text-gray-400">
                                        Auto-populated from selected truck
                                    </p>
                                )}
                        </div>

                        {/* Helpers Section */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Helpers
                                </label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        addHelper(
                                            editingShipment.helpers || [],
                                            (helpers) =>
                                                setEditingShipment({
                                                    ...editingShipment,
                                                    helpers,
                                                }),
                                        )
                                    }
                                >
                                    <PlusIcon className="mr-1 h-4 w-4" />
                                    Add Helper
                                </Button>
                            </div>
                            {editingShipment.helpers &&
                                editingShipment.helpers.map((helper, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2"
                                    >
                                        <Input
                                            placeholder="Helper name"
                                            value={helper.name}
                                            onChange={(e) =>
                                                updateHelper(
                                                    editingShipment.helpers ||
                                                        [],
                                                    (helpers) =>
                                                        setEditingShipment({
                                                            ...editingShipment,
                                                            helpers,
                                                        }),
                                                    index,
                                                    'name',
                                                    e.target.value,
                                                )
                                            }
                                            className="flex-1"
                                        />
                                        <Input
                                            placeholder="Role"
                                            value={helper.role}
                                            onChange={(e) =>
                                                updateHelper(
                                                    editingShipment.helpers ||
                                                        [],
                                                    (helpers) =>
                                                        setEditingShipment({
                                                            ...editingShipment,
                                                            helpers,
                                                        }),
                                                    index,
                                                    'role',
                                                    e.target.value,
                                                )
                                            }
                                            className="flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                removeHelper(
                                                    editingShipment.helpers ||
                                                        [],
                                                    (helpers) =>
                                                        setEditingShipment({
                                                            ...editingShipment,
                                                            helpers,
                                                        }),
                                                    index,
                                                )
                                            }
                                        >
                                            <Cross2Icon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            {(!editingShipment.helpers ||
                                editingShipment.helpers.length === 0) && (
                                <p className="text-sm text-muted-foreground dark:text-gray-400">
                                    No helpers added
                                </p>
                            )}
                        </div>

                        <Input
                            placeholder="Origin"
                            value={editingShipment.origin}
                            onChange={(e) =>
                                setEditingShipment({
                                    ...editingShipment,
                                    origin: e.target.value,
                                })
                            }
                        />
                        <Input
                            placeholder="Destination"
                            value={editingShipment.destination}
                            onChange={(e) =>
                                setEditingShipment({
                                    ...editingShipment,
                                    destination: e.target.value,
                                })
                            }
                        />
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Departure Date
                            </label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {editingShipment.departureDate ? (
                                            format(
                                                new Date(
                                                    editingShipment.departureDate,
                                                ),
                                                'PPP',
                                            )
                                        ) : (
                                            <span className="text-muted-foreground dark:text-gray-400">
                                                Pick a date
                                            </span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={
                                            editingShipment.departureDate
                                                ? new Date(
                                                      editingShipment.departureDate,
                                                  )
                                                : undefined
                                        }
                                        onSelect={(date) =>
                                            setEditingShipment({
                                                ...editingShipment,
                                                departureDate: date
                                                    ? date
                                                          .toISOString()
                                                          .split('T')[0]
                                                    : today,
                                            })
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Arrival Date
                            </label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {editingShipment.arrivalDate ? (
                                            format(
                                                new Date(
                                                    editingShipment.arrivalDate,
                                                ),
                                                'PPP',
                                            )
                                        ) : (
                                            <span className="text-muted-foreground dark:text-gray-400">
                                                Pick a date
                                            </span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={
                                            editingShipment.arrivalDate
                                                ? new Date(
                                                      editingShipment.arrivalDate,
                                                  )
                                                : undefined
                                        }
                                        onSelect={(date) =>
                                            setEditingShipment({
                                                ...editingShipment,
                                                arrivalDate: date
                                                    ? date
                                                          .toISOString()
                                                          .split('T')[0]
                                                    : today,
                                            })
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <Input
                            placeholder="Cargo"
                            value={editingShipment.cargo}
                            onChange={(e) =>
                                setEditingShipment({
                                    ...editingShipment,
                                    cargo: e.target.value,
                                })
                            }
                        />
                        <Input
                            placeholder="Weight (tons)"
                            value={editingShipment.weight}
                            onChange={(e) =>
                                setEditingShipment({
                                    ...editingShipment,
                                    weight: e.target.value,
                                })
                            }
                        />
                        <Input
                            placeholder="Customer Contact"
                            value={editingShipment.customerContact}
                            onChange={(e) =>
                                setEditingShipment({
                                    ...editingShipment,
                                    customerContact: e.target.value,
                                })
                            }
                        />
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Priority
                            </label>
                            <Select
                                value={editingShipment.priority || ''}
                                onValueChange={(value) =>
                                    setEditingShipment({
                                        ...editingShipment,
                                        priority: value as
                                            | 'Low'
                                            | 'Medium'
                                            | 'High',
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">
                                        Medium
                                    </SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit">Save Changes</Button>
                    </form>
                </DialogContent>
            </Dialog>

            <StatusUpdateDialog
                isOpen={isStatusUpdateDialogOpen}
                onClose={() => setIsStatusUpdateDialogOpen(false)}
                shipmentId={updatingShipmentStatusId}
            />

            {/* Tracking History Dialog */}
            <Dialog
                open={isTrackingHistoryDialogOpen}
                onOpenChange={setIsTrackingHistoryDialogOpen}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-gray-100">
                            Shipment Tracking History
                        </DialogTitle>
                    </DialogHeader>
                    <ShipmentTrackingHistory shipmentId={viewingShipmentId} />
                </DialogContent>
            </Dialog>
        </div>
    );
}

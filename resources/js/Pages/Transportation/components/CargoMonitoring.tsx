import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
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
import { Pencil2Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { FilterIcon, PackageIcon, SearchIcon, TruckIcon } from 'lucide-react';
import { useState } from 'react';
import {
    useCargoMonitoring,
    useFleetManagement,
    useShipmentTracking,
} from '../hooks';
import { CargoFormData, CargoItem } from '../types';
import CargoUnloadingDialog from './CargoUnloadingDialog';

export default function CargoMonitoring() {
    const {
        cargoItems,
        loading,
        error,
        addCargoItem,
        updateCargoStatus,
        updateCargoItem,
        deleteCargoItem,
        getCargoByShipment,
        fetchCargoItems,
    } = useCargoMonitoring();

    const { shipments } = useShipmentTracking();
    const { trucks } = useFleetManagement();

    const [cargoSearch, setCargoSearch] = useState('');
    const [truckFilter, setTruckFilter] = useState('all');
    const [originFilter, setOriginFilter] = useState('all');
    const [destinationFilter, setDestinationFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [cargoToDelete, setCargoToDelete] = useState<CargoItem | null>(null);
    const [selectedShipmentId, setSelectedShipmentId] = useState('');
    const [editingCargo, setEditingCargo] = useState<CargoFormData>({
        name: '',
        quantity: '',
        unit: 'pieces',
        description: '',
        specialHandling: '',
        temperature: '',
        humidity: '',
    });
    const [editingCargoId, setEditingCargoId] = useState<string>('');
    const [newCargo, setNewCargo] = useState<CargoFormData>({
        name: '',
        quantity: '',
        unit: 'pieces',
        description: '',
        specialHandling: '',
        temperature: '',
        humidity: '',
    });
    const [isUnloadingDialogOpen, setIsUnloadingDialogOpen] = useState(false);
    const [selectedCargoForUnloading, setSelectedCargoForUnloading] =
        useState<CargoItem | null>(null);

    const filteredCargoItems = (cargoItems || []).filter((cargo) => {
        const searchTerm = cargoSearch.toLowerCase();
        const shipment = shipments.find((s) => s.id === cargo.shipment_id);
        const truck = shipment
            ? trucks.find((t) => t.id === shipment.truck_id)
            : null;

        const matchesSearch =
            (cargo.name && cargo.name.toLowerCase().includes(searchTerm)) ||
            (cargo.description &&
                cargo.description.toLowerCase().includes(searchTerm)) ||
            (cargo.special_handling &&
                cargo.special_handling.toLowerCase().includes(searchTerm));

        const matchesTruckFilter =
            truckFilter === 'all' ||
            !truckFilter ||
            (truck &&
                truck.plate_number
                    .toLowerCase()
                    .includes(truckFilter.toLowerCase()));

        const matchesOriginFilter =
            originFilter === 'all' ||
            !originFilter ||
            (shipment &&
                shipment.origin
                    .toLowerCase()
                    .includes(originFilter.toLowerCase()));

        const matchesDestinationFilter =
            destinationFilter === 'all' ||
            !destinationFilter ||
            (shipment &&
                shipment.destination
                    .toLowerCase()
                    .includes(destinationFilter.toLowerCase()));

        const matchesStatusFilter =
            statusFilter === 'all' ||
            !statusFilter ||
            cargo.status === statusFilter;

        return (
            matchesSearch &&
            matchesTruckFilter &&
            matchesOriginFilter &&
            matchesDestinationFilter &&
            matchesStatusFilter
        );
    });

    // Get unique origins and destinations for filter options
    const uniqueOrigins = Array.from(
        new Set(shipments.map((shipment) => shipment.origin)),
    ).sort();
    const uniqueDestinations = Array.from(
        new Set(shipments.map((shipment) => shipment.destination)),
    ).sort();

    const handleAddCargoItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedShipmentId) {
            alert('Please select a shipment ID');
            return;
        }
        try {
            await addCargoItem(selectedShipmentId, newCargo);
            setNewCargo({
                name: '',
                quantity: '',
                unit: 'pieces',
                description: '',
                specialHandling: '',
                temperature: '',
                humidity: '',
            });
            setSelectedShipmentId('');
        } catch (error) {
            console.error('Failed to add cargo item:', error);
        }
    };

    const handleEditCargoItem = (cargo: CargoItem) => {
        setEditingCargoId(cargo.id);
        setEditingCargo({
            name: cargo.name,
            quantity: cargo.quantity.toString(),
            unit: cargo.unit,
            description: cargo.description || '',
            specialHandling: cargo.special_handling || '',
            temperature: cargo.temperature?.toString() || '',
            humidity: cargo.humidity?.toString() || '',
        });
        setIsEditDialogOpen(true);
    };

    const saveEditedCargoItem = async (cargoId: string) => {
        try {
            const cargo = (cargoItems || []).find((c) => c.id === cargoId);
            if (cargo) {
                await updateCargoItem(cargoId, {
                    shipmentId: cargo.shipment_id,
                    name: editingCargo.name,
                    quantity: editingCargo.quantity,
                    unit: editingCargo.unit,
                    description: editingCargo.description,
                    specialHandling: editingCargo.specialHandling,
                    status: cargo.status,
                    temperature: editingCargo.temperature,
                    humidity: editingCargo.humidity,
                });
            }
            setIsEditDialogOpen(false);
        } catch (error) {
            console.error('Failed to edit cargo item:', error);
        }
    };

    const handleDeleteCargoItem = (cargo: CargoItem) => {
        setCargoToDelete(cargo);
        setShowDeleteDialog(true);
    };

    const confirmDeleteCargoItem = async () => {
        if (!cargoToDelete) return;

        try {
            await deleteCargoItem(cargoToDelete.id);
            setShowDeleteDialog(false);
            setCargoToDelete(null);
        } catch (error) {
            console.error('Failed to delete cargo item:', error);
        }
    };

    const handleUpdateCargoStatus = async (
        cargoId: string,
        status: CargoItem['status'],
    ) => {
        try {
            await updateCargoStatus(cargoId, status);
        } catch (error) {
            console.error('Failed to update cargo status:', error);
        }
    };

    const handleOpenUnloadingDialog = (cargo: CargoItem) => {
        setSelectedCargoForUnloading(cargo);
        setIsUnloadingDialogOpen(true);
    };

    const handleUnloadingUpdate = () => {
        // Refresh cargo items to get updated unloading data
        fetchCargoItems();
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-100">
                        Cargo Monitoring
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="py-4 text-center text-gray-600 dark:text-gray-400">
                        Loading cargo data...
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
                        Cargo Monitoring
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
                        <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                            <PackageIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Cargo Monitoring
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Track and manage cargo items
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {filteredCargoItems.length} items
                        </div>
                        <Button
                            onClick={() => setIsEditDialogOpen(true)}
                            className="bg-purple-600 text-white shadow-sm hover:bg-purple-700"
                        >
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Add Cargo
                        </Button>
                    </div>
                </div>
            </div>
            <div className="p-6">
                {/* Enhanced Search and Filters Section */}
                <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900/50">
                    <div className="mb-4 flex items-center space-x-2">
                        <FilterIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Search & Filters
                        </h3>
                    </div>

                    {/* Search and Filters in One Row */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        {/* Search Input */}
                        <div className="lg:col-span-1">
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
                                <Input
                                    placeholder="Search cargo items..."
                                    value={cargoSearch}
                                    onChange={(e) =>
                                        setCargoSearch(e.target.value)
                                    }
                                    className="border-gray-300 bg-white pl-10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-purple-400"
                                />
                            </div>
                        </div>

                        {/* Truck Filter */}
                        <div className="lg:col-span-1">
                            <Select
                                value={truckFilter}
                                onValueChange={setTruckFilter}
                            >
                                <SelectTrigger className="border-gray-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-purple-400">
                                    <SelectValue placeholder="All Trucks" />
                                </SelectTrigger>
                                <SelectContent className="border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                                    <SelectItem
                                        value="all"
                                        className="text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
                                    >
                                        All Trucks
                                    </SelectItem>
                                    {trucks.map((truck) => (
                                        <SelectItem
                                            key={truck.id}
                                            value={truck.plate_number}
                                            className="text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
                                        >
                                            {truck.plate_number} - {truck.model}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Origin Filter */}
                        <div className="lg:col-span-1">
                            <Select
                                value={originFilter}
                                onValueChange={setOriginFilter}
                            >
                                <SelectTrigger className="border-gray-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-purple-400">
                                    <SelectValue placeholder="All Origins" />
                                </SelectTrigger>
                                <SelectContent className="border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                                    <SelectItem
                                        value="all"
                                        className="text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
                                    >
                                        All Origins
                                    </SelectItem>
                                    {uniqueOrigins.map((origin) => (
                                        <SelectItem
                                            key={origin}
                                            value={origin}
                                            className="text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
                                        >
                                            {origin}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Destination Filter */}
                        <div className="lg:col-span-1">
                            <Select
                                value={destinationFilter}
                                onValueChange={setDestinationFilter}
                            >
                                <SelectTrigger className="border-gray-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-purple-400">
                                    <SelectValue placeholder="All Destinations" />
                                </SelectTrigger>
                                <SelectContent className="border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                                    <SelectItem
                                        value="all"
                                        className="text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
                                    >
                                        All Destinations
                                    </SelectItem>
                                    {uniqueDestinations.map((destination) => (
                                        <SelectItem
                                            key={destination}
                                            value={destination}
                                            className="text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
                                        >
                                            {destination}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status Filter */}
                        <div className="lg:col-span-1">
                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger className="border-gray-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-purple-400">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent className="border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                                    <SelectItem
                                        value="all"
                                        className="text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
                                    >
                                        All Status
                                    </SelectItem>
                                    <SelectItem
                                        value="Loaded"
                                        className="text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
                                    >
                                        Loaded
                                    </SelectItem>
                                    <SelectItem
                                        value="In Transit"
                                        className="text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
                                    >
                                        In Transit
                                    </SelectItem>
                                    <SelectItem
                                        value="Delivered"
                                        className="text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
                                    >
                                        Delivered
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                    <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
                            <TableRow className="border-gray-200 dark:border-gray-700">
                                <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                                    Name
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                                    Shipment
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                                    Truck
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                                    Quantity
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                                    Unloaded
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                                    Remaining
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                                    Date Loaded
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                                    Status
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCargoItems.map((item) => {
                                const shipment = shipments.find(
                                    (s) => s.id === item.shipment_id,
                                );
                                const truck = shipment
                                    ? trucks.find(
                                          (t) => t.id === shipment.truck_id,
                                      )
                                    : null;
                                return (
                                    <TableRow
                                        key={item.id}
                                        className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50"
                                    >
                                        <TableCell>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                                    {item.name}
                                                </div>
                                                {item.description && (
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {item.description}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {shipment ? (
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                                        #{shipment.id}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {shipment.origin} →{' '}
                                                        {shipment.destination}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    Unknown
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {truck ? (
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                                        {truck.plate_number}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {truck.model}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    Unknown
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-gray-100">
                                            {item.quantity.toLocaleString()}{' '}
                                            {item.unit}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-gray-100">
                                            <div className="flex items-center space-x-1">
                                                <span className="font-medium text-blue-600 dark:text-blue-400">
                                                    {(
                                                        item.total_unloaded_quantity ||
                                                        0
                                                    ).toLocaleString()}
                                                </span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {item.unit}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-gray-100">
                                            <div className="flex items-center space-x-1">
                                                <span className="font-medium text-orange-600 dark:text-orange-400">
                                                    {(
                                                        item.remaining_quantity ||
                                                        item.quantity
                                                    ).toLocaleString()}
                                                </span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {item.unit}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-gray-100">
                                            {item.created_at
                                                ? new Date(
                                                      item.created_at,
                                                  ).toLocaleDateString(
                                                      'en-US',
                                                      {
                                                          year: 'numeric',
                                                          month: 'short',
                                                          day: 'numeric',
                                                          hour: '2-digit',
                                                          minute: '2-digit',
                                                      },
                                                  )
                                                : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col space-y-1">
                                                <Badge
                                                    variant={
                                                        item.status ===
                                                        'Delivered'
                                                            ? 'default'
                                                            : item.status ===
                                                                'In Transit'
                                                              ? 'secondary'
                                                              : item.status ===
                                                                  'Damaged'
                                                                ? 'destructive'
                                                                : 'outline'
                                                    }
                                                >
                                                    {item.status}
                                                </Badge>
                                                {item.is_partially_unloaded && (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-yellow-200 bg-yellow-50 text-xs text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                                                    >
                                                        Partially Delivered
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleOpenUnloadingDialog(
                                                            item,
                                                        )
                                                    }
                                                    disabled={
                                                        item.status === 'Loaded'
                                                    }
                                                    className={`h-8 w-8 p-0 ${
                                                        item.status === 'Loaded'
                                                            ? 'cursor-not-allowed opacity-50'
                                                            : 'hover:bg-green-50 dark:hover:bg-green-900/20'
                                                    }`}
                                                    title={
                                                        item.status === 'Loaded'
                                                            ? 'Cargo must be in transit to manage unloading'
                                                            : 'Manage unloading records'
                                                    }
                                                >
                                                    <TruckIcon className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleEditCargoItem(
                                                            item,
                                                        )
                                                    }
                                                    disabled={
                                                        item.status ===
                                                            'In Transit' ||
                                                        item.status ===
                                                            'Delivered'
                                                    }
                                                    className={`h-8 w-8 p-0 ${
                                                        item.status ===
                                                            'In Transit' ||
                                                        item.status ===
                                                            'Delivered'
                                                            ? 'cursor-not-allowed opacity-50'
                                                            : 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                                    }`}
                                                    title={
                                                        item.status ===
                                                        'In Transit'
                                                            ? 'Cannot edit cargo items that are in transit'
                                                            : item.status ===
                                                                'Delivered'
                                                              ? 'Cannot edit cargo items that are delivered'
                                                              : 'Edit cargo item'
                                                    }
                                                >
                                                    <Pencil2Icon className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDeleteCargoItem(
                                                            item,
                                                        )
                                                    }
                                                    disabled={
                                                        item.status ===
                                                            'In Transit' ||
                                                        item.status ===
                                                            'Delivered'
                                                    }
                                                    className={`h-8 w-8 p-0 ${
                                                        item.status ===
                                                            'In Transit' ||
                                                        item.status ===
                                                            'Delivered'
                                                            ? 'cursor-not-allowed opacity-50'
                                                            : 'hover:bg-red-50 dark:hover:bg-red-900/20'
                                                    }`}
                                                    title={
                                                        item.status ===
                                                            'In Transit' ||
                                                        item.status ===
                                                            'Delivered'
                                                            ? 'Cannot delete cargo items that are in transit or delivered'
                                                            : 'Delete cargo item'
                                                    }
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-gray-100">
                            {editingCargoId
                                ? 'Edit Cargo Item'
                                : 'Add New Cargo Item'}
                        </DialogTitle>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (editingCargoId) {
                                saveEditedCargoItem(editingCargoId);
                            } else {
                                handleAddCargoItem(e);
                            }
                        }}
                    >
                        <div className="grid gap-4 py-4">
                            {!editingCargoId && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Shipment
                                    </label>
                                    <Select
                                        value={selectedShipmentId || ''}
                                        onValueChange={(value) =>
                                            setSelectedShipmentId(value)
                                        }
                                    >
                                        <SelectTrigger className="border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100">
                                            <SelectValue placeholder="Select a shipment">
                                                {selectedShipmentId &&
                                                    shipments.find(
                                                        (shipment) =>
                                                            shipment.id ===
                                                            selectedShipmentId,
                                                    ) &&
                                                    `#${shipments.find((shipment) => shipment.id === selectedShipmentId)?.id} - ${shipments.find((shipment) => shipment.id === selectedShipmentId)?.origin} → ${shipments.find((shipment) => shipment.id === selectedShipmentId)?.destination}`}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                                            {shipments.map((shipment) => (
                                                <SelectItem
                                                    key={shipment.id}
                                                    value={shipment.id.toString()}
                                                    className="text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    #{shipment.id} -{' '}
                                                    {shipment.origin} →{' '}
                                                    {shipment.destination} (
                                                    {shipment.status})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {shipments.length === 0 && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            No shipments available
                                        </p>
                                    )}
                                </div>
                            )}
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Input
                                    placeholder="Name"
                                    value={
                                        editingCargoId
                                            ? editingCargo.name
                                            : newCargo.name
                                    }
                                    onChange={(e) =>
                                        editingCargoId
                                            ? setEditingCargo({
                                                  ...editingCargo,
                                                  name: e.target.value,
                                              })
                                            : setNewCargo({
                                                  ...newCargo,
                                                  name: e.target.value,
                                              })
                                    }
                                    className="border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-400"
                                />
                                <Input
                                    placeholder="Quantity"
                                    type="number"
                                    value={
                                        editingCargoId
                                            ? editingCargo.quantity
                                            : newCargo.quantity
                                    }
                                    onChange={(e) =>
                                        editingCargoId
                                            ? setEditingCargo({
                                                  ...editingCargo,
                                                  quantity: e.target.value,
                                              })
                                            : setNewCargo({
                                                  ...newCargo,
                                                  quantity: e.target.value,
                                              })
                                    }
                                    className="border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-400"
                                />
                                <Select
                                    value={
                                        (editingCargoId
                                            ? editingCargo.unit
                                            : newCargo.unit) || ''
                                    }
                                    onValueChange={(value) =>
                                        editingCargoId
                                            ? setEditingCargo({
                                                  ...editingCargo,
                                                  unit: value as CargoItem['unit'],
                                              })
                                            : setNewCargo({
                                                  ...newCargo,
                                                  unit: value as CargoItem['unit'],
                                              })
                                    }
                                >
                                    <SelectTrigger className="border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100">
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent className="border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                                        <SelectItem
                                            value="kg"
                                            className="text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
                                        >
                                            kg
                                        </SelectItem>
                                        <SelectItem
                                            value="pieces"
                                            className="text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
                                        >
                                            pieces
                                        </SelectItem>
                                        <SelectItem
                                            value="pallets"
                                            className="text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
                                        >
                                            pallets
                                        </SelectItem>
                                        <SelectItem
                                            value="boxes"
                                            className="text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
                                        >
                                            boxes
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Input
                                placeholder="Description"
                                value={
                                    editingCargoId
                                        ? editingCargo.description
                                        : newCargo.description
                                }
                                onChange={(e) =>
                                    editingCargoId
                                        ? setEditingCargo({
                                              ...editingCargo,
                                              description: e.target.value,
                                          })
                                        : setNewCargo({
                                              ...newCargo,
                                              description: e.target.value,
                                          })
                                }
                                className="border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-400"
                            />
                            <Input
                                placeholder="Special Handling"
                                value={
                                    editingCargoId
                                        ? editingCargo.specialHandling
                                        : newCargo.specialHandling
                                }
                                onChange={(e) =>
                                    editingCargoId
                                        ? setEditingCargo({
                                              ...editingCargo,
                                              specialHandling: e.target.value,
                                          })
                                        : setNewCargo({
                                              ...newCargo,
                                              specialHandling: e.target.value,
                                          })
                                }
                                className="border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-400"
                            />
                            <div className="grid grid-cols-2 items-center gap-4">
                                <Input
                                    placeholder="Temperature"
                                    type="number"
                                    value={
                                        editingCargoId
                                            ? editingCargo.temperature
                                            : newCargo.temperature
                                    }
                                    onChange={(e) =>
                                        editingCargoId
                                            ? setEditingCargo({
                                                  ...editingCargo,
                                                  temperature: e.target.value,
                                              })
                                            : setNewCargo({
                                                  ...newCargo,
                                                  temperature: e.target.value,
                                              })
                                    }
                                    className="border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-400"
                                />
                                <Input
                                    placeholder="Humidity"
                                    type="number"
                                    value={
                                        editingCargoId
                                            ? editingCargo.humidity
                                            : newCargo.humidity
                                    }
                                    onChange={(e) =>
                                        editingCargoId
                                            ? setEditingCargo({
                                                  ...editingCargo,
                                                  humidity: e.target.value,
                                              })
                                            : setNewCargo({
                                                  ...newCargo,
                                                  humidity: e.target.value,
                                              })
                                    }
                                    className="border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-400"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="bg-purple-600 text-white hover:bg-purple-700"
                            >
                                {editingCargoId ? 'Save Changes' : 'Add Cargo'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="max-w-md border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                    <DialogHeader>
                        <div className="flex items-center space-x-3">
                            <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/30">
                                <TrashIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <DialogTitle className="text-gray-900 dark:text-gray-100">
                                    Delete Cargo Item
                                </DialogTitle>
                                <DialogDescription className="text-gray-600 dark:text-gray-400">
                                    This action cannot be undone.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="py-4">
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Name:
                                    </span>
                                    <span className="text-sm text-gray-900 dark:text-gray-100">
                                        {cargoToDelete?.name}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Quantity:
                                    </span>
                                    <span className="text-sm text-gray-900 dark:text-gray-100">
                                        {cargoToDelete?.quantity}{' '}
                                        {cargoToDelete?.unit}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Status:
                                    </span>
                                    <span className="text-sm text-gray-900 dark:text-gray-100">
                                        {cargoToDelete?.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                            <div className="flex items-start space-x-2">
                                <TrashIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                                <div className="text-sm text-red-800 dark:text-red-200">
                                    <p className="font-medium">
                                        Warning: This will permanently delete
                                        the cargo item and all associated data.
                                    </p>
                                    <p className="mt-1">
                                        This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowDeleteDialog(false);
                                setCargoToDelete(null);
                            }}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeleteCargoItem}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Delete Cargo Item
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cargo Unloading Dialog */}
            {selectedCargoForUnloading && (
                <CargoUnloadingDialog
                    isOpen={isUnloadingDialogOpen}
                    onClose={() => {
                        setIsUnloadingDialogOpen(false);
                        setSelectedCargoForUnloading(null);
                    }}
                    cargoItem={selectedCargoForUnloading}
                    onUnloadingUpdate={handleUnloadingUpdate}
                />
            )}
        </div>
    );
}

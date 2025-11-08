import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
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
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import {
    EditIcon,
    PlusIcon,
    SearchIcon,
    TrashIcon,
    TruckIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FoodDeliveryDriver } from '../types';

interface Props extends PageProps {
    drivers?: FoodDeliveryDriver[];
    driver?: FoodDeliveryDriver;
    mode?: 'create' | 'edit';
}

interface DriverFormData {
    name: string;
    phone: string;
    email: string;
    vehicle_type: string;
    license_number: string;
    status: 'available' | 'busy' | 'offline';
    current_location: string;
    current_coordinates: string;
}

export default function AdminDrivers({
    auth,
    drivers: initialDrivers,
    driver: initialDriver,
    mode: initialMode,
}: Props) {
    const [drivers, setDrivers] = useState<FoodDeliveryDriver[]>(
        initialDrivers || [],
    );
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(!!initialMode);
    const [editingDriver, setEditingDriver] =
        useState<FoodDeliveryDriver | null>(initialDriver || null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<DriverFormData>({
        name: '',
        phone: '',
        email: '',
        vehicle_type: '',
        license_number: '',
        status: 'available',
        current_location: '',
        current_coordinates: '',
    });

    useEffect(() => {
        fetchDrivers();
    }, [search]);

    useEffect(() => {
        if (editingDriver) {
            setFormData({
                name: editingDriver.name,
                phone: editingDriver.phone,
                email: editingDriver.email || '',
                vehicle_type: editingDriver.vehicle_type || '',
                license_number: editingDriver.license_number || '',
                status: editingDriver.status,
                current_location: editingDriver.current_location || '',
                current_coordinates: editingDriver.current_coordinates || '',
            });
        } else {
            setFormData({
                name: '',
                phone: '',
                email: '',
                vehicle_type: '',
                license_number: '',
                status: 'available',
                current_location: '',
                current_coordinates: '',
            });
        }
    }, [editingDriver]);

    const fetchDrivers = async () => {
        setLoading(true);
        try {
            const params: any = {
                client_identifier: (auth.user as any)?.identifier,
            };
            if (search) {
                params.search = search;
            }

            const response = await axios.get('/food-delivery/drivers/list', {
                params,
            });
            if (response.data.success) {
                setDrivers(response.data.data || []);
            }
        } catch (error: any) {
            toast.error('Failed to load drivers');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                ...formData,
                client_identifier: (auth.user as any)?.identifier,
            };

            let response;
            if (editingDriver) {
                response = await axios.put(
                    `/food-delivery/drivers/${editingDriver.id}`,
                    payload,
                );
            } else {
                response = await axios.post('/food-delivery/drivers', payload);
            }

            if (response.data.success) {
                toast.success(
                    editingDriver
                        ? 'Driver updated successfully'
                        : 'Driver created successfully',
                );
                setDialogOpen(false);
                setEditingDriver(null);
                fetchDrivers();
                router.visit('/food-delivery/admin/drivers', { replace: true });
            }
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ||
                    (editingDriver
                        ? 'Failed to update driver'
                        : 'Failed to create driver'),
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (driverId: number) => {
        if (!confirm('Are you sure you want to delete this driver?')) return;

        try {
            const response = await axios.delete(
                `/food-delivery/drivers/${driverId}`,
                {
                    params: {
                        client_identifier: (auth.user as any)?.identifier,
                    },
                },
            );
            if (response.data.success) {
                toast.success('Driver deleted successfully');
                fetchDrivers();
            }
        } catch (error: any) {
            toast.error('Failed to delete driver');
        }
    };

    const handleEdit = (driver: FoodDeliveryDriver) => {
        setEditingDriver(driver);
        setDialogOpen(true);
    };

    const handleCreate = () => {
        setEditingDriver(null);
        setDialogOpen(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'busy':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'offline':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                            <TruckIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-100">
                                Drivers Management
                            </h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Manage delivery drivers
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleCreate}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Add Driver
                    </Button>
                </div>
            }
        >
            <Head title="Drivers Management" />

            <div className="space-y-6 p-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Search drivers..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {loading ? (
                    <div className="py-12 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900 dark:border-white"></div>
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 dark:bg-gray-700">
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Name
                                        </TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Phone
                                        </TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Vehicle
                                        </TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Status
                                        </TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Rating
                                        </TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Deliveries
                                        </TableHead>
                                        <TableHead className="text-right text-gray-900 dark:text-white">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {drivers.map((driver) => (
                                        <TableRow
                                            key={driver.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {driver.name}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {driver.phone}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {driver.vehicle_type || 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(driver.status)}`}
                                                >
                                                    {driver.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {driver.rating &&
                                                typeof driver.rating ===
                                                    'number'
                                                    ? driver.rating.toFixed(1)
                                                    : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {driver.total_deliveries}
                                            </TableCell>
                                            <TableCell className="text-right text-gray-900 dark:text-white">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleEdit(driver)
                                                        }
                                                    >
                                                        <EditIcon className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDelete(
                                                                driver.id,
                                                            )
                                                        }
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Create/Edit Dialog */}
                <Dialog
                    open={dialogOpen}
                    onOpenChange={(open) => {
                        setDialogOpen(open);
                        if (!open) {
                            setEditingDriver(null);
                            router.visit('/food-delivery/admin/drivers', {
                                replace: true,
                            });
                        }
                    }}
                >
                    <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingDriver ? 'Edit Driver' : 'Add Driver'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                name: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone *</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                phone: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                email: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="status">Status *</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(
                                            value:
                                                | 'available'
                                                | 'busy'
                                                | 'offline',
                                        ) =>
                                            setFormData({
                                                ...formData,
                                                status: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="available">
                                                Available
                                            </SelectItem>
                                            <SelectItem value="busy">
                                                Busy
                                            </SelectItem>
                                            <SelectItem value="offline">
                                                Offline
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="vehicle_type">
                                        Vehicle Type
                                    </Label>
                                    <Input
                                        id="vehicle_type"
                                        value={formData.vehicle_type}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                vehicle_type: e.target.value,
                                            })
                                        }
                                        placeholder="e.g., Motorcycle, Car, Bicycle"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="license_number">
                                        License Number
                                    </Label>
                                    <Input
                                        id="license_number"
                                        value={formData.license_number}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                license_number: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="current_location">
                                        Current Location
                                    </Label>
                                    <Input
                                        id="current_location"
                                        value={formData.current_location}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                current_location:
                                                    e.target.value,
                                            })
                                        }
                                        placeholder="e.g., Manila, Philippines"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="current_coordinates">
                                        Coordinates (lat,lng)
                                    </Label>
                                    <Input
                                        id="current_coordinates"
                                        value={formData.current_coordinates}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                current_coordinates:
                                                    e.target.value,
                                            })
                                        }
                                        placeholder="14.5995,120.9842"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setDialogOpen(false);
                                        setEditingDriver(null);
                                        router.visit(
                                            '/food-delivery/admin/drivers',
                                            { replace: true },
                                        );
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={saving}>
                                    {saving
                                        ? 'Saving...'
                                        : editingDriver
                                          ? 'Update Driver'
                                          : 'Create Driver'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}

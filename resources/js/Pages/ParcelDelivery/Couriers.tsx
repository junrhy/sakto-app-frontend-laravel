import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';
import { PackageIcon, PlusIcon, EditIcon, TrashIcon, SearchIcon, FilterIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Textarea } from '@/Components/ui/textarea';
import { ParcelDeliveryCourier, CourierFormData } from './types';
import axios from 'axios';
import { toast } from 'sonner';

interface Props extends PageProps {
    couriers?: ParcelDeliveryCourier[];
}

export default function ParcelDeliveryCouriers({ auth, couriers: initialCouriers }: Props) {
    const [couriers, setCouriers] = useState<ParcelDeliveryCourier[]>(initialCouriers || []);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCourier, setEditingCourier] = useState<ParcelDeliveryCourier | null>(null);
    const [formData, setFormData] = useState<CourierFormData>({
        name: '',
        phone: '',
        email: '',
        vehicle_type: '',
        status: 'available',
        current_location: '',
        current_coordinates: '',
        notes: '',
    });

    useEffect(() => {
        fetchCouriers();
    }, [search, statusFilter]);

    const fetchCouriers = async () => {
        setLoading(true);
        try {
            const params: any = {
                client_identifier: auth.user?.identifier,
            };
            if (search) {
                params.search = search;
            }
            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }

            const response = await axios.get('/parcel-delivery/couriers/list', { params });
            if (response.data.success) {
                setCouriers(response.data.data || []);
            }
        } catch (error: any) {
            toast.error('Failed to load couriers');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (courier?: ParcelDeliveryCourier) => {
        if (courier) {
            setEditingCourier(courier);
            setFormData({
                name: courier.name,
                phone: courier.phone,
                email: courier.email || '',
                vehicle_type: courier.vehicle_type || '',
                status: courier.status,
                current_location: courier.current_location || '',
                current_coordinates: courier.current_coordinates || '',
                notes: courier.notes || '',
            });
        } else {
            setEditingCourier(null);
            setFormData({
                name: '',
                phone: '',
                email: '',
                vehicle_type: '',
                status: 'available',
                current_location: '',
                current_coordinates: '',
                notes: '',
            });
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingCourier(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = editingCourier
                ? `/parcel-delivery/couriers/${editingCourier.id}`
                : '/parcel-delivery/couriers';
            const method = editingCourier ? 'put' : 'post';

            const response = await axios[method](url, {
                ...formData,
                client_identifier: auth.user?.identifier,
            });

            if (response.data.success) {
                toast.success(editingCourier ? 'Courier updated successfully' : 'Courier created successfully');
                handleCloseDialog();
                fetchCouriers();
            } else {
                toast.error(response.data.message || 'Failed to save courier');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save courier');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this courier?')) {
            return;
        }

        setLoading(true);
        try {
            const response = await axios.delete(`/parcel-delivery/couriers/${id}`, {
                params: {
                    client_identifier: auth.user?.identifier,
                },
            });

            if (response.data.success) {
                toast.success('Courier deleted successfully');
                fetchCouriers();
            } else {
                toast.error(response.data.message || 'Failed to delete courier');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete courier');
        } finally {
            setLoading(false);
        }
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
                        <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                            <PackageIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-100">
                                Courier Management
                            </h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Manage your delivery couriers
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.visit('/parcel-delivery')}
                        >
                            Back to Deliveries
                        </Button>
                        <Button
                            onClick={() => handleOpenDialog()}
                            className="flex items-center space-x-2"
                        >
                            <PlusIcon className="h-4 w-4" />
                            <span>Add Courier</span>
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Courier Management" />

            <div className="space-y-6 p-6">
                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Search couriers..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="busy">Busy</SelectItem>
                                    <SelectItem value="offline">Offline</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Couriers Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 dark:bg-gray-700">
                                    <TableHead className="text-gray-900 dark:text-white">Name</TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">Contact</TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">Vehicle Type</TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">Status</TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">Location</TableHead>
                                    <TableHead className="text-right text-gray-900 dark:text-white">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-gray-500">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : couriers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-gray-500">
                                            No couriers found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    couriers.map((courier) => (
                                        <TableRow key={courier.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <TableCell className="text-gray-900 dark:text-white font-medium">
                                                {courier.name}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                <div>
                                                    <div>{courier.phone}</div>
                                                    {courier.email && (
                                                        <div className="text-sm text-gray-500">{courier.email}</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {courier.vehicle_type || '-'}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(courier.status)}`}>
                                                    {courier.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {courier.current_location || '-'}
                                            </TableCell>
                                            <TableCell className="text-right text-gray-900 dark:text-white">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleOpenDialog(courier)}
                                                    >
                                                        <EditIcon className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(courier.id)}
                                                    >
                                                        <TrashIcon className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-gray-100">
                            {editingCourier ? 'Edit Courier' : 'Add Courier'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone *</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="vehicle_type">Vehicle Type</Label>
                                <Input
                                    id="vehicle_type"
                                    value={formData.vehicle_type}
                                    onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                                    placeholder="e.g., Motorcycle, Van, Truck"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value as 'available' | 'busy' | 'offline' })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="busy">Busy</SelectItem>
                                    <SelectItem value="offline">Offline</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="current_location">Current Location</Label>
                            <Input
                                id="current_location"
                                value={formData.current_location}
                                onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
                                placeholder="e.g., Manila, Quezon City"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="current_coordinates">Coordinates (lat,lng)</Label>
                            <Input
                                id="current_coordinates"
                                value={formData.current_coordinates}
                                onChange={(e) => setFormData({ ...formData, current_coordinates: e.target.value })}
                                placeholder="e.g., 14.5995,120.9842"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                                placeholder="Additional notes about the courier"
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCloseDialog}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : editingCourier ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}


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
    UtensilsIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FoodDeliveryRestaurant, RestaurantFormData } from '../types';

interface Props extends PageProps {
    restaurants?: FoodDeliveryRestaurant[];
    restaurant?: FoodDeliveryRestaurant;
    mode?: 'create' | 'edit';
}

export default function AdminRestaurants({
    auth,
    restaurants: initialRestaurants,
    restaurant: initialRestaurant,
    mode: initialMode,
}: Props) {
    const [restaurants, setRestaurants] = useState<FoodDeliveryRestaurant[]>(
        initialRestaurants || [],
    );
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(!!initialMode);
    const [editingRestaurant, setEditingRestaurant] =
        useState<FoodDeliveryRestaurant | null>(initialRestaurant || null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<RestaurantFormData>({
        name: '',
        description: '',
        logo: '',
        cover_image: '',
        address: '',
        coordinates: '',
        phone: '',
        email: '',
        status: 'active',
        delivery_fee: '0',
        minimum_order_amount: '0',
        estimated_prep_time: '30',
    });

    useEffect(() => {
        fetchRestaurants();
    }, [search]);

    useEffect(() => {
        if (editingRestaurant) {
            setFormData({
                name: editingRestaurant.name,
                description: editingRestaurant.description || '',
                logo: editingRestaurant.logo || '',
                cover_image: editingRestaurant.cover_image || '',
                address: editingRestaurant.address,
                coordinates: editingRestaurant.coordinates || '',
                phone: editingRestaurant.phone,
                email: editingRestaurant.email || '',
                status: editingRestaurant.status,
                delivery_fee: editingRestaurant.delivery_fee.toString(),
                minimum_order_amount:
                    editingRestaurant.minimum_order_amount.toString(),
                estimated_prep_time:
                    editingRestaurant.estimated_prep_time.toString(),
            });
        } else {
            setFormData({
                name: '',
                description: '',
                logo: '',
                cover_image: '',
                address: '',
                coordinates: '',
                phone: '',
                email: '',
                status: 'active',
                delivery_fee: '0',
                minimum_order_amount: '0',
                estimated_prep_time: '30',
            });
        }
    }, [editingRestaurant]);

    const fetchRestaurants = async () => {
        setLoading(true);
        try {
            const params: any = {
                client_identifier: (auth.user as any)?.identifier,
            };
            if (search) {
                params.search = search;
            }

            const response = await axios.get(
                '/food-delivery/restaurants/list',
                { params },
            );
            if (response.data.success) {
                setRestaurants(response.data.data || []);
            }
        } catch (error: any) {
            toast.error('Failed to load restaurants');
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
                delivery_fee: parseFloat(formData.delivery_fee) || 0,
                minimum_order_amount:
                    parseFloat(formData.minimum_order_amount) || 0,
                estimated_prep_time:
                    parseInt(formData.estimated_prep_time) || 30,
                client_identifier: (auth.user as any)?.identifier,
            };

            let response;
            if (editingRestaurant) {
                response = await axios.put(
                    `/food-delivery/restaurants/${editingRestaurant.id}`,
                    payload,
                );
            } else {
                response = await axios.post(
                    '/food-delivery/restaurants',
                    payload,
                );
            }

            if (response.data.success) {
                toast.success(
                    editingRestaurant
                        ? 'Restaurant updated successfully'
                        : 'Restaurant created successfully',
                );
                setDialogOpen(false);
                setEditingRestaurant(null);
                fetchRestaurants();
                // Clear the URL mode parameter
                router.visit('/food-delivery/admin/restaurants', {
                    replace: true,
                });
            }
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ||
                    (editingRestaurant
                        ? 'Failed to update restaurant'
                        : 'Failed to create restaurant'),
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (restaurantId: number) => {
        if (!confirm('Are you sure you want to delete this restaurant?'))
            return;

        try {
            const response = await axios.delete(
                `/food-delivery/restaurants/${restaurantId}`,
                {
                    params: {
                        client_identifier: (auth.user as any)?.identifier,
                    },
                },
            );
            if (response.data.success) {
                toast.success('Restaurant deleted successfully');
                fetchRestaurants();
            }
        } catch (error: any) {
            toast.error('Failed to delete restaurant');
        }
    };

    const handleEdit = (restaurant: FoodDeliveryRestaurant) => {
        setEditingRestaurant(restaurant);
        setDialogOpen(true);
    };

    const handleCreate = () => {
        setEditingRestaurant(null);
        setDialogOpen(true);
    };

    const formatCurrency = (amount: number) => {
        let currency: {
            symbol: string;
            thousands_separator?: string;
            decimal_separator?: string;
        };
        const appCurrency = (auth.user as any)?.app_currency;
        if (appCurrency) {
            if (typeof appCurrency === 'string') {
                currency = JSON.parse(appCurrency);
            } else {
                currency = appCurrency;
            }
        } else {
            currency = {
                symbol: '₱',
                thousands_separator: ',',
                decimal_separator: '.',
            };
        }
        return `${currency.symbol}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                            <UtensilsIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-100">
                                Restaurants Management
                            </h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Manage all restaurants in the platform
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleCreate}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Add Restaurant
                    </Button>
                </div>
            }
        >
            <Head title="Restaurants Management" />

            <div className="space-y-6 p-6">
                {/* Search */}
                <Card>
                    <CardContent className="p-4">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Search restaurants..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Restaurants Table */}
                {loading ? (
                    <div className="py-12 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900 dark:border-white"></div>
                        <p className="mt-2 text-gray-500">
                            Loading restaurants...
                        </p>
                    </div>
                ) : restaurants.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <UtensilsIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                            <p className="text-gray-500">
                                No restaurants found
                            </p>
                        </CardContent>
                    </Card>
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
                                            Address
                                        </TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Delivery Fee
                                        </TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Status
                                        </TableHead>
                                        <TableHead className="text-right text-gray-900 dark:text-white">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {restaurants.map((restaurant) => (
                                        <TableRow
                                            key={restaurant.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {restaurant.name}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {restaurant.phone}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {restaurant.address}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {formatCurrency(
                                                    restaurant.delivery_fee,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                        restaurant.status ===
                                                        'active'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                            : restaurant.status ===
                                                                'inactive'
                                                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}
                                                >
                                                    {restaurant.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right text-gray-900 dark:text-white">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleEdit(
                                                                restaurant,
                                                            )
                                                        }
                                                    >
                                                        <EditIcon className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDelete(
                                                                restaurant.id,
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
                            setEditingRestaurant(null);
                            router.visit('/food-delivery/admin/restaurants', {
                                replace: true,
                            });
                        }
                    }}
                >
                    <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingRestaurant
                                    ? 'Edit Restaurant'
                                    : 'Add Restaurant'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="name">
                                        Restaurant Name *
                                    </Label>
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
                                                | 'active'
                                                | 'inactive'
                                                | 'closed',
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
                                            <SelectItem value="active">
                                                Active
                                            </SelectItem>
                                            <SelectItem value="inactive">
                                                Inactive
                                            </SelectItem>
                                            <SelectItem value="closed">
                                                Closed
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="description">
                                        Description
                                    </Label>
                                    <Input
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                description: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="address">Address *</Label>
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                address: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="coordinates">
                                        Coordinates (lat,lng)
                                    </Label>
                                    <Input
                                        id="coordinates"
                                        value={formData.coordinates}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                coordinates: e.target.value,
                                            })
                                        }
                                        placeholder="14.5995,120.9842"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="delivery_fee">
                                        Delivery Fee *
                                    </Label>
                                    <Input
                                        id="delivery_fee"
                                        type="number"
                                        step="0.01"
                                        value={formData.delivery_fee}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                delivery_fee: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="minimum_order_amount">
                                        Minimum Order Amount *
                                    </Label>
                                    <Input
                                        id="minimum_order_amount"
                                        type="number"
                                        step="0.01"
                                        value={formData.minimum_order_amount}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                minimum_order_amount:
                                                    e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="estimated_prep_time">
                                        Estimated Prep Time (minutes) *
                                    </Label>
                                    <Input
                                        id="estimated_prep_time"
                                        type="number"
                                        value={formData.estimated_prep_time}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                estimated_prep_time:
                                                    e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setDialogOpen(false);
                                        setEditingRestaurant(null);
                                        router.visit(
                                            '/food-delivery/admin/restaurants',
                                            { replace: true },
                                        );
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={saving}>
                                    {saving
                                        ? 'Saving...'
                                        : editingRestaurant
                                          ? 'Update Restaurant'
                                          : 'Create Restaurant'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}

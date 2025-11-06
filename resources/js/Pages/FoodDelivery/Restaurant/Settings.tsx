import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';
import { SettingsIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { FoodDeliveryRestaurant, RestaurantFormData } from '../types';
import axios from 'axios';
import { toast } from 'sonner';

interface Props extends PageProps {
    restaurant?: FoodDeliveryRestaurant;
}

export default function RestaurantSettings({ auth, restaurant: initialRestaurant }: Props) {
    const [restaurant, setRestaurant] = useState<FoodDeliveryRestaurant | null>(initialRestaurant || null);
    const [loading, setLoading] = useState(false);
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
        if (restaurant) {
            setFormData({
                name: restaurant.name,
                description: restaurant.description || '',
                logo: restaurant.logo || '',
                cover_image: restaurant.cover_image || '',
                address: restaurant.address,
                coordinates: restaurant.coordinates || '',
                phone: restaurant.phone,
                email: restaurant.email || '',
                status: restaurant.status,
                delivery_fee: restaurant.delivery_fee.toString(),
                minimum_order_amount: restaurant.minimum_order_amount.toString(),
                estimated_prep_time: restaurant.estimated_prep_time.toString(),
            });
        }
    }, [restaurant]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!restaurant) return;

        setSaving(true);
        try {
            const response = await axios.put(`/food-delivery/restaurants/${restaurant.id}`, {
                ...formData,
                client_identifier: (auth.user as any)?.identifier,
                delivery_fee: parseFloat(formData.delivery_fee),
                minimum_order_amount: parseFloat(formData.minimum_order_amount),
                estimated_prep_time: parseInt(formData.estimated_prep_time),
            });
            if (response.data.success) {
                toast.success('Restaurant settings updated successfully');
                setRestaurant(response.data.data);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update restaurant settings');
        } finally {
            setSaving(false);
        }
    };

    if (!restaurant) {
        return (
            <AuthenticatedLayout>
                <Head title="Restaurant Settings" />
                <div className="p-6 text-center">
                    <p className="text-gray-500">Restaurant not found</p>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                        <SettingsIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-100">
                            Restaurant Settings
                        </h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Manage your restaurant information and preferences
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Restaurant Settings" />

            <div className="space-y-6 p-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Restaurant Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone *</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Location & Delivery */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Location & Delivery</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="address">Address *</Label>
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="coordinates">Coordinates (lat,lng)</Label>
                                    <Input
                                        id="coordinates"
                                        value={formData.coordinates}
                                        onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                                        placeholder="e.g., 14.5995,120.9842"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="delivery_fee">Delivery Fee</Label>
                                    <Input
                                        id="delivery_fee"
                                        type="number"
                                        step="0.01"
                                        value={formData.delivery_fee}
                                        onChange={(e) => setFormData({ ...formData, delivery_fee: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="minimum_order_amount">Minimum Order Amount</Label>
                                    <Input
                                        id="minimum_order_amount"
                                        type="number"
                                        step="0.01"
                                        value={formData.minimum_order_amount}
                                        onChange={(e) => setFormData({ ...formData, minimum_order_amount: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="estimated_prep_time">Estimated Prep Time (minutes)</Label>
                                    <Input
                                        id="estimated_prep_time"
                                        type="number"
                                        value={formData.estimated_prep_time}
                                        onChange={(e) => setFormData({ ...formData, estimated_prep_time: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Button type="submit" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}


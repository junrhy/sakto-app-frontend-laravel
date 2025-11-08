import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import MerchantLayout from '@/Layouts/Merchant/MerchantLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface Props extends PageProps {}

interface RestaurantProfile {
    id: number;
    name: string;
    description?: string;
    phone?: string;
    email?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    opening_time?: string;
    closing_time?: string;
    is_open?: boolean;
}

export default function RestaurantSettings({ auth }: Props) {
    const [profile, setProfile] = useState<RestaurantProfile | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await axios.get(
                '/food-delivery/restaurants/list',
                {
                    params: {
                        client_identifier: (auth.user as any)?.identifier,
                        status: 'all',
                    },
                },
            );

            if (
                response.data.success &&
                response.data.data &&
                response.data.data.length > 0
            ) {
                setProfile(response.data.data[0]);
            }
        } catch (error: any) {
            console.error('Failed to fetch restaurant profile:', error);
        }
    };

    const handleChange = (field: keyof RestaurantProfile, value: any) => {
        if (!profile) return;
        setProfile({ ...profile, [field]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        setSaving(true);
        try {
            await axios.put(`/food-delivery/restaurants/${profile.id}`, {
                ...profile,
                client_identifier: (auth.user as any)?.identifier,
            });
        } catch (error: any) {
            console.error('Failed to save settings:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <MerchantLayout
            auth={{ user: auth.user }}
            title="Restaurant Settings"
            header={
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Settings
                </h2>
            }
        >
            <Head title="Restaurant Settings" />

            <div className="space-y-6 p-6">
                {!profile ? (
                    <Card>
                        <CardContent className="py-12 text-center text-gray-600 dark:text-gray-400">
                            Loading restaurant details...
                        </CardContent>
                    </Card>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Restaurant Profile</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={profile.name}
                                        onChange={(e) =>
                                            handleChange('name', e.target.value)
                                        }
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description">
                                        Description
                                    </Label>
                                    <Input
                                        id="description"
                                        value={profile.description ?? ''}
                                        onChange={(e) =>
                                            handleChange(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            value={profile.phone ?? ''}
                                            onChange={(e) =>
                                                handleChange(
                                                    'phone',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={profile.email ?? ''}
                                            onChange={(e) =>
                                                handleChange(
                                                    'email',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Location</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <Label htmlFor="street">Street</Label>
                                    <Input
                                        id="street"
                                        value={profile.street ?? ''}
                                        onChange={(e) =>
                                            handleChange(
                                                'street',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        value={profile.city ?? ''}
                                        onChange={(e) =>
                                            handleChange('city', e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="state">
                                        State / Province
                                    </Label>
                                    <Input
                                        id="state"
                                        value={profile.state ?? ''}
                                        onChange={(e) =>
                                            handleChange(
                                                'state',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        value={profile.country ?? ''}
                                        onChange={(e) =>
                                            handleChange(
                                                'country',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="postal_code">
                                        Postal Code
                                    </Label>
                                    <Input
                                        id="postal_code"
                                        value={profile.postal_code ?? ''}
                                        onChange={(e) =>
                                            handleChange(
                                                'postal_code',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Operating Hours</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="opening_time">
                                        Opening Time
                                    </Label>
                                    <Input
                                        id="opening_time"
                                        type="time"
                                        value={profile.opening_time ?? ''}
                                        onChange={(e) =>
                                            handleChange(
                                                'opening_time',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="closing_time">
                                        Closing Time
                                    </Label>
                                    <Input
                                        id="closing_time"
                                        type="time"
                                        value={profile.closing_time ?? ''}
                                        onChange={(e) =>
                                            handleChange(
                                                'closing_time',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Currently accepting orders
                                        </span>
                                        <Switch
                                            checked={!!profile.is_open}
                                            onCheckedChange={(checked) =>
                                                handleChange('is_open', checked)
                                            }
                                        />
                                    </label>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-3">
                            <Button type="submit" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </MerchantLayout>
    );
}

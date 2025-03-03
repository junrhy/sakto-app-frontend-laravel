import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import SettingsForm from '@/Components/Settings/SettingsForm';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import axios from 'axios';

interface OperatingHours {
    open: string;
    close: string;
    closed: boolean;
}

interface Props {
    auth: {
        user: {
            name: string;
        };
    };
    settings: {
        restaurant_name: string;
        description: string;
        address: string;
        phone: string;
        email: string;
        tax_rate: number;
        service_charge: number;
        enable_reservations: boolean;
        enable_takeout: boolean;
        enable_delivery: boolean;
        min_delivery_amount: number;
        delivery_fee: number;
        operating_hours?: {
            [key: string]: OperatingHours;
        };
    };
}

const defaultOperatingHours: { [key: string]: OperatingHours } = {
    monday: { open: '09:00', close: '17:00', closed: false },
    tuesday: { open: '09:00', close: '17:00', closed: false },
    wednesday: { open: '09:00', close: '17:00', closed: false },
    thursday: { open: '09:00', close: '17:00', closed: false },
    friday: { open: '09:00', close: '17:00', closed: false },
    saturday: { open: '09:00', close: '17:00', closed: false },
    sunday: { open: '09:00', close: '17:00', closed: true },
};

export default function RestaurantSettings({ auth, settings }: Props) {
    const settingsWithDefaults = {
        ...settings,
        operating_hours: settings.operating_hours || defaultOperatingHours,
    };

    const handleSubmit = async (data: Record<string, any>) => {
        await axios.post('/api/pos-restaurant/settings', data);
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Restaurant Settings</h2>}
        >
            <Head title="Restaurant Settings" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6">
                                <h3 className="text-lg font-medium">Configure your restaurant settings, operating hours, and service options.</h3>
                            </div>

                            <SettingsForm settings={settingsWithDefaults} onSubmit={handleSubmit}>
                                {({ data, setData }) => (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="restaurant_name">Restaurant Name</Label>
                                                <Input
                                                    id="restaurant_name"
                                                    value={data.restaurant_name}
                                                    onChange={e => setData('restaurant_name', e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={data.email}
                                                    onChange={e => setData('email', e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone</Label>
                                                <Input
                                                    id="phone"
                                                    value={data.phone}
                                                    onChange={e => setData('phone', e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="address">Address</Label>
                                                <Textarea
                                                    id="address"
                                                    value={data.address}
                                                    onChange={e => setData('address', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                                                <Input
                                                    id="tax_rate"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={data.tax_rate}
                                                    onChange={e => setData('tax_rate', parseFloat(e.target.value))}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="service_charge">Service Charge (%)</Label>
                                                <Input
                                                    id="service_charge"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={data.service_charge}
                                                    onChange={e => setData('service_charge', parseFloat(e.target.value))}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-lg font-medium">Service Options</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="enable_reservations">Enable Reservations</Label>
                                                    <Switch
                                                        id="enable_reservations"
                                                        checked={data.enable_reservations}
                                                        onCheckedChange={(checked: boolean) => setData('enable_reservations', checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="enable_takeout">Enable Takeout</Label>
                                                    <Switch
                                                        id="enable_takeout"
                                                        checked={data.enable_takeout}
                                                        onCheckedChange={(checked: boolean) => setData('enable_takeout', checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="enable_delivery">Enable Delivery</Label>
                                                    <Switch
                                                        id="enable_delivery"
                                                        checked={data.enable_delivery}
                                                        onCheckedChange={(checked: boolean) => setData('enable_delivery', checked)}
                                                    />
                                                </div>

                                                {data.enable_delivery && (
                                                    <>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="min_delivery_amount">Minimum Delivery Amount</Label>
                                                            <Input
                                                                id="min_delivery_amount"
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={data.min_delivery_amount}
                                                                onChange={e => setData('min_delivery_amount', parseFloat(e.target.value))}
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor="delivery_fee">Delivery Fee</Label>
                                                            <Input
                                                                id="delivery_fee"
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={data.delivery_fee}
                                                                onChange={e => setData('delivery_fee', parseFloat(e.target.value))}
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-lg font-medium">Operating Hours</h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                {Object.entries(data.operating_hours as Record<string, OperatingHours>).map(([day, hours]) => (
                                                    <div key={day} className="flex items-center gap-4">
                                                        <div className="w-24 font-medium capitalize">{day}</div>
                                                        <div className="flex items-center gap-4">
                                                            <Switch
                                                                id={`${day}_closed`}
                                                                checked={!hours.closed}
                                                                onCheckedChange={(checked: boolean) => setData(`operating_hours.${day}.closed`, !checked)}
                                                            />
                                                            {!hours.closed && (
                                                                <>
                                                                    <Input
                                                                        type="time"
                                                                        value={hours.open}
                                                                        onChange={e => setData(`operating_hours.${day}.open`, e.target.value)}
                                                                        className="w-32"
                                                                    />
                                                                    <span>to</span>
                                                                    <Input
                                                                        type="time"
                                                                        value={hours.close}
                                                                        onChange={e => setData(`operating_hours.${day}.close`, e.target.value)}
                                                                        className="w-32"
                                                                    />
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </SettingsForm>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 
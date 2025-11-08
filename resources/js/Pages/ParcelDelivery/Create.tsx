import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeftIcon, PackageIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ParcelDeliveryFormData, PricingCalculation } from './types';

interface Props extends PageProps {}

export default function ParcelDeliveryCreate({ auth }: Props) {
    const { data, setData, post, processing, errors } =
        useForm<ParcelDeliveryFormData>({
            delivery_type: 'standard',
            sender_name: '',
            sender_phone: '',
            sender_email: '',
            sender_address: '',
            sender_coordinates: '',
            recipient_name: '',
            recipient_phone: '',
            recipient_email: '',
            recipient_address: '',
            recipient_coordinates: '',
            package_description: '',
            package_weight: '',
            package_length: '',
            package_width: '',
            package_height: '',
            package_value: '',
            distance_km: '',
            pickup_date: new Date().toISOString().split('T')[0],
            pickup_time: '09:00',
            special_instructions: '',
            is_urgent: false,
        });

    const [pricing, setPricing] = useState<PricingCalculation | null>(null);
    const [calculating, setCalculating] = useState(false);

    const calculatePricing = async () => {
        if (
            !data.package_weight ||
            !data.distance_km ||
            !data.pickup_date ||
            !data.pickup_time
        ) {
            toast.error(
                'Please fill in required fields for pricing calculation',
            );
            return;
        }

        setCalculating(true);
        try {
            const response = await axios.post(
                '/parcel-delivery/calculate-pricing',
                {
                    delivery_type: data.delivery_type,
                    package_weight: parseFloat(data.package_weight),
                    distance_km: parseFloat(data.distance_km),
                    package_length: data.package_length
                        ? parseFloat(data.package_length)
                        : null,
                    package_width: data.package_width
                        ? parseFloat(data.package_width)
                        : null,
                    package_height: data.package_height
                        ? parseFloat(data.package_height)
                        : null,
                    package_value: data.package_value
                        ? parseFloat(data.package_value)
                        : null,
                    pickup_date: data.pickup_date,
                    pickup_time: data.pickup_time,
                    is_urgent: data.is_urgent,
                },
            );

            if (response.data.success) {
                setPricing(response.data.data);
            }
        } catch (error: any) {
            toast.error('Failed to calculate pricing');
        } finally {
            setCalculating(false);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/parcel-delivery', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Delivery created successfully');
                router.visit('/parcel-delivery');
            },
            onError: () => {
                toast.error('Failed to create delivery');
            },
        });
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
                <div className="flex items-center space-x-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.visit('/parcel-delivery')}
                    >
                        <ArrowLeftIcon className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                        <PackageIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-100">
                            Create Delivery
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title="Create Delivery" />

            <div className="space-y-6 p-6">
                <form onSubmit={submit}>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Delivery Type */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Delivery Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="delivery_type">
                                            Delivery Type
                                        </Label>
                                        <Select
                                            value={data.delivery_type}
                                            onValueChange={(value) =>
                                                setData(
                                                    'delivery_type',
                                                    value as any,
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="express">
                                                    Express
                                                </SelectItem>
                                                <SelectItem value="standard">
                                                    Standard
                                                </SelectItem>
                                                <SelectItem value="economy">
                                                    Economy
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.delivery_type && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.delivery_type}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="pickup_date">
                                                Pickup Date
                                            </Label>
                                            <Input
                                                id="pickup_date"
                                                type="date"
                                                value={data.pickup_date}
                                                onChange={(e) =>
                                                    setData(
                                                        'pickup_date',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            {errors.pickup_date && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.pickup_date}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="pickup_time">
                                                Pickup Time
                                            </Label>
                                            <Input
                                                id="pickup_time"
                                                type="time"
                                                value={data.pickup_time}
                                                onChange={(e) =>
                                                    setData(
                                                        'pickup_time',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            {errors.pickup_time && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.pickup_time}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Sender Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sender Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="sender_name">
                                            Name *
                                        </Label>
                                        <Input
                                            id="sender_name"
                                            value={data.sender_name}
                                            onChange={(e) =>
                                                setData(
                                                    'sender_name',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {errors.sender_name && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.sender_name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="sender_phone">
                                                Phone *
                                            </Label>
                                            <Input
                                                id="sender_phone"
                                                value={data.sender_phone}
                                                onChange={(e) =>
                                                    setData(
                                                        'sender_phone',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            {errors.sender_phone && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.sender_phone}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="sender_email">
                                                Email
                                            </Label>
                                            <Input
                                                id="sender_email"
                                                type="email"
                                                value={data.sender_email}
                                                onChange={(e) =>
                                                    setData(
                                                        'sender_email',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="sender_address">
                                            Address *
                                        </Label>
                                        <Textarea
                                            id="sender_address"
                                            value={data.sender_address}
                                            onChange={(e) =>
                                                setData(
                                                    'sender_address',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {errors.sender_address && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.sender_address}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recipient Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recipient Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="recipient_name">
                                            Name *
                                        </Label>
                                        <Input
                                            id="recipient_name"
                                            value={data.recipient_name}
                                            onChange={(e) =>
                                                setData(
                                                    'recipient_name',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {errors.recipient_name && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.recipient_name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="recipient_phone">
                                                Phone *
                                            </Label>
                                            <Input
                                                id="recipient_phone"
                                                value={data.recipient_phone}
                                                onChange={(e) =>
                                                    setData(
                                                        'recipient_phone',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            {errors.recipient_phone && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.recipient_phone}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="recipient_email">
                                                Email
                                            </Label>
                                            <Input
                                                id="recipient_email"
                                                type="email"
                                                value={data.recipient_email}
                                                onChange={(e) =>
                                                    setData(
                                                        'recipient_email',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="recipient_address">
                                            Address *
                                        </Label>
                                        <Textarea
                                            id="recipient_address"
                                            value={data.recipient_address}
                                            onChange={(e) =>
                                                setData(
                                                    'recipient_address',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {errors.recipient_address && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.recipient_address}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Package Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Package Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="package_description">
                                            Description *
                                        </Label>
                                        <Textarea
                                            id="package_description"
                                            value={data.package_description}
                                            onChange={(e) =>
                                                setData(
                                                    'package_description',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {errors.package_description && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.package_description}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="package_weight">
                                            Weight (kg) *
                                        </Label>
                                        <Input
                                            id="package_weight"
                                            type="number"
                                            step="0.01"
                                            value={data.package_weight}
                                            onChange={(e) =>
                                                setData(
                                                    'package_weight',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {errors.package_weight && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.package_weight}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="package_length">
                                                Length (cm)
                                            </Label>
                                            <Input
                                                id="package_length"
                                                type="number"
                                                step="0.01"
                                                value={data.package_length}
                                                onChange={(e) =>
                                                    setData(
                                                        'package_length',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="package_width">
                                                Width (cm)
                                            </Label>
                                            <Input
                                                id="package_width"
                                                type="number"
                                                step="0.01"
                                                value={data.package_width}
                                                onChange={(e) =>
                                                    setData(
                                                        'package_width',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="package_height">
                                                Height (cm)
                                            </Label>
                                            <Input
                                                id="package_height"
                                                type="number"
                                                step="0.01"
                                                value={data.package_height}
                                                onChange={(e) =>
                                                    setData(
                                                        'package_height',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="package_value">
                                            Declared Value
                                        </Label>
                                        <Input
                                            id="package_value"
                                            type="number"
                                            step="0.01"
                                            value={data.package_value}
                                            onChange={(e) =>
                                                setData(
                                                    'package_value',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="distance_km">
                                            Distance (km) *
                                        </Label>
                                        <Input
                                            id="distance_km"
                                            type="number"
                                            step="0.01"
                                            value={data.distance_km}
                                            onChange={(e) =>
                                                setData(
                                                    'distance_km',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {errors.distance_km && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.distance_km}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="special_instructions">
                                            Special Instructions
                                        </Label>
                                        <Textarea
                                            id="special_instructions"
                                            value={data.special_instructions}
                                            onChange={(e) =>
                                                setData(
                                                    'special_instructions',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Pricing Preview */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pricing</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={calculatePricing}
                                        disabled={calculating}
                                    >
                                        {calculating
                                            ? 'Calculating...'
                                            : 'Calculate Pricing'}
                                    </Button>
                                    {pricing && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span>Base Rate:</span>
                                                <span>
                                                    {formatCurrency(
                                                        pricing.base_rate,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Distance Rate:</span>
                                                <span>
                                                    {formatCurrency(
                                                        pricing.distance_rate,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Weight Rate:</span>
                                                <span>
                                                    {formatCurrency(
                                                        pricing.weight_rate,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Size Rate:</span>
                                                <span>
                                                    {formatCurrency(
                                                        pricing.size_rate,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between border-t pt-2 text-lg font-bold">
                                                <span>Estimated Cost:</span>
                                                <span>
                                                    {formatCurrency(
                                                        pricing.estimated_cost,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit('/parcel-delivery')}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Delivery'}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}

import SettingsForm from '@/Components/Settings/SettingsForm';
import { CardContent, CardHeader } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import {
    Bell,
    Building2,
    Calendar,
    DollarSign,
    Settings as SettingsIcon,
    Truck,
} from 'lucide-react';
import { useMemo } from 'react';

interface OperatingHours {
    open: string;
    close: string;
    closed: boolean;
}

interface Settings {
    general: {
        company_name: string;
        description: string;
        address: string;
        phone: string;
        email: string;
        website: string;
        operating_hours: {
            [key: string]: OperatingHours;
        };
    };
    fleet: {
        max_trucks: number;
        truck_types: string[];
        capacity_units: string;
        insurance_required: boolean;
        insurance_providers: string[];
    };
    pricing: {
        base_rate_per_km: number;
        minimum_charge: number;
        currency: string;
        payment_methods: string[];
        tax_rate: number;
    };
    booking: {
        advance_booking_days: number;
        cancellation_hours: number;
        auto_approval: boolean;
        require_documents: boolean;
        tracking_enabled: boolean;
    };
    notifications: {
        email_notifications: boolean;
        sms_notifications: boolean;
        booking_confirmations: boolean;
        status_updates: boolean;
    };
}

interface Props {
    settings: Settings;
    auth: {
        user: any & {
            is_admin?: boolean;
        };
        selectedTeamMember?: {
            identifier: string;
            first_name: string;
            last_name: string;
            full_name: string;
            roles: string[];
            profile_picture?: string;
        };
    };
}

export default function Settings({ settings, auth }: Props) {
    // Ensure settings has proper structure with fallbacks
    const defaultSettings: Settings = {
        general: {
            company_name: '',
            description: '',
            address: '',
            phone: '',
            email: '',
            website: '',
            operating_hours: {
                monday: { open: '09:00', close: '17:00', closed: false },
                tuesday: { open: '09:00', close: '17:00', closed: false },
                wednesday: { open: '09:00', close: '17:00', closed: false },
                thursday: { open: '09:00', close: '17:00', closed: false },
                friday: { open: '09:00', close: '17:00', closed: false },
                saturday: { open: '09:00', close: '13:00', closed: false },
                sunday: { open: '00:00', close: '00:00', closed: true },
            },
        },
        fleet: {
            max_trucks: 10,
            truck_types: [],
            capacity_units: 'kg',
            insurance_required: true,
            insurance_providers: [],
        },
        pricing: {
            base_rate_per_km: 0.0,
            minimum_charge: 0.0,
            currency: 'USD',
            payment_methods: [],
            tax_rate: 0.0,
        },
        booking: {
            advance_booking_days: 30,
            cancellation_hours: 24,
            auto_approval: false,
            require_documents: true,
            tracking_enabled: true,
        },
        notifications: {
            email_notifications: true,
            sms_notifications: false,
            booking_confirmations: true,
            status_updates: true,
        },
    };

    // Merge with actual settings data, using defaults for missing fields
    const mergedSettings = {
        general: { ...defaultSettings.general, ...settings?.general },
        fleet: { ...defaultSettings.fleet, ...settings?.fleet },
        pricing: { ...defaultSettings.pricing, ...settings?.pricing },
        booking: { ...defaultSettings.booking, ...settings?.booking },
        notifications: {
            ...defaultSettings.notifications,
            ...settings?.notifications,
        },
    };

    // Check if current team member has admin or manager role
    const canDelete = useMemo(() => {
        if (auth.selectedTeamMember) {
            // Team member selected - only admin or manager can delete
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager')
            );
        }
        // No team member selected (main account) - allow all users
        return true;
    }, [auth.selectedTeamMember]);

    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            // Team member selected - check their roles
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager') ||
                auth.selectedTeamMember.roles.includes('user')
            );
        }
        // No team member selected (main account) - allow all users
        return true;
    }, [auth.selectedTeamMember]);

    const handleSubmit = async (data: Record<string, any>) => {
        await axios.post('/transportation/settings', data);
    };

    const weekDays = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
    ];

    const dayLabels = {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday',
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                        <SettingsIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-100">
                            Transportation Settings
                        </h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Configure your transportation operations, fleet
                            management, and booking policies
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Transportation Settings" />

            <div className="space-y-6 p-6">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <CardHeader className="pb-6">
                        <div className="mb-4 flex items-center space-x-3">
                            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                                <SettingsIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Transportation Settings
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Configure your transportation operations,
                                    fleet management, and booking policies
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {canEdit ? (
                            <SettingsForm
                                settings={mergedSettings as unknown as Record<string, unknown>}
                                onSubmit={handleSubmit}
                            >
                                {({ data, setData }) => {
                                    const general = (data.general as { company_name?: string; description?: string; address?: string; phone?: string; email?: string; website?: string; operating_hours?: Record<string, OperatingHours> }) || {};
                                    const fleet = (data.fleet as { max_trucks?: number; truck_types?: string[]; capacity_units?: string; insurance_required?: boolean; insurance_providers?: string[] }) || {};
                                    const pricing = (data.pricing as { base_rate_per_km?: number; minimum_charge?: number; currency?: string; payment_methods?: string[]; tax_rate?: number }) || {};
                                    const booking = (data.booking as { advance_booking_days?: number; cancellation_hours?: number; auto_approval?: boolean; require_documents?: boolean; tracking_enabled?: boolean }) || {};
                                    const notifications = (data.notifications as { email_notifications?: boolean; sms_notifications?: boolean; booking_confirmations?: boolean; status_updates?: boolean }) || {};
                                    return (
                                    <Tabs
                                        defaultValue="general"
                                        className="space-y-6"
                                    >
                                        <TabsList className="grid w-full grid-cols-5">
                                            <TabsTrigger value="general">
                                                <Building2 className="mr-2 h-4 w-4" />
                                                General
                                            </TabsTrigger>
                                            <TabsTrigger value="fleet">
                                                <Truck className="mr-2 h-4 w-4" />
                                                Fleet
                                            </TabsTrigger>
                                            <TabsTrigger value="pricing">
                                                <DollarSign className="mr-2 h-4 w-4" />
                                                Pricing
                                            </TabsTrigger>
                                            <TabsTrigger value="booking">
                                                <Calendar className="mr-2 h-4 w-4" />
                                                Booking
                                            </TabsTrigger>
                                            <TabsTrigger value="notifications">
                                                <Bell className="mr-2 h-4 w-4" />
                                                Notifications
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent
                                            value="general"
                                            className="space-y-6"
                                        >
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                                    Company Information
                                                </h3>
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Label className="text-gray-900 dark:text-white">
                                                            Company Name *
                                                        </Label>
                                                        <Input
                                                            value={
                                                                general.company_name ?? ''
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'general.company_name',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Your Company Name"
                                                            className="border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-gray-900 dark:text-white">
                                                            Email
                                                        </Label>
                                                        <Input
                                                            type="email"
                                                            value={
                                                                general.email ?? ''
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'general.email',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="company@example.com"
                                                            className="border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-gray-900 dark:text-white">
                                                            Phone
                                                        </Label>
                                                        <Input
                                                            value={
                                                                general.phone ?? ''
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'general.phone',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="+1234567890"
                                                            className="border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-gray-900 dark:text-white">
                                                            Website
                                                        </Label>
                                                        <Input
                                                            value={
                                                                general.website ?? ''
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'general.website',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="https://yourcompany.com"
                                                            className="border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-gray-900 dark:text-white">
                                                        Description
                                                    </Label>
                                                    <Textarea
                                                        value={
                                                            general.description ?? ''
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                'general.description',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Brief description of your logistics services"
                                                        rows={3}
                                                        className="border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-gray-900 dark:text-white">
                                                        Address
                                                    </Label>
                                                    <Textarea
                                                        value={
                                                            general.address ?? ''
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                'general.address',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Your business address"
                                                        rows={2}
                                                        className="border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                                    Operating Hours
                                                </h3>
                                                <div className="space-y-3">
                                                    {weekDays.map((day) => (
                                                        <div
                                                            key={day}
                                                            className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-600"
                                                        >
                                                            <div className="w-20 text-sm font-medium text-gray-900 dark:text-white">
                                                                {
                                                                    dayLabels[
                                                                        day as keyof typeof dayLabels
                                                                    ]
                                                                }
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Switch
                                                                    checked={
                                                                        !((general.operating_hours?.[day] as OperatingHours)?.closed ?? true)
                                                                    }
                                                                    onCheckedChange={(
                                                                        checked,
                                                                    ) =>
                                                                        setData(
                                                                            `general.operating_hours.${day}.closed`,
                                                                            !checked,
                                                                        )
                                                                    }
                                                                />
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                    Open
                                                                </span>
                                                            </div>
                                                            {!((general.operating_hours?.[day] as OperatingHours)?.closed ?? true) && (
                                                                <div className="flex items-center gap-2">
                                                                    <Input
                                                                        type="time"
                                                                        value={
                                                                            ((general.operating_hours?.[day] as OperatingHours)?.open ?? '09:00')
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setData(
                                                                                `general.operating_hours.${day}.open`,
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        className="w-32 border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                                    />
                                                                    <span className="text-gray-500">
                                                                        to
                                                                    </span>
                                                                    <Input
                                                                        type="time"
                                                                        value={
                                                                            ((general.operating_hours?.[day] as OperatingHours)?.close ?? '17:00')
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setData(
                                                                                `general.operating_hours.${day}.close`,
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        className="w-32 border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent
                                            value="fleet"
                                            className="space-y-6"
                                        >
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                                    Fleet Management
                                                </h3>
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Label className="text-gray-900 dark:text-white">
                                                            Max Trucks
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            value={
                                                                fleet.max_trucks ?? 0
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'fleet.max_trucks',
                                                                    parseInt(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                            placeholder="10"
                                                            className="border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-gray-900 dark:text-white">
                                                            Capacity Units
                                                        </Label>
                                                        <Select
                                                            value={
                                                                String(fleet.capacity_units ?? '')
                                                            }
                                                            onValueChange={(
                                                                value,
                                                            ) =>
                                                                setData(
                                                                    'fleet.capacity_units',
                                                                    value,
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger className="border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                                                                <SelectValue placeholder="Select units" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="kg">
                                                                    Kilograms
                                                                    (kg)
                                                                </SelectItem>
                                                                <SelectItem value="tons">
                                                                    Tons
                                                                </SelectItem>
                                                                <SelectItem value="cubic_meters">
                                                                    Cubic Meters
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <Label className="text-gray-900 dark:text-white">
                                                                Insurance
                                                                Required
                                                            </Label>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                Require
                                                                insurance for
                                                                all trucks
                                                            </p>
                                                        </div>
                                                        <Switch
                                                            checked={
                                                                fleet.insurance_required ?? false
                                                            }
                                                            onCheckedChange={(
                                                                checked,
                                                            ) =>
                                                                setData(
                                                                    'fleet.insurance_required',
                                                                    checked,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent
                                            value="pricing"
                                            className="space-y-6"
                                        >
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                                    Pricing Configuration
                                                </h3>
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Label className="text-gray-900 dark:text-white">
                                                            Base Rate per KM
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            value={
                                                                pricing.base_rate_per_km ?? 0
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'pricing.base_rate_per_km',
                                                                    parseFloat(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                            placeholder="0.50"
                                                            className="border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-gray-900 dark:text-white">
                                                            Minimum Charge
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            value={
                                                                pricing.minimum_charge ?? 0
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'pricing.minimum_charge',
                                                                    parseFloat(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                            placeholder="25.00"
                                                            className="border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-gray-900 dark:text-white">
                                                            Currency
                                                        </Label>
                                                        <Select
                                                            value={
                                                                String(pricing.currency ?? '')
                                                            }
                                                            onValueChange={(
                                                                value,
                                                            ) =>
                                                                setData(
                                                                    'pricing.currency',
                                                                    value,
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger className="border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                                                                <SelectValue placeholder="Select currency" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="USD">
                                                                    USD ($)
                                                                </SelectItem>
                                                                <SelectItem value="EUR">
                                                                    EUR (€)
                                                                </SelectItem>
                                                                <SelectItem value="GBP">
                                                                    GBP (£)
                                                                </SelectItem>
                                                                <SelectItem value="PHP">
                                                                    PHP (₱)
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-gray-900 dark:text-white">
                                                            Tax Rate (%)
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            value={
                                                                pricing.tax_rate ?? 0
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'pricing.tax_rate',
                                                                    parseFloat(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                            placeholder="10.00"
                                                            className="border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent
                                            value="booking"
                                            className="space-y-6"
                                        >
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                                    Booking Policies
                                                </h3>
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Label className="text-gray-900 dark:text-white">
                                                            Advance Booking Days
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            value={
                                                                booking.advance_booking_days ?? 0
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'booking.advance_booking_days',
                                                                    parseInt(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                            placeholder="30"
                                                            className="border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-gray-900 dark:text-white">
                                                            Cancellation Hours
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            value={
                                                                booking.cancellation_hours ?? 0
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'booking.cancellation_hours',
                                                                    parseInt(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                            placeholder="24"
                                                            className="border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <Label className="text-gray-900 dark:text-white">
                                                                Auto Approval
                                                            </Label>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                Automatically
                                                                approve bookings
                                                            </p>
                                                        </div>
                                                        <Switch
                                                            checked={
                                                                booking.auto_approval ?? false
                                                            }
                                                            onCheckedChange={(
                                                                checked,
                                                            ) =>
                                                                setData(
                                                                    'booking.auto_approval',
                                                                    checked,
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <Label className="text-gray-900 dark:text-white">
                                                                Require
                                                                Documents
                                                            </Label>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                Require
                                                                documents for
                                                                bookings
                                                            </p>
                                                        </div>
                                                        <Switch
                                                            checked={
                                                                booking.require_documents ?? false
                                                            }
                                                            onCheckedChange={(
                                                                checked,
                                                            ) =>
                                                                setData(
                                                                    'booking.require_documents',
                                                                    checked,
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <Label className="text-gray-900 dark:text-white">
                                                                Tracking Enabled
                                                            </Label>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                Enable shipment
                                                                tracking
                                                            </p>
                                                        </div>
                                                        <Switch
                                                            checked={
                                                                booking.tracking_enabled ?? false
                                                            }
                                                            onCheckedChange={(
                                                                checked,
                                                            ) =>
                                                                setData(
                                                                    'booking.tracking_enabled',
                                                                    checked,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent
                                            value="notifications"
                                            className="space-y-6"
                                        >
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                                    Notification Preferences
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <Label className="text-gray-900 dark:text-white">
                                                                Email
                                                                Notifications
                                                            </Label>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                Send email
                                                                notifications
                                                            </p>
                                                        </div>
                                                        <Switch
                                                            checked={
                                                                notifications.email_notifications ?? false
                                                            }
                                                            onCheckedChange={(
                                                                checked,
                                                            ) =>
                                                                setData(
                                                                    'notifications.email_notifications',
                                                                    checked,
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <Label className="text-gray-900 dark:text-white">
                                                                SMS
                                                                Notifications
                                                            </Label>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                Send SMS
                                                                notifications
                                                            </p>
                                                        </div>
                                                        <Switch
                                                            checked={
                                                                notifications.sms_notifications ?? false
                                                            }
                                                            onCheckedChange={(
                                                                checked,
                                                            ) =>
                                                                setData(
                                                                    'notifications.sms_notifications',
                                                                    checked,
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <Label className="text-gray-900 dark:text-white">
                                                                Booking
                                                                Confirmations
                                                            </Label>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                Send booking
                                                                confirmations
                                                            </p>
                                                        </div>
                                                        <Switch
                                                            checked={
                                                                notifications.booking_confirmations ?? false
                                                            }
                                                            onCheckedChange={(
                                                                checked,
                                                            ) =>
                                                                setData(
                                                                    'notifications.booking_confirmations',
                                                                    checked,
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <Label className="text-gray-900 dark:text-white">
                                                                Status Updates
                                                            </Label>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                Send status
                                                                update
                                                                notifications
                                                            </p>
                                                        </div>
                                                        <Switch
                                                            checked={
                                                                notifications.status_updates ?? false
                                                            }
                                                            onCheckedChange={(
                                                                checked,
                                                            ) =>
                                                                setData(
                                                                    'notifications.status_updates',
                                                                    checked,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                    );
                                }}
                            </SettingsForm>
                        ) : (
                            <div className="py-8 text-center">
                                <p className="text-gray-500 dark:text-gray-400">
                                    You don't have permission to edit logistics
                                    settings.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

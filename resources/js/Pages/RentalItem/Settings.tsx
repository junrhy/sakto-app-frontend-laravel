import SettingsForm from '@/Components/Settings/SettingsForm';
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
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Project, User } from '@/types/index';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useMemo } from 'react';

interface Props extends PageProps {
    auth: {
        user: User;
        project?: Project;
        modules?: string[];
        selectedTeamMember?: {
            identifier: string;
            first_name: string;
            last_name: string;
            full_name: string;
            email: string;
            roles: string[];
            allowed_apps: string[];
            profile_picture?: string;
        };
    };
    settings: {
        default_rental_period: number;
        rental_period_unit: 'hours' | 'days' | 'weeks' | 'months';
        enable_late_fees: boolean;
        late_fee_rate: number;
        late_fee_period: number;
        late_fee_period_unit: 'hours' | 'days' | 'weeks';
        require_deposit: boolean;
        deposit_rate: number;
        enable_insurance: boolean;
        insurance_rate: number;
        enable_delivery: boolean;
        delivery_fee: number;
        enable_pickup: boolean;
        pickup_fee: number;
        enable_maintenance_tracking: boolean;
        maintenance_reminder_days: number;
    };
}

export default function RentalItemSettings({ auth, settings }: Props) {
    const handleSubmit = async (data: Record<string, any>) => {
        await axios.post('/api/rental-item/settings', data);
    };

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

    const periodUnits = [
        { value: 'hours', label: 'Hours' },
        { value: 'days', label: 'Days' },
        { value: 'weeks', label: 'Weeks' },
        { value: 'months', label: 'Months' },
    ];

    const lateFeeUnits = [
        { value: 'hours', label: 'Hours' },
        { value: 'days', label: 'Days' },
        { value: 'weeks', label: 'Weeks' },
    ];

    return (
        <AuthenticatedLayout
            auth={{
                user: auth.user,
                project: auth.project,
                modules: auth.modules,
            }}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Rental Item Settings
                </h2>
            }
        >
            <Head title="Rental Item Settings" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6">
                                <h3 className="text-lg font-medium">
                                    Configure your rental item settings, fees,
                                    and policies.
                                </h3>
                            </div>

                            {canEdit ? (
                                <SettingsForm
                                    settings={
                                        settings as unknown as Record<
                                            string,
                                            unknown
                                        >
                                    }
                                    onSubmit={handleSubmit}
                                >
                                    {({ data, setData }) => {
                                        const typedData = data as {
                                            default_rental_period?: number;
                                            rental_period_unit?: string;
                                            enable_late_fees?: boolean;
                                            late_fee_rate?: number;
                                            late_fee_period?: number;
                                            late_fee_period_unit?: string;
                                            require_deposit?: boolean;
                                            deposit_rate?: number;
                                            enable_insurance?: boolean;
                                            insurance_rate?: number;
                                            enable_delivery?: boolean;
                                            delivery_fee?: number;
                                            enable_pickup?: boolean;
                                            pickup_fee?: number;
                                            enable_maintenance_tracking?: boolean;
                                            maintenance_reminder_days?: number;
                                        };
                                        return (
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="default_rental_period">
                                                            Default Rental
                                                            Period
                                                        </Label>
                                                        <div className="flex gap-4">
                                                            <Input
                                                                id="default_rental_period"
                                                                type="number"
                                                                min="1"
                                                                value={
                                                                    typedData.default_rental_period ??
                                                                    0
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        'default_rental_period',
                                                                        parseInt(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                    )
                                                                }
                                                                className="flex-1"
                                                            />
                                                            <Select
                                                                value={String(
                                                                    typedData.rental_period_unit ??
                                                                        '',
                                                                )}
                                                                onValueChange={(
                                                                    value,
                                                                ) =>
                                                                    setData(
                                                                        'rental_period_unit',
                                                                        value,
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger className="w-32">
                                                                    <SelectValue placeholder="Unit" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {periodUnits.map(
                                                                        (
                                                                            unit,
                                                                        ) => (
                                                                            <SelectItem
                                                                                key={
                                                                                    unit.value
                                                                                }
                                                                                value={
                                                                                    unit.value
                                                                                }
                                                                            >
                                                                                {
                                                                                    unit.label
                                                                                }
                                                                            </SelectItem>
                                                                        ),
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-medium">
                                                        Fees and Policies
                                                    </h3>
                                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <Label htmlFor="enable_late_fees">
                                                                    Enable Late
                                                                    Fees
                                                                </Label>
                                                                <Switch
                                                                    id="enable_late_fees"
                                                                    checked={
                                                                        typedData.enable_late_fees ??
                                                                        false
                                                                    }
                                                                    onCheckedChange={(
                                                                        checked: boolean,
                                                                    ) =>
                                                                        setData(
                                                                            'enable_late_fees',
                                                                            checked,
                                                                        )
                                                                    }
                                                                />
                                                            </div>

                                                            {typedData.enable_late_fees && (
                                                                <>
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor="late_fee_rate">
                                                                            Late
                                                                            Fee
                                                                            Rate
                                                                            (%)
                                                                        </Label>
                                                                        <Input
                                                                            id="late_fee_rate"
                                                                            type="number"
                                                                            min="0"
                                                                            step="0.01"
                                                                            value={
                                                                                typedData.late_fee_rate ??
                                                                                0
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setData(
                                                                                    'late_fee_rate',
                                                                                    parseFloat(
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                    ),
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <Label htmlFor="late_fee_period">
                                                                            Late
                                                                            Fee
                                                                            Period
                                                                        </Label>
                                                                        <div className="flex gap-4">
                                                                            <Input
                                                                                id="late_fee_period"
                                                                                type="number"
                                                                                min="1"
                                                                                value={
                                                                                    typedData.late_fee_period ??
                                                                                    0
                                                                                }
                                                                                onChange={(
                                                                                    e,
                                                                                ) =>
                                                                                    setData(
                                                                                        'late_fee_period',
                                                                                        parseInt(
                                                                                            e
                                                                                                .target
                                                                                                .value,
                                                                                        ),
                                                                                    )
                                                                                }
                                                                                className="flex-1"
                                                                            />
                                                                            <Select
                                                                                value={String(
                                                                                    typedData.late_fee_period_unit ??
                                                                                        '',
                                                                                )}
                                                                                onValueChange={(
                                                                                    value,
                                                                                ) =>
                                                                                    setData(
                                                                                        'late_fee_period_unit',
                                                                                        value,
                                                                                    )
                                                                                }
                                                                            >
                                                                                <SelectTrigger className="w-32">
                                                                                    <SelectValue placeholder="Unit" />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    {lateFeeUnits.map(
                                                                                        (
                                                                                            unit,
                                                                                        ) => (
                                                                                            <SelectItem
                                                                                                key={
                                                                                                    unit.value
                                                                                                }
                                                                                                value={
                                                                                                    unit.value
                                                                                                }
                                                                                            >
                                                                                                {
                                                                                                    unit.label
                                                                                                }
                                                                                            </SelectItem>
                                                                                        ),
                                                                                    )}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>

                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <Label htmlFor="require_deposit">
                                                                    Require
                                                                    Deposit
                                                                </Label>
                                                                <Switch
                                                                    id="require_deposit"
                                                                    checked={
                                                                        typedData.require_deposit ??
                                                                        false
                                                                    }
                                                                    onCheckedChange={(
                                                                        checked: boolean,
                                                                    ) =>
                                                                        setData(
                                                                            'require_deposit',
                                                                            checked,
                                                                        )
                                                                    }
                                                                />
                                                            </div>

                                                            {typedData.require_deposit && (
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="deposit_rate">
                                                                        Deposit
                                                                        Rate (%
                                                                        of item
                                                                        value)
                                                                    </Label>
                                                                    <Input
                                                                        id="deposit_rate"
                                                                        type="number"
                                                                        min="0"
                                                                        max="100"
                                                                        step="0.01"
                                                                        value={
                                                                            typedData.deposit_rate ??
                                                                            0
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setData(
                                                                                'deposit_rate',
                                                                                parseFloat(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                ),
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <Label htmlFor="enable_insurance">
                                                                    Enable
                                                                    Insurance
                                                                </Label>
                                                                <Switch
                                                                    id="enable_insurance"
                                                                    checked={
                                                                        typedData.enable_insurance ??
                                                                        false
                                                                    }
                                                                    onCheckedChange={(
                                                                        checked: boolean,
                                                                    ) =>
                                                                        setData(
                                                                            'enable_insurance',
                                                                            checked,
                                                                        )
                                                                    }
                                                                />
                                                            </div>

                                                            {typedData.enable_insurance && (
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="insurance_rate">
                                                                        Insurance
                                                                        Rate (%
                                                                        of item
                                                                        value)
                                                                    </Label>
                                                                    <Input
                                                                        id="insurance_rate"
                                                                        type="number"
                                                                        min="0"
                                                                        max="100"
                                                                        step="0.01"
                                                                        value={
                                                                            typedData.insurance_rate ??
                                                                            0
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setData(
                                                                                'insurance_rate',
                                                                                parseFloat(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                ),
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-medium">
                                                        Delivery and Pickup
                                                    </h3>
                                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <Label htmlFor="enable_delivery">
                                                                    Enable
                                                                    Delivery
                                                                </Label>
                                                                <Switch
                                                                    id="enable_delivery"
                                                                    checked={
                                                                        typedData.enable_delivery ??
                                                                        false
                                                                    }
                                                                    onCheckedChange={(
                                                                        checked: boolean,
                                                                    ) =>
                                                                        setData(
                                                                            'enable_delivery',
                                                                            checked,
                                                                        )
                                                                    }
                                                                />
                                                            </div>

                                                            {typedData.enable_delivery && (
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="delivery_fee">
                                                                        Delivery
                                                                        Fee
                                                                    </Label>
                                                                    <Input
                                                                        id="delivery_fee"
                                                                        type="number"
                                                                        min="0"
                                                                        step="0.01"
                                                                        value={
                                                                            typedData.delivery_fee ??
                                                                            0
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setData(
                                                                                'delivery_fee',
                                                                                parseFloat(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                ),
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <Label htmlFor="enable_pickup">
                                                                    Enable
                                                                    Pickup
                                                                </Label>
                                                                <Switch
                                                                    id="enable_pickup"
                                                                    checked={
                                                                        typedData.enable_pickup ??
                                                                        false
                                                                    }
                                                                    onCheckedChange={(
                                                                        checked: boolean,
                                                                    ) =>
                                                                        setData(
                                                                            'enable_pickup',
                                                                            checked,
                                                                        )
                                                                    }
                                                                />
                                                            </div>

                                                            {typedData.enable_pickup && (
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="pickup_fee">
                                                                        Pickup
                                                                        Fee
                                                                    </Label>
                                                                    <Input
                                                                        id="pickup_fee"
                                                                        type="number"
                                                                        min="0"
                                                                        step="0.01"
                                                                        value={
                                                                            typedData.pickup_fee ??
                                                                            0
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setData(
                                                                                'pickup_fee',
                                                                                parseFloat(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                ),
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-medium">
                                                        Maintenance
                                                    </h3>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <Label htmlFor="enable_maintenance_tracking">
                                                                Enable
                                                                Maintenance
                                                                Tracking
                                                            </Label>
                                                            <Switch
                                                                id="enable_maintenance_tracking"
                                                                checked={
                                                                    typedData.enable_maintenance_tracking ??
                                                                    false
                                                                }
                                                                onCheckedChange={(
                                                                    checked: boolean,
                                                                ) =>
                                                                    setData(
                                                                        'enable_maintenance_tracking',
                                                                        checked,
                                                                    )
                                                                }
                                                            />
                                                        </div>

                                                        {typedData.enable_maintenance_tracking && (
                                                            <div className="space-y-2">
                                                                <Label htmlFor="maintenance_reminder_days">
                                                                    Maintenance
                                                                    Reminder
                                                                    (days)
                                                                </Label>
                                                                <Input
                                                                    id="maintenance_reminder_days"
                                                                    type="number"
                                                                    min="1"
                                                                    value={
                                                                        typedData.maintenance_reminder_days ??
                                                                        0
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setData(
                                                                            'maintenance_reminder_days',
                                                                            parseInt(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            ),
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }}
                                </SettingsForm>
                            ) : (
                                <div className="py-12 text-center">
                                    <p className="text-gray-500">
                                        You don't have permission to edit rental
                                        item settings.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

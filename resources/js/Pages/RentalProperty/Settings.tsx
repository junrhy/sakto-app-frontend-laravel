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

interface Utilities {
    electricity: boolean;
    water: boolean;
    gas: boolean;
    internet: boolean;
    cable: boolean;
}

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
        default_lease_period: number;
        lease_period_unit: 'days' | 'weeks' | 'months' | 'years';
        enable_late_fees: boolean;
        late_fee_rate: number;
        late_fee_grace_period: number;
        require_deposit: boolean;
        deposit_months: number;
        enable_utilities_tracking: boolean;
        utilities: Utilities;
        enable_maintenance_requests: boolean;
        maintenance_priority_levels: string[];
        enable_inspections: boolean;
        inspection_frequency: number;
        inspection_frequency_unit: 'months' | 'years';
        enable_auto_renewal: boolean;
        renewal_notice_period: number;
        renewal_notice_unit: 'days' | 'weeks' | 'months';
    };
}

export default function RentalPropertySettings({ auth, settings }: Props) {
    const handleSubmit = async (data: Record<string, any>) => {
        await axios.post('/api/rental-property/settings', data);
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
        { value: 'days', label: 'Days' },
        { value: 'weeks', label: 'Weeks' },
        { value: 'months', label: 'Months' },
        { value: 'years', label: 'Years' },
    ];

    const inspectionUnits = [
        { value: 'months', label: 'Months' },
        { value: 'years', label: 'Years' },
    ];

    const noticeUnits = [
        { value: 'days', label: 'Days' },
        { value: 'weeks', label: 'Weeks' },
        { value: 'months', label: 'Months' },
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
                    Rental Property Settings
                </h2>
            }
        >
            <Head title="Rental Property Settings" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6">
                                <h3 className="text-lg font-medium">
                                    Configure your rental property settings,
                                    lease terms, and policies.
                                </h3>
                            </div>

                            {canEdit ? (
                                <SettingsForm
                                    settings={settings as unknown as Record<string, unknown>}
                                    onSubmit={handleSubmit}
                                >
                                    {({ data, setData }) => {
                                        const typedData = data as {
                                            default_lease_period?: number;
                                            lease_period_unit?: string;
                                            enable_late_fees?: boolean;
                                            late_fee_rate?: number;
                                            late_fee_grace_period?: number;
                                            require_deposit?: boolean;
                                            deposit_months?: number;
                                            enable_utilities_tracking?: boolean;
                                            utilities?: Utilities;
                                            enable_maintenance_requests?: boolean;
                                            maintenance_priority_levels?: string[];
                                            enable_inspections?: boolean;
                                            inspection_frequency?: number;
                                            inspection_frequency_unit?: string;
                                            enable_auto_renewal?: boolean;
                                            renewal_notice_period?: number;
                                            renewal_notice_unit?: string;
                                        };
                                        return (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="default_lease_period">
                                                        Default Lease Period
                                                    </Label>
                                                    <div className="flex gap-4">
                                                        <Input
                                                            id="default_lease_period"
                                                            type="number"
                                                            min="1"
                                                            value={
                                                                typedData.default_lease_period ?? 0
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'default_lease_period',
                                                                    parseInt(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                            className="flex-1"
                                                        />
                                                        <Select
                                                            value={
                                                                String(typedData.lease_period_unit ?? '')
                                                            }
                                                            onValueChange={(
                                                                value,
                                                            ) =>
                                                                setData(
                                                                    'lease_period_unit',
                                                                    value,
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger className="w-32">
                                                                <SelectValue placeholder="Unit" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {periodUnits.map(
                                                                    (unit) => (
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
                                                    Fees and Deposits
                                                </h3>
                                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <Label htmlFor="enable_late_fees">
                                                                Enable Late Fees
                                                            </Label>
                                                            <Switch
                                                                id="enable_late_fees"
                                                                checked={
                                                                    typedData.enable_late_fees ?? false
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
                                                                        Late Fee
                                                                        Rate (%)
                                                                    </Label>
                                                                    <Input
                                                                        id="late_fee_rate"
                                                                        type="number"
                                                                        min="0"
                                                                        step="0.01"
                                                                        value={
                                                                            typedData.late_fee_rate ?? 0
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
                                                                    <Label htmlFor="late_fee_grace_period">
                                                                        Grace
                                                                        Period
                                                                        (days)
                                                                    </Label>
                                                                    <Input
                                                                        id="late_fee_grace_period"
                                                                        type="number"
                                                                        min="0"
                                                                        value={
                                                                            typedData.late_fee_grace_period ?? 0
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setData(
                                                                                'late_fee_grace_period',
                                                                                parseInt(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                ),
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <Label htmlFor="require_deposit">
                                                                Require Security
                                                                Deposit
                                                            </Label>
                                                            <Switch
                                                                id="require_deposit"
                                                                checked={
                                                                    typedData.require_deposit ?? false
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
                                                                <Label htmlFor="deposit_months">
                                                                    Security
                                                                    Deposit
                                                                    (months of
                                                                    rent)
                                                                </Label>
                                                                <Input
                                                                    id="deposit_months"
                                                                    type="number"
                                                                    min="1"
                                                                    value={
                                                                        typedData.deposit_months ?? 0
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setData(
                                                                            'deposit_months',
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

                                            <div className="space-y-4">
                                                <h3 className="text-lg font-medium">
                                                    Utilities
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="enable_utilities_tracking">
                                                            Enable Utilities
                                                            Tracking
                                                        </Label>
                                                        <Switch
                                                            id="enable_utilities_tracking"
                                                            checked={
                                                                typedData.enable_utilities_tracking ?? false
                                                            }
                                                            onCheckedChange={(
                                                                checked: boolean,
                                                            ) =>
                                                                setData(
                                                                    'enable_utilities_tracking',
                                                                    checked,
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    {typedData.enable_utilities_tracking && (
                                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                            {Object.entries(
                                                                (typedData.utilities as Utilities) || {},
                                                            ).map(
                                                                ([
                                                                    utility,
                                                                    enabled,
                                                                ]) => (
                                                                    <div
                                                                        key={
                                                                            utility
                                                                        }
                                                                        className="flex items-center justify-between"
                                                                    >
                                                                        <Label
                                                                            htmlFor={`utility_${utility}`}
                                                                            className="capitalize"
                                                                        >
                                                                            {
                                                                                utility
                                                                            }
                                                                        </Label>
                                                                        <Switch
                                                                            id={`utility_${utility}`}
                                                                            checked={
                                                                                enabled
                                                                            }
                                                                            onCheckedChange={(
                                                                                checked: boolean,
                                                                            ) =>
                                                                                setData(
                                                                                    `utilities.${utility}`,
                                                                                    checked,
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-lg font-medium">
                                                    Maintenance and Inspections
                                                </h3>
                                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <Label htmlFor="enable_maintenance_requests">
                                                                Enable
                                                                Maintenance
                                                                Requests
                                                            </Label>
                                                            <Switch
                                                                id="enable_maintenance_requests"
                                                                checked={
                                                                    typedData.enable_maintenance_requests ?? false
                                                                }
                                                                onCheckedChange={(
                                                                    checked: boolean,
                                                                ) =>
                                                                    setData(
                                                                        'enable_maintenance_requests',
                                                                        checked,
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <Label htmlFor="enable_inspections">
                                                                Enable Regular
                                                                Inspections
                                                            </Label>
                                                            <Switch
                                                                id="enable_inspections"
                                                                checked={
                                                                    typedData.enable_inspections ?? false
                                                                }
                                                                onCheckedChange={(
                                                                    checked: boolean,
                                                                ) =>
                                                                    setData(
                                                                        'enable_inspections',
                                                                        checked,
                                                                    )
                                                                }
                                                            />
                                                        </div>

                                                        {typedData.enable_inspections && (
                                                            <div className="space-y-2">
                                                                <Label htmlFor="inspection_frequency">
                                                                    Inspection
                                                                    Frequency
                                                                </Label>
                                                                <div className="flex gap-4">
                                                                    <Input
                                                                        id="inspection_frequency"
                                                                        type="number"
                                                                        min="1"
                                                                        value={
                                                                            typedData.inspection_frequency ?? 0
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setData(
                                                                                'inspection_frequency',
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
                                                                        value={
                                                                            String(typedData.inspection_frequency_unit ?? '')
                                                                        }
                                                                        onValueChange={(
                                                                            value,
                                                                        ) =>
                                                                            setData(
                                                                                'inspection_frequency_unit',
                                                                                value,
                                                                            )
                                                                        }
                                                                    >
                                                                        <SelectTrigger className="w-32">
                                                                            <SelectValue placeholder="Unit" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {inspectionUnits.map(
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
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-lg font-medium">
                                                    Lease Renewal
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="enable_auto_renewal">
                                                            Enable Auto-Renewal
                                                        </Label>
                                                        <Switch
                                                            id="enable_auto_renewal"
                                                            checked={
                                                                typedData.enable_auto_renewal ?? false
                                                            }
                                                            onCheckedChange={(
                                                                checked: boolean,
                                                            ) =>
                                                                setData(
                                                                    'enable_auto_renewal',
                                                                    checked,
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    {typedData.enable_auto_renewal && (
                                                        <div className="space-y-2">
                                                            <Label htmlFor="renewal_notice_period">
                                                                Renewal Notice
                                                                Period
                                                            </Label>
                                                            <div className="flex gap-4">
                                                                <Input
                                                                    id="renewal_notice_period"
                                                                    type="number"
                                                                    min="1"
                                                                    value={
                                                                        typedData.renewal_notice_period ?? 0
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setData(
                                                                            'renewal_notice_period',
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
                                                                    value={
                                                                        String(typedData.renewal_notice_unit ?? '')
                                                                    }
                                                                    onValueChange={(
                                                                        value,
                                                                    ) =>
                                                                        setData(
                                                                            'renewal_notice_unit',
                                                                            value,
                                                                        )
                                                                    }
                                                                >
                                                                    <SelectTrigger className="w-32">
                                                                        <SelectValue placeholder="Unit" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {noticeUnits.map(
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
                                        property settings.
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

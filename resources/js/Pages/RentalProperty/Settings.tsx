import { User, Project } from '@/types/index';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import SettingsForm from '@/Components/Settings/SettingsForm';
import { PageProps } from '@/types';
import React, { useMemo } from 'react';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Switch } from '@/Components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import axios from 'axios';

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
            return auth.selectedTeamMember.roles.includes('admin') || auth.selectedTeamMember.roles.includes('manager') || auth.selectedTeamMember.roles.includes('user');
        }
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

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
            auth={{ user: auth.user, project: auth.project, modules: auth.modules }}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Rental Property Settings</h2>}
        >
            <Head title="Rental Property Settings" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6">
                                <h3 className="text-lg font-medium">Configure your rental property settings, lease terms, and policies.</h3>
                            </div>

                                                        {canEdit ? (
                                <SettingsForm settings={settings} onSubmit={handleSubmit}>
                                    {({ data, setData }) => (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="default_lease_period">Default Lease Period</Label>
                                                <div className="flex gap-4">
                                                    <Input
                                                        id="default_lease_period"
                                                        type="number"
                                                        min="1"
                                                        value={data.default_lease_period}
                                                        onChange={e => setData('default_lease_period', parseInt(e.target.value))}
                                                        className="flex-1"
                                                    />
                                                    <Select
                                                        value={data.lease_period_unit}
                                                        onValueChange={value => setData('lease_period_unit', value)}
                                                    >
                                                        <SelectTrigger className="w-32">
                                                            <SelectValue placeholder="Unit" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {periodUnits.map(unit => (
                                                                <SelectItem key={unit.value} value={unit.value}>
                                                                    {unit.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-lg font-medium">Fees and Deposits</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="enable_late_fees">Enable Late Fees</Label>
                                                        <Switch
                                                            id="enable_late_fees"
                                                            checked={data.enable_late_fees}
                                                            onCheckedChange={(checked: boolean) => setData('enable_late_fees', checked)}
                                                        />
                                                    </div>

                                                    {data.enable_late_fees && (
                                                        <>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="late_fee_rate">Late Fee Rate (%)</Label>
                                                                <Input
                                                                    id="late_fee_rate"
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={data.late_fee_rate}
                                                                    onChange={e => setData('late_fee_rate', parseFloat(e.target.value))}
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="late_fee_grace_period">Grace Period (days)</Label>
                                                                <Input
                                                                    id="late_fee_grace_period"
                                                                    type="number"
                                                                    min="0"
                                                                    value={data.late_fee_grace_period}
                                                                    onChange={e => setData('late_fee_grace_period', parseInt(e.target.value))}
                                                                />
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="require_deposit">Require Security Deposit</Label>
                                                        <Switch
                                                            id="require_deposit"
                                                            checked={data.require_deposit}
                                                            onCheckedChange={(checked: boolean) => setData('require_deposit', checked)}
                                                        />
                                                    </div>

                                                    {data.require_deposit && (
                                                        <div className="space-y-2">
                                                            <Label htmlFor="deposit_months">Security Deposit (months of rent)</Label>
                                                            <Input
                                                                id="deposit_months"
                                                                type="number"
                                                                min="1"
                                                                value={data.deposit_months}
                                                                onChange={e => setData('deposit_months', parseInt(e.target.value))}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-lg font-medium">Utilities</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="enable_utilities_tracking">Enable Utilities Tracking</Label>
                                                    <Switch
                                                        id="enable_utilities_tracking"
                                                        checked={data.enable_utilities_tracking}
                                                        onCheckedChange={(checked: boolean) => setData('enable_utilities_tracking', checked)}
                                                    />
                                                </div>

                                                {data.enable_utilities_tracking && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {Object.entries(data.utilities as Utilities).map(([utility, enabled]) => (
                                                            <div key={utility} className="flex items-center justify-between">
                                                                <Label htmlFor={`utility_${utility}`} className="capitalize">
                                                                    {utility}
                                                                </Label>
                                                                <Switch
                                                                    id={`utility_${utility}`}
                                                                    checked={enabled}
                                                                    onCheckedChange={(checked: boolean) => 
                                                                        setData(`utilities.${utility}`, checked)
                                                                    }
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-lg font-medium">Maintenance and Inspections</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="enable_maintenance_requests">Enable Maintenance Requests</Label>
                                                        <Switch
                                                            id="enable_maintenance_requests"
                                                            checked={data.enable_maintenance_requests}
                                                            onCheckedChange={(checked: boolean) => setData('enable_maintenance_requests', checked)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="enable_inspections">Enable Regular Inspections</Label>
                                                        <Switch
                                                            id="enable_inspections"
                                                            checked={data.enable_inspections}
                                                            onCheckedChange={(checked: boolean) => setData('enable_inspections', checked)}
                                                        />
                                                    </div>

                                                    {data.enable_inspections && (
                                                        <div className="space-y-2">
                                                            <Label htmlFor="inspection_frequency">Inspection Frequency</Label>
                                                            <div className="flex gap-4">
                                                                <Input
                                                                    id="inspection_frequency"
                                                                    type="number"
                                                                    min="1"
                                                                    value={data.inspection_frequency}
                                                                    onChange={e => setData('inspection_frequency', parseInt(e.target.value))}
                                                                    className="flex-1"
                                                                />
                                                                <Select
                                                                    value={data.inspection_frequency_unit}
                                                                    onValueChange={value => setData('inspection_frequency_unit', value)}
                                                                >
                                                                    <SelectTrigger className="w-32">
                                                                        <SelectValue placeholder="Unit" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {inspectionUnits.map(unit => (
                                                                            <SelectItem key={unit.value} value={unit.value}>
                                                                                {unit.label}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-lg font-medium">Lease Renewal</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="enable_auto_renewal">Enable Auto-Renewal</Label>
                                                    <Switch
                                                        id="enable_auto_renewal"
                                                        checked={data.enable_auto_renewal}
                                                        onCheckedChange={(checked: boolean) => setData('enable_auto_renewal', checked)}
                                                    />
                                                </div>

                                                {data.enable_auto_renewal && (
                                                    <div className="space-y-2">
                                                        <Label htmlFor="renewal_notice_period">Renewal Notice Period</Label>
                                                        <div className="flex gap-4">
                                                            <Input
                                                                id="renewal_notice_period"
                                                                type="number"
                                                                min="1"
                                                                value={data.renewal_notice_period}
                                                                onChange={e => setData('renewal_notice_period', parseInt(e.target.value))}
                                                                className="flex-1"
                                                            />
                                                            <Select
                                                                value={data.renewal_notice_unit}
                                                                onValueChange={value => setData('renewal_notice_unit', value)}
                                                            >
                                                                <SelectTrigger className="w-32">
                                                                    <SelectValue placeholder="Unit" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {noticeUnits.map(unit => (
                                                                        <SelectItem key={unit.value} value={unit.value}>
                                                                            {unit.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                </SettingsForm>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">You don't have permission to edit rental property settings.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 
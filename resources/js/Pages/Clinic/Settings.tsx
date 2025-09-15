import React, { useMemo } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SettingsForm from '@/Components/Settings/SettingsForm';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/Components/ui/tabs";
import { Switch } from "@/Components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Settings as SettingsIcon, Calendar, Zap, CreditCard } from 'lucide-react';
import axios from 'axios';

interface OperatingHours {
    open: string;
    close: string;
    closed: boolean;
}

interface Settings {
    general: {
        clinic_name: string;
        description: string;
        address: string;
        phone: string;
        email: string;
        operating_hours: {
            [key: string]: OperatingHours;
        };
    };
    appointments: {
        enable_appointments: boolean;
        appointment_duration: number;
        appointment_buffer: number;
        enable_reminders: boolean;
        reminder_hours: number;
        enable_online_booking: boolean;
    };
    features: {
        enable_insurance: boolean;
        insurance_providers: string[];
        enable_prescriptions: boolean;
        enable_lab_results: boolean;
        enable_dental_charts: boolean;
        enable_medical_history: boolean;
        enable_patient_portal: boolean;
    };
    billing: {
        enable_billing: boolean;
        tax_rate: number;
        currency: string;
        payment_methods: string[];
        invoice_prefix: string;
        invoice_footer: string;
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
            email: string;
            roles: string[];
            allowed_apps: string[];
            profile_picture?: string;
        };
    };
}

export default function Settings({ settings, auth }: Props) {
    // Check if current team member has admin or manager role
    const canDelete = useMemo(() => {
        if (auth.selectedTeamMember) {
            return auth.selectedTeamMember.roles.includes('admin') || auth.selectedTeamMember.roles.includes('manager');
        }
        // If no team member is selected, check if the main user is admin
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

    // Check if current team member has admin, manager, or user role
    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            return auth.selectedTeamMember.roles.includes('admin') || auth.selectedTeamMember.roles.includes('manager') || auth.selectedTeamMember.roles.includes('user');
        }
        // If no team member is selected, check if the main user is admin
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

    const handleSubmit = async (data: Record<string, any>) => {
        await axios.post('/api/clinic/settings', data);
    };

    const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-white leading-tight">
                    Clinic Settings
                </h2>
            }
        >
            <Head title="Clinic Settings" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl">
                        <CardHeader className="pb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <SettingsIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl text-gray-900 dark:text-white">Clinic Settings</CardTitle>
                                    <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
                                        Configure your clinic settings, operating hours, and features.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {canEdit ? (
                                <SettingsForm settings={settings} onSubmit={handleSubmit}>
                                {({ data, setData }) => (
                                    <Tabs defaultValue="general" className="space-y-6">
                                        <div className="border-b border-gray-200 dark:border-gray-700">
                                            <TabsList className="h-auto p-0 bg-transparent border-0 rounded-none grid w-full grid-cols-4">
                                                <TabsTrigger 
                                                    value="general" 
                                                    className="relative px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:bg-transparent rounded-none transition-all duration-200"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <SettingsIcon className="h-4 w-4" />
                                                        <span className="hidden sm:inline">General</span>
                                                    </div>
                                                </TabsTrigger>
                                                <TabsTrigger 
                                                    value="appointments" 
                                                    className="relative px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:bg-transparent rounded-none transition-all duration-200"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        <span className="hidden sm:inline">Appointments</span>
                                                    </div>
                                                </TabsTrigger>
                                                <TabsTrigger 
                                                    value="features" 
                                                    className="relative px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:bg-transparent rounded-none transition-all duration-200"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Zap className="h-4 w-4" />
                                                        <span className="hidden sm:inline">Features</span>
                                                    </div>
                                                </TabsTrigger>
                                                <TabsTrigger 
                                                    value="billing" 
                                                    className="relative px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:bg-transparent rounded-none transition-all duration-200"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard className="h-4 w-4" />
                                                        <span className="hidden sm:inline">Billing</span>
                                                    </div>
                                                </TabsTrigger>
                                            </TabsList>
                                        </div>

                                        <TabsContent value="general">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-gray-900 dark:text-white">Clinic Name</Label>
                                                    <Input
                                                        value={data.general.clinic_name}
                                                        onChange={(e) => setData('general.clinic_name', e.target.value)}
                                                        placeholder="Your Clinic Name"
                                                        className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-gray-900 dark:text-white">Description</Label>
                                                    <Textarea
                                                        value={data.general.description}
                                                        onChange={(e) => setData('general.description', e.target.value)}
                                                        placeholder="Brief description of your clinic"
                                                        rows={3}
                                                        className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-gray-900 dark:text-white">Address</Label>
                                                    <Textarea
                                                        value={data.general.address}
                                                        onChange={(e) => setData('general.address', e.target.value)}
                                                        placeholder="Clinic address"
                                                        rows={2}
                                                        className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-gray-900 dark:text-white">Phone</Label>
                                                        <Input
                                                            value={data.general.phone}
                                                            onChange={(e) => setData('general.phone', e.target.value)}
                                                            placeholder="+1234567890"
                                                            className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-gray-900 dark:text-white">Email</Label>
                                                        <Input
                                                            type="email"
                                                            value={data.general.email}
                                                            onChange={(e) => setData('general.email', e.target.value)}
                                                            placeholder="clinic@example.com"
                                                            className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Operating Hours</h3>
                                                    <div className="space-y-4">
                                                        {weekDays.map((day) => (
                                                            <div key={day} className="flex items-center gap-4">
                                                                <div className="w-24 font-medium capitalize text-gray-900 dark:text-white">{day}</div>
                                                                <div className="flex items-center gap-4">
                                                                    <Switch
                                                                        checked={!data.general.operating_hours[day].closed}
                                                                        onCheckedChange={(checked) => setData(`general.operating_hours.${day}.closed`, !checked)}
                                                                    />
                                                                    {!data.general.operating_hours[day].closed && (
                                                                        <>
                                                                            <Input
                                                                                type="time"
                                                                                value={data.general.operating_hours[day].open}
                                                                                onChange={(e) => setData(`general.operating_hours.${day}.open`, e.target.value)}
                                                                                className="w-32 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                                                            />
                                                                            <span className="text-gray-700 dark:text-gray-300">to</span>
                                                                            <Input
                                                                                type="time"
                                                                                value={data.general.operating_hours[day].close}
                                                                                onChange={(e) => setData(`general.operating_hours.${day}.close`, e.target.value)}
                                                                                className="w-32 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                                                            />
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="appointments">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label className="text-gray-900 dark:text-white">Enable Appointments</Label>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Allow patients to book appointments
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={data.appointments.enable_appointments}
                                                        onCheckedChange={(checked) => setData('appointments.enable_appointments', checked)}
                                                    />
                                                </div>

                                                {data.appointments.enable_appointments && (
                                                    <>
                                                        <div className="space-y-2">
                                                            <Label className="text-gray-900 dark:text-white">Default Appointment Duration (minutes)</Label>
                                                            <Input
                                                                type="number"
                                                                value={data.appointments.appointment_duration}
                                                                onChange={(e) => setData('appointments.appointment_duration', parseInt(e.target.value))}
                                                                min={5}
                                                                step={5}
                                                                className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label className="text-gray-900 dark:text-white">Buffer Between Appointments (minutes)</Label>
                                                            <Input
                                                                type="number"
                                                                value={data.appointments.appointment_buffer}
                                                                onChange={(e) => setData('appointments.appointment_buffer', parseInt(e.target.value))}
                                                                min={0}
                                                                step={5}
                                                                className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                                            />
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <div className="space-y-0.5">
                                                                <Label className="text-gray-900 dark:text-white">Enable Online Booking</Label>
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                    Allow patients to book online
                                                                </div>
                                                            </div>
                                                            <Switch
                                                                checked={data.appointments.enable_online_booking}
                                                                onCheckedChange={(checked) => setData('appointments.enable_online_booking', checked)}
                                                            />
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <div className="space-y-0.5">
                                                                <Label className="text-gray-900 dark:text-white">Enable Reminders</Label>
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                    Send appointment reminders
                                                                </div>
                                                            </div>
                                                            <Switch
                                                                checked={data.appointments.enable_reminders}
                                                                onCheckedChange={(checked) => setData('appointments.enable_reminders', checked)}
                                                            />
                                                        </div>

                                                        {data.appointments.enable_reminders && (
                                                            <div className="space-y-2">
                                                                <Label className="text-gray-900 dark:text-white">Reminder Hours Before</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={data.appointments.reminder_hours}
                                                                    onChange={(e) => setData('appointments.reminder_hours', parseInt(e.target.value))}
                                                                    min={1}
                                                                    className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                                                />
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="features">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label className="text-gray-900 dark:text-white">Insurance</Label>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Enable insurance processing
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={data.features.enable_insurance}
                                                        onCheckedChange={(checked) => setData('features.enable_insurance', checked)}
                                                    />
                                                </div>

                                                {data.features.enable_insurance && (
                                                    <div className="space-y-2">
                                                        <Label className="text-gray-900 dark:text-white">Insurance Providers</Label>
                                                        <Textarea
                                                            value={data.features.insurance_providers.join('\n')}
                                                            onChange={(e) => setData('features.insurance_providers', e.target.value.split('\n'))}
                                                            placeholder="One provider per line"
                                                            rows={3}
                                                            className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label className="text-gray-900 dark:text-white">Prescriptions</Label>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Enable prescription management
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={data.features.enable_prescriptions}
                                                        onCheckedChange={(checked) => setData('features.enable_prescriptions', checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label className="text-gray-900 dark:text-white">Lab Results</Label>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Enable lab results management
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={data.features.enable_lab_results}
                                                        onCheckedChange={(checked) => setData('features.enable_lab_results', checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label className="text-gray-900 dark:text-white">Dental Charts</Label>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Enable dental charting
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={data.features.enable_dental_charts}
                                                        onCheckedChange={(checked) => setData('features.enable_dental_charts', checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label className="text-gray-900 dark:text-white">Medical History</Label>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Enable medical history tracking
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={data.features.enable_medical_history}
                                                        onCheckedChange={(checked) => setData('features.enable_medical_history', checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label className="text-gray-900 dark:text-white">Patient Portal</Label>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Enable patient portal access
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={data.features.enable_patient_portal}
                                                        onCheckedChange={(checked) => setData('features.enable_patient_portal', checked)}
                                                    />
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="billing">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label className="text-gray-900 dark:text-white">Enable Billing</Label>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Enable billing and invoicing
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={data.billing.enable_billing}
                                                        onCheckedChange={(checked) => setData('billing.enable_billing', checked)}
                                                    />
                                                </div>

                                                {data.billing.enable_billing && (
                                                    <>
                                                        <div className="space-y-2">
                                                            <Label className="text-gray-900 dark:text-white">Tax Rate (%)</Label>
                                                            <Input
                                                                type="number"
                                                                value={data.billing.tax_rate}
                                                                onChange={(e) => setData('billing.tax_rate', parseFloat(e.target.value))}
                                                                min={0}
                                                                step={0.1}
                                                                className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label className="text-gray-900 dark:text-white">Currency</Label>
                                                            <Select
                                                                value={data.billing.currency}
                                                                onValueChange={(value) => setData('billing.currency', value)}
                                                            >
                                                                <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                                                                    <SelectValue placeholder="Select currency" />
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                                                                    <SelectItem value="USD" className="text-gray-900 dark:text-white">USD ($)</SelectItem>
                                                                    <SelectItem value="EUR" className="text-gray-900 dark:text-white">EUR (€)</SelectItem>
                                                                    <SelectItem value="GBP" className="text-gray-900 dark:text-white">GBP (£)</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label className="text-gray-900 dark:text-white">Payment Methods</Label>
                                                            <Textarea
                                                                value={data.billing.payment_methods.join('\n')}
                                                                onChange={(e) => setData('billing.payment_methods', e.target.value.split('\n'))}
                                                                placeholder="One payment method per line"
                                                                rows={3}
                                                                className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label className="text-gray-900 dark:text-white">Invoice Prefix</Label>
                                                            <Input
                                                                value={data.billing.invoice_prefix}
                                                                onChange={(e) => setData('billing.invoice_prefix', e.target.value)}
                                                                placeholder="INV-"
                                                                className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label className="text-gray-900 dark:text-white">Invoice Footer</Label>
                                                            <Textarea
                                                                value={data.billing.invoice_footer}
                                                                onChange={(e) => setData('billing.invoice_footer', e.target.value)}
                                                                placeholder="Thank you for your business"
                                                                rows={3}
                                                                className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                )}
                            </SettingsForm>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 dark:text-gray-400">
                                        You don't have permission to edit clinic settings.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 
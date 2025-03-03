import React from 'react';
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
        user: any;
    };
}

export default function Settings({ settings, auth }: Props) {
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Clinic Settings</CardTitle>
                            <CardDescription>
                                Configure your clinic settings, operating hours, and features.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SettingsForm settings={settings} onSubmit={handleSubmit}>
                                {({ data, setData }) => (
                                    <Tabs defaultValue="general" className="space-y-4">
                                        <TabsList>
                                            <TabsTrigger value="general">General</TabsTrigger>
                                            <TabsTrigger value="appointments">Appointments</TabsTrigger>
                                            <TabsTrigger value="features">Features</TabsTrigger>
                                            <TabsTrigger value="billing">Billing</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="general">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Clinic Name</Label>
                                                    <Input
                                                        value={data.general.clinic_name}
                                                        onChange={(e) => setData('general.clinic_name', e.target.value)}
                                                        placeholder="Your Clinic Name"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Description</Label>
                                                    <Textarea
                                                        value={data.general.description}
                                                        onChange={(e) => setData('general.description', e.target.value)}
                                                        placeholder="Brief description of your clinic"
                                                        rows={3}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Address</Label>
                                                    <Textarea
                                                        value={data.general.address}
                                                        onChange={(e) => setData('general.address', e.target.value)}
                                                        placeholder="Clinic address"
                                                        rows={2}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Phone</Label>
                                                        <Input
                                                            value={data.general.phone}
                                                            onChange={(e) => setData('general.phone', e.target.value)}
                                                            placeholder="+1234567890"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label>Email</Label>
                                                        <Input
                                                            type="email"
                                                            value={data.general.email}
                                                            onChange={(e) => setData('general.email', e.target.value)}
                                                            placeholder="clinic@example.com"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-medium">Operating Hours</h3>
                                                    <div className="space-y-4">
                                                        {weekDays.map((day) => (
                                                            <div key={day} className="flex items-center gap-4">
                                                                <div className="w-24 font-medium capitalize">{day}</div>
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
                                                                                className="w-32"
                                                                            />
                                                                            <span>to</span>
                                                                            <Input
                                                                                type="time"
                                                                                value={data.general.operating_hours[day].close}
                                                                                onChange={(e) => setData(`general.operating_hours.${day}.close`, e.target.value)}
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
                                        </TabsContent>

                                        <TabsContent value="appointments">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Enable Appointments</Label>
                                                        <div className="text-sm text-gray-500">
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
                                                            <Label>Default Appointment Duration (minutes)</Label>
                                                            <Input
                                                                type="number"
                                                                value={data.appointments.appointment_duration}
                                                                onChange={(e) => setData('appointments.appointment_duration', parseInt(e.target.value))}
                                                                min={5}
                                                                step={5}
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>Buffer Between Appointments (minutes)</Label>
                                                            <Input
                                                                type="number"
                                                                value={data.appointments.appointment_buffer}
                                                                onChange={(e) => setData('appointments.appointment_buffer', parseInt(e.target.value))}
                                                                min={0}
                                                                step={5}
                                                            />
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <div className="space-y-0.5">
                                                                <Label>Enable Online Booking</Label>
                                                                <div className="text-sm text-gray-500">
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
                                                                <Label>Enable Reminders</Label>
                                                                <div className="text-sm text-gray-500">
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
                                                                <Label>Reminder Hours Before</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={data.appointments.reminder_hours}
                                                                    onChange={(e) => setData('appointments.reminder_hours', parseInt(e.target.value))}
                                                                    min={1}
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
                                                        <Label>Insurance</Label>
                                                        <div className="text-sm text-gray-500">
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
                                                        <Label>Insurance Providers</Label>
                                                        <Textarea
                                                            value={data.features.insurance_providers.join('\n')}
                                                            onChange={(e) => setData('features.insurance_providers', e.target.value.split('\n'))}
                                                            placeholder="One provider per line"
                                                            rows={3}
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Prescriptions</Label>
                                                        <div className="text-sm text-gray-500">
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
                                                        <Label>Lab Results</Label>
                                                        <div className="text-sm text-gray-500">
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
                                                        <Label>Dental Charts</Label>
                                                        <div className="text-sm text-gray-500">
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
                                                        <Label>Medical History</Label>
                                                        <div className="text-sm text-gray-500">
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
                                                        <Label>Patient Portal</Label>
                                                        <div className="text-sm text-gray-500">
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
                                                        <Label>Enable Billing</Label>
                                                        <div className="text-sm text-gray-500">
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
                                                            <Label>Tax Rate (%)</Label>
                                                            <Input
                                                                type="number"
                                                                value={data.billing.tax_rate}
                                                                onChange={(e) => setData('billing.tax_rate', parseFloat(e.target.value))}
                                                                min={0}
                                                                step={0.1}
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>Currency</Label>
                                                            <Select
                                                                value={data.billing.currency}
                                                                onValueChange={(value) => setData('billing.currency', value)}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select currency" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="USD">USD ($)</SelectItem>
                                                                    <SelectItem value="EUR">EUR (€)</SelectItem>
                                                                    <SelectItem value="GBP">GBP (£)</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>Payment Methods</Label>
                                                            <Textarea
                                                                value={data.billing.payment_methods.join('\n')}
                                                                onChange={(e) => setData('billing.payment_methods', e.target.value.split('\n'))}
                                                                placeholder="One payment method per line"
                                                                rows={3}
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>Invoice Prefix</Label>
                                                            <Input
                                                                value={data.billing.invoice_prefix}
                                                                onChange={(e) => setData('billing.invoice_prefix', e.target.value)}
                                                                placeholder="INV-"
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>Invoice Footer</Label>
                                                            <Textarea
                                                                value={data.billing.invoice_footer}
                                                                onChange={(e) => setData('billing.invoice_footer', e.target.value)}
                                                                placeholder="Thank you for your business"
                                                                rows={3}
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                )}
                            </SettingsForm>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 
import { Button } from '@/Components/ui/button';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, ReactNode } from 'react';
import { toast } from 'sonner';

interface FormChildrenProps {
    data: Record<string, any>;
    setData: (key: string, value: any) => void;
}

interface Props {
    settings: Record<string, any>;
    onSubmit: (data: Record<string, any>) => void;
    children: ReactNode | ((props: FormChildrenProps) => ReactNode);
    submitLabel?: string;
}

export default function SettingsForm({
    settings,
    onSubmit,
    children,
    submitLabel = 'Save Changes',
}: Props) {
    const form = useForm({
        general: {
            company_name:
                settings.general?.company_name ||
                settings.general?.clinic_name ||
                '',
            clinic_name:
                settings.general?.clinic_name ||
                settings.general?.company_name ||
                '',
            description: settings.general?.description || '',
            address: settings.general?.address || '',
            phone: settings.general?.phone || '',
            email: settings.general?.email || '',
            website: settings.general?.website || '',
            operating_hours: settings.general?.operating_hours || {
                monday: { open: '09:00', close: '17:00', closed: false },
                tuesday: { open: '09:00', close: '17:00', closed: false },
                wednesday: { open: '09:00', close: '17:00', closed: false },
                thursday: { open: '09:00', close: '17:00', closed: false },
                friday: { open: '09:00', close: '17:00', closed: false },
                saturday: { open: '09:00', close: '13:00', closed: false },
                sunday: { open: '00:00', close: '00:00', closed: true },
            },
        },
        // Transportation settings
        fleet: {
            max_trucks: settings.fleet?.max_trucks ?? 10,
            truck_types: settings.fleet?.truck_types || [],
            capacity_units: settings.fleet?.capacity_units || 'kg',
            insurance_required: settings.fleet?.insurance_required ?? true,
            insurance_providers: settings.fleet?.insurance_providers || [],
        },
        pricing: {
            base_rate_per_km: settings.pricing?.base_rate_per_km ?? 0.0,
            minimum_charge: settings.pricing?.minimum_charge ?? 0.0,
            currency: settings.pricing?.currency || 'USD',
            payment_methods: settings.pricing?.payment_methods || [],
            tax_rate: settings.pricing?.tax_rate ?? 0.0,
        },
        booking: {
            advance_booking_days: settings.booking?.advance_booking_days ?? 30,
            cancellation_hours: settings.booking?.cancellation_hours ?? 24,
            auto_approval: settings.booking?.auto_approval ?? false,
            require_documents: settings.booking?.require_documents ?? true,
            tracking_enabled: settings.booking?.tracking_enabled ?? true,
        },
        // Clinic settings (for backward compatibility)
        appointments: {
            enable_appointments:
                settings.appointments?.enable_appointments ?? true,
            appointment_duration:
                settings.appointments?.appointment_duration ?? 30,
            appointment_buffer: settings.appointments?.appointment_buffer ?? 15,
            enable_reminders: settings.appointments?.enable_reminders ?? true,
            reminder_hours: settings.appointments?.reminder_hours ?? 24,
            enable_online_booking:
                settings.appointments?.enable_online_booking ?? true,
        },
        features: {
            enable_insurance: settings.features?.enable_insurance ?? true,
            insurance_providers: settings.features?.insurance_providers || [],
            enable_prescriptions:
                settings.features?.enable_prescriptions ?? true,
            enable_lab_results: settings.features?.enable_lab_results ?? true,
            enable_dental_charts:
                settings.features?.enable_dental_charts ?? true,
            enable_medical_history:
                settings.features?.enable_medical_history ?? true,
            enable_patient_portal:
                settings.features?.enable_patient_portal ?? true,
        },
        billing: {
            enable_billing: settings.billing?.enable_billing ?? true,
            tax_rate: settings.billing?.tax_rate ?? 10,
            currency: settings.billing?.currency || 'USD',
            payment_methods: settings.billing?.payment_methods || [],
            invoice_prefix: settings.billing?.invoice_prefix || 'INV-',
            invoice_footer:
                settings.billing?.invoice_footer ||
                'Thank you for choosing our clinic!',
        },
        // Transportation notifications
        notifications: {
            email_notifications:
                settings.notifications?.email_notifications ?? true,
            sms_notifications:
                settings.notifications?.sms_notifications ?? false,
            booking_confirmations:
                settings.notifications?.booking_confirmations ?? true,
            status_updates: settings.notifications?.status_updates ?? true,
        },
    });

    // Helper function to handle nested data updates
    const setData = (key: string, value: any) => {
        const keys = key.split('.');
        if (keys.length === 1) {
            form.setData(key as any, value);
        } else {
            const newData = { ...form.data } as any;
            let current = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            
            // Handle company_name and clinic_name synchronization
            if (keys.length === 2 && keys[0] === 'general') {
                const fieldName = keys[keys.length - 1];
                if (fieldName === 'company_name') {
                    newData.general.clinic_name = value;
                } else if (fieldName === 'clinic_name') {
                    newData.general.company_name = value;
                }
            }
            
            form.setData(newData);
        }
    };

    const handleSubmit: FormEventHandler = async (e) => {
        e.preventDefault();
        try {
            await onSubmit(form.data);
            toast.success('Settings updated successfully');
        } catch (error: any) {
            // Extract error message from API response
            let errorMessage = 'Failed to update settings';

            if (error?.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
            console.error('Settings update error:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {typeof children === 'function'
                ? children({ data: form.data, setData: setData })
                : children}

            <div className="flex items-center justify-end gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    disabled={form.processing}
                >
                    Reset
                </Button>
                <Button type="submit" disabled={form.processing}>
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}

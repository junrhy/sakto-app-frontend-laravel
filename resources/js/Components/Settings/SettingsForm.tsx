import { Button } from '@/Components/ui/button';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, ReactNode } from 'react';
import { toast } from 'sonner';

interface FormChildrenProps {
    data: Record<string, unknown>;
    setData: (key: string, value: unknown) => void;
}

interface Props {
    settings: Record<string, unknown>;
    onSubmit: (data: Record<string, unknown>) => void;
    children: ReactNode | ((props: FormChildrenProps) => ReactNode);
    submitLabel?: string;
}

export default function SettingsForm({
    settings,
    onSubmit,
    children,
    submitLabel = 'Save Changes',
}: Props) {
    const settingsTyped = settings as Record<string, Record<string, unknown>>;
    const general = (settingsTyped.general || {}) as {
        company_name?: string;
        clinic_name?: string;
        description?: string;
        address?: string;
        phone?: string;
        email?: string;
        website?: string;
        operating_hours?: Record<string, { open: string; close: string; closed: boolean }>;
    };
    const fleet = (settingsTyped.fleet || {}) as {
        max_trucks?: number;
        truck_types?: unknown[];
        capacity_units?: string;
        insurance_required?: boolean;
        insurance_providers?: unknown[];
    };
    const pricing = (settingsTyped.pricing || {}) as {
        base_rate_per_km?: number;
        minimum_charge?: number;
        currency?: string;
        payment_methods?: unknown[];
        tax_rate?: number;
    };
    const booking = (settingsTyped.booking || {}) as {
        advance_booking_days?: number;
        cancellation_hours?: number;
        auto_approval?: boolean;
        require_documents?: boolean;
        tracking_enabled?: boolean;
    };
    const appointments = (settingsTyped.appointments || {}) as {
        enable_appointments?: boolean;
        appointment_duration?: number;
        appointment_buffer?: number;
        enable_reminders?: boolean;
        reminder_hours?: number;
        enable_online_booking?: boolean;
    };
    const features = (settingsTyped.features || {}) as {
        enable_insurance?: boolean;
        insurance_providers?: unknown[];
        enable_prescriptions?: boolean;
        enable_lab_results?: boolean;
        enable_dental_charts?: boolean;
        enable_medical_history?: boolean;
        enable_patient_portal?: boolean;
    };
    const billing = (settingsTyped.billing || {}) as {
        enable_billing?: boolean;
        tax_rate?: number;
        currency?: string;
        payment_methods?: unknown[];
        invoice_prefix?: string;
        invoice_footer?: string;
    };
    const notifications = (settingsTyped.notifications || {}) as {
        email_notifications?: boolean;
        sms_notifications?: boolean;
        booking_confirmations?: boolean;
        status_updates?: boolean;
    };

    const form = useForm({
        general: {
            company_name:
                general.company_name ||
                general.clinic_name ||
                '',
            clinic_name:
                general.clinic_name ||
                general.company_name ||
                '',
            description: general.description || '',
            address: general.address || '',
            phone: general.phone || '',
            email: general.email || '',
            website: general.website || '',
            operating_hours: general.operating_hours || {
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
            max_trucks: fleet.max_trucks ?? 10,
            truck_types: fleet.truck_types || [],
            capacity_units: fleet.capacity_units || 'kg',
            insurance_required: fleet.insurance_required ?? true,
            insurance_providers: fleet.insurance_providers || [],
        },
        pricing: {
            base_rate_per_km: pricing.base_rate_per_km ?? 0.0,
            minimum_charge: pricing.minimum_charge ?? 0.0,
            currency: pricing.currency || 'USD',
            payment_methods: pricing.payment_methods || [],
            tax_rate: pricing.tax_rate ?? 0.0,
        },
        booking: {
            advance_booking_days: booking.advance_booking_days ?? 30,
            cancellation_hours: booking.cancellation_hours ?? 24,
            auto_approval: booking.auto_approval ?? false,
            require_documents: booking.require_documents ?? true,
            tracking_enabled: booking.tracking_enabled ?? true,
        },
        // Clinic settings (for backward compatibility)
        appointments: {
            enable_appointments:
                appointments.enable_appointments ?? true,
            appointment_duration:
                appointments.appointment_duration ?? 30,
            appointment_buffer: appointments.appointment_buffer ?? 15,
            enable_reminders: appointments.enable_reminders ?? true,
            reminder_hours: appointments.reminder_hours ?? 24,
            enable_online_booking:
                appointments.enable_online_booking ?? true,
        },
        features: {
            enable_insurance: features.enable_insurance ?? true,
            insurance_providers: features.insurance_providers || [],
            enable_prescriptions:
                features.enable_prescriptions ?? true,
            enable_lab_results: features.enable_lab_results ?? true,
            enable_dental_charts:
                features.enable_dental_charts ?? true,
            enable_medical_history:
                features.enable_medical_history ?? true,
            enable_patient_portal:
                features.enable_patient_portal ?? true,
        },
        billing: {
            enable_billing: billing.enable_billing ?? true,
            tax_rate: billing.tax_rate ?? 10,
            currency: billing.currency || 'USD',
            payment_methods: billing.payment_methods || [],
            invoice_prefix: billing.invoice_prefix || 'INV-',
            invoice_footer:
                billing.invoice_footer ||
                'Thank you for choosing our clinic!',
        },
        // Transportation notifications
        notifications: {
            email_notifications:
                notifications.email_notifications ?? true,
            sms_notifications:
                notifications.sms_notifications ?? false,
            booking_confirmations:
                notifications.booking_confirmations ?? true,
            status_updates: notifications.status_updates ?? true,
        },
    });

    // Helper function to handle nested data updates
    const setData = (key: string, value: unknown) => {
        const keys = key.split('.');
        if (keys.length === 1) {
            // For top-level keys, use setData with the full data object
            const newData = {
                ...form.data,
                [key]: value,
            };
            form.setData(newData as typeof form.data);
        } else {
            const newData = {
                ...form.data,
            } as Record<string, unknown>;
            let current = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!(current[keys[i]] instanceof Object)) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]] as Record<string, unknown>;
            }
            current[keys[keys.length - 1]] = value;

            // Handle company_name and clinic_name synchronization
            if (keys.length === 2 && keys[0] === 'general') {
                const fieldName = keys[keys.length - 1];
                const generalData = newData.general as Record<string, unknown>;
                if (fieldName === 'company_name') {
                    generalData.clinic_name = value;
                } else if (fieldName === 'clinic_name') {
                    generalData.company_name = value;
                }
            }

            form.setData(newData as typeof form.data);
        }
    };

    const handleSubmit: FormEventHandler = async (e) => {
        e.preventDefault();
        try {
            await onSubmit(form.data);
            toast.success('Settings updated successfully');
        } catch (error: unknown) {
            // Extract error message from API response
            let errorMessage = 'Failed to update settings';

            if (
                error &&
                typeof error === 'object' &&
                'response' in error &&
                error.response &&
                typeof error.response === 'object' &&
                'data' in error.response &&
                error.response.data &&
                typeof error.response.data === 'object'
            ) {
                if ('error' in error.response.data) {
                    errorMessage = String(error.response.data.error);
                } else if ('message' in error.response.data) {
                    errorMessage = String(error.response.data.message);
                }
            } else if (error instanceof Error) {
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

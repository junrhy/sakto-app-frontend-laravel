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
        notifications: {
            email_notifications:
                settings.notifications?.email_notifications ?? true,
        },
    });

    const handleSubmit: FormEventHandler = async (e) => {
        e.preventDefault();
        try {
            await onSubmit(form.data);
            toast.success('Settings updated successfully');
        } catch (error) {
            toast.error('Failed to update settings');
            console.error('Settings update error:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {typeof children === 'function'
                ? children({ data: form.data, setData: form.setData })
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

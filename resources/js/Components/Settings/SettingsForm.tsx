import { useForm } from '@inertiajs/react';
import { FormEventHandler, ReactNode, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
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

export default function SettingsForm({ settings, onSubmit, children, submitLabel = 'Save Changes' }: Props) {
    const form = useForm({
        smtp: {
            host: settings.smtp?.host || '',
            port: settings.smtp?.port || 587,
            encryption: settings.smtp?.encryption || 'tls',
            username: settings.smtp?.username || '',
            password: settings.smtp?.password || '',
        },
        sender: {
            from_name: settings.sender?.from_name || '',
            from_email: settings.sender?.from_email || '',
            reply_to: settings.sender?.reply_to || '',
            signature: settings.sender?.signature || '',
        },
        attachments: {
            max_size: settings.attachments?.max_size || 10,
            max_files: settings.attachments?.max_files || 5,
            allowed_types: settings.attachments?.allowed_types || ['pdf', 'doc', 'docx', 'jpg', 'png', 'gif'],
        },
        templates: {
            enabled: settings.templates?.enabled || false,
            default_language: settings.templates?.default_language || 'en',
            custom_variables: settings.templates?.custom_variables || [],
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
            {typeof children === 'function' ? children({ data: form.data, setData: form.setData }) : children}
            
            <div className="flex items-center justify-end gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    disabled={form.processing}
                >
                    Reset
                </Button>
                <Button
                    type="submit"
                    disabled={form.processing}
                >
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
} 
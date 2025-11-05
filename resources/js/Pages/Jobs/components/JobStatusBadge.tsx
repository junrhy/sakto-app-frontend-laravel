import { Badge } from '@/Components/ui/badge';

interface JobStatusBadgeProps {
    status: 'draft' | 'published' | 'closed';
}

export default function JobStatusBadge({ status }: JobStatusBadgeProps) {
    const statusConfig = {
        draft: {
            label: 'Draft',
            variant: 'secondary' as const,
            className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        },
        published: {
            label: 'Published',
            variant: 'default' as const,
            className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        },
        closed: {
            label: 'Closed',
            variant: 'destructive' as const,
            className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        },
    };

    const config = statusConfig[status];

    return (
        <Badge variant={config.variant} className={config.className}>
            {config.label}
        </Badge>
    );
}


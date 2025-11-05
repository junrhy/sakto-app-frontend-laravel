import { Badge } from '@/Components/ui/badge';

interface ApplicationStatusBadgeProps {
    status: 'pending' | 'reviewed' | 'shortlisted' | 'interviewed' | 'accepted' | 'rejected';
}

export default function ApplicationStatusBadge({ status }: ApplicationStatusBadgeProps) {
    const statusConfig = {
        pending: {
            label: 'Pending',
            className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        },
        reviewed: {
            label: 'Reviewed',
            className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        },
        shortlisted: {
            label: 'Shortlisted',
            className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        },
        interviewed: {
            label: 'Interviewed',
            className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        },
        accepted: {
            label: 'Accepted',
            className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        },
        rejected: {
            label: 'Rejected',
            className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        },
    };

    const config = statusConfig[status];

    return (
        <Badge className={config.className}>
            {config.label}
        </Badge>
    );
}


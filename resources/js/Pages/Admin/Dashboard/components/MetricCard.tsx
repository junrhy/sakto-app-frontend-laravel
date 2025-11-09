import { ReactNode } from 'react';

type MetricAccent = 'blue' | 'green' | 'slate';

interface MetricCardProps {
    title: string;
    description: string;
    amount: string;
    icon: ReactNode;
    accent?: MetricAccent;
}

const stylesByAccent: Record<
    MetricAccent,
    {
        container: string;
        text: string;
        iconContainer: string;
    }
> = {
    blue: {
        container:
            'border border-blue-100 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30',
        text: 'text-blue-900 dark:text-blue-100',
        iconContainer: 'bg-blue-100 dark:bg-blue-900/50',
    },
    green: {
        container:
            'border border-green-100 bg-green-50 dark:border-green-800 dark:bg-green-950/30',
        text: 'text-green-900 dark:text-green-100',
        iconContainer: 'bg-green-100 dark:bg-green-900/50',
    },
    slate: {
        container:
            'border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/40',
        text: 'text-slate-900 dark:text-slate-100',
        iconContainer: 'bg-slate-100 dark:bg-slate-800',
    },
};

export function MetricCard({
    title,
    description,
    amount,
    icon,
    accent = 'blue',
}: MetricCardProps) {
    const styles = stylesByAccent[accent];

    return (
        <div className={`rounded-xl p-6 shadow-sm ${styles.container}`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className={`text-sm font-medium ${styles.text}`}>
                        {title}
                    </p>
                    <h3 className={`mt-2 text-3xl font-bold ${styles.text}`}>
                        {amount}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                        {description}
                    </p>
                </div>
                <span
                    className={`rounded-full p-3 text-slate-700 dark:text-slate-200 ${styles.iconContainer}`}
                >
                    {icon}
                </span>
            </div>
        </div>
    );
}


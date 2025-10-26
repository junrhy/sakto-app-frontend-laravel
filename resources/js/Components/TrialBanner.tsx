import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Button } from '@/Components/ui/button';
import { Link } from '@inertiajs/react';
import { Clock, Sparkles, X } from 'lucide-react';
import { useState } from 'react';

interface TrialBannerProps {
    daysRemaining: number;
    endsAt: string;
    className?: string;
}

export default function TrialBanner({
    daysRemaining,
    endsAt,
    className = '',
}: TrialBannerProps) {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    const getVariant = () => {
        if (daysRemaining <= 3) return 'destructive';
        if (daysRemaining <= 7) return 'warning';
        return 'default';
    };

    const getMessage = () => {
        if (daysRemaining === 0) {
            return 'Your free trial ends today!';
        }
        if (daysRemaining === 1) {
            return 'Your free trial ends tomorrow!';
        }
        return `Your free trial ends in ${daysRemaining} days`;
    };

    const getBgColor = () => {
        if (daysRemaining <= 3)
            return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
        if (daysRemaining <= 7)
            return 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800';
        return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800';
    };

    const getTextColor = () => {
        if (daysRemaining <= 3) return 'text-red-800 dark:text-red-200';
        if (daysRemaining <= 7) return 'text-amber-800 dark:text-amber-200';
        return 'text-blue-800 dark:text-blue-200';
    };

    const getIconColor = () => {
        if (daysRemaining <= 3) return 'text-red-600 dark:text-red-400';
        if (daysRemaining <= 7) return 'text-amber-600 dark:text-amber-400';
        return 'text-blue-600 dark:text-blue-400';
    };

    const getButtonColor = () => {
        if (daysRemaining <= 3)
            return 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800';
        if (daysRemaining <= 7)
            return 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800';
        return 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800';
    };

    return (
        <Alert className={`relative ${getBgColor()} ${className}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex flex-1 items-start gap-3">
                    <div className={`${getIconColor()} mt-0.5`}>
                        {daysRemaining <= 7 ? (
                            <Clock className="h-5 w-5" />
                        ) : (
                            <Sparkles className="h-5 w-5" />
                        )}
                    </div>
                    <div className="flex-1">
                        <AlertDescription
                            className={`${getTextColor()} font-medium`}
                        >
                            {getMessage()}
                        </AlertDescription>
                        <p
                            className={`${getTextColor()} mt-1 text-sm opacity-90`}
                        >
                            Subscribe now to continue enjoying all premium
                            features without interruption.
                        </p>
                        <Link href="/subscriptions">
                            <Button
                                size="sm"
                                className={`mt-3 ${getButtonColor()} text-white`}
                            >
                                View Subscription Plans
                            </Button>
                        </Link>
                    </div>
                </div>
                <button
                    onClick={() => setDismissed(true)}
                    className={`${getTextColor()} transition-opacity hover:opacity-70`}
                    aria-label="Dismiss banner"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </Alert>
    );
}

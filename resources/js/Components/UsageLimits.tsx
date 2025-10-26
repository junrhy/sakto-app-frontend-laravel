import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Progress } from '@/Components/ui/progress';
import { AlertCircle, CheckCircle2, Infinity } from 'lucide-react';

interface LimitInfo {
    current: number;
    limit: number;
    percentage: number;
    remaining: number;
    unlimited: boolean;
}

interface UsageLimitsProps {
    limits: {
        [key: string]: LimitInfo;
    };
    title?: string;
    className?: string;
}

export default function UsageLimits({
    limits,
    title = 'Usage Limits',
    className = '',
}: UsageLimitsProps) {
    const formatResourceName = (key: string): string => {
        return key
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const getStatusColor = (percentage: number): string => {
        if (percentage >= 90) return 'text-red-600 dark:text-red-400';
        if (percentage >= 75) return 'text-orange-600 dark:text-orange-400';
        if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-green-600 dark:text-green-400';
    };

    const getProgressColor = (percentage: number): string => {
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 75) return 'bg-orange-500';
        if (percentage >= 50) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getStatusIcon = (percentage: number, unlimited: boolean) => {
        if (unlimited) return <Infinity className="h-4 w-4 text-blue-500" />;
        if (percentage >= 90)
            return <AlertCircle className="h-4 w-4 text-red-500" />;
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    };

    if (!limits || Object.keys(limits).length === 0) {
        return null;
    }

    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {Object.entries(limits).map(([resource, info]) => (
                    <div key={resource} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {getStatusIcon(info.percentage, info.unlimited)}
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {formatResourceName(resource)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                {info.unlimited ? (
                                    <Badge
                                        variant="outline"
                                        className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                                    >
                                        Unlimited
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="outline"
                                        className={`${
                                            info.percentage >= 90
                                                ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                                                : info.percentage >= 75
                                                  ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
                                                  : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                                        }`}
                                    >
                                        {info.remaining >= 0
                                            ? `${info.remaining} left`
                                            : 'Limit reached'}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {!info.unlimited && (
                            <>
                                <Progress
                                    value={info.percentage}
                                    className="h-2"
                                    indicatorClassName={getProgressColor(
                                        info.percentage,
                                    )}
                                />
                                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                                    <span>{info.current} used</span>
                                    <span
                                        className={getStatusColor(
                                            info.percentage,
                                        )}
                                    >
                                        {info.percentage.toFixed(0)}% of{' '}
                                        {info.limit}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

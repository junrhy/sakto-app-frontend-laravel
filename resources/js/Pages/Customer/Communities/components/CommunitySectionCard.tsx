import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { CommunityCollectionItem } from '../types';
import {
    coerceToString,
    getItemDescription,
    getItemTitle,
} from '../utils/communityCollections';

interface CommunitySectionCardProps {
    id: string;
    title: string;
    items: CommunityCollectionItem[];
    emptyMessage: string;
    itemValueKeys?: string[];
}

export function CommunitySectionCard({
    id,
    title,
    items,
    emptyMessage,
    itemValueKeys = [],
}: CommunitySectionCardProps) {
    return (
        <Card
            id={id}
            className="border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {items.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>
                ) : (
                    <div className="space-y-3">
                        {items.map((item, index) => {
                            const statusLabel = coerceToString(item.status);

                            return (
                                <div
                                    key={(item.id as string | number | undefined) ?? `${id}-${index}`}
                                    className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                                                {getItemTitle(item)}
                                            </p>
                                            {getItemDescription(item) && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {getItemDescription(item)}
                                                </p>
                                            )}
                                        </div>
                                        {statusLabel && (
                                            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                                {statusLabel}
                                            </span>
                                        )}
                                    </div>
                                    {itemValueKeys.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            {itemValueKeys
                                                .map((key) => coerceToString(item[key]))
                                                .filter((value): value is string => !!value)
                                                .map((value, valueIndex) => (
                                                    <span
                                                        key={`${id}-value-${valueIndex}`}
                                                        className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                                    >
                                                        {value}
                                                    </span>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

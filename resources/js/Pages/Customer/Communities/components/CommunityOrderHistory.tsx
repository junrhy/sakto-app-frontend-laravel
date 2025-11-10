import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { CommunityCollectionItem } from '../types';
import { coerceToString, formatDate } from '../utils/communityCollections';

interface CommunityOrderHistoryProps {
    id: string;
    items: CommunityCollectionItem[];
}

export function CommunityOrderHistory({ id, items }: CommunityOrderHistoryProps) {
    return (
        <Card
            id={id}
            className="border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Order History
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {items.length === 0 ? (
                    <div className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        No order history yet.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-700">
                                <TableHead className="text-gray-900 dark:text-white">Order #</TableHead>
                                <TableHead className="text-gray-900 dark:text-white">Status</TableHead>
                                <TableHead className="text-gray-900 dark:text-white">Total</TableHead>
                                <TableHead className="text-right text-gray-900 dark:text-white">Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item, index) => (
                                <TableRow
                                    key={(item.id as string | number | undefined) ?? `order-${index}`}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    <TableCell className="text-gray-900 dark:text-white">
                                        {coerceToString(item.order_number) ??
                                            coerceToString(item.reference) ??
                                            'N/A'}
                                    </TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">
                                        {coerceToString(item.order_status) ??
                                            coerceToString(item.status) ??
                                            'Unknown'}
                                    </TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">
                                        {coerceToString(item.total_formatted) ??
                                            coerceToString(item.amount_formatted) ??
                                            coerceToString(item.total) ??
                                            coerceToString(item.amount) ??
                                            '—'}
                                    </TableCell>
                                    <TableCell className="text-right text-gray-900 dark:text-white">
                                        {formatDate(item.created_at)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}

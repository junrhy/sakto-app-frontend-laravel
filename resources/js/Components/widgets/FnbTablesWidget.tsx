import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TableData {
    name: string;
    seats: number;
    status: 'available' | 'occupied' | 'reserved' | 'cleaning';
}

export function FnbTablesWidget() {
    const [tables, setTables] = useState<TableData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const response = await fetch('/pos-restaurant/tables-overview');
                const data = await response.json();
                console.log(data);
                setTables(data);
            } catch (error) {
                console.error('Error fetching tables:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTables();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50 dark:text-green-300';
            case 'occupied':
                return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 dark:text-red-300';
            case 'reserved':
                return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 dark:text-blue-300';
            case 'cleaning':
                return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/50 dark:text-yellow-300';
            default:
                return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800/50 dark:text-gray-300';
        }
    };

    const groupedTables = tables.reduce(
        (acc, table) => {
            if (!acc[table.status]) {
                acc[table.status] = [];
            }
            acc[table.status].push(table);
            return acc;
        },
        {} as Record<string, TableData[]>,
    );

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="dark:text-gray-100">
                    Tables Status
                </CardTitle>
                <div className="mt-3 flex flex-wrap gap-2">
                    {['available', 'occupied', 'reserved', 'cleaning'].map(
                        (status) => (
                            <div
                                key={status}
                                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${getStatusColor(
                                    status,
                                )}`}
                            >
                                <span className="capitalize">{status}</span>
                                <span className="text-xs">
                                    ({groupedTables[status]?.length || 0})
                                </span>
                            </div>
                        ),
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {['available', 'occupied', 'reserved', 'cleaning'].map(
                    (status) =>
                        groupedTables[status]?.length > 0 && (
                            <div key={status} className="mb-6 last:mb-0">
                                <h3 className="mb-3 text-sm font-medium capitalize dark:text-gray-200">
                                    {status} Tables
                                </h3>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                    {groupedTables[status]?.map((table) => (
                                        <div
                                            key={table.name}
                                            className={`rounded-lg border p-3 transition-colors sm:p-4 ${getStatusColor(table.status)} ${
                                                table.status === 'available'
                                                    ? 'cursor-pointer hover:brightness-95 dark:hover:brightness-110'
                                                    : ''
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 sm:gap-2">
                                                    <span className="sm:text-md text-base font-semibold">
                                                        {table.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 sm:h-4 sm:w-4" />
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                                                        {table.seats}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ),
                )}
            </CardContent>
        </Card>
    );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Users } from "lucide-react";

interface TableData {
    tableNumber: string;
    seats: number;
    status: 'available' | 'occupied' | 'reserved' | 'cleaning';
    timeRemaining: string | null;
    server: string | null;
}

export function FnbTablesWidget() {
    const sampleTableData: TableData[] = [
        {
            tableNumber: "1",
            seats: 4,
            status: "available",
            timeRemaining: null,
            server: null,
        },
        {
            tableNumber: "2",
            seats: 2,
            status: "occupied",
            timeRemaining: "45 min",
            server: "John Smith",
        },
        {
            tableNumber: "3",
            seats: 6,
            status: "reserved",
            timeRemaining: "Arriving in 15 min",
            server: null,
        },
        {
            tableNumber: "4",
            seats: 4,
            status: "cleaning",
            timeRemaining: "5 min",
            server: null,
        },
        {
            tableNumber: "5",
            seats: 4,
            status: "available",
            timeRemaining: null,
            server: null,
        },
        {
            tableNumber: "6",
            seats: 4,
            status: "available",
            timeRemaining: null,
            server: null,
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50';
            case 'occupied':
                return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50';
            case 'reserved':
                return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50';
            case 'cleaning':
                return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/50';
            default:
                return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800/50';
        }
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle>Tables Status</CardTitle>
                <div className="flex flex-wrap gap-2 mt-3">
                    {['available', 'occupied', 'reserved', 'cleaning'].map((status) => (
                        <div
                            key={status}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 ${getStatusColor(
                                status
                            )}`}
                        >
                            <span className="capitalize">{status}</span>
                        </div>
                    ))}
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {sampleTableData.map((table) => (
                        <div
                            key={table.tableNumber}
                            className={`p-3 sm:p-4 rounded-lg border transition-colors ${getStatusColor(table.status)} ${
                                table.status === 'available' ? 'cursor-pointer hover:brightness-95 dark:hover:brightness-110' : ''
                            }`}
                        >
                            <div className="flex justify-between items-center mb-2 sm:mb-3">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <span className="text-base sm:text-md font-semibold">Table {table.tableNumber}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span className="text-xs sm:text-sm text-gray-500">{table.seats}</span>
                                </div>
                            </div>
                            {(table.timeRemaining || table.server) && (
                                <div className="space-y-1.5 mt-2 border-t pt-2 dark:border-gray-800">
                                    {table.timeRemaining && (
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-3 sm:h-3">
                                                <circle cx="12" cy="12" r="10"/>
                                                <polyline points="12 6 12 12 16 14"/>
                                            </svg>
                                            <span className="line-clamp-1">{table.timeRemaining}</span>
                                        </div>
                                    )}
                                    {table.server && (
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-3 sm:h-3">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                                <circle cx="12" cy="7" r="4"/>
                                            </svg>
                                            <span className="line-clamp-1">{table.server}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
} 
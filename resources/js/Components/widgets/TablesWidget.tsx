import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";

interface TableData {
    tableNumber: string;
    seats: number;
    status: 'available' | 'occupied' | 'reserved' | 'cleaning';
    timeRemaining: string | null;
    server: string | null;
}

export function TablesWidget() {
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
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
            case 'occupied':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
            case 'reserved':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            case 'cleaning':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'available':
                return '✓';
            case 'occupied':
                return '●';
            case 'reserved':
                return '⏰';
            case 'cleaning':
                return '🧹';
            default:
                return '•';
        }
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle>Tables Status</CardTitle>
                <div className="flex flex-wrap gap-3 mt-2 text-sm">
                    {['available', 'occupied', 'reserved', 'cleaning'].map((status) => (
                        <div key={status} className="flex items-center gap-1 min-w-[80px]">
                            <span className={`w-2 h-2 rounded-full ${getStatusColor(status)}`}></span>
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
                            className={`p-3 sm:p-4 rounded-lg border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                                table.status === 'available' ? 'cursor-pointer' : ''
                            }`}
                        >
                            <div className="flex justify-between items-center mb-2 sm:mb-3">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <span className="text-base sm:text-lg font-semibold">Table {table.tableNumber}</span>
                                    <span className={`px-1 rounded-full text-xs ${getStatusColor(table.status)}`}>
                                        {getStatusIcon(table.status)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 sm:w-4 sm:h-4">
                                        <path d="M18 11v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                                        <circle cx="12" cy="9" r="3"/>
                                    </svg>
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
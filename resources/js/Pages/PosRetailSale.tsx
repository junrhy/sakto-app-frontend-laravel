import { Button } from '@/Components/ui/button';
import { Calendar } from '@/Components/ui/calendar';
import { Card } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Input } from '@/Components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/Components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { cn } from '@/lib/utils';
import { PageProps } from '@/types';
import { Project, User } from '@/types/index';
import { Head, router } from '@inertiajs/react';
import {
    endOfMonth,
    endOfWeek,
    format,
    startOfMonth,
    startOfToday,
    startOfWeek,
    subMonths,
} from 'date-fns';
import { Calendar as CalendarIcon, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DateRange as CalendarDateRange } from 'react-day-picker';
import { toast } from 'sonner';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';

type DateRange = {
    from: Date | undefined;
    to: Date | undefined;
};

const itemsPerPage = 5;

interface SaleItem {
    id: string;
    price: string;
    quantity: number;
}

interface Sale {
    id: number;
    created_at: string;
    items: SaleItem[];
    total_amount: number;
    cash_received: number;
    change: number;
    payment_method: string;
}

interface Props extends PageProps {
    sales: Sale[];
    auth: {
        user: User;
        project?: Project;
        modules?: string[];
        selectedTeamMember?: {
            identifier: string;
            first_name: string;
            last_name: string;
            full_name: string;
            email: string;
            roles: string[];
            allowed_apps: string[];
            profile_picture?: string;
        };
    };
}

export default function PosRetailSale({ sales, auth }: Props) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [paymentMethodFilter, setPaymentMethodFilter] =
        useState<string>('all');
    const today = new Date();
    const oneMonthAgo = subMonths(today, 1);

    const [dateRange, setDateRange] = useState<DateRange>({
        from: oneMonthAgo,
        to: today,
    });

    const [data, setData] = useState<Sale[]>(sales);

    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager') ||
                auth.selectedTeamMember.roles.includes('user')
            );
        }
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

    const canDelete = useMemo(() => {
        if (auth.selectedTeamMember) {
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager')
            );
        }
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

    const uniquePaymentMethods = Array.from(
        new Set(data.map((sale) => sale.payment_method)),
    );

    const filteredData = data.filter((sale) => {
        // Basic validation
        if (!sale.items || !Array.isArray(sale.items)) {
            return false;
        }

        // Search filter
        const normalizedSearchTerm = searchTerm.trim().toLowerCase();
        const matchesSearch =
            normalizedSearchTerm === '' ||
            sale.items.some((item: SaleItem) => {
                const itemId = item.id.toLowerCase();
                return itemId.includes(normalizedSearchTerm);
            });

        // Payment method filter
        const matchesPaymentMethod =
            paymentMethodFilter === 'all' ||
            sale.payment_method === paymentMethodFilter;

        // Date range filter
        let matchesDateRange = true;
        if (dateRange.from && dateRange.to) {
            const saleDate = new Date(sale.created_at);
            const fromDate = new Date(dateRange.from);
            fromDate.setHours(0, 0, 0, 0);

            const toDate = new Date(dateRange.to);
            toDate.setHours(23, 59, 59, 999);

            matchesDateRange = saleDate >= fromDate && saleDate <= toDate;
        }

        return matchesSearch && matchesPaymentMethod && matchesDateRange;
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredData.slice(
        startIndex,
        startIndex + itemsPerPage,
    );

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this sale?')) {
            router.delete(`/retail-sale/${id}`, {
                onSuccess: () => {
                    toast.success('Sale has been deleted successfully');
                    setData(data.filter((item) => item.id !== id));
                },
                onError: () => {
                    toast.error('Failed to delete sale');
                },
            });
        }
    };

    const handleMultipleDelete = () => {
        if (confirm('Are you sure you want to delete the selected sales?')) {
            router.delete('/retail-sales/bulk-delete', {
                data: { ids: selectedIds },
                onSuccess: () => {
                    toast.success(
                        `${selectedIds.length} sales have been deleted successfully`,
                    );
                    setData(
                        data.filter((item) => !selectedIds.includes(item.id)),
                    );
                    setSelectedIds([]);
                },
                onError: () => {
                    toast.error('Failed to delete selected sales');
                },
            });
        }
    };

    const toggleSelectAll = () => {
        setSelectedIds((prevSelected) =>
            prevSelected.length === currentItems.length
                ? prevSelected.filter(
                      (selectedId) =>
                          !currentItems
                              .map((item) => item.id)
                              .includes(selectedId),
                  )
                : [...prevSelected, ...currentItems.map((item) => item.id)],
        );
    };

    const toggleSelect = (id: number) => {
        setSelectedIds((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((selectedId) => selectedId !== id)
                : [...prevSelected, id],
        );
    };

    const handleDateRangeSelect = (range: string) => {
        const today = new Date();
        let newRange: DateRange;

        switch (range) {
            case 'today':
                newRange = {
                    from: startOfToday(),
                    to: today,
                };
                break;
            case 'this-week':
                newRange = {
                    from: startOfWeek(today, { weekStartsOn: 1 }),
                    to: endOfWeek(today, { weekStartsOn: 1 }),
                };
                break;
            case 'this-month':
                newRange = {
                    from: startOfMonth(today),
                    to: endOfMonth(today),
                };
                break;
            case 'last-month':
                const lastMonth = subMonths(today, 1);
                newRange = {
                    from: startOfMonth(lastMonth),
                    to: endOfMonth(lastMonth),
                };
                break;
            default:
                return;
        }

        setDateRange(newRange);
    };

    // Add this function to calculate total quantities
    const calculateTotalQuantities = (sales: Sale[]) => {
        const itemQuantities: { [key: string]: number } = {};

        sales.forEach((sale) => {
            sale.items.forEach((item) => {
                if (itemQuantities[item.id]) {
                    itemQuantities[item.id] += item.quantity;
                } else {
                    itemQuantities[item.id] = item.quantity;
                }
            });
        });

        return itemQuantities;
    };

    // Get total quantities for filtered data
    const totalQuantities = calculateTotalQuantities(filteredData);

    return (
        <AuthenticatedLayout
            auth={{
                user: auth.user,
                project: auth.project,
                modules: auth.modules,
            }}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Sales
                </h2>
            }
        >
            <Head title="Sales" />

            <Card className="p-6">
                <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
                    <div className="lg:col-span-2">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-4 w-4 text-gray-500" />
                            </span>
                            <Input
                                type="text"
                                placeholder="Search by item name..."
                                value={searchTerm}
                                onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>,
                                ) => setSearchTerm(event.target.value)}
                                className="h-10 pl-10"
                            />
                        </div>
                    </div>
                    <div className="lg:col-span-2">
                        <Select
                            value={paymentMethodFilter}
                            onValueChange={setPaymentMethodFilter}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Payment Method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Methods</SelectItem>
                                {uniquePaymentMethods.map((method) => (
                                    <SelectItem key={method} value={method}>
                                        {method}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="lg:col-span-4">
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="h-10">
                                        Quick Select
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            handleDateRangeSelect('today')
                                        }
                                    >
                                        Today
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            handleDateRangeSelect('this-week')
                                        }
                                    >
                                        This Week
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            handleDateRangeSelect('this-month')
                                        }
                                    >
                                        This Month
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            handleDateRangeSelect('last-month')
                                        }
                                    >
                                        Last Month
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'h-10 w-full justify-start text-left font-normal',
                                            !dateRange.from &&
                                                'text-muted-foreground',
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange.from ? (
                                            dateRange.to ? (
                                                <>
                                                    {format(
                                                        dateRange.from,
                                                        'LLL dd, y',
                                                    )}{' '}
                                                    -{' '}
                                                    {format(
                                                        dateRange.to,
                                                        'LLL dd, y',
                                                    )}
                                                </>
                                            ) : (
                                                format(
                                                    dateRange.from,
                                                    'LLL dd, y',
                                                )
                                            )
                                        ) : (
                                            <span>Pick a date range</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                >
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange.from}
                                        selected={{
                                            from: dateRange.from,
                                            to: dateRange.to,
                                        }}
                                        onSelect={(
                                            range:
                                                | CalendarDateRange
                                                | undefined,
                                        ) => {
                                            if (range) {
                                                setDateRange({
                                                    from: range.from,
                                                    to: range.to ?? range.from,
                                                });
                                            }
                                        }}
                                        numberOfMonths={
                                            window.innerWidth >= 768 ? 2 : 1
                                        }
                                    ></Calendar>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div className="flex justify-end lg:col-span-4">
                        {canDelete && (
                            <Button
                                variant="destructive"
                                onClick={handleMultipleDelete}
                                disabled={selectedIds.length === 0}
                                className="h-10 w-full md:w-auto"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete ({selectedIds.length})
                            </Button>
                        )}
                    </div>
                </div>

                {/* Add this section before the table */}
                {searchTerm && (
                    <div className="mb-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                        <h3 className="mb-2 text-sm font-medium">
                            Item Quantities for Search Results:
                        </h3>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                            {Object.entries(totalQuantities).map(
                                ([itemId, quantity]) =>
                                    itemId
                                        .toLowerCase()
                                        .includes(searchTerm.toLowerCase()) && (
                                        <div
                                            key={itemId}
                                            className="flex items-center justify-between rounded-md bg-white p-2 shadow-sm dark:bg-gray-700"
                                        >
                                            <span className="font-medium">
                                                {itemId}:
                                            </span>
                                            <span className="text-sm">
                                                {quantity} units
                                            </span>
                                        </div>
                                    ),
                            )}
                        </div>
                    </div>
                )}

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableCell className="w-[50px]">
                                    <Checkbox
                                        checked={
                                            currentItems.length > 0 &&
                                            currentItems.every((item) =>
                                                selectedIds.includes(item.id),
                                            )
                                        }
                                        onCheckedChange={toggleSelectAll}
                                        aria-label="Select all on current page"
                                    />
                                </TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Item</TableCell>
                                <TableCell>Total</TableCell>
                                <TableCell>Cash Received</TableCell>
                                <TableCell>Change</TableCell>
                                <TableCell>Payment Method</TableCell>
                                <TableCell className="w-[100px]">
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentItems.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="py-4 text-center"
                                    >
                                        No sales data found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentItems.map((sale, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedIds.includes(
                                                    sale.id,
                                                )}
                                                onCheckedChange={() =>
                                                    toggleSelect(sale.id)
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {sale.created_at
                                                ? new Date(
                                                      sale.created_at,
                                                  ).toLocaleDateString()
                                                : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {sale.items.map(
                                                (
                                                    item: SaleItem,
                                                    idx: number,
                                                ) => (
                                                    <div key={item.id}>
                                                        {item.id} (${item.price}{' '}
                                                        x {item.quantity})
                                                    </div>
                                                ),
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {sale.total_amount}
                                        </TableCell>
                                        <TableCell>
                                            {sale.cash_received}
                                        </TableCell>
                                        <TableCell>{sale.change}</TableCell>
                                        <TableCell>
                                            {sale.payment_method}
                                        </TableCell>
                                        <TableCell>
                                            {canDelete && (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDelete(sale.id)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="mt-4 flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="text-sm text-gray-500">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                        {Math.min(
                            currentPage * itemsPerPage,
                            filteredData.length,
                        )}{' '}
                        of {filteredData.length} entries
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() =>
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <Button
                                key={i + 1}
                                variant={
                                    currentPage === i + 1
                                        ? 'default'
                                        : 'outline'
                                }
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </Button>
                        ))}
                        <Button
                            variant="outline"
                            onClick={() =>
                                setCurrentPage((prev) =>
                                    Math.min(prev + 1, totalPages),
                                )
                            }
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </Card>
        </AuthenticatedLayout>
    );
}

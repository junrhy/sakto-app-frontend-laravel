import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/Components/ui/table";
import { Card } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { useState, useEffect } from 'react';
import { Trash2, Search, Calendar as CalendarIcon } from 'lucide-react';
import { Checkbox } from '@/Components/ui/checkbox';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/Components/ui/select";
import { Calendar } from "@/Components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { subMonths, startOfToday, startOfWeek, startOfMonth, endOfMonth, endOfWeek } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu";
import { DateRange as CalendarDateRange } from "react-day-picker";
import { router } from '@inertiajs/react';
import { toast } from "sonner";

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

export default function PosRetailSale({ sales }: { sales: Sale[] }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
    const today = new Date();
    const oneMonthAgo = subMonths(today, 1);
    
    const [dateRange, setDateRange] = useState<DateRange>({
        from: oneMonthAgo,
        to: today,
    });

    const [data, setData] = useState<Sale[]>(sales);
    
    const uniquePaymentMethods = Array.from(
        new Set(data.map(sale => sale.payment_method))
    );

    const filteredData = data.filter(sale => {
        // Basic validation
        if (!sale.items || !Array.isArray(sale.items)) {
            return false;
        }

        // Search filter
        const normalizedSearchTerm = searchTerm.trim().toLowerCase();
        const matchesSearch = normalizedSearchTerm === "" || sale.items.some((item: SaleItem) => {
            const itemId = item.id.toLowerCase();
            return itemId.includes(normalizedSearchTerm);
        });

        // Payment method filter
        const matchesPaymentMethod = paymentMethodFilter === "all" || sale.payment_method === paymentMethodFilter;
        
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
    const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this sale?")) {
            router.delete(`/retail-sale/${id}`, {
                onSuccess: () => {
                    toast.success("Sale has been deleted successfully");
                    setData(data.filter(item => item.id !== id));
                },
                onError: () => {
                    toast.error("Failed to delete sale");
                },
            });
        }
    };

    const handleMultipleDelete = () => {
        if (confirm("Are you sure you want to delete the selected sales?")) {
            router.delete('/retail-sales/bulk-delete', {
                data: { ids: selectedIds },
                onSuccess: () => {
                    toast.success(`${selectedIds.length} sales have been deleted successfully`);
                    setData(data.filter(item => !selectedIds.includes(item.id)));
                    setSelectedIds([]);
                },
                onError: () => {
                    toast.error("Failed to delete selected sales");
                },
            });
        }
    };

    const toggleSelectAll = () => {
        setSelectedIds(prevSelected => 
            prevSelected.length === currentItems.length 
                ? prevSelected.filter(selectedId => !currentItems.map(item => item.id).includes(selectedId)) 
                : [...prevSelected, ...currentItems.map(item => item.id)]
        );
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prevSelected => 
            prevSelected.includes(id) 
                ? prevSelected.filter(selectedId => selectedId !== id) 
                : [...prevSelected, id]
        );
    };

    const handleDateRangeSelect = (range: string) => {
        const today = new Date();
        let newRange: DateRange;
        
        switch (range) {
            case 'today':
                newRange = {
                    from: startOfToday(),
                    to: today
                };
                break;
            case 'this-week':
                newRange = {
                    from: startOfWeek(today, { weekStartsOn: 1 }),
                    to: endOfWeek(today, { weekStartsOn: 1 })
                };
                break;
            case 'this-month':
                newRange = {
                    from: startOfMonth(today),
                    to: endOfMonth(today)
                };
                break;
            case 'last-month':
                const lastMonth = subMonths(today, 1);
                newRange = {
                    from: startOfMonth(lastMonth),
                    to: endOfMonth(lastMonth)
                };
                break;
            default:
                return;
        }
        
        setDateRange(newRange);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Sales
                </h2>
            }
        >
            <Head title="Sales" />
            
            <Card className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
                    <div className="lg:col-span-2">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-4 w-4 text-gray-500" />
                            </span>
                            <Input 
                                type="text" 
                                placeholder="Search by item name..." 
                                value={searchTerm} 
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value)} 
                                className="pl-10 h-10"
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
                        <div className="flex flex-col sm:flex-row gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="h-10"
                                    >
                                        Quick Select
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleDateRangeSelect('today')}>
                                        Today
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDateRangeSelect('this-week')}>
                                        This Week
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDateRangeSelect('this-month')}>
                                        This Month
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDateRangeSelect('last-month')}>
                                        Last Month
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal h-10",
                                            !dateRange.from && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange.from ? (
                                            dateRange.to ? (
                                                <>
                                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                                    {format(dateRange.to, "LLL dd, y")}
                                                </>
                                            ) : (
                                                format(dateRange.from, "LLL dd, y")
                                            )
                                        ) : (
                                            <span>Pick a date range</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange.from}
                                        selected={{
                                            from: dateRange.from,
                                            to: dateRange.to
                                        }}
                                        onSelect={(range: CalendarDateRange | undefined) => {
                                            if (range) {
                                                setDateRange({
                                                    from: range.from,
                                                    to: range.to ?? range.from
                                                });
                                            }
                                        }}
                                        numberOfMonths={window.innerWidth >= 768 ? 2 : 1}
                                    ></Calendar>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div className="lg:col-span-4 flex justify-end">
                        <Button 
                            variant="destructive" 
                            onClick={handleMultipleDelete} 
                            disabled={selectedIds.length === 0}
                            className="h-10 w-full md:w-auto"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete ({selectedIds.length})
                        </Button>
                    </div>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableCell className="w-[50px]">
                                    <Checkbox
                                        checked={currentItems.length > 0 && 
                                        currentItems.every(item => selectedIds.includes(item.id))}
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
                                <TableCell className="w-[100px]">Actions</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-4">
                                        No sales data found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentItems.map((sale, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedIds.includes(sale.id)} 
                                                onCheckedChange={() => toggleSelect(sale.id)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {sale.created_at ? new Date(sale.created_at).toLocaleDateString() : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {sale.items.map((item: SaleItem, idx: number) => (
                                                <div key={item.id}>
                                                    {item.id} (${item.price} x {item.quantity})
                                                </div>
                                            ))}
                                        </TableCell>
                                        <TableCell>{sale.total_amount}</TableCell>
                                        <TableCell>{sale.cash_received}</TableCell>
                                        <TableCell>{sale.change}</TableCell>
                                        <TableCell>{sale.payment_method}</TableCell>
                                        <TableCell>
                                            <Button 
                                                variant="destructive" 
                                                size="sm"
                                                onClick={() => handleDelete(sale.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-4">
                    <div className="text-sm text-gray-500">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <Button
                                key={i + 1}
                                variant={currentPage === i + 1 ? "default" : "outline"}
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </Button>
                        ))}
                        <Button 
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
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

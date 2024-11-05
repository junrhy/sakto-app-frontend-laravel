import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/Components/ui/table";
import { Card } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { useState } from 'react';
import { Trash2, Search, Calendar as CalendarIcon } from 'lucide-react';
import { Checkbox } from '@/Components/ui/checkbox';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/Components/ui/select";
import { Calendar } from "@/Components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { subMonths, startOfToday, startOfWeek, startOfMonth, endOfMonth, endOfWeek } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu";

type DateRange = {
    from: Date | undefined;
    to: Date | undefined;
};

const itemsPerPage = 5;

interface SaleItem {
    id: number;
    price: number;
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
        if (!sale.items || !Array.isArray(sale.items)) {
            console.log('Invalid sale items for sale:', sale);
            return false;
        }

        const matchesSearch = searchTerm === "" || sale.items.some((item: { id: number }) => 
            item.id.toString().includes(searchTerm.toLowerCase())
        );
        const matchesPaymentMethod = paymentMethodFilter === "all" || sale.payment_method === paymentMethodFilter;
        let matchesDateRange = true;
        if (dateRange.from || dateRange.to) {
            const saleDate = new Date(sale.created_at);
            if (dateRange.from && dateRange.to) {
                matchesDateRange = saleDate >= dateRange.from && saleDate <= dateRange.to;
            } else if (dateRange.from) {
                matchesDateRange = saleDate >= dateRange.from;
            } else if (dateRange.to) {
                matchesDateRange = saleDate <= dateRange.to;
            }
        }

        return matchesSearch && matchesPaymentMethod && matchesDateRange;
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);

    console.log('Sales data:', {
        receivedSales: sales,
        currentData: data,
        filteredData: filteredData,
        currentItems: currentItems
    });

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this sale?")) {
            setData(data.filter(item => item.id !== id));
        }
    };

    const handleMultipleDelete = () => {
        if (confirm("Are you sure you want to delete the selected sales?")) {
            setData(data.filter(item => !selectedIds.includes(item.id)));
            setSelectedIds([]);
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
        
        switch (range) {
            case 'today':
                setDateRange({
                    from: startOfToday(),
                    to: today
                });
                break;
            case 'this-week':
                setDateRange({
                    from: startOfWeek(today, { weekStartsOn: 1 }), // Week starts on Monday
                    to: endOfWeek(today, { weekStartsOn: 1 })
                });
                break;
            case 'this-month':
                setDateRange({
                    from: startOfMonth(today),
                    to: endOfMonth(today)
                });
                break;
            case 'last-month':
                const lastMonth = subMonths(today, 1);
                setDateRange({
                    from: startOfMonth(lastMonth),
                    to: endOfMonth(lastMonth)
                });
                break;
        }
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
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative w-full md:w-1/4">
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
                    <div className="w-full md:w-1/4">
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
                    <div className="w-full md:w-1/4">
                        <div className="flex gap-2">
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
                                        selected={dateRange}
                                        onSelect={(range) => {
                                            if (range && 'from' in range && 'to' in range) {
                                                setDateRange({
                                                    from: range.from || new Date(),
                                                    to: range.to || new Date(),
                                                });
                                            }
                                        }}
                                        numberOfMonths={2}
                                    ></Calendar>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div className="flex justify-end md:flex-1">
                        <Button 
                            variant="destructive" 
                            onClick={handleMultipleDelete} 
                            disabled={selectedIds.length === 0}
                            className="h-10"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Selected ({selectedIds.length})
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
                                            {sale.items.map((item: { id: number; price: number; quantity: number }, idx: number) => (
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

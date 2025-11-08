import { Head } from '@inertiajs/react';
import axios from 'axios';
import {
    Calendar,
    Pencil,
    Plus,
    RefreshCcw,
    Trash2,
    Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
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
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { PageProps } from '@/types';

import { useTravelApi } from '@/Pages/Travel/useTravelApi';
import type {
    AppCurrencySettings,
    PaginatedResponse,
    TravelBooking,
    TravelBookingStatus,
    TravelPackage,
    TravelPaymentStatus,
} from '@/Pages/Travel/travel';

interface TravelBookingsPageProps extends PageProps {
    bookings: PaginatedResponse<TravelBooking>;
    packages: TravelPackage[];
    appCurrency?: AppCurrencySettings | null;
}

type BookingFormState = {
    travel_package_id: number | '';
    booking_reference: string;
    customer_name: string;
    customer_email: string;
    customer_contact_number: string;
    travel_date: string;
    travelers_count: string;
    total_price: string;
    status: TravelBookingStatus;
    payment_status: TravelPaymentStatus;
    notes: string;
    metadata: string;
    send_confirmation_email: boolean;
};

const DEFAULT_BOOKING_STATE: BookingFormState = {
    travel_package_id: '',
    booking_reference: '',
    customer_name: '',
    customer_email: '',
    customer_contact_number: '',
    travel_date: '',
    travelers_count: '1',
    total_price: '',
    status: 'pending',
    payment_status: 'unpaid',
    notes: '',
    metadata: '',
    send_confirmation_email: false,
};

const BOOKING_STATUS_OPTIONS: TravelBookingStatus[] = [
    'pending',
    'confirmed',
    'completed',
    'cancelled',
    'rescheduled',
];

const PAYMENT_STATUS_OPTIONS: TravelPaymentStatus[] = [
    'unpaid',
    'partial',
    'paid',
    'refunded',
];

const formatDisplayDate = (value?: string | null) => {
    if (!value) {
        return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
};

export default function TravelBookingsIndex({
    bookings,
    packages,
    appCurrency,
}: TravelBookingsPageProps) {
    const [bookingData, setBookingData] =
        useState<PaginatedResponse<TravelBooking>>(bookings);
    const [packageOptions, setPackageOptions] =
        useState<TravelPackage[]>(packages);
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formState, setFormState] = useState<BookingFormState>(
        DEFAULT_BOOKING_STATE,
    );
    const [activeBooking, setActiveBooking] = useState<TravelBooking | null>(
        null,
    );
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<
        TravelBookingStatus | 'all'
    >('all');
    const [paymentFilter, setPaymentFilter] = useState<
        TravelPaymentStatus | 'all'
    >('all');
    const [packageFilter, setPackageFilter] = useState<number | 'all'>('all');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const {
        currencySettings,
        formatCurrency,
        fetchBookings: apiFetchBookings,
        fetchPackages: apiFetchPackages,
        logError,
    } = useTravelApi(appCurrency ?? null);

    useEffect(() => {
        setBookingData(bookings);
    }, [bookings]);

    useEffect(() => {
        setPackageOptions(packages);
    }, [packages]);

    const openCreateDialog = () => {
        setActiveBooking(null);
        setFormState(DEFAULT_BOOKING_STATE);
        setIsDialogOpen(true);
    };

    const openEditDialog = (booking: TravelBooking) => {
        setActiveBooking(booking);
        setFormState({
            travel_package_id: booking.travel_package_id,
            booking_reference: booking.booking_reference ?? '',
            customer_name: booking.customer_name ?? '',
            customer_email: booking.customer_email ?? '',
            customer_contact_number: booking.customer_contact_number ?? '',
            travel_date: booking.travel_date?.slice(0, 10) ?? '',
            travelers_count: booking.travelers_count
                ? String(booking.travelers_count)
                : '1',
            total_price: booking.total_price ? String(booking.total_price) : '',
            status: (booking.status as TravelBookingStatus) || 'pending',
            payment_status:
                (booking.payment_status as TravelPaymentStatus) || 'unpaid',
            notes: booking.notes ?? '',
            metadata: booking.metadata
                ? JSON.stringify(booking.metadata, null, 2)
                : '',
            send_confirmation_email: false,
        });
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setActiveBooking(null);
        setFormState(DEFAULT_BOOKING_STATE);
    };

    const fetchBookings = async (page?: number) => {
        try {
            setLoading(true);
            const data = await apiFetchBookings({
                search: search || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                payment_status:
                    paymentFilter !== 'all' ? paymentFilter : undefined,
                travel_package_id:
                    packageFilter !== 'all' ? packageFilter : undefined,
                from_date: fromDate || undefined,
                to_date: toDate || undefined,
                page: page ?? bookingData?.current_page ?? 1,
            });

            setBookingData(data);
        } catch (error: any) {
            logError(error, 'fetch bookings');
            toast.error('Failed to fetch travel bookings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchPackages = async () => {
        try {
            const data = await apiFetchPackages({
                status: 'published',
                per_page: 100,
            });

            if (data?.data) {
                setPackageOptions(data.data);
            }
        } catch (error: any) {
            logError(error, 'fetch packages for booking');
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!formState.travel_package_id) {
            toast.error('Please select a travel package.');
            return;
        }

        try {
            setSaving(true);
            const payload = {
                travel_package_id: Number(formState.travel_package_id),
                booking_reference: formState.booking_reference || undefined,
                customer_name: formState.customer_name,
                customer_email: formState.customer_email || undefined,
                customer_contact_number:
                    formState.customer_contact_number || undefined,
                travel_date: formState.travel_date,
                travelers_count: Number(formState.travelers_count || 1),
                total_price: Number(formState.total_price || 0),
                status: formState.status,
                payment_status: formState.payment_status,
                notes: formState.notes || undefined,
                metadata: safeParseJson(formState.metadata),
            };

            if (activeBooking) {
                await axios.put(
                    route('travel.bookings.update', activeBooking.id),
                    payload,
                );
                toast.success('Booking updated successfully.');
            } else {
                await axios.post(route('travel.bookings.store'), payload);
                toast.success('Booking created successfully.');
            }

            closeDialog();
            await fetchBookings();
        } catch (error: any) {
            if (error?.response?.status === 422) {
                const message =
                    error.response.data?.message ||
                    'Validation error. Please review the form fields.';
                toast.error(message);
            } else {
                logError(error, 'save booking');
                toast.error('Failed to save booking. Please try again.');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteBooking = async (booking: TravelBooking) => {
        try {
            setLoading(true);
            await axios.delete(route('travel.bookings.destroy', booking.id));
            toast.success('Booking deleted successfully.');
            await fetchBookings(
                bookingData?.data.length === 1 && bookingData.current_page > 1
                    ? bookingData.current_page - 1
                    : bookingData.current_page,
            );
        } catch (error: any) {
            logError(error, 'delete booking');
            toast.error('Failed to delete booking. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const statusBadgeVariant = (status: TravelBookingStatus) => {
        switch (status) {
            case 'confirmed':
            case 'completed':
                return 'default';
            case 'pending':
                return 'secondary';
            case 'cancelled':
                return 'destructive';
            case 'rescheduled':
            default:
                return 'outline';
        }
    };

    const paymentBadgeVariant = (status: TravelPaymentStatus) => {
        switch (status) {
            case 'paid':
                return 'default';
            case 'partial':
                return 'secondary';
            case 'refunded':
                return 'outline';
            case 'unpaid':
            default:
                return 'destructive';
        }
    };

    const filterDescription = useMemo(() => {
        const parts: string[] = [];

        if (statusFilter !== 'all') {
            parts.push(`Status: ${statusFilter}`);
        }
        if (paymentFilter !== 'all') {
            parts.push(`Payment: ${paymentFilter}`);
        }
        if (packageFilter !== 'all') {
            const pkg = packageOptions.find(
                (item) => item.id === packageFilter,
            );
            if (pkg) {
                parts.push(`Package: ${pkg.title}`);
            }
        }
        if (fromDate || toDate) {
            parts.push(
                `Travel Date: ${fromDate || 'Any'} → ${toDate || 'Any'}`,
            );
        }

        if (!parts.length) {
            return 'Review and manage customer bookings across all travel packages.';
        }

        return parts.join(' • ');
    }, [
        statusFilter,
        paymentFilter,
        packageFilter,
        fromDate,
        toDate,
        packageOptions,
    ]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold leading-tight text-gray-900 dark:text-white">
                            Travel Bookings
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Monitor reservations, payment statuses, and customer
                            details.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => fetchBookings()}
                            disabled={loading}
                        >
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                        <Button onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Booking
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Travel Bookings" />

            <div className="space-y-6">
                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                            Bookings Overview
                        </CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            {filterDescription}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 grid gap-3 md:grid-cols-6">
                            <div className="md:col-span-2">
                                <Label htmlFor="booking-search">Search</Label>
                                <Input
                                    id="booking-search"
                                    placeholder="Search by customer or reference..."
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={statusFilter}
                                    onValueChange={(value) =>
                                        setStatusFilter(
                                            value as
                                                | TravelBookingStatus
                                                | 'all',
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        {BOOKING_STATUS_OPTIONS.map(
                                            (status) => (
                                                <SelectItem
                                                    key={status}
                                                    value={status}
                                                >
                                                    {status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        status.slice(1)}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Payment</Label>
                                <Select
                                    value={paymentFilter}
                                    onValueChange={(value) =>
                                        setPaymentFilter(
                                            value as
                                                | TravelPaymentStatus
                                                | 'all',
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by payment" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        {PAYMENT_STATUS_OPTIONS.map(
                                            (status) => (
                                                <SelectItem
                                                    key={status}
                                                    value={status}
                                                >
                                                    {status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        status.slice(1)}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Package</Label>
                                <Select
                                    value={
                                        packageFilter === 'all'
                                            ? 'all'
                                            : String(packageFilter)
                                    }
                                    onValueChange={(value) =>
                                        setPackageFilter(
                                            value === 'all'
                                                ? 'all'
                                                : Number(value),
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All packages" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All packages
                                        </SelectItem>
                                        {packageOptions.map((pkg) => (
                                            <SelectItem
                                                key={pkg.id}
                                                value={String(pkg.id)}
                                            >
                                                {pkg.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="from_date">From</Label>
                                <Input
                                    id="from_date"
                                    type="date"
                                    value={fromDate}
                                    onChange={(event) =>
                                        setFromDate(event.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <Label htmlFor="to_date">To</Label>
                                <Input
                                    id="to_date"
                                    type="date"
                                    value={toDate}
                                    onChange={(event) =>
                                        setToDate(event.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <div className="mb-4 flex flex-wrap gap-2">
                            <Button
                                onClick={() => fetchBookings()}
                                disabled={loading}
                            >
                                Apply Filters
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setSearch('');
                                    setStatusFilter('all');
                                    setPaymentFilter('all');
                                    setPackageFilter('all');
                                    setFromDate('');
                                    setToDate('');
                                    fetchBookings(1);
                                }}
                                disabled={loading}
                            >
                                Reset
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => fetchPackages()}
                                disabled={loading}
                            >
                                Refresh Packages
                            </Button>
                        </div>

                        <Card className="border border-gray-200 dark:border-gray-700">
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50 dark:bg-gray-700">
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Customer
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Package
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Travel Date
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Travelers
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Total Price
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Status
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Payment
                                            </TableHead>
                                            <TableHead className="text-right text-gray-900 dark:text-white">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <TableCell
                                                    colSpan={8}
                                                    className="text-center text-gray-900 dark:text-white"
                                                >
                                                    Loading bookings...
                                                </TableCell>
                                            </TableRow>
                                        ) : bookingData?.data?.length ? (
                                            bookingData.data.map((booking) => (
                                                <TableRow
                                                    key={booking.id}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                                >
                                                    <TableCell className="text-gray-900 dark:text-white">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">
                                                                {
                                                                    booking.customer_name
                                                                }
                                                            </span>
                                                            {booking.booking_reference && (
                                                                <span className="text-xs text-gray-500">
                                                                    Ref:{' '}
                                                                    {
                                                                        booking.booking_reference
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-gray-900 dark:text-white">
                                                        {booking.package
                                                            ?.title || '—'}
                                                    </TableCell>
                                                    <TableCell className="text-gray-900 dark:text-white">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4 text-gray-500" />
                                                            <span>
                                                                {formatDisplayDate(
                                                                    booking.travel_date,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-gray-900 dark:text-white">
                                                        <div className="flex items-center gap-1">
                                                            <Users className="h-4 w-4 text-gray-500" />
                                                            <span>
                                                                {
                                                                    booking.travelers_count
                                                                }
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-gray-900 dark:text-white">
                                                        {formatCurrency(
                                                            booking.total_price,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-gray-900 dark:text-white">
                                                        <Badge
                                                            variant={statusBadgeVariant(
                                                                booking.status as TravelBookingStatus,
                                                            )}
                                                        >
                                                            {booking.status
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                booking.status.slice(
                                                                    1,
                                                                )}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-gray-900 dark:text-white">
                                                        <Badge
                                                            variant={paymentBadgeVariant(
                                                                booking.payment_status as TravelPaymentStatus,
                                                            )}
                                                        >
                                                            {booking.payment_status
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                booking.payment_status.slice(
                                                                    1,
                                                                )}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right text-gray-900 dark:text-white">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    openEditDialog(
                                                                        booking,
                                                                    )
                                                                }
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-red-500 hover:text-red-600"
                                                                onClick={() =>
                                                                    handleDeleteBooking(
                                                                        booking,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <TableCell
                                                    colSpan={8}
                                                    className="text-center text-gray-900 dark:text-white"
                                                >
                                                    No bookings found. Create a
                                                    booking to get started.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                            <span>
                                Page {bookingData?.current_page ?? 1} of{' '}
                                {bookingData?.last_page ?? 1}
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        fetchBookings(
                                            (bookingData?.current_page ?? 1) -
                                                1,
                                        )
                                    }
                                    disabled={
                                        loading ||
                                        (bookingData?.current_page ?? 1) <= 1
                                    }
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        fetchBookings(
                                            (bookingData?.current_page ?? 1) +
                                                1,
                                        )
                                    }
                                    disabled={
                                        loading ||
                                        (bookingData?.current_page ?? 1) >=
                                            (bookingData?.last_page ?? 1)
                                    }
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
                <DialogContent className="p-0 sm:max-w-3xl">
                    <DialogHeader className="px-6 pt-6 pb-4">
                        <DialogTitle>
                            {activeBooking ? 'Edit Booking' : 'Create Booking'}
                        </DialogTitle>
                        <DialogDescription>
                            {activeBooking
                                ? 'Update booking details and notify the traveler of changes.'
                                : 'Capture a new booking for one of your travel packages.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form className="flex max-h-[70vh] flex-col" onSubmit={handleSubmit}>
                        <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label>Travel Package</Label>
                                    <Select
                                        value={
                                            formState.travel_package_id === ''
                                                ? ''
                                                : String(
                                                      formState.travel_package_id,
                                                  )
                                        }
                                        onValueChange={(value) =>
                                            setFormState((prev) => ({
                                                ...prev,
                                                travel_package_id: value
                                                    ? Number(value)
                                                    : '',
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a package" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {packageOptions.map((pkg) => (
                                                <SelectItem
                                                    key={pkg.id}
                                                    value={String(pkg.id)}
                                                >
                                                    {pkg.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="booking_reference">
                                        Booking Reference
                                    </Label>
                                    <Input
                                        id="booking_reference"
                                        placeholder="Optional reference code"
                                        value={formState.booking_reference}
                                        onChange={(event) =>
                                            setFormState((prev) => ({
                                                ...prev,
                                                booking_reference:
                                                    event.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="customer_name">
                                        Customer Name
                                    </Label>
                                    <Input
                                        id="customer_name"
                                        required
                                        value={formState.customer_name}
                                        onChange={(event) =>
                                            setFormState((prev) => ({
                                                ...prev,
                                                customer_name:
                                                    event.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="customer_email">
                                        Customer Email
                                    </Label>
                                    <Input
                                        id="customer_email"
                                        type="email"
                                        value={formState.customer_email}
                                        onChange={(event) =>
                                            setFormState((prev) => ({
                                                ...prev,
                                                customer_email:
                                                    event.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="customer_contact_number">
                                        Contact Number
                                    </Label>
                                    <Input
                                        id="customer_contact_number"
                                        value={formState.customer_contact_number}
                                        onChange={(event) =>
                                            setFormState((prev) => ({
                                                ...prev,
                                                customer_contact_number:
                                                    event.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="travel_date">
                                        Travel Date
                                    </Label>
                                    <Input
                                        id="travel_date"
                                        type="date"
                                        required
                                        value={formState.travel_date}
                                        onChange={(event) =>
                                            setFormState((prev) => ({
                                                ...prev,
                                                travel_date: event.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="travelers_count">
                                        Travelers
                                    </Label>
                                    <Input
                                        id="travelers_count"
                                        type="number"
                                        min="1"
                                        value={formState.travelers_count}
                                        onChange={(event) =>
                                            setFormState((prev) => ({
                                                ...prev,
                                                travelers_count:
                                                    event.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="total_price">
                                        Total Price
                                    </Label>
                                    <Input
                                        id="total_price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formState.total_price}
                                        onChange={(event) =>
                                            setFormState((prev) => ({
                                                ...prev,
                                                total_price: event.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label>Status</Label>
                                    <Select
                                        value={formState.status}
                                        onValueChange={(value) =>
                                            setFormState((prev) => ({
                                                ...prev,
                                                status:
                                                    value as TravelBookingStatus,
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {BOOKING_STATUS_OPTIONS.map(
                                                (status) => (
                                                    <SelectItem
                                                        key={status}
                                                        value={status}
                                                    >
                                                        {status
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            status.slice(1)}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Payment Status</Label>
                                    <Select
                                        value={formState.payment_status}
                                        onValueChange={(value) =>
                                            setFormState((prev) => ({
                                                ...prev,
                                                payment_status:
                                                    value as TravelPaymentStatus,
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select payment status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PAYMENT_STATUS_OPTIONS.map(
                                                (status) => (
                                                    <SelectItem
                                                        key={status}
                                                        value={status}
                                                    >
                                                        {status
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            status.slice(1)}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    rows={4}
                                    placeholder="Special requests, reminders, or internal notes."
                                    value={formState.notes}
                                    onChange={(event) =>
                                        setFormState((prev) => ({
                                            ...prev,
                                            notes: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div>
                                <Label htmlFor="metadata">Metadata (JSON)</Label>
                                <Textarea
                                    id="metadata"
                                    rows={4}
                                    placeholder='{"special_request": "Vegetarian meals"}'
                                    value={formState.metadata}
                                    onChange={(event) =>
                                        setFormState((prev) => ({
                                            ...prev,
                                            metadata: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="send_confirmation_email"
                                    checked={formState.send_confirmation_email}
                                    onCheckedChange={(value) =>
                                        setFormState((prev) => ({
                                            ...prev,
                                            send_confirmation_email:
                                                Boolean(value),
                                        }))
                                    }
                                />
                                <Label htmlFor="send_confirmation_email">
                                    Send confirmation email to customer
                                </Label>
                            </div>
                        </div>
                        <DialogFooter className="border-t px-6 py-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={closeDialog}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving
                                    ? 'Saving...'
                                    : activeBooking
                                      ? 'Update Booking'
                                      : 'Create Booking'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}

function safeParseJson(value: string) {
    if (!value.trim()) {
        return undefined;
    }

    try {
        return JSON.parse(value);
    } catch (error) {
        toast.error(
            'Invalid JSON in metadata field. Please correct it before saving.',
        );
        throw error;
    }
}

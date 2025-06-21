import { User, Project } from '@/types/index';
import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { toast } from 'sonner';
import { Filter, Search, UserPlus, Users, CheckCircle, Clock, XCircle, Mail, Phone, MapPin, Calendar, CreditCard, UserCheck, UserX, Edit, Trash2, Download } from 'lucide-react';
import { format } from 'date-fns';

interface Event {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
    max_participants: number;
    current_participants: number;
    is_paid_event: boolean;
    event_price: number;
    currency: string;
}

interface Participant {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    notes: string | null;
    checked_in: boolean;
    created_at: string;
    payment_status: string;
    amount_paid: number | string | null;
    payment_date: string | null;
    payment_method: string | null;
    transaction_id: string | null;
    payment_notes: string | null;
}

interface Props extends PageProps {
    auth: {
        user: User;
        project?: Project;
        modules?: string[];
    };
    event: Event;
    participants: Participant[];
}

export default function Participants({ auth, event, participants }: Props) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        notes: ''
    });

    const [paymentModal, setPaymentModal] = useState({
        isOpen: false,
        participant: null as Participant | null,
        paymentData: {
            payment_status: 'pending',
            amount_paid: 0,
            payment_method: '',
            transaction_id: '',
            payment_notes: ''
        }
    });

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
    const [checkInFilter, setCheckInFilter] = useState('all');

    const formatAmount = (amount: number | string | null, currency: string) => {
        if (amount === null || amount === undefined) return '-';
        const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
        return `${currency} ${numericAmount.toFixed(2)}`;
    };

    // Filter participants based on search and filters
    const filteredParticipants = participants.filter(participant => {
        const matchesSearch = 
            (participant.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (participant.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (participant.phone?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (participant.notes?.toLowerCase() || '').includes(searchQuery.toLowerCase());

        const matchesPaymentStatus = paymentStatusFilter === 'all' || participant.payment_status === paymentStatusFilter;
        
        const matchesCheckIn = checkInFilter === 'all' || 
            (checkInFilter === 'checked_in' && participant.checked_in) ||
            (checkInFilter === 'not_checked_in' && !participant.checked_in);

        return matchesSearch && matchesPaymentStatus && matchesCheckIn;
    });

    // Get filter counts
    const getFilterCounts = () => {
        const counts = {
            total: participants.length,
            paid: participants.filter(p => p.payment_status === 'paid').length,
            pending: participants.filter(p => p.payment_status === 'pending').length,
            cancelled: participants.filter(p => p.payment_status === 'cancelled').length,
            checkedIn: participants.filter(p => p.checked_in).length,
            notCheckedIn: participants.filter(p => !p.checked_in).length
        };
        return counts;
    };

    const filterCounts = getFilterCounts();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`/events/${event.id}/participants`, formData, {
            onSuccess: () => {
                toast.success('Participant registered successfully');
                setFormData({ name: '', email: '', phone: '', notes: '' });
            },
            onError: () => {
                toast.error('Failed to register participant');
            }
        });
    };

    const handleUnregister = (participantId: number) => {
        if (!confirm('Are you sure you want to unregister this participant?')) return;

        router.delete(`/events/${event.id}/participants/${participantId}`, {
            onSuccess: () => {
                toast.success('Participant unregistered successfully');
            },
            onError: () => {
                toast.error('Failed to unregister participant');
            }
        });
    };

    const handleCheckIn = (participantId: number) => {
        router.post(`/events/${event.id}/participants/${participantId}/check-in`, {}, {
            onSuccess: () => {
                toast.success('Participant checked in successfully');
            },
            onError: () => {
                toast.error('Failed to check in participant');
            }
        });
    };

    const openPaymentModal = (participant: Participant) => {
        setPaymentModal({
            isOpen: true,
            participant,
            paymentData: {
                payment_status: participant.payment_status || 'pending',
                amount_paid: typeof participant.amount_paid === 'number' ? participant.amount_paid : parseFloat(participant.amount_paid || '0') || 0,
                payment_method: participant.payment_method || '',
                transaction_id: participant.transaction_id || '',
                payment_notes: participant.payment_notes || ''
            }
        });
    };

    const handlePaymentUpdate = () => {
        if (!paymentModal.participant) return;

        router.put(`/events/${event.id}/participants/${paymentModal.participant.id}/payment`, paymentModal.paymentData, {
            onSuccess: () => {
                toast.success('Payment status updated successfully');
                setPaymentModal({ isOpen: false, participant: null, paymentData: { payment_status: 'pending', amount_paid: 0, payment_method: '', transaction_id: '', payment_notes: '' } });
            },
            onError: () => {
                toast.error('Failed to update payment status');
            }
        });
    };

    const getPaymentStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
            case 'cancelled':
                return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
            default:
                return <Badge variant="secondary">Unknown</Badge>;
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setPaymentStatusFilter('all');
        setCheckInFilter('all');
    };

    const exportToCSV = () => {
        // Define CSV headers
        const headers = [
            'Name',
            'Email',
            'Phone',
            'Notes',
            'Check-in Status',
            'Registration Date'
        ];

        // Add payment-related headers for paid events
        if (event.is_paid_event) {
            headers.push('Payment Status', 'Amount Paid', 'Payment Method', 'Transaction ID', 'Payment Notes', 'Payment Date');
        }

        // Convert participants data to CSV rows
        const csvRows = [headers.join(',')];

        filteredParticipants.forEach(participant => {
            const row = [
                `"${participant.name}"`,
                `"${participant.email}"`,
                `"${participant.phone || ''}"`,
                `"${participant.notes || ''}"`,
                `"${participant.checked_in ? 'Checked In' : 'Not Checked In'}"`,
                `"${format(new Date(participant.created_at), 'MMM d, yyyy')}"`
            ];

            // Add payment data for paid events
            if (event.is_paid_event) {
                row.push(
                    `"${participant.payment_status}"`,
                    `"${participant.amount_paid ? formatAmount(participant.amount_paid, event.currency) : ''}"`,
                    `"${participant.payment_method || ''}"`,
                    `"${participant.transaction_id || ''}"`,
                    `"${participant.payment_notes || ''}"`,
                    `"${participant.payment_date ? format(new Date(participant.payment_date), 'MMM d, yyyy') : ''}"`
                );
            }

            csvRows.push(row.join(','));
        });

        // Create and download CSV file
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_participants_${format(new Date(), 'yyyy-MM-dd')}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast.success('Participants data exported successfully!');
        } else {
            toast.error('Export not supported in this browser');
        }
    };

    return (
        <AuthenticatedLayout
            auth={{ user: auth.user, project: auth.project, modules: auth.modules }}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Event Participants</h2>}
        >
            <Head title="Event Participants" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Event Info Header */}
                    <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                        <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800 mb-2">{event.title}</h1>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        <div className="flex items-center space-x-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>{format(new Date(event.start_date), 'MMM d, yyyy')}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Users className="w-4 h-4" />
                                            <span>{event.current_participants} / {event.max_participants || '∞'} participants</span>
                                        </div>
                                        {event.is_paid_event && (
                                            <div className="flex items-center space-x-1">
                                                <CreditCard className="w-4 h-4" />
                                                <span>{event.currency} {event.event_price}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-sm">
                                        {filteredParticipants.length} of {participants.length} shown
                                    </Badge>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={exportToCSV}
                                        className="flex items-center space-x-1 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700 hover:from-green-100 hover:to-emerald-100"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span>Export CSV</span>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Registration Form */}
                    <Card className="mb-8 border-0 shadow-md">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                            <CardTitle className="flex items-center text-lg">
                                <UserPlus className="w-5 h-5 mr-2 text-green-600" />
                                Register New Participant
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            className="h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            className="h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            value={formData.notes}
                                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                            className="h-11 resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                                        Register Participant
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Filters Section */}
                    <Card className="mb-8 border-0 shadow-md">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center text-lg">
                                    <Filter className="w-5 h-5 mr-2 text-blue-600" />
                                    Filters & Search
                                </CardTitle>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={exportToCSV}
                                        className="flex items-center space-x-1 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700 hover:from-green-100 hover:to-emerald-100"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span>Export</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="flex items-center space-x-1"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        <span>Clear All</span>
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {/* Search Filter */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Search Participants</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input
                                            placeholder="Name, email, phone..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 h-11"
                                        />
                                    </div>
                                </div>

                                {/* Payment Status Filter */}
                                {event.is_paid_event && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Payment Status</Label>
                                        <Select
                                            value={paymentStatusFilter}
                                            onValueChange={setPaymentStatusFilter}
                                        >
                                            <SelectTrigger className="h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All ({filterCounts.total})</SelectItem>
                                                <SelectItem value="paid">Paid ({filterCounts.paid})</SelectItem>
                                                <SelectItem value="pending">Pending ({filterCounts.pending})</SelectItem>
                                                <SelectItem value="cancelled">Cancelled ({filterCounts.cancelled})</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Check-in Status Filter */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Check-in Status</Label>
                                    <Select
                                        value={checkInFilter}
                                        onValueChange={setCheckInFilter}
                                    >
                                        <SelectTrigger className="h-11">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All ({filterCounts.total})</SelectItem>
                                            <SelectItem value="checked_in">Checked In ({filterCounts.checkedIn})</SelectItem>
                                            <SelectItem value="not_checked_in">Not Checked In ({filterCounts.notCheckedIn})</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Quick Stats */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Quick Stats</Label>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                <span className="text-sm font-medium">Checked In</span>
                                            </div>
                                            <Badge variant="outline" className="bg-green-100 text-green-800">
                                                {filterCounts.checkedIn}
                                            </Badge>
                                        </div>
                                        {event.is_paid_event && (
                                            <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                                                <div className="flex items-center space-x-2">
                                                    <Clock className="w-4 h-4 text-yellow-600" />
                                                    <span className="text-sm font-medium">Pending Payment</span>
                                                </div>
                                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                                    {filterCounts.pending}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Participants Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredParticipants.map((participant) => (
                            <Card key={participant.id} className="hover:shadow-lg transition-shadow duration-200 border-0 shadow-md">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg font-semibold text-gray-800 mb-2">
                                                {participant.name}
                                            </CardTitle>
                                            <div className="flex items-center space-x-2 mb-2">
                                                {participant.checked_in ? (
                                                    <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center space-x-1">
                                                        <UserCheck className="w-3 h-3" />
                                                        <span>Checked In</span>
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="flex items-center space-x-1">
                                                        <UserX className="w-3 h-3" />
                                                        <span>Not Checked In</span>
                                                    </Badge>
                                                )}
                                                {event.is_paid_event && getPaymentStatusBadge(participant.payment_status)}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="pt-0">
                                    <div className="space-y-3">
                                        {/* Contact Information */}
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <Mail className="w-4 h-4" />
                                                <span className="truncate">{participant.email}</span>
                                            </div>
                                            {participant.phone && (
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <Phone className="w-4 h-4" />
                                                    <span>{participant.phone}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Payment Information */}
                                        {event.is_paid_event && (
                                            <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-700">Amount Paid:</span>
                                                    <span className="text-sm font-semibold">
                                                        {participant.amount_paid ? formatAmount(participant.amount_paid, event.currency) : '-'}
                                                    </span>
                                                </div>
                                                {participant.payment_method && (
                                                    <div className="text-xs text-gray-500">
                                                        Method: {participant.payment_method}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Notes */}
                                        {participant.notes && (
                                            <div className="p-3 bg-blue-50 rounded-lg">
                                                <div className="text-sm text-gray-700">
                                                    <span className="font-medium">Notes:</span> {participant.notes}
                                                </div>
                                            </div>
                                        )}

                                        {/* Registration Date */}
                                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                                            <Calendar className="w-3 h-3" />
                                            <span>Registered {format(new Date(participant.created_at), 'MMM d, yyyy')}</span>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <div className="flex items-center space-x-2">
                                                {event.is_paid_event && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openPaymentModal(participant)}
                                                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                                                    >
                                                        <CreditCard className="w-4 h-4" />
                                                        <span>Payment</span>
                                                    </Button>
                                                )}
                                                {!participant.checked_in && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleCheckIn(participant.id)}
                                                        className="flex items-center space-x-1 text-green-600 hover:text-green-700"
                                                    >
                                                        <UserCheck className="w-4 h-4" />
                                                        <span>Check In</span>
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleUnregister(participant.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredParticipants.length === 0 && (
                        <Card className="border-0 shadow-md">
                            <CardContent className="text-center py-12">
                                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No participants found</h3>
                                <p className="text-gray-500 mb-6">
                                    {searchQuery || paymentStatusFilter !== 'all' || checkInFilter !== 'all' 
                                        ? 'Try adjusting your filters to see more results.' 
                                        : 'No participants have registered for this event yet.'}
                                </p>
                                {!searchQuery && paymentStatusFilter === 'all' && checkInFilter === 'all' && (
                                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Register First Participant
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Payment Modal */}
            {paymentModal.isOpen && paymentModal.participant && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                            Update Payment - {paymentModal.participant.name}
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="payment_status">Payment Status</Label>
                                <Select
                                    value={paymentModal.paymentData.payment_status}
                                    onValueChange={(value) => setPaymentModal({
                                        ...paymentModal,
                                        paymentData: { ...paymentModal.paymentData, payment_status: value }
                                    })}
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="amount_paid">Amount Paid</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={paymentModal.paymentData.amount_paid}
                                    onChange={(e) => setPaymentModal({
                                        ...paymentModal,
                                        paymentData: { ...paymentModal.paymentData, amount_paid: parseFloat(e.target.value) || 0 }
                                    })}
                                    placeholder="0.00"
                                    className="h-11"
                                />
                            </div>

                            <div>
                                <Label htmlFor="payment_method">Payment Method</Label>
                                <Input
                                    value={paymentModal.paymentData.payment_method}
                                    onChange={(e) => setPaymentModal({
                                        ...paymentModal,
                                        paymentData: { ...paymentModal.paymentData, payment_method: e.target.value }
                                    })}
                                    placeholder="e.g., Bank Transfer, Cash, Online Payment"
                                    className="h-11"
                                />
                            </div>

                            <div>
                                <Label htmlFor="transaction_id">Transaction ID</Label>
                                <Input
                                    value={paymentModal.paymentData.transaction_id}
                                    onChange={(e) => setPaymentModal({
                                        ...paymentModal,
                                        paymentData: { ...paymentModal.paymentData, transaction_id: e.target.value }
                                    })}
                                    placeholder="Transaction reference number"
                                    className="h-11"
                                />
                            </div>

                            <div>
                                <Label htmlFor="payment_notes">Payment Notes</Label>
                                <Textarea
                                    value={paymentModal.paymentData.payment_notes}
                                    onChange={(e) => setPaymentModal({
                                        ...paymentModal,
                                        paymentData: { ...paymentModal.paymentData, payment_notes: e.target.value }
                                    })}
                                    placeholder="Additional payment notes..."
                                    className="min-h-[80px] resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setPaymentModal({ isOpen: false, participant: null, paymentData: { payment_status: 'pending', amount_paid: 0, payment_method: '', transaction_id: '', payment_notes: '' } })}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handlePaymentUpdate} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                                Update Payment
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
} 
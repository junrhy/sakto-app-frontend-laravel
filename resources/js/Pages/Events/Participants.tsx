import { User, Project } from '@/types/index';
import React, { useState, useMemo } from 'react';
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
    location: string;
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

    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            return auth.selectedTeamMember.roles.includes('admin') || auth.selectedTeamMember.roles.includes('manager') || auth.selectedTeamMember.roles.includes('user');
        }
        return (auth.user as any).is_admin;
    }, [auth.selectedTeamMember, auth.user]);

    const canDelete = useMemo(() => {
        if (auth.selectedTeamMember) {
            return auth.selectedTeamMember.roles.includes('admin') || auth.selectedTeamMember.roles.includes('manager');
        }
        return (auth.user as any).is_admin;
    }, [auth.selectedTeamMember, auth.user]);

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
                return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200 border-green-200 dark:border-green-800 border">Paid</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800 border">Pending</Badge>;
            case 'cancelled':
                return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200 border-red-200 dark:border-red-800 border">Cancelled</Badge>;
            default:
                return <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 border">Unknown</Badge>;
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setPaymentStatusFilter('all');
        setCheckInFilter('all');
    };

    const exportToCSV = () => {
        const headers = ['Name', 'Email', 'Phone', 'Notes', 'Checked In', 'Payment Status', 'Amount Paid', 'Payment Date', 'Payment Method', 'Transaction ID', 'Registration Date'];
        const csvData = participants.map(p => [
            p.name,
            p.email,
            p.phone || '',
            p.notes || '',
            p.checked_in ? 'Yes' : 'No',
            p.payment_status,
            p.amount_paid || '',
            p.payment_date ? format(new Date(p.payment_date), 'yyyy-MM-dd HH:mm') : '',
            p.payment_method || '',
            p.transaction_id || '',
            format(new Date(p.created_at), 'yyyy-MM-dd HH:mm')
        ]);

        const csvContent = [headers, ...csvData].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `event-${event.id}-participants-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Participants exported successfully');
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-100 leading-tight">Event Participants</h2>}
        >
            <Head title={`Participants - ${event.title}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Event Info Card */}
                    <Card className="mb-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                        <CardHeader>
                            <CardTitle className="text-gray-900 dark:text-gray-100">{event.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                                    <Calendar className="w-4 h-4" />
                                    <span>{format(new Date(event.start_date), 'MMM d, yyyy')}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                                    <MapPin className="w-4 h-4" />
                                    <span>{event.location}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                                    <Users className="w-4 h-4" />
                                    <span>{event.current_participants}/{event.max_participants || '∞'} participants</span>
                                </div>
                                {event.is_paid_event && (
                                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                                        <CreditCard className="w-4 h-4" />
                                        <span>{formatAmount(event.event_price, event.currency)}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* Filters and Search */}
                            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                                <CardHeader>
                                    <CardTitle className="text-gray-900 dark:text-gray-100">Filters & Search</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                                                <Input
                                                    placeholder="Search participants..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                                                <SelectTrigger className="w-40 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                                                    <SelectValue placeholder="Payment Status" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                                                    <SelectItem value="all">All Status</SelectItem>
                                                    <SelectItem value="paid">Paid</SelectItem>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Select value={checkInFilter} onValueChange={setCheckInFilter}>
                                                <SelectTrigger className="w-40 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                                                    <SelectValue placeholder="Check-in Status" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                                                    <SelectItem value="all">All Status</SelectItem>
                                                    <SelectItem value="checked_in">Checked In</SelectItem>
                                                    <SelectItem value="not_checked_in">Not Checked In</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                variant="outline"
                                                onClick={clearFilters}
                                                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                                            >
                                                <Filter className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Filter Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="font-semibold text-gray-900 dark:text-gray-100">{filterCounts.total}</div>
                                            <div className="text-gray-600 dark:text-gray-300">Total</div>
                                        </div>
                                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                            <div className="font-semibold text-green-700 dark:text-green-200">{filterCounts.paid}</div>
                                            <div className="text-green-600 dark:text-green-300">Paid</div>
                                        </div>
                                        <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                            <div className="font-semibold text-yellow-700 dark:text-yellow-200">{filterCounts.pending}</div>
                                            <div className="text-yellow-600 dark:text-yellow-300">Pending</div>
                                        </div>
                                        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                            <div className="font-semibold text-red-700 dark:text-red-200">{filterCounts.cancelled}</div>
                                            <div className="text-red-600 dark:text-red-300">Cancelled</div>
                                        </div>
                                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                            <div className="font-semibold text-blue-700 dark:text-blue-200">{filterCounts.checkedIn}</div>
                                            <div className="text-blue-600 dark:text-blue-300">Checked In</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="font-semibold text-gray-700 dark:text-gray-200">{filterCounts.notCheckedIn}</div>
                                            <div className="text-gray-600 dark:text-gray-300">Not Checked In</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Participants List */}
                            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-gray-900 dark:text-gray-100">Participants ({filteredParticipants.length})</CardTitle>
                                    <Button
                                        variant="outline"
                                        onClick={exportToCSV}
                                        className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Export CSV
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {filteredParticipants.map((participant) => (
                                            <div
                                                key={participant.id}
                                                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{participant.name}</h3>
                                                            {participant.checked_in ? (
                                                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200 border-green-200 dark:border-green-800 border">
                                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                                    Checked In
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 border">
                                                                    <Clock className="w-3 h-3 mr-1" />
                                                                    Not Checked In
                                                                </Badge>
                                                            )}
                                                            {getPaymentStatusBadge(participant.payment_status)}
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
                                                            <div className="flex items-center space-x-2">
                                                                <Mail className="w-4 h-4" />
                                                                <span>{participant.email}</span>
                                                            </div>
                                                            {participant.phone && (
                                                                <div className="flex items-center space-x-2">
                                                                    <Phone className="w-4 h-4" />
                                                                    <span>{participant.phone}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex items-center space-x-2">
                                                                <Calendar className="w-4 h-4" />
                                                                <span>Registered {format(new Date(participant.created_at), 'MMM d, yyyy')}</span>
                                                            </div>
                                                        </div>
                                                        {participant.notes && (
                                                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                                                <strong>Notes:</strong> {participant.notes}
                                                            </div>
                                                        )}
                                                        {participant.payment_status === 'paid' && (
                                                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                                                <strong>Payment:</strong> {formatAmount(participant.amount_paid, event.currency)} 
                                                                {participant.payment_date && ` on ${format(new Date(participant.payment_date), 'MMM d, yyyy')}`}
                                                                {participant.payment_method && ` via ${participant.payment_method}`}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-2 ml-4">
                                                        {!participant.checked_in && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleCheckIn(participant.id)}
                                                                className="border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                                                            >
                                                                <UserCheck className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openPaymentModal(participant)}
                                                            className="border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                        >
                                                            <CreditCard className="w-4 h-4" />
                                                        </Button>
                                                        {canDelete && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleUnregister(participant.id)}
                                                                className="border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {filteredParticipants.length === 0 && (
                                            <div className="text-center py-8">
                                                <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No participants found</h3>
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    {searchQuery || paymentStatusFilter !== 'all' || checkInFilter !== 'all' 
                                                        ? 'Try adjusting your filters.' 
                                                        : 'No participants have registered for this event yet.'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar - Add Participant Form */}
                        <div className="lg:col-span-1">
                            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 sticky top-6">
                                <CardHeader>
                                    <CardTitle className="text-gray-900 dark:text-gray-100">Add Participant</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {canEdit ? (
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                                                <Input
                                                    id="name"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    required
                                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                                    placeholder="Enter full name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email Address</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    required
                                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                                    placeholder="Enter email address"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Phone Number</Label>
                                                <Input
                                                    id="phone"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                                    placeholder="Enter phone number"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="notes" className="text-gray-700 dark:text-gray-300">Notes</Label>
                                                <Textarea
                                                    id="notes"
                                                    value={formData.notes}
                                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                                    placeholder="Any additional notes"
                                                    rows={3}
                                                />
                                            </div>
                                            <Button
                                                type="submit"
                                                className="relative group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                            >
                                                <div className="absolute inset-0 bg-white/20 rounded-md blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <UserPlus className="w-4 h-4 mr-2 relative z-10" />
                                                <span className="relative z-10 font-semibold">Add Participant</span>
                                            </Button>
                                        </form>
                                    ) : (
                                        <div className="text-center py-8">
                                            <XCircle className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">You do not have permission to add participants.</h3>
                                            <p className="text-gray-500 dark:text-gray-400">
                                                Please contact an administrator to register participants for this event.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {paymentModal.isOpen && paymentModal.participant && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4 border border-gray-200 dark:border-gray-800">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                            Update Payment Status
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-gray-700 dark:text-gray-300">Payment Status</Label>
                                <Select 
                                    value={paymentModal.paymentData.payment_status} 
                                    onValueChange={(value) => setPaymentModal({
                                        ...paymentModal,
                                        paymentData: { ...paymentModal.paymentData, payment_status: value }
                                    })}
                                >
                                    <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-700 dark:text-gray-300">Amount Paid</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={paymentModal.paymentData.amount_paid}
                                    onChange={(e) => setPaymentModal({
                                        ...paymentModal,
                                        paymentData: { ...paymentModal.paymentData, amount_paid: parseFloat(e.target.value) || 0 }
                                    })}
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-700 dark:text-gray-300">Payment Method</Label>
                                <Input
                                    value={paymentModal.paymentData.payment_method}
                                    onChange={(e) => setPaymentModal({
                                        ...paymentModal,
                                        paymentData: { ...paymentModal.paymentData, payment_method: e.target.value }
                                    })}
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                    placeholder="e.g., Cash, Credit Card, Bank Transfer"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-700 dark:text-gray-300">Transaction ID</Label>
                                <Input
                                    value={paymentModal.paymentData.transaction_id}
                                    onChange={(e) => setPaymentModal({
                                        ...paymentModal,
                                        paymentData: { ...paymentModal.paymentData, transaction_id: e.target.value }
                                    })}
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                    placeholder="Optional transaction reference"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-700 dark:text-gray-300">Payment Notes</Label>
                                <Textarea
                                    value={paymentModal.paymentData.payment_notes}
                                    onChange={(e) => setPaymentModal({
                                        ...paymentModal,
                                        paymentData: { ...paymentModal.paymentData, payment_notes: e.target.value }
                                    })}
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                    placeholder="Any additional payment notes"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setPaymentModal({ isOpen: false, participant: null, paymentData: { payment_status: 'pending', amount_paid: 0, payment_method: '', transaction_id: '', payment_notes: '' } })}
                                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handlePaymentUpdate}
                                className="relative group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                            >
                                <div className="absolute inset-0 bg-white/20 rounded-md blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="relative z-10 font-semibold">Update Payment</span>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
} 
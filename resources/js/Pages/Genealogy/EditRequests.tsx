import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { format } from 'date-fns';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '@/Components/ThemeProvider';

interface EditRequest {
    id: number;
    member_id: number;
    first_name: string;
    last_name: string;
    birth_date: string;
    death_date: string | null;
    gender: string;
    photo: string | null;
    notes: string | null;
    client_identifier: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    updated_at: string;
    member: {
        id: number;
        first_name: string;
        last_name: string;
        birth_date: string;
        death_date: string | null;
        gender: string;
        photo: string | null;
        notes: string | null;
        client_identifier: string;
        created_at: string;
        updated_at: string;
    };
}

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            identifier: string;
        };
    };
}

export default function EditRequests({ auth }: Props) {
    const [editRequests, setEditRequests] = useState<EditRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<EditRequest | null>(null);
    
    // Use global theme instead of local state
    const { theme, setTheme } = useTheme();
    const isDarkMode = theme === 'dark';

    useEffect(() => {
        fetchEditRequests();
    }, []);

    const fetchEditRequests = async () => {
        try {
            const response = await axios.get('/genealogy/edit-requests/data');
            const data = response.data || [];
            setEditRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching edit requests:', error);
            setError('Failed to load edit requests');
            setEditRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id: number) => {
        try {
            await axios.post(`/genealogy/edit-requests/${id}/accept`);
            setEditRequests(prev => prev.filter(request => request.id !== id));
        } catch (error) {
            console.error('Error accepting edit request:', error);
            alert('Failed to accept edit request');
        }
    };

    const handleReject = async (id: number) => {
        try {
            await axios.post(`/genealogy/edit-requests/${id}/reject`);
            setEditRequests(prev => prev.filter(request => request.id !== id));
        } catch (error) {
            console.error('Error rejecting edit request:', error);
            alert('Failed to reject edit request');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'accepted':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    if (loading) {
        return (
            <AuthenticatedLayout
                header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Edit Requests</h2>}
            >
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Edit Requests</h2>}
        >
            <Head title="Edit Requests" />

            <div className="py-12 bg-gray-100 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {error && (
                        <div className="mb-4 p-4 rounded-lg bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            {error}
                        </div>
                    )}

                    {editRequests.length === 0 ? (
                        <div className="text-center py-8 text-gray-600 dark:text-gray-300">
                            No pending edit requests
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {editRequests.map((request) => (
                                <Card key={request.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                    <CardHeader>
                                        <CardTitle className="text-gray-900 dark:text-white">
                                            Edit Request for {request.member.first_name} {request.member.last_name}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 dark:text-gray-300">
                                                    Requested on {format(new Date(request.created_at), 'MMM d, yyyy')}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(request.status)}`}>
                                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                </span>
                                            </div>

                                            <div className="space-y-2">
                                                <h3 className="font-medium text-gray-700 dark:text-gray-300">
                                                    Current Information
                                                </h3>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    <p>Birth Date: {format(new Date(request.member.birth_date), 'MMM d, yyyy')}</p>
                                                    {request.member.death_date && (
                                                        <p>Death Date: {format(new Date(request.member.death_date), 'MMM d, yyyy')}</p>
                                                    )}
                                                    <p>Gender: {request.member.gender}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <h3 className="font-medium text-gray-700 dark:text-gray-300">
                                                    Proposed Changes
                                                </h3>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    <p>Name: {request.first_name} {request.last_name}</p>
                                                    <p>Birth Date: {format(new Date(request.birth_date), 'MMM d, yyyy')}</p>
                                                    {request.death_date && (
                                                        <p>Death Date: {format(new Date(request.death_date), 'MMM d, yyyy')}</p>
                                                    )}
                                                    <p>Gender: {request.gender}</p>
                                                </div>
                                            </div>

                                            <div className="flex justify-end space-x-2">
                                                <Button
                                                    onClick={() => handleReject(request.id)}
                                                    variant="destructive"
                                                >
                                                    Reject
                                                </Button>
                                                <Button
                                                    onClick={() => handleAccept(request.id)}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    Accept
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
                <DialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    <DialogHeader>
                        <DialogTitle>Edit Request Details</DialogTitle>
                    </DialogHeader>
                    {selectedRequest && (
                        <div className="space-y-6">
                            {/* Add detailed view of the edit request here */}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
} 
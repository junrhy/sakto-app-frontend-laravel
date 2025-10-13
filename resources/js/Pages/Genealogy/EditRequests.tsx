import { useTheme } from '@/Components/ThemeProvider';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';

interface FamilyMember {
    id: number;
    first_name: string;
    last_name: string;
    birth_date: string;
    death_date: string | null;
    gender: 'male' | 'female' | 'other';
    notes: string;
    photo: string | null;
}

interface EditRequest {
    id: number;
    member: FamilyMember;
    requested_by: string;
    requested_at: string;
    status: 'pending' | 'approved' | 'rejected';
    changes: {
        first_name?: string;
        last_name?: string;
        birth_date?: string;
        death_date?: string;
        gender?: string;
        notes?: string;
    };
}

interface Props {
    auth: {
        user: any;
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

export default function EditRequests({ auth }: Props) {
    const [editRequests, setEditRequests] = useState<EditRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<EditRequest | null>(
        null,
    );
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            // Team member selected - check their roles
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager') ||
                auth.selectedTeamMember.roles.includes('user')
            );
        }
        // No team member selected (main account) - allow all users
        return true;
    }, [auth.selectedTeamMember]);

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
            setEditRequests((prev) =>
                prev.filter((request) => request.id !== id),
            );
        } catch (error) {
            console.error('Error accepting edit request:', error);
            alert('Failed to accept edit request');
        }
    };

    const handleReject = async (id: number) => {
        try {
            await axios.post(`/genealogy/edit-requests/${id}/reject`);
            setEditRequests((prev) =>
                prev.filter((request) => request.id !== id),
            );
        } catch (error) {
            console.error('Error rejecting edit request:', error);
            alert('Failed to reject edit request');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'approved':
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
                header={
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Edit Requests
                    </h2>
                }
            >
                <div className="flex min-h-screen items-center justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Edit Requests
                </h2>
            }
        >
            <Head title="Edit Requests" />

            <div className="bg-gray-100 py-12 dark:bg-gray-900">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {error && (
                        <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-800 dark:bg-red-900 dark:text-red-200">
                            {error}
                        </div>
                    )}

                    {editRequests.length === 0 ? (
                        <div className="py-8 text-center text-gray-600 dark:text-gray-300">
                            No pending edit requests
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {editRequests.map((request) => (
                                <Card
                                    key={request.id}
                                    className="border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                                >
                                    <CardHeader>
                                        <CardTitle className="text-gray-900 dark:text-white">
                                            Edit Request for{' '}
                                            {request.member.first_name}{' '}
                                            {request.member.last_name}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600 dark:text-gray-300">
                                                    Requested on{' '}
                                                    {format(
                                                        new Date(
                                                            request.requested_at,
                                                        ),
                                                        'MMM d, yyyy',
                                                    )}
                                                </span>
                                                <span
                                                    className={`rounded-full px-2 py-1 text-sm ${getStatusColor(request.status)}`}
                                                >
                                                    {request.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        request.status.slice(1)}
                                                </span>
                                            </div>

                                            <div className="space-y-2">
                                                <h3 className="font-medium text-gray-700 dark:text-gray-300">
                                                    Current Information
                                                </h3>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    <p>
                                                        Birth Date:{' '}
                                                        {format(
                                                            new Date(
                                                                request.member.birth_date,
                                                            ),
                                                            'MMM d, yyyy',
                                                        )}
                                                    </p>
                                                    {request.member
                                                        .death_date && (
                                                        <p>
                                                            Death Date:{' '}
                                                            {format(
                                                                new Date(
                                                                    request.member.death_date,
                                                                ),
                                                                'MMM d, yyyy',
                                                            )}
                                                        </p>
                                                    )}
                                                    <p>
                                                        Gender:{' '}
                                                        {request.member.gender}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <h3 className="font-medium text-gray-700 dark:text-gray-300">
                                                    Proposed Changes
                                                </h3>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    <p>
                                                        Name:{' '}
                                                        {
                                                            request.changes
                                                                .first_name
                                                        }{' '}
                                                        {
                                                            request.changes
                                                                .last_name
                                                        }
                                                    </p>
                                                    <p>
                                                        Birth Date:{' '}
                                                        {format(
                                                            new Date(
                                                                request.changes
                                                                    .birth_date ||
                                                                    request
                                                                        .member
                                                                        .birth_date,
                                                            ),
                                                            'MMM d, yyyy',
                                                        )}
                                                    </p>
                                                    {request.changes
                                                        .death_date && (
                                                        <p>
                                                            Death Date:{' '}
                                                            {format(
                                                                new Date(
                                                                    request.changes.death_date,
                                                                ),
                                                                'MMM d, yyyy',
                                                            )}
                                                        </p>
                                                    )}
                                                    <p>
                                                        Gender:{' '}
                                                        {request.changes.gender}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex justify-end space-x-2">
                                                {canEdit && (
                                                    <>
                                                        <Button
                                                            onClick={() =>
                                                                handleReject(
                                                                    request.id,
                                                                )
                                                            }
                                                            variant="destructive"
                                                        >
                                                            Reject
                                                        </Button>
                                                        <Button
                                                            onClick={() =>
                                                                handleAccept(
                                                                    request.id,
                                                                )
                                                            }
                                                            className="bg-green-600 hover:bg-green-700"
                                                        >
                                                            Accept
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Dialog
                open={!!selectedRequest}
                onOpenChange={() => setSelectedRequest(null)}
            >
                <DialogContent className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
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

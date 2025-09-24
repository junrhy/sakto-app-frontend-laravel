import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader } from '@/Components/ui/card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    CheckCircle,
    Eye,
    Flag,
    MessageSquare,
    User,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface ReportedReview {
    id: number;
    review_id: number;
    reporter_name: string;
    reason: string;
    comment?: string;
    status: 'pending' | 'reviewed' | 'dismissed';
    created_at: string;
    review: {
        id: number;
        product_id: number;
        reviewer_name: string;
        reviewer_email: string;
        title?: string;
        content: string;
        rating: number;
        is_verified_purchase: boolean;
        is_approved: boolean;
        is_featured: boolean;
        created_at: string;
        product: {
            id: number;
            name: string;
            thumbnail_url?: string;
        };
    };
}

interface Props {
    auth: {
        user: any;
        project?: any;
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
    reportedReviews: ReportedReview[];
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700/50';
        case 'reviewed':
            return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/50';
        case 'dismissed':
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-600/50';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-600/50';
    }
};

const getReasonColor = (reason: string) => {
    switch (reason) {
        case 'Spam':
            return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50';
        case 'Inappropriate':
            return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700/50';
        case 'Offensive':
            return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700/50';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-600/50';
    }
};

export default function ReportedReviews({ auth, reportedReviews }: Props) {
    const [reports, setReports] = useState<ReportedReview[]>(reportedReviews);
    const [loading, setLoading] = useState<{ [key: number]: boolean }>({});
    const [statusFilter, setStatusFilter] = useState<
        'pending' | 'reviewed' | 'dismissed' | 'all'
    >('pending');

    const handleStatusUpdate = async (
        reportId: number,
        status: 'reviewed' | 'dismissed',
    ) => {
        setLoading((prev) => ({ ...prev, [reportId]: true }));

        try {
            const response = await fetch(
                `/product-review-reports/reports/${reportId}/status`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({ status }),
                },
            );

            if (response.ok) {
                setReports((prev) =>
                    prev.map((report) =>
                        report.id === reportId ? { ...report, status } : report,
                    ),
                );
            } else {
                alert('Failed to update report status');
            }
        } catch (error) {
            alert('An error occurred while updating report status');
        } finally {
            setLoading((prev) => ({ ...prev, [reportId]: false }));
        }
    };

    // Filtered reports based on statusFilter
    const filteredReports =
        statusFilter === 'all'
            ? reports
            : reports.filter((report) => report.status === statusFilter);

    return (
        <AuthenticatedLayout
            auth={{
                user: auth.user,
                project: auth.project,
                modules: auth.modules,
            }}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.history.back()}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back</span>
                        </Button>
                        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600/50" />
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-100">
                            Reported Reviews
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title="Reported Reviews" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Status Filter */}
                    <div className="mb-6">
                        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
                            {['pending', 'reviewed', 'dismissed', 'all'].map(
                                (status) => (
                                    <Button
                                        key={status}
                                        variant={
                                            statusFilter === status
                                                ? 'default'
                                                : 'ghost'
                                        }
                                        size="sm"
                                        className={`rounded-md transition-all duration-200 ${
                                            statusFilter === status
                                                ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                                        }`}
                                        onClick={() =>
                                            setStatusFilter(status as any)
                                        }
                                    >
                                        {status.charAt(0).toUpperCase() +
                                            status.slice(1)}
                                    </Button>
                                ),
                            )}
                        </div>
                    </div>
                    {/* Stats Cards */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-sm dark:border-yellow-700/50 dark:from-yellow-900/30 dark:to-yellow-800/30 dark:shadow-none">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                                            Pending
                                        </p>
                                        <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                                            {
                                                reports.filter(
                                                    (r) =>
                                                        r.status === 'pending',
                                                ).length
                                            }
                                        </p>
                                    </div>
                                    <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 shadow-sm dark:border-green-700/50 dark:from-green-900/30 dark:to-green-800/30 dark:shadow-none">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-700 dark:text-green-300">
                                            Reviewed
                                        </p>
                                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                            {
                                                reports.filter(
                                                    (r) =>
                                                        r.status === 'reviewed',
                                                ).length
                                            }
                                        </p>
                                    </div>
                                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm dark:border-gray-700/50 dark:from-gray-900/30 dark:to-gray-800/30 dark:shadow-none">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Dismissed
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            {
                                                reports.filter(
                                                    (r) =>
                                                        r.status ===
                                                        'dismissed',
                                                ).length
                                            }
                                        </p>
                                    </div>
                                    <XCircle className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Reports List */}
                    <div className="space-y-6">
                        {filteredReports.length === 0 ? (
                            <Card className="border-gray-200 bg-white py-12 text-center dark:border-gray-700 dark:bg-gray-800">
                                <CardContent>
                                    <Flag className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
                                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                                        No reported reviews
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {statusFilter === 'all'
                                            ? 'No reported reviews found.'
                                            : `No ${statusFilter} reviews found.`}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            filteredReports.map((report) => (
                                <Card
                                    key={report.id}
                                    className="border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-none"
                                >
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <Flag className="h-5 w-5 text-red-500" />
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                        Review Report #
                                                        {report.id}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Reported by{' '}
                                                        {report.reporter_name}{' '}
                                                        on{' '}
                                                        {format(
                                                            new Date(
                                                                report.created_at,
                                                            ),
                                                            'MMM dd, yyyy',
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Badge
                                                    className={`text-xs ${getStatusColor(report.status)}`}
                                                >
                                                    {report.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        report.status.slice(1)}
                                                </Badge>
                                                <Badge
                                                    className={`text-xs ${getReasonColor(report.reason)}`}
                                                >
                                                    {report.reason}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Report Details */}
                                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-600/50 dark:bg-gray-700/50">
                                            <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                                                Report Details
                                            </h4>
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <User className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                                        Reporter:{' '}
                                                        {report.reporter_name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                                        Reported:{' '}
                                                        {format(
                                                            new Date(
                                                                report.created_at,
                                                            ),
                                                            'MMM dd, yyyy HH:mm',
                                                        )}
                                                    </span>
                                                </div>
                                                {report.comment && (
                                                    <div className="flex items-start space-x-2">
                                                        <MessageSquare className="mt-0.5 h-4 w-4 text-gray-500" />
                                                        <div>
                                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                                Comment:{' '}
                                                            </span>
                                                            <span className="text-sm text-gray-800 dark:text-gray-200">
                                                                {report.comment}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Review Details */}
                                        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-800/50 dark:bg-blue-900/30">
                                            <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                                                Reported Review
                                            </h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center space-x-3">
                                                    {report.review.product
                                                        .thumbnail_url && (
                                                        <img
                                                            src={
                                                                report.review
                                                                    .product
                                                                    .thumbnail_url
                                                            }
                                                            alt={
                                                                report.review
                                                                    .product
                                                                    .name
                                                            }
                                                            className="h-12 w-12 rounded object-cover"
                                                        />
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                                            {
                                                                report.review
                                                                    .product
                                                                    .name
                                                            }
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Review by{' '}
                                                            {
                                                                report.review
                                                                    .reviewer_name
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="rounded border border-gray-100 bg-white p-3 dark:border-gray-600/50 dark:bg-gray-700">
                                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                                        {report.review.content}
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                                    <span>
                                                        Rating:{' '}
                                                        {report.review.rating}/5
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {format(
                                                            new Date(
                                                                report.review.created_at,
                                                            ),
                                                            'MMM dd, yyyy',
                                                        )}
                                                    </span>
                                                    {report.review
                                                        .is_verified_purchase && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-green-600 dark:text-green-400">
                                                                Verified
                                                                Purchase
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {report.status === 'pending' && (
                                            <div className="flex items-center justify-end space-x-2 border-t border-gray-200 pt-4 dark:border-gray-600">
                                                <Link
                                                    href={`/products/${report.review.product_id}`}
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Product
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleStatusUpdate(
                                                            report.id,
                                                            'dismissed',
                                                        )
                                                    }
                                                    disabled={
                                                        loading[report.id]
                                                    }
                                                    className="border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                                                >
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                    {loading[report.id]
                                                        ? 'Dismissing...'
                                                        : 'Dismiss'}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        handleStatusUpdate(
                                                            report.id,
                                                            'reviewed',
                                                        )
                                                    }
                                                    disabled={
                                                        loading[report.id]
                                                    }
                                                    className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                                                >
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    {loading[report.id]
                                                        ? 'Marking...'
                                                        : 'Mark Reviewed'}
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

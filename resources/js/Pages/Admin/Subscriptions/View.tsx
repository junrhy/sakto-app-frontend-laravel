import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextArea from '@/Components/TextArea';
import TextInput from '@/Components/TextInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { PageProps } from '@/types/index';
import { UserSubscription } from '@/types/models';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { useState } from 'react';

interface Props {
    auth: PageProps['auth'];
    subscription: UserSubscription & { user_name?: string };
    history: UserSubscription[];
    flash?: {
        message?: string;
        error?: string;
    };
}

export default function View({
    auth,
    subscription,
    history,
    flash = {},
}: Props) {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showAddCreditsModal, setShowAddCreditsModal] = useState(false);
    const [showMarkAsPaidModal, setShowMarkAsPaidModal] = useState(false);

    const cancelForm = useForm({
        cancellation_reason: '',
    });

    const creditsForm = useForm({
        amount: '',
        note: '',
    });

    const markAsPaidForm = useForm({
        note: '',
    });

    const handleCancelSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        cancelForm.post(route('admin.subscriptions.cancel', subscription.id), {
            onSuccess: () => setShowCancelModal(false),
        });
    };

    const handleAddCreditsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        creditsForm.post(
            route('admin.subscriptions.add-credits', subscription.id),
            {
                onSuccess: () => {
                    setShowAddCreditsModal(false);
                    creditsForm.reset();
                },
                onError: (errors) => {
                    console.error('Failed to add credits:', errors);
                },
            },
        );
    };

    const handleMarkAsPaidSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        markAsPaidForm.post(
            route('admin.subscriptions.mark-as-paid', subscription.id),
            {
                onSuccess: () => setShowMarkAsPaidModal(false),
            },
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    // Format payment method
    const formatPaymentMethod = (method: string | null | undefined): string => {
        if (!method) return 'Not specified';

        switch (method.toLowerCase()) {
            case 'cash':
                return 'Cash';
            case 'card':
                return 'Credit/Debit Card';
            case 'bank_transfer':
                return 'Bank Transfer';
            case 'digital_wallet':
                return 'Digital Wallet';
            case 'cod':
                return 'Cash on Delivery';
            default:
                return (
                    method.charAt(0).toUpperCase() +
                    method.slice(1).replace(/_/g, ' ')
                );
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
            case 'cancelled':
                return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
            case 'expired':
                return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
            default:
                return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
        }
    };

    const formatCurrency = (amount: number, currency = 'PHP') => {
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency,
                minimumFractionDigits: 2,
            }).format(amount);
        } catch {
            return `${currency} ${amount.toLocaleString()}`;
        }
    };

    return (
        <AdminLayout
            auth={{
                user: auth.user,
                project: auth.project,
                modules: auth.modules,
            }}
            title="Subscription Details"
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Subscription Details
                </h2>
            }
        >
            <Head title="Subscription Details" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Flash Messages */}
                    {flash.message && (
                        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg
                                        className="h-5 w-5 text-green-400"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                        {flash.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {flash.error && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg
                                        className="h-5 w-5 text-red-400"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                        {flash.error}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mb-6">
                        <Link
                            href={route('admin.subscriptions.index')}
                            className="text-indigo-600 transition-colors hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                            &larr; Back to Subscriptions
                        </Link>
                    </div>

                    <div className="mb-6 overflow-hidden border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:rounded-lg">
                        <div className="border-b border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                    Subscription Information
                                </h3>
                                <div className="flex space-x-2">
                                    {subscription.status === 'active' && (
                                        <DangerButton
                                            onClick={() =>
                                                setShowCancelModal(true)
                                            }
                                        >
                                            Cancel Subscription
                                        </DangerButton>
                                    )}
                                    {subscription.status === 'pending' &&
                                        subscription.payment_method ===
                                            'cash' && (
                                            <PrimaryButton
                                                onClick={() =>
                                                    setShowMarkAsPaidModal(true)
                                                }
                                            >
                                                Mark as Paid
                                            </PrimaryButton>
                                        )}
                                    <PrimaryButton
                                        onClick={() =>
                                            setShowAddCreditsModal(true)
                                        }
                                    >
                                        Add Credits
                                    </PrimaryButton>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Status
                                        </h4>
                                        <div className="mt-1">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-5 ${getStatusBadgeClass(subscription.status)}`}
                                            >
                                                {subscription.status
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    subscription.status.slice(
                                                        1,
                                                    )}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            User
                                        </h4>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                            {subscription.user_name ||
                                                subscription.user_identifier}
                                        </p>
                                    </div>

                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Subscription Plan
                                        </h4>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                            {subscription.plan.name}
                                        </p>
                                    </div>

                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Price
                                        </h4>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                            ₱{' '}
                                            {subscription.amount_paid?.toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Credits Per Month
                                        </h4>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                            {
                                                subscription.plan
                                                    .credits_per_month
                                            }
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Start Date
                                        </h4>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                            {formatDate(
                                                subscription.start_date,
                                            )}
                                        </p>
                                    </div>

                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            End Date
                                        </h4>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                            {formatDate(subscription.end_date)}
                                        </p>
                                    </div>

                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Last Credit Date
                                        </h4>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                            {subscription.last_credit_date
                                                ? formatDate(
                                                      subscription.last_credit_date,
                                                  )
                                                : 'N/A'}
                                        </p>
                                    </div>

                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Auto Renew
                                        </h4>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                            {subscription.auto_renew
                                                ? 'Yes'
                                                : 'No'}
                                        </p>
                                    </div>

                                    {subscription.cancelled_at && (
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                Cancelled At
                                            </h4>
                                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                                {formatDate(
                                                    subscription.cancelled_at,
                                                )}
                                            </p>
                                        </div>
                                    )}

                                    {subscription.cancellation_reason && (
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                Cancellation Reason
                                            </h4>
                                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                                {
                                                    subscription.cancellation_reason
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:rounded-lg">
                        <div className="border-b border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                            <h3 className="mb-6 text-lg font-medium text-gray-900 dark:text-gray-100">
                                Payment Information
                            </h3>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Payment Method
                                        </h4>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                            {formatPaymentMethod(
                                                subscription.payment_method,
                                            )}
                                        </p>
                                    </div>

                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Transaction ID
                                        </h4>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                            {subscription.payment_transaction_id ||
                                                'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    {subscription.proof_of_payment && (
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                Proof of Payment
                                            </h4>
                                            <div className="mt-1">
                                                <a
                                                    href={
                                                        subscription.proof_of_payment
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-indigo-600 transition-colors hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                >
                                                    View Proof of Payment
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pb-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card className="bg-white dark:bg-gray-800">
                        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Subscription History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {history.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50 dark:bg-gray-700">
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Plan
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Status
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Start Date
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-white">
                                                End Date
                                            </TableHead>
                                            <TableHead className="text-right text-gray-900 dark:text-white">
                                                Amount Paid
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {history.map((item) => (
                                            <TableRow
                                                key={item.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                <TableCell className="text-gray-900 dark:text-white">
                                                    {item.plan?.name ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-5 ${getStatusBadgeClass(item.status)}`}
                                                    >
                                                        {item.status
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            item.status.slice(1)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-gray-900 dark:text-white">
                                                    {formatDate(item.start_date)}
                                                </TableCell>
                                                <TableCell className="text-gray-900 dark:text-white">
                                                    {formatDate(item.end_date)}
                                                </TableCell>
                                                <TableCell className="text-right text-gray-900 dark:text-white">
                                                    {formatCurrency(
                                                        item.amount_paid,
                                                        item.plan?.currency ||
                                                            'PHP',
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="p-6 text-sm text-gray-600 dark:text-gray-300">
                                    No subscription history available for this
                                    user yet.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Cancel Subscription Modal */}
            <Modal
                show={showCancelModal}
                onClose={() => setShowCancelModal(false)}
            >
                <form
                    onSubmit={handleCancelSubmit}
                    className="bg-white p-6 dark:bg-gray-800"
                >
                    <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                        Cancel Subscription
                    </h2>

                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to cancel this subscription? This
                        action cannot be undone.
                    </p>

                    <div className="mb-4">
                        <InputLabel
                            htmlFor="cancellation_reason"
                            value="Cancellation Reason (Optional)"
                            className="text-gray-700 dark:text-gray-300"
                        />
                        <TextArea
                            id="cancellation_reason"
                            className="mt-1 block w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                            value={cancelForm.data.cancellation_reason}
                            onChange={(
                                e: React.ChangeEvent<HTMLTextAreaElement>,
                            ) =>
                                cancelForm.setData(
                                    'cancellation_reason',
                                    e.target.value,
                                )
                            }
                        />
                        <InputError
                            message={cancelForm.errors.cancellation_reason}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton
                            onClick={() => setShowCancelModal(false)}
                            className="mr-2"
                        >
                            Cancel
                        </SecondaryButton>
                        <DangerButton
                            type="submit"
                            disabled={cancelForm.processing}
                        >
                            Confirm Cancellation
                        </DangerButton>
                    </div>
                </form>
            </Modal>

            {/* Add Credits Modal */}
            <Modal
                show={showAddCreditsModal}
                onClose={() => setShowAddCreditsModal(false)}
            >
                <form
                    onSubmit={handleAddCreditsSubmit}
                    className="bg-white p-6 dark:bg-gray-800"
                >
                    <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                        Add Credits
                    </h2>

                    <div className="mb-4">
                        <InputLabel
                            htmlFor="amount"
                            value="Amount"
                            className="text-gray-700 dark:text-gray-300"
                        />
                        <TextInput
                            id="amount"
                            type="number"
                            className="mt-1 block w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                            value={creditsForm.data.amount}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                            ) => creditsForm.setData('amount', e.target.value)}
                            required
                            min="1"
                        />
                        <InputError
                            message={creditsForm.errors.amount}
                            className="mt-2"
                        />
                    </div>

                    <div className="mb-4">
                        <InputLabel
                            htmlFor="note"
                            value="Note (Optional)"
                            className="text-gray-700 dark:text-gray-300"
                        />
                        <TextArea
                            id="note"
                            className="mt-1 block w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                            value={creditsForm.data.note}
                            onChange={(
                                e: React.ChangeEvent<HTMLTextAreaElement>,
                            ) => creditsForm.setData('note', e.target.value)}
                            placeholder="Reason for adding credits"
                        />
                        <InputError
                            message={creditsForm.errors.note}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton
                            onClick={() => setShowAddCreditsModal(false)}
                            className="mr-2"
                        >
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton
                            type="submit"
                            disabled={creditsForm.processing}
                        >
                            Add Credits
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Mark as Paid Modal */}
            <Modal
                show={showMarkAsPaidModal}
                onClose={() => setShowMarkAsPaidModal(false)}
            >
                <form
                    onSubmit={handleMarkAsPaidSubmit}
                    className="bg-white p-6 dark:bg-gray-800"
                >
                    <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                        Mark Payment as Paid
                    </h2>

                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to mark this cash payment as paid?
                        This will activate the subscription.
                    </p>

                    <div className="mb-4">
                        <InputLabel
                            htmlFor="note"
                            value="Note (Optional)"
                            className="text-gray-700 dark:text-gray-300"
                        />
                        <TextArea
                            id="note"
                            className="mt-1 block w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                            value={markAsPaidForm.data.note}
                            onChange={(
                                e: React.ChangeEvent<HTMLTextAreaElement>,
                            ) => markAsPaidForm.setData('note', e.target.value)}
                            placeholder="Add any notes about the payment"
                        />
                        <InputError
                            message={markAsPaidForm.errors.note}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton
                            onClick={() => setShowMarkAsPaidModal(false)}
                            className="mr-2"
                        >
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton
                            type="submit"
                            disabled={markAsPaidForm.processing}
                        >
                            Confirm Payment
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}

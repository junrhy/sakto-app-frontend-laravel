import { User, Project } from '@/types/index';
import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { PageProps } from '@/types/index';
import { UserSubscription } from '@/types/models';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import TextArea from '@/Components/TextArea';

interface Props {
  auth: PageProps['auth'];
  subscription: UserSubscription & { user_name?: string };
}

export default function View({ auth, subscription }: Props) {
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
    creditsForm.post(route('admin.subscriptions.add-credits', subscription.id), {
      onSuccess: () => setShowAddCreditsModal(false),
    });
  };

  const handleMarkAsPaidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    markAsPaidForm.post(route('admin.subscriptions.mark-as-paid', subscription.id), {
      onSuccess: () => setShowMarkAsPaidModal(false),
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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

  return (
    <AdminLayout
      auth={{ user: auth.user, project: auth.project, modules: auth.modules }}
      title="Subscription Details"
      header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Subscription Details</h2>}
    >
      <Head title="Subscription Details" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href={route('admin.subscriptions.index')}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors"
            >
              &larr; Back to Subscriptions
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mb-6 border border-gray-200 dark:border-gray-700">
            <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Subscription Information</h3>
                <div className="flex space-x-2">
                  {subscription.status === 'active' && (
                    <DangerButton onClick={() => setShowCancelModal(true)}>
                      Cancel Subscription
                    </DangerButton>
                  )}
                  {subscription.status === 'pending' && subscription.payment_method === 'cash' && (
                    <PrimaryButton onClick={() => setShowMarkAsPaidModal(true)}>
                      Mark as Paid
                    </PrimaryButton>
                  )}
                  <PrimaryButton onClick={() => setShowAddCreditsModal(true)}>
                    Add Credits
                  </PrimaryButton>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h4>
                    <div className="mt-1">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(subscription.status)}`}>
                        {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">User</h4>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{subscription.user_name || subscription.user_identifier}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Subscription Plan</h4>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{subscription.plan.name}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Price</h4>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">₱ {subscription.amount_paid?.toLocaleString()}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Credits Per Month</h4>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{subscription.plan.credits_per_month}</p>
                  </div>
                </div>

                <div>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</h4>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatDate(subscription.start_date)}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">End Date</h4>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatDate(subscription.end_date)}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Credit Date</h4>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {subscription.last_credit_date ? formatDate(subscription.last_credit_date) : 'N/A'}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Auto Renew</h4>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {subscription.auto_renew ? 'Yes' : 'No'}
                    </p>
                  </div>

                  {subscription.cancelled_at && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Cancelled At</h4>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatDate(subscription.cancelled_at)}</p>
                    </div>
                  )}

                  {subscription.cancellation_reason && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Cancellation Reason</h4>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{subscription.cancellation_reason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">Payment Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Method</h4>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {subscription.payment_method || 'N/A'}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Transaction ID</h4>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {subscription.payment_transaction_id || 'N/A'}
                    </p>
                  </div>
                </div>

                <div>
                  {subscription.proof_of_payment && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Proof of Payment</h4>
                      <div className="mt-1">
                        <a
                          href={subscription.proof_of_payment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors"
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

      {/* Cancel Subscription Modal */}
      <Modal show={showCancelModal} onClose={() => setShowCancelModal(false)}>
        <form onSubmit={handleCancelSubmit} className="p-6 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Cancel Subscription</h2>
          
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to cancel this subscription? This action cannot be undone.
          </p>
          
          <div className="mb-4">
            <InputLabel htmlFor="cancellation_reason" value="Cancellation Reason (Optional)" className="text-gray-700 dark:text-gray-300" />
            <TextArea
              id="cancellation_reason"
              className="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              value={cancelForm.data.cancellation_reason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => cancelForm.setData('cancellation_reason', e.target.value)}
            />
            <InputError message={cancelForm.errors.cancellation_reason} className="mt-2" />
          </div>
          
          <div className="flex justify-end mt-6">
            <SecondaryButton onClick={() => setShowCancelModal(false)} className="mr-2">
              Cancel
            </SecondaryButton>
            <DangerButton type="submit" disabled={cancelForm.processing}>
              Confirm Cancellation
            </DangerButton>
          </div>
        </form>
      </Modal>

      {/* Add Credits Modal */}
      <Modal show={showAddCreditsModal} onClose={() => setShowAddCreditsModal(false)}>
        <form onSubmit={handleAddCreditsSubmit} className="p-6 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Add Credits</h2>
          
          <div className="mb-4">
            <InputLabel htmlFor="amount" value="Amount" className="text-gray-700 dark:text-gray-300" />
            <TextInput
              id="amount"
              type="number"
              className="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              value={creditsForm.data.amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => creditsForm.setData('amount', e.target.value)}
              required
              min="1"
            />
            <InputError message={creditsForm.errors.amount} className="mt-2" />
          </div>
          
          <div className="mb-4">
            <InputLabel htmlFor="note" value="Note (Optional)" className="text-gray-700 dark:text-gray-300" />
            <TextArea
              id="note"
              className="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              value={creditsForm.data.note}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => creditsForm.setData('note', e.target.value)}
              placeholder="Reason for adding credits"
            />
            <InputError message={creditsForm.errors.note} className="mt-2" />
          </div>
          
          <div className="flex justify-end mt-6">
            <SecondaryButton onClick={() => setShowAddCreditsModal(false)} className="mr-2">
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={creditsForm.processing}>
              Add Credits
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* Mark as Paid Modal */}
      <Modal show={showMarkAsPaidModal} onClose={() => setShowMarkAsPaidModal(false)}>
        <form onSubmit={handleMarkAsPaidSubmit} className="p-6 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Mark Payment as Paid</h2>
          
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to mark this cash payment as paid? This will activate the subscription.
          </p>
          
          <div className="mb-4">
            <InputLabel htmlFor="note" value="Note (Optional)" className="text-gray-700 dark:text-gray-300" />
            <TextArea
              id="note"
              className="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              value={markAsPaidForm.data.note}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => markAsPaidForm.setData('note', e.target.value)}
              placeholder="Add any notes about the payment"
            />
            <InputError message={markAsPaidForm.errors.note} className="mt-2" />
          </div>
          
          <div className="flex justify-end mt-6">
            <SecondaryButton onClick={() => setShowMarkAsPaidModal(false)} className="mr-2">
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={markAsPaidForm.processing}>
              Confirm Payment
            </PrimaryButton>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
} 
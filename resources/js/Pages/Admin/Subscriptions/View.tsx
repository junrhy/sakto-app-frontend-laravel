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
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <AdminLayout
      auth={{ user: auth.user, project: auth.project, modules: auth.modules }}
      title="Subscription Details"
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Subscription Details</h2>}
    >
      <Head title="Subscription Details" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href={route('admin.subscriptions.index')}
              className="text-indigo-600 hover:text-indigo-900"
            >
              &larr; Back to Subscriptions
            </Link>
          </div>

          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Subscription Information</h3>
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
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <div className="mt-1">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(subscription.status)}`}>
                        {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">User</h4>
                    <p className="mt-1 text-sm text-gray-900">{subscription.user_name || subscription.user_identifier}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Subscription Plan</h4>
                    <p className="mt-1 text-sm text-gray-900">{subscription.plan.name}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Price</h4>
                    <p className="mt-1 text-sm text-gray-900">₱ {subscription.amount_paid}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Credits Per Month</h4>
                    <p className="mt-1 text-sm text-gray-900">{subscription.plan.credits_per_month}</p>
                  </div>
                </div>

                <div>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Start Date</h4>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(subscription.start_date)}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">End Date</h4>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(subscription.end_date)}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Last Credit Date</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {subscription.last_credit_date ? formatDate(subscription.last_credit_date) : 'N/A'}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Auto Renew</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {subscription.auto_renew ? 'Yes' : 'No'}
                    </p>
                  </div>

                  {subscription.cancelled_at && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500">Cancelled At</h4>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(subscription.cancelled_at)}</p>
                    </div>
                  )}

                  {subscription.cancellation_reason && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500">Cancellation Reason</h4>
                      <p className="mt-1 text-sm text-gray-900">{subscription.cancellation_reason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Payment Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Payment Method</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {subscription.payment_method || 'N/A'}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Transaction ID</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {subscription.payment_transaction_id || 'N/A'}
                    </p>
                  </div>
                </div>

                <div>
                  {subscription.proof_of_payment && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500">Proof of Payment</h4>
                      <div className="mt-1">
                        <a
                          href={subscription.proof_of_payment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-900"
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
        <form onSubmit={handleCancelSubmit} className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Cancel Subscription</h2>
          
          <p className="mb-4 text-sm text-gray-600">
            Are you sure you want to cancel this subscription? This action cannot be undone.
          </p>
          
          <div className="mb-4">
            <InputLabel htmlFor="cancellation_reason" value="Cancellation Reason (Optional)" />
            <TextArea
              id="cancellation_reason"
              className="mt-1 block w-full"
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
        <form onSubmit={handleAddCreditsSubmit} className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Add Credits</h2>
          
          <div className="mb-4">
            <InputLabel htmlFor="amount" value="Amount" />
            <TextInput
              id="amount"
              type="number"
              className="mt-1 block w-full"
              value={creditsForm.data.amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => creditsForm.setData('amount', e.target.value)}
              required
              min="1"
            />
            <InputError message={creditsForm.errors.amount} className="mt-2" />
          </div>
          
          <div className="mb-4">
            <InputLabel htmlFor="note" value="Note (Optional)" />
            <TextArea
              id="note"
              className="mt-1 block w-full"
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
        <form onSubmit={handleMarkAsPaidSubmit} className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Mark Payment as Paid</h2>
          
          <p className="mb-4 text-sm text-gray-600">
            Are you sure you want to mark this cash payment as paid? This will activate the subscription.
          </p>
          
          <div className="mb-4">
            <InputLabel htmlFor="note" value="Note (Optional)" />
            <TextArea
              id="note"
              className="mt-1 block w-full"
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
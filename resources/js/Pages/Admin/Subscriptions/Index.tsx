import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { SubscriptionPlan, UserSubscription } from '@/types/models';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Pagination from '@/Components/Pagination';
import TextArea from '@/Components/TextArea';
import { PageProps } from '@/types/index';

interface Props {
  auth: PageProps['auth'];
  plans: SubscriptionPlan[];
  subscriptions: {
    data: UserSubscription[];
    links: any[];
    meta: {
      current_page: number;
      from: number;
      last_page: number;
      links: any[];
      path: string;
      per_page: number;
      to: number;
      total: number;
    };
  };
}

export default function Index({ auth, plans, subscriptions }: Props) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');

  const createForm = useForm({
    name: '',
    description: '',
    price: '',
    duration_in_days: '',
    credits_per_month: '',
    features: [] as string[],
    is_popular: false,
    is_active: true,
    badge_text: '',
  });

  const editForm = useForm({
    name: '',
    description: '',
    price: '',
    duration_in_days: '',
    credits_per_month: '',
    features: [] as string[],
    is_popular: false,
    is_active: true,
    badge_text: '',
  });

  const deleteForm = useForm({});

  const openCreateModal = () => {
    createForm.reset();
    setFeatures([]);
    setShowCreateModal(true);
  };

  const openEditModal = (plan: SubscriptionPlan) => {
    setCurrentPlan(plan);
    editForm.setData({
      name: plan.name,
      description: plan.description || '',
      price: plan.price.toString(),
      duration_in_days: plan.duration_in_days.toString(),
      credits_per_month: plan.credits_per_month.toString(),
      features: plan.features || [],
      is_popular: plan.is_popular,
      is_active: plan.is_active,
      badge_text: plan.badge_text || '',
    });
    setFeatures(plan.features || []);
    setShowEditModal(true);
  };

  const openDeleteModal = (plan: SubscriptionPlan) => {
    setCurrentPlan(plan);
    setShowDeleteModal(true);
  };

  const addFeature = () => {
    if (featureInput.trim() !== '') {
      const newFeatures = [...features, featureInput.trim()];
      setFeatures(newFeatures);
      
      if (showCreateModal) {
        createForm.setData('features', newFeatures);
      } else if (showEditModal) {
        editForm.setData('features', newFeatures);
      }
      
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    const newFeatures = features.filter((_, i) => i !== index);
    setFeatures(newFeatures);
    
    if (showCreateModal) {
      createForm.setData('features', newFeatures);
    } else if (showEditModal) {
      editForm.setData('features', newFeatures);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createForm.post(route('admin.subscriptions.plans.store'), {
      onSuccess: () => setShowCreateModal(false),
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPlan) {
      editForm.put(route('admin.subscriptions.plans.update', currentPlan.id), {
        onSuccess: () => setShowEditModal(false),
      });
    }
  };

  const handleDeleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPlan) {
      deleteForm.delete(route('admin.subscriptions.plans.destroy', currentPlan.id), {
        onSuccess: () => setShowDeleteModal(false),
      });
    }
  };

  const togglePlanStatus = (plan: SubscriptionPlan) => {
    window.location.href = route('admin.subscriptions.plans.toggle-status', plan.id);
  };

  const runRenewalCommand = () => {
    window.location.href = route('admin.subscriptions.run-renewal');
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Subscription Management</h2>}
    >
      <Head title="Subscription Management" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Subscription Plans Section */}
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Subscription Plans</h3>
                <div className="flex space-x-2">
                  <PrimaryButton onClick={openCreateModal}>Add New Plan</PrimaryButton>
                  <SecondaryButton onClick={runRenewalCommand}>Run Renewal Command</SecondaryButton>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {plans.map((plan) => (
                      <tr key={plan.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                              {plan.badge_text && (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {plan.badge_text}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${plan.price}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{plan.duration_in_days} days</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{plan.credits_per_month} credits/month</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            plan.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {plan.is_active ? 'Active' : 'Inactive'}
                          </span>
                          {plan.is_popular && (
                            <span className="ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Popular
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(plan)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => togglePlanStatus(plan)}
                              className={`${plan.is_active ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                            >
                              {plan.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => openDeleteModal(plan)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* User Subscriptions Section */}
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-6">User Subscriptions</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subscriptions.data.map((subscription) => (
                      <tr key={subscription.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{subscription.user_identifier}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{subscription.plan.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            subscription.status === 'active' ? 'bg-green-100 text-green-800' : 
                            subscription.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Date(subscription.start_date).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Date(subscription.end_date).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={route('admin.subscriptions.view', subscription.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {subscriptions.meta && subscriptions.meta.links && (
                <Pagination links={subscriptions.meta.links} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Plan Modal */}
      <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <form onSubmit={handleCreateSubmit} className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Create Subscription Plan</h2>
          
          <div className="mb-4">
            <InputLabel htmlFor="name" value="Name" />
            <TextInput
              id="name"
              type="text"
              className="mt-1 block w-full"
              value={createForm.data.name}
              onChange={(e) => createForm.setData('name', e.target.value)}
              required
            />
            <InputError message={createForm.errors.name} className="mt-2" />
          </div>
          
          <div className="mb-4">
            <InputLabel htmlFor="description" value="Description" />
            <TextArea
              id="description"
              className="mt-1 block w-full"
              value={createForm.data.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => createForm.setData('description', e.target.value)}
            />
            <InputError message={createForm.errors.description} className="mt-2" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <InputLabel htmlFor="price" value="Price ($)" />
              <TextInput
                id="price"
                type="number"
                step="0.01"
                className="mt-1 block w-full"
                value={createForm.data.price}
                onChange={(e) => createForm.setData('price', e.target.value)}
                required
              />
              <InputError message={createForm.errors.price} className="mt-2" />
            </div>
            
            <div>
              <InputLabel htmlFor="duration_in_days" value="Duration (days)" />
              <TextInput
                id="duration_in_days"
                type="number"
                className="mt-1 block w-full"
                value={createForm.data.duration_in_days}
                onChange={(e) => createForm.setData('duration_in_days', e.target.value)}
                required
              />
              <InputError message={createForm.errors.duration_in_days} className="mt-2" />
            </div>
          </div>
          
          <div className="mb-4">
            <InputLabel htmlFor="credits_per_month" value="Credits Per Month" />
            <TextInput
              id="credits_per_month"
              type="number"
              className="mt-1 block w-full"
              value={createForm.data.credits_per_month}
              onChange={(e) => createForm.setData('credits_per_month', e.target.value)}
              required
            />
            <InputError message={createForm.errors.credits_per_month} className="mt-2" />
          </div>
          
          <div className="mb-4">
            <InputLabel htmlFor="features" value="Features" />
            <div className="flex mt-1">
              <TextInput
                id="feature_input"
                type="text"
                className="block w-full"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                placeholder="Add a feature"
              />
              <PrimaryButton type="button" className="ml-2" onClick={addFeature}>
                Add
              </PrimaryButton>
            </div>
            <InputError message={createForm.errors.features} className="mt-2" />
            
            <div className="mt-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center mt-2">
                  <span className="text-sm text-gray-700">{feature}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="ml-2 text-red-600 hover:text-red-900"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <InputLabel htmlFor="badge_text" value="Badge Text (Optional)" />
            <TextInput
              id="badge_text"
              type="text"
              className="mt-1 block w-full"
              value={createForm.data.badge_text}
              onChange={(e) => createForm.setData('badge_text', e.target.value)}
            />
            <InputError message={createForm.errors.badge_text} className="mt-2" />
          </div>
          
          <div className="mb-4 flex items-center">
            <Checkbox
              id="is_popular"
              checked={createForm.data.is_popular}
              onChange={(e) => createForm.setData('is_popular', e.target.checked)}
            />
            <InputLabel htmlFor="is_popular" value="Mark as Popular" className="ml-2" />
            <InputError message={createForm.errors.is_popular} className="mt-2" />
          </div>
          
          <div className="mb-4 flex items-center">
            <Checkbox
              id="is_active"
              checked={createForm.data.is_active}
              onChange={(e) => createForm.setData('is_active', e.target.checked)}
            />
            <InputLabel htmlFor="is_active" value="Active" className="ml-2" />
            <InputError message={createForm.errors.is_active} className="mt-2" />
          </div>
          
          <div className="flex justify-end mt-6">
            <SecondaryButton onClick={() => setShowCreateModal(false)} className="mr-2">
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={createForm.processing}>
              Create Plan
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* Edit Plan Modal */}
      <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
        <form onSubmit={handleEditSubmit} className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Edit Subscription Plan</h2>
          
          <div className="mb-4">
            <InputLabel htmlFor="edit_name" value="Name" />
            <TextInput
              id="edit_name"
              type="text"
              className="mt-1 block w-full"
              value={editForm.data.name}
              onChange={(e) => editForm.setData('name', e.target.value)}
              required
            />
            <InputError message={editForm.errors.name} className="mt-2" />
          </div>
          
          <div className="mb-4">
            <InputLabel htmlFor="edit_description" value="Description" />
            <TextArea
              id="edit_description"
              className="mt-1 block w-full"
              value={editForm.data.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => editForm.setData('description', e.target.value)}
            />
            <InputError message={editForm.errors.description} className="mt-2" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <InputLabel htmlFor="edit_price" value="Price ($)" />
              <TextInput
                id="edit_price"
                type="number"
                step="0.01"
                className="mt-1 block w-full"
                value={editForm.data.price}
                onChange={(e) => editForm.setData('price', e.target.value)}
                required
              />
              <InputError message={editForm.errors.price} className="mt-2" />
            </div>
            
            <div>
              <InputLabel htmlFor="edit_duration_in_days" value="Duration (days)" />
              <TextInput
                id="edit_duration_in_days"
                type="number"
                className="mt-1 block w-full"
                value={editForm.data.duration_in_days}
                onChange={(e) => editForm.setData('duration_in_days', e.target.value)}
                required
              />
              <InputError message={editForm.errors.duration_in_days} className="mt-2" />
            </div>
          </div>
          
          <div className="mb-4">
            <InputLabel htmlFor="edit_credits_per_month" value="Credits Per Month" />
            <TextInput
              id="edit_credits_per_month"
              type="number"
              className="mt-1 block w-full"
              value={editForm.data.credits_per_month}
              onChange={(e) => editForm.setData('credits_per_month', e.target.value)}
              required
            />
            <InputError message={editForm.errors.credits_per_month} className="mt-2" />
          </div>
          
          <div className="mb-4">
            <InputLabel htmlFor="edit_features" value="Features" />
            <div className="flex mt-1">
              <TextInput
                id="edit_feature_input"
                type="text"
                className="block w-full"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                placeholder="Add a feature"
              />
              <PrimaryButton type="button" className="ml-2" onClick={addFeature}>
                Add
              </PrimaryButton>
            </div>
            <InputError message={editForm.errors.features} className="mt-2" />
            
            <div className="mt-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center mt-2">
                  <span className="text-sm text-gray-700">{feature}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="ml-2 text-red-600 hover:text-red-900"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <InputLabel htmlFor="edit_badge_text" value="Badge Text (Optional)" />
            <TextInput
              id="edit_badge_text"
              type="text"
              className="mt-1 block w-full"
              value={editForm.data.badge_text}
              onChange={(e) => editForm.setData('badge_text', e.target.value)}
            />
            <InputError message={editForm.errors.badge_text} className="mt-2" />
          </div>
          
          <div className="mb-4 flex items-center">
            <Checkbox
              id="edit_is_popular"
              checked={editForm.data.is_popular}
              onChange={(e) => editForm.setData('is_popular', e.target.checked)}
            />
            <InputLabel htmlFor="edit_is_popular" value="Mark as Popular" className="ml-2" />
            <InputError message={editForm.errors.is_popular} className="mt-2" />
          </div>
          
          <div className="mb-4 flex items-center">
            <Checkbox
              id="edit_is_active"
              checked={editForm.data.is_active}
              onChange={(e) => editForm.setData('is_active', e.target.checked)}
            />
            <InputLabel htmlFor="edit_is_active" value="Active" className="ml-2" />
            <InputError message={editForm.errors.is_active} className="mt-2" />
          </div>
          
          <div className="flex justify-end mt-6">
            <SecondaryButton onClick={() => setShowEditModal(false)} className="mr-2">
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={editForm.processing}>
              Update Plan
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* Delete Plan Modal */}
      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <form onSubmit={handleDeleteSubmit} className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Delete Subscription Plan</h2>
          
          <p className="mb-4 text-sm text-gray-600">
            Are you sure you want to delete this subscription plan? This action cannot be undone.
          </p>
          
          {currentPlan && (
            <div className="mb-4 p-4 bg-gray-50 rounded">
              <p className="font-medium">{currentPlan.name}</p>
              <p className="text-sm text-gray-600">${currentPlan.price} - {currentPlan.duration_in_days} days</p>
            </div>
          )}
          
          <div className="flex justify-end mt-6">
            <SecondaryButton onClick={() => setShowDeleteModal(false)} className="mr-2">
              Cancel
            </SecondaryButton>
            <DangerButton type="submit" disabled={deleteForm.processing}>
              Delete Plan
            </DangerButton>
          </div>
        </form>
      </Modal>
    </AuthenticatedLayout>
  );
} 
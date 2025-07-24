import { User, Project } from '@/types/index';
import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
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
  projects: Project[];
  subscriptions: {
    data: (UserSubscription & { user_name?: string })[];
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

export default function Index({ auth, plans, projects, subscriptions }: Props) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
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
    project_id: '',
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
    project_id: '',
  });

  const deleteForm = useForm({});

  const runRenewalForm = useForm({});

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
      price: plan.price?.toString() || '0',
      duration_in_days: plan.duration_in_days?.toString() || '0',
      credits_per_month: plan.credits_per_month?.toString() || '0',
      features: plan.features || [],
      is_popular: plan.is_popular || false,
      is_active: plan.is_active || true,
      badge_text: plan.badge_text || '',
      project_id: plan.project_id?.toString() || '',
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
    runRenewalForm.post(route('admin.subscriptions.run-renewal'), {
      onSuccess: () => {
        setShowRenewalModal(false);
        // The page will be refreshed by the redirect in the controller
      },
      onError: (errors) => {
        console.error('Failed to run renewal command:', errors);
      }
    });
  };

  const openRenewalModal = () => {
    setShowRenewalModal(true);
  };

  return (
    <AdminLayout
      auth={{ user: auth.user, project: auth.project, modules: auth.modules }}
      title="Subscription Management"
      header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Subscription Management</h2>}
    >
      <Head title="Subscription Management" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Subscription Plans Section */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mb-6 border border-gray-200 dark:border-gray-700">
            <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Subscription Plans</h3>
                <div className="flex space-x-2">
                  <PrimaryButton onClick={openCreateModal}>Add New Plan</PrimaryButton>
                  <SecondaryButton onClick={openRenewalModal}>
                    Run Renewal Command
                  </SecondaryButton>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Project</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Duration</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Credits</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {plans.map((plan) => (
                      <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{plan.name}</div>
                              {plan.badge_text && (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                  {plan.badge_text}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {plan.project ? plan.project.name : 'No Project'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">₱ {plan.price?.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">{plan.duration_in_days} days</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">{plan.credits_per_month} credits/month</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            plan.is_active 
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}>
                            {plan.is_active ? 'Active' : 'Inactive'}
                          </span>
                          {plan.is_popular && (
                            <span className="ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                              Popular
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(plan)}
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => togglePlanStatus(plan)}
                              className={`${plan.is_active 
                                ? 'text-orange-600 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300' 
                                : 'text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300'
                              } transition-colors`}
                            >
                              {plan.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => openDeleteModal(plan)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
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
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">User Subscriptions</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Plan</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Start Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">End Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {subscriptions.data.map((subscription) => (
                      <tr key={subscription.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">{subscription.user_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">{subscription.plan.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            subscription.status === 'active' 
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 
                            subscription.status === 'cancelled' 
                              ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' : 
                              'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                          }`}>
                            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">{new Date(subscription.start_date).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">{new Date(subscription.end_date).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={route('admin.subscriptions.view', subscription.id)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors"
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
        <form onSubmit={handleCreateSubmit} className="p-6 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Create Subscription Plan</h2>
          
          <div className="mb-4">
            <InputLabel htmlFor="name" value="Name" className="text-gray-700 dark:text-gray-300" />
            <TextInput
              id="name"
              type="text"
              className="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              value={createForm.data.name}
              onChange={(e) => createForm.setData('name', e.target.value)}
              required
            />
            <InputError message={createForm.errors.name} className="mt-2" />
          </div>
          
          <div className="mb-4">
            <InputLabel htmlFor="description" value="Description" className="text-gray-700 dark:text-gray-300" />
            <TextArea
              id="description"
              className="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              value={createForm.data.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => createForm.setData('description', e.target.value)}
            />
            <InputError message={createForm.errors.description} className="mt-2" />
          </div>
          
          <div className="mb-4">
            <InputLabel htmlFor="project_id" value="Project (Optional)" className="text-gray-700 dark:text-gray-300" />
            <select
              id="project_id"
              className="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={createForm.data.project_id}
              onChange={(e) => createForm.setData('project_id', e.target.value)}
            >
              <option value="">Select a project (optional)</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <InputError message={createForm.errors.project_id} className="mt-2" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <InputLabel htmlFor="price" value="Price (₱)" className="text-gray-700 dark:text-gray-300" />
              <TextInput
                id="price"
                type="number"
                step="0.01"
                className="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                value={createForm.data.price}
                onChange={(e) => createForm.setData('price', e.target.value)}
                required
              />
              <InputError message={createForm.errors.price} className="mt-2" />
            </div>
            
            <div>
              <InputLabel htmlFor="duration_in_days" value="Duration (days)" className="text-gray-700 dark:text-gray-300" />
              <TextInput
                id="duration_in_days"
                type="number"
                className="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                value={createForm.data.duration_in_days}
                onChange={(e) => createForm.setData('duration_in_days', e.target.value)}
                required
              />
              <InputError message={createForm.errors.duration_in_days} className="mt-2" />
            </div>
          </div>
          
          <div className="mb-4">
            <InputLabel htmlFor="credits_per_month" value="Credits Per Month" className="text-gray-700 dark:text-gray-300" />
            <TextInput
              id="credits_per_month"
              type="number"
              className="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              value={createForm.data.credits_per_month}
              onChange={(e) => createForm.setData('credits_per_month', e.target.value)}
              required
            />
            <InputError message={createForm.errors.credits_per_month} className="mt-2" />
          </div>
          
          <div className="mb-4">
            <InputLabel htmlFor="features" value="Features" className="text-gray-700 dark:text-gray-300" />
            <div className="flex mt-1">
              <TextInput
                id="feature_input"
                type="text"
                className="block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
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
                  <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="ml-2 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <InputLabel htmlFor="badge_text" value="Badge Text (Optional)" className="text-gray-700 dark:text-gray-300" />
            <TextInput
              id="badge_text"
              type="text"
              className="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
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
            <InputLabel htmlFor="is_popular" value="Mark as Popular" className="ml-2 text-gray-700 dark:text-gray-300" />
            <InputError message={createForm.errors.is_popular} className="mt-2" />
          </div>
          
          <div className="mb-4 flex items-center">
            <Checkbox
              id="is_active"
              checked={createForm.data.is_active}
              onChange={(e) => createForm.setData('is_active', e.target.checked)}
            />
            <InputLabel htmlFor="is_active" value="Active" className="ml-2 text-gray-700 dark:text-gray-300" />
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
        <form onSubmit={handleEditSubmit} className="p-6 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Edit Subscription Plan</h2>
          
          <div className="mb-4">
            <InputLabel htmlFor="edit_name" value="Name" className="text-gray-700 dark:text-gray-300" />
            <TextInput
              id="edit_name"
              type="text"
              className="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              value={editForm.data.name}
              onChange={(e) => editForm.setData('name', e.target.value)}
              required
            />
            <InputError message={editForm.errors.name} className="mt-2" />
          </div>
          
          <div className="mb-4">
            <InputLabel htmlFor="edit_description" value="Description" className="text-gray-700 dark:text-gray-300" />
            <TextArea
              id="edit_description"
              className="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              value={editForm.data.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => editForm.setData('description', e.target.value)}
            />
            <InputError message={editForm.errors.description} className="mt-2" />
          </div>
          
          <div className="mb-4">
            <InputLabel htmlFor="edit_project_id" value="Project (Optional)" className="text-gray-700 dark:text-gray-300" />
            <select
              id="edit_project_id"
              className="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={editForm.data.project_id}
              onChange={(e) => editForm.setData('project_id', e.target.value)}
            >
              <option value="">Select a project (optional)</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <InputError message={editForm.errors.project_id} className="mt-2" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <InputLabel htmlFor="edit_price" value="Price (₱)" className="text-gray-700 dark:text-gray-300" />
              <TextInput
                id="edit_price"
                type="number"
                step="0.01"
                className="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                value={editForm.data.price}
                onChange={(e) => editForm.setData('price', e.target.value)}
                required
              />
              <InputError message={editForm.errors.price} className="mt-2" />
            </div>
            
            <div>
              <InputLabel htmlFor="edit_duration_in_days" value="Duration (days)" className="text-gray-700 dark:text-gray-300" />
              <TextInput
                id="edit_duration_in_days"
                type="number"
                className="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                value={editForm.data.duration_in_days}
                onChange={(e) => editForm.setData('duration_in_days', e.target.value)}
                required
              />
              <InputError message={editForm.errors.duration_in_days} className="mt-2" />
            </div>
          </div>
          
          <div className="mb-4">
            <InputLabel htmlFor="edit_credits_per_month" value="Credits Per Month" className="text-gray-700 dark:text-gray-300" />
            <TextInput
              id="edit_credits_per_month"
              type="number"
              className="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              value={editForm.data.credits_per_month}
              onChange={(e) => editForm.setData('credits_per_month', e.target.value)}
              required
            />
            <InputError message={editForm.errors.credits_per_month} className="mt-2" />
          </div>
          
          <div className="mb-4">
            <InputLabel htmlFor="edit_features" value="Features" className="text-gray-700 dark:text-gray-300" />
            <div className="flex mt-1">
              <TextInput
                id="edit_feature_input"
                type="text"
                className="block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
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
                  <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="ml-2 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <InputLabel htmlFor="edit_badge_text" value="Badge Text (Optional)" className="text-gray-700 dark:text-gray-300" />
            <TextInput
              id="edit_badge_text"
              type="text"
              className="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
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
            <InputLabel htmlFor="edit_is_popular" value="Mark as Popular" className="ml-2 text-gray-700 dark:text-gray-300" />
            <InputError message={editForm.errors.is_popular} className="mt-2" />
          </div>
          
          <div className="mb-4 flex items-center">
            <Checkbox
              id="edit_is_active"
              checked={editForm.data.is_active}
              onChange={(e) => editForm.setData('is_active', e.target.checked)}
            />
            <InputLabel htmlFor="edit_is_active" value="Active" className="ml-2 text-gray-700 dark:text-gray-300" />
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
        <form onSubmit={handleDeleteSubmit} className="p-6 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Delete Subscription Plan</h2>
          
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this subscription plan? This action cannot be undone.
          </p>
          
          {currentPlan && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
              <p className="font-medium text-gray-900 dark:text-gray-100">{currentPlan.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">₱ {currentPlan.price?.toLocaleString()} - {currentPlan.duration_in_days} days</p>
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

      {/* Renewal Command Modal */}
      <Modal show={showRenewalModal} onClose={() => setShowRenewalModal(false)}>
        <div className="p-6 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Run Subscription Renewal Command</h2>
          
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            This will process the following tasks:
          </p>
          
          <ul className="list-disc pl-5 mb-4 text-sm text-gray-600 dark:text-gray-400">
            <li>Add monthly credits to active subscriptions</li>
            <li>Process auto-renewals for subscriptions ending soon</li>
            <li>Mark expired subscriptions</li>
          </ul>
          
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to run this command now?
          </p>
          
          <div className="flex justify-end mt-6">
            <SecondaryButton onClick={() => setShowRenewalModal(false)} className="mr-2">
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={runRenewalCommand} disabled={runRenewalForm.processing}>
              {runRenewalForm.processing ? 'Processing...' : 'Run Command'}
            </PrimaryButton>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
} 
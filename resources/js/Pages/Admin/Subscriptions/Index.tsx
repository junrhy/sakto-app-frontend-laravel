import Checkbox from '@/Components/Checkbox';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextArea from '@/Components/TextArea';
import TextInput from '@/Components/TextInput';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { PageProps, Project, User } from '@/types/index';
import { SubscriptionPlan, UserSubscription } from '@/types/models';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import Tabs from './Tabs';

interface Props {
    auth: PageProps['auth'];
    plans: SubscriptionPlan[];
    projects: Project[];
    users: User[];
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
    filters: {
        project_id?: string;
        user_id?: string;
        currency?: string;
    };
}

const getCurrencySymbol = (currency?: string): string => {
    const symbols: Record<string, string> = {
        PHP: '₱',
        USD: '$',
        EUR: '€',
        GBP: '£',
        JPY: '¥',
        AUD: '$',
        CAD: '$',
    };
    return symbols[currency || 'USD'] || currency || 'USD';
};

export default function Index({
    auth,
    plans,
    projects,
    users,
    subscriptions,
    filters,
}: Props) {
    const [activeTab, setActiveTab] = useState<'plans' | 'subscriptions'>(
        'plans',
    );
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRenewalModal, setShowRenewalModal] = useState(false);
    const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(
        null,
    );
    const [features, setFeatures] = useState<string[]>([]);
    const [featureInput, setFeatureInput] = useState('');
    const [projectFilter, setProjectFilter] = useState(
        filters.project_id || '',
    );
    const [userFilter, setUserFilter] = useState(filters.user_id || '');
    const [currencyFilter, setCurrencyFilter] = useState(
        filters.currency || '',
    );

    const createForm = useForm({
        name: '',
        slug: '',
        description: '',
        price: '',
        currency: 'USD',
        duration_in_days: '',
        credits_per_month: '',
        features: [] as string[],
        is_popular: false,
        is_active: true,
        badge_text: '',
        project_id: '',
        lemon_squeezy_variant_id: '',
        auto_create_lemon_squeezy: false,
    });

    const editForm = useForm({
        name: '',
        slug: '',
        description: '',
        price: '',
        currency: 'USD',
        duration_in_days: '',
        credits_per_month: '',
        features: [] as string[],
        is_popular: false,
        is_active: true,
        badge_text: '',
        project_id: '',
        lemon_squeezy_variant_id: '',
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
            slug: plan.slug || '',
            description: plan.description || '',
            price: plan.price?.toString() || '0',
            currency: plan.currency || 'USD',
            duration_in_days: plan.duration_in_days?.toString() || '0',
            credits_per_month: plan.credits_per_month?.toString() || '0',
            features: plan.features || [],
            is_popular: plan.is_popular || false,
            lemon_squeezy_variant_id:
                (plan as any).lemon_squeezy_variant_id || '',
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
            editForm.put(
                route('admin.subscriptions.plans.update', currentPlan.id),
                {
                    onSuccess: () => setShowEditModal(false),
                },
            );
        }
    };

    const handleDeleteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentPlan) {
            deleteForm.delete(
                route('admin.subscriptions.plans.destroy', currentPlan.id),
                {
                    onSuccess: () => setShowDeleteModal(false),
                },
            );
        }
    };

    const togglePlanStatus = (plan: SubscriptionPlan) => {
        window.location.href = route(
            'admin.subscriptions.plans.toggle-status',
            plan.id,
        );
    };

    const runRenewalCommand = () => {
        runRenewalForm.post(route('admin.subscriptions.run-renewal'), {
            onSuccess: () => {
                setShowRenewalModal(false);
                // The page will be refreshed by the redirect in the controller
            },
            onError: (errors) => {
                console.error('Failed to run renewal command:', errors);
            },
        });
    };

    const openRenewalModal = () => {
        setShowRenewalModal(true);
    };

    const handleProjectFilterChange = (projectId: string) => {
        setProjectFilter(projectId);
        // Navigate with the new filter
        const url = new URL(window.location.href);
        if (projectId) {
            url.searchParams.set('project_id', projectId);
        } else {
            url.searchParams.delete('project_id');
        }
        window.location.href = url.toString();
    };

    const handleUserFilterChange = (userId: string) => {
        setUserFilter(userId);
        // Navigate with the new filter
        const url = new URL(window.location.href);
        if (userId) {
            url.searchParams.set('user_id', userId);
        } else {
            url.searchParams.delete('user_id');
        }
        window.location.href = url.toString();
    };

    const handleCurrencyFilterChange = (currency: string) => {
        setCurrencyFilter(currency);
        // Navigate with the new filter
        const url = new URL(window.location.href);
        if (currency) {
            url.searchParams.set('currency', currency);
        } else {
            url.searchParams.delete('currency');
        }
        window.location.href = url.toString();
    };

    return (
        <AdminLayout
            auth={{
                user: auth.user,
                project: auth.project,
                modules: auth.modules,
            }}
            title="Subscription Management"
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Subscription Management
                </h2>
            }
        >
            <Head title="Subscription Management" />

            <div className="py-12">
                <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
                    {/* Tabs Navigation */}
                    <div className="mb-6 overflow-hidden border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:rounded-lg">
                        <div className="px-6 pt-6">
                            <Tabs
                                tabs={[
                                    {
                                        id: 'plans',
                                        label: 'Subscription Plans',
                                        count: plans.length,
                                        icon: (
                                            <svg
                                                className="h-5 w-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                                />
                                            </svg>
                                        ),
                                    },
                                    {
                                        id: 'subscriptions',
                                        label: 'User Subscriptions',
                                        count:
                                            subscriptions?.meta?.total ||
                                            subscriptions?.data?.length ||
                                            0,
                                        icon: (
                                            <svg
                                                className="h-5 w-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                                />
                                            </svg>
                                        ),
                                    },
                                ]}
                                activeTab={activeTab}
                                onTabChange={(tabId) =>
                                    setActiveTab(
                                        tabId as 'plans' | 'subscriptions',
                                    )
                                }
                            />
                        </div>

                        {/* Subscription Plans Tab */}
                        {activeTab === 'plans' && (
                            <div className="p-6">
                                {/* Filters and Actions */}
                                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                                        {/* Project Filter */}
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                            <label
                                                htmlFor="project-filter"
                                                className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Project:
                                            </label>
                                            <select
                                                id="project-filter"
                                                value={projectFilter}
                                                onChange={(e) =>
                                                    handleProjectFilterChange(
                                                        e.target.value,
                                                    )
                                                }
                                                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 sm:w-48"
                                            >
                                                <option value="">
                                                    All Projects
                                                </option>
                                                {projects.map((project) => (
                                                    <option
                                                        key={project.id}
                                                        value={project.id}
                                                    >
                                                        {project.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {projectFilter && (
                                                <button
                                                    onClick={() =>
                                                        handleProjectFilterChange(
                                                            '',
                                                        )
                                                    }
                                                    className="text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                >
                                                    Clear
                                                </button>
                                            )}
                                        </div>

                                        {/* Currency Filter */}
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                            <label
                                                htmlFor="currency-filter"
                                                className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Currency:
                                            </label>
                                            <select
                                                id="currency-filter"
                                                value={currencyFilter}
                                                onChange={(e) =>
                                                    handleCurrencyFilterChange(
                                                        e.target.value,
                                                    )
                                                }
                                                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 sm:w-48"
                                            >
                                                <option value="">
                                                    All Currencies
                                                </option>
                                                <option value="USD">
                                                    USD ($)
                                                </option>
                                                <option value="PHP">
                                                    PHP (₱)
                                                </option>
                                                <option value="EUR">
                                                    EUR (€)
                                                </option>
                                                <option value="GBP">
                                                    GBP (£)
                                                </option>
                                                <option value="JPY">
                                                    JPY (¥)
                                                </option>
                                                <option value="AUD">
                                                    AUD ($)
                                                </option>
                                                <option value="CAD">
                                                    CAD ($)
                                                </option>
                                            </select>
                                            {currencyFilter && (
                                                <button
                                                    onClick={() =>
                                                        handleCurrencyFilterChange(
                                                            '',
                                                        )
                                                    }
                                                    className="text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                >
                                                    Clear
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <PrimaryButton
                                            onClick={openCreateModal}
                                        >
                                            Add New Plan
                                        </PrimaryButton>
                                        <SecondaryButton
                                            onClick={openRenewalModal}
                                        >
                                            Run Renewal Command
                                        </SecondaryButton>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th
                                                    scope="col"
                                                    className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                                >
                                                    Name
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                                >
                                                    Slug
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                                >
                                                    Project
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                                >
                                                    Price
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                                >
                                                    Currency
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                                >
                                                    Duration
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                                >
                                                    Credits
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                                >
                                                    Active Users
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                                >
                                                    Status
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                                >
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                            {plans.map((plan) => (
                                                <tr
                                                    key={plan.id}
                                                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                                                >
                                                    <td className="whitespace-nowrap px-3 py-4">
                                                        <div className="flex items-center">
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                    {plan.name}
                                                                </div>
                                                                {plan.badge_text && (
                                                                    <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                                        {
                                                                            plan.badge_text
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4">
                                                        <div className="font-mono text-sm text-gray-600 dark:text-gray-400">
                                                            {plan.slug}
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4">
                                                        <div className="text-sm text-gray-900 dark:text-gray-100">
                                                            {plan.project
                                                                ? plan.project
                                                                      .name
                                                                : 'No Project'}
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4">
                                                        <div className="text-sm text-gray-900 dark:text-gray-100">
                                                            {plan.price?.toLocaleString()}
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4">
                                                        <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-gray-100">
                                                            <span className="font-mono font-semibold">
                                                                {plan.currency ||
                                                                    'USD'}
                                                            </span>
                                                            <span className="text-gray-500 dark:text-gray-400">
                                                                (
                                                                {getCurrencySymbol(
                                                                    plan.currency,
                                                                )}
                                                                )
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4">
                                                        <div className="text-sm text-gray-900 dark:text-gray-100">
                                                            {
                                                                plan.duration_in_days
                                                            }{' '}
                                                            days
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4">
                                                        <div className="text-sm text-gray-900 dark:text-gray-100">
                                                            {
                                                                plan.credits_per_month
                                                            }{' '}
                                                            credits/month
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4">
                                                        <div className="text-sm text-gray-900 dark:text-gray-100">
                                                            {plan.active_users_count ||
                                                                0}{' '}
                                                            users
                                                            {(plan.active_users_count ||
                                                                0) > 0 && (
                                                                <span className="ml-1 text-xs text-orange-600 dark:text-orange-400">
                                                                    (active)
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4">
                                                        <span
                                                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                                plan.is_active
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                            }`}
                                                        >
                                                            {plan.is_active
                                                                ? 'Active'
                                                                : 'Inactive'}
                                                        </span>
                                                        {plan.is_popular && (
                                                            <span className="ml-1 inline-flex rounded-full bg-yellow-100 px-2 text-xs font-semibold leading-5 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                                Popular
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() =>
                                                                    openEditModal(
                                                                        plan,
                                                                    )
                                                                }
                                                                className="text-indigo-600 transition-colors hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    togglePlanStatus(
                                                                        plan,
                                                                    )
                                                                }
                                                                disabled={
                                                                    plan.is_active &&
                                                                    (plan.active_users_count ||
                                                                        0) > 0
                                                                }
                                                                className={`${
                                                                    plan.is_active &&
                                                                    (plan.active_users_count ||
                                                                        0) > 0
                                                                        ? 'cursor-not-allowed text-gray-400 dark:text-gray-500'
                                                                        : plan.is_active
                                                                          ? 'text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300'
                                                                          : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                                                                } transition-colors`}
                                                                title={
                                                                    plan.is_active &&
                                                                    (plan.active_users_count ||
                                                                        0) > 0
                                                                        ? `Cannot deactivate plan with ${plan.active_users_count} active users`
                                                                        : undefined
                                                                }
                                                            >
                                                                {plan.is_active
                                                                    ? 'Deactivate'
                                                                    : 'Activate'}
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    openDeleteModal(
                                                                        plan,
                                                                    )
                                                                }
                                                                disabled={
                                                                    (plan.active_users_count ||
                                                                        0) > 0
                                                                }
                                                                className={`${
                                                                    (plan.active_users_count ||
                                                                        0) > 0
                                                                        ? 'cursor-not-allowed text-gray-400 dark:text-gray-500'
                                                                        : 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                                                                } transition-colors`}
                                                                title={
                                                                    (plan.active_users_count ||
                                                                        0) > 0
                                                                        ? `Cannot delete plan with ${plan.active_users_count} active users`
                                                                        : undefined
                                                                }
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
                        )}

                        {/* User Subscriptions Tab */}
                        {activeTab === 'subscriptions' && (
                            <div className="p-6">
                                {/* User Filter */}
                                <div className="mb-4">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                        <label
                                            htmlFor="user-filter"
                                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            Filter by User:
                                        </label>
                                        <select
                                            id="user-filter"
                                            value={userFilter}
                                            onChange={(e) =>
                                                handleUserFilterChange(
                                                    e.target.value,
                                                )
                                            }
                                            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 sm:w-64"
                                        >
                                            <option value="">All Users</option>
                                            {users.map((user) => (
                                                <option
                                                    key={user.id}
                                                    value={user.id}
                                                >
                                                    {user.name}
                                                </option>
                                            ))}
                                        </select>
                                        {userFilter && (
                                            <button
                                                onClick={() =>
                                                    handleUserFilterChange('')
                                                }
                                                className="text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                            >
                                                Clear Filter
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th
                                                    scope="col"
                                                    className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                                >
                                                    User
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                                >
                                                    Plan
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                                >
                                                    Status
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                                >
                                                    Start Date
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                                >
                                                    End Date
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                                >
                                                    Auto Renew
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                                >
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                            {subscriptions?.data?.map(
                                                (subscription) => (
                                                    <tr
                                                        key={subscription.id}
                                                        className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                                                    >
                                                        <td className="whitespace-nowrap px-3 py-4">
                                                            <div className="text-sm text-gray-900 dark:text-gray-100">
                                                                {
                                                                    subscription.user_name
                                                                }
                                                            </div>
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4">
                                                            <div className="text-sm text-gray-900 dark:text-gray-100">
                                                                {
                                                                    subscription
                                                                        .plan
                                                                        .name
                                                                }
                                                            </div>
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4">
                                                            <span
                                                                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                                    subscription.status ===
                                                                    'active'
                                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                        : subscription.status ===
                                                                            'cancelled'
                                                                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                                }`}
                                                            >
                                                                {subscription.status
                                                                    .charAt(0)
                                                                    .toUpperCase() +
                                                                    subscription.status.slice(
                                                                        1,
                                                                    )}
                                                            </span>
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4">
                                                            <div className="text-sm text-gray-900 dark:text-gray-100">
                                                                {new Date(
                                                                    subscription.start_date,
                                                                ).toLocaleDateString()}
                                                            </div>
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4">
                                                            <div className="text-sm text-gray-900 dark:text-gray-100">
                                                                {new Date(
                                                                    subscription.end_date,
                                                                ).toLocaleDateString()}
                                                            </div>
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4">
                                                            <span
                                                                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                                    subscription.auto_renew
                                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                                }`}
                                                            >
                                                                {subscription.auto_renew
                                                                    ? 'Yes'
                                                                    : 'No'}
                                                            </span>
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium">
                                                            <Link
                                                                href={route(
                                                                    'admin.subscriptions.view',
                                                                    subscription.id,
                                                                )}
                                                                className="text-indigo-600 transition-colors hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                            >
                                                                View Details
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {subscriptions.meta &&
                                    subscriptions.meta.links && (
                                        <div className="mt-4">
                                            <Pagination
                                                links={subscriptions.meta.links}
                                            />
                                        </div>
                                    )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Plan Modal */}
            <Modal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            >
                <form
                    onSubmit={handleCreateSubmit}
                    className="flex max-h-[90vh] flex-col bg-white dark:bg-gray-800"
                >
                    {/* Fixed Header */}
                    <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            Create Subscription Plan
                        </h2>
                    </div>

                    {/* Scrollable Content */}
                    <div className="max-h-[calc(90vh-140px)] overflow-y-auto px-6 py-4">
                        <div className="mb-4">
                            <InputLabel
                                htmlFor="name"
                                value="Name"
                                className="text-gray-700 dark:text-gray-300"
                            />
                            <TextInput
                                id="name"
                                type="text"
                                className="mt-1 block w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                value={createForm.data.name}
                                onChange={(e) =>
                                    createForm.setData('name', e.target.value)
                                }
                                required
                            />
                            <InputError
                                message={createForm.errors.name}
                                className="mt-2"
                            />
                        </div>

                        <div className="mb-4">
                            <InputLabel
                                htmlFor="slug"
                                value="Slug"
                                className="text-gray-700 dark:text-gray-300"
                            />
                            <TextInput
                                id="slug"
                                type="text"
                                className="mt-1 block w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                value={createForm.data.slug}
                                onChange={(e) =>
                                    createForm.setData('slug', e.target.value)
                                }
                                placeholder="e.g., basic-plan, premium-plan"
                                required
                            />
                            <InputError
                                message={createForm.errors.slug}
                                className="mt-2"
                            />
                        </div>

                        <div className="mb-4">
                            <InputLabel
                                htmlFor="description"
                                value="Description"
                                className="text-gray-700 dark:text-gray-300"
                            />
                            <TextArea
                                id="description"
                                className="mt-1 block w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                value={createForm.data.description}
                                onChange={(
                                    e: React.ChangeEvent<HTMLTextAreaElement>,
                                ) =>
                                    createForm.setData(
                                        'description',
                                        e.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={createForm.errors.description}
                                className="mt-2"
                            />
                        </div>

                        <div className="mb-4">
                            <InputLabel
                                htmlFor="project_id"
                                value="Project (Optional)"
                                className="text-gray-700 dark:text-gray-300"
                            />
                            <select
                                id="project_id"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                value={createForm.data.project_id}
                                onChange={(e) =>
                                    createForm.setData(
                                        'project_id',
                                        e.target.value,
                                    )
                                }
                            >
                                <option value="">
                                    Select a project (optional)
                                </option>
                                {projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                            <InputError
                                message={createForm.errors.project_id}
                                className="mt-2"
                            />
                        </div>

                        <div className="mb-4">
                            <div className="mb-3 flex items-center space-x-2">
                                <input
                                    id="auto_create_lemon_squeezy"
                                    type="checkbox"
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                                    checked={
                                        createForm.data
                                            .auto_create_lemon_squeezy
                                    }
                                    onChange={(e) =>
                                        createForm.setData(
                                            'auto_create_lemon_squeezy',
                                            e.target.checked,
                                        )
                                    }
                                />
                                <InputLabel
                                    htmlFor="auto_create_lemon_squeezy"
                                    value="Auto-create Lemon Squeezy Variant"
                                    className="text-gray-700 dark:text-gray-300"
                                />
                            </div>
                            <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                                Automatically create a product variant in Lemon
                                Squeezy for this plan
                            </p>
                        </div>

                        {!createForm.data.auto_create_lemon_squeezy && (
                            <div className="mb-4">
                                <InputLabel
                                    htmlFor="lemon_squeezy_variant_id"
                                    value="Lemon Squeezy Variant ID (Optional)"
                                    className="text-gray-700 dark:text-gray-300"
                                />
                                <TextInput
                                    id="lemon_squeezy_variant_id"
                                    type="text"
                                    className="mt-1 block w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                    value={
                                        createForm.data.lemon_squeezy_variant_id
                                    }
                                    onChange={(e) =>
                                        createForm.setData(
                                            'lemon_squeezy_variant_id',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g., 1035735"
                                />
                                <InputError
                                    message={
                                        (createForm.errors as any)
                                            .lemon_squeezy_variant_id
                                    }
                                    className="mt-2"
                                />
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Enter the variant ID from your Lemon Squeezy
                                    dashboard (Products → Variants)
                                </p>
                            </div>
                        )}

                        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <InputLabel
                                    htmlFor="price"
                                    value="Price"
                                    className="text-gray-700 dark:text-gray-300"
                                />
                                <TextInput
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    className="mt-1 block w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                    value={createForm.data.price}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'price',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                <InputError
                                    message={createForm.errors.price}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="currency"
                                    value="Currency"
                                    className="text-gray-700 dark:text-gray-300"
                                />
                                <select
                                    id="currency"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                    value={createForm.data.currency}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'currency',
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="PHP">PHP (₱)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="JPY">JPY (¥)</option>
                                    <option value="AUD">AUD ($)</option>
                                    <option value="CAD">CAD ($)</option>
                                </select>
                                <InputError
                                    message={createForm.errors.currency}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="duration_in_days"
                                    value="Duration (days)"
                                    className="text-gray-700 dark:text-gray-300"
                                />
                                <TextInput
                                    id="duration_in_days"
                                    type="number"
                                    className="mt-1 block w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                    value={createForm.data.duration_in_days}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'duration_in_days',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                <InputError
                                    message={createForm.errors.duration_in_days}
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <InputLabel
                                htmlFor="credits_per_month"
                                value="Credits Per Month"
                                className="text-gray-700 dark:text-gray-300"
                            />
                            <TextInput
                                id="credits_per_month"
                                type="number"
                                className="mt-1 block w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                value={createForm.data.credits_per_month}
                                onChange={(e) =>
                                    createForm.setData(
                                        'credits_per_month',
                                        e.target.value,
                                    )
                                }
                                required
                            />
                            <InputError
                                message={createForm.errors.credits_per_month}
                                className="mt-2"
                            />
                        </div>

                        <div className="mb-4">
                            <InputLabel
                                htmlFor="features"
                                value="Features"
                                className="text-gray-700 dark:text-gray-300"
                            />
                            <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                                <TextInput
                                    id="feature_input"
                                    type="text"
                                    className="block w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                    value={featureInput}
                                    onChange={(e) =>
                                        setFeatureInput(e.target.value)
                                    }
                                    placeholder="Add a feature"
                                />
                                <PrimaryButton
                                    type="button"
                                    className="sm:ml-2"
                                    onClick={addFeature}
                                >
                                    Add
                                </PrimaryButton>
                            </div>
                            <InputError
                                message={createForm.errors.features}
                                className="mt-2"
                            />

                            <div className="mt-2">
                                {features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="mt-2 flex items-center justify-between"
                                    >
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            {feature}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(index)}
                                            className="ml-2 text-red-600 transition-colors hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <InputLabel
                                htmlFor="badge_text"
                                value="Badge Text (Optional)"
                                className="text-gray-700 dark:text-gray-300"
                            />
                            <TextInput
                                id="badge_text"
                                type="text"
                                className="mt-1 block w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                value={createForm.data.badge_text}
                                onChange={(e) =>
                                    createForm.setData(
                                        'badge_text',
                                        e.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={createForm.errors.badge_text}
                                className="mt-2"
                            />
                        </div>

                        <div className="mb-4 flex items-center">
                            <Checkbox
                                id="is_popular"
                                checked={createForm.data.is_popular}
                                onChange={(e) =>
                                    createForm.setData(
                                        'is_popular',
                                        e.target.checked,
                                    )
                                }
                            />
                            <InputLabel
                                htmlFor="is_popular"
                                value="Mark as Popular"
                                className="ml-2 text-gray-700 dark:text-gray-300"
                            />
                            <InputError
                                message={createForm.errors.is_popular}
                                className="mt-2"
                            />
                        </div>

                        <div className="mb-4 flex items-center">
                            <Checkbox
                                id="is_active"
                                checked={createForm.data.is_active}
                                onChange={(e) =>
                                    createForm.setData(
                                        'is_active',
                                        e.target.checked,
                                    )
                                }
                            />
                            <InputLabel
                                htmlFor="is_active"
                                value="Active"
                                className="ml-2 text-gray-700 dark:text-gray-300"
                            />
                            <InputError
                                message={createForm.errors.is_active}
                                className="mt-2"
                            />
                        </div>
                    </div>

                    {/* Fixed Footer */}
                    <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <SecondaryButton
                                onClick={() => setShowCreateModal(false)}
                            >
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton
                                type="submit"
                                disabled={createForm.processing}
                            >
                                Create Plan
                            </PrimaryButton>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Edit Plan Modal */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
                <form
                    onSubmit={handleEditSubmit}
                    className="flex max-h-[90vh] flex-col bg-white dark:bg-gray-800"
                >
                    {/* Fixed Header */}
                    <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            Edit Subscription Plan
                        </h2>
                    </div>

                    {/* Scrollable Content */}
                    <div className="max-h-[calc(90vh-140px)] overflow-y-auto px-6 py-4">
                        <div className="mb-4">
                            <InputLabel
                                htmlFor="edit_name"
                                value="Name"
                                className="text-gray-700 dark:text-gray-300"
                            />
                            <TextInput
                                id="edit_name"
                                type="text"
                                className="mt-1 block w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                value={editForm.data.name}
                                onChange={(e) =>
                                    editForm.setData('name', e.target.value)
                                }
                                required
                            />
                            <InputError
                                message={editForm.errors.name}
                                className="mt-2"
                            />
                        </div>

                        <div className="mb-4">
                            <InputLabel
                                htmlFor="edit_slug"
                                value="Slug"
                                className="text-gray-700 dark:text-gray-300"
                            />
                            <TextInput
                                id="edit_slug"
                                type="text"
                                className="mt-1 block w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                value={editForm.data.slug}
                                onChange={(e) =>
                                    editForm.setData('slug', e.target.value)
                                }
                                placeholder="e.g., basic-plan, premium-plan"
                                required
                            />
                            <InputError
                                message={editForm.errors.slug}
                                className="mt-2"
                            />
                        </div>

                        <div className="mb-4">
                            <InputLabel
                                htmlFor="edit_description"
                                value="Description"
                                className="text-gray-700 dark:text-gray-300"
                            />
                            <TextArea
                                id="edit_description"
                                className="mt-1 block w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                value={editForm.data.description}
                                onChange={(
                                    e: React.ChangeEvent<HTMLTextAreaElement>,
                                ) =>
                                    editForm.setData(
                                        'description',
                                        e.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={editForm.errors.description}
                                className="mt-2"
                            />
                        </div>

                        <div className="mb-4">
                            <InputLabel
                                htmlFor="edit_project_id"
                                value="Project (Optional)"
                                className="text-gray-700 dark:text-gray-300"
                            />
                            <select
                                id="edit_project_id"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                value={editForm.data.project_id}
                                onChange={(e) =>
                                    editForm.setData(
                                        'project_id',
                                        e.target.value,
                                    )
                                }
                            >
                                <option value="">
                                    Select a project (optional)
                                </option>
                                {projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                            <InputError
                                message={editForm.errors.project_id}
                                className="mt-2"
                            />
                        </div>

                        <div className="mb-4">
                            <InputLabel
                                htmlFor="edit_lemon_squeezy_variant_id"
                                value="Lemon Squeezy Variant ID (Optional)"
                                className="text-gray-700 dark:text-gray-300"
                            />
                            <TextInput
                                id="edit_lemon_squeezy_variant_id"
                                type="text"
                                className="mt-1 block w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                value={editForm.data.lemon_squeezy_variant_id}
                                onChange={(e) =>
                                    editForm.setData(
                                        'lemon_squeezy_variant_id',
                                        e.target.value,
                                    )
                                }
                                placeholder="e.g., 1035735"
                            />
                            <InputError
                                message={
                                    (editForm.errors as any)
                                        .lemon_squeezy_variant_id
                                }
                                className="mt-2"
                            />
                            {editForm.data.lemon_squeezy_variant_id ? (
                                <div className="mt-2 rounded-md border border-blue-200 bg-blue-50 p-2 dark:border-blue-800 dark:bg-blue-900/20">
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        ℹ️ Changes to name, description, price,
                                        and duration will be automatically
                                        synced with Lemon Squeezy
                                    </p>
                                </div>
                            ) : (
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Enter the variant ID from your Lemon Squeezy
                                    dashboard (Products → Variants)
                                </p>
                            )}
                        </div>

                        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <InputLabel
                                    htmlFor="edit_price"
                                    value="Price"
                                    className="text-gray-700 dark:text-gray-300"
                                />
                                <TextInput
                                    id="edit_price"
                                    type="number"
                                    step="0.01"
                                    className="mt-1 block w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                    value={editForm.data.price}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'price',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                <InputError
                                    message={editForm.errors.price}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="edit_currency"
                                    value="Currency"
                                    className="text-gray-700 dark:text-gray-300"
                                />
                                <select
                                    id="edit_currency"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                    value={editForm.data.currency}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'currency',
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="PHP">PHP (₱)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="JPY">JPY (¥)</option>
                                    <option value="AUD">AUD ($)</option>
                                    <option value="CAD">CAD ($)</option>
                                </select>
                                <InputError
                                    message={editForm.errors.currency}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="edit_duration_in_days"
                                    value="Duration (days)"
                                    className="text-gray-700 dark:text-gray-300"
                                />
                                <TextInput
                                    id="edit_duration_in_days"
                                    type="number"
                                    className="mt-1 block w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                    value={editForm.data.duration_in_days}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'duration_in_days',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                <InputError
                                    message={editForm.errors.duration_in_days}
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <InputLabel
                                htmlFor="edit_credits_per_month"
                                value="Credits Per Month"
                                className="text-gray-700 dark:text-gray-300"
                            />
                            <TextInput
                                id="edit_credits_per_month"
                                type="number"
                                className="mt-1 block w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                value={editForm.data.credits_per_month}
                                onChange={(e) =>
                                    editForm.setData(
                                        'credits_per_month',
                                        e.target.value,
                                    )
                                }
                                required
                            />
                            <InputError
                                message={editForm.errors.credits_per_month}
                                className="mt-2"
                            />
                        </div>

                        <div className="mb-4">
                            <InputLabel
                                htmlFor="edit_features"
                                value="Features"
                                className="text-gray-700 dark:text-gray-300"
                            />
                            <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                                <TextInput
                                    id="edit_feature_input"
                                    type="text"
                                    className="block w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                    value={featureInput}
                                    onChange={(e) =>
                                        setFeatureInput(e.target.value)
                                    }
                                    placeholder="Add a feature"
                                />
                                <PrimaryButton
                                    type="button"
                                    className="sm:ml-2"
                                    onClick={addFeature}
                                >
                                    Add
                                </PrimaryButton>
                            </div>
                            <InputError
                                message={editForm.errors.features}
                                className="mt-2"
                            />

                            <div className="mt-2">
                                {features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="mt-2 flex items-center justify-between"
                                    >
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            {feature}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(index)}
                                            className="ml-2 text-red-600 transition-colors hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <InputLabel
                                htmlFor="edit_badge_text"
                                value="Badge Text (Optional)"
                                className="text-gray-700 dark:text-gray-300"
                            />
                            <TextInput
                                id="edit_badge_text"
                                type="text"
                                className="mt-1 block w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                value={editForm.data.badge_text}
                                onChange={(e) =>
                                    editForm.setData(
                                        'badge_text',
                                        e.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={editForm.errors.badge_text}
                                className="mt-2"
                            />
                        </div>

                        <div className="mb-4 flex items-center">
                            <Checkbox
                                id="edit_is_popular"
                                checked={editForm.data.is_popular}
                                onChange={(e) =>
                                    editForm.setData(
                                        'is_popular',
                                        e.target.checked,
                                    )
                                }
                            />
                            <InputLabel
                                htmlFor="edit_is_popular"
                                value="Mark as Popular"
                                className="ml-2 text-gray-700 dark:text-gray-300"
                            />
                            <InputError
                                message={editForm.errors.is_popular}
                                className="mt-2"
                            />
                        </div>

                        <div className="mb-4 flex items-center">
                            <Checkbox
                                id="edit_is_active"
                                checked={editForm.data.is_active}
                                onChange={(e) =>
                                    editForm.setData(
                                        'is_active',
                                        e.target.checked,
                                    )
                                }
                            />
                            <InputLabel
                                htmlFor="edit_is_active"
                                value="Active"
                                className="ml-2 text-gray-700 dark:text-gray-300"
                            />
                            <InputError
                                message={editForm.errors.is_active}
                                className="mt-2"
                            />
                        </div>
                    </div>

                    {/* Fixed Footer */}
                    <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <SecondaryButton
                                onClick={() => setShowEditModal(false)}
                            >
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton
                                type="submit"
                                disabled={editForm.processing}
                            >
                                Update Plan
                            </PrimaryButton>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Delete Plan Modal */}
            <Modal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
            >
                <form
                    onSubmit={handleDeleteSubmit}
                    className="bg-white p-6 dark:bg-gray-800"
                >
                    <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                        Delete Subscription Plan
                    </h2>

                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to delete this subscription plan?
                        This action cannot be undone.
                    </p>

                    {currentPlan &&
                        (currentPlan.active_users_count || 0) > 0 && (
                            <div className="mb-4 rounded border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
                                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                                    ⚠️ Warning: This plan has{' '}
                                    {currentPlan.active_users_count} active
                                    users
                                </p>
                                <p className="mt-1 text-sm text-orange-700 dark:text-orange-300">
                                    You cannot delete a plan that has active
                                    subscriptions. Please wait for all
                                    subscriptions to expire or cancel them
                                    first.
                                </p>
                            </div>
                        )}

                    {currentPlan && (
                        <div className="mb-4 rounded border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                {currentPlan.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {getCurrencySymbol(currentPlan.currency)}{' '}
                                {currentPlan.price?.toLocaleString()} -{' '}
                                {currentPlan.duration_in_days} days
                            </p>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton
                            onClick={() => setShowDeleteModal(false)}
                            className="mr-2"
                        >
                            Cancel
                        </SecondaryButton>
                        <DangerButton
                            type="submit"
                            disabled={
                                deleteForm.processing ||
                                (currentPlan?.active_users_count || 0) > 0
                            }
                        >
                            Delete Plan
                        </DangerButton>
                    </div>
                </form>
            </Modal>

            {/* Renewal Command Modal */}
            <Modal
                show={showRenewalModal}
                onClose={() => setShowRenewalModal(false)}
            >
                <div className="bg-white p-6 dark:bg-gray-800">
                    <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                        Run Subscription Renewal Command
                    </h2>

                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        This will process the following tasks:
                    </p>

                    <ul className="mb-4 list-disc pl-5 text-sm text-gray-600 dark:text-gray-400">
                        <li>Add monthly credits to active subscriptions</li>
                        <li>
                            Process auto-renewals for subscriptions ending soon
                        </li>
                        <li>Mark expired subscriptions</li>
                    </ul>

                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to run this command now?
                    </p>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton
                            onClick={() => setShowRenewalModal(false)}
                            className="mr-2"
                        >
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton
                            onClick={runRenewalCommand}
                            disabled={runRenewalForm.processing}
                        >
                            {runRenewalForm.processing
                                ? 'Processing...'
                                : 'Run Command'}
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}

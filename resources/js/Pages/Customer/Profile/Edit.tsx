import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import CustomerLayout from '@/Layouts/Customer/CustomerLayout';
import { PageProps } from '@/types/index';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';
import { toast } from 'sonner';

interface UserAddress {
    id: number;
    street: string;
    unit_number?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
    address_type: string;
    is_primary: boolean;
}

interface ConnectedBusiness {
    id: number;
    business: {
        id: number;
        name: string;
        email: string;
        project_identifier?: string;
    };
    relationship_type: string;
    total_spent: number;
    total_orders: number;
    first_purchase_at?: string;
    last_purchase_at?: string;
}

interface ProfileEditProps extends PageProps {
    address?: UserAddress;
    connectedBusinesses?: ConnectedBusiness[];
    status?: string;
}

export default function Edit({
    auth,
    address,
    connectedBusinesses = [],
    status,
}: ProfileEditProps) {
    // Account Information Form
    const {
        data: accountData,
        setData: setAccountData,
        patch: patchAccount,
        processing: processingAccount,
        errors: accountErrors,
    } = useForm({
        name: auth.user?.name || '',
        contact_number: auth.user?.contact_number || '',
    });

    // Password Form
    const {
        data: passwordData,
        setData: setPasswordData,
        put: putPassword,
        processing: processingPassword,
        errors: passwordErrors,
        reset: resetPassword,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Address Form
    const {
        data: addressData,
        setData: setAddressData,
        post: postAddress,
        processing: processingAddress,
        errors: addressErrors,
    } = useForm({
        street: address?.street || '',
        unit_number: address?.unit_number || '',
        city: address?.city || '',
        state: address?.state || '',
        postal_code: address?.postal_code || '',
        country: address?.country || '',
    });

    // Show toast notifications based on status
    useEffect(() => {
        if (status === 'profile-updated') {
            toast.success('Profile updated successfully!');
        } else if (status === 'password-updated') {
            toast.success('Password updated successfully!');
        } else if (status === 'address-updated') {
            toast.success('Address updated successfully!');
        }
    }, [status]);

    const submitAccount: FormEventHandler = (e) => {
        e.preventDefault();
        patchAccount(route('customer.profile.update'));
    };

    const submitPassword: FormEventHandler = (e) => {
        e.preventDefault();
        putPassword(route('customer.profile.password.update'), {
            onSuccess: () => resetPassword(),
        });
    };

    const submitAddress: FormEventHandler = (e) => {
        e.preventDefault();
        postAddress(route('customer.profile.address.update'));
    };

    return (
        <CustomerLayout
            auth={{
                user: auth.user,
                project: auth.project,
                modules: auth.modules,
            }}
            title="Customer Profile"
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Profile Settings
                </h2>
            }
        >
            <Head title="Customer Profile" />

            <div className="space-y-6">
                {/* Account Information */}
                <div className="overflow-hidden border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:rounded-lg">
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            Account Information
                        </h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Update your account details.
                        </p>
                    </div>
                    <form onSubmit={submitAccount} className="p-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="name" value="Name" />
                                    <TextInput
                                        id="name"
                                        className="mt-1 block w-full"
                                        value={accountData.name}
                                        onChange={(e) =>
                                            setAccountData(
                                                'name',
                                                e.target.value,
                                            )
                                        }
                                        required
                                        autoComplete="name"
                                    />
                                    <InputError
                                        message={accountErrors.name}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="email" value="Email" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full bg-gray-100 dark:bg-gray-600"
                                        value={auth.user?.email || ''}
                                        disabled
                                        autoComplete="email"
                                    />
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Email cannot be changed.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="contact_number"
                                    value="Phone Number"
                                />
                                <TextInput
                                    id="contact_number"
                                    type="tel"
                                    className="mt-1 block w-full"
                                    value={accountData.contact_number}
                                    onChange={(e) =>
                                        setAccountData(
                                            'contact_number',
                                            e.target.value,
                                        )
                                    }
                                    required
                                    autoComplete="tel"
                                    placeholder="+1 (555) 123-4567"
                                />
                                <InputError
                                    message={accountErrors.contact_number}
                                    className="mt-2"
                                />
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Accepts formats: +1 (555) 123-4567,
                                    +1-555-123-4567, 555-123-4567
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <PrimaryButton disabled={processingAccount}>
                                    {processingAccount
                                        ? 'Saving...'
                                        : 'Save Changes'}
                                </PrimaryButton>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Update Password */}
                <div className="overflow-hidden border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:rounded-lg">
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            Update Password
                        </h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Ensure your account is using a long, random password
                            to stay secure.
                        </p>
                    </div>
                    <form onSubmit={submitPassword} className="p-6">
                        <div className="space-y-4">
                            <div>
                                <InputLabel
                                    htmlFor="current_password"
                                    value="Current Password"
                                />
                                <TextInput
                                    id="current_password"
                                    type="password"
                                    className="mt-1 block w-full"
                                    value={passwordData.current_password}
                                    onChange={(e) =>
                                        setPasswordData(
                                            'current_password',
                                            e.target.value,
                                        )
                                    }
                                    autoComplete="current-password"
                                />
                                <InputError
                                    message={passwordErrors.current_password}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                <div>
                                    <InputLabel
                                        htmlFor="password"
                                        value="New Password"
                                    />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        className="mt-1 block w-full"
                                        value={passwordData.password}
                                        onChange={(e) =>
                                            setPasswordData(
                                                'password',
                                                e.target.value,
                                            )
                                        }
                                        autoComplete="new-password"
                                    />
                                    <InputError
                                        message={passwordErrors.password}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="password_confirmation"
                                        value="Confirm Password"
                                    />
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        className="mt-1 block w-full"
                                        value={
                                            passwordData.password_confirmation
                                        }
                                        onChange={(e) =>
                                            setPasswordData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        autoComplete="new-password"
                                    />
                                    <InputError
                                        message={
                                            passwordErrors.password_confirmation
                                        }
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <PrimaryButton disabled={processingPassword}>
                                    {processingPassword
                                        ? 'Updating...'
                                        : 'Update Password'}
                                </PrimaryButton>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Update Address */}
                <div className="overflow-hidden border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:rounded-lg">
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            Primary Address
                        </h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Update your primary address for shipping and
                            billing.
                        </p>
                    </div>
                    <form onSubmit={submitAddress} className="p-6">
                        <div className="space-y-4">
                            {/* Street and Unit */}
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                                <div className="lg:col-span-2">
                                    <InputLabel
                                        htmlFor="street"
                                        value="Street Address"
                                    />
                                    <TextInput
                                        id="street"
                                        className="mt-1 block w-full"
                                        value={addressData.street}
                                        onChange={(e) =>
                                            setAddressData(
                                                'street',
                                                e.target.value,
                                            )
                                        }
                                        required
                                        autoComplete="street-address"
                                        placeholder="123 Main Street"
                                    />
                                    <InputError
                                        message={addressErrors.street}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="lg:col-span-1">
                                    <InputLabel
                                        htmlFor="unit_number"
                                        value="Unit/Apt (Optional)"
                                    />
                                    <TextInput
                                        id="unit_number"
                                        className="mt-1 block w-full"
                                        value={addressData.unit_number}
                                        onChange={(e) =>
                                            setAddressData(
                                                'unit_number',
                                                e.target.value,
                                            )
                                        }
                                        autoComplete="address-line2"
                                        placeholder="Apt 4B"
                                    />
                                    <InputError
                                        message={addressErrors.unit_number}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            {/* City and State */}
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="city" value="City" />
                                    <TextInput
                                        id="city"
                                        className="mt-1 block w-full"
                                        value={addressData.city}
                                        onChange={(e) =>
                                            setAddressData(
                                                'city',
                                                e.target.value,
                                            )
                                        }
                                        required
                                        autoComplete="address-level2"
                                        placeholder="New York"
                                    />
                                    <InputError
                                        message={addressErrors.city}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="state"
                                        value="State/Province"
                                    />
                                    <TextInput
                                        id="state"
                                        className="mt-1 block w-full"
                                        value={addressData.state}
                                        onChange={(e) =>
                                            setAddressData(
                                                'state',
                                                e.target.value,
                                            )
                                        }
                                        required
                                        autoComplete="address-level1"
                                        placeholder="NY"
                                    />
                                    <InputError
                                        message={addressErrors.state}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            {/* Postal Code and Country */}
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                <div>
                                    <InputLabel
                                        htmlFor="postal_code"
                                        value="Postal Code"
                                    />
                                    <TextInput
                                        id="postal_code"
                                        className="mt-1 block w-full"
                                        value={addressData.postal_code}
                                        onChange={(e) =>
                                            setAddressData(
                                                'postal_code',
                                                e.target.value,
                                            )
                                        }
                                        required
                                        autoComplete="postal-code"
                                        placeholder="10001"
                                    />
                                    <InputError
                                        message={addressErrors.postal_code}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="country"
                                        value="Country"
                                    />
                                    <TextInput
                                        id="country"
                                        className="mt-1 block w-full"
                                        value={addressData.country}
                                        onChange={(e) =>
                                            setAddressData(
                                                'country',
                                                e.target.value,
                                            )
                                        }
                                        required
                                        autoComplete="country"
                                        placeholder="United States"
                                    />
                                    <InputError
                                        message={addressErrors.country}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <PrimaryButton disabled={processingAddress}>
                                    {processingAddress
                                        ? 'Updating...'
                                        : 'Update Address'}
                                </PrimaryButton>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Connected Businesses */}
                {connectedBusinesses.length > 0 && (
                    <div className="overflow-hidden border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:rounded-lg">
                        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-700">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                My Businesses
                            </h3>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Businesses you're connected to as a customer.
                            </p>
                        </div>
                        <div className="p-6">
                            <div className="space-y-3">
                                {connectedBusinesses.map((connection) => (
                                    <div
                                        key={connection.id}
                                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                                                <span className="text-lg font-medium text-indigo-600 dark:text-indigo-300">
                                                    {connection.business.name
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {connection.business.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {connection.business.email}
                                                </p>
                                                {connection.business
                                                    .project_identifier && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {
                                                            connection.business
                                                                .project_identifier
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {connection.total_orders}{' '}
                                                {connection.total_orders === 1
                                                    ? 'Order'
                                                    : 'Orders'}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Total: $
                                                {Number(
                                                    connection.total_spent,
                                                ).toFixed(2)}
                                            </p>
                                            {connection.last_purchase_at && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Last:{' '}
                                                    {new Date(
                                                        connection.last_purchase_at,
                                                    ).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}

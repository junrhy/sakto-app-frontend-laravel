import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { useForm } from '@inertiajs/react';
import {
    AlertCircle,
    Building,
    CheckCircle,
    Home,
    MapPin,
    Phone,
    Plus,
    Star,
    X,
} from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface Props {
    className?: string;
    addresses: Address[];
    hideHeader?: boolean;
}

interface Address {
    id?: number;
    address_type: string;
    street: string;
    unit_number?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_primary?: boolean;
    phone?: string;
}

interface Errors {
    [key: string]: string | undefined;
}

const ADDRESS_TYPES = ['Home', 'Office', 'Other'];

const getAddressTypeIcon = (type: string) => {
    switch (type) {
        case 'Home':
            return <Home className="h-4 w-4" />;
        case 'Office':
            return <Building className="h-4 w-4" />;
        default:
            return <MapPin className="h-4 w-4" />;
    }
};

export default function UpdateAddressesForm({
    className = '',
    addresses = [],
    hideHeader = false,
}: Props) {
    const [alert, setAlert] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    const { data, setData, post, processing, errors } = useForm<{
        addresses: Address[];
    }>({
        addresses: addresses.length
            ? addresses
            : [
                  {
                      address_type: 'Home',
                      street: '',
                      unit_number: '',
                      city: '',
                      state: '',
                      postal_code: '',
                      country: '',
                      is_primary: false,
                      phone: '',
                  },
              ],
    });

    const addAddress = () => {
        setData('addresses', [
            ...data.addresses,
            {
                address_type: 'Home',
                street: '',
                unit_number: '',
                city: '',
                state: '',
                postal_code: '',
                country: '',
                is_primary: false,
                phone: '',
            },
        ]);
    };

    const removeAddress = (index: number) => {
        if (data.addresses.length === 1) return;
        const newAddresses = [...data.addresses];
        newAddresses.splice(index, 1);
        setData('addresses', newAddresses);
    };

    const updateAddress = (
        index: number,
        field: keyof Address,
        value: string | boolean,
    ) => {
        const newAddresses = [...data.addresses];
        newAddresses[index] = {
            ...newAddresses[index],
            [field]: value,
        };

        if (field === 'is_primary' && value === true) {
            newAddresses.forEach((addr, i) => {
                if (i !== index) {
                    addr.is_primary = false;
                }
            });
        }

        setData('addresses', newAddresses);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setAlert(null);

        post(route('profile.addresses.update'), {
            onSuccess: () => {
                setAlert({
                    type: 'success',
                    message: 'Addresses updated successfully.',
                });
            },
            onError: () => {
                setAlert({
                    type: 'error',
                    message:
                        'There was an error updating your addresses. Please try again.',
                });
            },
        });
    };

    const getError = (
        index: number,
        field: keyof Address,
    ): string | undefined => {
        return errors[`addresses.${index}.${field}` as keyof typeof errors];
    };

    return (
        <section
            className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900 dark:backdrop-blur-md ${className}`}
        >
            {!hideHeader && (
                <div className="border-b border-gray-200 bg-gradient-to-r from-green-50 via-emerald-50 to-green-100 px-6 py-5 dark:border-gray-800 dark:from-gray-800 dark:via-green-900/20 dark:to-emerald-900/20">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 ring-1 ring-green-200 dark:bg-green-900/50 dark:ring-green-800">
                                <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Delivery Addresses
                            </h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                Manage your delivery addresses. You can add
                                multiple addresses and set one as primary.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {alert && (
                <div
                    className={`mx-6 mt-6 rounded-lg border p-4 backdrop-blur-sm ${
                        alert.type === 'success'
                            ? 'border-green-200 bg-green-50/80 dark:border-green-800/50 dark:bg-green-900/30'
                            : 'border-red-200 bg-red-50/80 dark:border-red-800/50 dark:bg-red-900/30'
                    }`}
                >
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            {alert.type === 'success' ? (
                                <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p
                                className={`text-sm font-medium ${
                                    alert.type === 'success'
                                        ? 'text-green-800 dark:text-green-200'
                                        : 'text-red-800 dark:text-red-200'
                                }`}
                            >
                                {alert.message}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={submit} className="space-y-6 p-6">
                {data.addresses.map((address, index) => (
                    <div
                        key={index}
                        className={`relative rounded-xl border-2 p-6 backdrop-blur-sm transition-all duration-200 ${
                            address.is_primary
                                ? 'border-green-500 bg-green-50/50 dark:border-green-400 dark:bg-green-900/10'
                                : 'border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/50'
                        }`}
                    >
                        {address.is_primary && (
                            <div className="absolute -top-3 left-4 flex items-center space-x-1 rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white shadow-lg dark:bg-green-600">
                                <Star className="h-3 w-3" />
                                <span>Primary</span>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => removeAddress(index)}
                            className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition-all duration-200 hover:bg-red-50 hover:text-red-500 dark:text-gray-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                            title="Remove address"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
                            <div className="col-span-1 md:col-span-1">
                                <InputLabel
                                    htmlFor={`address_type-${index}`}
                                    value="Address Type"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                                />
                                <Listbox
                                    value={address.address_type}
                                    onChange={(value) =>
                                        updateAddress(
                                            index,
                                            'address_type',
                                            value,
                                        )
                                    }
                                >
                                    <div className="relative mt-1">
                                        <Listbox.Button className="relative w-full cursor-default rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-left shadow-sm transition-all duration-200 hover:border-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600">
                                            <div className="flex items-center space-x-2">
                                                <div className="text-gray-400 dark:text-gray-500">
                                                    {getAddressTypeIcon(
                                                        address.address_type,
                                                    )}
                                                </div>
                                                <span className="block truncate">
                                                    {address.address_type}
                                                </span>
                                            </div>
                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                <ChevronUpDownIcon
                                                    className="h-5 w-5 text-gray-400"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                        </Listbox.Button>
                                        <Transition
                                            leave="transition ease-in duration-100"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                        >
                                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:border-gray-700 dark:bg-gray-800">
                                                {ADDRESS_TYPES.map((type) => (
                                                    <Listbox.Option
                                                        key={type}
                                                        value={type}
                                                        className={({
                                                            active,
                                                        }) =>
                                                            `relative cursor-default select-none py-2 pl-10 pr-9 ${
                                                                active
                                                                    ? 'bg-green-600 text-white'
                                                                    : 'text-gray-900 dark:text-white'
                                                            }`
                                                        }
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <div className="text-gray-400">
                                                                {getAddressTypeIcon(
                                                                    type,
                                                                )}
                                                            </div>
                                                            <span>{type}</span>
                                                        </div>
                                                    </Listbox.Option>
                                                ))}
                                            </Listbox.Options>
                                        </Transition>
                                    </div>
                                </Listbox>
                                <InputError
                                    message={getError(index, 'address_type')}
                                    className="mt-1"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-5">
                                <InputLabel
                                    htmlFor={`street-${index}`}
                                    value="Street Address"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                                />
                                <div className="group relative mt-1">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <MapPin className="h-4 w-4 text-gray-400 transition-colors duration-200 group-focus-within:text-green-500 dark:text-gray-500 dark:group-focus-within:text-green-400" />
                                    </div>
                                    <TextInput
                                        id={`street-${index}`}
                                        type="text"
                                        className="block w-full rounded-lg border-gray-300 pl-10 transition-all duration-200 hover:border-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:hover:border-gray-600"
                                        value={address.street}
                                        onChange={(e) =>
                                            updateAddress(
                                                index,
                                                'street',
                                                e.target.value,
                                            )
                                        }
                                        required
                                        placeholder="Enter street address"
                                    />
                                </div>
                                <InputError
                                    message={getError(index, 'street')}
                                    className="mt-1"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-1">
                                <InputLabel
                                    htmlFor={`unit_number-${index}`}
                                    value="Unit/Apartment"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                                />
                                <TextInput
                                    id={`unit_number-${index}`}
                                    type="text"
                                    className="mt-1 block w-full rounded-lg border-gray-300 transition-all duration-200 hover:border-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:hover:border-gray-600"
                                    value={address.unit_number}
                                    onChange={(e) =>
                                        updateAddress(
                                            index,
                                            'unit_number',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Unit #"
                                />
                                <InputError
                                    message={getError(index, 'unit_number')}
                                    className="mt-1"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-1">
                                <InputLabel
                                    htmlFor={`city-${index}`}
                                    value="City"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                                />
                                <TextInput
                                    id={`city-${index}`}
                                    type="text"
                                    className="mt-1 block w-full rounded-lg border-gray-300 transition-all duration-200 hover:border-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:hover:border-gray-600"
                                    value={address.city}
                                    onChange={(e) =>
                                        updateAddress(
                                            index,
                                            'city',
                                            e.target.value,
                                        )
                                    }
                                    required
                                    placeholder="City"
                                />
                                <InputError
                                    message={getError(index, 'city')}
                                    className="mt-1"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-1">
                                <InputLabel
                                    htmlFor={`state-${index}`}
                                    value="State/Province"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                                />
                                <TextInput
                                    id={`state-${index}`}
                                    type="text"
                                    className="mt-1 block w-full rounded-lg border-gray-300 transition-all duration-200 hover:border-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:hover:border-gray-600"
                                    value={address.state}
                                    onChange={(e) =>
                                        updateAddress(
                                            index,
                                            'state',
                                            e.target.value,
                                        )
                                    }
                                    required
                                    placeholder="State"
                                />
                                <InputError
                                    message={getError(index, 'state')}
                                    className="mt-1"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-1">
                                <InputLabel
                                    htmlFor={`postal_code-${index}`}
                                    value="Postal Code"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                                />
                                <TextInput
                                    id={`postal_code-${index}`}
                                    type="text"
                                    className="mt-1 block w-full rounded-lg border-gray-300 transition-all duration-200 hover:border-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:hover:border-gray-600"
                                    value={address.postal_code}
                                    onChange={(e) =>
                                        updateAddress(
                                            index,
                                            'postal_code',
                                            e.target.value,
                                        )
                                    }
                                    required
                                    placeholder="Postal code"
                                />
                                <InputError
                                    message={getError(index, 'postal_code')}
                                    className="mt-1"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-1">
                                <InputLabel
                                    htmlFor={`country-${index}`}
                                    value="Country"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                                />
                                <TextInput
                                    id={`country-${index}`}
                                    type="text"
                                    className="mt-1 block w-full rounded-lg border-gray-300 transition-all duration-200 hover:border-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:hover:border-gray-600"
                                    value={address.country}
                                    onChange={(e) =>
                                        updateAddress(
                                            index,
                                            'country',
                                            e.target.value,
                                        )
                                    }
                                    required
                                    placeholder="Country"
                                />
                                <InputError
                                    message={getError(index, 'country')}
                                    className="mt-1"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-1">
                                <InputLabel
                                    htmlFor={`phone-${index}`}
                                    value="Contact Phone"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                                />
                                <div className="group relative mt-1">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Phone className="h-4 w-4 text-gray-400 transition-colors duration-200 group-focus-within:text-green-500 dark:text-gray-500 dark:group-focus-within:text-green-400" />
                                    </div>
                                    <TextInput
                                        id={`phone-${index}`}
                                        type="tel"
                                        className="block w-full rounded-lg border-gray-300 pl-10 transition-all duration-200 hover:border-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:hover:border-gray-600"
                                        value={address.phone}
                                        onChange={(e) =>
                                            updateAddress(
                                                index,
                                                'phone',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Phone number"
                                    />
                                </div>
                                <InputError
                                    message={getError(index, 'phone')}
                                    className="mt-1"
                                />
                            </div>

                            <div className="col-span-1 flex items-center pt-2 md:col-span-6">
                                <label className="group flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        checked={address.is_primary}
                                        onChange={(e) =>
                                            updateAddress(
                                                index,
                                                'is_primary',
                                                e.target.checked,
                                            )
                                        }
                                        className="rounded border-gray-300 text-green-600 shadow-sm focus:ring-green-500 dark:border-gray-600 dark:bg-gray-800 dark:checked:border-green-600 dark:checked:bg-green-600"
                                    />
                                    <span className="ml-3 text-sm text-gray-700 transition-colors duration-200 group-hover:text-green-600 dark:text-gray-300 dark:group-hover:text-green-400">
                                        Set as primary address
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-800">
                    <SecondaryButton
                        type="button"
                        onClick={addAddress}
                        className="inline-flex items-center space-x-2 rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Another Address</span>
                    </SecondaryButton>

                    <PrimaryButton
                        disabled={processing}
                        className="transform rounded-lg bg-green-600 px-6 py-2.5 font-medium shadow-lg transition-all duration-200 hover:scale-105 hover:bg-green-700 focus:ring-green-500 dark:bg-green-600 dark:shadow-green-900/25 dark:hover:bg-green-700 dark:focus:ring-green-500"
                    >
                        {processing ? 'Saving...' : 'Save Addresses'}
                    </PrimaryButton>
                </div>
            </form>
        </section>
    );
}

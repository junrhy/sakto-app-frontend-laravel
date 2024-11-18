import { FormEventHandler, useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import SecondaryButton from '@/Components/SecondaryButton';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';

interface Props {
    className?: string;
    addresses: Address[];
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

const ADDRESS_TYPES = [
    'Home',
    'Office',
    'Other'
];

export default function UpdateAddressesForm({ className = '', addresses = [] }: Props) {
    const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const { data, setData, post, processing, errors } = useForm<{ addresses: Address[] }>({
        addresses: addresses.length ? addresses : [{
            address_type: 'Home',
            street: '',
            unit_number: '',
            city: '',
            state: '',
            postal_code: '',
            country: '',
            is_primary: false,
            phone: ''
        }]
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
                phone: ''
            }
        ]);
    };

    const removeAddress = (index: number) => {
        if (data.addresses.length === 1) return;
        const newAddresses = [...data.addresses];
        newAddresses.splice(index, 1);
        setData('addresses', newAddresses);
    };

    const updateAddress = (index: number, field: keyof Address, value: string | boolean) => {
        const newAddresses = [...data.addresses];
        newAddresses[index] = {
            ...newAddresses[index],
            [field]: value
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
                    message: 'Addresses updated successfully.'
                });
            },
            onError: () => {
                setAlert({
                    type: 'error',
                    message: 'There was an error updating your addresses. Please try again.'
                });
            }
        });
    };

    const getError = (index: number, field: keyof Address): string | undefined => {
        return errors[`addresses.${index}.${field}` as keyof typeof errors];
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Delivery Addresses
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Manage your delivery addresses. You can add multiple addresses and set one as primary.
                </p>
            </header>

            {alert && (
                <div className={`mt-4 p-4 rounded-md ${
                    alert.type === 'success' 
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300' 
                        : 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                }`}>
                    {alert.message}
                </div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-6">
                {data.addresses.map((address, index) => (
                    <div key={index} className={`relative rounded-lg border p-4 ${
                        address.is_primary 
                            ? 'border-indigo-500 dark:border-indigo-400' 
                            : 'border-gray-200 dark:border-gray-700'
                    }`}>
                        <button
                            type="button"
                            onClick={() => removeAddress(index)}
                            className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
                            title="Remove address"
                        >
                            <span className="text-xl">×</span>
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="col-span-1 md:col-span-1">
                                <InputLabel htmlFor={`address_type-${index}`} value="Address Type" />
                                <Listbox
                                    value={address.address_type}
                                    onChange={(value) => updateAddress(index, 'address_type', value)}
                                >
                                    <div className="relative mt-1">
                                        <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                            <span className="block truncate">{address.address_type}</span>
                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                            </span>
                                        </Listbox.Button>
                                        <Transition
                                            leave="transition ease-in duration-100"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                        >
                                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                {ADDRESS_TYPES.map((type) => (
                                                    <Listbox.Option
                                                        key={type}
                                                        value={type}
                                                        className={({ active }) =>
                                                            `relative cursor-default select-none py-2 pl-3 pr-9 ${
                                                                active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                                                            }`
                                                        }
                                                    >
                                                        {type}
                                                    </Listbox.Option>
                                                ))}
                                            </Listbox.Options>
                                        </Transition>
                                    </div>
                                </Listbox>
                                <InputError message={getError(index, 'address_type')} className="mt-2" />
                            </div>

                            <div className="col-span-1 md:col-span-5">
                                <InputLabel htmlFor={`street-${index}`} value="Street Address" />
                                <TextInput
                                    id={`street-${index}`}
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={address.street}
                                    onChange={(e) => updateAddress(index, 'street', e.target.value)}
                                    required
                                />
                                <InputError message={getError(index, 'street')} className="mt-2" />
                            </div>

                            <div className="col-span-1 md:col-span-1">
                                <InputLabel htmlFor={`unit_number-${index}`} value="Unit/Apartment Number" />
                                <TextInput
                                    id={`unit_number-${index}`}
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={address.unit_number}
                                    onChange={(e) => updateAddress(index, 'unit_number', e.target.value)}
                                />
                                <InputError message={getError(index, 'unit_number')} className="mt-2" />
                            </div>

                            <div className="col-span-1 md:col-span-1">
                                <InputLabel htmlFor={`city-${index}`} value="City" />
                                <TextInput
                                    id={`city-${index}`}
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={address.city}
                                    onChange={(e) => updateAddress(index, 'city', e.target.value)}
                                    required
                                />
                                <InputError message={getError(index, 'city')} className="mt-2" />
                            </div>

                            <div className="col-span-1 md:col-span-1">
                                <InputLabel htmlFor={`state-${index}`} value="State/Province" />
                                <TextInput
                                    id={`state-${index}`}
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={address.state}
                                    onChange={(e) => updateAddress(index, 'state', e.target.value)}
                                    required
                                />
                                <InputError message={getError(index, 'state')} className="mt-2" />
                            </div>

                            <div className="col-span-1 md:col-span-1">
                                <InputLabel htmlFor={`postal_code-${index}`} value="Postal Code" />
                                <TextInput
                                    id={`postal_code-${index}`}
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={address.postal_code}
                                    onChange={(e) => updateAddress(index, 'postal_code', e.target.value)}
                                    required
                                />
                                <InputError message={getError(index, 'postal_code')} className="mt-2" />
                            </div>

                            <div className="col-span-1 md:col-span-1">
                                <InputLabel htmlFor={`country-${index}`} value="Country" />
                                <TextInput
                                    id={`country-${index}`}
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={address.country}
                                    onChange={(e) => updateAddress(index, 'country', e.target.value)}
                                    required
                                />
                                <InputError message={getError(index, 'country')} className="mt-2" />
                            </div>

                            <div className="col-span-1 md:col-span-1">
                                <InputLabel htmlFor={`phone-${index}`} value="Contact Phone" />
                                <TextInput
                                    id={`phone-${index}`}
                                    type="tel"
                                    className="mt-1 block w-full"
                                    value={address.phone}
                                    onChange={(e) => updateAddress(index, 'phone', e.target.value)}
                                />
                                <InputError message={getError(index, 'phone')} className="mt-2" />
                            </div>

                            <div className="col-span-1 md:col-span-6 flex items-center">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={address.is_primary}
                                        onChange={(e) => updateAddress(index, 'is_primary', e.target.checked)}
                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                        Set as primary address
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="flex items-center gap-4">
                    <SecondaryButton type="button" onClick={addAddress}>
                        Add Another Address
                    </SecondaryButton>

                    <PrimaryButton disabled={processing}>
                        Save Addresses
                    </PrimaryButton>
                </div>
            </form>
        </section>
    );
} 
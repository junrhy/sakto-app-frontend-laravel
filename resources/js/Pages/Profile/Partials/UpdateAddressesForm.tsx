import { useState, FormEventHandler } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import SecondaryButton from '@/Components/SecondaryButton';

interface Props {
    className?: string;
    addresses: Address[];
}

interface Address {
    id?: number;
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_primary?: boolean;
}

interface Errors {
    [key: string]: string | undefined;
}

export default function UpdateAddressesForm({ className = '', addresses = [] }: Props) {
    const { data, setData, post, processing, errors } = useForm<{ addresses: Address[] }>({
        addresses: addresses.length ? addresses : [{
            street: '',
            city: '',
            state: '',
            postal_code: '',
            country: '',
            is_primary: false
        }]
    });

    const addAddress = () => {
        setData('addresses', [
            ...data.addresses,
            {
                street: '',
                city: '',
                state: '',
                postal_code: '',
                country: '',
                is_primary: false
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

        // If setting an address as primary, unset others
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
        post(route('profile.addresses.update'));
    };

    // Helper function to type-safe the error access
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

            <form onSubmit={submit} className="mt-6 space-y-6">
                {data.addresses.map((address, index) => (
                    <div 
                        key={index} 
                        className={`relative rounded-lg border p-4 ${
                            address.is_primary 
                                ? 'border-indigo-500 dark:border-indigo-400' 
                                : 'border-gray-200 dark:border-gray-700'
                        }`}
                    >
                        <button
                            type="button"
                            onClick={() => removeAddress(index)}
                            className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
                            title="Remove address"
                        >
                            <span className="text-xl">×</span>
                        </button>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
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

                            <div>
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

                            <div>
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

                            <div>
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

                            <div>
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

                            <div className="flex items-center">
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
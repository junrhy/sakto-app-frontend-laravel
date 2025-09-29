import AppointmentBookingForm from '@/Components/AppointmentBookingForm';
import {
    faCalendarAlt,
    faClock,
    faEnvelope,
    faMapMarkerAlt,
    faPhone,
    faUserMd,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, Link } from '@inertiajs/react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface Clinic {
    id: number;
    name: string;
    email: string;
    contact_number: string;
    app_currency: string;
    created_at: string;
    identifier: string;
    slug: string;
    user_addresses?: Array<{
        id: number;
        address: string;
        city: string;
        province: string;
        postal_code: string;
        is_primary: boolean;
    }>;
}

interface ClinicInfo {
    services: Array<{
        id: number;
        name: string;
        description: string;
        price: number;
        duration: number;
    }>;
    doctors: Array<{
        id: number;
        name: string;
        specialization: string;
        experience: number;
        education: string;
        image?: string;
    }>;
    hours: Array<{
        day: string;
        open_time: string;
        close_time: string;
        is_closed: boolean;
    }>;
    contact: {
        address: string;
        city: string;
        province: string;
        postal_code: string;
        phone: string;
        email: string;
        website?: string;
    };
    about: string;
}

interface PageProps {
    clinic: Clinic;
    clinicInfo: ClinicInfo;
    canLogin: boolean;
    canRegister: boolean;
    auth: {
        user: {
            name: string;
            email: string;
        } | null;
    };
}

export default function MedicalShow({
    clinic,
    clinicInfo,
    canLogin,
    canRegister,
    auth,
}: PageProps) {
    const [showBookingForm, setShowBookingForm] = useState(false);

    const handleBookingSuccess = () => {
        setShowBookingForm(false);
        toast.success(
            'Appointment booked successfully! We will contact you to confirm.',
        );
    };

    return (
        <React.Fragment>
            <Head title={`${clinic.name} - Book Appointment`} />
            <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-100">
                {/* Header */}
                <div className="border-b border-teal-700 bg-gradient-to-r from-teal-800 to-emerald-900 shadow-lg">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <div className="rounded-lg bg-teal-800 p-2">
                                        <FontAwesomeIcon
                                            icon={faUserMd}
                                            className="h-6 w-6 text-white"
                                        />
                                    </div>
                                </div>
                                <h1 className="text-xl font-bold text-white">
                                    {clinic.name}
                                </h1>
                            </div>
                            <div className="hidden items-center space-x-6 md:flex">
                                {auth.user ? (
                                    <Link
                                        href={route('home')}
                                        className="inline-flex items-center rounded-lg border border-teal-300 bg-white px-4 py-2 text-sm font-medium text-teal-800 shadow-sm transition-colors duration-200 hover:bg-teal-50"
                                    >
                                        My Account
                                        <svg
                                            className="ml-2 h-4 w-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                                            />
                                        </svg>
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('login', {
                                            project: 'medical',
                                        })}
                                        className="text-sm font-medium text-teal-300 transition-colors hover:text-white"
                                    >
                                        Login
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="grid gap-12 lg:grid-cols-3">
                        {/* Left Column - Booking Section */}
                        <div className="lg:col-span-2">
                            {!showBookingForm ? (
                                /* Book Appointment Section */
                                <div className="rounded-3xl bg-white p-8 shadow-2xl">
                                    <div className="text-center">
                                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600">
                                            <FontAwesomeIcon
                                                icon={faCalendarAlt}
                                                className="h-10 w-10 text-white"
                                            />
                                        </div>
                                        <h2 className="mb-4 text-3xl font-bold text-gray-900">
                                            Book Your Appointment
                                        </h2>
                                        <p className="mb-8 text-lg text-gray-600">
                                            Schedule your visit with{' '}
                                            {clinic.name} today. We're here to
                                            provide you with professional
                                            healthcare services.
                                        </p>

                                        {/* Primary Booking Button */}
                                        <div className="mb-8">
                                            <button
                                                onClick={() =>
                                                    setShowBookingForm(true)
                                                }
                                                className="inline-flex items-center rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-10 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-teal-700 hover:to-emerald-700 hover:shadow-xl"
                                            >
                                                <FontAwesomeIcon
                                                    icon={faCalendarAlt}
                                                    className="mr-3 h-5 w-5"
                                                />
                                                <span className="hidden sm:inline">
                                                    Book Appointment Now
                                                </span>
                                                <span className="sm:hidden">
                                                    Book Now
                                                </span>
                                            </button>
                                        </div>

                                        {/* Quick Contact */}
                                        {clinic.contact_number && (
                                            <div className="rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 p-6">
                                                <p className="mb-4 text-sm font-medium text-gray-700">
                                                    Need immediate assistance?
                                                </p>
                                                <a
                                                    href={`tel:${clinic.contact_number}`}
                                                    className="inline-flex items-center rounded-lg border-2 border-teal-200 bg-white px-6 py-3 text-sm font-semibold text-teal-700 shadow-sm transition-all duration-200 hover:border-teal-300 hover:bg-teal-50 hover:shadow-md"
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faPhone}
                                                        className="mr-2 h-4 w-4"
                                                    />
                                                    {clinic.contact_number}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                /* Booking Form */
                                <AppointmentBookingForm
                                    clinicId={
                                        clinic.slug || clinic.id.toString()
                                    }
                                    services={clinicInfo.services}
                                    doctors={clinicInfo.doctors}
                                    onSuccess={handleBookingSuccess}
                                    onCancel={() => setShowBookingForm(false)}
                                />
                            )}
                        </div>

                        {/* Right Column - Clinic Information */}
                        <div className="space-y-6">
                            {/* Contact Information Card */}
                            <div className="rounded-2xl bg-white p-6 shadow-lg">
                                <div className="mb-4 flex items-center">
                                    <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
                                        <FontAwesomeIcon
                                            icon={faEnvelope}
                                            className="h-5 w-5 text-teal-600"
                                        />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Contact Us
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <FontAwesomeIcon
                                            icon={faEnvelope}
                                            className="mr-3 h-4 w-4 text-teal-600"
                                        />
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                Email
                                            </p>
                                            {clinic.email ? (
                                                <a
                                                    href={`mailto:${clinic.email}`}
                                                    className="text-sm font-medium text-teal-600 hover:text-teal-700"
                                                >
                                                    {clinic.email}
                                                </a>
                                            ) : (
                                                <span className="text-sm italic text-gray-400">
                                                    Contact information not
                                                    available
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <FontAwesomeIcon
                                            icon={faPhone}
                                            className="mr-3 h-4 w-4 text-teal-600"
                                        />
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                Phone
                                            </p>
                                            {clinic.contact_number ? (
                                                <a
                                                    href={`tel:${clinic.contact_number}`}
                                                    className="text-sm font-medium text-teal-600 hover:text-teal-700"
                                                >
                                                    {clinic.contact_number}
                                                </a>
                                            ) : (
                                                <span className="text-sm italic text-gray-400">
                                                    Contact information not
                                                    available
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Address Information Card */}
                            {clinic.user_addresses &&
                                clinic.user_addresses.length > 0 && (
                                    <div className="rounded-2xl bg-white p-6 shadow-lg">
                                        <div className="mb-4 flex items-center">
                                            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                                                <FontAwesomeIcon
                                                    icon={faMapMarkerAlt}
                                                    className="h-5 w-5 text-emerald-600"
                                                />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">
                                                Location
                                            </h3>
                                        </div>
                                        <div className="space-y-4">
                                            {clinic.user_addresses.map(
                                                (address) => (
                                                    <div
                                                        key={address.id}
                                                        className="flex items-start"
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={
                                                                faMapMarkerAlt
                                                            }
                                                            className="mr-3 mt-1 h-4 w-4 text-emerald-600"
                                                        />
                                                        <div>
                                                            {address.is_primary && (
                                                                <span className="mb-1 inline-block rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                                                                    Primary
                                                                </span>
                                                            )}
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {
                                                                    address.address
                                                                }
                                                            </p>
                                                            <p className="text-xs text-gray-600">
                                                                {address.city},{' '}
                                                                {
                                                                    address.province
                                                                }{' '}
                                                                {
                                                                    address.postal_code
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Operating Hours Card */}
                            {clinicInfo.hours &&
                                clinicInfo.hours.length > 0 && (
                                    <div className="rounded-2xl bg-white p-6 shadow-lg">
                                        <div className="mb-4 flex items-center">
                                            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100">
                                                <FontAwesomeIcon
                                                    icon={faClock}
                                                    className="h-5 w-5 text-cyan-600"
                                                />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">
                                                Hours
                                            </h3>
                                        </div>
                                        <div className="space-y-2">
                                            {clinicInfo.hours.map(
                                                (hour, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between"
                                                    >
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {hour.day}
                                                        </span>
                                                        <span className="text-sm text-gray-600">
                                                            {hour.is_closed ? (
                                                                <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                                                                    Closed
                                                                </span>
                                                            ) : (
                                                                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                                                    {
                                                                        hour.open_time
                                                                    }{' '}
                                                                    -{' '}
                                                                    {
                                                                        hour.close_time
                                                                    }
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>

                    {/* About Section - Full Width */}
                    {clinicInfo.about && (
                        <div className="mt-16 rounded-3xl bg-gradient-to-r from-teal-50 to-emerald-50 p-8 shadow-lg">
                            <div className="mx-auto max-w-4xl text-center">
                                <h3 className="mb-6 text-2xl font-bold text-gray-900">
                                    About {clinic.name}
                                </h3>
                                <p className="text-lg leading-relaxed text-gray-700">
                                    {clinicInfo.about}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </React.Fragment>
    );
}

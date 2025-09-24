import { faUserMd, faCalendarAlt, faPhone } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, Link } from '@inertiajs/react';
import React, { useState } from 'react';
import AppointmentBookingForm from '@/Components/AppointmentBookingForm';
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

export default function MedicalShow({ clinic, clinicInfo, canLogin, canRegister, auth }: PageProps) {
    const [showBookingForm, setShowBookingForm] = useState(false);

    const handleBookingSuccess = () => {
        setShowBookingForm(false);
        toast.success('Appointment booked successfully! We will contact you to confirm.');
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
                            <div className="flex items-center space-x-6">
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
                                        href={route('login', { project: 'medical' })}
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
                <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
                    {!showBookingForm ? (
                        /* Book Appointment Section */
                        <div className="rounded-2xl bg-white p-12 shadow-lg">
                            <div className="text-center">
                                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-teal-100">
                                    <FontAwesomeIcon
                                        icon={faCalendarAlt}
                                        className="h-10 w-10 text-teal-600"
                                    />
                                </div>
                                <h2 className="mb-4 text-3xl font-bold text-teal-900">
                                    Book Your Appointment
                                </h2>
                                <p className="mb-8 text-lg text-gray-600">
                                    Schedule your visit with {clinic.name} today. We're here to provide you with professional healthcare services.
                                </p>
                                
                                {/* Primary Booking Button */}
                                <div className="mb-8">
                                    <button
                                        onClick={() => setShowBookingForm(true)}
                                        className="inline-flex items-center rounded-lg bg-teal-600 px-8 py-4 text-lg font-medium text-white shadow-lg transition-all duration-200 hover:bg-teal-700 hover:shadow-xl"
                                    >
                                        <FontAwesomeIcon
                                            icon={faCalendarAlt}
                                            className="mr-3 h-5 w-5"
                                        />
                                        Book Appointment Now
                                    </button>
                                </div>

                                {/* Alternative Contact */}
                                <div className="border-t border-gray-200 pt-8">
                                    <p className="mb-4 text-sm text-gray-600">
                                        Need immediate assistance? Call us directly:
                                    </p>
                                    <a
                                        href={`tel:${clinic.contact_number}`}
                                        className="inline-flex items-center rounded-lg border border-teal-300 bg-white px-6 py-3 text-sm font-medium text-teal-700 shadow-sm transition-colors duration-200 hover:bg-teal-50"
                                    >
                                        <FontAwesomeIcon
                                            icon={faPhone}
                                            className="mr-2 h-4 w-4"
                                        />
                                        {clinic.contact_number}
                                    </a>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Booking Form */
                        <AppointmentBookingForm
                            clinicId={clinic.slug || clinic.id.toString()}
                            services={clinicInfo.services}
                            doctors={clinicInfo.doctors}
                            onSuccess={handleBookingSuccess}
                            onCancel={() => setShowBookingForm(false)}
                        />
                    )}
                </div>
            </div>
        </React.Fragment>
    );
}

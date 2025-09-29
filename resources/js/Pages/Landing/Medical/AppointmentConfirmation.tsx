import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    faCalendarAlt,
    faCheckCircle,
    faClock,
    faEnvelope,
    faFilePdf,
    faPhone,
    faStethoscope,
    faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, router } from '@inertiajs/react';
import React from 'react';
import { usePDF } from 'react-to-pdf';

interface AppointmentData {
    id: number;
    patient_name: string;
    patient_email: string;
    patient_phone: string;
    appointment_date: string;
    appointment_time: string;
    service_name?: string;
    doctor_name?: string;
    notes?: string;
    preferred_language?: string;
    status: string;
    created_at: string;
}

interface ClinicData {
    id: number;
    name: string;
    email: string;
    contact_number: string;
    identifier: string;
    slug: string;
}

interface Props {
    appointment: AppointmentData;
    clinic: ClinicData;
    message: string;
}

const AppointmentConfirmation: React.FC<Props> = ({
    appointment,
    clinic,
    message,
}) => {
    const { toPDF, targetRef } = usePDF({
        filename: `appointment-confirmation-${appointment.patient_name.replace(/\s+/g, '-').toLowerCase()}-${appointment.appointment_date}.pdf`,
        page: {
            margin: 20,
            format: 'a4',
            orientation: 'portrait',
        },
        canvas: {
            mimeType: 'image/png',
            qualityRatio: 1,
        },
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    return (
        <>
            <Head title="Appointment Confirmation" />
            <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl" ref={targetRef}>
                    {/* Success Header */}
                    <div className="mb-8 text-center">
                        <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                            <FontAwesomeIcon
                                icon={faCheckCircle}
                                className="h-10 w-10 text-green-600"
                            />
                        </div>
                        <h1 className="mb-2 text-3xl font-bold text-gray-900">
                            Appointment Booked Successfully!
                        </h1>
                        <p className="text-lg text-gray-600">{message}</p>
                    </div>

                    {/* Confirmation Card */}
                    <Card className="border-gray-200 bg-white shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-teal-600 to-blue-600 text-white">
                            <CardTitle className="flex items-center text-xl">
                                <FontAwesomeIcon
                                    icon={faCalendarAlt}
                                    className="mr-3 h-6 w-6"
                                />
                                Appointment Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 p-6">
                            {/* Patient Information */}
                            <div className="space-y-4">
                                <h3 className="flex items-center text-lg font-semibold text-gray-900">
                                    <FontAwesomeIcon
                                        icon={faUser}
                                        className="mr-2 h-5 w-5 text-teal-600"
                                    />
                                    Patient Information
                                </h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">
                                            Full Name
                                        </p>
                                        <p className="text-gray-900">
                                            {appointment.patient_name}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">
                                            Phone Number
                                        </p>
                                        <p className="flex items-center text-gray-900">
                                            <FontAwesomeIcon
                                                icon={faPhone}
                                                className="mr-2 h-4 w-4 text-gray-400"
                                            />
                                            {appointment.patient_phone}
                                        </p>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <p className="text-sm font-medium text-gray-500">
                                            Email Address
                                        </p>
                                        <p className="flex items-center text-gray-900">
                                            <FontAwesomeIcon
                                                icon={faEnvelope}
                                                className="mr-2 h-4 w-4 text-gray-400"
                                            />
                                            {appointment.patient_email}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Appointment Details */}
                            <div className="space-y-4">
                                <h3 className="flex items-center text-lg font-semibold text-gray-900">
                                    <FontAwesomeIcon
                                        icon={faClock}
                                        className="mr-2 h-5 w-5 text-teal-600"
                                    />
                                    Appointment Details
                                </h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">
                                            Date
                                        </p>
                                        <p className="text-gray-900">
                                            {formatDate(
                                                appointment.appointment_date,
                                            )}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">
                                            Time
                                        </p>
                                        <p className="text-gray-900">
                                            {formatTime(
                                                appointment.appointment_time,
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Service Information */}
                            {(appointment.service_name ||
                                appointment.doctor_name) && (
                                <div className="space-y-4">
                                    <h3 className="flex items-center text-lg font-semibold text-gray-900">
                                        <FontAwesomeIcon
                                            icon={faStethoscope}
                                            className="mr-2 h-5 w-5 text-teal-600"
                                        />
                                        Service Information
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {appointment.service_name && (
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-gray-500">
                                                    Service
                                                </p>
                                                <p className="text-gray-900">
                                                    {appointment.service_name}
                                                </p>
                                            </div>
                                        )}
                                        {appointment.doctor_name && (
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-gray-500">
                                                    Preferred Doctor
                                                </p>
                                                <p className="text-gray-900">
                                                    {appointment.doctor_name}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Additional Notes */}
                            {appointment.notes && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">
                                        Additional Notes
                                    </p>
                                    <p className="rounded-md bg-gray-50 p-3 text-gray-900">
                                        {appointment.notes}
                                    </p>
                                </div>
                            )}

                            {/* Status */}
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-500">
                                    Status
                                </p>
                                <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                                    {appointment.status
                                        .charAt(0)
                                        .toUpperCase() +
                                        appointment.status.slice(1)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Clinic Information */}
                    <Card className="mt-6 border-gray-200 bg-white shadow-lg">
                        <CardContent className="p-6">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                Clinic Information
                            </h3>
                            <div className="space-y-2">
                                <p className="font-medium text-gray-900">
                                    {clinic.name}
                                </p>
                                <p className="text-gray-600">
                                    {clinic.contact_number}
                                </p>
                                <p className="text-gray-600">{clinic.email}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-col space-y-3 sm:flex-row sm:justify-center sm:space-x-3 sm:space-y-0">
                        <Button
                            onClick={() =>
                                router.visit(
                                    `/medical/clinic/${clinic.slug || clinic.identifier || clinic.id}`,
                                )
                            }
                            className="bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500"
                        >
                            <FontAwesomeIcon
                                icon={faCalendarAlt}
                                className="mr-2 h-4 w-4"
                            />
                            Book Another Appointment
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => toPDF()}
                            className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        >
                            <FontAwesomeIcon
                                icon={faFilePdf}
                                className="mr-2 h-4 w-4"
                            />
                            Export to PDF
                        </Button>
                    </div>

                    {/* Important Notes */}
                    <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <h4 className="mb-2 text-sm font-semibold text-blue-900">
                            Important Notes:
                        </h4>
                        <ul className="space-y-1 text-sm text-blue-800">
                            <li>
                                • Please arrive 15 minutes before your scheduled
                                appointment time
                            </li>
                            <li>
                                • Bring a valid ID and any relevant medical
                                records
                            </li>
                            <li>
                                • If you need to reschedule or cancel, please
                                contact us at least 24 hours in advance
                            </li>
                            <li>
                                • We will contact you to confirm your
                                appointment details
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AppointmentConfirmation;

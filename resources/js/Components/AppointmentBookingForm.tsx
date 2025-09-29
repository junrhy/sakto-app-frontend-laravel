import { LanguageSelector } from '@/Components/LanguageSelector';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import {
    faCalendarAlt,
    faClock,
    faStethoscope,
    faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { router } from '@inertiajs/react';
import React, { useState } from 'react';

interface AppointmentFormData {
    patient_name: string;
    patient_email: string;
    patient_phone: string;
    appointment_date: string;
    appointment_time: string;
    service_name: string;
    doctor_name: string;
    notes: string;
    preferred_language: string;
}

interface AppointmentFormErrors {
    patient_name?: string;
    patient_email?: string;
    patient_phone?: string;
    appointment_date?: string;
    appointment_time?: string;
    service_name?: string;
    doctor_name?: string;
    notes?: string;
    preferred_language?: string;
    general?: string;
}

interface Service {
    id: number;
    name: string;
    description: string;
    price: number;
    duration: number;
}

interface Doctor {
    id: number;
    name: string;
    specialization: string;
    experience: number;
    education: string;
    image?: string;
}

interface AppointmentBookingFormProps {
    clinicId: string;
    services: Service[];
    doctors: Doctor[];
    onSuccess?: () => void;
    onCancel?: () => void;
}

const AppointmentBookingForm: React.FC<AppointmentBookingFormProps> = ({
    clinicId,
    services,
    doctors,
    onSuccess,
    onCancel,
}) => {
    const [formData, setFormData] = useState<AppointmentFormData>({
        patient_name: '',
        patient_email: '',
        patient_phone: '',
        appointment_date: '',
        appointment_time: '',
        service_name: '',
        doctor_name: '',
        notes: '',
        preferred_language: 'English',
    });

    const [errors, setErrors] = useState<AppointmentFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (
        field: keyof AppointmentFormData,
        value: string,
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: AppointmentFormErrors = {};

        if (!formData.patient_name.trim()) {
            newErrors.patient_name = 'Patient name is required';
        }

        if (!formData.patient_email.trim()) {
            newErrors.patient_email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.patient_email)) {
            newErrors.patient_email = 'Please enter a valid email address';
        }

        if (!formData.patient_phone.trim()) {
            newErrors.patient_phone = 'Phone number is required';
        }

        if (!formData.appointment_date) {
            newErrors.appointment_date = 'Appointment date is required';
        } else {
            const selectedDate = new Date(formData.appointment_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate <= today) {
                newErrors.appointment_date =
                    'Appointment date must be in the future';
            }
        }

        if (!formData.appointment_time) {
            newErrors.appointment_time = 'Appointment time is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await router.post(
                route('medical.clinic.book-appointment', clinicId),
                formData as any,
                {
                    onSuccess: () => {
                        onSuccess?.();
                    },
                    onError: (errors) => {
                        setErrors(errors as AppointmentFormErrors);
                    },
                    onFinish: () => {
                        setIsSubmitting(false);
                    },
                },
            );
        } catch (error) {
            console.error('Error booking appointment:', error);
            setIsSubmitting(false);
        }
    };

    // Generate time slots (9 AM to 5 PM, 30-minute intervals)
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 9; hour < 17; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push(timeString);
            }
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    return (
        <Card className="mx-auto w-full max-w-2xl border-gray-200 bg-white shadow-lg">
            <CardHeader className="border-b border-gray-100 bg-white">
                <CardTitle className="flex items-center text-xl font-bold text-teal-900">
                    <FontAwesomeIcon
                        icon={faCalendarAlt}
                        className="mr-3 h-6 w-6 text-teal-600"
                    />
                    Book Your Appointment
                </CardTitle>
                <p className="text-gray-600">
                    Fill out the form below to schedule your appointment. We
                    will contact you to confirm.
                </p>
            </CardHeader>
            <CardContent className="bg-white">
                <form onSubmit={handleSubmit} className="space-y-6">
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
                                <Label
                                    htmlFor="patient_name"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Full Name *
                                </Label>
                                <Input
                                    id="patient_name"
                                    type="text"
                                    value={formData.patient_name}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'patient_name',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Enter your full name"
                                    className="border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 focus:border-teal-500 focus:ring-teal-500"
                                    maxLength={255}
                                />
                                {errors.patient_name && (
                                    <p className="text-sm text-red-600">
                                        {errors.patient_name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="patient_phone"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Phone Number *
                                </Label>
                                <Input
                                    id="patient_phone"
                                    type="tel"
                                    value={formData.patient_phone}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'patient_phone',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Enter your phone number"
                                    className="border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 focus:border-teal-500 focus:ring-teal-500"
                                    maxLength={20}
                                />
                                {errors.patient_phone && (
                                    <p className="text-sm text-red-600">
                                        {errors.patient_phone}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="patient_email"
                                className="text-sm font-medium text-gray-700"
                            >
                                Email Address *
                            </Label>
                            <Input
                                id="patient_email"
                                type="email"
                                value={formData.patient_email}
                                onChange={(e) =>
                                    handleInputChange(
                                        'patient_email',
                                        e.target.value,
                                    )
                                }
                                placeholder="Enter your email address"
                                className="border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 focus:border-teal-500 focus:ring-teal-500"
                                maxLength={255}
                            />
                            {errors.patient_email && (
                                <p className="text-sm text-red-600">
                                    {errors.patient_email}
                                </p>
                            )}
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
                                <Label
                                    htmlFor="appointment_date"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Preferred Date *
                                </Label>
                                <Input
                                    id="appointment_date"
                                    type="date"
                                    value={formData.appointment_date}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'appointment_date',
                                            e.target.value,
                                        )
                                    }
                                    min={new Date().toISOString().split('T')[0]}
                                    className="border-gray-200 bg-white text-gray-900 focus:border-teal-500 focus:ring-teal-500"
                                />
                                {errors.appointment_date && (
                                    <p className="text-sm text-red-600">
                                        {errors.appointment_date}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="appointment_time"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Preferred Time *
                                </Label>
                                <Select
                                    value={formData.appointment_time}
                                    onValueChange={(value) =>
                                        handleInputChange(
                                            'appointment_time',
                                            value,
                                        )
                                    }
                                >
                                    <SelectTrigger className="border-gray-200 bg-white text-gray-900 focus:border-teal-500 focus:ring-teal-500">
                                        <SelectValue placeholder="Select time" />
                                    </SelectTrigger>
                                    <SelectContent className="border-gray-200 bg-white">
                                        {timeSlots.map((time) => (
                                            <SelectItem
                                                key={time}
                                                value={time}
                                                className="text-gray-900 hover:bg-gray-50"
                                            >
                                                {time}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.appointment_time && (
                                    <p className="text-sm text-red-600">
                                        {errors.appointment_time}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Service and Doctor Selection */}
                    <div className="space-y-4">
                        <h3 className="flex items-center text-lg font-semibold text-gray-900">
                            <FontAwesomeIcon
                                icon={faStethoscope}
                                className="mr-2 h-5 w-5 text-teal-600"
                            />
                            Service & Doctor Information
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="service"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Service (Optional)
                                </Label>
                                <Input
                                    id="service"
                                    type="text"
                                    value={formData.service_name}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'service_name',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g., General Consultation, Dental Cleaning"
                                    className="border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 focus:border-teal-500 focus:ring-teal-500"
                                    maxLength={255}
                                />
                                {errors.service_name && (
                                    <p className="text-sm text-red-600">
                                        {errors.service_name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="preferred_doctor"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Preferred Doctor (Optional)
                                </Label>
                                <Input
                                    id="preferred_doctor"
                                    type="text"
                                    value={formData.doctor_name}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'doctor_name',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g., Dr. Smith, Dr. Johnson"
                                    className="border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 focus:border-teal-500 focus:ring-teal-500"
                                    maxLength={255}
                                />
                                {errors.doctor_name && (
                                    <p className="text-sm text-red-600">
                                        {errors.doctor_name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Additional Information
                        </h3>

                        <LanguageSelector
                            value={formData.preferred_language}
                            onValueChange={(value) =>
                                handleInputChange('preferred_language', value)
                            }
                            placeholder="Select your preferred language"
                            label="Preferred Language"
                            className=""
                        />

                        <div className="space-y-2">
                            <Label
                                htmlFor="notes"
                                className="text-sm font-medium text-gray-700"
                            >
                                Additional Notes
                            </Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) =>
                                    handleInputChange('notes', e.target.value)
                                }
                                placeholder="Any specific concerns or information you'd like us to know..."
                                className="border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 focus:border-teal-500 focus:ring-teal-500"
                                rows={3}
                                maxLength={1000}
                            />
                            {errors.notes && (
                                <p className="text-sm text-red-600">
                                    {errors.notes}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* General Error Display */}
                    {errors.general && (
                        <div className="rounded-md border border-red-200 bg-red-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg
                                        className="h-5 w-5 text-red-400"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-800">
                                        {errors.general}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Buttons */}
                    <div className="flex flex-col space-y-3 pt-4 md:flex-row md:space-x-3 md:space-y-0">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    Booking Appointment...
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon
                                        icon={faCalendarAlt}
                                        className="mr-2 h-4 w-4"
                                    />
                                    Book Appointment
                                </>
                            )}
                        </Button>

                        {onCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                className="flex-1 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default AppointmentBookingForm;

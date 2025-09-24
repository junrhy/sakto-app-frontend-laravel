import React, { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { LanguageSelector } from '@/Components/LanguageSelector';
import { faCalendarAlt, faClock, faUser, faEnvelope, faPhone, faStethoscope, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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

interface EmbeddableAppointmentFormProps {
    clinicId: string;
    apiUrl?: string;
    theme?: 'light' | 'dark';
    primaryColor?: string;
    showClinicInfo?: boolean;
    customTitle?: string;
    customSubtitle?: string;
    onSuccess?: (data: any) => void;
    onError?: (error: string) => void;
}

const EmbeddableAppointmentForm: React.FC<EmbeddableAppointmentFormProps> = ({
    clinicId,
    apiUrl = '/api/embed/appointment',
    theme = 'light',
    primaryColor = '#0d9488',
    showClinicInfo = false,
    customTitle = 'Book Your Appointment',
    customSubtitle = 'Fill out the form below to schedule your appointment. We will contact you to confirm.',
    onSuccess,
    onError,
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
    const [isSuccess, setIsSuccess] = useState(false);
    const [clinicInfo, setClinicInfo] = useState<any>(null);

    // Load clinic information if needed
    useEffect(() => {
        if (showClinicInfo) {
            fetchClinicInfo();
        }
    }, [clinicId, showClinicInfo]);

    const fetchClinicInfo = async () => {
        try {
            const response = await fetch(`${apiUrl}/clinic-info/${clinicId}`);
            if (response.ok) {
                const data = await response.json();
                setClinicInfo(data);
            }
        } catch (error) {
            console.error('Failed to fetch clinic info:', error);
        }
    };

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
                newErrors.appointment_date = 'Appointment date must be in the future';
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
        setErrors({});

        try {
            const response = await fetch(`${apiUrl}/book`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    clinic_id: clinicId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to book appointment');
            }

            setIsSuccess(true);
            onSuccess?.(data);
        } catch (error: any) {
            console.error('Error booking appointment:', error);
            setErrors({ general: error.message || 'Failed to book appointment. Please try again.' });
            onError?.(error.message || 'Failed to book appointment');
        } finally {
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

    // Theme classes
    const themeClasses = {
        light: {
            card: 'bg-white border-gray-200',
            header: 'bg-white border-b border-gray-100',
            title: 'text-teal-900',
            subtitle: 'text-gray-600',
            input: 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 focus:border-teal-500 focus:ring-teal-500',
            label: 'text-gray-700',
            button: 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500',
            sectionTitle: 'text-gray-900',
            icon: 'text-teal-600',
        },
        dark: {
            card: 'bg-gray-800 border-gray-700',
            header: 'bg-gray-800 border-b border-gray-700',
            title: 'text-white',
            subtitle: 'text-gray-300',
            input: 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400 focus:border-teal-400 focus:ring-teal-400',
            label: 'text-gray-300',
            button: 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500',
            sectionTitle: 'text-white',
            icon: 'text-teal-400',
        }
    };

    const currentTheme = themeClasses[theme];

    if (isSuccess) {
        return (
            <Card className={`w-full max-w-2xl mx-auto ${currentTheme.card} shadow-lg`}>
                <CardContent className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="w-8 h-8 text-green-600"
                        />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Appointment Booked Successfully!
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Thank you for booking your appointment. We will contact you to confirm the details.
                    </p>
                    <Button
                        onClick={() => {
                            setIsSuccess(false);
                            setFormData({
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
                        }}
                        className={currentTheme.button}
                    >
                        Book Another Appointment
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`w-full max-w-2xl mx-auto ${currentTheme.card} shadow-lg`}>
            <CardHeader className={currentTheme.header}>
                <CardTitle className={`flex items-center text-xl font-bold ${currentTheme.title}`}>
                    <FontAwesomeIcon
                        icon={faCalendarAlt}
                        className="mr-3 h-6 w-6"
                        style={{ color: primaryColor }}
                    />
                    {customTitle}
                </CardTitle>
                <p className={currentTheme.subtitle}>
                    {customSubtitle}
                </p>
            </CardHeader>
            <CardContent className="bg-white">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Patient Information */}
                    <div className="space-y-4">
                        <h3 className={`text-lg font-semibold ${currentTheme.sectionTitle} flex items-center`}>
                            <FontAwesomeIcon
                                icon={faUser}
                                className={`mr-2 h-5 w-5 ${currentTheme.icon}`}
                            />
                            Patient Information
                        </h3>
                        
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="patient_name" className={`text-sm font-medium ${currentTheme.label}`}>
                                    Full Name *
                                </Label>
                                <Input
                                    id="patient_name"
                                    type="text"
                                    value={formData.patient_name}
                                    onChange={(e) => handleInputChange('patient_name', e.target.value)}
                                    placeholder="Enter your full name"
                                    className={currentTheme.input}
                                    maxLength={255}
                                />
                                {errors.patient_name && (
                                    <p className="text-sm text-red-600">{errors.patient_name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="patient_phone" className={`text-sm font-medium ${currentTheme.label}`}>
                                    Phone Number *
                                </Label>
                                <Input
                                    id="patient_phone"
                                    type="tel"
                                    value={formData.patient_phone}
                                    onChange={(e) => handleInputChange('patient_phone', e.target.value)}
                                    placeholder="Enter your phone number"
                                    className={currentTheme.input}
                                    maxLength={20}
                                />
                                {errors.patient_phone && (
                                    <p className="text-sm text-red-600">{errors.patient_phone}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="patient_email" className={`text-sm font-medium ${currentTheme.label}`}>
                                Email Address *
                            </Label>
                            <Input
                                id="patient_email"
                                type="email"
                                value={formData.patient_email}
                                onChange={(e) => handleInputChange('patient_email', e.target.value)}
                                placeholder="Enter your email address"
                                className={currentTheme.input}
                                maxLength={255}
                            />
                            {errors.patient_email && (
                                <p className="text-sm text-red-600">{errors.patient_email}</p>
                            )}
                        </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="space-y-4">
                        <h3 className={`text-lg font-semibold ${currentTheme.sectionTitle} flex items-center`}>
                            <FontAwesomeIcon
                                icon={faClock}
                                className={`mr-2 h-5 w-5 ${currentTheme.icon}`}
                            />
                            Appointment Details
                        </h3>
                        
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="appointment_date" className={`text-sm font-medium ${currentTheme.label}`}>
                                    Preferred Date *
                                </Label>
                                <Input
                                    id="appointment_date"
                                    type="date"
                                    value={formData.appointment_date}
                                    onChange={(e) => handleInputChange('appointment_date', e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className={currentTheme.input}
                                />
                                {errors.appointment_date && (
                                    <p className="text-sm text-red-600">{errors.appointment_date}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="appointment_time" className={`text-sm font-medium ${currentTheme.label}`}>
                                    Preferred Time *
                                </Label>
                                <Select value={formData.appointment_time} onValueChange={(value) => handleInputChange('appointment_time', value)}>
                                    <SelectTrigger className={currentTheme.input}>
                                        <SelectValue placeholder="Select time" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-gray-200">
                                        {timeSlots.map((time) => (
                                            <SelectItem key={time} value={time} className="text-gray-900 hover:bg-gray-50">
                                                {time}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.appointment_time && (
                                    <p className="text-sm text-red-600">{errors.appointment_time}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Service and Doctor Selection */}
                    <div className="space-y-4">
                        <h3 className={`text-lg font-semibold ${currentTheme.sectionTitle} flex items-center`}>
                            <FontAwesomeIcon
                                icon={faStethoscope}
                                className={`mr-2 h-5 w-5 ${currentTheme.icon}`}
                            />
                            Service & Doctor Information
                        </h3>
                        
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="service" className={`text-sm font-medium ${currentTheme.label}`}>
                                    Service (Optional)
                                </Label>
                                <Input
                                    id="service"
                                    type="text"
                                    value={formData.service_name}
                                    onChange={(e) => handleInputChange('service_name', e.target.value)}
                                    placeholder="e.g., General Consultation, Dental Cleaning"
                                    className={currentTheme.input}
                                    maxLength={255}
                                />
                                {errors.service_name && (
                                    <p className="text-sm text-red-600">{errors.service_name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="preferred_doctor" className={`text-sm font-medium ${currentTheme.label}`}>
                                    Preferred Doctor (Optional)
                                </Label>
                                <Input
                                    id="preferred_doctor"
                                    type="text"
                                    value={formData.doctor_name}
                                    onChange={(e) => handleInputChange('doctor_name', e.target.value)}
                                    placeholder="e.g., Dr. Smith, Dr. Johnson"
                                    className={currentTheme.input}
                                    maxLength={255}
                                />
                                {errors.doctor_name && (
                                    <p className="text-sm text-red-600">{errors.doctor_name}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-4">
                        <h3 className={`text-lg font-semibold ${currentTheme.sectionTitle}`}>Additional Information</h3>
                        
                        <LanguageSelector
                            value={formData.preferred_language}
                            onValueChange={(value) => handleInputChange('preferred_language', value)}
                            placeholder="Select your preferred language"
                            label="Preferred Language"
                            className=""
                        />

                        <div className="space-y-2">
                            <Label htmlFor="notes" className={`text-sm font-medium ${currentTheme.label}`}>
                                Additional Notes
                            </Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                placeholder="Any specific concerns or information you'd like us to know..."
                                className={currentTheme.input}
                                rows={3}
                                maxLength={1000}
                            />
                            {errors.notes && (
                                <p className="text-sm text-red-600">{errors.notes}</p>
                            )}
                        </div>
                    </div>

                    {/* General Error Display */}
                    {errors.general && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <FontAwesomeIcon
                                        icon={faExclamationTriangle}
                                        className="h-5 w-5 text-red-400"
                                    />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-800">{errors.general}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full ${currentTheme.button}`}
                            style={{ backgroundColor: primaryColor }}
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
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default EmbeddableAppointmentForm;

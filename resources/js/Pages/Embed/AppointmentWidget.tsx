import EmbeddableAppointmentForm from '@/Components/EmbeddableAppointmentForm';
import React from 'react';

interface Props {
    clinicId: string;
    theme?: 'light' | 'dark';
    primaryColor?: string;
    showClinicInfo?: boolean;
    customTitle?: string;
    customSubtitle?: string;
}

const AppointmentWidget: React.FC<Props> = ({
    clinicId,
    theme = 'light',
    primaryColor = '#0d9488',
    showClinicInfo = false,
    customTitle = 'Book Your Appointment',
    customSubtitle = 'Fill out the form below to schedule your appointment. We will contact you to confirm.',
}) => {
    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">
            <div className="mx-auto max-w-4xl">
                <EmbeddableAppointmentForm
                    clinicId={clinicId}
                    apiUrl="/api/embed/appointment"
                    theme={theme}
                    primaryColor={primaryColor}
                    showClinicInfo={showClinicInfo}
                    customTitle={customTitle}
                    customSubtitle={customSubtitle}
                    onSuccess={(data) => {
                        console.log('Appointment booked successfully:', data);
                    }}
                    onError={(error) => {
                        console.error('Appointment booking failed:', error);
                    }}
                />
            </div>
        </div>
    );
};

export default AppointmentWidget;

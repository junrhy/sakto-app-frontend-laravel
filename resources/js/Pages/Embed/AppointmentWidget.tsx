import React from 'react';
import EmbeddableAppointmentForm from '@/Components/EmbeddableAppointmentForm';

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
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
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

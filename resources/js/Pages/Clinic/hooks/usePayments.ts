import { useState } from 'react';
import { Patient } from '../types';
import axios from 'axios';

export const usePayments = () => {
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

    const processPayment = async (patientId: string, amount: number) => {
        if (isNaN(amount) || amount <= 0) {
            return { success: false, error: 'Please enter a valid payment amount.' };
        }

        try {
            const response = await axios.post(`/clinic/patients/${patientId}/payments`, { 
                patient_id: patientId,
                payment_amount: amount,
                payment_date: new Date().toISOString(),
                payment_method: 'cash',
                payment_notes: 'Payment for bill'
            });

            return { success: true, data: response.data };
        } catch (error: any) {
            console.error('Failed to process payment:', error);
            return { 
                success: false, 
                error: error.response?.data?.message || 'Failed to process payment. Please try again.' 
            };
        }
    };

    const deletePayment = async (patientId: string, paymentId: number) => {
        try {
            await axios.delete(`/clinic/patients/${patientId}/payments/${paymentId}`);
            return { success: true };
        } catch (error) {
            console.error('Failed to delete payment:', error);
            return { success: false, error };
        }
    };

    const fetchPaymentHistory = async (patient: Patient) => {
        try {
            const response = await axios.get(`/clinic/patients/${patient.id}/payments`);
            return {
                success: true,
                data: {
                    ...patient,
                    payments: response.data.payments
                }
            };
        } catch (error) {
            console.error('Failed to fetch payment history:', error);
            return { success: false, error };
        }
    };

    return {
        isPaymentDialogOpen,
        setIsPaymentDialogOpen,
        processPayment,
        deletePayment,
        fetchPaymentHistory
    };
};

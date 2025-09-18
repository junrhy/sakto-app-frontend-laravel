import { useState } from 'react';
import { Patient } from '../types';
import axios from 'axios';

export const useBills = () => {
    const [additionalBillAmount, setAdditionalBillAmount] = useState('');
    const [additionalBillDetails, setAdditionalBillDetails] = useState('');
    const [additionalBillPatientId, setAdditionalBillPatientId] = useState<string | null>(null);
    const [isAddBillDialogOpen, setIsAddBillDialogOpen] = useState(false);

    const addBill = async (patientId: string, amount: number, details: string) => {
        try {
            const response = await axios.post(`/clinic/patients/${patientId}/bills`, {
                patient_id: patientId,
                bill_number: `BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                bill_date: new Date().toISOString(),
                bill_amount: amount,
                bill_details: details
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Failed to add bill:', error);
            return { success: false, error };
        }
    };

    const deleteBill = async (patientId: string, billId: number) => {
        try {
            await axios.delete(`/clinic/patients/${patientId}/bills/${billId}`);
            return { success: true };
        } catch (error) {
            console.error('Failed to delete bill:', error);
            return { success: false, error };
        }
    };

    const fetchBillHistory = async (patient: Patient) => {
        try {
            const response = await axios.get(`/clinic/patients/${patient.id}/bills`);
            return {
                success: true,
                data: {
                    ...patient,
                    bills: response.data.bills
                }
            };
        } catch (error) {
            console.error('Failed to fetch bill history:', error);
            return { success: false, error };
        }
    };

    const resetBillForm = () => {
        setAdditionalBillAmount('');
        setAdditionalBillDetails('');
        setAdditionalBillPatientId(null);
        setIsAddBillDialogOpen(false);
    };

    return {
        additionalBillAmount,
        setAdditionalBillAmount,
        additionalBillDetails,
        setAdditionalBillDetails,
        additionalBillPatientId,
        setAdditionalBillPatientId,
        isAddBillDialogOpen,
        setIsAddBillDialogOpen,
        addBill,
        deleteBill,
        fetchBillHistory,
        resetBillForm
    };
};

import axios from 'axios';
import { format } from 'date-fns';
import { useState } from 'react';
import { CheckupDate, NewCheckupResult, Patient } from '../types';

export const useCheckups = () => {
    const [newCheckupResult, setNewCheckupResult] = useState<NewCheckupResult>({
        checkup_date: '',
        date: '',
        diagnosis: '',
        treatment: '',
        notes: '',
    });
    const [checkupPatient, setCheckupPatient] = useState<Patient | null>(null);
    const [isCheckupDialogOpen, setIsCheckupDialogOpen] = useState(false);
    const [checkupDateTime, setCheckupDateTime] = useState<CheckupDate>({
        date: undefined,
    });

    const addCheckup = async (
        patient: Patient,
        checkupData: NewCheckupResult,
        dateTime: CheckupDate,
    ) => {
        if (!dateTime.date) {
            return { success: false, error: 'Please select a date' };
        }

        const dateStr = format(dateTime.date, 'yyyy-MM-dd');
        const combinedResult = {
            ...checkupData,
            checkup_date: dateStr,
        };

        try {
            const response = await axios.post(
                `/clinic/patients/${patient.id}/checkups`,
                combinedResult,
            );
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Failed to add checkup:', error);
            return { success: false, error };
        }
    };

    const deleteCheckup = async (patientId: string, checkupId: number) => {
        try {
            await axios.delete(
                `/clinic/patients/${patientId}/checkups/${checkupId}`,
            );
            return { success: true };
        } catch (error) {
            console.error('Failed to delete checkup:', error);
            return { success: false, error };
        }
    };

    const fetchCheckupHistory = async (patient: Patient) => {
        try {
            const response = await axios.get(
                `/clinic/patients/${patient.id}/checkups`,
            );
            return {
                success: true,
                data: {
                    ...patient,
                    checkups: response.data.checkups,
                },
            };
        } catch (error) {
            console.error('Failed to fetch checkup history:', error);
            return { success: false, error };
        }
    };

    const resetCheckupForm = () => {
        setNewCheckupResult({
            checkup_date: '',
            date: '',
            diagnosis: '',
            treatment: '',
            notes: '',
        });
        setCheckupDateTime({ date: undefined });
        setCheckupPatient(null);
        setIsCheckupDialogOpen(false);
    };

    return {
        newCheckupResult,
        setNewCheckupResult,
        checkupPatient,
        setCheckupPatient,
        isCheckupDialogOpen,
        setIsCheckupDialogOpen,
        checkupDateTime,
        setCheckupDateTime,
        addCheckup,
        deleteCheckup,
        fetchCheckupHistory,
        resetCheckupForm,
    };
};

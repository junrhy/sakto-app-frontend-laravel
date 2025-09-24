import axios from 'axios';
import { useState } from 'react';
import { EditingNextVisit } from '../types';

export const useNextVisit = () => {
    const [editingNextVisit, setEditingNextVisit] =
        useState<EditingNextVisit | null>(null);

    const updateNextVisit = async (patientId: string, date: string) => {
        try {
            const response = await axios.put(
                `/clinic/patients/${patientId}/next-visit`,
                {
                    next_visit_date: date,
                },
            );

            const nextVisitDate =
                date === 'NA' ? 'NA' : response.data.next_visit_date || date;

            return {
                success: true,
                data: {
                    next_visit_date: nextVisitDate,
                    next_visit_time: response.data.next_visit_time,
                },
            };
        } catch (error) {
            console.error('Failed to update next visit:', error);
            return { success: false, error };
        }
    };

    const openNextVisitDialog = (patientId: string, currentDate: string) => {
        setEditingNextVisit({
            patientId,
            date: currentDate,
        });
    };

    const closeNextVisitDialog = () => {
        setEditingNextVisit(null);
    };

    return {
        editingNextVisit,
        setEditingNextVisit,
        updateNextVisit,
        openNextVisitDialog,
        closeNextVisitDialog,
    };
};

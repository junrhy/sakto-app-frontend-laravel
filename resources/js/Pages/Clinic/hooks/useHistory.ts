import { useState } from 'react';
import { HistoryType, Patient } from '../types';

export const useHistory = () => {
    const [showingHistoryForPatient, setShowingHistoryForPatient] =
        useState<Patient | null>(null);
    const [activeHistoryType, setActiveHistoryType] =
        useState<HistoryType>(null);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const openHistoryDialog = (patient: Patient, type: HistoryType) => {
        setShowingHistoryForPatient(patient);
        setActiveHistoryType(type);
    };

    const closeHistoryDialog = () => {
        setShowingHistoryForPatient(null);
        setActiveHistoryType(null);
    };

    const setLoading = (loading: boolean) => {
        setIsLoadingHistory(loading);
    };

    return {
        showingHistoryForPatient,
        setShowingHistoryForPatient,
        activeHistoryType,
        setActiveHistoryType,
        isLoadingHistory,
        openHistoryDialog,
        closeHistoryDialog,
        setLoading,
    };
};

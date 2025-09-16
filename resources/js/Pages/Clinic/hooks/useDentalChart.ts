import { useState } from 'react';
import { Patient, ToothData } from '../types';
import axios from 'axios';

export const useDentalChart = () => {
    const [editingDentalChart, setEditingDentalChart] = useState<ToothData[]>([]);
    const [isDentalChartDialogOpen, setIsDentalChartDialogOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    const openDentalChartDialog = (patient: Patient) => {
        setSelectedPatient(patient);
        setEditingDentalChart(patient.dental_chart || []);
        setIsDentalChartDialogOpen(true);
    };

    const handleToothClick = (toothId: number) => {
        setEditingDentalChart((prev) =>
            prev.map((tooth) =>
                tooth.id === toothId
                    ? {
                        ...tooth,
                        status:
                            tooth.status === 'healthy'
                                ? 'decayed'
                                : tooth.status === 'decayed'
                                    ? 'filled'
                                    : tooth.status === 'filled'
                                        ? 'missing'
                                        : 'healthy',
                    }
                    : tooth
            )
        );
    };

    const saveDentalChartChanges = async () => {
        if (selectedPatient) {
            try {
                const response = await axios.put(`/clinic/patients/${selectedPatient.id}/dental-chart`, {
                    dental_chart: editingDentalChart
                });
                setIsDentalChartDialogOpen(false);
                return { success: true, data: response.data };
            } catch (error) {
                console.error('Failed to update dental chart:', error);
                return { success: false, error };
            }
        }
        return { success: false, error: 'No patient selected' };
    };

    const openPatientInfoDialog = (patient: Patient) => {
        setSelectedPatient(patient);
        setEditingDentalChart(patient.dental_chart);
    };

    return {
        editingDentalChart,
        setEditingDentalChart,
        isDentalChartDialogOpen,
        setIsDentalChartDialogOpen,
        selectedPatient,
        setSelectedPatient,
        openDentalChartDialog,
        handleToothClick,
        saveDentalChartChanges,
        openPatientInfoDialog
    };
};

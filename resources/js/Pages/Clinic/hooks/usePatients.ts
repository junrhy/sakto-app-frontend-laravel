import axios from 'axios';
import { useState } from 'react';
import { NewPatient, Patient } from '../types';

export const usePatients = (initialPatients: Patient[]) => {
    const [patients, setPatients] = useState<Patient[]>(
        initialPatients.map((patient) => ({
            ...patient,
            id: patient.id.toString(),
        })),
    );
    const [searchTerm, setSearchTerm] = useState('');
    const [nextVisitFilter, setNextVisitFilter] = useState<
        'all' | 'today' | 'tomorrow'
    >('all');
    const [currentPage, setCurrentPage] = useState(1);
    const patientsPerPage = 15;

    // Helper function to check if a date is today
    const isToday = (dateString: string): boolean => {
        if (!dateString) return false;
        const date = new Date(dateString);
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    // Helper function to check if a date is tomorrow
    const isTomorrow = (dateString: string): boolean => {
        if (!dateString) return false;
        const date = new Date(dateString);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return date.toDateString() === tomorrow.toDateString();
    };

    const filteredPatients = patients.filter((patient) => {
        // Search term filter
        const matchesSearch = patient.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());

        // Next visit filter
        let matchesNextVisit = true;
        if (nextVisitFilter === 'today') {
            matchesNextVisit = isToday(patient.next_visit_date);
        } else if (nextVisitFilter === 'tomorrow') {
            matchesNextVisit = isTomorrow(patient.next_visit_date);
        }
        // For 'all', matchesNextVisit remains true

        return matchesSearch && matchesNextVisit;
    });

    const pageCount = Math.ceil(filteredPatients.length / patientsPerPage);
    const indexOfLastPatient = currentPage * patientsPerPage;
    const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
    const currentPatients = filteredPatients.slice(
        indexOfFirstPatient,
        indexOfLastPatient,
    );

    const addPatient = async (newPatient: NewPatient) => {
        try {
            const response = await axios.post('/clinic/patients', newPatient);
            setPatients([...patients, response.data]);
            return { success: true };
        } catch (error) {
            console.error('Failed to add patient:', error);
            return { success: false, error };
        }
    };

    const updatePatient = async (editingPatient: Patient) => {
        try {
            await axios.put(
                `/clinic/patients/${editingPatient.id}`,
                editingPatient,
            );
            setPatients(
                patients.map((p) =>
                    p.id === editingPatient.id ? editingPatient : p,
                ),
            );
            return { success: true };
        } catch (error) {
            console.error('Failed to update patient:', error);
            return { success: false, error };
        }
    };

    const deletePatient = async (id: string) => {
        try {
            await axios.delete(`/clinic/patients/${id}`);
            setPatients(patients.filter((p) => p.id !== id));
            return { success: true };
        } catch (error) {
            console.error('Failed to delete patient:', error);
            return { success: false, error };
        }
    };

    const updatePatientInState = (updatedPatient: Patient) => {
        setPatients((prevPatients) =>
            prevPatients.map((p) =>
                p.id === updatedPatient.id ? updatedPatient : p,
            ),
        );
    };

    return {
        patients,
        setPatients,
        searchTerm,
        setSearchTerm,
        nextVisitFilter,
        setNextVisitFilter,
        currentPage,
        setCurrentPage,
        filteredPatients,
        currentPatients,
        pageCount,
        patientsPerPage,
        addPatient,
        updatePatient,
        deletePatient,
        updatePatientInState,
    };
};

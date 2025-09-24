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
    const [currentPage, setCurrentPage] = useState(1);
    const patientsPerPage = 15;

    const filteredPatients = patients.filter((patient) =>
        patient.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

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

import React from 'react';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { NewPatient } from '../types';

interface AddPatientFormProps {
    newPatient: NewPatient;
    setNewPatient: (patient: NewPatient) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const AddPatientForm: React.FC<AddPatientFormProps> = ({
    newPatient,
    setNewPatient,
    onSubmit
}) => {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div>
                <Label htmlFor="name" className="text-gray-900 dark:text-white">Name</Label>
                <Input
                    id="name"
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                    required
                />
            </div>
            <div>
                <Label htmlFor="dateOfBirth" className="text-gray-900 dark:text-white">Date of Birth</Label>
                <Input
                    id="dateOfBirth"
                    type="date"
                    value={newPatient.dateOfBirth}
                    onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
                    className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                    required
                />
            </div>
            <div>
                <Label htmlFor="contactNumber" className="text-gray-900 dark:text-white">Contact Number</Label>
                <Input
                    id="contactNumber"
                    value={newPatient.contactNumber}
                    onChange={(e) => setNewPatient({ ...newPatient, contactNumber: e.target.value })}
                    className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                    required
                />
            </div>
            <div>
                <Label htmlFor="email" className="text-gray-900 dark:text-white">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={newPatient.email}
                    onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                    className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                    required
                />
            </div>
            <Button type="submit">Add Patient</Button>
        </form>
    );
};

import React, { useState, useEffect } from 'react';
import { Button } from "../../../Components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../Components/ui/dialog";
import { Input } from "../../../Components/ui/input";
import { Label } from "../../../Components/ui/label";
import { Textarea } from "../../../Components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../Components/ui/select";
import { NewAppointment } from '../types/appointment';
import { Patient } from '../types';

interface AddAppointmentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (appointment: NewAppointment) => void;
    patients: Patient[];
    currency: string;
    preselectedPatient?: Patient | null;
}

export default function AddAppointmentDialog({ 
    isOpen, 
    onClose, 
    onSubmit, 
    patients,
    currency,
    preselectedPatient
}: AddAppointmentDialogProps) {
    const [appointment, setAppointment] = useState<NewAppointment>({
        patient_id: 0,
        appointment_date: '',
        appointment_time: '',
        appointment_type: 'consultation',
        notes: '',
        doctor_name: '',
        fee: undefined
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Effect to set preselected patient when dialog opens
    useEffect(() => {
        if (isOpen && preselectedPatient) {
            setAppointment(prev => ({
                ...prev,
                patient_id: parseInt(preselectedPatient.id)
            }));
        }
    }, [isOpen, preselectedPatient]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        const newErrors: Record<string, string> = {};
        
        if (!appointment.patient_id) {
            newErrors.patient_id = 'Please select a patient';
        }
        
        if (!appointment.appointment_date) {
            newErrors.appointment_date = 'Please select a date';
        }
        
        if (!appointment.appointment_time) {
            newErrors.appointment_time = 'Please select a time';
        }
        
        if (!appointment.appointment_type) {
            newErrors.appointment_type = 'Please select an appointment type';
        }

        // Check if date is in the past
        const selectedDate = new Date(appointment.appointment_date);
        const now = new Date();
        if (selectedDate < now) {
            newErrors.appointment_date = 'Appointment date cannot be in the past';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit(appointment);
        handleClose();
    };

    const handleClose = () => {
        setAppointment({
            patient_id: 0,
            appointment_date: '',
            appointment_time: '',
            appointment_type: 'consultation',
            notes: '',
            doctor_name: '',
            fee: undefined
        });
        setErrors({});
        onClose();
    };

    const appointmentTypes = [
        { value: 'consultation', label: 'Consultation' },
        { value: 'follow_up', label: 'Follow Up' },
        { value: 'emergency', label: 'Emergency' },
        { value: 'checkup', label: 'Checkup' },
        { value: 'procedure', label: 'Procedure' }
    ];

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Schedule New Appointment</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="patient_id">Patient *</Label>
                        <Select 
                            value={appointment.patient_id.toString()} 
                            onValueChange={(value) => setAppointment(prev => ({ ...prev, patient_id: parseInt(value) }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a patient" />
                            </SelectTrigger>
                            <SelectContent>
                                {patients.map((patient) => (
                                    <SelectItem key={patient.id} value={patient.id.toString()}>
                                        {patient.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.patient_id && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.patient_id}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="appointment_date">Date *</Label>
                        <Input
                            id="appointment_date"
                            type="date"
                            value={appointment.appointment_date}
                            onChange={(e) => setAppointment(prev => ({ ...prev, appointment_date: e.target.value }))}
                            min={new Date().toISOString().split('T')[0]}
                        />
                        {errors.appointment_date && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.appointment_date}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="appointment_time">Time *</Label>
                        <Input
                            id="appointment_time"
                            type="time"
                            value={appointment.appointment_time}
                            onChange={(e) => setAppointment(prev => ({ ...prev, appointment_time: e.target.value }))}
                        />
                        {errors.appointment_time && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.appointment_time}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="appointment_type">Type *</Label>
                        <Select 
                            value={appointment.appointment_type} 
                            onValueChange={(value: any) => setAppointment(prev => ({ ...prev, appointment_type: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select appointment type" />
                            </SelectTrigger>
                            <SelectContent>
                                {appointmentTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.appointment_type && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.appointment_type}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="doctor_name">Doctor</Label>
                        <Input
                            id="doctor_name"
                            type="text"
                            value={appointment.doctor_name || ''}
                            onChange={(e) => setAppointment(prev => ({ ...prev, doctor_name: e.target.value }))}
                            placeholder="Doctor name (optional)"
                        />
                    </div>

                    <div>
                        <Label htmlFor="fee">Fee ({currency})</Label>
                        <Input
                            id="fee"
                            type="number"
                            step="0.01"
                            min="0"
                            value={appointment.fee || ''}
                            onChange={(e) => setAppointment(prev => ({ ...prev, fee: e.target.value ? parseFloat(e.target.value) : undefined }))}
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={appointment.notes || ''}
                            onChange={(e) => setAppointment(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Additional notes (optional)"
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Schedule Appointment
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

import React, { useState, useEffect } from 'react';
import { Button } from "../../../Components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../Components/ui/dialog";
import { Input } from "../../../Components/ui/input";
import { Label } from "../../../Components/ui/label";
import { Textarea } from "../../../Components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../Components/ui/select";
import { Appointment, NewAppointment } from '../types/appointment';
import { Patient } from '../types';

interface EditAppointmentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: Appointment | null;
    onUpdate: (id: number, appointment: Partial<NewAppointment>) => void;
    patients: Patient[];
    currency: string;
}

export default function EditAppointmentDialog({ 
    isOpen, 
    onClose, 
    appointment,
    onUpdate,
    patients,
    currency 
}: EditAppointmentDialogProps) {
    const [formData, setFormData] = useState<Partial<NewAppointment>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (appointment) {
            setFormData({
                patient_id: appointment.patient_id,
                appointment_date: appointment.appointment_date.split('T')[0],
                appointment_time: appointment.appointment_time,
                appointment_type: appointment.appointment_type,
                notes: appointment.notes || '',
                doctor_name: appointment.doctor_name || '',
                fee: appointment.fee
            });
        }
    }, [appointment]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!appointment) return;

        // Validation
        const newErrors: Record<string, string> = {};
        
        if (!formData.patient_id) {
            newErrors.patient_id = 'Please select a patient';
        }
        
        if (!formData.appointment_date) {
            newErrors.appointment_date = 'Please select a date';
        }
        
        if (!formData.appointment_time) {
            newErrors.appointment_time = 'Please select a time';
        }
        
        if (!formData.appointment_type) {
            newErrors.appointment_type = 'Please select an appointment type';
        }

        // Check if date is in the past (only for future appointments)
        if (formData.appointment_date) {
            const selectedDate = new Date(formData.appointment_date);
            const now = new Date();
            if (selectedDate < now) {
                newErrors.appointment_date = 'Appointment date cannot be in the past';
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onUpdate(appointment.id, formData);
        handleClose();
    };

    const handleClose = () => {
        setFormData({});
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

    if (!appointment) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Appointment</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="patient_id">Patient *</Label>
                        <Select 
                            value={formData.patient_id?.toString() || ''} 
                            onValueChange={(value) => setFormData(prev => ({ ...prev, patient_id: parseInt(value) }))}
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
                            value={formData.appointment_date || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, appointment_date: e.target.value }))}
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
                            value={formData.appointment_time || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, appointment_time: e.target.value }))}
                        />
                        {errors.appointment_time && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.appointment_time}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="appointment_type">Type *</Label>
                        <Select 
                            value={formData.appointment_type || ''} 
                            onValueChange={(value: any) => setFormData(prev => ({ ...prev, appointment_type: value }))}
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
                            value={formData.doctor_name || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, doctor_name: e.target.value }))}
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
                            value={formData.fee || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, fee: e.target.value ? parseFloat(e.target.value) : undefined }))}
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Additional notes (optional)"
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Update Appointment
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

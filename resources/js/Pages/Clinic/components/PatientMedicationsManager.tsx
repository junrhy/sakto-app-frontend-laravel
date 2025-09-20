import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Badge } from "@/Components/ui/badge";
import { 
    Pill, 
    Plus, 
    Edit, 
    Trash2, 
    Save,
    X,
    Clock,
    AlertCircle
} from 'lucide-react';
import { Patient, PatientMedication, NewPatientMedication } from '../types';
import { formatDate } from '../utils';
import { toast } from 'sonner';

interface PatientMedicationsManagerProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
    medications: PatientMedication[];
    onAddMedication: (medication: NewPatientMedication) => void;
    onUpdateMedication: (id: number, medication: Partial<PatientMedication>) => void;
    onDeleteMedication: (id: number) => void;
}

interface MedicationFormData {
    medication_name: string;
    generic_name: string;
    brand_name: string;
    strength: string;
    dosage_form: string;
    dosage: string;
    frequency: string;
    route: string;
    instructions: string;
    start_date: string;
    end_date: string;
    duration_days: string;
    as_needed: boolean;
    indication: string;
    prescribed_by: string;
    prescriber_license: string;
    prescription_date: string;
    refills_remaining: string;
    status: PatientMedication['status'];
    medication_type: PatientMedication['medication_type'];
    ndc_code: string;
    rxnorm_code: string;
    side_effects_experienced: string;
    notes: string;
    adherence: PatientMedication['adherence'];
}

const initialFormData: MedicationFormData = {
    medication_name: '',
    generic_name: '',
    brand_name: '',
    strength: '',
    dosage_form: '',
    dosage: '',
    frequency: '',
    route: '',
    instructions: '',
    start_date: '',
    end_date: '',
    duration_days: '',
    as_needed: false,
    indication: '',
    prescribed_by: '',
    prescriber_license: '',
    prescription_date: '',
    refills_remaining: '',
    status: 'active',
    medication_type: 'prescription',
    ndc_code: '',
    rxnorm_code: '',
    side_effects_experienced: '',
    notes: '',
    adherence: 'unknown'
};

export const PatientMedicationsManager: React.FC<PatientMedicationsManagerProps> = ({
    isOpen,
    onClose,
    patient,
    medications,
    onAddMedication,
    onUpdateMedication,
    onDeleteMedication
}) => {
    const [isAddingMedication, setIsAddingMedication] = useState(false);
    const [editingMedication, setEditingMedication] = useState<PatientMedication | null>(null);
    const [formData, setFormData] = useState<MedicationFormData>(initialFormData);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'discontinued': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'on_hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    const getAdherenceColor = (adherence: string) => {
        switch (adherence) {
            case 'excellent': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'good': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'fair': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'poor': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    const handleStartAdd = () => {
        setFormData(initialFormData);
        setIsAddingMedication(true);
    };

    const handleStartEdit = (medication: PatientMedication) => {
        setFormData({
            medication_name: medication.medication_name,
            generic_name: medication.generic_name || '',
            brand_name: medication.brand_name || '',
            strength: medication.strength || '',
            dosage_form: medication.dosage_form || '',
            dosage: medication.dosage || '',
            frequency: medication.frequency || '',
            route: medication.route || '',
            instructions: medication.instructions || '',
            start_date: medication.start_date || '',
            end_date: medication.end_date || '',
            duration_days: medication.duration_days?.toString() || '',
            as_needed: medication.as_needed,
            indication: medication.indication || '',
            prescribed_by: medication.prescribed_by || '',
            prescriber_license: medication.prescriber_license || '',
            prescription_date: medication.prescription_date || '',
            refills_remaining: medication.refills_remaining?.toString() || '',
            status: medication.status,
            medication_type: medication.medication_type,
            ndc_code: medication.ndc_code || '',
            rxnorm_code: medication.rxnorm_code || '',
            side_effects_experienced: medication.side_effects_experienced || '',
            notes: medication.notes || '',
            adherence: medication.adherence
        });
        setEditingMedication(medication);
    };

    const handleCancelForm = () => {
        setIsAddingMedication(false);
        setEditingMedication(null);
        setFormData(initialFormData);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!patient || !formData.medication_name.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        const medicationData = {
            ...formData,
            patient_id: parseInt(patient.id),
            duration_days: formData.duration_days ? parseInt(formData.duration_days) : undefined,
            refills_remaining: formData.refills_remaining ? parseInt(formData.refills_remaining) : undefined
        };

        if (editingMedication) {
            onUpdateMedication(editingMedication.id, medicationData);
            toast.success('Medication updated successfully');
        } else {
            onAddMedication(medicationData);
            toast.success('Medication added successfully');
        }

        handleCancelForm();
    };

    const handleDelete = (medication: PatientMedication) => {
        if (window.confirm(`Are you sure you want to delete ${medication.medication_name}?`)) {
            onDeleteMedication(medication.id);
            toast.success('Medication deleted successfully');
        }
    };

    if (!patient) return null;

    // Filter medications by status
    const currentMedications = medications.filter(m => 
        m.status === 'active' && (!m.end_date || new Date(m.end_date) >= new Date())
    );
    const pastMedications = medications.filter(m => 
        m.status !== 'active' || (m.end_date && new Date(m.end_date) < new Date())
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Pill className="h-6 w-6 text-blue-600" />
                        Medication Management - {patient.name}
                        {currentMedications.length > 0 && (
                            <Badge variant="outline" className="ml-2">
                                {currentMedications.length} Current
                            </Badge>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="overflow-y-auto max-h-[calc(95vh-150px)] pr-4">
                    {/* Add New Medication Button */}
                    {!isAddingMedication && !editingMedication && (
                        <div className="mb-6">
                            <Button onClick={handleStartAdd} className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Add New Medication
                            </Button>
                        </div>
                    )}

                    {/* Add/Edit Medication Form */}
                    {(isAddingMedication || editingMedication) && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    {editingMedication ? 'Edit Medication' : 'Add New Medication'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Basic Medication Info */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Medication Name *</Label>
                                            <Input
                                                value={formData.medication_name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, medication_name: e.target.value }))}
                                                placeholder="e.g., Lisinopril"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Generic Name</Label>
                                            <Input
                                                value={formData.generic_name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, generic_name: e.target.value }))}
                                                placeholder="Generic name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Brand Name</Label>
                                            <Input
                                                value={formData.brand_name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, brand_name: e.target.value }))}
                                                placeholder="Brand name"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Strength</Label>
                                            <Input
                                                value={formData.strength}
                                                onChange={(e) => setFormData(prev => ({ ...prev, strength: e.target.value }))}
                                                placeholder="e.g., 10mg, 500mg/5ml"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Dosage Form</Label>
                                            <Input
                                                value={formData.dosage_form}
                                                onChange={(e) => setFormData(prev => ({ ...prev, dosage_form: e.target.value }))}
                                                placeholder="e.g., tablet, capsule, liquid"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Route</Label>
                                            <Input
                                                value={formData.route}
                                                onChange={(e) => setFormData(prev => ({ ...prev, route: e.target.value }))}
                                                placeholder="e.g., oral, IV, IM, topical"
                                            />
                                        </div>
                                    </div>

                                    {/* Dosing Information */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Dosage</Label>
                                            <Input
                                                value={formData.dosage}
                                                onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                                                placeholder="e.g., 1 tablet, 5ml, 2 capsules"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Frequency</Label>
                                            <Input
                                                value={formData.frequency}
                                                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                                                placeholder="e.g., twice daily, every 8 hours"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Instructions</Label>
                                        <Textarea
                                            value={formData.instructions}
                                            onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                                            placeholder="Special instructions for taking the medication..."
                                        />
                                    </div>

                                    {/* Dates and Duration */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Start Date</Label>
                                            <Input
                                                type="date"
                                                value={formData.start_date}
                                                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>End Date</Label>
                                            <Input
                                                type="date"
                                                value={formData.end_date}
                                                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Duration (Days)</Label>
                                            <Input
                                                type="number"
                                                value={formData.duration_days}
                                                onChange={(e) => setFormData(prev => ({ ...prev, duration_days: e.target.value }))}
                                                placeholder="Number of days"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Indication</Label>
                                            <Input
                                                value={formData.indication}
                                                onChange={(e) => setFormData(prev => ({ ...prev, indication: e.target.value }))}
                                                placeholder="What is this medication for?"
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2 pt-6">
                                            <input
                                                type="checkbox"
                                                id="asNeeded"
                                                checked={formData.as_needed}
                                                onChange={(e) => setFormData(prev => ({ ...prev, as_needed: e.target.checked }))}
                                            />
                                            <Label htmlFor="asNeeded">As Needed (PRN)</Label>
                                        </div>
                                    </div>

                                    {/* Prescriber Information */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Prescribed By</Label>
                                            <Input
                                                value={formData.prescribed_by}
                                                onChange={(e) => setFormData(prev => ({ ...prev, prescribed_by: e.target.value }))}
                                                placeholder="Prescribing physician"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Prescription Date</Label>
                                            <Input
                                                type="date"
                                                value={formData.prescription_date}
                                                onChange={(e) => setFormData(prev => ({ ...prev, prescription_date: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Refills Remaining</Label>
                                            <Input
                                                type="number"
                                                value={formData.refills_remaining}
                                                onChange={(e) => setFormData(prev => ({ ...prev, refills_remaining: e.target.value }))}
                                                placeholder="Number of refills"
                                            />
                                        </div>
                                    </div>

                                    {/* Status and Type */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Status</Label>
                                            <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="discontinued">Discontinued</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                    <SelectItem value="on_hold">On Hold</SelectItem>
                                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Medication Type</Label>
                                            <Select value={formData.medication_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, medication_type: value }))}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="prescription">Prescription</SelectItem>
                                                    <SelectItem value="over_the_counter">Over-the-Counter</SelectItem>
                                                    <SelectItem value="supplement">Supplement</SelectItem>
                                                    <SelectItem value="herbal">Herbal</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Adherence</Label>
                                            <Select value={formData.adherence} onValueChange={(value: any) => setFormData(prev => ({ ...prev, adherence: value }))}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="excellent">Excellent</SelectItem>
                                                    <SelectItem value="good">Good</SelectItem>
                                                    <SelectItem value="fair">Fair</SelectItem>
                                                    <SelectItem value="poor">Poor</SelectItem>
                                                    <SelectItem value="unknown">Unknown</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Side Effects and Notes */}
                                    <div className="space-y-2">
                                        <Label>Side Effects Experienced</Label>
                                        <Textarea
                                            value={formData.side_effects_experienced}
                                            onChange={(e) => setFormData(prev => ({ ...prev, side_effects_experienced: e.target.value }))}
                                            placeholder="Any side effects experienced by the patient..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Additional Notes</Label>
                                        <Textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                            placeholder="Additional notes about the medication..."
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button type="submit" className="bg-green-600 hover:bg-green-700">
                                            <Save className="h-4 w-4 mr-2" />
                                            {editingMedication ? 'Update Medication' : 'Add Medication'}
                                        </Button>
                                        <Button type="button" variant="outline" onClick={handleCancelForm}>
                                            <X className="h-4 w-4 mr-2" />
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Current Medications */}
                    {currentMedications.length > 0 && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Pill className="h-5 w-5 text-blue-600" />
                                    Current Medications ({currentMedications.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {currentMedications.map(medication => (
                                        <div key={medication.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="font-semibold text-lg">{medication.medication_name}</h4>
                                                        {medication.strength && (
                                                            <span className="text-gray-600 dark:text-gray-400">({medication.strength})</span>
                                                        )}
                                                        <Badge className={getStatusColor(medication.status)}>
                                                            {medication.status.replace('_', ' ')}
                                                        </Badge>
                                                        <Badge variant="outline" className="capitalize">
                                                            {medication.medication_type.replace('_', ' ')}
                                                        </Badge>
                                                        {medication.as_needed && (
                                                            <Badge variant="outline" className="text-orange-600">
                                                                PRN
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                                        <div>
                                                            {medication.generic_name && (
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    <strong>Generic:</strong> {medication.generic_name}
                                                                </p>
                                                            )}
                                                            {medication.dosage && medication.frequency && (
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    <strong>Dosing:</strong> {medication.dosage} {medication.frequency}
                                                                </p>
                                                            )}
                                                            {medication.indication && (
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    <strong>Indication:</strong> {medication.indication}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            {medication.start_date && (
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    <strong>Started:</strong> {formatDate(medication.start_date)}
                                                                </p>
                                                            )}
                                                            {medication.prescribed_by && (
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    <strong>Prescribed by:</strong> {medication.prescribed_by}
                                                                </p>
                                                            )}
                                                            {medication.adherence !== 'unknown' && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                        <strong>Adherence:</strong>
                                                                    </span>
                                                                    <Badge className={getAdherenceColor(medication.adherence)}>
                                                                        {medication.adherence}
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {medication.instructions && (
                                                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                                                            <strong>Instructions:</strong> {medication.instructions}
                                                        </p>
                                                    )}

                                                    {medication.side_effects_experienced && (
                                                        <div className="flex items-start gap-2 mb-2">
                                                            <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                                                            <p className="text-sm text-orange-700 dark:text-orange-300">
                                                                <strong>Side Effects:</strong> {medication.side_effects_experienced}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {medication.notes && (
                                                        <p className="text-gray-700 dark:text-gray-300 mt-2">
                                                            <strong>Notes:</strong> {medication.notes}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2 ml-4">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleStartEdit(medication)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(medication)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Past Medications */}
                    {pastMedications.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Past Medications ({pastMedications.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {pastMedications.map(medication => (
                                        <div key={medication.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 opacity-75">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium">{medication.medication_name}</span>
                                                        {medication.strength && (
                                                            <span className="text-sm text-gray-500">({medication.strength})</span>
                                                        )}
                                                        <Badge className={getStatusColor(medication.status)} variant="outline">
                                                            {medication.status.replace('_', ' ')}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                        {medication.indication && <span>{medication.indication}</span>}
                                                        {medication.start_date && medication.end_date && (
                                                            <span>{formatDate(medication.start_date)} - {formatDate(medication.end_date)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleStartEdit(medication)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(medication)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* No medications message */}
                    {medications.length === 0 && !isAddingMedication && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">No medications recorded</p>
                            <p className="text-sm">Click "Add New Medication" to record patient medications</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

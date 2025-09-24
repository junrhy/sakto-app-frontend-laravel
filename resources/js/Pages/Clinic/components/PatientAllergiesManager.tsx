import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import {
    AlertTriangle,
    Edit,
    Plus,
    Save,
    Shield,
    ShieldAlert,
    Trash2,
    X,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { NewPatientAllergy, Patient, PatientAllergy } from '../types';
import { formatDate } from '../utils';

interface PatientAllergiesManagerProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
    allergies: PatientAllergy[];
    onAddAllergy: (allergy: NewPatientAllergy) => void;
    onUpdateAllergy: (id: number, allergy: Partial<PatientAllergy>) => void;
    onDeleteAllergy: (id: number) => void;
}

interface AllergyFormData {
    allergen: string;
    allergen_type: PatientAllergy['allergen_type'];
    reaction_description: string;
    severity: PatientAllergy['severity'];
    symptoms: string[];
    first_occurrence_date: string;
    last_occurrence_date: string;
    onset_time: string;
    status: PatientAllergy['status'];
    verification_status: PatientAllergy['verification_status'];
    notes: string;
    reported_by: string;
}

const initialFormData: AllergyFormData = {
    allergen: '',
    allergen_type: 'medication',
    reaction_description: '',
    severity: 'unknown',
    symptoms: [],
    first_occurrence_date: '',
    last_occurrence_date: '',
    onset_time: '',
    status: 'active',
    verification_status: 'patient_reported',
    notes: '',
    reported_by: '',
};

const commonSymptoms = [
    'Rash',
    'Hives',
    'Swelling',
    'Difficulty breathing',
    'Wheezing',
    'Nausea',
    'Vomiting',
    'Diarrhea',
    'Itching',
    'Runny nose',
    'Watery eyes',
    'Coughing',
    'Sneezing',
    'Dizziness',
    'Headache',
    'Abdominal pain',
    'Chest tightness',
    'Throat closing',
    'Anaphylaxis',
];

export const PatientAllergiesManager: React.FC<
    PatientAllergiesManagerProps
> = ({
    isOpen,
    onClose,
    patient,
    allergies,
    onAddAllergy,
    onUpdateAllergy,
    onDeleteAllergy,
}) => {
    const [isAddingAllergy, setIsAddingAllergy] = useState(false);
    const [editingAllergy, setEditingAllergy] = useState<PatientAllergy | null>(
        null,
    );
    const [formData, setFormData] = useState<AllergyFormData>(initialFormData);
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'life_threatening':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'severe':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            case 'moderate':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'mild':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    const getSeverityIcon = (severity: string) => {
        if (severity === 'life_threatening' || severity === 'severe') {
            return <ShieldAlert className="h-4 w-4" />;
        }
        return <Shield className="h-4 w-4" />;
    };

    const handleStartAdd = () => {
        setFormData(initialFormData);
        setSelectedSymptoms([]);
        setIsAddingAllergy(true);
    };

    const handleStartEdit = (allergy: PatientAllergy) => {
        setFormData({
            allergen: allergy.allergen,
            allergen_type: allergy.allergen_type,
            reaction_description: allergy.reaction_description,
            severity: allergy.severity,
            symptoms: allergy.symptoms || [],
            first_occurrence_date: allergy.first_occurrence_date || '',
            last_occurrence_date: allergy.last_occurrence_date || '',
            onset_time: allergy.onset_time || '',
            status: allergy.status,
            verification_status: allergy.verification_status,
            notes: allergy.notes || '',
            reported_by: allergy.reported_by || '',
        });
        setSelectedSymptoms(allergy.symptoms || []);
        setEditingAllergy(allergy);
    };

    const handleCancelForm = () => {
        setIsAddingAllergy(false);
        setEditingAllergy(null);
        setFormData(initialFormData);
        setSelectedSymptoms([]);
    };

    const handleSymptomToggle = (symptom: string) => {
        setSelectedSymptoms((prev) => {
            const updated = prev.includes(symptom)
                ? prev.filter((s) => s !== symptom)
                : [...prev, symptom];

            setFormData((current) => ({
                ...current,
                symptoms: updated,
            }));

            return updated;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !patient ||
            !formData.allergen.trim() ||
            !formData.reaction_description.trim()
        ) {
            toast.error('Please fill in all required fields');
            return;
        }

        const allergyData = {
            ...formData,
            patient_id: parseInt(patient.id),
            symptoms: selectedSymptoms,
        };

        if (editingAllergy) {
            onUpdateAllergy(editingAllergy.id, allergyData);
            toast.success('Allergy updated successfully');
        } else {
            onAddAllergy(allergyData);
            toast.success('Allergy added successfully');
        }

        handleCancelForm();
    };

    const handleDelete = (allergy: PatientAllergy) => {
        if (
            window.confirm(
                `Are you sure you want to delete the allergy to ${allergy.allergen}?`,
            )
        ) {
            onDeleteAllergy(allergy.id);
            toast.success('Allergy deleted successfully');
        }
    };

    if (!patient) return null;

    // Filter allergies by status
    const activeAllergies = allergies.filter((a) => a.status === 'active');
    const inactiveAllergies = allergies.filter((a) => a.status !== 'active');
    const lifeThreatening = activeAllergies.filter(
        (a) => a.severity === 'life_threatening',
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[95vh] max-w-6xl overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                        Allergy Management - {patient.name}
                        {lifeThreatening.length > 0 && (
                            <Badge variant="destructive" className="ml-2">
                                {lifeThreatening.length} Life-Threatening
                            </Badge>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="max-h-[calc(95vh-150px)] overflow-y-auto pr-4">
                    {/* Life-threatening allergies alert */}
                    {lifeThreatening.length > 0 && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                            <div className="mb-2 flex items-center gap-2 font-semibold text-red-800 dark:text-red-200">
                                <ShieldAlert className="h-5 w-5" />
                                Critical Allergy Alert
                            </div>
                            <div className="space-y-2">
                                {lifeThreatening.map((allergy) => (
                                    <div
                                        key={allergy.id}
                                        className="text-red-700 dark:text-red-300"
                                    >
                                        <strong>{allergy.allergen}</strong> (
                                        {allergy.allergen_type}) -{' '}
                                        {allergy.reaction_description}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add New Allergy Button */}
                    {!isAddingAllergy && !editingAllergy && (
                        <div className="mb-6">
                            <Button
                                onClick={handleStartAdd}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add New Allergy
                            </Button>
                        </div>
                    )}

                    {/* Add/Edit Allergy Form */}
                    {(isAddingAllergy || editingAllergy) && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    {editingAllergy
                                        ? 'Edit Allergy'
                                        : 'Add New Allergy'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Allergen *</Label>
                                            <Input
                                                value={formData.allergen}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        allergen:
                                                            e.target.value,
                                                    }))
                                                }
                                                placeholder="e.g., Penicillin, Peanuts, Latex"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Allergen Type</Label>
                                            <Select
                                                value={formData.allergen_type}
                                                onValueChange={(value: any) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        allergen_type: value,
                                                    }))
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="medication">
                                                        Medication
                                                    </SelectItem>
                                                    <SelectItem value="food">
                                                        Food
                                                    </SelectItem>
                                                    <SelectItem value="environmental">
                                                        Environmental
                                                    </SelectItem>
                                                    <SelectItem value="latex">
                                                        Latex
                                                    </SelectItem>
                                                    <SelectItem value="contrast_dye">
                                                        Contrast Dye
                                                    </SelectItem>
                                                    <SelectItem value="other">
                                                        Other
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Reaction Description *</Label>
                                        <Textarea
                                            value={
                                                formData.reaction_description
                                            }
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    reaction_description:
                                                        e.target.value,
                                                }))
                                            }
                                            placeholder="Describe the allergic reaction..."
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Severity</Label>
                                            <Select
                                                value={formData.severity}
                                                onValueChange={(value: any) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        severity: value,
                                                    }))
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="mild">
                                                        Mild
                                                    </SelectItem>
                                                    <SelectItem value="moderate">
                                                        Moderate
                                                    </SelectItem>
                                                    <SelectItem value="severe">
                                                        Severe
                                                    </SelectItem>
                                                    <SelectItem value="life_threatening">
                                                        Life-Threatening
                                                    </SelectItem>
                                                    <SelectItem value="unknown">
                                                        Unknown
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Status</Label>
                                            <Select
                                                value={formData.status}
                                                onValueChange={(value: any) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        status: value,
                                                    }))
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">
                                                        Active
                                                    </SelectItem>
                                                    <SelectItem value="inactive">
                                                        Inactive
                                                    </SelectItem>
                                                    <SelectItem value="resolved">
                                                        Resolved
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Symptoms</Label>
                                        <div className="grid max-h-32 grid-cols-3 gap-2 overflow-y-auto rounded border p-2">
                                            {commonSymptoms.map((symptom) => (
                                                <div
                                                    key={symptom}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        id={symptom}
                                                        checked={selectedSymptoms.includes(
                                                            symptom,
                                                        )}
                                                        onChange={() =>
                                                            handleSymptomToggle(
                                                                symptom,
                                                            )
                                                        }
                                                        className="rounded"
                                                    />
                                                    <Label
                                                        htmlFor={symptom}
                                                        className="cursor-pointer text-sm"
                                                    >
                                                        {symptom}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>First Occurrence Date</Label>
                                            <Input
                                                type="date"
                                                value={
                                                    formData.first_occurrence_date
                                                }
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        first_occurrence_date:
                                                            e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Onset Time</Label>
                                            <Input
                                                value={formData.onset_time}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        onset_time:
                                                            e.target.value,
                                                    }))
                                                }
                                                placeholder="e.g., Immediate, 30 minutes, 2 hours"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Verification Status</Label>
                                            <Select
                                                value={
                                                    formData.verification_status
                                                }
                                                onValueChange={(value: any) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        verification_status:
                                                            value,
                                                    }))
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="confirmed">
                                                        Confirmed
                                                    </SelectItem>
                                                    <SelectItem value="unconfirmed">
                                                        Unconfirmed
                                                    </SelectItem>
                                                    <SelectItem value="patient_reported">
                                                        Patient Reported
                                                    </SelectItem>
                                                    <SelectItem value="family_reported">
                                                        Family Reported
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Reported By</Label>
                                            <Input
                                                value={formData.reported_by}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        reported_by:
                                                            e.target.value,
                                                    }))
                                                }
                                                placeholder="Who reported this allergy"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Additional Notes</Label>
                                        <Textarea
                                            value={formData.notes}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    notes: e.target.value,
                                                }))
                                            }
                                            placeholder="Additional notes about the allergy..."
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            type="submit"
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <Save className="mr-2 h-4 w-4" />
                                            {editingAllergy
                                                ? 'Update Allergy'
                                                : 'Add Allergy'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleCancelForm}
                                        >
                                            <X className="mr-2 h-4 w-4" />
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Active Allergies */}
                    {activeAllergies.length > 0 && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    Active Allergies ({activeAllergies.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {activeAllergies.map((allergy) => (
                                        <div
                                            key={allergy.id}
                                            className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="mb-2 flex items-center gap-2">
                                                        <h4 className="text-lg font-semibold">
                                                            {allergy.allergen}
                                                        </h4>
                                                        <Badge
                                                            variant="outline"
                                                            className="capitalize"
                                                        >
                                                            {allergy.allergen_type.replace(
                                                                '_',
                                                                ' ',
                                                            )}
                                                        </Badge>
                                                        <Badge
                                                            className={getSeverityColor(
                                                                allergy.severity,
                                                            )}
                                                        >
                                                            {getSeverityIcon(
                                                                allergy.severity,
                                                            )}
                                                            <span className="ml-1 capitalize">
                                                                {allergy.severity.replace(
                                                                    '_',
                                                                    ' ',
                                                                )}
                                                            </span>
                                                        </Badge>
                                                    </div>
                                                    <p className="mb-2 text-gray-700 dark:text-gray-300">
                                                        <strong>
                                                            Reaction:
                                                        </strong>{' '}
                                                        {
                                                            allergy.reaction_description
                                                        }
                                                    </p>
                                                    {allergy.symptoms &&
                                                        allergy.symptoms
                                                            .length > 0 && (
                                                            <p className="mb-2 text-gray-700 dark:text-gray-300">
                                                                <strong>
                                                                    Symptoms:
                                                                </strong>{' '}
                                                                {allergy.symptoms.join(
                                                                    ', ',
                                                                )}
                                                            </p>
                                                        )}
                                                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                                        {allergy.first_occurrence_date && (
                                                            <p>
                                                                <strong>
                                                                    First
                                                                    Occurrence:
                                                                </strong>{' '}
                                                                {formatDate(
                                                                    allergy.first_occurrence_date,
                                                                )}
                                                            </p>
                                                        )}
                                                        {allergy.onset_time && (
                                                            <p>
                                                                <strong>
                                                                    Onset Time:
                                                                </strong>{' '}
                                                                {
                                                                    allergy.onset_time
                                                                }
                                                            </p>
                                                        )}
                                                        <p>
                                                            <strong>
                                                                Verification:
                                                            </strong>{' '}
                                                            {allergy.verification_status.replace(
                                                                '_',
                                                                ' ',
                                                            )}
                                                        </p>
                                                        {allergy.reported_by && (
                                                            <p>
                                                                <strong>
                                                                    Reported By:
                                                                </strong>{' '}
                                                                {
                                                                    allergy.reported_by
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                    {allergy.notes && (
                                                        <p className="mt-2 text-gray-700 dark:text-gray-300">
                                                            <strong>
                                                                Notes:
                                                            </strong>{' '}
                                                            {allergy.notes}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="ml-4 flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleStartEdit(
                                                                allergy,
                                                            )
                                                        }
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDelete(
                                                                allergy,
                                                            )
                                                        }
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

                    {/* Inactive/Resolved Allergies */}
                    {inactiveAllergies.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg text-gray-600 dark:text-gray-400">
                                    Inactive/Resolved Allergies (
                                    {inactiveAllergies.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {inactiveAllergies.map((allergy) => (
                                        <div
                                            key={allergy.id}
                                            className="rounded-lg border border-gray-200 p-3 opacity-75 dark:border-gray-700"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="mb-1 flex items-center gap-2">
                                                        <span className="font-medium">
                                                            {allergy.allergen}
                                                        </span>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs capitalize"
                                                        >
                                                            {allergy.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {
                                                            allergy.reaction_description
                                                        }
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleStartEdit(
                                                                allergy,
                                                            )
                                                        }
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDelete(
                                                                allergy,
                                                            )
                                                        }
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

                    {/* No allergies message */}
                    {allergies.length === 0 && !isAddingAllergy && (
                        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                            <AlertTriangle className="mx-auto mb-4 h-12 w-12 opacity-50" />
                            <p className="text-lg">No allergies recorded</p>
                            <p className="text-sm">
                                Click "Add New Allergy" to record patient
                                allergies
                            </p>
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

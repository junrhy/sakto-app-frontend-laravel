import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import {
    Activity,
    AlertTriangle,
    Calendar,
    Eye,
    FileText,
    Plus,
    Stethoscope,
    User,
} from 'lucide-react';
import React, { useState } from 'react';
import { Patient, PatientEncounter } from '../types';
import { formatDateTime } from '../utils';

interface PatientEncounterHistoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
    encounters: PatientEncounter[];
    onStartNewEncounter: (patient: Patient) => void;
}

export const PatientEncounterHistoryDialog: React.FC<
    PatientEncounterHistoryDialogProps
> = ({ isOpen, onClose, patient, encounters, onStartNewEncounter }) => {
    const [selectedEncounter, setSelectedEncounter] =
        useState<PatientEncounter | null>(null);

    if (!patient) return null;

    const calculateAge = (birthdate: string) => {
        if (!birthdate) return 'N/A';
        const today = new Date();
        const birth = new Date(birthdate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birth.getDate())
        ) {
            age--;
        }
        return age;
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'default';
            case 'in_progress':
                return 'secondary';
            case 'scheduled':
                return 'outline';
            case 'cancelled':
                return 'destructive';
            default:
                return 'default';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'routine':
                return 'text-green-600 dark:text-green-400';
            case 'urgent':
                return 'text-orange-600 dark:text-orange-400';
            case 'emergent':
                return 'text-red-600 dark:text-red-400';
            case 'stat':
                return 'text-red-800 dark:text-red-300';
            default:
                return 'text-gray-600 dark:text-gray-400';
        }
    };

    const renderEncounterList = () => (
        <div className="space-y-4">
            {encounters.length > 0 ? (
                encounters.map((encounter) => (
                    <Card
                        key={encounter.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedEncounter?.id === encounter.id
                                ? 'border-blue-300 ring-2 ring-blue-500'
                                : 'border-gray-200 dark:border-gray-600'
                        }`}
                        onClick={() => setSelectedEncounter(encounter)}
                    >
                        <CardContent className="p-4">
                            <div className="mb-3 flex items-start justify-between">
                                <div>
                                    <div className="mb-1 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-blue-600" />
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {formatDateTime(
                                                encounter.encounter_datetime,
                                            )}
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Encounter #{encounter.encounter_number}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={getStatusColor(
                                            encounter.status,
                                        )}
                                    >
                                        {encounter.status}
                                    </Badge>
                                    <span
                                        className={`text-xs font-medium ${getPriorityColor(encounter.priority || 'routine')}`}
                                    >
                                        {encounter.priority || 'routine'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">
                                            Provider:
                                        </span>{' '}
                                        {encounter.attending_provider}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Stethoscope className="h-4 w-4 text-gray-500" />
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">
                                            Type:
                                        </span>{' '}
                                        {encounter.encounter_type} •{' '}
                                        {encounter.encounter_class}
                                    </p>
                                </div>

                                {encounter.chief_complaint && (
                                    <div className="flex items-start gap-2">
                                        <FileText className="mt-0.5 h-4 w-4 text-gray-500" />
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            <span className="font-medium">
                                                Chief Complaint:
                                            </span>{' '}
                                            {encounter.chief_complaint}
                                        </p>
                                    </div>
                                )}

                                {encounter.clinical_impression && (
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle className="mt-0.5 h-4 w-4 text-gray-500" />
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            <span className="font-medium">
                                                Clinical Impression:
                                            </span>{' '}
                                            {encounter.clinical_impression}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <div className="py-12 text-center">
                    <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                        No Encounters Found
                    </h3>
                    <p className="mb-4 text-gray-500 dark:text-gray-400">
                        This patient has no recorded clinical encounters yet.
                    </p>
                    <Button onClick={() => onStartNewEncounter(patient)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Start First Encounter
                    </Button>
                </div>
            )}
        </div>
    );

    const renderEncounterDetails = () => {
        if (!selectedEncounter) {
            return (
                <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                        <Eye className="mx-auto mb-4 h-12 w-12 opacity-50" />
                        <p>Select an encounter to view details</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="max-h-[calc(90vh-200px)] space-y-6 overflow-y-auto">
                {/* Encounter Header */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Encounter Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    Date & Time
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {formatDateTime(
                                        selectedEncounter.encounter_datetime,
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    Encounter Number
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {selectedEncounter.encounter_number}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    Provider
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {selectedEncounter.attending_provider}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    Status
                                </p>
                                <Badge
                                    variant={getStatusColor(
                                        selectedEncounter.status,
                                    )}
                                >
                                    {selectedEncounter.status}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* SOAP Documentation */}
                <Tabs defaultValue="soap" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="soap">SOAP Notes</TabsTrigger>
                        <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
                        <TabsTrigger value="diagnoses">Diagnoses</TabsTrigger>
                        <TabsTrigger value="plan">Treatment Plan</TabsTrigger>
                    </TabsList>

                    <TabsContent value="soap" className="space-y-4">
                        {/* Subjective */}
                        {(selectedEncounter.chief_complaint ||
                            selectedEncounter.history_present_illness) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Subjective
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {selectedEncounter.chief_complaint && (
                                        <div>
                                            <p className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                                                Chief Complaint
                                            </p>
                                            <p className="rounded bg-gray-50 p-2 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                {
                                                    selectedEncounter.chief_complaint
                                                }
                                            </p>
                                        </div>
                                    )}
                                    {selectedEncounter.history_present_illness && (
                                        <div>
                                            <p className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                                                History of Present Illness
                                            </p>
                                            <p className="rounded bg-gray-50 p-2 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                {
                                                    selectedEncounter.history_present_illness
                                                }
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Objective */}
                        {(selectedEncounter.physical_examination ||
                            selectedEncounter.laboratory_results) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Objective
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {selectedEncounter.physical_examination && (
                                        <div>
                                            <p className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                                                Physical Examination
                                            </p>
                                            <p className="rounded bg-gray-50 p-2 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                {
                                                    selectedEncounter.physical_examination
                                                }
                                            </p>
                                        </div>
                                    )}
                                    {selectedEncounter.laboratory_results && (
                                        <div>
                                            <p className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                                                Laboratory Results
                                            </p>
                                            <p className="rounded bg-gray-50 p-2 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                {
                                                    selectedEncounter.laboratory_results
                                                }
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Assessment */}
                        {(selectedEncounter.clinical_impression ||
                            selectedEncounter.differential_diagnosis) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Assessment
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {selectedEncounter.clinical_impression && (
                                        <div>
                                            <p className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                                                Clinical Impression
                                            </p>
                                            <p className="rounded bg-gray-50 p-2 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                {
                                                    selectedEncounter.clinical_impression
                                                }
                                            </p>
                                        </div>
                                    )}
                                    {selectedEncounter.differential_diagnosis && (
                                        <div>
                                            <p className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                                                Differential Diagnosis
                                            </p>
                                            <p className="rounded bg-gray-50 p-2 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                {
                                                    selectedEncounter.differential_diagnosis
                                                }
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="vitals">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Vital Signs
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {selectedEncounter.vital_signs &&
                                selectedEncounter.vital_signs.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedEncounter.vital_signs.map(
                                            (vitals: any, index: number) => (
                                                <div
                                                    key={index}
                                                    className="space-y-2 rounded bg-gray-50 p-3 dark:bg-gray-800"
                                                >
                                                    {vitals.systolic_bp &&
                                                        vitals.diastolic_bp && (
                                                            <p className="text-sm">
                                                                <span className="font-medium">
                                                                    Blood
                                                                    Pressure:
                                                                </span>{' '}
                                                                {
                                                                    vitals.systolic_bp
                                                                }
                                                                /
                                                                {
                                                                    vitals.diastolic_bp
                                                                }{' '}
                                                                mmHg
                                                            </p>
                                                        )}
                                                    {vitals.heart_rate && (
                                                        <p className="text-sm">
                                                            <span className="font-medium">
                                                                Heart Rate:
                                                            </span>{' '}
                                                            {vitals.heart_rate}{' '}
                                                            bpm
                                                        </p>
                                                    )}
                                                    {vitals.temperature && (
                                                        <p className="text-sm">
                                                            <span className="font-medium">
                                                                Temperature:
                                                            </span>{' '}
                                                            {vitals.temperature}
                                                            °
                                                            {vitals.temperature_unit ===
                                                            'celsius'
                                                                ? 'C'
                                                                : 'F'}
                                                        </p>
                                                    )}
                                                    {vitals.oxygen_saturation && (
                                                        <p className="text-sm">
                                                            <span className="font-medium">
                                                                O2 Saturation:
                                                            </span>{' '}
                                                            {
                                                                vitals.oxygen_saturation
                                                            }
                                                            %
                                                        </p>
                                                    )}
                                                    {vitals.respiratory_rate && (
                                                        <p className="text-sm">
                                                            <span className="font-medium">
                                                                Respiratory
                                                                Rate:
                                                            </span>{' '}
                                                            {
                                                                vitals.respiratory_rate
                                                            }{' '}
                                                            /min
                                                        </p>
                                                    )}
                                                    {vitals.weight && (
                                                        <p className="text-sm">
                                                            <span className="font-medium">
                                                                Weight:
                                                            </span>{' '}
                                                            {vitals.weight} kg
                                                        </p>
                                                    )}
                                                    {vitals.height && (
                                                        <p className="text-sm">
                                                            <span className="font-medium">
                                                                Height:
                                                            </span>{' '}
                                                            {vitals.height} cm
                                                        </p>
                                                    )}
                                                    {vitals.pain_score && (
                                                        <p className="text-sm">
                                                            <span className="font-medium">
                                                                Pain Score:
                                                            </span>{' '}
                                                            {vitals.pain_score}
                                                            /10
                                                        </p>
                                                    )}
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <p className="py-4 text-center text-gray-500 dark:text-gray-400">
                                        No vital signs recorded for this
                                        encounter
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="diagnoses">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    Diagnoses
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {selectedEncounter.diagnoses &&
                                selectedEncounter.diagnoses.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedEncounter.diagnoses.map(
                                            (diagnosis, index) => (
                                                <div
                                                    key={index}
                                                    className="rounded bg-gray-50 p-3 dark:bg-gray-800"
                                                >
                                                    <div className="mb-2 flex items-start justify-between">
                                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                                            {
                                                                diagnosis.diagnosis_name
                                                            }
                                                        </h4>
                                                        {diagnosis.icd10_code && (
                                                            <Badge variant="outline">
                                                                {
                                                                    diagnosis.icd10_code
                                                                }
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {diagnosis.clinical_notes && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                                            {
                                                                diagnosis.clinical_notes
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <p className="py-4 text-center text-gray-500 dark:text-gray-400">
                                        No diagnoses recorded for this encounter
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="plan">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Treatment Plan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {selectedEncounter.treatment_plan && (
                                    <div>
                                        <p className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                                            Treatment Plan
                                        </p>
                                        <p className="rounded bg-gray-50 p-2 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                            {selectedEncounter.treatment_plan}
                                        </p>
                                    </div>
                                )}
                                {selectedEncounter.medications_prescribed && (
                                    <div>
                                        <p className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                                            Medications Prescribed
                                        </p>
                                        <p className="rounded bg-gray-50 p-2 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                            {
                                                selectedEncounter.medications_prescribed
                                            }
                                        </p>
                                    </div>
                                )}
                                {selectedEncounter.follow_up_instructions && (
                                    <div>
                                        <p className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                                            Follow-up Instructions
                                        </p>
                                        <p className="rounded bg-gray-50 p-2 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                            {
                                                selectedEncounter.follow_up_instructions
                                            }
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[95vh] max-w-7xl overflow-hidden">
                <DialogHeader className="border-b border-gray-200 pb-4 dark:border-gray-700">
                    <div className="flex items-center justify-between pr-8">
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <FileText className="h-6 w-6" />
                            Complete Medical Record - {patient.name}
                        </DialogTitle>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">
                                {encounters.length} Encounters
                            </Badge>
                            <Button
                                onClick={() => onStartNewEncounter(patient)}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                New Encounter
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                {/* Patient Summary */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                    <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                                Patient ID
                            </p>
                            <p className="text-gray-600 dark:text-gray-300">
                                {patient.id}
                            </p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                                Age
                            </p>
                            <p className="text-gray-600 dark:text-gray-300">
                                {calculateAge(patient.birthdate)} years
                            </p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                                Gender
                            </p>
                            <p className="text-gray-600 dark:text-gray-300">
                                {patient.gender}
                            </p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                                Contact
                            </p>
                            <p className="text-gray-600 dark:text-gray-300">
                                {patient.phone}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-hidden">
                    <div className="grid h-full grid-cols-5 gap-6">
                        {/* Left Panel - Encounter List */}
                        <div className="col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Clinical Encounters ({encounters.length})
                                </h3>
                            </div>
                            <div className="max-h-[calc(90vh-300px)] overflow-y-auto pr-2">
                                {renderEncounterList()}
                            </div>
                        </div>

                        {/* Right Panel - Encounter Details */}
                        <div className="col-span-3">
                            {renderEncounterDetails()}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

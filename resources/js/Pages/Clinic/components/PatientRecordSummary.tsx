import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { 
    User, 
    Heart, 
    AlertTriangle, 
    Pill, 
    FileText,
    Activity,
    Calendar,
    Phone,
    Mail,
    MapPin,
    Shield,
    Users,
    Scissors,
    Thermometer,
    TrendingUp
} from 'lucide-react';
import { 
    Patient, 
    PatientEncounter, 
    PatientVitalSigns, 
    PatientDiagnosis,
    PatientAllergy,
    PatientMedication,
    PatientMedicalHistory
} from '../types';
import { formatDate, formatDateTime } from '../utils';

interface PatientRecordSummaryProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
    encounters?: PatientEncounter[];
    vitalSigns?: PatientVitalSigns[];
    diagnoses?: PatientDiagnosis[];
    allergies?: PatientAllergy[];
    medications?: PatientMedication[];
    medicalHistory?: PatientMedicalHistory[];
    onManageAllergies: () => void;
    onManageMedications: () => void;
    onManageMedicalHistory: () => void;
}

export const PatientRecordSummary: React.FC<PatientRecordSummaryProps> = ({
    isOpen,
    onClose,
    patient,
    encounters = [],
    vitalSigns = [],
    diagnoses = [],
    allergies = [],
    medications = [],
    medicalHistory = [],
    onManageAllergies,
    onManageMedications,
    onManageMedicalHistory
}) => {
    if (!patient) return null;

    const calculateAge = (birthdate: string) => {
        if (!birthdate) return 'N/A';
        const today = new Date();
        const birth = new Date(birthdate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    // Filter data for quick access
    const recentEncounters = encounters.slice(0, 5);
    const recentVitalSigns = vitalSigns.slice(0, 3);
    const activeDiagnoses = diagnoses.filter(d => d.status === 'active');
    const activeAllergies = allergies.filter(a => a.status === 'active');
    const currentMedications = medications.filter(m => 
        m.status === 'active' && (!m.end_date || new Date(m.end_date) >= new Date())
    );
    const lifeThreatening = activeAllergies.filter(a => a.severity === 'life_threatening');

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'life_threatening': case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'severe': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            case 'moderate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'mild': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'resolved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'chronic': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <User className="h-6 w-6 text-blue-600" />
                        Complete Medical Record - {patient.name}
                        {lifeThreatening.length > 0 && (
                            <Badge variant="destructive" className="ml-2">
                                {lifeThreatening.length} Critical Allergies
                            </Badge>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="overflow-y-auto max-h-[calc(95vh-150px)] pr-4">
                    {/* Critical Alerts */}
                    {lifeThreatening.length > 0 && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
                            <div className="flex items-center gap-2 text-red-800 dark:text-red-200 font-semibold mb-2">
                                <AlertTriangle className="h-5 w-5" />
                                CRITICAL ALLERGY ALERT
                            </div>
                            <div className="space-y-1">
                                {lifeThreatening.map(allergy => (
                                    <div key={allergy.id} className="text-red-700 dark:text-red-300 font-medium">
                                        • {allergy.allergen} ({allergy.allergen_type}) - {allergy.reaction_description}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-6">
                        {/* Left Column: Patient Demographics */}
                        <div className="space-y-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Patient Demographics
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">{patient.name}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">ARN: {patient.arn || 'Not Set'}</p>
                                        {patient.medical_record_number && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400">MRN: {patient.medical_record_number}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span>Age: {calculateAge(patient.birthdate)} years</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <User className="h-4 w-4 text-gray-500" />
                                            <span>Gender: {patient.gender || 'Not specified'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-4 w-4 text-gray-500" />
                                            <span>{patient.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4 text-gray-500" />
                                            <span>{patient.email}</span>
                                        </div>
                                        {patient.address && (
                                            <div className="flex items-start gap-2 text-sm">
                                                <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                                                <span>{patient.address}{patient.city && `, ${patient.city}`}</span>
                                            </div>
                                        )}
                                    </div>
                                    {patient.blood_type && (
                                        <div className="pt-2 border-t">
                                            <p className="text-sm"><strong>Blood Type:</strong> {patient.blood_type}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Emergency Contact */}
                            {patient.emergency_contact_name && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg">Emergency Contact</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <p className="font-medium">{patient.emergency_contact_name}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {patient.emergency_contact_relationship}
                                        </p>
                                        <p className="text-sm">{patient.emergency_contact_phone}</p>
                                        {patient.emergency_contact_email && (
                                            <p className="text-sm">{patient.emergency_contact_email}</p>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Social History */}
                            {(patient.smoking_status !== 'unknown' || patient.alcohol_use !== 'unknown' || patient.occupation) && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg">Social History</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {patient.smoking_status !== 'unknown' && (
                                            <p className="text-sm"><strong>Smoking:</strong> {patient.smoking_status}</p>
                                        )}
                                        {patient.alcohol_use !== 'unknown' && (
                                            <p className="text-sm"><strong>Alcohol:</strong> {patient.alcohol_use}</p>
                                        )}
                                        {patient.occupation && (
                                            <p className="text-sm"><strong>Occupation:</strong> {patient.occupation}</p>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Middle Column: Clinical Data */}
                        <div className="space-y-4">
                            {/* Active Diagnoses */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            <Heart className="h-5 w-5 text-red-600" />
                                            Active Diagnoses ({activeDiagnoses.length})
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {activeDiagnoses.length > 0 ? (
                                        <div className="space-y-3">
                                            {activeDiagnoses.slice(0, 5).map(diagnosis => (
                                                <div key={diagnosis.id} className="border border-gray-200 dark:border-gray-700 rounded p-3">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium">{diagnosis.diagnosis_name}</span>
                                                        {diagnosis.icd10_code && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {diagnosis.icd10_code}
                                                            </Badge>
                                                        )}
                                                        <Badge className={getSeverityColor(diagnosis.severity)}>
                                                            {diagnosis.severity}
                                                        </Badge>
                                                        <Badge className={getStatusColor(diagnosis.status)}>
                                                            {diagnosis.status}
                                                        </Badge>
                                                    </div>
                                                    {diagnosis.diagnosis_description && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {diagnosis.diagnosis_description}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                        Diagnosed: {formatDate(diagnosis.diagnosis_date)}
                                                    </p>
                                                </div>
                                            ))}
                                            {activeDiagnoses.length > 5 && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                                    +{activeDiagnoses.length - 5} more diagnoses
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                            No active diagnoses
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Active Allergies */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5 text-red-600" />
                                            Active Allergies ({activeAllergies.length})
                                        </span>
                                        <Button variant="outline" size="sm" onClick={onManageAllergies}>
                                            Manage
                                        </Button>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {activeAllergies.length > 0 ? (
                                        <div className="space-y-3">
                                            {activeAllergies.map(allergy => (
                                                <div key={allergy.id} className="border border-gray-200 dark:border-gray-700 rounded p-3">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium">{allergy.allergen}</span>
                                                        <Badge variant="outline" className="capitalize text-xs">
                                                            {allergy.allergen_type.replace('_', ' ')}
                                                        </Badge>
                                                        <Badge className={getSeverityColor(allergy.severity)}>
                                                            {allergy.severity.replace('_', ' ')}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {allergy.reaction_description}
                                                    </p>
                                                    {allergy.symptoms && allergy.symptoms.length > 0 && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                            Symptoms: {allergy.symptoms.slice(0, 3).join(', ')}
                                                            {allergy.symptoms.length > 3 && ' +more'}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                            No known allergies
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Current Medications */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            <Pill className="h-5 w-5 text-blue-600" />
                                            Current Medications ({currentMedications.length})
                                        </span>
                                        <Button variant="outline" size="sm" onClick={onManageMedications}>
                                            Manage
                                        </Button>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {currentMedications.length > 0 ? (
                                        <div className="space-y-3">
                                            {currentMedications.slice(0, 5).map(medication => (
                                                <div key={medication.id} className="border border-gray-200 dark:border-gray-700 rounded p-3">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium">{medication.medication_name}</span>
                                                        {medication.strength && (
                                                            <span className="text-sm text-gray-500">({medication.strength})</span>
                                                        )}
                                                        {medication.as_needed && (
                                                            <Badge variant="outline" className="text-orange-600 text-xs">
                                                                PRN
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {medication.dosage && medication.frequency && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {medication.dosage} {medication.frequency}
                                                        </p>
                                                    )}
                                                    {medication.indication && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                            For: {medication.indication}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                            {currentMedications.length > 5 && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                                    +{currentMedications.length - 5} more medications
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                            No current medications
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Recent Activity & Vital Signs */}
                        <div className="space-y-4">
                            {/* Recent Vital Signs */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-green-600" />
                                        Recent Vital Signs
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {recentVitalSigns.length > 0 ? (
                                        <div className="space-y-3">
                                            {recentVitalSigns.map(vitals => (
                                                <div key={vitals.id} className="border border-gray-200 dark:border-gray-700 rounded p-3">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                        {formatDateTime(vitals.measured_at)}
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                        {vitals.systolic_bp && vitals.diastolic_bp && (
                                                            <div className={vitals.flagged_abnormal ? 'text-red-600' : ''}>
                                                                <strong>BP:</strong> {vitals.systolic_bp}/{vitals.diastolic_bp} mmHg
                                                            </div>
                                                        )}
                                                        {vitals.heart_rate && (
                                                            <div className={vitals.flagged_abnormal ? 'text-red-600' : ''}>
                                                                <strong>HR:</strong> {vitals.heart_rate} bpm
                                                            </div>
                                                        )}
                                                        {vitals.temperature && (
                                                            <div>
                                                                <strong>Temp:</strong> {vitals.temperature}°{vitals.temperature_unit === 'fahrenheit' ? 'F' : 'C'}
                                                            </div>
                                                        )}
                                                        {vitals.oxygen_saturation && (
                                                            <div className={vitals.oxygen_saturation < 95 ? 'text-red-600' : ''}>
                                                                <strong>SpO2:</strong> {vitals.oxygen_saturation}%
                                                            </div>
                                                        )}
                                                        {vitals.weight && (
                                                            <div>
                                                                <strong>Weight:</strong> {vitals.weight} kg
                                                            </div>
                                                        )}
                                                        {vitals.bmi && (
                                                            <div>
                                                                <strong>BMI:</strong> {vitals.bmi}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {vitals.flagged_abnormal && (
                                                        <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                                                            <AlertTriangle className="h-3 w-3 inline mr-1" />
                                                            Abnormal values detected
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                            No vital signs recorded
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Recent Encounters */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-purple-600" />
                                        Recent Encounters
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {recentEncounters.length > 0 ? (
                                        <div className="space-y-3">
                                            {recentEncounters.map(encounter => (
                                                <div key={encounter.id} className="border border-gray-200 dark:border-gray-700 rounded p-3">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium text-sm">
                                                            {formatDate(encounter.encounter_datetime)}
                                                        </span>
                                                        <Badge variant="outline" className="capitalize text-xs">
                                                            {encounter.encounter_type.replace('_', ' ')}
                                                        </Badge>
                                                    </div>
                                                    {encounter.chief_complaint && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            <strong>CC:</strong> {encounter.chief_complaint.substring(0, 60)}...
                                                        </p>
                                                    )}
                                                    {encounter.attending_provider && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                            Provider: {encounter.attending_provider}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                            No recent encounters
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Medical History Summary */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-purple-600" />
                                            Medical History
                                        </span>
                                        <Button variant="outline" size="sm" onClick={onManageMedicalHistory}>
                                            Manage
                                        </Button>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {medicalHistory.length > 0 ? (
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Heart className="h-3 w-3" />
                                                    <span>Past Illness: {medicalHistory.filter(h => h.type === 'past_illness').length}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Scissors className="h-3 w-3" />
                                                    <span>Surgeries: {medicalHistory.filter(h => h.type === 'surgery').length}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    <span>Family: {medicalHistory.filter(h => h.type === 'family_history').length}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Shield className="h-3 w-3" />
                                                    <span>Immunizations: {medicalHistory.filter(h => h.type === 'immunization').length}</span>
                                                </div>
                                            </div>
                                            <div className="pt-2 border-t">
                                                {medicalHistory.slice(0, 3).map(history => (
                                                    <div key={history.id} className="text-sm py-1">
                                                        <span className="font-medium">{history.condition_name}</span>
                                                        {history.date_occurred && (
                                                            <span className="text-gray-500 dark:text-gray-400 ml-2">
                                                                ({formatDate(history.date_occurred)})
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                                {medicalHistory.length > 3 && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        +{medicalHistory.length - 3} more entries
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                            No medical history recorded
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Full Tabs View */}
                    <div className="mt-6">
                        <Tabs defaultValue="encounters" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="encounters">All Encounters ({encounters.length})</TabsTrigger>
                                <TabsTrigger value="vitals">Vital Signs Trends</TabsTrigger>
                                <TabsTrigger value="diagnoses">All Diagnoses ({diagnoses.length})</TabsTrigger>
                                <TabsTrigger value="summary">Clinical Summary</TabsTrigger>
                            </TabsList>

                            <TabsContent value="encounters" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Complete Encounter History</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {encounters.length > 0 ? (
                                            <div className="space-y-4">
                                                {encounters.map(encounter => (
                                                    <div key={encounter.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="font-medium">
                                                                {formatDateTime(encounter.encounter_datetime)}
                                                            </span>
                                                            <Badge variant="outline" className="capitalize">
                                                                {encounter.encounter_type.replace('_', ' ')}
                                                            </Badge>
                                                            <Badge className={getStatusColor(encounter.status)}>
                                                                {encounter.status}
                                                            </Badge>
                                                        </div>
                                                        {encounter.chief_complaint && (
                                                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                                                                <strong>Chief Complaint:</strong> {encounter.chief_complaint}
                                                            </p>
                                                        )}
                                                        {encounter.clinical_impression && (
                                                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                                                                <strong>Assessment:</strong> {encounter.clinical_impression}
                                                            </p>
                                                        )}
                                                        {encounter.treatment_plan && (
                                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                                <strong>Plan:</strong> {encounter.treatment_plan}
                                                            </p>
                                                        )}
                                                        {encounter.attending_provider && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                                                Provider: {encounter.attending_provider}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                                                No encounters recorded
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="vitals" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5" />
                                            Vital Signs Trends
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {vitalSigns.length > 0 ? (
                                            <div className="space-y-4">
                                                {vitalSigns.slice(0, 10).map(vitals => (
                                                    <div key={vitals.id} className="border border-gray-200 dark:border-gray-700 rounded p-3">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-medium text-sm">
                                                                {formatDateTime(vitals.measured_at)}
                                                            </span>
                                                            {vitals.flagged_abnormal && (
                                                                <Badge variant="destructive" className="text-xs">
                                                                    Abnormal
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                                            {vitals.systolic_bp && vitals.diastolic_bp && (
                                                                <div>BP: {vitals.systolic_bp}/{vitals.diastolic_bp}</div>
                                                            )}
                                                            {vitals.heart_rate && (
                                                                <div>HR: {vitals.heart_rate}</div>
                                                            )}
                                                            {vitals.temperature && (
                                                                <div>Temp: {vitals.temperature}°{vitals.temperature_unit === 'fahrenheit' ? 'F' : 'C'}</div>
                                                            )}
                                                            {vitals.respiratory_rate && (
                                                                <div>RR: {vitals.respiratory_rate}</div>
                                                            )}
                                                            {vitals.oxygen_saturation && (
                                                                <div>SpO2: {vitals.oxygen_saturation}%</div>
                                                            )}
                                                            {vitals.weight && (
                                                                <div>Weight: {vitals.weight} kg</div>
                                                            )}
                                                        </div>
                                                        {vitals.pain_score && parseInt(vitals.pain_score.toString()) > 0 && (
                                                            <div className="text-xs text-orange-600 mt-1">
                                                                Pain: {vitals.pain_score}/10 {vitals.pain_location && `(${vitals.pain_location})`}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                                                No vital signs recorded
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="diagnoses" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Complete Diagnosis History</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {diagnoses.length > 0 ? (
                                            <div className="space-y-3">
                                                {diagnoses.map(diagnosis => (
                                                    <div key={diagnosis.id} className="border border-gray-200 dark:border-gray-700 rounded p-3">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium">{diagnosis.diagnosis_name}</span>
                                                            {diagnosis.icd10_code && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    {diagnosis.icd10_code}
                                                                </Badge>
                                                            )}
                                                            <Badge className={getSeverityColor(diagnosis.severity)}>
                                                                {diagnosis.severity}
                                                            </Badge>
                                                            <Badge className={getStatusColor(diagnosis.status)}>
                                                                {diagnosis.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-500">
                                                            Diagnosed: {formatDate(diagnosis.diagnosis_date)}
                                                            {diagnosis.diagnosed_by && ` by ${diagnosis.diagnosed_by}`}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                                                No diagnoses recorded
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="summary" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Clinical Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <h4 className="font-semibold mb-2">Active Conditions</h4>
                                                    <p>Diagnoses: {activeDiagnoses.length}</p>
                                                    <p>Allergies: {activeAllergies.length}</p>
                                                    <p>Current Medications: {currentMedications.length}</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold mb-2">Care Activity</h4>
                                                    <p>Total Encounters: {encounters.length}</p>
                                                    <p>Vital Signs Records: {vitalSigns.length}</p>
                                                    <p>Medical History Entries: {medicalHistory.length}</p>
                                                </div>
                                            </div>
                                            
                                            {patient.last_visit_date && (
                                                <div className="pt-4 border-t">
                                                    <p className="text-sm">
                                                        <strong>Last Visit:</strong> {formatDate(patient.last_visit_date)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
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

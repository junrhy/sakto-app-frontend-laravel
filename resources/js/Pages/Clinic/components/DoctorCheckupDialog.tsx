import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/Components/ui/alert-dialog";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Calendar } from "@/Components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { 
    Stethoscope, 
    FileText, 
    History, 
    Save, 
    CalendarIcon,
    User,
    Activity,
    Thermometer,
    Heart,
    AlertTriangle,
    Plus,
    X
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Patient, NewPatientEncounter, PatientVitalSigns, PatientDiagnosis } from '../types';
import { formatDateTime, formatDate } from '../utils';

interface DoctorCheckupDialogProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
    onSubmit: (encounterData: NewPatientEncounter) => void;
    onViewDentalChart: (patient: Patient) => void;
    onViewFullHistory: (patient: Patient) => void;
}

interface VitalSigns {
    systolic_bp: string;
    diastolic_bp: string;
    bp_position: 'sitting' | 'standing' | 'lying';
    heart_rate: string;
    heart_rhythm: 'regular' | 'irregular';
    respiratory_rate: string;
    temperature: string;
    temperature_unit: 'celsius' | 'fahrenheit';
    temperature_route: 'oral' | 'rectal' | 'axillary' | 'tympanic' | 'temporal';
    oxygen_saturation: string;
    on_oxygen: boolean;
    weight: string;
    height: string;
    pain_score: string;
    pain_location: string;
    pain_quality: string;
}

interface DiagnosisEntry {
    diagnosis_name: string;
    diagnosis_description: string;
    icd10_code: string;
    diagnosis_type: 'primary' | 'secondary' | 'differential' | 'rule_out' | 'provisional' | 'confirmed';
    category: 'acute' | 'chronic' | 'resolved' | 'recurring' | 'unknown';
    severity: 'mild' | 'moderate' | 'severe' | 'critical' | 'unknown';
    status: 'active' | 'resolved' | 'in_remission' | 'recurrent' | 'inactive';
    clinical_notes: string;
}

export const DoctorCheckupDialog: React.FC<DoctorCheckupDialogProps> = ({
    isOpen,
    onClose,
    patient,
    onSubmit,
    onViewDentalChart,
    onViewFullHistory
}) => {
    // Basic encounter information
    const [encounterDate, setEncounterDate] = useState<Date>(new Date());
    const [encounterType, setEncounterType] = useState<NewPatientEncounter['encounter_type']>('outpatient');
    const [encounterClass, setEncounterClass] = useState<NewPatientEncounter['encounter_class']>('ambulatory');
    const [attendingProvider, setAttendingProvider] = useState('');
    const [location, setLocation] = useState('');
    const [roomNumber, setRoomNumber] = useState('');

    // SOAP Documentation
    const [chiefComplaint, setChiefComplaint] = useState('');
    const [historyPresentIllness, setHistoryPresentIllness] = useState('');
    const [reviewOfSystems, setReviewOfSystems] = useState('');
    const [physicalExamination, setPhysicalExamination] = useState('');
    const [laboratoryResults, setLaboratoryResults] = useState('');
    const [diagnosticResults, setDiagnosticResults] = useState('');
    const [clinicalImpression, setClinicalImpression] = useState('');
    const [differentialDiagnosis, setDifferentialDiagnosis] = useState('');
    const [treatmentPlan, setTreatmentPlan] = useState('');
    const [medicationsPrescribed, setMedicationsPrescribed] = useState('');
    const [proceduresOrdered, setProceduresOrdered] = useState('');
    const [followUpInstructions, setFollowUpInstructions] = useState('');
    const [nextAppointmentDate, setNextAppointmentDate] = useState<Date | undefined>();

    // Patient education and communication
    const [patientEducationProvided, setPatientEducationProvided] = useState('');
    const [patientUnderstandingLevel, setPatientUnderstandingLevel] = useState('');
    const [interpreterUsed, setInterpreterUsed] = useState(false);
    const [interpreterLanguage, setInterpreterLanguage] = useState('');

    // Additional notes
    const [additionalNotes, setAdditionalNotes] = useState('');

    // Vital Signs
    const [vitalSigns, setVitalSigns] = useState<VitalSigns>({
        systolic_bp: '',
        diastolic_bp: '',
        bp_position: 'sitting',
        heart_rate: '',
        heart_rhythm: 'regular',
        respiratory_rate: '',
        temperature: '',
        temperature_unit: 'celsius',
        temperature_route: 'oral',
        oxygen_saturation: '',
        on_oxygen: false,
        weight: '',
        height: '',
        pain_score: '',
        pain_location: '',
        pain_quality: ''
    });

    // Diagnoses
    const [diagnoses, setDiagnoses] = useState<DiagnosisEntry[]>([]);

    // Form state tracking for preventing data loss
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

    // Track form changes to detect unsaved data
    useEffect(() => {
        const hasData = !!(
            attendingProvider.trim() ||
            location.trim() ||
            roomNumber.trim() ||
            chiefComplaint.trim() ||
            historyPresentIllness.trim() ||
            reviewOfSystems.trim() ||
            physicalExamination.trim() ||
            laboratoryResults.trim() ||
            diagnosticResults.trim() ||
            clinicalImpression.trim() ||
            differentialDiagnosis.trim() ||
            treatmentPlan.trim() ||
            medicationsPrescribed.trim() ||
            proceduresOrdered.trim() ||
            followUpInstructions.trim() ||
            patientEducationProvided.trim() ||
            patientUnderstandingLevel.trim() ||
            interpreterLanguage.trim() ||
            additionalNotes.trim() ||
            Object.values(vitalSigns).some(value => typeof value === 'string' ? value.trim() : (typeof value === 'boolean' ? value : false)) ||
            diagnoses.length > 0
        );

        setHasUnsavedChanges(hasData);
    }, [
        attendingProvider, location, roomNumber, chiefComplaint, historyPresentIllness,
        reviewOfSystems, physicalExamination, laboratoryResults, diagnosticResults,
        clinicalImpression, differentialDiagnosis, treatmentPlan, medicationsPrescribed,
        proceduresOrdered, followUpInstructions, patientEducationProvided,
        patientUnderstandingLevel, interpreterLanguage, additionalNotes, vitalSigns, diagnoses
    ]);

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

    const handleVitalSignChange = (field: keyof VitalSigns, value: any) => {
        setVitalSigns(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const addDiagnosis = () => {
        setDiagnoses(prev => [...prev, {
            diagnosis_name: '',
            diagnosis_description: '',
            icd10_code: '',
            diagnosis_type: 'primary',
            category: 'acute',
            severity: 'mild',
            status: 'active',
            clinical_notes: ''
        }]);
    };

    const removeDiagnosis = (index: number) => {
        setDiagnoses(prev => prev.filter((_, i) => i !== index));
    };

    const updateDiagnosis = (index: number, field: keyof DiagnosisEntry, value: string) => {
        setDiagnoses(prev => prev.map((diagnosis, i) => 
            i === index ? { ...diagnosis, [field]: value } : diagnosis
        ));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!patient || !attendingProvider.trim()) {
            return;
        }

        // Prepare vital signs data (only include non-empty values)
        const vitalSignsData: Partial<PatientVitalSigns> = {};
        if (vitalSigns.systolic_bp) vitalSignsData.systolic_bp = parseFloat(vitalSigns.systolic_bp);
        if (vitalSigns.diastolic_bp) vitalSignsData.diastolic_bp = parseFloat(vitalSigns.diastolic_bp);
        if (vitalSigns.heart_rate) vitalSignsData.heart_rate = parseFloat(vitalSigns.heart_rate);
        if (vitalSigns.respiratory_rate) vitalSignsData.respiratory_rate = parseFloat(vitalSigns.respiratory_rate);
        if (vitalSigns.temperature) vitalSignsData.temperature = parseFloat(vitalSigns.temperature);
        if (vitalSigns.oxygen_saturation) vitalSignsData.oxygen_saturation = parseFloat(vitalSigns.oxygen_saturation);
        if (vitalSigns.weight) vitalSignsData.weight = parseFloat(vitalSigns.weight);
        if (vitalSigns.height) vitalSignsData.height = parseFloat(vitalSigns.height);
        if (vitalSigns.pain_score) vitalSignsData.pain_score = parseInt(vitalSigns.pain_score);

        // Add additional vital signs properties
        if (Object.keys(vitalSignsData).length > 0) {
            vitalSignsData.measured_at = format(encounterDate, 'yyyy-MM-dd HH:mm:ss');
            vitalSignsData.bp_position = vitalSigns.bp_position;
            vitalSignsData.heart_rhythm = vitalSigns.heart_rhythm;
            vitalSignsData.temperature_unit = vitalSigns.temperature_unit;
            vitalSignsData.temperature_route = vitalSigns.temperature_route;
            vitalSignsData.on_oxygen = vitalSigns.on_oxygen;
            if (vitalSigns.pain_location) vitalSignsData.pain_location = vitalSigns.pain_location;
            if (vitalSigns.pain_quality) vitalSignsData.pain_quality = vitalSigns.pain_quality;
        }

        // Prepare diagnoses data (only include non-empty diagnoses)
        const diagnosesData = diagnoses.filter(d => d.diagnosis_name.trim()).map(diagnosis => ({
            ...diagnosis,
            diagnosis_date: format(encounterDate, 'yyyy-MM-dd')
        }));

        const encounterData: NewPatientEncounter = {
            client_identifier: patient.id, // Using patient.id as client_identifier for now
            patient_id: parseInt(patient.id),
            encounter_datetime: format(encounterDate, 'yyyy-MM-dd HH:mm:ss'),
            encounter_type: encounterType,
            encounter_class: encounterClass,
            attending_provider: attendingProvider,
            location: location || undefined,
            room_number: roomNumber || undefined,
            
            // SOAP Documentation
            chief_complaint: chiefComplaint || undefined,
            history_present_illness: historyPresentIllness || undefined,
            review_of_systems: reviewOfSystems || undefined,
            physical_examination: physicalExamination || undefined,
            laboratory_results: laboratoryResults || undefined,
            diagnostic_results: diagnosticResults || undefined,
            clinical_impression: clinicalImpression || undefined,
            differential_diagnosis: differentialDiagnosis || undefined,
            treatment_plan: treatmentPlan || undefined,
            medications_prescribed: medicationsPrescribed || undefined,
            procedures_ordered: proceduresOrdered || undefined,
            follow_up_instructions: followUpInstructions || undefined,
            next_appointment_date: nextAppointmentDate ? format(nextAppointmentDate, 'yyyy-MM-dd') : undefined,
            
            // Patient education and communication
            patient_education_provided: patientEducationProvided || undefined,
            patient_understanding_level: patientUnderstandingLevel || undefined,
            interpreter_used: interpreterUsed,
            interpreter_language: interpreterLanguage || undefined,
            
            // Status and workflow
            status: 'completed',
            priority: 'routine',
            requires_follow_up: !!nextAppointmentDate,
            documentation_complete: true,
            documented_by: attendingProvider,
            additional_notes: additionalNotes || undefined,
            
            // Include vital signs if any were recorded
            vital_signs: Object.keys(vitalSignsData).length > 0 ? vitalSignsData as any : undefined,
            
            // Include diagnoses if any were added
            diagnoses: diagnosesData.length > 0 ? diagnosesData as any : undefined
        };

        onSubmit(encounterData);
        resetForm();
        onClose();
    };

    const resetForm = () => {
        // Reset all form fields
        setEncounterDate(new Date());
        setEncounterType('outpatient');
        setEncounterClass('ambulatory');
        setAttendingProvider('');
        setLocation('');
        setRoomNumber('');
        setChiefComplaint('');
        setHistoryPresentIllness('');
        setReviewOfSystems('');
        setPhysicalExamination('');
        setLaboratoryResults('');
        setDiagnosticResults('');
        setClinicalImpression('');
        setDifferentialDiagnosis('');
        setTreatmentPlan('');
        setMedicationsPrescribed('');
        setProceduresOrdered('');
        setFollowUpInstructions('');
        setNextAppointmentDate(undefined);
        setPatientEducationProvided('');
        setPatientUnderstandingLevel('');
        setInterpreterUsed(false);
        setInterpreterLanguage('');
        setAdditionalNotes('');
        setVitalSigns({
            systolic_bp: '',
            diastolic_bp: '',
            bp_position: 'sitting',
            heart_rate: '',
            heart_rhythm: 'regular',
            respiratory_rate: '',
            temperature: '',
            temperature_unit: 'celsius',
            temperature_route: 'oral',
            oxygen_saturation: '',
            on_oxygen: false,
            weight: '',
            height: '',
            pain_score: '',
            pain_location: '',
            pain_quality: ''
        });
        setDiagnoses([]);
        setHasUnsavedChanges(false);
    };

    const handleClose = () => {
        if (hasUnsavedChanges) {
            setShowCancelConfirmation(true);
        } else {
            resetForm();
            onClose();
        }
    };

    const handleConfirmCancel = () => {
        setShowCancelConfirmation(false);
        resetForm();
        onClose();
    };

    const handleCancelClose = () => {
        setShowCancelConfirmation(false);
    };

    if (!patient) return null;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
                <DialogContent 
                    className="max-w-7xl max-h-[95vh] overflow-hidden"
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Stethoscope className="h-6 w-6 text-gray-800 dark:text-gray-200" />
                            New Clinical Encounter - {patient.name}
                            {hasUnsavedChanges && (
                                <span className="text-sm text-orange-600 dark:text-orange-400 font-normal">
                                    (Unsaved changes)
                                </span>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                <div className="grid grid-cols-4 gap-6 overflow-y-auto max-h-[calc(95vh-150px)] pr-4">
                    {/* Left Sidebar: Patient Context */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Patient Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">ARN: {patient.arn || 'Not Set'}</p>
                                    <p className="text-gray-600 dark:text-gray-400">Age: {calculateAge(patient.birthdate)} years</p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Contact: {patient.phone}</p>
                                    <p className="text-gray-600 dark:text-gray-400">Email: {patient.email}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">DOB: {formatDate(patient.birthdate)}</p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Last Visit: {patient.checkups?.length > 0 
                                            ? formatDate(patient.checkups[patient.checkups.length - 1]?.checkup_date)
                                            : 'First visit'
                                        }
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <History className="h-4 w-4" />
                                    Recent History
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {patient.checkups?.length > 0 ? (
                                    <div className="space-y-3">
                                        {patient.checkups.slice(-3).reverse().map(checkup => (
                                            <div key={checkup.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs border border-gray-200 dark:border-gray-600">
                                                <p className="font-medium text-gray-900 dark:text-white">{formatDate(checkup.checkup_date)}</p>
                                                <p className="text-gray-600 dark:text-gray-300 mt-1">
                                                    {checkup.diagnosis.substring(0, 50)}...
                                                </p>
                                            </div>
                                        ))}
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="w-full text-xs bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                                            onClick={() => onViewFullHistory(patient)}
                                        >
                                            View Full History
                                        </Button>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 text-xs text-center py-4">
                                        No previous encounters
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <div className="space-y-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                                onClick={() => onViewDentalChart(patient)}
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Dental Chart
                            </Button>
                        </div>
                    </div>

                    {/* Main Content: Encounter Form */}
                    <div className="col-span-3">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Encounter Information */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm">Encounter Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                <CalendarIcon className="h-4 w-4" />
                                                Encounter Date & Time
                                            </Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !encounterDate && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {encounterDate ? format(encounterDate, "PPP") : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={encounterDate}
                                                        onSelect={(date) => setEncounterDate(date || new Date())}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Encounter Type</Label>
                                            <Select value={encounterType} onValueChange={(value: any) => setEncounterType(value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="outpatient">Outpatient</SelectItem>
                                                    <SelectItem value="inpatient">Inpatient</SelectItem>
                                                    <SelectItem value="emergency">Emergency</SelectItem>
                                                    <SelectItem value="urgent_care">Urgent Care</SelectItem>
                                                    <SelectItem value="telemedicine">Telemedicine</SelectItem>
                                                    <SelectItem value="home_visit">Home Visit</SelectItem>
                                                    <SelectItem value="consultation">Consultation</SelectItem>
                                                    <SelectItem value="follow_up">Follow-up</SelectItem>
                                                    <SelectItem value="preventive_care">Preventive Care</SelectItem>
                                                    <SelectItem value="procedure">Procedure</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Attending Provider *</Label>
                                            <Input
                                                value={attendingProvider}
                                                onChange={(e) => setAttendingProvider(e.target.value)}
                                                placeholder="Provider name"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Location</Label>
                                            <Input
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                placeholder="Clinic, hospital, department"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Room Number</Label>
                                            <Input
                                                value={roomNumber}
                                                onChange={(e) => setRoomNumber(e.target.value)}
                                                placeholder="Room #"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Encounter Class</Label>
                                            <Select value={encounterClass} onValueChange={(value: any) => setEncounterClass(value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select class" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ambulatory">Ambulatory</SelectItem>
                                                    <SelectItem value="inpatient">Inpatient</SelectItem>
                                                    <SelectItem value="emergency">Emergency</SelectItem>
                                                    <SelectItem value="home_health">Home Health</SelectItem>
                                                    <SelectItem value="virtual">Virtual</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* SOAP Documentation Tabs */}
                            <Tabs defaultValue="soap" className="w-full">
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="soap">SOAP Documentation</TabsTrigger>
                                    <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
                                    <TabsTrigger value="diagnoses">Diagnoses</TabsTrigger>
                                    <TabsTrigger value="additional">Additional Info</TabsTrigger>
                                </TabsList>

                                <TabsContent value="soap" className="space-y-4">
                                    {/* Subjective */}
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm">Subjective</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Chief Complaint</Label>
                                                <Textarea
                                                    placeholder="Patient's main concern or reason for visit..."
                                                    value={chiefComplaint}
                                                    onChange={(e) => setChiefComplaint(e.target.value)}
                                                    className="min-h-[60px]"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>History of Present Illness (HPI)</Label>
                                                <Textarea
                                                    placeholder="Detailed description of current symptoms..."
                                                    value={historyPresentIllness}
                                                    onChange={(e) => setHistoryPresentIllness(e.target.value)}
                                                    className="min-h-[80px]"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Review of Systems (ROS)</Label>
                                                <Textarea
                                                    placeholder="Systematic review of body systems..."
                                                    value={reviewOfSystems}
                                                    onChange={(e) => setReviewOfSystems(e.target.value)}
                                                    className="min-h-[80px]"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Objective */}
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm">Objective</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Physical Examination</Label>
                                                <Textarea
                                                    placeholder="Physical examination findings..."
                                                    value={physicalExamination}
                                                    onChange={(e) => setPhysicalExamination(e.target.value)}
                                                    className="min-h-[80px]"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Laboratory Results</Label>
                                                    <Textarea
                                                        placeholder="Lab test results..."
                                                        value={laboratoryResults}
                                                        onChange={(e) => setLaboratoryResults(e.target.value)}
                                                        className="min-h-[60px]"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Diagnostic Results</Label>
                                                    <Textarea
                                                        placeholder="Imaging, EKG, other diagnostics..."
                                                        value={diagnosticResults}
                                                        onChange={(e) => setDiagnosticResults(e.target.value)}
                                                        className="min-h-[60px]"
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Assessment */}
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm">Assessment</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Clinical Impression</Label>
                                                <Textarea
                                                    placeholder="Clinical assessment and impression..."
                                                    value={clinicalImpression}
                                                    onChange={(e) => setClinicalImpression(e.target.value)}
                                                    className="min-h-[60px]"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Differential Diagnosis</Label>
                                                <Textarea
                                                    placeholder="Other conditions being considered..."
                                                    value={differentialDiagnosis}
                                                    onChange={(e) => setDifferentialDiagnosis(e.target.value)}
                                                    className="min-h-[60px]"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Plan */}
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm">Plan</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Treatment Plan</Label>
                                                <Textarea
                                                    placeholder="Treatment approach and plan..."
                                                    value={treatmentPlan}
                                                    onChange={(e) => setTreatmentPlan(e.target.value)}
                                                    className="min-h-[60px]"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Medications Prescribed</Label>
                                                    <Textarea
                                                        placeholder="Medications and dosages..."
                                                        value={medicationsPrescribed}
                                                        onChange={(e) => setMedicationsPrescribed(e.target.value)}
                                                        className="min-h-[60px]"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Procedures Ordered</Label>
                                                    <Textarea
                                                        placeholder="Tests, procedures, referrals..."
                                                        value={proceduresOrdered}
                                                        onChange={(e) => setProceduresOrdered(e.target.value)}
                                                        className="min-h-[60px]"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Follow-up Instructions</Label>
                                                    <Textarea
                                                        placeholder="Patient instructions for follow-up..."
                                                        value={followUpInstructions}
                                                        onChange={(e) => setFollowUpInstructions(e.target.value)}
                                                        className="min-h-[60px]"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Next Appointment Date</Label>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className={cn(
                                                                    "w-full justify-start text-left font-normal",
                                                                    !nextAppointmentDate && "text-muted-foreground"
                                                                )}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {nextAppointmentDate ? format(nextAppointmentDate, "PPP") : <span>Select date</span>}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={nextAppointmentDate}
                                                                onSelect={setNextAppointmentDate}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="vitals" className="space-y-4">
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm flex items-center gap-2">
                                                <Activity className="h-4 w-4" />
                                                Vital Signs
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Systolic BP (mmHg)</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="120"
                                                        value={vitalSigns.systolic_bp}
                                                        onChange={(e) => handleVitalSignChange('systolic_bp', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Diastolic BP (mmHg)</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="80"
                                                        value={vitalSigns.diastolic_bp}
                                                        onChange={(e) => handleVitalSignChange('diastolic_bp', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>BP Position</Label>
                                                    <Select value={vitalSigns.bp_position} onValueChange={(value: any) => handleVitalSignChange('bp_position', value)}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="sitting">Sitting</SelectItem>
                                                            <SelectItem value="standing">Standing</SelectItem>
                                                            <SelectItem value="lying">Lying</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Heart Rate (bpm)</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="72"
                                                        value={vitalSigns.heart_rate}
                                                        onChange={(e) => handleVitalSignChange('heart_rate', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Heart Rhythm</Label>
                                                    <Select value={vitalSigns.heart_rhythm} onValueChange={(value: any) => handleVitalSignChange('heart_rhythm', value)}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="regular">Regular</SelectItem>
                                                            <SelectItem value="irregular">Irregular</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Respiratory Rate (/min)</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="16"
                                                        value={vitalSigns.respiratory_rate}
                                                        onChange={(e) => handleVitalSignChange('respiratory_rate', e.target.value)}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Temperature</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        placeholder="36.5"
                                                        value={vitalSigns.temperature}
                                                        onChange={(e) => handleVitalSignChange('temperature', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Temperature Unit</Label>
                                                    <Select value={vitalSigns.temperature_unit} onValueChange={(value: any) => handleVitalSignChange('temperature_unit', value)}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="celsius">Celsius</SelectItem>
                                                            <SelectItem value="fahrenheit">Fahrenheit</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Temperature Route</Label>
                                                    <Select value={vitalSigns.temperature_route} onValueChange={(value: any) => handleVitalSignChange('temperature_route', value)}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="oral">Oral</SelectItem>
                                                            <SelectItem value="rectal">Rectal</SelectItem>
                                                            <SelectItem value="axillary">Axillary</SelectItem>
                                                            <SelectItem value="tympanic">Tympanic</SelectItem>
                                                            <SelectItem value="temporal">Temporal</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Oxygen Saturation (%)</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="98"
                                                        value={vitalSigns.oxygen_saturation}
                                                        onChange={(e) => handleVitalSignChange('oxygen_saturation', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Weight (kg)</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        placeholder="70"
                                                        value={vitalSigns.weight}
                                                        onChange={(e) => handleVitalSignChange('weight', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Height (cm)</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="170"
                                                        value={vitalSigns.height}
                                                        onChange={(e) => handleVitalSignChange('height', e.target.value)}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Pain Score (0-10)</Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="10"
                                                        placeholder="0"
                                                        value={vitalSigns.pain_score}
                                                        onChange={(e) => handleVitalSignChange('pain_score', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Pain Location</Label>
                                                    <Input
                                                        placeholder="Location of pain"
                                                        value={vitalSigns.pain_location}
                                                        onChange={(e) => handleVitalSignChange('pain_location', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Pain Quality</Label>
                                                    <Input
                                                        placeholder="Sharp, dull, throbbing..."
                                                        value={vitalSigns.pain_quality}
                                                        onChange={(e) => handleVitalSignChange('pain_quality', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="diagnoses" className="space-y-4">
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4" />
                                                Diagnoses
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={addDiagnosis}
                                                    className="ml-auto"
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Add Diagnosis
                                                </Button>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {diagnoses.length === 0 ? (
                                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                    <p>No diagnoses added yet</p>
                                                    <p className="text-sm">Click "Add Diagnosis" to add a diagnosis</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {diagnoses.map((diagnosis, index) => (
                                                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 relative">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => removeDiagnosis(index)}
                                                                className="absolute top-2 right-2 h-6 w-6 p-0"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                            
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <Label>Diagnosis Name *</Label>
                                                                    <Input
                                                                        value={diagnosis.diagnosis_name}
                                                                        onChange={(e) => updateDiagnosis(index, 'diagnosis_name', e.target.value)}
                                                                        placeholder="Primary diagnosis"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>ICD-10 Code</Label>
                                                                    <Input
                                                                        value={diagnosis.icd10_code}
                                                                        onChange={(e) => updateDiagnosis(index, 'icd10_code', e.target.value)}
                                                                        placeholder="ICD-10 code"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>Diagnosis Type</Label>
                                                                    <Select value={diagnosis.diagnosis_type} onValueChange={(value) => updateDiagnosis(index, 'diagnosis_type', value)}>
                                                                        <SelectTrigger>
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="primary">Primary</SelectItem>
                                                                            <SelectItem value="secondary">Secondary</SelectItem>
                                                                            <SelectItem value="differential">Differential</SelectItem>
                                                                            <SelectItem value="rule_out">Rule Out</SelectItem>
                                                                            <SelectItem value="provisional">Provisional</SelectItem>
                                                                            <SelectItem value="confirmed">Confirmed</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>Severity</Label>
                                                                    <Select value={diagnosis.severity} onValueChange={(value) => updateDiagnosis(index, 'severity', value)}>
                                                                        <SelectTrigger>
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="mild">Mild</SelectItem>
                                                                            <SelectItem value="moderate">Moderate</SelectItem>
                                                                            <SelectItem value="severe">Severe</SelectItem>
                                                                            <SelectItem value="critical">Critical</SelectItem>
                                                                            <SelectItem value="unknown">Unknown</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <div className="col-span-2 space-y-2">
                                                                    <Label>Description</Label>
                                                                    <Textarea
                                                                        value={diagnosis.diagnosis_description}
                                                                        onChange={(e) => updateDiagnosis(index, 'diagnosis_description', e.target.value)}
                                                                        placeholder="Detailed description of the diagnosis..."
                                                                        className="min-h-[60px]"
                                                                    />
                                                                </div>
                                                                <div className="col-span-2 space-y-2">
                                                                    <Label>Clinical Notes</Label>
                                                                    <Textarea
                                                                        value={diagnosis.clinical_notes}
                                                                        onChange={(e) => updateDiagnosis(index, 'clinical_notes', e.target.value)}
                                                                        placeholder="Additional clinical notes..."
                                                                        className="min-h-[60px]"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="additional" className="space-y-4">
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm">Patient Education & Communication</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Patient Education Provided</Label>
                                                <Textarea
                                                    placeholder="Education provided to patient..."
                                                    value={patientEducationProvided}
                                                    onChange={(e) => setPatientEducationProvided(e.target.value)}
                                                    className="min-h-[60px]"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Patient Understanding Level</Label>
                                                <Textarea
                                                    placeholder="Assessment of patient's understanding..."
                                                    value={patientUnderstandingLevel}
                                                    onChange={(e) => setPatientUnderstandingLevel(e.target.value)}
                                                    className="min-h-[60px]"
                                                />
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id="interpreterUsed"
                                                    checked={interpreterUsed}
                                                    onChange={(e) => setInterpreterUsed(e.target.checked)}
                                                />
                                                <Label htmlFor="interpreterUsed">Interpreter Used</Label>
                                            </div>
                                            {interpreterUsed && (
                                                <div className="space-y-2">
                                                    <Label>Interpreter Language</Label>
                                                    <Input
                                                        value={interpreterLanguage}
                                                        onChange={(e) => setInterpreterLanguage(e.target.value)}
                                                        placeholder="Language used"
                                                    />
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm">Additional Notes</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <Label>Additional Clinical Notes</Label>
                                                <Textarea
                                                    placeholder="Any additional observations, notes, or comments..."
                                                    value={additionalNotes}
                                                    onChange={(e) => setAdditionalNotes(e.target.value)}
                                                    className="min-h-[100px]"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>

                            <DialogFooter className="gap-2">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={handleClose}
                                    className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white"
                                    disabled={!attendingProvider.trim()}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Clinical Encounter
                                </Button>
                            </DialogFooter>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>

        {/* Cancel Confirmation Dialog */}
        <AlertDialog open={showCancelConfirmation} onOpenChange={setShowCancelConfirmation}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Unsaved Clinical Data
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        You have unsaved clinical encounter data. If you close this dialog, all entered information will be lost.
                        <br /><br />
                        <strong>This includes:</strong>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>SOAP documentation (Subjective, Objective, Assessment, Plan)</li>
                            <li>Vital signs measurements</li>
                            <li>Diagnosis information</li>
                            <li>Patient education notes</li>
                        </ul>
                        <br />
                        Are you sure you want to discard all changes and close the dialog?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleCancelClose}>
                        Continue Editing
                    </AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleConfirmCancel}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        Discard Changes
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    );
};
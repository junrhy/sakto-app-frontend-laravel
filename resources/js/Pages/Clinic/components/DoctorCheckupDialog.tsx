import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Calendar } from "@/Components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover";
import { 
    Stethoscope, 
    FileText, 
    History, 
    Save, 
    CalendarIcon,
    User,
    Activity,
    Thermometer
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Patient, NewCheckupResult } from '../types';
import { formatDateTime, formatDate } from '../utils';

interface DoctorCheckupDialogProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
    onSubmit: (checkupData: NewCheckupResult & { date: Date }) => void;
    onViewDentalChart: (patient: Patient) => void;
    onViewFullHistory: (patient: Patient) => void;
}

interface VitalSigns {
    bloodPressure: string;
    pulse: string;
    temperature: string;
    weight: string;
    height: string;
    respiratoryRate: string;
}

export const DoctorCheckupDialog: React.FC<DoctorCheckupDialogProps> = ({
    isOpen,
    onClose,
    patient,
    onSubmit,
    onViewDentalChart,
    onViewFullHistory
}) => {
    const [checkupDate, setCheckupDate] = useState<Date>(new Date());
    const [chiefComplaint, setChiefComplaint] = useState('');
    const [vitalSigns, setVitalSigns] = useState<VitalSigns>({
        bloodPressure: '',
        pulse: '',
        temperature: '',
        weight: '',
        height: '',
        respiratoryRate: ''
    });
    const [physicalExamination, setPhysicalExamination] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [treatment, setTreatment] = useState('');
    const [notes, setNotes] = useState('');
    const [followUpDate, setFollowUpDate] = useState<Date | undefined>();

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

    const handleVitalSignChange = (field: keyof VitalSigns, value: string) => {
        setVitalSigns(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Combine all data into the checkup format
        const vitalSignsText = Object.entries(vitalSigns)
            .filter(([_, value]) => value.trim() !== '')
            .map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${value}`)
            .join(', ');

        const fullNotes = [
            chiefComplaint && `Chief Complaint: ${chiefComplaint}`,
            vitalSignsText && `Vital Signs: ${vitalSignsText}`,
            physicalExamination && `Physical Examination: ${physicalExamination}`,
            notes && `Additional Notes: ${notes}`,
            followUpDate && `Follow-up scheduled: ${format(followUpDate, 'PPP')}`
        ].filter(Boolean).join('\n\n');

        const checkupData: NewCheckupResult & { date: Date } = {
            checkup_date: format(checkupDate, 'yyyy-MM-dd HH:mm:ss'),
            date: format(checkupDate, 'yyyy-MM-dd'),
            diagnosis,
            treatment,
            notes: fullNotes
        };

        onSubmit(checkupData);
        handleClose();
    };

    const handleClose = () => {
        // Reset form
        setCheckupDate(new Date());
        setChiefComplaint('');
        setVitalSigns({
            bloodPressure: '',
            pulse: '',
            temperature: '',
            weight: '',
            height: '',
            respiratoryRate: ''
        });
        setPhysicalExamination('');
        setDiagnosis('');
        setTreatment('');
        setNotes('');
        setFollowUpDate(undefined);
        onClose();
    };

    if (!patient) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Stethoscope className="h-6 w-6 text-blue-600" />
                        New Checkup - {patient.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-4 gap-6 overflow-y-auto max-h-[calc(95vh-150px)]">
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
                                        No previous checkups
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

                    {/* Main Content: Checkup Form */}
                    <div className="col-span-3">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Date and Chief Complaint */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4" />
                                        Checkup Date
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !checkupDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {checkupDate ? format(checkupDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={checkupDate}
                                                onSelect={(date) => setCheckupDate(date || new Date())}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-900 dark:text-white">Chief Complaint</Label>
                                    <Textarea
                                        placeholder="Patient's main concern or reason for visit..."
                                        value={chiefComplaint}
                                        onChange={(e) => setChiefComplaint(e.target.value)}
                                        className="min-h-[80px] bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                    />
                                </div>
                            </div>

                            {/* Vital Signs */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Activity className="h-4 w-4" />
                                        Vital Signs
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <Label className="text-xs text-gray-900 dark:text-white">Blood Pressure</Label>
                                            <Input
                                                placeholder="120/80 mmHg"
                                                value={vitalSigns.bloodPressure}
                                                onChange={(e) => handleVitalSignChange('bloodPressure', e.target.value)}
                                                className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs text-gray-900 dark:text-white">Pulse Rate</Label>
                                            <Input
                                                placeholder="72 bpm"
                                                value={vitalSigns.pulse}
                                                onChange={(e) => handleVitalSignChange('pulse', e.target.value)}
                                                className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs text-gray-900 dark:text-white">Temperature</Label>
                                            <Input
                                                placeholder="98.6°F"
                                                value={vitalSigns.temperature}
                                                onChange={(e) => handleVitalSignChange('temperature', e.target.value)}
                                                className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs text-gray-900 dark:text-white">Weight</Label>
                                            <Input
                                                placeholder="70 kg"
                                                value={vitalSigns.weight}
                                                onChange={(e) => handleVitalSignChange('weight', e.target.value)}
                                                className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs text-gray-900 dark:text-white">Height</Label>
                                            <Input
                                                placeholder="170 cm"
                                                value={vitalSigns.height}
                                                onChange={(e) => handleVitalSignChange('height', e.target.value)}
                                                className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs text-gray-900 dark:text-white">Respiratory Rate</Label>
                                            <Input
                                                placeholder="16 /min"
                                                value={vitalSigns.respiratoryRate}
                                                onChange={(e) => handleVitalSignChange('respiratoryRate', e.target.value)}
                                                className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Physical Examination */}
                            <div className="space-y-2">
                                <Label className="text-gray-900 dark:text-white">Physical Examination</Label>
                                <Textarea
                                    placeholder="Physical examination findings, observations..."
                                    value={physicalExamination}
                                    onChange={(e) => setPhysicalExamination(e.target.value)}
                                    className="min-h-[100px] bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                />
                            </div>

                            {/* Diagnosis and Treatment */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-900 dark:text-white">Diagnosis *</Label>
                                    <Textarea
                                        placeholder="Primary and secondary diagnoses..."
                                        value={diagnosis}
                                        onChange={(e) => setDiagnosis(e.target.value)}
                                        className="min-h-[100px] bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-900 dark:text-white">Treatment Plan *</Label>
                                    <Textarea
                                        placeholder="Medications, procedures, recommendations..."
                                        value={treatment}
                                        onChange={(e) => setTreatment(e.target.value)}
                                        className="min-h-[100px] bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Additional Notes and Follow-up */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-900 dark:text-white">Additional Notes</Label>
                                    <Textarea
                                        placeholder="Additional observations, patient instructions..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="min-h-[80px] bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-900 dark:text-white">Follow-up Date (Optional)</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600",
                                                    !followUpDate && "text-muted-foreground dark:text-gray-400"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {followUpDate ? format(followUpDate, "PPP") : <span>Select follow-up date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={followUpDate}
                                                onSelect={setFollowUpDate}
                                                initialFocus
                                                className="bg-white dark:bg-gray-800"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <DialogFooter className="gap-2">
                                <Button type="button" variant="outline" onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Checkup
                                </Button>
                            </DialogFooter>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

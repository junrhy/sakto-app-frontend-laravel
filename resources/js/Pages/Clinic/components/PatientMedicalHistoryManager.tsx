import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Badge } from "@/Components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { 
    FileText, 
    Plus, 
    Edit, 
    Trash2, 
    Save,
    X,
    Heart,
    Users,
    Scissors,
    Shield,
    Activity
} from 'lucide-react';
import { Patient, PatientMedicalHistory, NewPatientMedicalHistory } from '../types';
import { formatDate } from '../utils';
import { toast } from 'sonner';

interface PatientMedicalHistoryManagerProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
    medicalHistory: PatientMedicalHistory[];
    onAddHistory: (history: NewPatientMedicalHistory) => void;
    onUpdateHistory: (id: number, history: Partial<PatientMedicalHistory>) => void;
    onDeleteHistory: (id: number) => void;
}

interface HistoryFormData {
    type: PatientMedicalHistory['type'];
    condition_name: string;
    description: string;
    date_occurred: string;
    icd10_code: string;
    family_relationship: string;
    age_at_diagnosis: string;
    surgeon_name: string;
    hospital_name: string;
    complications: string;
    status: PatientMedicalHistory['status'];
    severity: PatientMedicalHistory['severity'];
    notes: string;
    source: PatientMedicalHistory['source'];
}

const initialFormData: HistoryFormData = {
    type: 'past_illness',
    condition_name: '',
    description: '',
    date_occurred: '',
    icd10_code: '',
    family_relationship: '',
    age_at_diagnosis: '',
    surgeon_name: '',
    hospital_name: '',
    complications: '',
    status: 'unknown',
    severity: 'unknown',
    notes: '',
    source: 'patient_reported'
};

export const PatientMedicalHistoryManager: React.FC<PatientMedicalHistoryManagerProps> = ({
    isOpen,
    onClose,
    patient,
    medicalHistory,
    onAddHistory,
    onUpdateHistory,
    onDeleteHistory
}) => {
    const [isAddingHistory, setIsAddingHistory] = useState(false);
    const [editingHistory, setEditingHistory] = useState<PatientMedicalHistory | null>(null);
    const [formData, setFormData] = useState<HistoryFormData>(initialFormData);
    const [activeTab, setActiveTab] = useState('past_illness');

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'past_illness': return <Heart className="h-4 w-4" />;
            case 'surgery': return <Scissors className="h-4 w-4" />;
            case 'hospitalization': return <Activity className="h-4 w-4" />;
            case 'family_history': return <Users className="h-4 w-4" />;
            case 'immunization': return <Shield className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'chronic': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'severe': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'moderate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'mild': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    const handleStartAdd = (type?: PatientMedicalHistory['type']) => {
        setFormData({ ...initialFormData, type: type || 'past_illness' });
        setIsAddingHistory(true);
        if (type) {
            setActiveTab(type);
        }
    };

    const handleStartEdit = (history: PatientMedicalHistory) => {
        setFormData({
            type: history.type,
            condition_name: history.condition_name,
            description: history.description || '',
            date_occurred: history.date_occurred || '',
            icd10_code: history.icd10_code || '',
            family_relationship: history.family_relationship || '',
            age_at_diagnosis: history.age_at_diagnosis?.toString() || '',
            surgeon_name: history.surgeon_name || '',
            hospital_name: history.hospital_name || '',
            complications: history.complications || '',
            status: history.status,
            severity: history.severity,
            notes: history.notes || '',
            source: history.source
        });
        setEditingHistory(history);
        setActiveTab(history.type);
    };

    const handleCancelForm = () => {
        setIsAddingHistory(false);
        setEditingHistory(null);
        setFormData(initialFormData);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!patient || !formData.condition_name.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        const historyData = {
            ...formData,
            patient_id: parseInt(patient.id),
            age_at_diagnosis: formData.age_at_diagnosis ? parseInt(formData.age_at_diagnosis) : undefined
        };

        if (editingHistory) {
            onUpdateHistory(editingHistory.id, historyData);
            toast.success('Medical history updated successfully');
        } else {
            onAddHistory(historyData);
            toast.success('Medical history added successfully');
        }

        handleCancelForm();
    };

    const handleDelete = (history: PatientMedicalHistory) => {
        if (window.confirm(`Are you sure you want to delete the history entry for ${history.condition_name}?`)) {
            onDeleteHistory(history.id);
            toast.success('Medical history deleted successfully');
        }
    };

    if (!patient) return null;

    // Group medical history by type
    const groupedHistory = {
        past_illness: medicalHistory.filter(h => h.type === 'past_illness'),
        surgery: medicalHistory.filter(h => h.type === 'surgery'),
        hospitalization: medicalHistory.filter(h => h.type === 'hospitalization'),
        family_history: medicalHistory.filter(h => h.type === 'family_history'),
        immunization: medicalHistory.filter(h => h.type === 'immunization'),
        social_history: medicalHistory.filter(h => h.type === 'social_history'),
        other: medicalHistory.filter(h => h.type === 'other')
    };

    const renderHistoryList = (histories: PatientMedicalHistory[]) => {
        if (histories.length === 0) {
            return (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No entries recorded</p>
                </div>
            );
        }

        return (
            <div className="space-y-3">
                {histories.map(history => (
                    <div key={history.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold text-lg">{history.condition_name}</h4>
                                    {history.icd10_code && (
                                        <Badge variant="outline" className="text-xs">
                                            {history.icd10_code}
                                        </Badge>
                                    )}
                                    <Badge className={getStatusColor(history.status)}>
                                        {history.status}
                                    </Badge>
                                    <Badge className={getSeverityColor(history.severity)}>
                                        {history.severity}
                                    </Badge>
                                </div>

                                {history.description && (
                                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                                        {history.description}
                                    </p>
                                )}

                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <div>
                                        {history.date_occurred && (
                                            <p><strong>Date:</strong> {formatDate(history.date_occurred)}</p>
                                        )}
                                        {history.family_relationship && (
                                            <p><strong>Family Relationship:</strong> {history.family_relationship}</p>
                                        )}
                                        {history.age_at_diagnosis && (
                                            <p><strong>Age at Diagnosis:</strong> {history.age_at_diagnosis} years</p>
                                        )}
                                        {history.surgeon_name && (
                                            <p><strong>Surgeon:</strong> {history.surgeon_name}</p>
                                        )}
                                    </div>
                                    <div>
                                        {history.hospital_name && (
                                            <p><strong>Hospital:</strong> {history.hospital_name}</p>
                                        )}
                                        <p><strong>Source:</strong> {history.source.replace('_', ' ')}</p>
                                        {history.complications && (
                                            <p><strong>Complications:</strong> {history.complications}</p>
                                        )}
                                    </div>
                                </div>

                                {history.notes && (
                                    <p className="text-gray-700 dark:text-gray-300 mt-2">
                                        <strong>Notes:</strong> {history.notes}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-2 ml-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStartEdit(history)}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(history)}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <FileText className="h-6 w-6 text-purple-600" />
                        Medical History - {patient.name}
                        <Badge variant="outline" className="ml-2">
                            {medicalHistory.length} Total Entries
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="overflow-y-auto max-h-[calc(95vh-150px)] pr-4">
                    {/* Add New History Button */}
                    {!isAddingHistory && !editingHistory && (
                        <div className="mb-6 flex gap-2 flex-wrap">
                            <Button onClick={() => handleStartAdd()} className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Medical History
                            </Button>
                            <Button onClick={() => handleStartAdd('family_history')} variant="outline">
                                <Users className="h-4 w-4 mr-2" />
                                Add Family History
                            </Button>
                            <Button onClick={() => handleStartAdd('surgery')} variant="outline">
                                <Scissors className="h-4 w-4 mr-2" />
                                Add Surgery
                            </Button>
                        </div>
                    )}

                    {/* Add/Edit History Form */}
                    {(isAddingHistory || editingHistory) && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    {editingHistory ? 'Edit Medical History' : 'Add Medical History'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>History Type</Label>
                                            <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="past_illness">Past Illness</SelectItem>
                                                    <SelectItem value="surgery">Surgery</SelectItem>
                                                    <SelectItem value="hospitalization">Hospitalization</SelectItem>
                                                    <SelectItem value="family_history">Family History</SelectItem>
                                                    <SelectItem value="social_history">Social History</SelectItem>
                                                    <SelectItem value="immunization">Immunization</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Condition/Procedure Name *</Label>
                                            <Input
                                                value={formData.condition_name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, condition_name: e.target.value }))}
                                                placeholder="e.g., Hypertension, Appendectomy"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Detailed description of the condition or procedure..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Date Occurred</Label>
                                            <Input
                                                type="date"
                                                value={formData.date_occurred}
                                                onChange={(e) => setFormData(prev => ({ ...prev, date_occurred: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>ICD-10 Code</Label>
                                            <Input
                                                value={formData.icd10_code}
                                                onChange={(e) => setFormData(prev => ({ ...prev, icd10_code: e.target.value }))}
                                                placeholder="ICD-10 code"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Age at Diagnosis</Label>
                                            <Input
                                                type="number"
                                                value={formData.age_at_diagnosis}
                                                onChange={(e) => setFormData(prev => ({ ...prev, age_at_diagnosis: e.target.value }))}
                                                placeholder="Age in years"
                                            />
                                        </div>
                                    </div>

                                    {/* Family History Specific Fields */}
                                    {formData.type === 'family_history' && (
                                        <div className="space-y-2">
                                            <Label>Family Relationship</Label>
                                            <Input
                                                value={formData.family_relationship}
                                                onChange={(e) => setFormData(prev => ({ ...prev, family_relationship: e.target.value }))}
                                                placeholder="e.g., Father, Mother, Sibling, Grandmother"
                                            />
                                        </div>
                                    )}

                                    {/* Surgery Specific Fields */}
                                    {(formData.type === 'surgery' || formData.type === 'hospitalization') && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Surgeon/Physician</Label>
                                                <Input
                                                    value={formData.surgeon_name}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, surgeon_name: e.target.value }))}
                                                    placeholder="Surgeon or attending physician"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Hospital/Facility</Label>
                                                <Input
                                                    value={formData.hospital_name}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, hospital_name: e.target.value }))}
                                                    placeholder="Hospital or medical facility"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Complications field for surgeries and hospitalizations */}
                                    {(formData.type === 'surgery' || formData.type === 'hospitalization') && (
                                        <div className="space-y-2">
                                            <Label>Complications</Label>
                                            <Textarea
                                                value={formData.complications}
                                                onChange={(e) => setFormData(prev => ({ ...prev, complications: e.target.value }))}
                                                placeholder="Any complications that occurred..."
                                            />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Status</Label>
                                            <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="resolved">Resolved</SelectItem>
                                                    <SelectItem value="chronic">Chronic</SelectItem>
                                                    <SelectItem value="unknown">Unknown</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Severity</Label>
                                            <Select value={formData.severity} onValueChange={(value: any) => setFormData(prev => ({ ...prev, severity: value }))}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="mild">Mild</SelectItem>
                                                    <SelectItem value="moderate">Moderate</SelectItem>
                                                    <SelectItem value="severe">Severe</SelectItem>
                                                    <SelectItem value="unknown">Unknown</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Source</Label>
                                            <Select value={formData.source} onValueChange={(value: any) => setFormData(prev => ({ ...prev, source: value }))}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="patient_reported">Patient Reported</SelectItem>
                                                    <SelectItem value="medical_record">Medical Record</SelectItem>
                                                    <SelectItem value="family_member">Family Member</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Additional Notes</Label>
                                        <Textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                            placeholder="Additional notes about this medical history..."
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button type="submit" className="bg-green-600 hover:bg-green-700">
                                            <Save className="h-4 w-4 mr-2" />
                                            {editingHistory ? 'Update History' : 'Add History'}
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

                    {/* Medical History Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="past_illness" className="flex items-center gap-2">
                                <Heart className="h-4 w-4" />
                                Past Illness ({groupedHistory.past_illness.length})
                            </TabsTrigger>
                            <TabsTrigger value="surgery" className="flex items-center gap-2">
                                <Scissors className="h-4 w-4" />
                                Surgeries ({groupedHistory.surgery.length})
                            </TabsTrigger>
                            <TabsTrigger value="family_history" className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Family ({groupedHistory.family_history.length})
                            </TabsTrigger>
                            <TabsTrigger value="other" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Other ({groupedHistory.hospitalization.length + groupedHistory.immunization.length + groupedHistory.social_history.length + groupedHistory.other.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="past_illness" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Heart className="h-5 w-5 text-red-600" />
                                        Past Medical Conditions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {renderHistoryList(groupedHistory.past_illness)}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="surgery" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Scissors className="h-5 w-5 text-blue-600" />
                                        Surgical History
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {renderHistoryList(groupedHistory.surgery)}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="family_history" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Users className="h-5 w-5 text-green-600" />
                                        Family Medical History
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {renderHistoryList(groupedHistory.family_history)}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="other" className="mt-4">
                            <div className="space-y-4">
                                {groupedHistory.hospitalization.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Activity className="h-5 w-5 text-orange-600" />
                                                Hospitalizations
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {renderHistoryList(groupedHistory.hospitalization)}
                                        </CardContent>
                                    </Card>
                                )}

                                {groupedHistory.immunization.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Shield className="h-5 w-5 text-purple-600" />
                                                Immunizations
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {renderHistoryList(groupedHistory.immunization)}
                                        </CardContent>
                                    </Card>
                                )}

                                {groupedHistory.social_history.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Social History</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {renderHistoryList(groupedHistory.social_history)}
                                        </CardContent>
                                    </Card>
                                )}

                                {groupedHistory.other.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Other Medical History</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {renderHistoryList(groupedHistory.other)}
                                        </CardContent>
                                    </Card>
                                )}

                                {groupedHistory.hospitalization.length === 0 && 
                                 groupedHistory.immunization.length === 0 && 
                                 groupedHistory.social_history.length === 0 && 
                                 groupedHistory.other.length === 0 && (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg">No other medical history recorded</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* No history message */}
                    {medicalHistory.length === 0 && !isAddingHistory && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">No medical history recorded</p>
                            <p className="text-sm">Click "Add Medical History" to record patient's medical background</p>
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

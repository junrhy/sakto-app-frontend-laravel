import React from 'react';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Badge } from "@/Components/ui/badge";
import { User, Heart, Phone } from "lucide-react";
import { LanguageSelector } from "@/Components/LanguageSelector";
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
    const updateField = (field: keyof NewPatient, value: any) => {
        setNewPatient({ ...newPatient, [field]: value });
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Patient</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Complete the patient information below</p>
            </div>

            <Tabs defaultValue="basic" className="w-full">
                <TabsList className="mb-6 grid h-auto w-full grid-cols-3 rounded-xl border border-gray-200 bg-gray-100 p-1 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <TabsTrigger
                        value="basic"
                        className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400"
                    >
                        <User className="h-4 w-4" />
                        <span>Basic Info</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="medical"
                        className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400"
                    >
                        <Heart className="h-4 w-4" />
                        <span>Medical</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="emergency"
                        className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400"
                    >
                        <Phone className="h-4 w-4" />
                        <span>Emergency</span>
                    </TabsTrigger>
                </TabsList>

                <form onSubmit={onSubmit} className="space-y-6">
                    <TabsContent value="basic" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Basic Information</CardTitle>
                                <CardDescription>Essential patient details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="arn" className="text-gray-900 dark:text-white">ARN (Admission Record Number)</Label>
                <Input
                    id="arn"
                    value={newPatient.arn || ''}
                                            onChange={(e) => updateField('arn', e.target.value)}
                    className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                    placeholder="Leave empty to auto-generate"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    If left empty, an ARN will be automatically generated
                </p>
            </div>
            <div>
                                        <Label htmlFor="name" className="text-gray-900 dark:text-white">Full Name *</Label>
                <Input
                    id="name"
                    value={newPatient.name}
                                            onChange={(e) => updateField('name', e.target.value)}
                    className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                    required
                />
            </div>
            <div>
                                        <Label htmlFor="birthdate" className="text-gray-900 dark:text-white">Date of Birth</Label>
                <Input
                                            id="birthdate"
                    type="date"
                                            value={newPatient.birthdate || ''}
                                            onChange={(e) => updateField('birthdate', e.target.value)}
                    className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                />
            </div>
            <div>
                                        <Label htmlFor="gender" className="text-gray-900 dark:text-white">Gender</Label>
                                        <Select value={newPatient.gender || ''} onValueChange={(value) => updateField('gender', value)}>
                                            <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="phone" className="text-gray-900 dark:text-white">Phone Number</Label>
                <Input
                                            id="phone"
                                            value={newPatient.phone || ''}
                                            onChange={(e) => updateField('phone', e.target.value)}
                    className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                            placeholder="+1 (555) 123-4567"
                />
            </div>
            <div>
                                        <Label htmlFor="email" className="text-gray-900 dark:text-white">Email Address</Label>
                <Input
                    id="email"
                    type="email"
                                            value={newPatient.email || ''}
                                            onChange={(e) => updateField('email', e.target.value)}
                                            className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                            placeholder="patient@example.com"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="blood_type" className="text-gray-900 dark:text-white">Blood Type</Label>
                                        <Select value={newPatient.blood_type || ''} onValueChange={(value) => updateField('blood_type', value)}>
                                            <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                                                <SelectValue placeholder="Select blood type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A+">A+</SelectItem>
                                                <SelectItem value="A-">A-</SelectItem>
                                                <SelectItem value="B+">B+</SelectItem>
                                                <SelectItem value="B-">B-</SelectItem>
                                                <SelectItem value="AB+">AB+</SelectItem>
                                                <SelectItem value="AB-">AB-</SelectItem>
                                                <SelectItem value="O+">O+</SelectItem>
                                                <SelectItem value="O-">O-</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <LanguageSelector
                                            value={newPatient.preferred_language || 'English'}
                                            onValueChange={(value) => updateField('preferred_language', value)}
                                            placeholder="Select language"
                                            label="Preferred Language"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="address" className="text-gray-900 dark:text-white">Address</Label>
                                    <Textarea
                                        id="address"
                                        value={newPatient.address || ''}
                                        onChange={(e) => updateField('address', e.target.value)}
                                        className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                        placeholder="Street address, city, state, zip code"
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="medical" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Medical Information</CardTitle>
                                <CardDescription>Medical history and current conditions</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="smoking_status" className="text-gray-900 dark:text-white">Smoking Status</Label>
                                        <Select value={newPatient.smoking_status || 'unknown'} onValueChange={(value) => updateField('smoking_status', value)}>
                                            <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                                                <SelectValue placeholder="Select smoking status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="never">Never</SelectItem>
                                                <SelectItem value="former">Former</SelectItem>
                                                <SelectItem value="current">Current</SelectItem>
                                                <SelectItem value="unknown">Unknown</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="alcohol_use" className="text-gray-900 dark:text-white">Alcohol Use</Label>
                                        <Select value={newPatient.alcohol_use || 'unknown'} onValueChange={(value) => updateField('alcohol_use', value)}>
                                            <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                                                <SelectValue placeholder="Select alcohol use" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="never">Never</SelectItem>
                                                <SelectItem value="occasional">Occasional</SelectItem>
                                                <SelectItem value="moderate">Moderate</SelectItem>
                                                <SelectItem value="heavy">Heavy</SelectItem>
                                                <SelectItem value="unknown">Unknown</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="occupation" className="text-gray-900 dark:text-white">Occupation</Label>
                                        <Input
                                            id="occupation"
                                            value={newPatient.occupation || ''}
                                            onChange={(e) => updateField('occupation', e.target.value)}
                                            className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                            placeholder="Job title or profession"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="status" className="text-gray-900 dark:text-white">Patient Status</Label>
                                        <Select value={newPatient.status || 'active'} onValueChange={(value) => updateField('status', value)}>
                                            <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                                <SelectItem value="deceased">Deceased</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="medical_history" className="text-gray-900 dark:text-white">Medical History</Label>
                                    <Textarea
                                        id="medical_history"
                                        value={newPatient.medical_history || ''}
                                        onChange={(e) => updateField('medical_history', e.target.value)}
                                        className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                        placeholder="Previous medical conditions, surgeries, chronic illnesses"
                                        rows={4}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="allergies" className="text-gray-900 dark:text-white">Known Allergies</Label>
                                    <Textarea
                                        id="allergies"
                                        value={newPatient.allergies || ''}
                                        onChange={(e) => updateField('allergies', e.target.value)}
                                        className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                        placeholder="Drug allergies, food allergies, environmental allergies"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="medications" className="text-gray-900 dark:text-white">Current Medications</Label>
                                    <Textarea
                                        id="medications"
                                        value={newPatient.medications || ''}
                                        onChange={(e) => updateField('medications', e.target.value)}
                                        className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                        placeholder="Current medications, dosages, and frequency"
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="emergency" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Emergency Contact Information</CardTitle>
                                <CardDescription>Contact person in case of emergency</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="emergency_contact_name" className="text-gray-900 dark:text-white">Emergency Contact Name</Label>
                                        <Input
                                            id="emergency_contact_name"
                                            value={newPatient.emergency_contact_name || ''}
                                            onChange={(e) => updateField('emergency_contact_name', e.target.value)}
                                            className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                            placeholder="Full name"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="emergency_contact_relationship" className="text-gray-900 dark:text-white">Relationship</Label>
                                        <Select value={newPatient.emergency_contact_relationship || ''} onValueChange={(value) => updateField('emergency_contact_relationship', value)}>
                                            <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                                                <SelectValue placeholder="Select relationship" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="spouse">Spouse</SelectItem>
                                                <SelectItem value="parent">Parent</SelectItem>
                                                <SelectItem value="child">Child</SelectItem>
                                                <SelectItem value="sibling">Sibling</SelectItem>
                                                <SelectItem value="friend">Friend</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="emergency_contact_phone" className="text-gray-900 dark:text-white">Emergency Contact Phone</Label>
                                        <Input
                                            id="emergency_contact_phone"
                                            value={newPatient.emergency_contact_phone || ''}
                                            onChange={(e) => updateField('emergency_contact_phone', e.target.value)}
                                            className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                            placeholder="+1 (555) 123-4567"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="emergency_contact_email" className="text-gray-900 dark:text-white">Emergency Contact Email</Label>
                                        <Input
                                            id="emergency_contact_email"
                                            type="email"
                                            value={newPatient.emergency_contact_email || ''}
                                            onChange={(e) => updateField('emergency_contact_email', e.target.value)}
                                            className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                            placeholder="contact@example.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="emergency_contact_address" className="text-gray-900 dark:text-white">Emergency Contact Address</Label>
                                    <Textarea
                                        id="emergency_contact_address"
                                        value={newPatient.emergency_contact_address || ''}
                                        onChange={(e) => updateField('emergency_contact_address', e.target.value)}
                                        className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                        placeholder="Street address, city, state, zip code"
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Insurance Information</CardTitle>
                                <CardDescription>Health insurance details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="insurance_provider" className="text-gray-900 dark:text-white">Insurance Provider</Label>
                                        <Input
                                            id="insurance_provider"
                                            value={newPatient.insurance_provider || ''}
                                            onChange={(e) => updateField('insurance_provider', e.target.value)}
                                            className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                            placeholder="Insurance company name"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="insurance_policy_number" className="text-gray-900 dark:text-white">Policy Number</Label>
                                        <Input
                                            id="insurance_policy_number"
                                            value={newPatient.insurance_policy_number || ''}
                                            onChange={(e) => updateField('insurance_policy_number', e.target.value)}
                                            className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                            placeholder="Policy or member ID"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="insurance_expiration_date" className="text-gray-900 dark:text-white">Insurance Expiration Date</Label>
                                        <Input
                                            id="insurance_expiration_date"
                                            type="date"
                                            value={newPatient.insurance_expiration_date || ''}
                                            onChange={(e) => updateField('insurance_expiration_date', e.target.value)}
                                            className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>


                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <Button type="submit" className="min-w-32">
                            Add Patient
                        </Button>
                    </div>
        </form>
            </Tabs>
        </div>
    );
};

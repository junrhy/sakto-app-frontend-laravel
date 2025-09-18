export type ClinicPaymentAccount = {
    id: number;
    client_identifier: string;
    account_type: 'group' | 'company';
    account_name: string;
    account_code: string;
    description?: string;
    contact_person?: string;
    contact_email?: string;
    contact_phone?: string;
    address?: string;
    credit_limit: number;
    status: 'active' | 'inactive' | 'suspended';
    billing_settings?: any;
    created_at: string;
    updated_at: string;
    patients?: Patient[];
    patients_count?: number;
    total_outstanding?: number;
    total_bills?: number;
    total_payments?: number;
    bills?: BillItem[];
    payments?: PaymentItem[];
};

export type BillItem = {
    id: number;
    patient_id: number;
    bill_number: string;
    bill_date: string;
    bill_amount: string;
    bill_status: string | null;
    bill_details: string;
    billing_type?: 'individual' | 'account';
    clinic_payment_account_id?: number;
    account_bill_reference?: string;
    clinic_payment_account?: ClinicPaymentAccount;
    patient?: Patient;
    billing_info?: {
        type: 'individual' | 'account';
        account_name?: string;
        patient_name: string;
        reference: string;
    };
    created_at: string;
    updated_at: string;
};

export type PaymentItem = {
    id: number;
    patient_id: number;
    payment_date: string;
    payment_amount: string;
    payment_method: string;
    payment_notes: string;
    payment_type?: 'individual' | 'account';
    clinic_payment_account_id?: number;
    account_payment_reference?: string;
    covered_patients?: number[];
    clinic_payment_account?: ClinicPaymentAccount;
    patient?: Patient;
    payment_info?: {
        type: 'individual' | 'account';
        account_name?: string;
        patient_name?: string;
        reference?: string;
        covered_patients_count: number;
    };
    created_at: string;
    updated_at: string;
};

// Legacy checkup type for backward compatibility
export type CheckupResult = {
    id: number;
    checkup_date: string;
    diagnosis: string;
    treatment: string;
    notes: string;
};

export type ToothData = {
    id: number;
    status: 'healthy' | 'decayed' | 'filled' | 'missing';
};

// Comprehensive Medical Record Types

export type PatientEncounter = {
    id: number;
    client_identifier: string;
    patient_id: number;
    encounter_number: string;
    encounter_datetime: string;
    end_datetime?: string;
    encounter_type: 'outpatient' | 'inpatient' | 'emergency' | 'urgent_care' | 'telemedicine' | 'home_visit' | 'consultation' | 'follow_up' | 'preventive_care' | 'procedure' | 'other';
    encounter_class: 'ambulatory' | 'inpatient' | 'emergency' | 'home_health' | 'virtual';
    location?: string;
    room_number?: string;
    attending_provider?: string;
    referring_provider?: string;
    
    // SOAP Documentation
    chief_complaint?: string;
    history_present_illness?: string;
    review_of_systems?: string;
    physical_examination?: string;
    laboratory_results?: string;
    diagnostic_results?: string;
    clinical_impression?: string;
    differential_diagnosis?: string;
    treatment_plan?: string;
    medications_prescribed?: string;
    procedures_ordered?: string;
    follow_up_instructions?: string;
    next_appointment_date?: string;
    
    // Clinical decision support
    clinical_guidelines_followed?: string;
    decision_rationale?: string;
    
    // Patient education and communication
    patient_education_provided?: string;
    patient_understanding_level?: string;
    interpreter_used: boolean;
    interpreter_language?: string;
    
    // Encounter status and workflow
    status: 'scheduled' | 'arrived' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
    priority: 'routine' | 'urgent' | 'emergent' | 'stat';
    
    // Quality metrics
    patient_satisfaction_score?: number;
    patient_feedback?: string;
    encounter_duration_minutes?: number;
    
    // Billing and administrative
    insurance_authorization?: string;
    billing_notes?: string;
    requires_follow_up: boolean;
    
    // Documentation metadata
    documented_by?: string;
    documentation_completed_at?: string;
    documentation_complete: boolean;
    additional_notes?: string;
    care_coordination_notes?: string;
    
    created_at: string;
    updated_at: string;
    
    // Relationships
    patient?: Patient;
    vital_signs?: PatientVitalSigns[];
    diagnoses?: PatientDiagnosis[];
};

export type PatientVitalSigns = {
    id: number;
    client_identifier: string;
    patient_id: number;
    encounter_id?: number;
    measured_at: string;
    
    // Basic vital signs
    systolic_bp?: number;
    diastolic_bp?: number;
    bp_position?: 'sitting' | 'standing' | 'lying';
    bp_cuff_size?: 'pediatric' | 'adult' | 'large';
    
    heart_rate?: number;
    heart_rhythm?: 'regular' | 'irregular';
    
    respiratory_rate?: number;
    breathing_quality?: 'normal' | 'labored' | 'shallow';
    
    temperature?: number;
    temperature_unit: 'celsius' | 'fahrenheit';
    temperature_route?: 'oral' | 'rectal' | 'axillary' | 'tympanic' | 'temporal';
    
    oxygen_saturation?: number;
    on_oxygen: boolean;
    oxygen_flow_rate?: string;
    
    // Physical measurements
    weight?: number;
    height?: number;
    bmi?: number;
    head_circumference?: number;
    
    // Pain assessment
    pain_score?: number;
    pain_location?: string;
    pain_quality?: string;
    
    // Additional measurements
    glucose_level?: number;
    glucose_test_type?: 'fasting' | 'random' | 'post_meal';
    
    // Metadata
    measured_by?: string;
    measurement_method?: string;
    notes?: string;
    flagged_abnormal: boolean;
    abnormal_notes?: string;
    
    created_at: string;
    updated_at: string;
    
    // Relationships
    patient?: Patient;
    encounter?: PatientEncounter;
    
    // Computed properties
    formatted_blood_pressure?: string;
    formatted_temperature?: string;
};

export type PatientDiagnosis = {
    id: number;
    client_identifier: string;
    patient_id: number;
    encounter_id?: number;
    
    // Diagnosis details
    diagnosis_name: string;
    diagnosis_description?: string;
    icd10_code?: string;
    snomed_code?: string;
    
    // Classification
    diagnosis_type: 'primary' | 'secondary' | 'differential' | 'rule_out' | 'provisional' | 'confirmed';
    category: 'acute' | 'chronic' | 'resolved' | 'recurring' | 'unknown';
    
    // Clinical details
    onset_date?: string;
    diagnosis_date: string;
    resolution_date?: string;
    diagnosed_by?: string;
    
    // Severity and status
    severity: 'mild' | 'moderate' | 'severe' | 'critical' | 'unknown';
    status: 'active' | 'resolved' | 'in_remission' | 'recurrent' | 'inactive';
    
    // Clinical context
    clinical_notes?: string;
    body_site?: string;
    laterality?: 'left' | 'right' | 'bilateral';
    
    // Verification and confidence
    verification_status: 'confirmed' | 'provisional' | 'differential' | 'ruled_out' | 'refuted';
    confidence_level?: number;
    
    // Treatment and outcome tracking
    treatment_plan?: string;
    complications?: string;
    outcome_notes?: string;
    
    // Follow-up and monitoring
    next_review_date?: string;
    requires_monitoring: boolean;
    monitoring_notes?: string;
    
    created_at: string;
    updated_at: string;
    
    // Relationships
    patient?: Patient;
    encounter?: PatientEncounter;
    
    // Computed properties
    formatted_diagnosis?: string;
    duration?: string;
    severity_level?: number;
};

export type PatientAllergy = {
    id: number;
    client_identifier: string;
    patient_id: number;
    
    // Allergy details
    allergen: string;
    allergen_type: 'medication' | 'food' | 'environmental' | 'latex' | 'contrast_dye' | 'other';
    
    // Reaction details
    reaction_description: string;
    severity: 'mild' | 'moderate' | 'severe' | 'life_threatening' | 'unknown';
    symptoms?: string[];
    
    // Clinical details
    first_occurrence_date?: string;
    last_occurrence_date?: string;
    onset_time?: string;
    
    // Status and verification
    status: 'active' | 'inactive' | 'resolved';
    verification_status: 'confirmed' | 'unconfirmed' | 'patient_reported' | 'family_reported';
    
    // Additional information
    notes?: string;
    reported_by?: string;
    verified_date?: string;
    verified_by?: string;
    
    created_at: string;
    updated_at: string;
    
    // Relationships
    patient?: Patient;
    
    // Computed properties
    formatted_symptoms?: string;
};

export type PatientMedication = {
    id: number;
    client_identifier: string;
    patient_id: number;
    
    // Medication details
    medication_name: string;
    generic_name?: string;
    brand_name?: string;
    strength?: string;
    dosage_form?: string;
    
    // Dosing information
    dosage?: string;
    frequency?: string;
    route?: string;
    instructions?: string;
    
    // Dates and duration
    start_date?: string;
    end_date?: string;
    duration_days?: number;
    as_needed: boolean;
    indication?: string;
    
    // Prescriber information
    prescribed_by?: string;
    prescriber_license?: string;
    prescription_date?: string;
    refills_remaining?: number;
    
    // Status and monitoring
    status: 'active' | 'discontinued' | 'completed' | 'on_hold' | 'cancelled';
    medication_type: 'prescription' | 'over_the_counter' | 'supplement' | 'herbal' | 'other';
    
    // Clinical codes
    ndc_code?: string;
    rxnorm_code?: string;
    
    // Monitoring and notes
    side_effects_experienced?: string;
    notes?: string;
    adherence: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
    
    created_at: string;
    updated_at: string;
    
    // Relationships
    patient?: Patient;
    
    // Computed properties
    formatted_name?: string;
    formatted_dosing?: string;
};

export type PatientMedicalHistory = {
    id: number;
    client_identifier: string;
    patient_id: number;
    
    // Type of medical history entry
    type: 'past_illness' | 'surgery' | 'hospitalization' | 'family_history' | 'social_history' | 'immunization' | 'other';
    
    // Condition/procedure details
    condition_name: string;
    description?: string;
    date_occurred?: string;
    icd10_code?: string;
    
    // Family history specific fields
    family_relationship?: string;
    age_at_diagnosis?: number;
    
    // Surgery/procedure specific fields
    surgeon_name?: string;
    hospital_name?: string;
    complications?: string;
    
    // Status and severity
    status: 'active' | 'resolved' | 'chronic' | 'unknown';
    severity: 'mild' | 'moderate' | 'severe' | 'unknown';
    
    // Additional notes
    notes?: string;
    source: 'patient_reported' | 'medical_record' | 'family_member';
    
    created_at: string;
    updated_at: string;
    
    // Relationships
    patient?: Patient;
    
    // Computed properties
    formatted_condition?: string;
};

export type Patient = {
    id: string;
    arn: string;
    medical_record_number?: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    gender?: string;
    birthdate: string;
    blood_type?: string;
    
    // Legacy fields for backward compatibility
    medical_history?: string;
    allergies?: string;
    medications?: string;
    next_visit_date: string;
    next_visit_time: string;
    
    // Insurance information
    insurance_provider?: string;
    insurance_policy_number?: string;
    insurance_group_number?: string;
    insurance_expiration_date?: string;
    
    // Emergency contact
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relationship?: string;
    emergency_contact_address?: string;
    emergency_contact_email?: string;
    
    // Social history
    smoking_status?: 'never' | 'former' | 'current' | 'unknown';
    alcohol_use?: 'never' | 'occasional' | 'moderate' | 'heavy' | 'unknown';
    occupation?: string;
    preferred_language?: string;
    
    // Advance directives
    has_advance_directive?: boolean;
    advance_directive_notes?: string;
    
    // Patient status
    status?: 'active' | 'inactive' | 'deceased';
    last_visit_date?: string;
    
    // Billing
    billing_type?: 'individual' | 'account';
    clinic_payment_account_id?: number;
    clinic_payment_account?: ClinicPaymentAccount;
    billing_display_name?: string;
    
    // Financial summary
    total_bills: number;
    total_payments: number;
    balance: number;
    
    // Legacy relationships
    bills: BillItem[];
    payments: PaymentItem[];
    checkups: CheckupResult[];
    dental_chart: ToothData[];
    
    // New comprehensive medical record relationships
    encounters?: PatientEncounter[];
    vital_signs?: PatientVitalSigns[];
    diagnoses?: PatientDiagnosis[];
    allergies_records?: PatientAllergy[];
    medications_records?: PatientMedication[];
    medical_history_records?: PatientMedicalHistory[];
    
    // Filtered relationships for quick access
    active_diagnoses?: PatientDiagnosis[];
    active_allergies?: PatientAllergy[];
    current_medications?: PatientMedication[];
    recent_encounters?: PatientEncounter[];
};

export type AppCurrency = {
    symbol: string;
    code: string;
};

export type CheckupDate = {
    date: Date | undefined;
};

export type TimePickerProps = {
    value: string;
    onChange: (value: string) => void;
};

export type NewPatient = {
    arn?: string;
    name: string;
    dateOfBirth: string;
    contactNumber: string;
    email: string;
};

// Legacy type for backward compatibility
export type NewCheckupResult = Omit<CheckupResult, 'id'> & { date: string };

// New comprehensive encounter type for creating new encounters
export type NewPatientEncounter = Omit<PatientEncounter, 'id' | 'created_at' | 'updated_at' | 'patient' | 'vital_signs' | 'diagnoses'> & {
    // Required fields for new encounters
    client_identifier: string;
    patient_id: number;
    encounter_datetime: string;
    encounter_type: PatientEncounter['encounter_type'];
    encounter_class: PatientEncounter['encounter_class'];
    attending_provider: string;
    status: PatientEncounter['status'];
    
    // Optional vital signs to be recorded with the encounter
    vital_signs?: Omit<PatientVitalSigns, 'id' | 'client_identifier' | 'patient_id' | 'encounter_id' | 'created_at' | 'updated_at' | 'patient' | 'encounter'>;
    
    // Optional diagnoses to be recorded with the encounter
    diagnoses?: Omit<PatientDiagnosis, 'id' | 'client_identifier' | 'patient_id' | 'encounter_id' | 'created_at' | 'updated_at' | 'patient' | 'encounter'>[];
};

export type EditingNextVisit = {
    patientId: string;
    date: string;
};

export type HistoryType = 'bill' | 'checkup' | 'payment' | null;

export interface ClinicProps {
    auth: {
        user: any & {
            is_admin?: boolean;
        };
        selectedTeamMember?: {
            identifier: string;
            first_name: string;
            last_name: string;
            full_name: string;
            email: string;
            roles: string[];
            allowed_apps: string[];
            profile_picture?: string;
        };
    };
    initialPatients: Patient[];
    appCurrency: AppCurrency | null;
    error: any;
}

// Re-export appointment types
export * from './appointment';

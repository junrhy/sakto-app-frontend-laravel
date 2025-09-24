import React from 'react';
import { Patient, PatientEncounter } from '../types';
import { formatCurrency, formatDate, formatDateTime } from './index';

interface PatientRecordPDFProps {
    patient: Patient;
    encounters?: PatientEncounter[];
    currency: string;
    clinicName?: string;
    clinicAddress?: string;
    clinicPhone?: string;
    doctorName?: string;
}

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

export const PatientRecordPDF: React.FC<PatientRecordPDFProps> = ({
    patient,
    encounters = [],
    currency,
    clinicName = 'Medical Clinic',
    clinicAddress = '',
    clinicPhone = '',
    doctorName = '',
}) => {
    return (
        <div
            style={{
                fontFamily: 'Arial, sans-serif',
                color: '#000',
                lineHeight: '1.4',
                padding: '20mm',
                backgroundColor: 'white',
                width: '210mm',
                minHeight: '297mm',
                margin: '0',
                boxSizing: 'border-box',
            }}
        >
            {/* Header */}
            <div
                style={{
                    textAlign: 'center',
                    borderBottom: '2px solid #000',
                    paddingBottom: '20px',
                    marginBottom: '30px',
                }}
            >
                <div
                    style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#000',
                    }}
                >
                    {clinicName}
                </div>
                {clinicAddress && (
                    <div style={{ margin: '5px 0' }}>{clinicAddress}</div>
                )}
                {clinicPhone && (
                    <div style={{ margin: '5px 0' }}>Phone: {clinicPhone}</div>
                )}
            </div>

            {/* Title */}
            <div
                style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    margin: '20px 0',
                }}
            >
                PATIENT MEDICAL RECORD
            </div>

            {/* Patient Information */}
            <div style={{ marginBottom: '15mm', pageBreakInside: 'avoid' }}>
                <div
                    style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#000',
                        borderBottom: '1px solid #666',
                        paddingBottom: '5px',
                        marginBottom: '15px',
                    }}
                >
                    Patient Information
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '20mm',
                    }}
                >
                    <div>
                        <div style={{ margin: '5px 0' }}>
                            <strong>Name:</strong> {patient.name}
                        </div>
                        <div style={{ margin: '5px 0' }}>
                            <strong>ARN:</strong> {patient.arn || 'Not Set'}
                        </div>
                        <div style={{ margin: '5px 0' }}>
                            <strong>Date of Birth:</strong>{' '}
                            {formatDate(patient.birthdate)}
                        </div>
                        <div style={{ margin: '5px 0' }}>
                            <strong>Age:</strong>{' '}
                            {calculateAge(patient.birthdate)} years
                        </div>
                        <div style={{ margin: '5px 0' }}>
                            <strong>Gender:</strong> {patient.gender}
                        </div>
                    </div>
                    <div>
                        <div style={{ margin: '5px 0' }}>
                            <strong>Phone:</strong> {patient.phone}
                        </div>
                        <div style={{ margin: '5px 0' }}>
                            <strong>Email:</strong> {patient.email}
                        </div>
                        <div style={{ margin: '5px 0' }}>
                            <strong>Address:</strong> {patient.address}
                        </div>
                        <div style={{ margin: '5px 0' }}>
                            <strong>Next Visit:</strong>{' '}
                            {formatDate(patient.next_visit_date) ||
                                'Not Scheduled'}
                        </div>
                        <div style={{ margin: '5px 0' }}>
                            <strong>Total Encounters:</strong>{' '}
                            {encounters.length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Financial Summary */}
            <div style={{ marginBottom: '15mm', pageBreakInside: 'avoid' }}>
                <div
                    style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#000',
                        borderBottom: '1px solid #666',
                        paddingBottom: '5px',
                        marginBottom: '15px',
                    }}
                >
                    Financial Summary
                </div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        margin: '5px 0',
                    }}
                >
                    <span>
                        <strong>Outstanding Balance:</strong>
                    </span>
                    <span
                        style={{
                            color: '#000',
                            fontWeight: 'bold',
                        }}
                    >
                        {formatCurrency(patient.balance, currency)}
                    </span>
                </div>
            </div>

            {/* Clinical Encounters */}
            <div style={{ marginBottom: '15mm', pageBreakInside: 'avoid' }}>
                <div
                    style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#000',
                        borderBottom: '1px solid #666',
                        paddingBottom: '5px',
                        marginBottom: '15px',
                    }}
                >
                    Clinical Encounters
                </div>

                {encounters && encounters.length > 0 ? (
                    encounters.map((encounter, index) => (
                        <div
                            key={encounter.id}
                            style={{
                                border: '1px solid #ddd',
                                padding: '15mm',
                                margin: '10mm 0',
                                pageBreakInside: 'avoid',
                                borderRadius: '3px',
                                breakInside: 'avoid',
                                ...(index > 1
                                    ? { pageBreakBefore: 'always' }
                                    : {}),
                            }}
                        >
                            <div
                                style={{
                                    fontWeight: 'bold',
                                    color: '#000',
                                    marginBottom: '10px',
                                    fontSize: '14px',
                                }}
                            >
                                Encounter {encounter.encounter_number} -{' '}
                                {formatDateTime(encounter.encounter_datetime)}
                            </div>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr 1fr',
                                    gap: '10mm',
                                    margin: '5mm 0',
                                    padding: '5mm',
                                    backgroundColor: '#f5f5f5',
                                    borderRadius: '2px',
                                }}
                            >
                                <div>
                                    <strong>Provider:</strong>{' '}
                                    {encounter.attending_provider}
                                </div>
                                <div>
                                    <strong>Type:</strong>{' '}
                                    {encounter.encounter_type} (
                                    {encounter.encounter_class})
                                </div>
                                <div>
                                    <strong>Status:</strong> {encounter.status}
                                </div>
                            </div>

                            {encounter.chief_complaint && (
                                <div style={{ margin: '10px 0' }}>
                                    <strong>Chief Complaint:</strong>{' '}
                                    {encounter.chief_complaint}
                                </div>
                            )}

                            {encounter.clinical_impression && (
                                <div style={{ margin: '5px 0' }}>
                                    <strong>Clinical Impression:</strong>{' '}
                                    {encounter.clinical_impression}
                                </div>
                            )}

                            {encounter.treatment_plan && (
                                <div style={{ margin: '5px 0' }}>
                                    <strong>Treatment Plan:</strong>{' '}
                                    {encounter.treatment_plan}
                                </div>
                            )}

                            {encounter.medications_prescribed && (
                                <div style={{ margin: '5px 0' }}>
                                    <strong>Medications:</strong>{' '}
                                    {encounter.medications_prescribed}
                                </div>
                            )}

                            {encounter.follow_up_instructions && (
                                <div style={{ margin: '5px 0' }}>
                                    <strong>Follow-up Instructions:</strong>{' '}
                                    {encounter.follow_up_instructions}
                                </div>
                            )}

                            {/* Vital Signs */}
                            {encounter.vital_signs &&
                                encounter.vital_signs.length > 0 && (
                                    <div
                                        style={{
                                            margin: '10px 0',
                                            pageBreakInside: 'avoid',
                                        }}
                                    >
                                        <strong>Vital Signs:</strong>
                                        {encounter.vital_signs.map(
                                            (
                                                vitals: any,
                                                vitalIndex: number,
                                            ) => (
                                                <div
                                                    key={vitalIndex}
                                                    style={{
                                                        marginLeft: '20px',
                                                        margin: '5px 0',
                                                    }}
                                                >
                                                    {vitals.systolic_bp &&
                                                        vitals.diastolic_bp && (
                                                            <span>
                                                                BP:{' '}
                                                                {
                                                                    vitals.systolic_bp
                                                                }
                                                                /
                                                                {
                                                                    vitals.diastolic_bp
                                                                }{' '}
                                                                mmHg;{' '}
                                                            </span>
                                                        )}
                                                    {vitals.heart_rate && (
                                                        <span>
                                                            HR:{' '}
                                                            {vitals.heart_rate}{' '}
                                                            bpm;{' '}
                                                        </span>
                                                    )}
                                                    {vitals.temperature && (
                                                        <span>
                                                            Temp:{' '}
                                                            {vitals.temperature}
                                                            °
                                                            {vitals.temperature_unit ===
                                                            'celsius'
                                                                ? 'C'
                                                                : 'F'}
                                                            ;{' '}
                                                        </span>
                                                    )}
                                                    {vitals.oxygen_saturation && (
                                                        <span>
                                                            O2 Sat:{' '}
                                                            {
                                                                vitals.oxygen_saturation
                                                            }
                                                            %;{' '}
                                                        </span>
                                                    )}
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}

                            {/* Diagnoses */}
                            {encounter.diagnoses &&
                                encounter.diagnoses.length > 0 && (
                                    <div
                                        style={{
                                            margin: '10px 0',
                                            pageBreakInside: 'avoid',
                                        }}
                                    >
                                        <strong>Diagnoses:</strong>
                                        {encounter.diagnoses.map(
                                            (
                                                diagnosis: any,
                                                diagIndex: number,
                                            ) => (
                                                <div
                                                    key={diagIndex}
                                                    style={{
                                                        marginLeft: '20px',
                                                        margin: '5px 0',
                                                    }}
                                                >
                                                    • {diagnosis.diagnosis_name}
                                                    {diagnosis.icd10_code &&
                                                        ` (${diagnosis.icd10_code})`}
                                                    {diagnosis.clinical_notes &&
                                                        ` - ${diagnosis.clinical_notes}`}
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                        </div>
                    ))
                ) : (
                    <div
                        style={{
                            textAlign: 'center',
                            color: '#555',
                            fontStyle: 'italic',
                            padding: '20px',
                        }}
                    >
                        No clinical encounters recorded
                    </div>
                )}
            </div>

            {/* Billing History */}
            {patient.bills && patient.bills.length > 0 && (
                <div style={{ marginBottom: '15mm', pageBreakInside: 'avoid' }}>
                    <div
                        style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: '#000',
                            borderBottom: '1px solid #666',
                            paddingBottom: '5px',
                            marginBottom: '15px',
                        }}
                    >
                        Billing History
                    </div>
                    {patient.bills.map((bill, index) => (
                        <div
                            key={index}
                            style={{
                                border: '1px solid #ddd',
                                padding: '5mm',
                                margin: '3mm 0',
                                pageBreakInside: 'avoid',
                                breakInside: 'avoid',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    margin: '5px 0',
                                }}
                            >
                                <span>
                                    <strong>Bill #{bill.bill_number}:</strong>{' '}
                                    {formatDate(bill.bill_date)}
                                </span>
                                <span style={{ fontWeight: 'bold' }}>
                                    {formatCurrency(
                                        parseFloat(bill.bill_amount),
                                        currency,
                                    )}
                                </span>
                            </div>
                            <div style={{ margin: '5px 0' }}>
                                <strong>Details:</strong> {bill.bill_details}
                            </div>
                            <div style={{ margin: '5px 0' }}>
                                <strong>Status:</strong>{' '}
                                {bill.bill_status || 'Pending'}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div
                style={{
                    marginTop: '40px',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#555',
                    borderTop: '1px solid #666',
                    paddingTop: '20px',
                }}
            >
                <div>
                    Generated on: {formatDateTime(new Date().toISOString())}
                </div>
                {doctorName && <div>Attending Physician: {doctorName}</div>}
                <div style={{ marginTop: '10px', fontStyle: 'italic' }}>
                    This is a computer-generated medical record. Please verify
                    all information for accuracy.
                </div>
            </div>
        </div>
    );
};

export default PatientRecordPDF;

import html2pdf from 'html2pdf.js';
import { Patient } from '../types';
import { formatDate, formatDateTime, formatCurrency } from './index';

interface PDFExportOptions {
    patient: Patient;
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
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

const generatePatientRecordHTML = (options: PDFExportOptions): string => {
    const { patient, currency, clinicName = 'Medical Clinic', clinicAddress = '', clinicPhone = '', doctorName = '' } = options;
    
    // Build HTML content as a simple string without complex template literals
    let html = '<div style="font-family: Arial, sans-serif; color: #000; line-height: 1.4;">';
    
    // Header
    html += '<div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px;">';
    html += `<div style="font-size: 24px; font-weight: bold; color: #1e40af;">${clinicName}</div>`;
    if (clinicAddress) html += `<div>${clinicAddress}</div>`;
    if (clinicPhone) html += `<div>Phone: ${clinicPhone}</div>`;
    html += '</div>';
    
    // Title
    html += '<div style="font-size: 18px; font-weight: bold; text-align: center; margin: 20px 0;">PATIENT MEDICAL RECORD</div>';
    
    // Patient Information
    html += '<div style="margin-bottom: 25px;">';
    html += '<div style="font-size: 16px; font-weight: bold; color: #1e40af; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px;">Patient Information</div>';
    html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">';
    html += '<div>';
    html += `<div style="margin: 5px 0;"><strong>Name:</strong> ${patient.name}</div>`;
    html += `<div style="margin: 5px 0;"><strong>ARN:</strong> ${patient.arn || 'Not Set'}</div>`;
    html += `<div style="margin: 5px 0;"><strong>Date of Birth:</strong> ${formatDate(patient.birthdate)}</div>`;
    html += `<div style="margin: 5px 0;"><strong>Age:</strong> ${calculateAge(patient.birthdate)} years</div>`;
    html += '</div>';
    html += '<div>';
    html += `<div style="margin: 5px 0;"><strong>Phone:</strong> ${patient.phone}</div>`;
    html += `<div style="margin: 5px 0;"><strong>Email:</strong> ${patient.email}</div>`;
    html += `<div style="margin: 5px 0;"><strong>Next Visit:</strong> ${formatDate(patient.next_visit_date) || 'Not Scheduled'}</div>`;
    html += `<div style="margin: 5px 0;"><strong>Total Checkups:</strong> ${patient.checkups?.length || 0}</div>`;
    html += '</div>';
    html += '</div>';
    html += '</div>';
    
    // Financial Summary
    html += '<div style="margin-bottom: 25px;">';
    html += '<div style="font-size: 16px; font-weight: bold; color: #1e40af; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px;">Financial Summary</div>';
    html += '<div style="background: #f8fafc; padding: 15px; border-left: 4px solid #2563eb;">';
    html += `<div style="display: flex; justify-content: space-between; margin: 5px 0;"><span><strong>Total Bills:</strong></span> <span><strong>${formatCurrency(patient.total_bills, currency)}</strong></span></div>`;
    html += `<div style="display: flex; justify-content: space-between; margin: 5px 0;"><span><strong>Total Payments:</strong></span> <span><strong>${formatCurrency(patient.total_payments, currency)}</strong></span></div>`;
    const balanceColor = patient.balance > 0 ? '#dc2626' : '#059669';
    html += `<div style="display: flex; justify-content: space-between; margin: 5px 0;"><span><strong>Outstanding Balance:</strong></span> <span style="color: ${balanceColor};"><strong>${formatCurrency(patient.balance, currency)}</strong></span></div>`;
    html += '</div>';
    html += '</div>';
    
    // Medical History
    html += '<div style="margin-bottom: 25px;">';
    html += '<div style="font-size: 16px; font-weight: bold; color: #1e40af; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px;">Medical History</div>';
    
    if (patient.checkups && patient.checkups.length > 0) {
        patient.checkups.forEach((checkup, index) => {
            html += '<div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0;">';
            html += `<div style="font-weight: bold; color: #1e40af; margin-bottom: 10px;">Visit ${index + 1} - ${formatDateTime(checkup.checkup_date)}</div>`;
            html += `<div style="margin: 5px 0;"><strong>Diagnosis:</strong> ${checkup.diagnosis}</div>`;
            html += `<div style="margin: 5px 0;"><strong>Treatment:</strong> ${checkup.treatment}</div>`;
            if (checkup.notes) {
                html += `<div style="margin: 5px 0;"><strong>Notes:</strong> ${checkup.notes}</div>`;
            }
            html += '</div>';
        });
    } else {
        html += '<div style="text-align: center; color: #666; font-style: italic; padding: 20px;">No medical history available</div>';
    }
    html += '</div>';
    
    // Billing History
    if (patient.bills && patient.bills.length > 0) {
        html += '<div style="margin-bottom: 25px;">';
        html += '<div style="font-size: 16px; font-weight: bold; color: #1e40af; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px;">Billing History</div>';
        patient.bills.forEach(bill => {
            html += '<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">';
            html += '<div>';
            html += `<div><strong>${bill.bill_number}</strong> - ${formatDate(bill.bill_date)}</div>`;
            if (bill.bill_details) {
                html += `<div style="font-size: 12px; color: #666;">${bill.bill_details}</div>`;
            }
            html += '</div>';
            html += `<div><strong>${formatCurrency(parseFloat(bill.bill_amount), currency)}</strong></div>`;
            html += '</div>';
        });
        html += '</div>';
    }
    
    // Payment History
    if (patient.payments && patient.payments.length > 0) {
        html += '<div style="margin-bottom: 25px;">';
        html += '<div style="font-size: 16px; font-weight: bold; color: #1e40af; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px;">Payment History</div>';
        patient.payments.forEach(payment => {
            html += '<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">';
            html += '<div>';
            html += `<div><strong>${formatDate(payment.payment_date)}</strong> - ${payment.payment_method.toUpperCase()}</div>`;
            if (payment.payment_notes) {
                html += `<div style="font-size: 12px; color: #666;">${payment.payment_notes}</div>`;
            }
            html += '</div>';
            html += `<div style="color: #059669;"><strong>${formatCurrency(parseFloat(payment.payment_amount), currency)}</strong></div>`;
            html += '</div>';
        });
        html += '</div>';
    }
    
    // Footer
    html += '<div style="margin-top: 30px; font-size: 12px; color: #666;">';
    html += '<div style="display: flex; justify-content: space-between;">';
    html += `<div>Generated on: ${new Date().toLocaleString()}</div>`;
    html += '<div>Page 1</div>';
    html += '</div>';
    if (doctorName) {
        html += '<div style="margin-top: 30px;">';
        html += `<div>Doctor: ${doctorName}</div>`;
        html += '<div style="border-bottom: 1px solid #000; width: 200px; margin-top: 20px;"></div>';
        html += '</div>';
    }
    html += '</div>';
    
    html += '</div>';
    
    return html;
};

export const exportPatientRecordToPDF = async (options: PDFExportOptions) => {
    try {
        // Create a simple div with the content
        const element = document.createElement('div');
        element.style.width = '8.5in';
        element.style.padding = '0.5in';
        element.style.fontFamily = 'Arial, sans-serif';
        element.style.fontSize = '14px';
        element.style.lineHeight = '1.4';
        element.style.color = '#000';
        element.style.backgroundColor = '#fff';
        
        // Generate content directly as DOM elements
        element.innerHTML = generatePatientRecordHTML(options);
        
        // Temporarily add to document
        element.style.position = 'absolute';
        element.style.top = '-9999px';
        element.style.left = '-9999px';
        document.body.appendChild(element);

        const opt = {
            margin: [0.5, 0.5, 0.5, 0.5],
            filename: `patient-record-${options.patient.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`,
            image: { 
                type: 'jpeg', 
                quality: 0.95 
            },
            html2canvas: { 
                scale: 1,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: element.scrollWidth,
                height: element.scrollHeight
            },
            jsPDF: { 
                unit: 'in', 
                format: 'letter', 
                orientation: 'portrait' as const,
                compress: true
            },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        // Generate and save PDF
        await html2pdf().from(element).set(opt).save();
        
        // Clean up
        document.body.removeChild(element);
        
        console.log('PDF generated successfully');
    } catch (error) {
        console.error('PDF generation error:', error);
        throw error;
    }
};

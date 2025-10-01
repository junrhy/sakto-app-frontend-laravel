<?php

use App\Http\Controllers\ClinicController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Clinic Routes
|--------------------------------------------------------------------------
|
| Routes for clinic management including patient management, appointments,
| inventory, and payment accounts.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    Route::prefix('clinic')->group(function () {
        // Main Clinic Routes
        Route::get('/', [ClinicController::class, 'index'])->name('clinic');
        Route::get('/inventory', [ClinicController::class, 'inventory'])->name('clinic.inventory');
        Route::get('/settings', [ClinicController::class, 'settings'])->name('clinic.settings');
        Route::post('/settings', [ClinicController::class, 'saveSettings'])->name('clinic.settings.save');
        
        // Patient Management
        Route::post('/patients', [ClinicController::class, 'store']);
        Route::put('/patients/{id}', [ClinicController::class, 'update']);
        Route::delete('/patients/{id}', [ClinicController::class, 'destroy']);
        
        // Patient Bills and Payments
        Route::post('/patients/{patientId}/bills', [ClinicController::class, 'addBill']);
        Route::delete('/patients/{patientId}/bills/{billId}', [ClinicController::class, 'deleteBill']);
        Route::post('/patients/{patientId}/payments', [ClinicController::class, 'addPayment']);
        Route::delete('/patients/{patientId}/payments/{id}', [ClinicController::class, 'deletePayment']);
        
        // Patient Checkups and Records
        Route::post('/patients/{patientId}/checkups', [ClinicController::class, 'addCheckup']);
        Route::delete('/patients/{patientId}/checkups/{checkupId}', [ClinicController::class, 'deleteCheckup']);
        Route::put('/patients/{patientId}/dental-chart', [ClinicController::class, 'updateDentalChart']);
        Route::put('/patients/{patientId}/next-visit', [ClinicController::class, 'updateNextVisit']);
        Route::put('/patients/{patientId}/vip-status', [ClinicController::class, 'updateVipStatus']);
        
        // Patient Data Retrieval
        Route::get('/patients/{patientId}/bills', [ClinicController::class, 'getBills']);
        Route::get('/patients/{patientId}/payments', [ClinicController::class, 'getPayments']);
        Route::get('/patients/{patientId}/checkups', [ClinicController::class, 'getCheckups']);
        
        // Appointment Management
        Route::get('/appointments', [ClinicController::class, 'getAppointments']);
        Route::post('/appointments', [ClinicController::class, 'storeAppointment']);
        Route::put('/appointments/{id}', [ClinicController::class, 'updateAppointment']);
        Route::delete('/appointments/{id}', [ClinicController::class, 'deleteAppointment']);
        Route::get('/appointments/today', [ClinicController::class, 'getTodayAppointments']);
        Route::get('/appointments/upcoming', [ClinicController::class, 'getUpcomingAppointments']);
        Route::patch('/appointments/{id}/status', [ClinicController::class, 'updateAppointmentStatus']);
        Route::patch('/appointments/{id}/payment-status', [ClinicController::class, 'updateAppointmentPaymentStatus']);
        
        // Inventory Management
        Route::get('/inventory/api', [ClinicController::class, 'getInventory']);
        Route::post('/inventory/api', [ClinicController::class, 'storeInventoryItem']);
        Route::put('/inventory/api/{id}', [ClinicController::class, 'updateInventoryItem']);
        Route::delete('/inventory/api/{id}', [ClinicController::class, 'deleteInventoryItem']);
        Route::post('/inventory/api/{id}/add-stock', [ClinicController::class, 'addInventoryStock']);
        Route::post('/inventory/api/{id}/remove-stock', [ClinicController::class, 'removeInventoryStock']);
        Route::post('/inventory/api/{id}/adjust-stock', [ClinicController::class, 'adjustInventoryStock']);
        Route::get('/inventory/api/categories', [ClinicController::class, 'getInventoryCategories']);
        Route::get('/inventory/api/alerts', [ClinicController::class, 'getInventoryAlerts']);
        
        // Payment Account Management
        Route::get('/payment-accounts', [ClinicController::class, 'getPaymentAccounts']);
        Route::post('/payment-accounts', [ClinicController::class, 'createPaymentAccount']);
        Route::get('/payment-accounts/{id}', [ClinicController::class, 'getPaymentAccount']);
        Route::put('/payment-accounts/{id}', [ClinicController::class, 'updatePaymentAccount']);
        Route::delete('/payment-accounts/{id}', [ClinicController::class, 'deletePaymentAccount']);
        Route::post('/payment-accounts/{id}/assign-patients', [ClinicController::class, 'assignPatientsToAccount']);
        Route::post('/payment-accounts/{id}/remove-patients', [ClinicController::class, 'removePatientsFromAccount']);
        
        // Bill and Payment Management
        Route::post('/patient-bills/account-bill', [ClinicController::class, 'createAccountBill']);
        Route::put('/patient-bills/{billId}/status', [ClinicController::class, 'updateBillStatus']);
        Route::post('/patient-payments/account-payment', [ClinicController::class, 'createAccountPayment']);
        
        // Universal Medical Record System
        Route::get('/patient-encounters', [ClinicController::class, 'getPatientEncounters']);
        Route::post('/patient-encounters', [ClinicController::class, 'createPatientEncounter']);
        Route::get('/patient-vital-signs', [ClinicController::class, 'getPatientVitalSigns']);
        Route::get('/patient-diagnoses', [ClinicController::class, 'getPatientDiagnoses']);
        
        // Patient Allergies
        Route::get('/patient-allergies', [ClinicController::class, 'getPatientAllergies']);
        Route::post('/patient-allergies', [ClinicController::class, 'createPatientAllergy']);
        Route::put('/patient-allergies/{id}', [ClinicController::class, 'updatePatientAllergy']);
        Route::delete('/patient-allergies/{id}', [ClinicController::class, 'deletePatientAllergy']);
        
        // Patient Medications
        Route::get('/patient-medications', [ClinicController::class, 'getPatientMedications']);
        Route::post('/patient-medications', [ClinicController::class, 'createPatientMedication']);
        Route::put('/patient-medications/{id}', [ClinicController::class, 'updatePatientMedication']);
        Route::delete('/patient-medications/{id}', [ClinicController::class, 'deletePatientMedication']);
        
        // Patient Medical History
        Route::get('/patient-medical-history', [ClinicController::class, 'getPatientMedicalHistory']);
        Route::post('/patient-medical-history', [ClinicController::class, 'createPatientMedicalHistory']);
        Route::put('/patient-medical-history/{id}', [ClinicController::class, 'updatePatientMedicalHistory']);
        Route::delete('/patient-medical-history/{id}', [ClinicController::class, 'deletePatientMedicalHistory']);
    });
});

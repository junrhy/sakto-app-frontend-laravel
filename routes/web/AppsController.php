<?php

use App\Http\Controllers\AppsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Apps Routes
|--------------------------------------------------------------------------
|
| Routes for app management including adding/removing apps, billing
| history, and subscription management.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    // Apps Management
    Route::get('/apps', [AppsController::class, 'index'])->name('apps');
    Route::get('/api/apps', [AppsController::class, 'getApps'])->name('api.apps');
    Route::post('/api/apps/add', [AppsController::class, 'addApp'])->name('api.apps.add');
    Route::post('/api/apps/add-multiple', [AppsController::class, 'addMultipleApps'])->name('api.apps.add-multiple');
    Route::delete('/api/apps/remove', [AppsController::class, 'removeApp'])->name('api.apps.remove');
    
    // Billing and Invoices
    Route::get('/api/apps/billing-history', [AppsController::class, 'getBillingHistory'])->name('api.apps.billing-history');
    Route::get('/api/apps/invoice/{invoiceId}/pdf', [AppsController::class, 'downloadInvoicePDF'])->name('api.apps.invoice.pdf');
    Route::get('/api/apps/upcoming-invoices/pdf', [AppsController::class, 'downloadUpcomingInvoicesPDF'])->name('api.apps.upcoming-invoices.pdf');
    Route::get('/api/apps/billing-history/monthly/{monthKey}/download', [AppsController::class, 'downloadMonthlyBillingPDF'])->name('api.apps.billing-history.monthly.download');
    
    // Subscription Management
    Route::post('/api/apps/toggle-auto-renew', [AppsController::class, 'toggleAutoRenew'])->name('api.apps.toggle-auto-renew');
    Route::post('/api/apps/cancel-subscription', [AppsController::class, 'cancelAppSubscription'])->name('api.apps.cancel-subscription');
});

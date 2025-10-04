<?php

use App\Http\Controllers\WhatsAppAccountController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| WhatsApp Account Routes
|--------------------------------------------------------------------------
|
| Routes for WhatsApp account management functionality.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    Route::get('/whatsapp-accounts', [WhatsAppAccountController::class, 'index'])->name('whatsapp-accounts.index');
    Route::post('/whatsapp-accounts', [WhatsAppAccountController::class, 'store'])->name('whatsapp-accounts.store');
    Route::put('/whatsapp-accounts/{id}', [WhatsAppAccountController::class, 'update'])->name('whatsapp-accounts.update');
    Route::delete('/whatsapp-accounts/{id}', [WhatsAppAccountController::class, 'destroy'])->name('whatsapp-accounts.destroy');
    Route::post('/whatsapp-accounts/{id}/test', [WhatsAppAccountController::class, 'test'])->name('whatsapp-accounts.test');
    
    // Template management routes
    Route::post('/whatsapp-accounts/templates', [WhatsAppAccountController::class, 'createTemplate'])->name('whatsapp-accounts.templates.create');
    Route::delete('/whatsapp-accounts/templates', [WhatsAppAccountController::class, 'deleteTemplate'])->name('whatsapp-accounts.templates.delete');
});

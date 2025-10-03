<?php

use App\Http\Controllers\SmsWhatsAppController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| SMS WhatsApp Routes
|--------------------------------------------------------------------------
|
| Routes for WhatsApp messaging functionality.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    Route::get('/sms-whatsapp', [SmsWhatsAppController::class, 'index'])->name('whatsapp-sms');
    Route::get('/sms-whatsapp/balance', [SmsWhatsAppController::class, 'getBalance'])->name('whatsapp-sms.balance');
    Route::post('/sms-whatsapp/send', [SmsWhatsAppController::class, 'sendMessage'])->name('whatsapp-sms.send');
    Route::get('/sms-whatsapp/pricing', [SmsWhatsAppController::class, 'getPricing'])->name('whatsapp-sms.pricing');
});
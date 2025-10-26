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

Route::middleware(['auth', 'verified', 'team.member.selection', 'premium'])->group(function () {
    Route::get('/sms-whatsapp', [SmsWhatsAppController::class, 'index'])->name('whatsapp-sms');
    Route::post('/sms-whatsapp/send', [SmsWhatsAppController::class, 'sendMessage'])->name('whatsapp-sms.send');
});
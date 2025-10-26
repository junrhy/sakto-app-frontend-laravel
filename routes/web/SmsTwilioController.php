<?php

use App\Http\Controllers\SmsTwilioController;
use App\Http\Controllers\SmsSemaphoreController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| SMS Routes
|--------------------------------------------------------------------------
|
| Routes for SMS functionality including Twilio and Semaphore SMS services.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection', 'premium'])->group(function () {
    // SMS (subscription required)
    Route::prefix('sms')->group(function () {
        Route::get('/settings', [SmsTwilioController::class, 'settings'])->name('sms.settings');
    });
    
    // Twilio SMS
    Route::get('/sms-twilio', [SmsTwilioController::class, 'index'])->name('twilio-sms');
    Route::post('/sms-twilio/send', [SmsTwilioController::class, 'send'])->name('twilio-sms.send');
    Route::post('/sms-twilio/balance', [SmsTwilioController::class, 'getBalance'])->name('twilio-sms.balance');
    Route::post('/sms-twilio/status/{messageId}', [SmsTwilioController::class, 'getMessageStatus'])->name('twilio-sms.status');
    
    // Semaphore SMS
    Route::get('/sms-semaphore', [SmsSemaphoreController::class, 'index'])->name('semaphore-sms');
    Route::post('/sms-semaphore/send', [SmsSemaphoreController::class, 'send'])->name('semaphore-sms.send');
    Route::post('/sms-semaphore/balance', [SmsSemaphoreController::class, 'getBalance'])->name('semaphore-sms.balance');
    Route::post('/sms-semaphore/status/{messageId}', [SmsSemaphoreController::class, 'getMessageStatus'])->name('semaphore-sms.status');
    Route::post('/sms-semaphore/pricing', [SmsSemaphoreController::class, 'getPricing'])->name('semaphore-sms.pricing');
});

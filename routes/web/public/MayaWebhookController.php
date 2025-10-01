<?php

use App\Http\Controllers\MayaWebhookController;

/*
|--------------------------------------------------------------------------
| Maya Webhook Controller Public Routes
|--------------------------------------------------------------------------
|
| Public routes for Maya payment webhook handling.
|
*/

// Maya Webhook Route - exclude from CSRF protection
Route::post('/webhooks/maya', [MayaWebhookController::class, 'handleWebhook'])
    ->name('webhooks.maya')
    ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);

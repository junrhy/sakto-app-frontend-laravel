<?php

use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\CreditsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Subscription and Credits Routes
|--------------------------------------------------------------------------
|
| Routes for subscription management and credits system.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    // Subscription Management
    Route::get('/subscriptions', [SubscriptionController::class, 'index'])->name('subscriptions.index');
    Route::get('/api/subscriptions/plans', [SubscriptionController::class, 'getPlans'])->name('api.subscriptions.plans');
    Route::post('/subscriptions/subscribe', [SubscriptionController::class, 'subscribe'])->name('subscriptions.subscribe');
    Route::post('/subscriptions/cancel/{identifier}', [SubscriptionController::class, 'cancel'])->name('subscriptions.cancel');
    Route::get('/subscriptions/{userIdentifier}/active', [SubscriptionController::class, 'getActiveSubscription'])->name('subscriptions.active');
    Route::get('/subscriptions/history/{userIdentifier}', [SubscriptionController::class, 'getSubscriptionHistory'])->name('subscriptions.history');
    
    // Stripe payment routes
    Route::get('/subscriptions/stripe/success', [SubscriptionController::class, 'stripeSuccess'])->name('subscriptions.stripe.success');
    Route::get('/subscriptions/stripe/cancel', [SubscriptionController::class, 'stripeCancel'])->name('subscriptions.stripe.cancel');
    
    // Lemon Squeezy payment routes
    Route::get('/subscriptions/lemonsqueezy/success', [SubscriptionController::class, 'lemonSqueezySuccess'])->name('subscriptions.lemonsqueezy.success');
    Route::get('/subscriptions/lemonsqueezy/cancel', [SubscriptionController::class, 'lemonSqueezyCancel'])->name('subscriptions.lemonsqueezy.cancel');
    
    // Credits
    Route::prefix('credits')->group(function () {
        Route::get('/buy', [CreditsController::class, 'buy'])->name('credits.buy');
        Route::get('/{clientIdentifier}/balance', [CreditsController::class, 'getBalance'])->name('credits.balance');
        Route::post('/request', [CreditsController::class, 'requestCredit'])->name('credits.request');
        Route::get('/{clientIdentifier}/history', [CreditsController::class, 'getCreditHistory'])->name('credits.history');
        Route::get('/{clientIdentifier}/spent-history', [CreditsController::class, 'getSpentCreditHistory'])->name('credits.spent-history');
        Route::post('/spend', [CreditsController::class, 'spendCredit'])->name('credits.spend');
    });
});

// Stripe webhook (public route, handled by Stripe middleware)
Route::post('/webhooks/stripe', [SubscriptionController::class, 'stripeWebhook'])->name('webhooks.stripe');

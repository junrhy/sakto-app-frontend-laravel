<?php

namespace App\Providers;

use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use LemonSqueezy\Laravel\Events\OrderCreated;
use LemonSqueezy\Laravel\Events\SubscriptionCreated;
use LemonSqueezy\Laravel\Events\SubscriptionUpdated;
use LemonSqueezy\Laravel\Events\SubscriptionCancelled;
use LemonSqueezy\Laravel\Events\SubscriptionExpired;
use LemonSqueezy\Laravel\Events\SubscriptionPaymentSuccess;
use LemonSqueezy\Laravel\Events\SubscriptionPaymentFailed;
use App\Listeners\LemonSqueezyEventListener;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        
        // Register Lemon Squeezy event listeners
        Event::listen(OrderCreated::class, [LemonSqueezyEventListener::class, 'handleOrderCreated']);
        Event::listen(SubscriptionCreated::class, [LemonSqueezyEventListener::class, 'handleSubscriptionCreated']);
        Event::listen(SubscriptionUpdated::class, [LemonSqueezyEventListener::class, 'handleSubscriptionUpdated']);
        Event::listen(SubscriptionCancelled::class, [LemonSqueezyEventListener::class, 'handleSubscriptionCancelled']);
        Event::listen(SubscriptionExpired::class, [LemonSqueezyEventListener::class, 'handleSubscriptionExpired']);
        Event::listen(SubscriptionPaymentSuccess::class, [LemonSqueezyEventListener::class, 'handleSubscriptionPaymentSuccess']);
        Event::listen(SubscriptionPaymentFailed::class, [LemonSqueezyEventListener::class, 'handleSubscriptionPaymentFailed']);
    }
}

<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// Schedule the subscription renewal command to run daily at midnight Philippines time
Schedule::command('app:renew-subscriptions')->dailyAt('00:00');

// Schedule the upcoming invoices notification command to run daily at 9:00 AM Philippines time
Schedule::command('invoices:send-upcoming-notifications')->dailyAt('09:00');

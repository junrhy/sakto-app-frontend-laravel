<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI'),
    ],

    'twilio' => [
        'sid' => env('TWILIO_SID'),
        'token' => env('TWILIO_AUTH_TOKEN'),
        'phone_number' => env('TWILIO_PHONE_NUMBER'),
    ],

    'semaphore' => [
        'key' => env('SEMAPHORE_API_KEY'),
        'sender_name' => env('SEMAPHORE_SENDER_NAME'),
    ],

    'maya' => [
        'secret_key' => env('MAYA_SECRET_KEY'),
        'public_key' => env('MAYA_PUBLIC_KEY'),
        'webhook_secret' => env('MAYA_WEBHOOK_SECRET'),
        'environment' => env('MAYA_ENVIRONMENT', 'sandbox'),
        'base_url' => env('MAYA_BASE_URL', 'https://pg-sandbox.paymaya.com'),
        'webhook_success_url' => env('MAYA_WEBHOOK_SUCCESS_URL', config('app.url') . '/subscriptions/payment/success'),
        'webhook_failure_url' => env('MAYA_WEBHOOK_FAILURE_URL', config('app.url') . '/subscriptions/payment/failure'),
        'webhook_cancel_url' => env('MAYA_WEBHOOK_CANCEL_URL', config('app.url') . '/subscriptions/payment/cancel'),
        'webhook_url' => env('MAYA_WEBHOOK_URL', config('app.url') . '/webhooks/maya'),
    ],

    'stripe' => [
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
        'environment' => env('STRIPE_ENVIRONMENT', 'sandbox'),
    ],

];

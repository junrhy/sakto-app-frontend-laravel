<?php

use App\Http\Controllers\ContactsController;

/*
|--------------------------------------------------------------------------
| Contacts Controller Public Routes
|--------------------------------------------------------------------------
|
| Public routes for contact management and wallet functionality.
|
*/

// Public Contact Routes
Route::prefix('contacts')->group(function () {
    Route::get('/self-registration', [ContactsController::class, 'selfRegistration'])->name('contacts.self-registration');
    Route::post('/store-self', [ContactsController::class, 'storeSelf'])->name('contacts.store-self');
    Route::get('/{id}/public', [ContactsController::class, 'publicProfile'])->name('contacts.public-profile');
    Route::get('/list', [ContactsController::class, 'getContacts'])->name('contacts.public-list');
    Route::post('/bulk-delete', [ContactsController::class, 'destroyBulk'])->name('contacts.bulk-delete');
});

// Public Wallet Routes
Route::prefix('public/contacts/{contactId}/wallet')->group(function () {
    Route::get('/balance', [ContactsController::class, 'getPublicWalletBalance'])->name('public.contacts.wallet.balance');
    Route::get('/transactions', [ContactsController::class, 'getPublicTransactionHistory'])->name('public.contacts.wallet.transactions');
    Route::post('/transfer', [ContactsController::class, 'publicTransferFunds'])->name('public.contacts.wallet.transfer');
    Route::get('/available-contacts', [ContactsController::class, 'getPublicAvailableContacts'])->name('public.contacts.wallet.available-contacts');
});

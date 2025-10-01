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
    Route::get('/public/{identifier}', [ContactsController::class, 'publicShow'])->name('contacts.public.show');
    Route::get('/public/{identifier}/wallet', [ContactsController::class, 'publicWallet'])->name('contacts.public.wallet');
    Route::get('/public/{identifier}/transactions', [ContactsController::class, 'publicTransactions'])->name('contacts.public.transactions');
});

// Public Wallet Routes
Route::prefix('public/contacts/{contactId}/wallet')->group(function () {
    Route::get('/balance', [ContactsController::class, 'getPublicWalletBalance'])->name('public.contacts.wallet.balance');
    Route::get('/transactions', [ContactsController::class, 'getPublicTransactionHistory'])->name('public.contacts.wallet.transactions');
    Route::post('/transfer', [ContactsController::class, 'publicTransferFunds'])->name('public.contacts.wallet.transfer');
    Route::get('/available-contacts', [ContactsController::class, 'getPublicAvailableContacts'])->name('public.contacts.wallet.available-contacts');
});

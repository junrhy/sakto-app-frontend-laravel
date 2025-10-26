<?php

use App\Http\Controllers\ContactsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Contacts Routes
|--------------------------------------------------------------------------
|
| Routes for contact management including CRUD operations, wallet
| management, and contact settings.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection', 'premium'])->group(function () {
    // Contact Management
    Route::resource('contacts', ContactsController::class);
    Route::get('/contacts/settings', [ContactsController::class, 'settings'])->name('contacts.settings');
    Route::get('/contacts/list', [ContactsController::class, 'getContacts'])->name('contacts.list');
    
    // Contact Wallet Routes
    Route::prefix('contacts/{contactId}/wallet')->group(function () {
        Route::get('/balance', [ContactsController::class, 'getWalletBalance'])->name('contacts.wallet.balance');
        Route::post('/add-funds', [ContactsController::class, 'addFunds'])->name('contacts.wallet.add-funds');
        Route::post('/deduct-funds', [ContactsController::class, 'deductFunds'])->name('contacts.wallet.deduct-funds');
        Route::get('/transactions', [ContactsController::class, 'getTransactionHistory'])->name('contacts.wallet.transactions');
    });
    
    // Client Wallet Summary
    Route::get('/contacts/wallets/client-summary', [ContactsController::class, 'getClientWallets'])->name('contacts.wallets.client-summary');
    Route::post('/contacts/wallets/transfer', [ContactsController::class, 'transferFunds'])->name('contacts.wallets.transfer');
});

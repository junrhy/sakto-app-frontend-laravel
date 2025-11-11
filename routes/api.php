<?php

use App\Http\Controllers\ChatAuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Chat authentication API routes
Route::prefix('chat-auth')->group(function () {
    Route::post('/register', [ChatAuthController::class, 'register']);
    Route::post('/login', [ChatAuthController::class, 'login']);
    Route::get('/online-users', [ChatAuthController::class, 'getOnlineUsers']);
    
    // Protected routes (require chat token)
    Route::post('/logout', [ChatAuthController::class, 'logout']);
    Route::get('/profile', [ChatAuthController::class, 'profile']);
    Route::put('/profile', [ChatAuthController::class, 'updateProfile']);
    Route::post('/change-password', [ChatAuthController::class, 'changePassword']);
});

Route::middleware('auth:sanctum')->prefix('wallets')->group(function () {
    Route::get('/{customer}', [\App\Http\Controllers\Api\WalletController::class, 'show'])
        ->name('api.wallets.show');
    Route::get('/{customer}/history', [\App\Http\Controllers\Api\WalletController::class, 'history'])
        ->name('api.wallets.history');
    Route::post('/transfer', [\App\Http\Controllers\Api\WalletController::class, 'transfer'])
        ->name('api.wallets.transfer');
    Route::post('/{customer}/top-up', [\App\Http\Controllers\Api\WalletController::class, 'topUp'])
        ->name('api.wallets.top-up');
});

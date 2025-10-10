<?php

use App\Http\Controllers\ChatAuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Chat Authentication Routes
|--------------------------------------------------------------------------
|
| Routes for chat authentication functionality.
|
*/

// Public chat auth routes
Route::get('/chat/login', [ChatAuthController::class, 'showLogin'])->name('chat.login');
Route::get('/chat/register', [ChatAuthController::class, 'showRegister'])->name('chat.register');


<?php

use App\Http\Controllers\FinanceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Finance Public Routes
|--------------------------------------------------------------------------
|
| Public routes for the Finance platform landing page.
|
*/

// Finance landing page
Route::get('/finance', [FinanceController::class, 'index'])->name('finance.index');


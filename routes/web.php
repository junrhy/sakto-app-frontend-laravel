<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () { return Inertia::render('Dashboard'); })->name('dashboard');
    Route::get('/clinic', function () { return Inertia::render('Clinic'); })->name('clinic');
    Route::get('/pos-retail', function () { return Inertia::render('PosRetail'); })->name('pos-retail');
    Route::get('/pos-restaurant', function () { return Inertia::render('PosRestaurant'); })->name('pos-restaurant');
    Route::get('/inventory', function () { return Inertia::render('Inventory'); })->name('inventory');
    Route::get('/warehousing', function () { return Inertia::render('Warehousing'); })->name('warehousing');
    Route::get('/transportation', function () { return Inertia::render('Transportation'); })->name('transportation');
    Route::get('/rental-item', function () { return Inertia::render('RentalItem'); })->name('rental-item');
    Route::get('/rental-property', function () { return Inertia::render('RentalProperty'); })->name('rental-property');
    Route::get('/loan', function () { return Inertia::render('Loan'); })->name('loan');
    Route::get('/payroll', function () { return Inertia::render('Payroll'); })->name('payroll');
    Route::get('/help', function () { return Inertia::render('Help'); })->name('help');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ClinicController;
use App\Http\Controllers\PosRetailController;
use App\Http\Controllers\PosRestaurantController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\WarehousingController;
use App\Http\Controllers\TransportationController;
use App\Http\Controllers\RentalItemController;
use App\Http\Controllers\RentalPropertyController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\HelpController;

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
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/clinic', [ClinicController::class, 'index'])->name('clinic');
    Route::get('/pos-retail', [PosRetailController::class, 'index'])->name('pos-retail');
    Route::get('/pos-restaurant', [PosRestaurantController::class, 'index'])->name('pos-restaurant');
    Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory');
    Route::get('/warehousing', [WarehousingController::class, 'index'])->name('warehousing');
    Route::get('/transportation', [TransportationController::class, 'index'])->name('transportation');
    Route::get('/rental-item', [RentalItemController::class, 'index'])->name('rental-item');
    Route::get('/rental-property', [RentalPropertyController::class, 'index'])->name('rental-property');
    Route::get('/loan', [LoanController::class, 'index'])->name('loan');
    Route::get('/payroll', [PayrollController::class, 'index'])->name('payroll');
    Route::get('/help', [HelpController::class, 'index'])->name('help');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::patch('/profile/currency', [ProfileController::class, 'updateCurrency'])
        ->middleware(['auth'])
        ->name('profile.currency');

    Route::patch('/profile/theme', [ProfileController::class, 'updateTheme'])
        ->middleware(['auth'])
        ->name('profile.theme');

    Route::patch('/profile/color', [ProfileController::class, 'updateColor'])
        ->middleware(['auth'])
        ->name('profile.color');
});

require __DIR__.'/auth.php';

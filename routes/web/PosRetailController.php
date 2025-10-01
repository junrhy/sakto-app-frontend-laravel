<?php

use App\Http\Controllers\PosRetailController;
use App\Http\Controllers\PosRetailSaleController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| POS Retail Routes
|--------------------------------------------------------------------------
|
| Routes for POS retail system including product management and sales.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    // POS Retail
    Route::get('/pos-retail', [PosRetailController::class, 'index'])->name('pos-retail');
    Route::post('/pos-retail', [PosRetailController::class, 'store']);
    Route::put('/pos-retail/{id}', [PosRetailController::class, 'update']);
    Route::delete('/pos-retail/{id}', [PosRetailController::class, 'destroy']);
    
    // Retail Sales
    Route::get('/retail-sale', [PosRetailSaleController::class, 'index'])->name('retail-sale');
    Route::delete('/retail-sale/{id}', [PosRetailSaleController::class, 'destroy'])->name('sales.destroy');
    Route::delete('/retail-sales/bulk-delete', [PosRetailSaleController::class, 'bulkDelete'])->name('sales.bulk-delete');
    Route::get('/retail-sale-overview', [PosRetailSaleController::class, 'getSalesOverview']);
});

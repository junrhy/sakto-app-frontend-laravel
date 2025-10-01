<?php

use App\Http\Controllers\WarehousingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Warehousing Routes
|--------------------------------------------------------------------------
|
| Routes for warehousing management system.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    // Warehousing (one-time payment/subscription required)
    Route::get('/warehousing', [WarehousingController::class, 'index'])->name('warehousing');
});

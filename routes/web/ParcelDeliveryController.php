<?php

use App\Http\Controllers\ParcelDeliveryController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Parcel Delivery Routes
|--------------------------------------------------------------------------
|
| Routes for parcel delivery management including deliveries, couriers,
| pricing configuration, and tracking.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    // Parcel Delivery Routes
    Route::get('/parcel-delivery', [ParcelDeliveryController::class, 'index'])->name('parcel-delivery.index');
    Route::get('/parcel-delivery/create', [ParcelDeliveryController::class, 'create'])->name('parcel-delivery.create');
    Route::post('/parcel-delivery', [ParcelDeliveryController::class, 'store'])->name('parcel-delivery.store');
    Route::get('/parcel-delivery/couriers', [ParcelDeliveryController::class, 'couriers'])->name('parcel-delivery.couriers');
    
    // API Proxy Routes (must come before /{id} route to avoid conflicts)
    Route::prefix('parcel-delivery')->group(function () {
        Route::get('/list', [ParcelDeliveryController::class, 'getDeliveries'])->name('parcel-delivery.list');
        Route::post('/calculate-pricing', [ParcelDeliveryController::class, 'calculatePricing'])->name('parcel-delivery.calculate-pricing');
        Route::get('/couriers/list', [ParcelDeliveryController::class, 'getCouriers'])->name('parcel-delivery.couriers.list');
        Route::post('/couriers', [ParcelDeliveryController::class, 'storeCourier'])->name('parcel-delivery.couriers.store');
        Route::put('/couriers/{id}', [ParcelDeliveryController::class, 'updateCourier'])->name('parcel-delivery.couriers.update');
        Route::delete('/couriers/{id}', [ParcelDeliveryController::class, 'deleteCourier'])->name('parcel-delivery.couriers.delete');
        Route::put('/{id}/update-status', [ParcelDeliveryController::class, 'updateStatus'])->name('parcel-delivery.update-status');
        Route::post('/{id}/assign-courier', [ParcelDeliveryController::class, 'assignCourier'])->name('parcel-delivery.assign-courier');
    });
    
    Route::get('/parcel-delivery/{id}', [ParcelDeliveryController::class, 'show'])->name('parcel-delivery.show');
    Route::put('/parcel-delivery/{id}', [ParcelDeliveryController::class, 'update'])->name('parcel-delivery.update');
    Route::delete('/parcel-delivery/{id}', [ParcelDeliveryController::class, 'destroy'])->name('parcel-delivery.destroy');
});


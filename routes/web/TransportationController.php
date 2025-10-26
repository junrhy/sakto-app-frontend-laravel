<?php

use App\Http\Controllers\TransportationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Transportation Routes
|--------------------------------------------------------------------------
|
| Routes for transportation management including fleet management, shipments,
| cargo handling, bookings, and pricing configuration.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection', 'premium'])->group(function () {
    // Transportation (subscription required)
    Route::get('/transportation', [TransportationController::class, 'index'])->name('transportation');
    
    // Transportation Fleet Routes
    Route::prefix('transportation/fleet')->group(function () {
        Route::get('/list', [TransportationController::class, 'getFleet'])->name('transportation.fleet.list');
        Route::get('/stats', [TransportationController::class, 'getFleetStats'])->name('transportation.fleet.stats');
        Route::get('/locations', [TransportationController::class, 'getTrucksWithLocations'])->name('transportation.fleet.locations');
        Route::get('/real-time-locations', [TransportationController::class, 'getRealTimeLocations'])->name('transportation.fleet.real-time-locations');
        Route::post('/', [TransportationController::class, 'storeFleet'])->name('transportation.fleet.store');
        Route::get('/{id}', [TransportationController::class, 'showFleet'])->name('transportation.fleet.show');
        Route::put('/{id}', [TransportationController::class, 'updateFleet'])->name('transportation.fleet.update');
        Route::delete('/{id}', [TransportationController::class, 'destroyFleet'])->name('transportation.fleet.destroy');
        Route::post('/{id}/fuel', [TransportationController::class, 'updateFuel'])->name('transportation.fleet.fuel');
        Route::post('/{id}/maintenance', [TransportationController::class, 'scheduleMaintenance'])->name('transportation.fleet.maintenance');
        Route::post('/{id}/location', [TransportationController::class, 'updateTruckLocation'])->name('transportation.fleet.location');
        Route::get('/{id}/fuel-history', [TransportationController::class, 'getFuelHistory'])->name('transportation.fleet.fuel-history');
        Route::get('/{id}/maintenance-history', [TransportationController::class, 'getMaintenanceHistory'])->name('transportation.fleet.maintenance-history');
        Route::get('/{id}/location-history', [TransportationController::class, 'getTruckLocationHistory'])->name('transportation.fleet.location-history');
    });

    // Transportation Shipment Routes
    Route::prefix('transportation/shipments')->group(function () {
        Route::get('/list', [TransportationController::class, 'getShipments'])->name('transportation.shipments.list');
        Route::get('/stats', [TransportationController::class, 'getShipmentStats'])->name('transportation.shipments.stats');
        Route::post('/', [TransportationController::class, 'storeShipment'])->name('transportation.shipments.store');
        Route::get('/{id}', [TransportationController::class, 'showShipment'])->name('transportation.shipments.show');
        Route::put('/{id}', [TransportationController::class, 'updateShipment'])->name('transportation.shipments.update');
        Route::delete('/{id}', [TransportationController::class, 'destroyShipment'])->name('transportation.shipments.destroy');
        Route::post('/{id}/status', [TransportationController::class, 'updateShipmentStatus'])->name('transportation.shipments.status');
        Route::get('/{id}/tracking-history', [TransportationController::class, 'getTrackingHistory'])->name('transportation.shipments.tracking-history');
    });

    // Transportation Cargo Routes
    Route::prefix('transportation/cargo')->group(function () {
        Route::get('/list', [TransportationController::class, 'getCargo'])->name('transportation.cargo.list');
        Route::get('/stats', [TransportationController::class, 'getCargoStats'])->name('transportation.cargo.stats');
        Route::post('/', [TransportationController::class, 'storeCargo'])->name('transportation.cargo.store');
        Route::get('/{id}', [TransportationController::class, 'showCargo'])->name('transportation.cargo.show');
        Route::put('/{id}', [TransportationController::class, 'updateCargo'])->name('transportation.cargo.update');
        Route::delete('/{id}', [TransportationController::class, 'destroyCargo'])->name('transportation.cargo.destroy');
        Route::post('/{id}/status', [TransportationController::class, 'updateCargoStatus'])->name('transportation.cargo.status');
        Route::get('/shipment/{shipmentId}', [TransportationController::class, 'getCargoByShipment'])->name('transportation.cargo.by-shipment');
        
        // Cargo Unloading Routes
        Route::prefix('{cargoItemId}/unloadings')->group(function () {
            Route::get('/', [TransportationController::class, 'getCargoUnloadings'])->name('transportation.cargo.unloadings.list');
            Route::post('/', [TransportationController::class, 'storeCargoUnloading'])->name('transportation.cargo.unloadings.store');
            Route::get('/summary', [TransportationController::class, 'getCargoUnloadingSummary'])->name('transportation.cargo.unloadings.summary');
            Route::get('/{unloadingId}', [TransportationController::class, 'showCargoUnloading'])->name('transportation.cargo.unloadings.show');
            Route::put('/{unloadingId}', [TransportationController::class, 'updateCargoUnloading'])->name('transportation.cargo.unloadings.update');
            Route::delete('/{unloadingId}', [TransportationController::class, 'destroyCargoUnloading'])->name('transportation.cargo.unloadings.destroy');
        });
    });

    // Transportation Booking Routes
    Route::prefix('transportation/bookings')->group(function () {
        Route::get('/list', [TransportationController::class, 'getBookings'])->name('transportation.bookings.list');
        Route::get('/stats', [TransportationController::class, 'getBookingStats'])->name('transportation.bookings.stats');
        Route::post('/', [TransportationController::class, 'storeBooking'])->name('transportation.bookings.store');
        Route::get('/reference', [TransportationController::class, 'getBookingByReference'])->name('transportation.bookings.reference');
        Route::get('/{id}', [TransportationController::class, 'showBooking'])->name('transportation.bookings.show');
        Route::put('/{id}', [TransportationController::class, 'updateBooking'])->name('transportation.bookings.update');
        Route::delete('/{id}', [TransportationController::class, 'destroyBooking'])->name('transportation.bookings.destroy');
        Route::post('/{id}/payment', [TransportationController::class, 'processPayment'])->name('transportation.bookings.payment');
    });

    // Transportation Pricing Configuration Routes
    Route::prefix('transportation/pricing-configs')->group(function () {
        Route::get('/list', [TransportationController::class, 'getPricingConfigs'])->name('transportation.pricing-configs.list');
        Route::post('/', [TransportationController::class, 'storePricingConfig'])->name('transportation.pricing-configs.store');
        Route::get('/default', [TransportationController::class, 'getDefaultPricingConfig'])->name('transportation.pricing-configs.default');
        Route::get('/preview', [TransportationController::class, 'calculatePricingPreview'])->name('transportation.pricing-configs.preview');
        Route::get('/{id}', [TransportationController::class, 'showPricingConfig'])->name('transportation.pricing-configs.show');
        Route::put('/{id}', [TransportationController::class, 'updatePricingConfig'])->name('transportation.pricing-configs.update');
        Route::delete('/{id}', [TransportationController::class, 'destroyPricingConfig'])->name('transportation.pricing-configs.destroy');
    });

    // Transportation Settings Routes
    Route::prefix('transportation')->group(function () {
        Route::get('/settings', [TransportationController::class, 'settings'])->name('transportation.settings');
        Route::post('/settings', [TransportationController::class, 'saveSettings'])->name('transportation.settings.save');
    });
});

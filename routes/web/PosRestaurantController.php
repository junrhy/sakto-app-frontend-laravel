<?php

use App\Http\Controllers\PosRestaurantController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| POS Restaurant Routes
|--------------------------------------------------------------------------
|
| Routes for POS restaurant system including menu management, table
| management, and order processing.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    // Restaurant Management
    Route::get('/pos-restaurant', [PosRestaurantController::class, 'index'])->name('pos-restaurant');
    Route::get('/pos-restaurant/settings', [PosRestaurantController::class, 'settings'])->name('pos-restaurant.settings');
    Route::post('/pos-restaurant/settings', [PosRestaurantController::class, 'saveSettings'])->name('pos-restaurant.settings.save');
    
    Route::prefix('pos-restaurant')->group(function () {
        // Menu Items
        Route::get('/menu-items', [PosRestaurantController::class, 'getMenuItems']);
        Route::post('/menu-items', [PosRestaurantController::class, 'storeMenuItem']);
        Route::put('/menu-item/{id}', [PosRestaurantController::class, 'updateMenuItem']);
        Route::delete('/menu-item/{id}', [PosRestaurantController::class, 'destroyMenuItem']);
        Route::post('/menu-items/bulk-destroy', [PosRestaurantController::class, 'bulkDestroyMenuItem']);
        
        // Tables
        Route::get('/tables', [PosRestaurantController::class, 'getTables']);
        Route::post('/tables', [PosRestaurantController::class, 'storeTable']);
        Route::put('/table/{id}', [PosRestaurantController::class, 'updateTable']);
        Route::delete('/table/{id}', [PosRestaurantController::class, 'destroyTable']);
        Route::get('/tables/joined', [PosRestaurantController::class, 'getJoinedTables'])->name('pos-restaurant.tables.joined');
        Route::post('/tables/join', [PosRestaurantController::class, 'joinTables'])->name('pos-restaurant.tables.join');
        Route::post('/tables/unjoin', [PosRestaurantController::class, 'unjoinTables'])->name('pos-restaurant.tables.unjoin');
        Route::get('/tables-overview', [PosRestaurantController::class, 'getTablesOverview']);
        
        // Orders
        Route::post('/kitchen-order', [PosRestaurantController::class, 'storeKitchenOrder']);
        Route::get('/current-order/{tableNumber}', [PosRestaurantController::class, 'getCurrentOrder']);
        Route::post('/orders/add-item', [PosRestaurantController::class, 'addItemToOrder'])->name('pos-restaurant.add-item-to-order');
        Route::delete('/current-order/{table}/item/{id}', [PosRestaurantController::class, 'removeOrderItem'])->name('pos-restaurant.remove-order-item');
        Route::post('/orders/complete', [PosRestaurantController::class, 'completeOrder'])->name('pos-restaurant.complete-order');
        Route::get('/kitchen-orders/overview', [PosRestaurantController::class, 'getKitchenOrdersOverview']);
        
        // Table Orders (New System)
        Route::post('/table-order/get', [PosRestaurantController::class, 'getTableOrder'])->name('pos-restaurant.get-table-order');
        Route::post('/table-order/save', [PosRestaurantController::class, 'saveTableOrder'])->name('pos-restaurant.save-table-order');
        Route::post('/table-order/complete', [PosRestaurantController::class, 'completeTableOrder'])->name('pos-restaurant.complete-table-order');
        Route::get('/table-orders/all-active', [PosRestaurantController::class, 'getAllActiveOrders'])->name('pos-restaurant.all-active-orders');
        
        // Reservations
        Route::get('/reservations', [PosRestaurantController::class, 'getReservations']);
        Route::post('/reservations', [PosRestaurantController::class, 'storeReservation']);
        Route::put('/reservations/{id}', [PosRestaurantController::class, 'updateReservation']);
        Route::delete('/reservations/{id}', [PosRestaurantController::class, 'destroyReservation']);
        Route::get('/reservations-overview', [PosRestaurantController::class, 'getReservationsOverview']);
        
        // Blocked Dates
        Route::get('/blocked-dates', [PosRestaurantController::class, 'getBlockedDates']);
        Route::post('/blocked-dates', [PosRestaurantController::class, 'storeBlockedDate']);
        Route::put('/blocked-dates/{id}', [PosRestaurantController::class, 'updateBlockedDate']);
        Route::delete('/blocked-dates/{id}', [PosRestaurantController::class, 'destroyBlockedDate']);
        
        // Opened Dates
        Route::post('/opened-dates', [PosRestaurantController::class, 'storeOpenedDate']);
        Route::put('/opened-dates/{id}', [PosRestaurantController::class, 'updateOpenedDate']);
        Route::delete('/opened-dates/{id}', [PosRestaurantController::class, 'destroyOpenedDate']);
        
        // Table Schedules
        Route::post('/table-schedules', [PosRestaurantController::class, 'setTableSchedule']);
        
        // Customer Orders (QR Code Ordering)
        Route::get('/customer-orders/pending', [PosRestaurantController::class, 'getPendingCustomerOrders'])->name('pos-restaurant.customer-orders.pending');
        Route::put('/customer-orders/{id}/status', [PosRestaurantController::class, 'updateCustomerOrderStatus'])->name('pos-restaurant.customer-orders.update-status');
        Route::delete('/customer-orders/{id}', [PosRestaurantController::class, 'cancelCustomerOrder'])->name('pos-restaurant.customer-orders.cancel');

        // Kitchen Orders
        Route::get('/kitchen-orders', [PosRestaurantController::class, 'getKitchenOrders'])->name('pos-restaurant.kitchen-orders');
        Route::post('/kitchen-orders/send', [PosRestaurantController::class, 'sendToKitchen'])->name('pos-restaurant.kitchen-orders.send');
        Route::post('/kitchen-orders/complete', [PosRestaurantController::class, 'completeKitchenOrder'])->name('pos-restaurant.kitchen-orders.complete');
        Route::post('/update-item-status', [PosRestaurantController::class, 'updateItemStatus'])->name('pos-restaurant.update-item-status');
    });

});


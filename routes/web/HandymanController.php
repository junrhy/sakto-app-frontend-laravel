<?php

use App\Http\Controllers\HandymanController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Handyman Routes
|--------------------------------------------------------------------------
|
| Routes for the handyman operations management module.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    Route::get('/handyman', [HandymanController::class, 'index'])->name('handyman.index');
    Route::get('/handyman/technicians', [HandymanController::class, 'technicians']);
    Route::get('/handyman/tasks', [HandymanController::class, 'tasks']);
    Route::get('/handyman/tasks-overview', [HandymanController::class, 'tasksOverview']);
    Route::post('/handyman/tasks', [HandymanController::class, 'storeTask']);
    Route::put('/handyman/tasks/{task}', [HandymanController::class, 'updateTask']);
    Route::get('/handyman/work-orders', [HandymanController::class, 'workOrders']);
    Route::post('/handyman/work-orders', [HandymanController::class, 'storeWorkOrder']);
    Route::put('/handyman/work-orders/{workOrder}', [HandymanController::class, 'updateWorkOrder']);
    Route::post('/handyman/technicians', [HandymanController::class, 'storeTechnician']);
    Route::put('/handyman/technicians/{technician}', [HandymanController::class, 'updateTechnician']);
    Route::delete('/handyman/technicians/{technician}', [HandymanController::class, 'deleteTechnician']);
    Route::get('/handyman/inventory', [HandymanController::class, 'inventory']);
    Route::post('/handyman/inventory', [HandymanController::class, 'storeInventory']);
    Route::put('/handyman/inventory/{inventory}', [HandymanController::class, 'updateInventory']);
    Route::delete('/handyman/inventory/{inventory}', [HandymanController::class, 'deleteInventory']);
    Route::get('/handyman/inventory/low-stock', [HandymanController::class, 'lowStock']);
    Route::get('/handyman/inventory-transactions', [HandymanController::class, 'inventoryTransactions']);
    Route::post('/handyman/inventory-transactions', [HandymanController::class, 'storeInventoryTransaction']);
});


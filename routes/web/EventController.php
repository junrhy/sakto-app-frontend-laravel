<?php

use App\Http\Controllers\EventController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Event Routes
|--------------------------------------------------------------------------
|
| Routes for event management including event creation, participant
| management, and event calendar functionality.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    // Community Events (subscription required)
    Route::prefix('events')->group(function () {
        // Main resource routes
        Route::get('/', [EventController::class, 'index'])->name('events.index');
        Route::post('/', [EventController::class, 'store'])->name('events.store');
        Route::put('/{id}', [EventController::class, 'update'])->name('events.update');
        Route::delete('/{id}', [EventController::class, 'destroy'])->name('events.destroy');
        
        // Create and edit routes
        Route::get('/create', [EventController::class, 'create'])->name('events.create');
        Route::get('/{id}/edit', [EventController::class, 'edit'])->name('events.edit');
        
        // Settings route
        Route::get('/settings', [EventController::class, 'settings'])->name('events.settings');
        
        // Calendar routes
        Route::get('/calendar', [EventController::class, 'calendar'])->name('events.calendar');
        Route::get('/calendar-events', [EventController::class, 'getCalendarEvents'])->name('events.calendar-events');
        
        // Participant management routes
        Route::prefix('{event}/participants')->group(function () {
            Route::get('/', [EventController::class, 'getParticipants'])->name('events.participants.index');
            Route::post('/', [EventController::class, 'registerParticipant'])->name('events.participants.register');
            Route::delete('/{participant}', [EventController::class, 'unregisterParticipant'])->name('events.participants.unregister');
            Route::post('/{participant}/check-in', [EventController::class, 'checkInParticipant'])->name('events.participants.check-in');
            Route::put('/{participant}/payment', [EventController::class, 'updatePaymentStatus'])->name('events.participants.payment');
        });
        
        // Filtering routes
        Route::get('/upcoming', [EventController::class, 'getUpcomingEvents'])->name('events.upcoming');
        Route::get('/past', [EventController::class, 'getPastEvents'])->name('events.past');
        
        // Bulk operations
        Route::post('/bulk-delete', [EventController::class, 'bulkDestroy'])->name('events.bulk-delete');
        
        // Import/Export routes
        Route::get('/export', [EventController::class, 'exportEvents'])->name('events.export');
        Route::post('/import', [EventController::class, 'importEvents'])->name('events.import');
    });
});

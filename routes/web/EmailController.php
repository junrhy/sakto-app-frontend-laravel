<?php

use App\Http\Controllers\EmailController;
use App\Http\Controllers\EmailTemplateController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Email Routes
|--------------------------------------------------------------------------
|
| Routes for email functionality including email sending and template management.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    // Email (subscription required)
    Route::prefix('email')->group(function () {
        Route::get('/', [EmailController::class, 'index'])->name('email.index');
        Route::get('/settings', [EmailController::class, 'settings'])->name('email.settings');
        Route::post('/send', [EmailController::class, 'send'])->name('email.send');
        Route::get('/config', [EmailController::class, 'getConfig'])->name('email.config');
        
        // Email Templates
        Route::prefix('templates')->group(function () {
            Route::get('/', [EmailTemplateController::class, 'index'])->name('email.templates.index');
            Route::get('/list', [EmailTemplateController::class, 'getTemplates'])->name('email.templates.list');
            Route::get('/create', [EmailTemplateController::class, 'create'])->name('email.templates.create');
            Route::post('/', [EmailTemplateController::class, 'store'])->name('email.templates.store');
            
            // Parameter routes (must come after specific routes)
            Route::get('/{template}', [EmailTemplateController::class, 'show'])->name('email.templates.show');
            Route::get('/{template}/edit', [EmailTemplateController::class, 'edit'])->name('email.templates.edit');
            Route::put('/{template}', [EmailTemplateController::class, 'update'])->name('email.templates.update');
            Route::delete('/{template}', [EmailTemplateController::class, 'destroy'])->name('email.templates.destroy');
            Route::get('/{template}/preview', [EmailTemplateController::class, 'preview'])->name('email.templates.preview');
            Route::match(['patch', 'post'], '/{template}/toggle-status', [EmailTemplateController::class, 'toggleStatus'])->name('email.templates.toggle-status');
        });
    });
});

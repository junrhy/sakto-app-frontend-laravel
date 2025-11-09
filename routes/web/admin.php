<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
|
| Routes for admin functionality including user management, project
| management, settings, and subscription management.
|
*/

// Admin Auth Routes
Route::get('/admin/login', [App\Http\Controllers\Admin\AuthController::class, 'showLoginForm'])->name('admin.login');
Route::post('/admin/login', [App\Http\Controllers\Admin\AuthController::class, 'login'])->name('admin.login.attempt');
Route::post('/admin/logout', [App\Http\Controllers\Admin\AuthController::class, 'logout'])->name('admin.logout');

// Admin routes
Route::middleware(['auth', 'ip_restriction', 'admin'])->group(function () {
    // Admin Dashboard
    Route::get('/admin/dashboard', [App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('admin.dashboard');
    
    // Admin User Management
    Route::prefix('admin/users')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\UserAdminController::class, 'index'])->name('admin.users.index');
        Route::get('/create', [App\Http\Controllers\Admin\UserAdminController::class, 'create'])->name('admin.users.create');
        Route::post('/', [App\Http\Controllers\Admin\UserAdminController::class, 'store'])->name('admin.users.store');
        Route::get('/{id}/edit', [App\Http\Controllers\Admin\UserAdminController::class, 'edit'])->name('admin.users.edit');
        Route::put('/{id}', [App\Http\Controllers\Admin\UserAdminController::class, 'update'])->name('admin.users.update');
        Route::delete('/{id}', [App\Http\Controllers\Admin\UserAdminController::class, 'destroy'])->name('admin.users.destroy');
        Route::get('/{id}/toggle-admin', [App\Http\Controllers\Admin\UserAdminController::class, 'toggleAdminStatus'])->name('admin.users.toggle-admin');
        Route::get('/{id}/resend-verification', [App\Http\Controllers\Admin\UserAdminController::class, 'resendVerification'])->name('admin.users.resend-verification');
    });
    
    // Admin Project Management
    Route::prefix('admin/projects')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\ProjectController::class, 'index'])->name('admin.projects.index');
        Route::get('/create', [App\Http\Controllers\Admin\ProjectController::class, 'create'])->name('admin.projects.create');
        Route::post('/', [App\Http\Controllers\Admin\ProjectController::class, 'store'])->name('admin.projects.store');
        Route::get('/{id}/edit', [App\Http\Controllers\Admin\ProjectController::class, 'edit'])->name('admin.projects.edit');
        Route::put('/{id}', [App\Http\Controllers\Admin\ProjectController::class, 'update'])->name('admin.projects.update');
        Route::delete('/{id}', [App\Http\Controllers\Admin\ProjectController::class, 'destroy'])->name('admin.projects.destroy');
    });
    
    // Admin Settings
    Route::prefix('admin/settings')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\SettingsController::class, 'index'])->name('admin.settings.index');
        Route::post('/update', [App\Http\Controllers\Admin\SettingsController::class, 'update'])->name('admin.settings.update');
        Route::post('/registration', [App\Http\Controllers\Admin\SettingsController::class, 'updateRegistrationEnabled'])->name('admin.settings.registration');
        Route::post('/maintenance', [App\Http\Controllers\Admin\SettingsController::class, 'updateMaintenanceMode'])->name('admin.settings.maintenance');
        Route::post('/ip-restriction', [App\Http\Controllers\Admin\SettingsController::class, 'updateIpRestriction'])->name('admin.settings.ip-restriction');
    });
    
    // Admin Subscription Management
    Route::prefix('admin/subscriptions')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\SubscriptionAdminController::class, 'index'])->name('admin.subscriptions.index');
        Route::post('/plans', [App\Http\Controllers\Admin\SubscriptionAdminController::class, 'storePlan'])->name('admin.subscriptions.plans.store');
        Route::post('/plans/{id}/duplicate', [App\Http\Controllers\Admin\SubscriptionAdminController::class, 'duplicatePlan'])->name('admin.subscriptions.plans.duplicate');
        Route::post('/plans/bulk-duplicate', [App\Http\Controllers\Admin\SubscriptionAdminController::class, 'duplicateMultiplePlans'])->name('admin.subscriptions.plans.bulk-duplicate');
        Route::put('/plans/{id}', [App\Http\Controllers\Admin\SubscriptionAdminController::class, 'updatePlan'])->name('admin.subscriptions.plans.update');
        Route::delete('/plans/{id}', [App\Http\Controllers\Admin\SubscriptionAdminController::class, 'destroyPlan'])->name('admin.subscriptions.plans.destroy');
        Route::get('/plans/{id}/toggle-status', [App\Http\Controllers\Admin\SubscriptionAdminController::class, 'togglePlanStatus'])->name('admin.subscriptions.plans.toggle-status');
        Route::get('/{id}', [App\Http\Controllers\Admin\SubscriptionAdminController::class, 'viewSubscription'])->name('admin.subscriptions.view');
        Route::post('/{id}/cancel', [App\Http\Controllers\Admin\SubscriptionAdminController::class, 'cancelSubscription'])->name('admin.subscriptions.cancel');
        Route::post('/{id}/add-credits', [App\Http\Controllers\Admin\SubscriptionAdminController::class, 'addCredits'])->name('admin.subscriptions.add-credits');
        Route::post('/{id}/mark-as-paid', [App\Http\Controllers\Admin\SubscriptionAdminController::class, 'markAsPaid'])->name('admin.subscriptions.mark-as-paid');
        Route::post('/run-renewal', [App\Http\Controllers\Admin\SubscriptionAdminController::class, 'runRenewalCommand'])->name('admin.subscriptions.run-renewal');
    });
    
    // Admin Apps Management
    Route::prefix('admin/apps')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\AppsController::class, 'index'])->name('admin.apps.index');
        Route::get('/create', [App\Http\Controllers\Admin\AppsController::class, 'create'])->name('admin.apps.create');
        Route::post('/', [App\Http\Controllers\Admin\AppsController::class, 'store'])->name('admin.apps.store');
        Route::get('/{index}/edit', [App\Http\Controllers\Admin\AppsController::class, 'edit'])->name('admin.apps.edit');
        Route::put('/{index}', [App\Http\Controllers\Admin\AppsController::class, 'update'])->name('admin.apps.update');
        Route::delete('/{index}', [App\Http\Controllers\Admin\AppsController::class, 'destroy'])->name('admin.apps.destroy');
        Route::post('/reorder', [App\Http\Controllers\Admin\AppsController::class, 'reorder'])->name('admin.apps.reorder');
    });
});

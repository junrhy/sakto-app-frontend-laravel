<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Customer Routes
|--------------------------------------------------------------------------
|
| Routes for customer functionality including authentication and dashboard.
|
*/

// Customer Auth Routes
Route::get('/customer/login', [App\Http\Controllers\Customer\AuthController::class, 'showLoginForm'])->name('customer.login');
Route::post('/customer/login', [App\Http\Controllers\Customer\AuthController::class, 'login'])->name('customer.login.attempt');
Route::post('/customer/logout', [App\Http\Controllers\Customer\AuthController::class, 'logout'])->name('customer.logout');

// Community Join Request Approval Routes (accessible via email link)
Route::get('/customer/communities/approve/{token}', [App\Http\Controllers\Customer\CommunityController::class, 'approve'])->name('customer.communities.approve');
Route::get('/customer/communities/deny/{token}', [App\Http\Controllers\Customer\CommunityController::class, 'deny'])->name('customer.communities.deny');

// Customer Registration Routes
Route::get('/customer/register', [App\Http\Controllers\Customer\RegisteredCustomerController::class, 'create'])->name('customer.register');
Route::post('/customer/register', [App\Http\Controllers\Customer\RegisteredCustomerController::class, 'store'])->name('customer.register.store');

// Customer Email Verification Routes
Route::middleware(['auth', 'customer'])->group(function () {
    Route::get('/customer/verify-email', App\Http\Controllers\Customer\EmailVerificationPromptController::class)
        ->name('customer.verification.notice');

    Route::get('/customer/verify-email/{id}/{hash}', App\Http\Controllers\Customer\VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('customer.verification.verify');

    Route::post('/customer/email/verification-notification', [App\Http\Controllers\Customer\EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('customer.verification.send');
});

// Customer routes (authenticated and verified)
Route::middleware(['auth', 'customer', 'verified'])->group(function () {
    // Customer Dashboard
    Route::get('/customer/dashboard', [App\Http\Controllers\Customer\DashboardController::class, 'index'])->name('customer.dashboard');
    
    // Customer Profile
    Route::get('/customer/profile', [App\Http\Controllers\Customer\ProfileController::class, 'edit'])->name('customer.profile.edit');
    Route::patch('/customer/profile', [App\Http\Controllers\Customer\ProfileController::class, 'update'])->name('customer.profile.update');
    Route::put('/customer/profile/password', [App\Http\Controllers\Customer\ProfileController::class, 'updatePassword'])->name('customer.profile.password.update');
    Route::post('/customer/profile/address', [App\Http\Controllers\Customer\ProfileController::class, 'updateAddress'])->name('customer.profile.address.update');
    
    // Customer Communities
    Route::get('/customer/communities', [App\Http\Controllers\Customer\CommunityController::class, 'index'])->name('customer.communities');
    Route::get('/customer/communities/{community}', [App\Http\Controllers\Customer\CommunityController::class, 'show'])->name('customer.communities.show');
    Route::post('/customer/communities/{id}/join', [App\Http\Controllers\Customer\CommunityController::class, 'join'])->name('customer.communities.join');
    Route::post('/customer/communities/{id}/unjoin', [App\Http\Controllers\Customer\CommunityController::class, 'unjoin'])->name('customer.communities.unjoin');
    Route::prefix('/customer/{project}/{owner}/courses')
        ->name('customer.projects.courses.')
        ->group(function () {
            Route::get('/', [App\Http\Controllers\Customer\CourseController::class, 'index'])->name('index');
            Route::get('/categories', [App\Http\Controllers\Customer\CourseController::class, 'categories'])->name('categories');
            Route::get('/{course}', [App\Http\Controllers\Customer\CourseController::class, 'show'])->name('show');
            Route::get('/{course}/lessons', [App\Http\Controllers\Customer\CourseController::class, 'lessons'])->name('lessons');
            Route::get('/{course}/learn', [App\Http\Controllers\Customer\CourseController::class, 'learn'])->name('learn');
            Route::post('/{course}/check-enrollment', [App\Http\Controllers\Customer\CourseController::class, 'checkEnrollment'])->name('check-enrollment');
            Route::post('/enrollments/{enrollment}/progress/{lesson}/start', [App\Http\Controllers\Customer\CourseController::class, 'markLessonStarted'])->name('progress.start');
            Route::post('/enrollments/{enrollment}/progress/{lesson}/complete', [App\Http\Controllers\Customer\CourseController::class, 'markLessonCompleted'])->name('progress.complete');
        });
    Route::prefix('/customer/{project}/{owner}/marketplace')
        ->name('customer.projects.marketplace.')
        ->group(function () {
            Route::get('/', [App\Http\Controllers\Customer\MarketplaceController::class, 'index'])->name('index');
            Route::get('/products/{product}', [App\Http\Controllers\Customer\MarketplaceController::class, 'show'])->name('products.show');
            Route::get('/orders', [App\Http\Controllers\Customer\MarketplaceController::class, 'orders'])->name('orders');
        });
    
    // Customer Logistics
    Route::get('/customer/logistics', [App\Http\Controllers\Customer\LogisticsController::class, 'index'])->name('customer.logistics');
    
    // Customer Medical
    Route::get('/customer/medical', [App\Http\Controllers\Customer\MedicalController::class, 'index'])->name('customer.medical');
    
    // Customer F&B
    Route::get('/customer/fnb', [App\Http\Controllers\Customer\FnbController::class, 'index'])->name('customer.fnb');
    
    // Customer Shop
    Route::get('/customer/shop', [App\Http\Controllers\Customer\ShopController::class, 'index'])->name('customer.shop');
    
    // Customer Jobs
    Route::get('/customer/jobs', [App\Http\Controllers\Customer\JobsController::class, 'index'])->name('customer.jobs');
    
    // Customer Travel
    Route::get('/customer/travel', [App\Http\Controllers\Customer\TravelController::class, 'index'])->name('customer.travel');
    
    // Customer Education
    Route::get('/customer/education', [App\Http\Controllers\Customer\EducationController::class, 'index'])->name('customer.education');
    
    // Customer Finance
    Route::get('/customer/finance', [App\Http\Controllers\Customer\FinanceController::class, 'index'])->name('customer.finance');
    
    // Customer Agriculture
    Route::get('/customer/agriculture', [App\Http\Controllers\Customer\AgricultureController::class, 'index'])->name('customer.agriculture');
    
    // Customer Construction
    Route::get('/customer/construction', [App\Http\Controllers\Customer\ConstructionController::class, 'index'])->name('customer.construction');
});


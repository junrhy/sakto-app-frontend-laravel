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
Route::middleware(['auth', 'customer', 'ensure_user_type:customer'])->group(function () {
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
Route::middleware(['auth', 'customer', 'verified', 'ensure_user_type:customer'])->group(function () {
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
            Route::get('/overview', [App\Http\Controllers\Customer\CourseController::class, 'overview'])->name('overview');
            Route::get('/', [App\Http\Controllers\Customer\CourseController::class, 'index'])->name('index');
            Route::get('/categories', [App\Http\Controllers\Customer\CourseController::class, 'categories'])->name('categories');
            Route::get('/{course}', [App\Http\Controllers\Customer\CourseController::class, 'show'])->name('show');
            Route::get('/{course}/lessons', [App\Http\Controllers\Customer\CourseController::class, 'lessons'])->name('lessons');
            Route::get('/{course}/learn', [App\Http\Controllers\Customer\CourseController::class, 'learn'])->name('learn');
            Route::post('/{course}/check-enrollment', [App\Http\Controllers\Customer\CourseController::class, 'checkEnrollment'])->name('check-enrollment');
            Route::post('/enrollments/{enrollment}/progress/{lesson}/start', [App\Http\Controllers\Customer\CourseController::class, 'markLessonStarted'])->name('progress.start');
            Route::post('/enrollments/{enrollment}/progress/{lesson}/complete', [App\Http\Controllers\Customer\CourseController::class, 'markLessonCompleted'])->name('progress.complete');
        });
    Route::prefix('/customer/{project}/{owner}/newsfeed')
        ->name('customer.projects.newsfeed.')
        ->group(function () {
            Route::get('/overview', [App\Http\Controllers\Customer\NewsfeedController::class, 'overview'])->name('overview');
        });
    Route::prefix('/customer/{project}/{owner}/events')
        ->name('customer.projects.events.')
        ->group(function () {
            Route::get('/overview', [App\Http\Controllers\Customer\EventController::class, 'overview'])->name('overview');
        });
    Route::prefix('/customer/{project}/{owner}/resources')
        ->name('customer.projects.resources.')
        ->group(function () {
            Route::get('/overview', [App\Http\Controllers\Customer\ResourceController::class, 'overview'])->name('overview');
        });
    Route::prefix('/customer/{project}/{owner}/challenges')
        ->name('customer.projects.challenges.')
        ->group(function () {
            Route::get('/overview', [App\Http\Controllers\Customer\ChallengeController::class, 'overview'])->name('overview');
        });
    Route::prefix('/customer/{project}/{owner}/marketplace')
        ->name('customer.projects.marketplace.')
        ->group(function () {
            Route::get('/', function (string $project, $owner) {
                return redirect()->route('customer.projects.marketplace.overview', [
                    'project' => $project,
                    'owner' => $owner,
                ]);
            })->name('index');
            Route::get('/overview', [App\Http\Controllers\Customer\MarketplaceController::class, 'overview'])->name('overview');
            Route::get('/checkout', [App\Http\Controllers\Customer\MarketplaceController::class, 'checkout'])->name('checkout');
            Route::get('/my-products', [App\Http\Controllers\Customer\MarketplaceController::class, 'myProducts'])->name('my-products');
            Route::get('/products/{product}', [App\Http\Controllers\Customer\MarketplaceController::class, 'show'])->name('products.show');
            Route::post('/products', [App\Http\Controllers\Customer\MarketplaceController::class, 'store'])->name('products.store');
            Route::match(['put', 'post'], '/products/{product}', [App\Http\Controllers\Customer\MarketplaceController::class, 'update'])->name('products.update');
            Route::delete('/products/{product}', [App\Http\Controllers\Customer\MarketplaceController::class, 'destroy'])->name('products.destroy');
            Route::post('/products/{product}/images', [App\Http\Controllers\Customer\MarketplaceController::class, 'uploadProductImages'])->name('products.images.store');
            Route::delete('/products/{product}/images/{image}', [App\Http\Controllers\Customer\MarketplaceController::class, 'deleteProductImage'])->name('products.images.destroy');
            Route::get('/products/{product}/orders', [App\Http\Controllers\Customer\MarketplaceController::class, 'productOrders'])->name('products.orders');
            Route::post('/orders/{order}/cancel', [App\Http\Controllers\Customer\MarketplaceController::class, 'cancelOrder'])->name('orders.cancel');
            Route::post('/orders', [App\Http\Controllers\Customer\MarketplaceController::class, 'placeOrder'])->name('orders.store');
        });

    Route::prefix('/customer/{project}/{owner}/healthcare')
        ->name('customer.projects.healthcare.')
        ->group(function () {
            Route::get('/', [App\Http\Controllers\Customer\HealthcareController::class, 'index'])->name('index');
            Route::get('/members/{member}/contributions', [App\Http\Controllers\Customer\HealthcareController::class, 'contributions'])->name('contributions');
            Route::get('/members/{member}/claims', [App\Http\Controllers\Customer\HealthcareController::class, 'claims'])->name('claims');
        });

    Route::prefix('/customer/{project}/{owner}/mortuary')
        ->name('customer.projects.mortuary.')
        ->group(function () {
            Route::get('/', [App\Http\Controllers\Customer\MortuaryController::class, 'index'])->name('index');
            Route::get('/members/{member}/contributions', [App\Http\Controllers\Customer\MortuaryController::class, 'contributions'])->name('contributions');
            Route::get('/members/{member}/claims', [App\Http\Controllers\Customer\MortuaryController::class, 'claims'])->name('claims');
        });

    Route::prefix('/customer/{project}/{owner}/lending')
        ->name('customer.projects.lending.')
        ->group(function () {
            Route::get('/', [App\Http\Controllers\Customer\LendingController::class, 'index'])->name('index');
            Route::get('/loans/{loan}', [App\Http\Controllers\Customer\LendingController::class, 'show'])->name('show');
        });

    Route::prefix('/customer/wallet')
        ->name('customer.wallet.')
        ->group(function () {
            Route::get('/', [App\Http\Controllers\Customer\WalletController::class, 'index'])->name('index');
            Route::get('/history', [App\Http\Controllers\Customer\WalletController::class, 'history'])->name('history');
            Route::post('/transfer', [App\Http\Controllers\Customer\WalletController::class, 'transfer'])->name('transfer');
            Route::post('/top-up', [App\Http\Controllers\Customer\WalletController::class, 'topUp'])->name('top-up');
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


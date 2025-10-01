<?php

use App\Http\Controllers\CommunityController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Community Routes
|--------------------------------------------------------------------------
|
| Routes for community management including member pages, products,
| courses, and community features.
|
*/

// Public community routes (no authentication required)
Route::get('/community', [CommunityController::class, 'index'])->name('community');
Route::get('/community/about', [CommunityController::class, 'about'])->name('community.about');
Route::get('/community/help', [CommunityController::class, 'help'])->name('community.help');
Route::get('/community/search', [CommunityController::class, 'search'])->name('community.search');

// Redirect old ID-based URLs to slug-based URLs for SEO
Route::get('/community/member/{id}', function ($id) {
    $user = \App\Models\User::where('project_identifier', 'community')->where('id', $id)->first();
    if ($user && $user->slug) {
        return redirect()->route('member.short', ['identifier' => $user->slug], 301);
    }
    abort(404);
})->where('id', '[0-9]+');

Route::get('/community/member/{identifier}', [CommunityController::class, 'member'])->name('community.member');
Route::get('/m/{identifier}/product/{productId}', [CommunityController::class, 'productDetail'])->name('member.product.detail');
Route::get('/m/{identifier}/products', [CommunityController::class, 'getUserProducts'])->name('member.products.list');
Route::post('/m/{identifier}/products', [CommunityController::class, 'createUserProduct'])->name('member.products.create');
Route::delete('/m/{identifier}/products/{productId}', [CommunityController::class, 'deleteUserProduct'])->name('member.products.delete');
Route::put('/m/{identifier}/products/{productId}', [CommunityController::class, 'updateUserProduct'])->name('member.products.update');
Route::post('/m/{identifier}/products/{productId}/images', [CommunityController::class, 'uploadProductImages'])->name('member.products.images.upload');
Route::delete('/m/{identifier}/products/{productId}/images/{imageId}', [CommunityController::class, 'deleteProductImage'])->name('member.products.images.delete');
Route::get('/m/{identifier}/products/{productId}/orders', [CommunityController::class, 'getOrdersForProduct'])->name('member.products.orders');
Route::get('/m/{identifier}/checkout', [CommunityController::class, 'checkout'])->name('member.checkout');
Route::post('/m/{identifier}/cancel-order/{orderId}', [CommunityController::class, 'cancelOrder'])->name('member.cancel-order');
Route::get('/m/{identifier}/search-lending', [CommunityController::class, 'searchLendingRecords'])->name('member.search-lending');
Route::get('/m/{identifier}/search-healthcare', [CommunityController::class, 'searchHealthcareRecords'])->name('member.search-healthcare');
Route::get('/m/{identifier}/search-mortuary', [CommunityController::class, 'searchMortuaryRecords'])->name('member.search-mortuary');

// Community Billers routes
Route::get('/m/{identifier}/billers', [CommunityController::class, 'getBillers'])->name('member.billers.list');
Route::post('/m/{identifier}/billers/{billerId}/favorite', [CommunityController::class, 'toggleBillerFavorite'])->name('member.billers.favorite');
Route::post('/m/{identifier}/bill-payments', [CommunityController::class, 'storeBillPayment'])->name('member.bill-payments.store');

// Community Courses routes (view only)
Route::prefix('m/{identifier}/courses')->group(function () {
    Route::get('/', [CommunityController::class, 'getCourses'])->name('member.courses.list');
    Route::get('/categories', [CommunityController::class, 'getCourseCategories'])->name('member.courses.categories');
    Route::get('/{courseId}', [CommunityController::class, 'showCourse'])->name('member.courses.show');
    Route::get('/{courseId}/lessons', [CommunityController::class, 'showCourseLessons'])->name('member.courses.lessons');
    Route::get('/{courseId}/learn', [CommunityController::class, 'learnCourse'])->name('member.courses.learn');
    Route::get('/{courseId}/lessons/api', [CommunityController::class, 'getCourseLessons'])->name('member.courses.lessons.api');
    Route::get('/progress/{courseId}/{contactId}', [CommunityController::class, 'getCourseProgress'])->name('member.courses.progress');
    Route::post('/{courseId}/check-enrollment', [CommunityController::class, 'checkEnrollmentStatus'])->name('member.courses.check-enrollment');
    
    // Lesson progress routes
    Route::post('/enrollments/{enrollmentId}/progress/{lessonId}/start', [CommunityController::class, 'markLessonAsStarted'])->name('member.courses.lessons.start');
    Route::post('/enrollments/{enrollmentId}/progress/{lessonId}/complete', [CommunityController::class, 'markLessonAsCompleted'])->name('member.courses.lessons.complete');
});

Route::get('/m/{identifier}', [CommunityController::class, 'member'])->name('member.short');
Route::post('/community/send-signup-link', [CommunityController::class, 'sendSignUpLink'])->name('api.send-signup-link');

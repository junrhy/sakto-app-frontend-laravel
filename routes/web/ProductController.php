<?php

use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductVariantController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Product Routes
|--------------------------------------------------------------------------
|
| Routes for product management including product CRUD, reviews, variants,
| and product orders.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    // Products (subscription required)
    Route::prefix('products')->group(function () {
        Route::get('/', [ProductController::class, 'index'])->name('products.index');
        Route::get('/create', [ProductController::class, 'create'])->name('products.create');
        Route::post('/', [ProductController::class, 'store'])->name('products.store');
        Route::get('/{id}', [ProductController::class, 'show'])->name('products.show');
        Route::get('/{id}/edit', [ProductController::class, 'edit'])->name('products.edit');
        Route::put('/{id}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('/{id}', [ProductController::class, 'destroy'])->name('products.destroy');
        Route::get('/settings', [ProductController::class, 'settings'])->name('products.settings');
        Route::get('/list', [ProductController::class, 'getProducts'])->name('products.list');
        Route::get('/{id}/download', [ProductController::class, 'download'])->name('products.download');
        Route::patch('/{id}/stock', [ProductController::class, 'updateStock'])->name('products.update-stock');
        Route::get('/categories', [ProductController::class, 'getCategories'])->name('products.categories');
        
        // Product Reviews
        Route::get('/{productId}/reviews', [ProductController::class, 'getReviews'])->name('products.reviews');
        Route::post('/{productId}/reviews', [ProductController::class, 'storeReview'])->name('products.reviews.store');
        Route::post('/{productId}/reviews/{reviewId}/vote', [ProductController::class, 'voteReview'])->name('products.reviews.vote');
        Route::delete('/{productId}/reviews/{reviewId}', [ProductController::class, 'deleteReview'])->name('products.reviews.destroy');
        Route::post('/{productId}/reviews/{reviewId}/approve', [ProductController::class, 'approveReview'])->name('products.reviews.approve');
        Route::post('/{productId}/reviews/{reviewId}/toggle-feature', [ProductController::class, 'toggleFeatureReview'])->name('products.reviews.toggle-feature');
        Route::post('/{productId}/reviews/{reviewId}/report', [ProductController::class, 'reportReview'])->name('products.reviews.report');
    });

    // Product Review Reports (subscription required)
    Route::prefix('product-review-reports')->group(function () {
        Route::get('/reported-reviews', [ProductController::class, 'reportedReviews'])->name('products.reported-reviews');
        Route::patch('/reports/{reportId}/status', [ProductController::class, 'updateReportStatus'])->name('products.reports.status');
    });

    // Product Variants (subscription required)
    Route::prefix('products/{productId}/variants')->group(function () {
        Route::get('/', [ProductVariantController::class, 'index'])->name('product-variants.index');
        Route::post('/', [ProductVariantController::class, 'store'])->name('product-variants.store');
        Route::get('/attributes', [ProductVariantController::class, 'getAttributes'])->name('product-variants.attributes');
        Route::post('/bulk-update', [ProductVariantController::class, 'bulkUpdate'])->name('product-variants.bulk-update');
        Route::get('/{variantId}', [ProductVariantController::class, 'show'])->name('product-variants.show');
        Route::put('/{variantId}', [ProductVariantController::class, 'update'])->name('product-variants.update');
        Route::delete('/{variantId}', [ProductVariantController::class, 'destroy'])->name('product-variants.destroy');
        Route::patch('/{variantId}/stock', [ProductVariantController::class, 'updateStock'])->name('product-variants.update-stock');
    });
});

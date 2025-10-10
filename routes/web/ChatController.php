<?php

use App\Http\Controllers\ChatController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Chat Controller Routes
|--------------------------------------------------------------------------
|
| Routes for chat functionality.
|
*/

// Chat routes without main app authentication (handled by ChatController)
Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');

// Chat API endpoints - must come before parameterized routes
Route::prefix('chat')->group(function () {
    Route::post('/conversations', [ChatController::class, 'createConversation'])->name('chat.create-conversation');
    Route::post('/messages', [ChatController::class, 'sendMessage'])->name('chat.send-message');
    Route::post('/mark-read', [ChatController::class, 'markAsRead'])->name('chat.mark-read');
    Route::get('/users', [ChatController::class, 'getUsers'])->name('chat.users');
});

// Parameterized routes - must come after specific routes
Route::get('/chat/{id}', [ChatController::class, 'show'])->name('chat.show');

// Debug route to test cookie reading
Route::get('/chat-debug', function() {
    return response()->json([
        'cookie_token' => request()->cookie('chat_token'),
        'header_token' => request()->header('Authorization'),
        'all_cookies' => request()->cookies->all()
    ]);
});

// Debug route to test token authentication
Route::get('/chat-debug-token', [ChatController::class, 'debugToken'])->name('chat.debug-token');

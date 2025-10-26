<?php

use App\Http\Controllers\CourseController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Course Routes
|--------------------------------------------------------------------------
|
| Routes for course management including course creation, lesson management,
| enrollment, and progress tracking.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection', 'premium'])->group(function () {
    // Courses (subscription required)
    Route::prefix('courses')->group(function () {
        Route::get('/', [CourseController::class, 'index'])->name('courses.index');
        Route::get('/create', [CourseController::class, 'create'])->name('courses.create');
        Route::post('/', [CourseController::class, 'store'])->name('courses.store');
        
        // API routes for frontend data fetching (must come before parameter routes)
        Route::get('/list', [CourseController::class, 'getCourses'])->name('courses.list');
        Route::get('/categories', [CourseController::class, 'getCategories'])->name('courses.categories');
        Route::get('/progress/{courseId}/{contactId}', [CourseController::class, 'getProgress'])->name('courses.progress');
        Route::get('/{id}/lessons/api', [CourseController::class, 'getLessons'])->name('courses.lessons.api');
        
        // Parameter routes (must come after specific routes)
        Route::get('/{id}', [CourseController::class, 'show'])->name('courses.show');
        Route::get('/{id}/edit', [CourseController::class, 'edit'])->name('courses.edit');
        Route::put('/{id}', [CourseController::class, 'update'])->name('courses.update');
        Route::delete('/{id}', [CourseController::class, 'destroy'])->name('courses.destroy');
        Route::post('/{id}/enroll', [CourseController::class, 'enroll'])->name('courses.enroll');
        Route::post('/{id}/check-enrollment', [CourseController::class, 'checkEnrollmentStatus'])->name('courses.check-enrollment');
        Route::get('/{id}/learn', [CourseController::class, 'learn'])->name('courses.learn');
        Route::get('/{id}/lessons', [CourseController::class, 'lessons'])->name('courses.lessons');
        Route::get('/{id}/lessons/create', [CourseController::class, 'createLesson'])->name('courses.lessons.create');
        Route::post('/{id}/lessons', [CourseController::class, 'storeLesson'])->name('courses.lessons.store');
        Route::get('/{id}/lessons/{lessonId}/edit', [CourseController::class, 'editLesson'])->name('courses.lessons.edit');
        Route::put('/{id}/lessons/{lessonId}', [CourseController::class, 'updateLesson'])->name('courses.lessons.update');
        Route::delete('/{id}/lessons/{lessonId}', [CourseController::class, 'destroyLesson'])->name('courses.lessons.destroy');
    });
    
    // Course enrollment progress routes (outside courses prefix to match frontend calls)
    Route::post('/course-enrollments/{enrollmentId}/progress/{lessonId}/start', [CourseController::class, 'markLessonAsStarted'])->name('course-enrollments.progress.start');
    Route::post('/course-enrollments/{enrollmentId}/progress/{lessonId}/complete', [CourseController::class, 'markLessonAsCompleted'])->name('course-enrollments.progress.complete');
    Route::get('/course-enrollments/{enrollmentId}/certificate', [CourseController::class, 'downloadCertificate'])->name('course-enrollments.certificate');
    Route::get('/course-enrollments/{enrollmentId}/certificate/get', [CourseController::class, 'getCertificate'])->name('course-enrollments.certificate.get');
});

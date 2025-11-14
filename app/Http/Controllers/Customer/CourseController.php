<?php

namespace App\Http\Controllers\Customer;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Http;

class CourseController extends CustomerProjectController
{
    public function overview(Request $request, string $project, $ownerIdentifier): Response
    {
        $this->ensureCustomerProject($request, $project);

        try {
            $owner = $this->resolveOwner($project, $ownerIdentifier);
            $owner->app_currency = $this->decodeCurrency($owner->app_currency);

            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/courses", [
                    'client_identifier' => $owner->identifier,
                    'status' => 'published',
                    'per_page' => 24,
                    'page' => 1,
                ]);

            $courses = [];
            if ($response->successful()) {
                $payload = $response->json();
                $courses = $payload['data'] ?? ($payload['courses'] ?? []);
            }

            return Inertia::render('Customer/Courses/Overview', [
                'project' => $project,
                'owner' => $this->transformOwner($owner),
                'courses' => $courses,
                'appCurrency' => $owner->app_currency ?? $this->decodeCurrency($request->user()->app_currency),
                'backUrl' => $this->resolveBackUrl($project, $owner),
            ]);
        } catch (ModelNotFoundException $e) {
            abort(404, 'Owner not found');
        } catch (\Throwable $th) {
            abort(500, 'Failed to load courses overview');
        }
    }

    public function index(Request $request, string $project, $ownerIdentifier): Response
    {
        // Ensure Inertia requests always receive an Inertia response by
        // delegating to the overview renderer. The dedicated overview route
        // can still be used directly, while /courses now behaves the same way.
        return $this->overview($request, $project, $ownerIdentifier);
    }

    public function categories(Request $request, string $project, $ownerIdentifier): JsonResponse
    {
        $this->ensureCustomerProject($request, $project);

        try {
            $owner = $this->resolveOwner($project, $ownerIdentifier);

            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/courses/categories", [
                    'client_identifier' => $owner->identifier,
                ]);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'error' => 'Failed to fetch course categories',
                'data' => [],
            ], $response->status());
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'error' => 'Owner not found',
            ], 404);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => 'An error occurred while loading course categories',
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    public function show(Request $request, string $project, $ownerIdentifier, $courseId): Response
    {
        $this->ensureCustomerProject($request, $project);

        try {
            $owner = $this->resolveOwner($project, $ownerIdentifier);
            $owner->app_currency = $this->decodeCurrency($owner->app_currency);

            $course = $this->fetchCourse($owner, $courseId);
            $studentName = trim((string) $request->user()->name);
            $enrollment = $studentName !== ''
                ? $this->fetchCourseEnrollment($owner, $courseId, $studentName)
                : null;

            return Inertia::render('Customer/Courses/Show', [
                'community' => $owner,
                'course' => $course,
                'progress' => $enrollment['enrollment'] ?? null,
                'isEnrolled' => $enrollment['is_enrolled'] ?? false,
                'project' => $project,
            ]);
        } catch (ModelNotFoundException $e) {
            abort(404, 'Course not found');
        } catch (\Throwable $th) {
            abort(500, 'Failed to load course details');
        }
    }

    public function lessons(Request $request, string $project, $ownerIdentifier, $courseId): Response
    {
        $this->ensureCustomerProject($request, $project);

        try {
            $owner = $this->resolveOwner($project, $ownerIdentifier);
            $owner->app_currency = $this->decodeCurrency($owner->app_currency);

            $course = $this->fetchCourse($owner, $courseId);
            $lessons = $this->fetchCourseLessons($owner, $courseId);
            $studentName = trim((string) $request->user()->name);
            $enrollment = $studentName !== ''
                ? $this->fetchCourseEnrollment($owner, $courseId, $studentName)
                : null;

            $lessonsWithProgress = $this->mergeLessonProgress(
                $lessons,
                $enrollment['enrollment']['lesson_progress'] ?? []
            );

            return Inertia::render('Customer/Courses/Lessons/Index', [
                'community' => $owner,
                'course' => $course,
                'lessons' => $lessonsWithProgress,
                'progress' => $enrollment['enrollment'] ?? null,
                'isEnrolled' => $enrollment['is_enrolled'] ?? false,
                'project' => $project,
            ]);
        } catch (ModelNotFoundException $e) {
            abort(404, 'Course not found');
        } catch (\Throwable $th) {
            abort(500, 'Failed to load course lessons');
        }
    }

    public function learn(Request $request, string $project, $ownerIdentifier, $courseId): Response
    {
        $this->ensureCustomerProject($request, $project);

        try {
            $owner = $this->resolveOwner($project, $ownerIdentifier);
            $owner->app_currency = $this->decodeCurrency($owner->app_currency);

            $course = $this->fetchCourse($owner, $courseId);
            $lessons = $this->fetchCourseLessons($owner, $courseId, true);
            $studentName = trim((string) $request->user()->name);
            $enrollment = $studentName !== ''
                ? $this->fetchCourseEnrollment($owner, $courseId, $studentName)
                : null;

            $lessonsWithProgress = $this->mergeLessonProgress(
                $lessons,
                $enrollment['enrollment']['lesson_progress'] ?? []
            );

            $currentLesson = $this->determineCurrentLesson(
                $lessonsWithProgress,
                $request->input('lesson_id')
            );

            return Inertia::render('Customer/Courses/Learn', [
                'community' => $owner,
                'course' => $course,
                'lessons' => $lessonsWithProgress,
                'currentLesson' => $currentLesson,
                'progress' => $enrollment['enrollment'] ?? null,
                'isEnrolled' => $enrollment['is_enrolled'] ?? false,
                'project' => $project,
            ]);
        } catch (ModelNotFoundException $e) {
            abort(404, 'Course not found');
        } catch (\Throwable $th) {
            abort(500, 'Failed to load course content');
        }
    }

    public function checkEnrollment(Request $request, string $project, $ownerIdentifier, $courseId): JsonResponse
    {
        $this->ensureCustomerProject($request, $project);

        try {
            $owner = $this->resolveOwner($project, $ownerIdentifier);
            $studentName = trim((string) $request->user()->name);

            if ($studentName === '') {
                return response()->json([
                    'is_enrolled' => false,
                    'enrollment' => null,
                ]);
            }

            $enrollment = $this->fetchCourseEnrollment($owner, $courseId, $studentName);

            return response()->json($enrollment);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'is_enrolled' => false,
                'enrollment' => null,
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => 'Failed to check enrollment status',
            ], 500);
        }
    }

    public function markLessonStarted(Request $request, string $project, $ownerIdentifier, $enrollmentId, $lessonId): JsonResponse
    {
        $this->ensureCustomerProject($request, $project);

        try {
            $this->resolveOwner($project, $ownerIdentifier);

            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/course-enrollments/{$enrollmentId}/progress/{$lessonId}/start");

            return response()->json($response->json(), $response->status());
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'error' => 'Owner not found',
            ], 404);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => 'Failed to mark lesson as started',
            ], 500);
        }
    }

    public function markLessonCompleted(Request $request, string $project, $ownerIdentifier, $enrollmentId, $lessonId): JsonResponse
    {
        $this->ensureCustomerProject($request, $project);

        try {
            $this->resolveOwner($project, $ownerIdentifier);

            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/course-enrollments/{$enrollmentId}/progress/{$lessonId}/complete");

            return response()->json($response->json(), $response->status());
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'error' => 'Owner not found',
            ], 404);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => 'Failed to mark lesson as completed',
            ], 500);
        }
    }

    private function transformOwner($owner): array
    {
        return [
            'id' => $owner->id,
            'name' => $owner->name,
            'slug' => $owner->slug,
            'identifier' => $owner->identifier,
            'project_identifier' => $owner->project_identifier,
        ];
    }

    private function resolveBackUrl(string $project, $owner): string
    {
        if ($project === 'community') {
            $identifier = $owner->slug ?? $owner->identifier ?? $owner->id;

            return route('customer.communities.show', $identifier);
        }

        return route('customer.dashboard');
    }
}


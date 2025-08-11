<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class CourseController extends Controller
{
    protected $apiUrl;
    protected $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    /**
     * Display the courses index page.
     */
    public function index()
    {
        return Inertia::render('Course/Index');
    }

    /**
     * Get all courses with filtering and pagination.
     */
    public function getCourses(Request $request)
    {
        try {
            $request->merge(['client_identifier' => auth()->user()->identifier]);
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/courses', $request->all());

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch courses',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get course categories.
     */
    public function getCategories(Request $request)
    {
        try {
            $request->merge(['client_identifier' => auth()->user()->identifier]);
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/courses/categories', $request->all());

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch categories',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the course creation form.
     */
    public function create()
    {
        return Inertia::render('Course/Create');
    }

    /**
     * Store a new course.
     */
    public function store(Request $request)
    {
        try {
            $request->merge(['client_identifier' => auth()->user()->identifier]);
            $response = Http::withToken($this->apiToken)
                ->post($this->apiUrl . '/courses', $request->all());

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create course',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a specific course.
     */
    public function show($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/courses/' . $id);

            if ($response->successful()) {
                $course = $response->json()['data'];
            } else {
                abort(404);
            }

            return Inertia::render('Course/Show', [
                'course' => $course,
            ]);
        } catch (\Exception $e) {
            abort(404);
        }
    }

    /**
     * Display the course edit form.
     */
    public function edit($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/courses/' . $id);

            if ($response->successful()) {
                $course = $response->json()['data'];
            } else {
                abort(404);
            }

            return Inertia::render('Course/Edit', [
                'course' => $course,
            ]);
        } catch (\Exception $e) {
            abort(404);
        }
    }

    /**
     * Update a course.
     */
    public function update(Request $request, $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->put($this->apiUrl . '/courses/' . $id, $request->all());

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update course',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a course.
     */
    public function destroy($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete($this->apiUrl . '/courses/' . $id);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete course',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Enroll in a course.
     */
    public function enroll(Request $request, $id)
    {
        try {
            $request->merge([
                'course_id' => $id,
                'client_identifier' => auth()->user()->identifier,
            ]);
            
            $response = Http::withToken($this->apiToken)
                ->post($this->apiUrl . '/course-enrollments', $request->all());

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to enroll in course',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get course learning page.
     */
    public function learn($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/courses/' . $id);

            if ($response->successful()) {
                $course = $response->json()['data'];
            } else {
                abort(404);
            }

            // Get enrollment progress
            $progressResponse = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/course-progress/' . $id . '/' . auth()->user()->identifier);

            $progress = null;
            if ($progressResponse->successful()) {
                $progress = $progressResponse->json()['data'];
            }

            return Inertia::render('Course/Learn', [
                'course' => $course,
                'progress' => $progress,
            ]);
        } catch (\Exception $e) {
            abort(404);
        }
    }

    /**
     * Get course progress.
     */
    public function getProgress($courseId, $contactId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/course-progress/' . $courseId . '/' . $contactId);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch course progress',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

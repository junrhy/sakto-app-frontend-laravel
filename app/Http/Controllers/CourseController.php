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
    public function show(Request $request, $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/courses/' . $id);

            if ($response->successful()) {
                $course = $response->json()['data'];
            } else {
                abort(404);
            }

            // Get contact information if contact_id is provided
            $contact = null;
            if ($request->has('contact_id')) {
                $contactResponse = Http::withToken($this->apiToken)
                    ->get($this->apiUrl . '/contacts/' . $request->contact_id, [
                        'client_identifier' => auth()->user()->identifier
                    ]);

                if ($contactResponse->successful()) {
                    $contact = $contactResponse->json();
                }
            }

            return Inertia::render('Course/Show', [
                'course' => $course,
                'viewingContact' => $contact,
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

            if ($response->successful()) {
                return redirect()->route('courses.index')->with('success', 'Course deleted successfully');
            } else {
                return redirect()->back()->with('error', 'Failed to delete course');
            }
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete course: ' . $e->getMessage());
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

            if ($response->successful()) {
                return redirect()->route('courses.learn', $id)->with('success', 'Successfully enrolled in course!');
            } else {
                $errorData = $response->json();
                return back()->withErrors(['enrollment' => $errorData['message'] ?? 'Failed to enroll in course']);
            }
        } catch (\Exception $e) {
            return back()->withErrors(['enrollment' => 'Failed to enroll in course: ' . $e->getMessage()]);
        }
    }

    /**
     * Get course learning page.
     */
    public function learn(Request $request, $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/courses/' . $id);

            if ($response->successful()) {
                $course = $response->json()['data'];
            } else {
                abort(404);
            }

            // Get contact information if contact_id is provided
            $contact = null;
            $contactId = $request->get('contact_id', auth()->user()->identifier);
            
            if ($request->has('contact_id')) {
                $contactResponse = Http::withToken($this->apiToken)
                    ->get($this->apiUrl . '/contacts/' . $request->contact_id, [
                        'client_identifier' => auth()->user()->identifier
                    ]);
                
                if ($contactResponse->successful()) {
                    $contact = $contactResponse->json();
                }
            }

            // Get enrollment progress
            $progressResponse = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/course-progress/' . $id . '/' . $contactId);

            $progress = null;
            if ($progressResponse->successful()) {
                $progress = $progressResponse->json()['data'];
            }

            return Inertia::render('Course/Learn', [
                'course' => $course,
                'progress' => $progress,
                'viewingContact' => $contact,
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

    /**
     * Get course lessons for learning.
     */
    public function getLessons(Request $request, $id)
    {
        try {
            // Build the API URL with contact_id if provided
            $apiUrl = $this->apiUrl . '/courses/' . $id . '/lessons';
            if ($request->has('contact_id')) {
                $apiUrl .= '?contact_id=' . $request->contact_id;
            }

            $response = Http::withToken($this->apiToken)
                ->get($apiUrl);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch lessons',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get course lessons.
     */
    public function lessons(Request $request, $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/courses/' . $id);

            if ($response->successful()) {
                $course = $response->json()['data'];
            } else {
                abort(404);
            }

            // Get lessons for this course with contact-specific progress if contact_id is provided
            $lessonsUrl = $this->apiUrl . '/courses/' . $id . '/lessons';
            if ($request->has('contact_id')) {
                $lessonsUrl .= '?contact_id=' . $request->contact_id;
            }
            
            $lessonsResponse = Http::withToken($this->apiToken)
                ->get($lessonsUrl);

            $lessons = [];
            if ($lessonsResponse->successful()) {
                $lessons = $lessonsResponse->json()['data'] ?? [];
            }

            // Get contact information if contact_id is provided
            $contact = null;
            if ($request->has('contact_id')) {
                $contactResponse = Http::withToken($this->apiToken)
                    ->get($this->apiUrl . '/contacts/' . $request->contact_id, [
                        'client_identifier' => auth()->user()->identifier
                    ]);
                
                if ($contactResponse->successful()) {
                    $contact = $contactResponse->json();
                }
            }

            return Inertia::render('Course/Lessons/Index', [
                'course' => $course,
                'lessons' => $lessons,
                'viewingContact' => $contact,
            ]);
        } catch (\Exception $e) {
            abort(404);
        }
    }

    /**
     * Show create lesson form.
     */
    public function createLesson($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/courses/' . $id);

            if ($response->successful()) {
                $course = $response->json()['data'];
            } else {
                abort(404);
            }

            return Inertia::render('Course/Lessons/Create', [
                'course' => $course,
            ]);
        } catch (\Exception $e) {
            abort(404);
        }
    }

    /**
     * Store a new lesson.
     */
    public function storeLesson(Request $request, $id)
    {
        try {
            // Log the request data for debugging
            \Log::info('Creating lesson for course ' . $id, $request->all());
            
            $response = Http::withToken($this->apiToken)
                ->post($this->apiUrl . '/courses/' . $id . '/lessons', $request->all());

            // Log the response for debugging
            \Log::info('Lesson creation response', [
                'status' => $response->status(),
                'body' => $response->json()
            ]);

            if ($response->successful()) {
                return redirect()->route('courses.lessons', $id)->with('success', 'Lesson created successfully');
            } else {
                $errorData = $response->json();
                $errorMessage = $errorData['message'] ?? 'Failed to create lesson';
                if (isset($errorData['errors'])) {
                    $errorMessage .= ': ' . json_encode($errorData['errors']);
                }
                return redirect()->back()->with('error', $errorMessage)->withInput();
            }
        } catch (\Exception $e) {
            \Log::error('Lesson creation exception: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to create lesson: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Show edit lesson form.
     */
    public function editLesson($id, $lessonId)
    {
        try {
            $courseResponse = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/courses/' . $id);

            if (!$courseResponse->successful()) {
                abort(404);
            }
            $course = $courseResponse->json()['data'];

            $lessonResponse = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/courses/' . $id . '/lessons/' . $lessonId);

            if (!$lessonResponse->successful()) {
                abort(404);
            }
            $lesson = $lessonResponse->json()['data'];

            return Inertia::render('Course/Lessons/Edit', [
                'course' => $course,
                'lesson' => $lesson,
            ]);
        } catch (\Exception $e) {
            abort(404);
        }
    }

    /**
     * Update a lesson.
     */
    public function updateLesson(Request $request, $id, $lessonId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->put($this->apiUrl . '/courses/' . $id . '/lessons/' . $lessonId, $request->all());

            if ($response->successful()) {
                return redirect()->route('courses.lessons', $id)->with('success', 'Lesson updated successfully');
            } else {
                return redirect()->back()->with('error', 'Failed to update lesson');
            }
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update lesson: ' . $e->getMessage());
        }
    }

    /**
     * Delete a lesson.
     */
    public function destroyLesson($id, $lessonId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete($this->apiUrl . '/courses/' . $id . '/lessons/' . $lessonId);

            if ($response->successful()) {
                return redirect()->route('courses.lessons', $id)->with('success', 'Lesson deleted successfully');
            } else {
                return redirect()->back()->with('error', 'Failed to delete lesson');
            }
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete lesson: ' . $e->getMessage());
        }
    }

    /**
     * Check enrollment status for a contact in a course.
     */
    public function checkEnrollmentStatus(Request $request, $courseId)
    {
        try {
            $request->merge([
                'course_id' => $courseId,
                'client_identifier' => auth()->user()->identifier,
            ]);

            $response = Http::withToken($this->apiToken)
                ->post($this->apiUrl . '/course-enrollments/check-status', $request->all());

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check enrollment status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mark a lesson as started for an enrollment.
     */
    public function markLessonAsStarted($enrollmentId, $lessonId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post($this->apiUrl . '/course-enrollments/' . $enrollmentId . '/progress/' . $lessonId . '/start');

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark lesson as started',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mark a lesson as completed for an enrollment.
     */
    public function markLessonAsCompleted($enrollmentId, $lessonId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post($this->apiUrl . '/course-enrollments/' . $enrollmentId . '/progress/' . $lessonId . '/complete');

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark lesson as completed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download certificate for a completed course enrollment.
     */
    public function downloadCertificate($enrollmentId)
    {
        try {
            // First, generate the certificate using the backend API
            $response = Http::withToken($this->apiToken)
                ->post($this->apiUrl . '/course-enrollments/' . $enrollmentId . '/generate-certificate');

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to generate certificate',
                    'error' => $response->json()['message'] ?? 'Unknown error'
                ], $response->status());
            }

            $certificateData = $response->json()['data'];

            // Create HTML certificate using the generated data
            $html = $this->generateCertificateHtml($certificateData);

            // Return the HTML content for PDF generation on the frontend
            return response()->json([
                'success' => true,
                'data' => [
                    'html' => $html,
                    'filename' => 'certificate-' . $certificateData['certificate_id'] . '.pdf',
                    'certificateData' => $certificateData
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to download certificate',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get existing certificate data for an enrollment.
     */
    public function getCertificate($enrollmentId)
    {
        try {
            // Get the enrollment with certificate data
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/course-enrollments/' . $enrollmentId);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to get enrollment data',
                    'error' => $response->json()['message'] ?? 'Unknown error'
                ], $response->status());
            }

            $enrollment = $response->json()['data'];
            
            // Check if certificate data exists
            if (!$enrollment['certificate_data']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Certificate not yet generated. Please complete the course first.'
                ], 400);
            }

            $certificateData = $enrollment['certificate_data'];

            // Create HTML certificate using the existing data
            $html = $this->generateCertificateHtml($certificateData);

            // Return the HTML content for PDF generation on the frontend
            return response()->json([
                'success' => true,
                'data' => [
                    'html' => $html,
                    'filename' => 'certificate-' . $certificateData['certificate_id'] . '.pdf',
                    'certificateData' => $certificateData
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get certificate',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate HTML for the certificate.
     */
    private function generateCertificateHtml($certificateData)
    {
        $html = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Certificate of Completion</title>
            <style>
                * {
                    box-sizing: border-box;
                }
                body {
                    font-family: "Times New Roman", serif;
                    margin: 0;
                    padding: 0;
                    background: #f8f9fa;
                    width: 100%;
                    height: 100%;
                }
                .certificate {
                    background: white;
                    padding: 30px;
                    margin: 20px;
                    border: 3px solid #FFD700;
                    text-align: center;
                    width: calc(100% - 40px);
                    max-width: 800px;
                    margin-left: auto;
                    margin-right: auto;
                    position: relative;
                    page-break-inside: avoid;
                }
                .certificate::before {
                    content: "";
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    right: 10px;
                    bottom: 10px;
                    border: 1px solid #FFD700;
                    pointer-events: none;
                }
                .header {
                    margin-bottom: 20px;
                }
                .title {
                    font-size: 32px;
                    font-weight: bold;
                    color: #2c3e50;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }
                .subtitle {
                    font-size: 18px;
                    color: #7f8c8d;
                    margin-bottom: 15px;
                    font-style: italic;
                }
                .content {
                    margin: 25px 0;
                }
                .student-name {
                    font-size: 28px;
                    font-weight: bold;
                    color: #2c3e50;
                    margin: 15px 0;
                    text-transform: uppercase;
                }
                .course-title {
                    font-size: 22px;
                    color: #34495e;
                    margin: 15px 0;
                    font-weight: bold;
                }
                .completion-text {
                    font-size: 16px;
                    color: #7f8c8d;
                    line-height: 1.4;
                    margin: 20px 0;
                }
                .details {
                    display: flex;
                    justify-content: space-between;
                    margin: 25px 0;
                    text-align: left;
                }
                .detail-item {
                    flex: 1;
                    margin: 0 15px;
                }
                .detail-label {
                    font-size: 12px;
                    color: #7f8c8d;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 3px;
                }
                .detail-value {
                    font-size: 14px;
                    color: #2c3e50;
                    font-weight: bold;
                }
                .footer {
                    margin-top: 25px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                }
                .signature-section {
                    text-align: center;
                    flex: 1;
                }
                .signature-line {
                    width: 150px;
                    height: 1px;
                    background: #2c3e50;
                    margin: 8px auto;
                }
                .certificate-id {
                    font-size: 10px;
                    color: #95a5a6;
                    margin-top: 15px;
                    font-family: monospace;
                }
                @media print {
                    body {
                        background: white;
                    }
                    .certificate {
                        margin: 0;
                        border: none;
                        box-shadow: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="certificate">
                <div class="header">
                    <div class="title">Certificate of Completion</div>
                    <div class="subtitle">This is to certify that</div>
                </div>
                
                <div class="content">
                    <div class="student-name">' . htmlspecialchars($certificateData['student_name']) . '</div>
                    <div class="completion-text">
                        has successfully completed the course
                    </div>
                    <div class="course-title">' . htmlspecialchars($certificateData['course_title']) . '</div>
                </div>
                
                <div class="details">
                    <div class="detail-item">
                        <div class="detail-label">Completion Date</div>
                        <div class="detail-value">' . htmlspecialchars($certificateData['completion_date']) . '</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Course Duration</div>
                        <div class="detail-value">' . htmlspecialchars($certificateData['course_duration'] ?? 'N/A') . '</div>
                    </div>
                </div>
                
                <div class="footer">
                    <div class="signature-section">
                        <div class="signature-line"></div>
                        <div class="detail-label">Instructor</div>
                        <div class="detail-value">' . htmlspecialchars($certificateData['instructor_name'] ?? 'Course Instructor') . '</div>
                    </div>
                    <div class="signature-section">
                        <div class="signature-line"></div>
                        <div class="detail-label">Date Issued</div>
                        <div class="detail-value">' . htmlspecialchars($certificateData['issued_at']) . '</div>
                    </div>
                </div>
                
                <div class="certificate-id">
                    Certificate ID: ' . htmlspecialchars($certificateData['certificate_id']) . '
                </div>
            </div>
        </body>
        </html>';

        return $html;
    }
}

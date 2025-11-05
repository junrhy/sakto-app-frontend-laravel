<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

class PublicJobsController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    /**
     * List published jobs for a job board (public)
     */
    public function jobBoard($slug)
    {
        try {
            // Get job board by slug (public access - no client_identifier needed)
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/job-boards", [
                    'slug' => $slug,
                    'is_active' => true
                ]);
            
            if (!$response->successful() || empty($response->json('data'))) {
                abort(404, 'Job board not found');
            }

            $jobBoardData = $response->json('data');
            $jobBoard = is_array($jobBoardData) && isset($jobBoardData[0]) ? $jobBoardData[0] : $jobBoardData;
            $clientIdentifier = $jobBoard['client_identifier'] ?? null;

            if (!$clientIdentifier) {
                abort(404, 'Job board not found');
            }

            // Get published jobs for this job board
            $jobsResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/jobs", [
                    'client_identifier' => $clientIdentifier,
                    'job_board_id' => $jobBoard['id'],
                    'status' => 'published'
                ]);

            $jobs = $jobsResponse->successful() ? $jobsResponse->json('data', []) : [];

            return Inertia::render('Public/Jobs/JobBoard', [
                'jobBoard' => $jobBoard,
                'jobs' => $jobs,
                'clientIdentifier' => $clientIdentifier,
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in public jobBoard', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            abort(404, 'Job board not found');
        }
    }

    /**
     * Show job details (public)
     */
    public function job(Request $request, $id)
    {
        try {
            // Get client_identifier from URL parameter or from job
            $clientIdentifierParam = $request->query('client');
            
            // Get job details
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/jobs/{$id}");

            if (!$response->successful()) {
                abort(404, 'Job not found');
            }

            $job = $response->json('data');
            
            // Only show published jobs
            if ($job['status'] !== 'published') {
                abort(404, 'Job not found');
            }

            // Use client_identifier from URL param or from job
            $clientIdentifier = $clientIdentifierParam ?? $job['client_identifier'] ?? null;

            // Get job board details
            $boardResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/job-boards/{$job['job_board_id']}");

            $jobBoard = $boardResponse->successful() ? $boardResponse->json('data') : null;

            return Inertia::render('Public/Jobs/Job', [
                'job' => $job,
                'jobBoard' => $jobBoard,
                'clientIdentifier' => $clientIdentifier,
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in public job', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            abort(404, 'Job not found');
        }
    }

    /**
     * Show application form (public)
     */
    public function apply(Request $request, $id)
    {
        try {
            // Get client_identifier from URL parameter or from job
            $clientIdentifierParam = $request->query('client');
            
            // Get job details
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/jobs/{$id}");

            if (!$response->successful()) {
                abort(404, 'Job not found');
            }

            $job = $response->json('data');
            
            // Only allow applications for published jobs
            if ($job['status'] !== 'published') {
                abort(404, 'Job not found');
            }

            // Use client_identifier from URL param or from job
            $clientIdentifier = $clientIdentifierParam ?? $job['client_identifier'] ?? null;

            // Check if application deadline has passed
            if ($job['application_deadline'] && now()->gt($job['application_deadline'])) {
                return Inertia::render('Public/Jobs/JobClosed', [
                    'job' => $job,
                    'message' => 'The application deadline for this job has passed.'
                ]);
            }

            return Inertia::render('Public/Jobs/Apply', [
                'job' => $job,
                'clientIdentifier' => $clientIdentifier,
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in public apply', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            abort(404, 'Job not found');
        }
    }

    /**
     * Submit application (public)
     */
    public function submitApplication(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'nullable|string|max:20',
                'cover_letter' => 'nullable|string',
                'address' => 'nullable|string|max:500',
                'linkedin_url' => 'nullable|url|max:255',
                'portfolio_url' => 'nullable|url|max:255',
                'work_experience' => 'nullable|string',
                'education' => 'nullable|string',
                'skills' => 'nullable|string',
                'certifications' => 'nullable|string',
                'languages' => 'nullable|string',
                'summary' => 'nullable|string',
                'client_identifier' => 'nullable|string', // Allow client_identifier from form
            ]);

            // Get client_identifier from form data, URL parameter, or from job
            $clientIdentifierParam = $validated['client_identifier'] ?? $request->query('client');
            
            // Get job details to get client identifier
            $jobResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/jobs/{$id}");

            if (!$jobResponse->successful()) {
                return back()->withErrors(['error' => 'Job not found']);
            }

            $job = $jobResponse->json('data');
            
            if ($job['status'] !== 'published') {
                return back()->withErrors(['error' => 'This job is no longer accepting applications']);
            }

            // Check if application deadline has passed
            if ($job['application_deadline'] && now()->gt($job['application_deadline'])) {
                return back()->withErrors(['error' => 'The application deadline for this job has passed']);
            }

            // Use client_identifier from form/URL param or from job
            $clientIdentifier = $clientIdentifierParam ?? $job['client_identifier'] ?? null;
            
            if (!$clientIdentifier) {
                return back()->withErrors(['error' => 'Client identifier is required']);
            }

            // Find or create applicant by email
            $applicantResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/job-applicants/find-by-email", [
                    'client_identifier' => $clientIdentifier,
                    'email' => $validated['email']
                ]);

            $applicantId = null;
            
            if ($applicantResponse->successful() && !empty($applicantResponse->json('data'))) {
                // Applicant exists
                $applicantId = $applicantResponse->json('data')['id'];
                
                // Update applicant info
                $updateApplicantResponse = Http::withToken($this->apiToken)
                    ->put("{$this->apiUrl}/job-applicants/{$applicantId}", array_merge($validated, [
                        'client_identifier' => $clientIdentifier
                    ]));
                
                if (!$updateApplicantResponse->successful()) {
                    Log::warning('Failed to update applicant', [
                        'status' => $updateApplicantResponse->status(),
                        'response' => $updateApplicantResponse->body()
                    ]);
                    // Continue anyway - use existing applicant data
                }
            } else {
                // Create new applicant
                $createApplicantResponse = Http::withToken($this->apiToken)
                    ->post("{$this->apiUrl}/job-applicants", array_merge($validated, [
                        'client_identifier' => $clientIdentifier
                    ]));
                
                if (!$createApplicantResponse->successful()) {
                    Log::error('Failed to create applicant', [
                        'status' => $createApplicantResponse->status(),
                        'response' => $createApplicantResponse->body(),
                        'errors' => $createApplicantResponse->json('errors')
                    ]);
                    return back()->withErrors(['error' => 'Failed to create applicant profile. Please try again.'])->withInput();
                }
                
                $applicantId = $createApplicantResponse->json('data')['id'];
            }

            // Create application
            $applicationResponse = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/job-applications", [
                    'client_identifier' => $clientIdentifier,
                    'job_id' => $id,
                    'applicant_id' => $applicantId,
                    'cover_letter' => $validated['cover_letter'] ?? null,
                    'status' => 'pending',
                ]);

            if (!$applicationResponse->successful()) {
                Log::error('Failed to create application', [
                    'status' => $applicationResponse->status(),
                    'response' => $applicationResponse->body(),
                    'errors' => $applicationResponse->json('errors')
                ]);
                
                return back()->withErrors(['error' => 'Failed to submit application. Please try again.'])->withInput();
            }

            // Redirect to success page with client identifier as query parameter
            $successUrl = route('jobs.public.apply.success', $id);
            if ($clientIdentifier) {
                $successUrl .= '?client=' . urlencode($clientIdentifier);
            }
            
            return redirect($successUrl)->with('success', 'Your application has been submitted successfully!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors());
        } catch (\Exception $e) {
            Log::error('Exception in submitApplication', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while submitting your application. Please try again.']);
        }
    }

    /**
     * Application success page
     */
    public function applySuccess(Request $request, $id)
    {
        try {
            $clientIdentifierParam = $request->query('client');
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/jobs/{$id}");

            if (!$response->successful()) {
                abort(404, 'Job not found');
            }

            $job = $response->json('data');
            $clientIdentifier = $clientIdentifierParam ?? $job['client_identifier'] ?? null;

            return Inertia::render('Public/Jobs/ApplySuccess', [
                'job' => $job,
                'clientIdentifier' => $clientIdentifier,
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
            ]);
        } catch (\Exception $e) {
            abort(404, 'Job not found');
        }
    }
}

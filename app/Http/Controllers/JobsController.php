<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class JobsController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    /**
     * Main jobs dashboard - list job boards
     */
    public function index()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/job-boards", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                Log::error('API request failed', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                
                return back()->withErrors(['error' => 'Failed to fetch job boards']);
            }

            $jobBoards = $response->json('data', []);

            return Inertia::render('Jobs/Index', [
                'jobBoards' => $jobBoards
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in jobs index', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while fetching job boards']);
        }
    }

    /**
     * Show create job board form
     */
    public function createJobBoard()
    {
        return Inertia::render('Jobs/CreateJobBoard');
    }

    /**
     * Store job board
     */
    public function storeJobBoard(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'slug' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
            'settings' => 'nullable|array',
        ]);

        $clientIdentifier = auth()->user()->identifier;
        $validated['client_identifier'] = $clientIdentifier;

        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/job-boards", $validated);

            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Failed to create job board']);
            }

            return redirect()->route('jobs.index')->with('success', 'Job board created successfully');
        } catch (\Exception $e) {
            Log::error('Exception in storeJobBoard', [
                'message' => $e->getMessage()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while creating job board']);
        }
    }

    /**
     * View job board with jobs
     */
    public function jobBoard($id)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/job-boards/{$id}", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Failed to fetch job board']);
            }

            $jobBoard = $response->json('data');

            // Fetch jobs for this board
            $jobsResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/jobs", [
                    'client_identifier' => $clientIdentifier,
                    'job_board_id' => $id
                ]);

            $jobs = $jobsResponse->successful() ? $jobsResponse->json('data', []) : [];

            return Inertia::render('Jobs/JobBoard', [
                'jobBoard' => $jobBoard,
                'jobs' => $jobs
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in jobBoard', [
                'message' => $e->getMessage()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while fetching job board']);
        }
    }

    /**
     * Show edit job board form
     */
    public function editJobBoard($id)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/job-boards/{$id}", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Failed to fetch job board']);
            }

            $jobBoard = $response->json('data');

            return Inertia::render('Jobs/EditJobBoard', [
                'jobBoard' => $jobBoard
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in editJobBoard', [
                'message' => $e->getMessage()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while fetching job board']);
        }
    }

    /**
     * Update job board
     */
    public function updateJobBoard(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'slug' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
            'settings' => 'nullable|array',
        ]);

        try {
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/job-boards/{$id}", $validated);

            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Failed to update job board']);
            }

            return redirect()->route('jobs.index')->with('success', 'Job board updated successfully');
        } catch (\Exception $e) {
            Log::error('Exception in updateJobBoard', [
                'message' => $e->getMessage()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while updating job board']);
        }
    }

    /**
     * Delete job board
     */
    public function destroyJobBoard($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/job-boards/{$id}");

            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Failed to delete job board']);
            }

            return redirect()->route('jobs.index')->with('success', 'Job board deleted successfully');
        } catch (\Exception $e) {
            Log::error('Exception in destroyJobBoard', [
                'message' => $e->getMessage()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while deleting job board']);
        }
    }

    /**
     * Show create job form
     */
    public function createJob($jobBoardId)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            // Fetch job board
            $boardResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/job-boards/{$jobBoardId}", [
                    'client_identifier' => $clientIdentifier
                ]);

            $jobBoard = $boardResponse->successful() ? $boardResponse->json('data') : null;

            return Inertia::render('Jobs/CreateJob', [
                'jobBoard' => $jobBoard,
                'jobBoardId' => $jobBoardId
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in createJob', [
                'message' => $e->getMessage()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred']);
        }
    }

    /**
     * Store job
     */
    public function storeJob(Request $request)
    {
        $validated = $request->validate([
            'job_board_id' => 'required',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'requirements' => 'nullable|string',
            'salary_min' => 'nullable|numeric|min:0',
            'salary_max' => 'nullable|numeric|min:0|gte:salary_min',
            'salary_currency' => 'nullable|string|max:10',
            'location' => 'nullable|string|max:255',
            'employment_type' => 'nullable|string|max:255',
            'job_category' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:draft,published,closed',
            'application_deadline' => 'nullable|date',
            'application_url' => 'nullable|url',
            'application_email' => 'nullable|email',
            'is_featured' => 'nullable|boolean',
        ]);

        $clientIdentifier = auth()->user()->identifier;
        $validated['client_identifier'] = $clientIdentifier;

        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/jobs", $validated);

            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Failed to create job']);
            }

            return redirect()->route('jobs.jobBoard', $validated['job_board_id'])->with('success', 'Job created successfully');
        } catch (\Exception $e) {
            Log::error('Exception in storeJob', [
                'message' => $e->getMessage()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while creating job']);
        }
    }

    /**
     * Show edit job form
     */
    public function editJob($id)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/jobs/{$id}", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Failed to fetch job']);
            }

            $job = $response->json('data');

            return Inertia::render('Jobs/EditJob', [
                'job' => $job
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in editJob', [
                'message' => $e->getMessage()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while fetching job']);
        }
    }

    /**
     * Update job
     */
    public function updateJob(Request $request, $id)
    {
        $validated = $request->validate([
            'job_board_id' => 'sometimes|required',
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'requirements' => 'nullable|string',
            'salary_min' => 'nullable|numeric|min:0',
            'salary_max' => 'nullable|numeric|min:0|gte:salary_min',
            'salary_currency' => 'nullable|string|max:10',
            'location' => 'nullable|string|max:255',
            'employment_type' => 'nullable|string|max:255',
            'job_category' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:draft,published,closed',
            'application_deadline' => 'nullable|date',
            'application_url' => 'nullable|url',
            'application_email' => 'nullable|email',
            'is_featured' => 'nullable|boolean',
        ]);

        try {
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/jobs/{$id}", $validated);

            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Failed to update job']);
            }

            $job = $response->json('data');
            $jobBoardId = $job['job_board_id'] ?? $validated['job_board_id'] ?? null;

            return redirect()->route('jobs.jobBoard', $jobBoardId)->with('success', 'Job updated successfully');
        } catch (\Exception $e) {
            Log::error('Exception in updateJob', [
                'message' => $e->getMessage()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while updating job']);
        }
    }

    /**
     * Delete job
     */
    public function destroyJob($id)
    {
        try {
            // Get job to find job_board_id for redirect
            $clientIdentifier = auth()->user()->identifier;
            $jobResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/jobs/{$id}", [
                    'client_identifier' => $clientIdentifier
                ]);

            $jobBoardId = null;
            if ($jobResponse->successful()) {
                $job = $jobResponse->json('data');
                $jobBoardId = $job['job_board_id'] ?? null;
            }

            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/jobs/{$id}");

            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Failed to delete job']);
            }

            if ($jobBoardId) {
                return redirect()->route('jobs.jobBoard', $jobBoardId)->with('success', 'Job deleted successfully');
            }

            return redirect()->route('jobs.index')->with('success', 'Job deleted successfully');
        } catch (\Exception $e) {
            Log::error('Exception in destroyJob', [
                'message' => $e->getMessage()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while deleting job']);
        }
    }

    /**
     * Publish job
     */
    public function publishJob($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/jobs/{$id}/publish");

            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Failed to publish job']);
            }

            return back()->with('success', 'Job published successfully');
        } catch (\Exception $e) {
            Log::error('Exception in publishJob', [
                'message' => $e->getMessage()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while publishing job']);
        }
    }

    /**
     * Close job
     */
    public function closeJob($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/jobs/{$id}/close");

            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Failed to close job']);
            }

            return back()->with('success', 'Job closed successfully');
        } catch (\Exception $e) {
            Log::error('Exception in closeJob', [
                'message' => $e->getMessage()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while closing job']);
        }
    }

    /**
     * List all applicants
     */
    public function applicants()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/job-applicants", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                Log::error('API request failed in applicants', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                
                $applicants = [];
            } else {
                $applicants = $response->json('data', []);
            }

            return Inertia::render('Jobs/Applicants', [
                'applicants' => $applicants
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in applicants', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return Inertia::render('Jobs/Applicants', [
                'applicants' => []
            ]);
        }
    }

    /**
     * View applicant profile
     */
    public function applicant($id)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/job-applicants/{$id}", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Failed to fetch applicant']);
            }

            $applicant = $response->json('data');

            return Inertia::render('Jobs/Applicant', [
                'applicant' => $applicant
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in applicant', [
                'message' => $e->getMessage()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while fetching applicant']);
        }
    }

    /**
     * List all applications
     */
    public function applications()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/job-applications", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Failed to fetch applications']);
            }

            $applications = $response->json('data', []);

            return Inertia::render('Jobs/Applications', [
                'applications' => $applications
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in applications', [
                'message' => $e->getMessage()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while fetching applications']);
        }
    }

    /**
     * View application details
     */
    public function application($id)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/job-applications/{$id}", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Failed to fetch application']);
            }

            $application = $response->json('data');

            return Inertia::render('Jobs/Application', [
                'application' => $application
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in application', [
                'message' => $e->getMessage()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while fetching application']);
        }
    }

    /**
     * Update application
     */
    public function updateApplication(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'nullable|string|in:pending,reviewed,shortlisted,interviewed,accepted,rejected',
            'notes' => 'nullable|string',
            'interview_date' => 'nullable|date',
        ]);

        $clientIdentifier = auth()->user()->identifier;
        $validated['client_identifier'] = $clientIdentifier;

        try {
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/job-applications/{$id}", $validated);

            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Failed to update application']);
            }

            return back()->with('success', 'Application updated successfully');
        } catch (\Exception $e) {
            Log::error('Exception in updateApplication', [
                'message' => $e->getMessage()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while updating application']);
        }
    }

    /**
     * Update application status
     */
    public function updateApplicationStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,reviewed,shortlisted,interviewed,accepted,rejected',
        ]);

        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/job-applications/{$id}/update-status", $validated);

            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Failed to update application status']);
            }

            return back()->with('success', 'Application status updated successfully');
        } catch (\Exception $e) {
            Log::error('Exception in updateApplicationStatus', [
                'message' => $e->getMessage()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while updating application status']);
        }
    }
}

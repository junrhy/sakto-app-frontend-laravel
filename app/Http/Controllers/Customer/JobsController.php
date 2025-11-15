<?php

namespace App\Http\Controllers\Customer;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class JobsController extends CustomerProjectController
{
    /**
     * Display jobs for a specific project/owner pair.
     */
    public function index(Request $request, string $project, $ownerIdentifier): Response
    {
        $this->ensureCustomerProject($request, $project);

        try {
            $owner = $this->resolveOwner($project, $ownerIdentifier);
            $owner->app_currency = $this->decodeCurrency($owner->app_currency);

            $jobsResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/jobs", [
                    'client_identifier' => $owner->identifier,
                    'status' => 'published',
                    'per_page' => 100,
                ]);

            $jobs = [];
            if ($jobsResponse->successful()) {
                $body = $jobsResponse->json();
                $jobs = $body['data'] ?? $body ?? [];
            }

            return Inertia::render('Customer/Jobs/Index', [
                'community' => $owner,
                'project' => $project,
                'jobs' => $jobs,
            ]);
        } catch (ModelNotFoundException $e) {
            abort(404, 'Owner not found');
        } catch (\Throwable $th) {
            Log::error('Failed to load jobs', [
                'project' => $project,
                'owner' => $ownerIdentifier,
                'message' => $th->getMessage(),
            ]);

            abort(500, 'Failed to load jobs');
        }
    }
}


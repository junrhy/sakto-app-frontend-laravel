<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;

class QueueDisplayController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    public function index(Request $request)
    {
        try {
            // Get all queue types
            $queueTypesResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/queue-types", [
                    'client_identifier' => auth()->user()->identifier
                ]);

            if (!$queueTypesResponse->successful()) {
                throw new \Exception('API request failed: ' . $queueTypesResponse->body());
            }

            $queueTypes = $queueTypesResponse->json()['data'];

            // Get current status for all queue types
            $statusResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/queue-numbers/status/overview", [
                    'client_identifier' => auth()->user()->identifier
                ]);

            if (!$statusResponse->successful()) {
                throw new \Exception('API request failed: ' . $statusResponse->body());
            }

            $statusData = $statusResponse->json()['data'];

            return Inertia::render('Queue/Display', [
                'queueTypes' => $queueTypes,
                'statusData' => $statusData,
                'selectedQueueType' => $request->input('queue_type')
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function status(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/queue-numbers/status/overview", [
                    'client_identifier' => auth()->user()->identifier,
                    'queue_type_id' => $request->input('queue_type_id')
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function publicDisplay($identifier = null)
    {
        try {
            // For public display, we might not have authentication
            // This would need to be handled differently in a real implementation
            // For now, we'll use a default approach
            
            if (!$identifier) {
                return Inertia::render('Queue/PublicDisplay', [
                    'error' => 'Invalid display identifier'
                ]);
            }

            // In a real implementation, you might want to:
            // 1. Validate the identifier against a public display configuration
            // 2. Use a different API endpoint that doesn't require authentication
            // 3. Cache the data for better performance

            $queueTypesResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/queue-types");

            if (!$queueTypesResponse->successful()) {
                throw new \Exception('API request failed: ' . $queueTypesResponse->body());
            }

            $queueTypes = $queueTypesResponse->json()['data'];

            $statusResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/queue-numbers/status/overview");

            if (!$statusResponse->successful()) {
                throw new \Exception('API request failed: ' . $statusResponse->body());
            }

            $statusData = $statusResponse->json()['data'];

            return Inertia::render('Queue/PublicDisplay', [
                'queueTypes' => $queueTypes,
                'statusData' => $statusData,
                'identifier' => $identifier
            ]);
        } catch (\Exception $e) {
            return Inertia::render('Queue/PublicDisplay', [
                'error' => $e->getMessage()
            ]);
        }
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;

class QueueController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    public function index()
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/queue-types", [
                    'client_identifier' => auth()->user()->identifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $queueTypes = $response->json()['data'];

            // Get queue numbers for each type
            foreach ($queueTypes as &$queueType) {
                $numbersResponse = Http::withToken($this->apiToken)
                    ->get("{$this->apiUrl}/queue-numbers", [
                        'client_identifier' => auth()->user()->identifier,
                        'queue_type_id' => $queueType['id']
                    ]);

                if ($numbersResponse->successful()) {
                    $queueType['queue_numbers'] = $numbersResponse->json()['data'];
                } else {
                    $queueType['queue_numbers'] = [];
                }
            }

            return Inertia::render('Queue/Index', [
                'queueTypes' => $queueTypes
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function create()
    {
        return Inertia::render('Queue/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'prefix' => 'required|string|max:10'
        ]);

        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/queue-types", [
                    'name' => $request->name,
                    'description' => $request->description,
                    'prefix' => $request->prefix,
                    'client_identifier' => auth()->user()->identifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return redirect()->route('queue.index')
                ->with('message', 'Queue type created successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function show($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/queue-types/{$id}", [
                    'client_identifier' => auth()->user()->identifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $queueType = $response->json()['data'];

            return Inertia::render('Queue/Show', [
                'queueType' => $queueType
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function edit($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/queue-types/{$id}", [
                    'client_identifier' => auth()->user()->identifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $queueType = $response->json()['data'];

            return Inertia::render('Queue/Edit', [
                'queueType' => $queueType
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'prefix' => 'required|string|max:10',
            'is_active' => 'boolean'
        ]);

        try {
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/queue-types/{$id}", [
                    'name' => $request->name,
                    'description' => $request->description,
                    'prefix' => $request->prefix,
                    'is_active' => $request->boolean('is_active', true),
                    'client_identifier' => auth()->user()->identifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return redirect()->route('queue.index')
                ->with('message', 'Queue type updated successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/queue-types/{$id}", [
                    'client_identifier' => auth()->user()->identifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return redirect()->route('queue.index')
                ->with('message', 'Queue type deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function getQueueNumbers(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/queue-numbers", [
                    'client_identifier' => auth()->user()->identifier,
                    'queue_type_id' => $request->input('queue_type_id'),
                    'status' => $request->input('status')
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function createQueueNumber(Request $request)
    {
        $request->validate([
            'queue_type_id' => 'required|integer',
            'customer_name' => 'nullable|string|max:255',
            'customer_contact' => 'nullable|string|max:255'
        ]);

        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/queue-numbers", [
                    'queue_type_id' => $request->queue_type_id,
                    'customer_name' => $request->customer_name,
                    'customer_contact' => $request->customer_contact,
                    'client_identifier' => auth()->user()->identifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function callNext(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/queue-numbers/call-next", [
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

    public function startServing(Request $request, $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/queue-numbers/{$id}/start-serving", [
                    'client_identifier' => auth()->user()->identifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function complete(Request $request, $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/queue-numbers/{$id}/complete", [
                    'client_identifier' => auth()->user()->identifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function cancel(Request $request, $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/queue-numbers/{$id}/cancel", [
                    'client_identifier' => auth()->user()->identifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getStatus(Request $request)
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
}

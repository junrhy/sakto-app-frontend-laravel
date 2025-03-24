<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class EventController extends Controller
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
            $clientIdentifier = auth()->user()->identifier;
            
            Log::info('Making API request', [
                'url' => "{$this->apiUrl}/events",
                'client_identifier' => $clientIdentifier
            ]);

            // $response = Http::withToken($this->apiToken)    
            //     ->get("{$this->apiUrl}/events", [
            //         'client_identifier' => $clientIdentifier
            //     ]);
            
            // if (!$response->successful()) {
            //     Log::error('API request failed', [
            //         'status' => $response->status(),
            //         'body' => $response->body(),
            //         'url' => "{$this->apiUrl}/events"
            //     ]);
                
            //     return back()->withErrors(['error' => 'Failed to fetch events']);
            // }

            // $events = $response->json();
            $events = [];

            return Inertia::render('Events/Index', [
                'events' => $events
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in events index', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while fetching events']);
        }
    }

    public function settings()
    {
        return Inertia::render('Events/Settings');
    }

    public function getEvents()
    {
        $clientIdentifier = auth()->user()->identifier;
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/events", [
                'client_identifier' => $clientIdentifier
            ]);

        if (!$response->successful()) {
            return response()->json(['error' => 'Failed to fetch events'], $response->status());
        }

        return $response->json();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'location' => 'required|string',
            'max_participants' => 'nullable|integer|min:1',
            'registration_deadline' => 'nullable|date|before:start_date',
            'is_public' => 'boolean',
            'category' => 'required|string',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('events', 'public');
            $validated['image'] = Storage::disk('public')->url($path);
        }

        $clientIdentifier = auth()->user()->identifier;
        $validated['client_identifier'] = $clientIdentifier;

        $response = Http::withToken($this->apiToken)
            ->post("{$this->apiUrl}/events", $validated);

        if (!$response->successful()) {
            return response()->json(['error' => 'Failed to create event'], $response->status());
        }

        return $response->json();
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'location' => 'required|string',
            'max_participants' => 'nullable|integer|min:1',
            'registration_deadline' => 'nullable|date|before:start_date',
            'is_public' => 'boolean',
            'category' => 'required|string',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            // Get the old event data to delete previous image if it exists
            $getResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/events/{$id}");
            
            if ($getResponse->successful()) {
                $event = $getResponse->json();
                if (!empty($event['image'])) {
                    $path = str_replace(Storage::disk('public')->url(''), '', $event['image']);
                    if (Storage::disk('public')->exists($path)) {
                        Storage::disk('public')->delete($path);
                    }
                }
            }

            $path = $request->file('image')->store('events', 'public');
            $validated['image'] = Storage::disk('public')->url($path);
        }

        $response = Http::withToken($this->apiToken)
            ->put("{$this->apiUrl}/events/{$id}", $validated);

        if (!$response->successful()) {
            return response()->json(['error' => 'Failed to update event'], $response->status());
        }

        return $response->json();
    }

    public function destroy($id)
    {
        // Get event data first to get the image path
        $getResponse = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/events/{$id}");
        
        if ($getResponse->successful()) {
            $event = $getResponse->json();
            
            // Delete the image file if it exists
            if (!empty($event['image'])) {
                $path = str_replace(Storage::disk('public')->url(''), '', $event['image']);
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }
        }

        $response = Http::withToken($this->apiToken)
            ->delete("{$this->apiUrl}/events/{$id}");

        if (!$response->successful()) {
            return response()->json(['error' => 'Failed to delete event'], $response->status());
        }

        return response()->json(['message' => 'Event deleted successfully']);
    }

    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|integer'
        ]);

        $response = Http::withToken($this->apiToken)
            ->post("{$this->apiUrl}/events/bulk-delete", $validated);

        if (!$response->successful()) {
            return response()->json(['error' => 'Failed to delete events'], $response->status());
        }

        return response()->json(['message' => 'Events deleted successfully']);
    }

    public function registerParticipant(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'notes' => 'nullable|string'
        ]);

        $response = Http::withToken($this->apiToken)
            ->post("{$this->apiUrl}/events/{$id}/participants", $validated);

        if (!$response->successful()) {
            return response()->json(['error' => 'Failed to register participant'], $response->status());
        }

        return $response->json();
    }

    public function unregisterParticipant($id)
    {
        $response = Http::withToken($this->apiToken)
            ->delete("{$this->apiUrl}/events/participants/{$id}");

        if (!$response->successful()) {
            return response()->json(['error' => 'Failed to unregister participant'], $response->status());
        }

        return response()->json(['message' => 'Participant unregistered successfully']);
    }

    public function getParticipants($id)
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/events/{$id}/participants");

        if (!$response->successful()) {
            return response()->json(['error' => 'Failed to fetch participants'], $response->status());
        }

        return $response->json();
    }

    public function checkInParticipant(Request $request, $id)
    {
        $response = Http::withToken($this->apiToken)
            ->post("{$this->apiUrl}/events/participants/{$id}/check-in");

        if (!$response->successful()) {
            return response()->json(['error' => 'Failed to check in participant'], $response->status());
        }

        return $response->json();
    }

    public function getCalendarEvents()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            // $response = Http::withToken($this->apiToken)
            //     ->get("{$this->apiUrl}/events", [
            //         'client_identifier' => $clientIdentifier
            //     ]);

            // if (!$response->successful()) {
            //     return response()->json(['error' => 'Failed to fetch calendar events'], $response->status());
            // }

            // return $response->json();

            // Dummy data for testing
            return [
                [
                    'id' => 1,
                    'title' => 'Team Meeting',
                    'description' => 'Weekly team sync meeting',
                    'start_date' => now()->format('Y-m-d H:i:s'),
                    'end_date' => now()->addHours(1)->format('Y-m-d H:i:s'),
                    'location' => 'Conference Room A',
                    'max_participants' => 10,
                    'current_participants' => 5,
                    'registration_deadline' => now()->addDays(1)->format('Y-m-d H:i:s'),
                    'is_public' => false,
                    'category' => 'Meeting',
                    'image' => null
                ],
                [
                    'id' => 2,
                    'title' => 'Product Launch',
                    'description' => 'Launch of new product line',
                    'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
                    'end_date' => now()->addDays(5)->addHours(3)->format('Y-m-d H:i:s'),
                    'location' => 'Main Hall',
                    'max_participants' => 100,
                    'current_participants' => 75,
                    'registration_deadline' => now()->addDays(3)->format('Y-m-d H:i:s'),
                    'is_public' => true,
                    'category' => 'Launch',
                    'image' => null
                ],
                [
                    'id' => 3,
                    'title' => 'Training Session',
                    'description' => 'Employee training on new systems',
                    'start_date' => now()->addDays(10)->format('Y-m-d H:i:s'),
                    'end_date' => now()->addDays(10)->addHours(4)->format('Y-m-d H:i:s'),
                    'location' => 'Training Room',
                    'max_participants' => 20,
                    'current_participants' => 15,
                    'registration_deadline' => now()->addDays(8)->format('Y-m-d H:i:s'),
                    'is_public' => false,
                    'category' => 'Training',
                    'image' => null
                ]
            ];
        } catch (\Exception $e) {
            Log::error('Exception in getCalendarEvents', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => 'An error occurred while fetching calendar events'], 500);
        }
    }

    public function getUpcomingEvents()
    {
        $clientIdentifier = auth()->user()->identifier;
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/events/upcoming", [
                'client_identifier' => $clientIdentifier
            ]);

        if (!$response->successful()) {
            return response()->json(['error' => 'Failed to fetch upcoming events'], $response->status());
        }

        return $response->json();
    }

    public function getPastEvents()
    {
        $clientIdentifier = auth()->user()->identifier;
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/events/past", [
                'client_identifier' => $clientIdentifier
            ]);

        if (!$response->successful()) {
            return response()->json(['error' => 'Failed to fetch past events'], $response->status());
        }

        return $response->json();
    }

    public function exportEvents()
    {
        $clientIdentifier = auth()->user()->identifier;
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/events/export", [
                'client_identifier' => $clientIdentifier
            ]);

        if (!$response->successful()) {
            return response()->json(['error' => 'Failed to export events'], $response->status());
        }

        return $response->json();
    }

    public function importEvents(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls'
        ]);

        $clientIdentifier = auth()->user()->identifier;
        $response = Http::withToken($this->apiToken)
            ->attach('file', file_get_contents($request->file('file')), 'events.xlsx')
            ->post("{$this->apiUrl}/events/import", [
                'client_identifier' => $clientIdentifier
            ]);

        if (!$response->successful()) {
            return response()->json(['error' => 'Failed to import events'], $response->status());
        }

        return response()->json(['message' => 'Events imported successfully']);
    }

    public function calendar()
    {
        return Inertia::render('Events/Calendar');
    }

    public function create()
    {
        return Inertia::render('Events/Create');
    }

    public function edit($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/events/{$id}");

            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Failed to fetch event']);
            }

            $event = $response->json();

            return Inertia::render('Events/Form', [
                'event' => $event
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in events edit', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while fetching event']);
        }
    }
}

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

            $response = Http::withToken($this->apiToken)    
                ->get("{$this->apiUrl}/events", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                Log::error('API request failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'url' => "{$this->apiUrl}/events"
                ]);
                
                return back()->withErrors(['error' => 'Failed to fetch events']);
            }

            $events = $response->json();

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
            return back()->withErrors(['error' => 'Failed to create event']);
        }

        return Inertia::location('/events');
    }

    public function edit($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/events/{$id}");

            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Failed to fetch event']);
            }

            $responseData = $response->json();
            $event = $responseData['data'] ?? $responseData;

            return Inertia::render('Events/Form', [
                'event' => $event
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in event edit', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while fetching event']);
        }
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

        // Add client_identifier to the validated data
        $validated['client_identifier'] = auth()->user()->identifier;

        if ($request->hasFile('image')) {
            // Get the old event data to delete previous image if it exists
            $getResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/events/{$id}");
            
            if ($getResponse->successful()) {
                $event = $getResponse->json();
                // Extract data from response if it's wrapped in a data property
                $eventData = isset($event['data']) ? $event['data'] : $event;
                
                if (!empty($eventData['image'])) {
                    $path = str_replace(Storage::disk('public')->url(''), '', $eventData['image']);
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
            Log::error('Failed to update event', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return back()->withErrors(['error' => 'Failed to update event']);
        }

        return Inertia::location('/events');
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
            return back()->withErrors(['error' => 'Failed to delete event']);
        }

        return Inertia::location('/events');
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
            return back()->withErrors(['error' => 'Failed to delete events']);
        }

        return Inertia::location('/events');
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
            return back()->withErrors(['error' => 'Failed to register participant']);
        }

        return Inertia::location("/events/{$id}/participants");
    }

    public function unregisterParticipant($eventId, $participantId)
    {
        $response = Http::withToken($this->apiToken)
            ->delete("{$this->apiUrl}/events/{$eventId}/participants/{$participantId}");

        if (!$response->successful()) {
            return back()->withErrors(['error' => 'Failed to unregister participant']);
        }

        return Inertia::location("/events/{$eventId}/participants");
    }

    public function getParticipants($id)
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/events/{$id}/participants");

        if (!$response->successful()) {
            return back()->withErrors(['error' => 'Failed to fetch participants']);
        }

        $eventResponse = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/events/{$id}");

        if (!$eventResponse->successful()) {
            return back()->withErrors(['error' => 'Failed to fetch event']);
        }

        $participants = $response->json();
        // If the response is wrapped in a data property, extract it
        if (isset($participants['data'])) {
            $participants = $participants['data'];
        }

        $event = $eventResponse->json();
        // If the event response is wrapped in a data property, extract it
        if (isset($event['data'])) {
            $event = $event['data'];
        }

        return Inertia::render('Events/Participants', [
            'event' => $event,
            'participants' => $participants
        ]);
    }

    public function checkInParticipant($eventId, $participantId)
    {
        $response = Http::withToken($this->apiToken)
            ->post("{$this->apiUrl}/events/{$eventId}/participants/{$participantId}/check-in");

        if (!$response->successful()) {
            return back()->withErrors(['error' => 'Failed to check in participant']);
        }

        return Inertia::location("/events/{$eventId}/participants");
    }

    public function getCalendarEvents()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/events", [
                    'client_identifier' => $clientIdentifier
                ]);

            if (!$response->successful()) {
                return response()->json(['error' => 'Failed to fetch calendar events'], $response->status());
            }

            return $response->json();
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
        return Inertia::render('Events/Form');
    }

    /**
     * Show the public event registration form.
     */
    public function publicRegister($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/events/{$id}");
            
            if (!$response->successful()) {
                return redirect()->route('welcome')->withErrors(['error' => 'Event not found']);
            }

            $event = $response->json();
            
            // Fetch participants count
            $participantsResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/events/{$id}/participants");
                
            if ($participantsResponse->successful()) {
                $participants = $participantsResponse->json();
                // If the response is wrapped in a data property, extract it
                if (isset($participants['data'])) {
                    $participants = $participants['data'];
                }
                
                // Add participants count to the event data
                if (isset($event['data'])) {
                    $event['data']['current_participants'] = count($participants);
                } else {
                    $event['current_participants'] = count($participants);
                }
            }

            return Inertia::render('Events/PublicRegister', [
                'event' => $event
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in public event registration', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->route('welcome')->withErrors(['error' => 'An error occurred while loading the event']);
        }
    }

    /**
     * Handle public event registration.
     */
    public function publicRegisterParticipant(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'notes' => 'nullable|string'
        ]);

        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/events/{$id}/participants", $validated);

            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Failed to register for the event']);
            }

            return redirect()->route('events.public-register', $id)
                ->with('success', 'You have successfully registered for this event!');
        } catch (\Exception $e) {
            Log::error('Exception in public event registration', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while registering for the event']);
        }
    }

    /**
     * Show the public event details page.
     */
    public function publicShow($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/events/{$id}");
            
            if (!$response->successful()) {
                return redirect()->route('welcome')->withErrors(['error' => 'Event not found']);
            }

            $event = $response->json();
            
            // Fetch participants count
            $participantsResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/events/{$id}/participants");
                
            if ($participantsResponse->successful()) {
                $participants = $participantsResponse->json();
                // If the response is wrapped in a data property, extract it
                if (isset($participants['data'])) {
                    $participants = $participants['data'];
                }
                
                // Add participants count to the event data
                if (isset($event['data'])) {
                    $event['data']['current_participants'] = count($participants);
                } else {
                    $event['current_participants'] = count($participants);
                }
            }

            return Inertia::render('Events/PublicShow', [
                'event' => $event
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in public event show', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->route('welcome')->withErrors(['error' => 'An error occurred while loading the event']);
        }
    }
}

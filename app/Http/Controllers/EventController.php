<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use App\Services\LemonSqueezyPaymentService;
use Carbon\Carbon;

class EventController extends Controller
{
    protected $apiUrl, $apiToken;
    protected $lemonSqueezyService;

    public function __construct(LemonSqueezyPaymentService $lemonSqueezyService)
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
        $this->lemonSqueezyService = $lemonSqueezyService;
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
            'is_paid_event' => 'boolean',
            'event_price' => 'nullable|numeric|min:0|required_if:is_paid_event,true',
            'currency' => 'nullable|string|size:3',
            'payment_instructions' => 'nullable|string',
            'category' => 'required|string',
            'image' => 'nullable|image|max:2048',
            'status' => 'nullable|in:draft,published,archived',
            'lemon_squeezy_product_id' => 'nullable|string',
            'lemon_squeezy_variant_id' => 'nullable|string',
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
            'is_paid_event' => 'boolean',
            'event_price' => 'nullable|numeric|min:0|required_if:is_paid_event,true',
            'currency' => 'nullable|string|size:3',
            'payment_instructions' => 'nullable|string',
            'category' => 'required|string',
            'image' => 'nullable|image|max:2048',
            'status' => 'nullable|in:draft,published,archived',
            'lemon_squeezy_product_id' => 'nullable|string',
            'lemon_squeezy_variant_id' => 'nullable|string',
        ]);

        // Add client_identifier to the validated data
        $validated['client_identifier'] = auth()->user()->identifier;

        // Get the existing event data
        $getResponse = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/events/{$id}");
        
        $existingEvent = null;
        if ($getResponse->successful()) {
            $event = $getResponse->json();
            $existingEvent = isset($event['data']) ? $event['data'] : $event;
        }

        if ($request->hasFile('image')) {
            if ($existingEvent && !empty($existingEvent['image'])) {
                $path = str_replace(Storage::disk('public')->url(''), '', $existingEvent['image']);
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
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
            $eventData = isset($event['data']) ? $event['data'] : $event;
            
            // Delete the image file if it exists
            if (!empty($eventData['image'])) {
                $path = str_replace(Storage::disk('public')->url(''), '', $eventData['image']);
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
        // Check if this is a multiple registration
        if ($request->has('is_multiple') && $request->is_multiple) {
            $validated = $request->validate([
                'registrants' => 'required|array|min:1',
                'registrants.*.name' => 'required|string|max:255',
                'registrants.*.email' => 'required|email|max:255',
                'registrants.*.phone' => 'nullable|string|max:20',
                'notes' => 'nullable|string'
            ]);

            $successCount = 0;
            $errors = [];

            // Register each person individually
            foreach ($validated['registrants'] as $index => $registrant) {
                try {
                    $participantData = [
                        'name' => $registrant['name'],
                        'email' => $registrant['email'],
                        'phone' => $registrant['phone'] ?? null,
                        'notes' => $validated['notes'] ?? null
                    ];

                    $response = Http::withToken($this->apiToken)
                        ->post("{$this->apiUrl}/events/{$id}/participants", $participantData);

                    if ($response->successful()) {
                        $successCount++;
                    } else {
                        $errors[] = "Failed to register {$registrant['name']}: " . ($response->json()['message'] ?? 'Unknown error');
                    }
                } catch (\Exception $e) {
                    $errors[] = "Failed to register {$registrant['name']}: " . $e->getMessage();
                }
            }

            if ($successCount > 0) {
                $message = "Successfully registered {$successCount} person(s) for this event!";
                if (!empty($errors)) {
                    $message .= " Some registrations failed: " . implode(', ', $errors);
                }
                return redirect()->route('events.public-register', $id)
                    ->with('success', $message);
            } else {
                return back()->withErrors(['error' => 'Failed to register any participants: ' . implode(', ', $errors)]);
            }
        } else {
            // Single registration (existing logic)
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

    public function updatePaymentStatus(Request $request, $eventId, $participantId)
    {
        $validated = $request->validate([
            'payment_status' => 'required|in:pending,paid,cancelled',
            'amount_paid' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string|max:255',
            'transaction_id' => 'nullable|string|max:255',
            'payment_notes' => 'nullable|string',
        ]);

        $response = Http::withToken($this->apiToken)
            ->put("{$this->apiUrl}/events/{$eventId}/participants/{$participantId}/payment", $validated);

        if (!$response->successful()) {
            return back()->withErrors(['error' => 'Failed to update payment status']);
        }

        return Inertia::location("/events/{$eventId}/participants");
    }

    /**
     * Handle Lemon Squeezy checkout for event registration
     */
    public function checkout(Request $request, $id)
    {
        try {
            // Get event data
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/events/{$id}");
            
            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Event not found']);
            }

            $eventResponse = $response->json();
            $event = isset($eventResponse['data']) ? $eventResponse['data'] : $eventResponse;

            // Check if event has Lemon Squeezy integration
            if (empty($event['lemon_squeezy_variant_id'])) {
                return back()->withErrors(['error' => 'This event is not configured for online payment']);
            }

            // Validate registration data
            if ($request->has('is_multiple') && $request->is_multiple) {
                $validated = $request->validate([
                    'registrants' => 'required|array|min:1',
                    'registrants.*.name' => 'required|string|max:255',
                    'registrants.*.email' => 'required|email|max:255',
                    'registrants.*.phone' => 'nullable|string|max:20',
                    'notes' => 'nullable|string',
                    'payment_method' => 'required|string',
                ]);

                $registrantCount = count($validated['registrants']);
                $registrantNames = implode(', ', array_column($validated['registrants'], 'name'));
            } else {
                $validated = $request->validate([
                    'name' => 'required|string|max:255',
                    'email' => 'required|email|max:255',
                    'phone' => 'nullable|string|max:20',
                    'notes' => 'nullable|string',
                    'payment_method' => 'required|string',
                ]);

                $registrantCount = 1;
                $registrantNames = $validated['name'];
            }

            // Calculate total price
            $totalPrice = $event['event_price'] * $registrantCount;

            // Generate reference number
            $referenceNumber = $this->lemonSqueezyService->generateReferenceNumber();

            // Use authenticated user if available, otherwise use a default guest approach
            // For public events, we'll use the first authenticated user or create guest flow
            if (auth()->check()) {
                $user = auth()->user();
            } else {
                // For guest users, we need to use an existing user as Lemon Squeezy requires a billable user
                // Find a system user or admin user to facilitate guest checkouts
                $user = \App\Models\User::where('is_admin', true)->first();
                
                if (!$user) {
                    return back()->withErrors(['error' => 'System error: Unable to process payment. Please contact support.']);
                }
            }

            // Prepare checkout data
            $checkoutData = [
                'variant_id' => (string) $event['lemon_squeezy_variant_id'],
                'reference_number' => $referenceNumber,
                'plan_name' => $event['title'] . ' - Registration',
                'plan_description' => $event['description'] ?? 'Event registration fee',
                'user_name' => $request->has('is_multiple') ? $registrantNames : $validated['name'],
                'user_email' => $request->has('is_multiple') ? $validated['registrants'][0]['email'] : $validated['email'],
                'user_identifier' => auth()->check() ? auth()->user()->identifier : ('guest_' . time()),
                'auto_renew' => false,
                'success_url' => route('events.public-register', $id) . '?payment=success',
                'event_id' => $id,
                'registrant_count' => $registrantCount,
            ];

            // Create checkout
            $checkoutResult = $this->lemonSqueezyService->createCheckout($user, $checkoutData);

            if (!$checkoutResult['success']) {
                return back()->withErrors(['error' => $checkoutResult['message']]);
            }

            // Store registration data in session for later processing
            session([
                'event_registration_' . $referenceNumber => [
                    'event_id' => $id,
                    'registration_data' => $validated,
                    'is_multiple' => $request->has('is_multiple'),
                    'reference_number' => $referenceNumber,
                ],
            ]);

            Log::info('Event Lemon Squeezy checkout created', [
                'event_id' => $id,
                'checkout_url' => $checkoutResult['checkout_url'],
                'reference' => $referenceNumber,
            ]);

            // Use Inertia location for external redirect to Lemon Squeezy checkout
            return Inertia::location($checkoutResult['checkout_url']);

        } catch (\Exception $e) {
            Log::error('Event checkout failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return back()->withErrors(['error' => 'Failed to initiate payment. Please try again.']);
        }
    }
}

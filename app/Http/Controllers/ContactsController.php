<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ContactsController extends Controller
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
                'url' => "{$this->apiUrl}/contacts",
                'client_identifier' => $clientIdentifier
            ]);

            $response = Http::withToken($this->apiToken)    
                ->get("{$this->apiUrl}/contacts", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                Log::error('API request failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'url' => "{$this->apiUrl}/contacts"
                ]);
                
                return back()->withErrors(['error' => 'Failed to fetch contacts']);
            }

            $contacts = $response->json();

            return Inertia::render('Contacts/Index', [
                'contacts' => $contacts
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in contacts index', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while fetching contacts']);
        }
    }

    public function create()
    {
        $clientIdentifier = auth()->user()->identifier;
        return Inertia::render('Contacts/Create', [
            'client_identifier' => $clientIdentifier
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'gender' => 'required|string|in:male,female,other',
            'fathers_name' => 'nullable|string|max:255',
            'mothers_maiden_name' => 'nullable|string|max:255',
            'email' => 'required|email|max:255',
            'call_number' => 'nullable|string|max:20',
            'sms_number' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'facebook' => 'nullable|string|max:255|url',
            'instagram' => 'nullable|string|max:255|url',
            'twitter' => 'nullable|string|max:255|url',
            'linkedin' => 'nullable|string|max:255|url',
            'address' => 'nullable|string|max:500',
            'group' => 'nullable|array',
            'notes' => 'nullable|string',
            'id_picture' => 'nullable|image|max:2048', // max 2MB
        ]);

        if ($request->hasFile('id_picture')) {
            $path = $request->file('id_picture')->store('id_pictures', 'public');
            $validated['id_picture'] = Storage::disk('public')->url($path);
        }

        $clientIdentifier = auth()->user()->identifier;
        $validated['client_identifier'] = $clientIdentifier;
        $response = Http::withToken($this->apiToken)
            ->post("{$this->apiUrl}/contacts", $validated);

        if (!$response->successful()) {
            return back()->withErrors(['error' => 'Failed to create contact']);
        }

        return redirect()->route('contacts.index')
            ->with('message', 'Contact created successfully');
    }

    public function show($id)
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/contacts/{$id}");
        
        if (!$response->successful()) {
            return redirect()->route('contacts.index')
                ->with('error', 'Contact not found');
        }

        return Inertia::render('Contacts/Show', [
            'contact' => $response->json()
        ]);
    }

    public function edit($id)
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/contacts/{$id}");
        
        if (!$response->successful()) {
            return redirect()->route('contacts.index')
                ->with('error', 'Contact not found');
        }

        return Inertia::render('Contacts/Edit', [
            'contact' => $response->json()
        ]);
    }

    public function update(Request $request, $id)
    {
        $rules = [
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'gender' => 'required|string|in:male,female,other',
            'fathers_name' => 'nullable|string|max:255',
            'mothers_maiden_name' => 'nullable|string|max:255',
            'email' => 'required|email|max:255',
            'call_number' => 'nullable|string|max:20',
            'sms_number' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'facebook' => 'nullable|string|max:255|url',
            'instagram' => 'nullable|string|max:255|url',
            'twitter' => 'nullable|string|max:255|url',
            'linkedin' => 'nullable|string|max:255|url',
            'address' => 'nullable|string|max:500',
            'group' => 'nullable|array',
            'notes' => 'nullable|string',
            'id_numbers' => 'nullable|array',
            'id_numbers.*.type' => 'required_with:id_numbers|string|max:255',
            'id_numbers.*.number' => 'required_with:id_numbers|string|max:255',
            'id_numbers.*.notes' => 'nullable|string|max:500',
        ];

        // Only validate id_picture as an image if a new file is being uploaded
        if ($request->hasFile('id_picture')) {
            $rules['id_picture'] = 'required|image|max:2048'; // max 2MB
        } else {
            $rules['id_picture'] = 'nullable|string'; // Allow existing URL to pass through
        }

        $validated = $request->validate($rules);

        if ($request->hasFile('id_picture')) {
            // Get the old contact data to delete previous image if it exists
            $getResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/contacts/{$id}");
            
            if ($getResponse->successful()) {
                $contact = $getResponse->json();
                if (!empty($contact['id_picture'])) {
                    $path = str_replace(Storage::disk('public')->url(''), '', $contact['id_picture']);
                    if (Storage::disk('public')->exists($path)) {
                        Storage::disk('public')->delete($path);
                    }
                }
            }

            $path = $request->file('id_picture')->store('id_pictures', 'public');
            $validated['id_picture'] = Storage::disk('public')->url($path);
        }

        // Convert id_numbers to JSON string if it's an array
        if (isset($validated['id_numbers']) && is_array($validated['id_numbers'])) {
            $validated['id_numbers'] = json_encode($validated['id_numbers']);
        }

        $response = Http::withToken($this->apiToken)
            ->put("{$this->apiUrl}/contacts/{$id}", $validated);

        if (!$response->successful()) {
            Log::error('Failed to update contact', [
                'response' => $response->json(),
                'status' => $response->status()
            ]);
            return back()->withErrors(['error' => 'Failed to update contact: ' . ($response->json()['message'] ?? 'Unknown error')]);
        }

        return redirect()->route('contacts.index')
            ->with('message', 'Contact updated successfully');
    }

    public function destroy($id)
    {
        // Get contact data first to get the id_picture path
        $getResponse = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/contacts/{$id}");
        
        if ($getResponse->successful()) {
            $contact = $getResponse->json();
            
            // Delete the id_picture file if it exists
            if (!empty($contact['id_picture'])) {
                $path = str_replace(Storage::disk('public')->url(''), '', $contact['id_picture']);
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }
        }

        $response = Http::withToken($this->apiToken)
            ->delete("{$this->apiUrl}/contacts/{$id}");

        if (!$response->successful()) {
            return back()->withErrors(['error' => 'Failed to delete contact']);
        }

        return redirect()->route('contacts.index')
            ->with('message', 'Contact deleted successfully');
    }

    public function selfRegistration()
    {
        return Inertia::render('Contacts/SelfRegistration');
    }

    public function publicProfile($id)
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/contacts/{$id}");
        
        if (!$response->successful()) {
            return redirect()->route('contacts.self-registration')
                ->with('error', 'Contact not found');
        }

        return Inertia::render('Contacts/PublicProfile', [
            'contact' => $response->json()
        ]);
    }

    public function storeSelf(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'gender' => 'required|string|in:male,female,other',
            'fathers_name' => 'nullable|string|max:255',
            'mothers_maiden_name' => 'nullable|string|max:255',
            'email' => 'required|email|max:255',
            'call_number' => 'nullable|string|max:20',
            'sms_number' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'facebook' => 'nullable|string|max:255|url',
            'instagram' => 'nullable|string|max:255|url',
            'twitter' => 'nullable|string|max:255|url',
            'linkedin' => 'nullable|string|max:255|url',
            'address' => 'nullable|string|max:500',
            'group' => 'nullable|array',
            'notes' => 'nullable|string',
            'id_picture' => 'nullable|image|max:2048', // max 2MB
            'id_numbers' => 'nullable|array',
            'id_numbers.*.type' => 'required|string|max:255',
            'id_numbers.*.number' => 'required|string|max:255',
            'id_numbers.*.notes' => 'nullable|string|max:500',
            'client_identifier' => 'required|string|max:255',
        ]);

        if ($request->hasFile('id_picture')) {
            $path = $request->file('id_picture')->store('id_pictures', 'public');
            $validated['id_picture'] = Storage::disk('public')->url($path);
        }

        $response = Http::withToken($this->apiToken)
            ->post("{$this->apiUrl}/contacts", $validated);

        if (!$response->successful()) {
            return back()->withErrors(['error' => 'Failed to submit registration']);
        }

        return redirect()->route('contacts.self-registration')
            ->with('message', 'Registration submitted successfully! We will review your information.');
    }

    public function settings()
    {
        try {
            // $clientIdentifier = auth()->user()->identifier;
            // $response = Http::withToken($this->apiToken)
            //     ->get("{$this->apiUrl}/contacts/settings", [
            //         'client_identifier' => $clientIdentifier
            //     ]);

            // if (!$response->successful()) {
            //     throw new \Exception('Failed to fetch contacts settings');
            // }

            // Dummy data
            $dummySettings = [
                'data' => [
                    'default_view' => 'list',
                    'items_per_page' => 10,
                    'show_archived' => false,
                    'contact_categories' => ['Family', 'Friends', 'Business', 'Other'],
                    'required_fields' => ['name', 'phone', 'email']
                ]
            ];

            return Inertia::render('Contacts/Settings', [
                'settings' => $dummySettings['data'],
                'auth' => [
                    'user' => auth()->user()
                ]
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load settings');
        }
    }

    public function getContacts()
    {
        try {
            Log::info('getContacts method called', [
                'user' => auth()->user(),
                'is_authenticated' => auth()->check(),
                'request_url' => request()->url(),
                'request_method' => request()->method(),
                'request_headers' => request()->headers->all()
            ]);

            $clientIdentifier = auth()->user()->identifier;
            
            Log::info('Starting getContacts request', [
                'url' => "{$this->apiUrl}/contacts",
                'client_identifier' => $clientIdentifier,
                'api_token' => substr($this->apiToken, 0, 10) . '...' // Log first 10 chars of token for debugging
            ]);

            $response = Http::withToken($this->apiToken)    
                ->get("{$this->apiUrl}/contacts", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            Log::info('API Response received', [
                'status' => $response->status(),
                'headers' => $response->headers(),
                'body' => $response->body()
            ]);

            if (!$response->successful()) {
                Log::error('Failed to fetch contacts', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'url' => "{$this->apiUrl}/contacts",
                    'headers' => $response->headers()
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch contacts: ' . $response->body()
                ], 500);
            }

            $contacts = $response->json();

            // Transform the contacts data to include only necessary fields
            $transformedContacts = collect($contacts)->map(function ($contact) {
                return [
                    'id' => $contact['id'],
                    'first_name' => $contact['first_name'],
                    'middle_name' => $contact['middle_name'],
                    'last_name' => $contact['last_name'],
                    'email' => $contact['email'],
                    'call_number' => $contact['call_number'],
                    'sms_number' => $contact['sms_number'],
                    'whatsapp' => $contact['whatsapp'],
                    'address' => $contact['address'],
                    'gender' => $contact['gender'],
                    'fathers_name' => $contact['fathers_name'],
                    'mothers_maiden_name' => $contact['mothers_maiden_name'],
                    'facebook' => $contact['facebook'],
                    'instagram' => $contact['instagram'],
                    'twitter' => $contact['twitter'],
                    'linkedin' => $contact['linkedin'],
                    'group' => $contact['group'],
                    'notes' => $contact['notes']
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $transformedContacts
            ]);

        } catch (\Exception $e) {
            Log::error('Exception in getContacts', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching contacts'
            ], 500);
        }
    }
}

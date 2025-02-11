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
        $this->apiUrl = env('API_URL');
        $this->apiToken = env('API_TOKEN');
    }

    public function index()
    {
        $clientIdentifier = auth()->user()->identifier;
        $response = Http::withToken($this->apiToken)    
            ->get("{$this->apiUrl}/contacts", [
                'client_identifier' => $clientIdentifier
            ]);
        
        $contacts = $response->json();

        return Inertia::render('Contacts/Index', [
            'contacts' => $contacts
        ]);
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
}

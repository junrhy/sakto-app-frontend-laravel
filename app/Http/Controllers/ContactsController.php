<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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
        // $response = Http::withToken($this->apiToken)
        //     ->get("{$this->apiUrl}/contacts");
        
        // $contacts = $response->json();

        $sampleContact = [
            'id' => 1,
            'first_name' => 'John',
            'middle_name' => 'Robert',
            'last_name' => 'Doe',
            'gender' => 'male',
            'fathers_name' => 'James William Doe',
            'mothers_maiden_name' => 'Mary Elizabeth Smith',
            'email' => 'john.doe@example.com',
            'call_number' => '+1234567890',
            'sms_number' => '+1234567891',
            'whatsapp' => '+1234567892',
            'facebook' => 'https://facebook.com/johndoe',
            'instagram' => 'https://instagram.com/johndoe',
            'twitter' => 'https://twitter.com/johndoe',
            'linkedin' => 'https://linkedin.com/in/johndoe',
            'address' => '123 Main St, City, Country',
            'notes' => 'Sample contact for testing',
            'id_picture' => 'https://ui-avatars.com/api/?name=John+Doe&size=200',
            'created_at' => now()->toISOString(),
            'updated_at' => now()->toISOString(),
        ];

        return Inertia::render('Contacts/Index', [
            'contacts' => [$sampleContact]
        ]);
    }

    public function create()
    {
        return Inertia::render('Contacts/Create');
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
            $validated['id_picture'] = asset('storage/' . $path);
        }

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
            $validated['id_picture'] = asset('storage/' . $path);
        }

        $response = Http::withToken($this->apiToken)
            ->put("{$this->apiUrl}/contacts/{$id}", $validated);

        if (!$response->successful()) {
            return back()->withErrors(['error' => 'Failed to update contact']);
        }

        return redirect()->route('contacts.index')
            ->with('message', 'Contact updated successfully');
    }

    public function destroy($id)
    {
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
        ]);

        if ($request->hasFile('id_picture')) {
            $path = $request->file('id_picture')->store('id_pictures', 'public');
            $validated['id_picture'] = asset('storage/' . $path);
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

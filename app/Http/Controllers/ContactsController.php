<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use App\Mail\WalletTransferNotification;
use App\Models\User;

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

            $responseData = $response->json();
            $contacts = $responseData['data'] ?? $responseData; // Handle both new and old response formats
            
            // Ensure wallet_balance is properly formatted as numbers
            if (is_array($contacts)) {
                foreach ($contacts as &$contact) {
                    if (isset($contact['wallet_balance'])) {
                        $contact['wallet_balance'] = is_numeric($contact['wallet_balance']) ? (float)$contact['wallet_balance'] : 0;
                    } else {
                        $contact['wallet_balance'] = 0;
                    }
                }
            }
            
            $appCurrency = json_decode(auth()->user()->app_currency);

            return Inertia::render('Contacts/Index', [
                'contacts' => $contacts,
                'appCurrency' => $appCurrency
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
            'date_of_birth' => 'nullable|string|max:255',
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

        // Custom validation to check if email and SMS number don't already exist
        $clientIdentifier = auth()->user()->identifier;
        
        // Get all contacts for the current client
        $contactsResponse = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/contacts", [
                'client_identifier' => $clientIdentifier
            ]);

        if ($contactsResponse->successful()) {
            $contacts = $contactsResponse->json()['data'] ?? $contactsResponse->json();
            
            // Check if email already exists for another contact
            if (!empty($validated['email'])) {
                $emailExists = collect($contacts)->where('email', $validated['email'])->first();
                if ($emailExists) {
                    return back()->withErrors(['email' => 'This email address is already registered with another contact.']);
                }
            }
            
            // Check if SMS number already exists for another contact
            if (!empty($validated['sms_number'])) {
                $smsExists = collect($contacts)->where('sms_number', $validated['sms_number'])->first();
                if ($smsExists) {
                    return back()->withErrors(['sms_number' => 'This SMS number is already registered with another contact.']);
                }
            }
        }

        if ($request->hasFile('id_picture')) {
            $path = $request->file('id_picture')->store('id_pictures', 'public');
            $validated['id_picture'] = Storage::disk('public')->url($path);
        }

        $validated['client_identifier'] = $clientIdentifier;
        $response = Http::withToken($this->apiToken)
            ->post("{$this->apiUrl}/contacts", $validated);

        if (!$response->successful()) {
            return back()->withErrors(['error' => 'Failed to create contact']);
        }

        return redirect()->route('contacts.index')
            ->with('message', 'Contact created successfully');
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
            'date_of_birth' => 'nullable|string|max:255',
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

        // Custom validation to check if email and SMS number don't already exist
        $clientIdentifier = auth()->user()->identifier;
        
        // Get all contacts for the current client
        $contactsResponse = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/contacts", [
                'client_identifier' => $clientIdentifier
            ]);

        if ($contactsResponse->successful()) {
            $contacts = $contactsResponse->json()['data'] ?? $contactsResponse->json();
            
            // Check if email already exists for another contact
            if (!empty($validated['email'])) {
                $emailExists = collect($contacts)->where('id', '!=', $id)->where('email', $validated['email'])->first();
                if ($emailExists) {
                    return back()->withErrors(['email' => 'This email address is already registered with another contact.']);
                }
            }
            
            // Check if SMS number already exists for another contact
            if (!empty($validated['sms_number'])) {
                $smsExists = collect($contacts)->where('id', '!=', $id)->where('sms_number', $validated['sms_number'])->first();
                if ($smsExists) {
                    return back()->withErrors(['sms_number' => 'This SMS number is already registered with another contact.']);
                }
            }
        }

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

    public function selfRegistration(Request $request)
    {
        $clientIdentifier = $request->query('client_identifier');
        
        if (!$clientIdentifier) {
            return redirect('/')->with('error', 'Client identifier is required');
        }

        // Find the user by identifier
        $user = User::where('identifier', $clientIdentifier)->first();
        
        if (!$user) {
            return redirect('/')->with('error', 'Invalid client identifier');
        }

        return Inertia::render('Contacts/SelfRegistration', [
            'client_identifier' => $clientIdentifier,
            'auth' => [
                'user' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'identifier' => $user->identifier
                ]
            ]
        ]);
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

        // Custom validation to check if email and SMS number don't already exist
        $clientIdentifier = $validated['client_identifier'];
        
        // Get all contacts for the current client
        $contactsResponse = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/contacts", [
                'client_identifier' => $clientIdentifier
            ]);

        if ($contactsResponse->successful()) {
            $contacts = $contactsResponse->json()['data'] ?? $contactsResponse->json();
            
            // Check if email already exists for another contact
            if (!empty($validated['email'])) {
                $emailExists = collect($contacts)->where('email', $validated['email'])->first();
                if ($emailExists) {
                    return back()->withErrors(['email' => 'This email address is already registered with another contact.']);
                }
            }
            
            // Check if SMS number already exists for another contact
            if (!empty($validated['sms_number'])) {
                $smsExists = collect($contacts)->where('sms_number', $validated['sms_number'])->first();
                if ($smsExists) {
                    return back()->withErrors(['sms_number' => 'This SMS number is already registered with another contact.']);
                }
            }
        }

        if ($request->hasFile('id_picture')) {
            $path = $request->file('id_picture')->store('id_pictures', 'public');
            $validated['id_picture'] = Storage::disk('public')->url($path);
        }

        $response = Http::withToken($this->apiToken)
            ->post("{$this->apiUrl}/contacts", $validated);

        if (!$response->successful()) {
            return back()->withErrors(['error' => 'Failed to submit registration']);
        }

        return redirect()->route('contacts.self-registration', ['client_identifier' => $validated['client_identifier']])
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

            $responseData = $response->json();
            $contacts = $responseData['data'] ?? $responseData; // Handle both new and old response formats

            // Transform the contacts data to include only necessary fields
            $transformedContacts = collect($contacts)->map(function ($contact) {
                return [
                    'id' => $contact['id'],
                    'first_name' => $contact['first_name'],
                    'middle_name' => $contact['middle_name'],
                    'last_name' => $contact['last_name'],
                    'date_of_birth' => $contact['date_of_birth'],
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
                    'notes' => $contact['notes'],
                    'wallet_balance' => is_numeric($contact['wallet_balance'] ?? 0) ? (float)($contact['wallet_balance'] ?? 0) : 0,
                    'wallet_currency' => $contact['wallet_currency'] ?? 'PHP',
                    'wallet_status' => $contact['wallet_status'] ?? 'active'
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

    public function destroyBulk(Request $request)
    {
        $ids = $request->input('ids', []);
        if (empty($ids)) {
            return back()->withErrors(['error' => 'No contacts selected for deletion.']);
        }
        $response = \Http::withToken($this->apiToken)
            ->post("{$this->apiUrl}/contacts/bulk-delete", [ 'ids' => $ids ]);
        if (!$response->successful()) {
            return back()->withErrors(['error' => 'Failed to bulk delete contacts.']);
        }
        return redirect()->route('contacts.index')->with('message', 'Contacts deleted successfully.');
    }

    public function getWalletBalance($contactId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/contact-wallets/{$contactId}/balance");

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch wallet balance'
                ], $response->status());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Exception in getWalletBalance', [
                'message' => $e->getMessage(),
                'contact_id' => $contactId
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching wallet balance'
            ], 500);
        }
    }

    public function addFunds(Request $request, $contactId)
    {
        try {
            $validated = $request->validate([
                'amount' => 'required|numeric|min:0.01',
                'description' => 'nullable|string|max:255',
                'reference' => 'nullable|string|max:255',
            ]);

            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/contact-wallets/{$contactId}/add-funds", $validated);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to add funds: ' . ($response->json()['message'] ?? 'Unknown error')
                ], $response->status());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Exception in addFunds', [
                'message' => $e->getMessage(),
                'contact_id' => $contactId
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while adding funds'
            ], 500);
        }
    }

    public function deductFunds(Request $request, $contactId)
    {
        try {
            $validated = $request->validate([
                'amount' => 'required|numeric|min:0.01',
                'description' => 'nullable|string|max:255',
                'reference' => 'nullable|string|max:255',
            ]);

            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/contact-wallets/{$contactId}/deduct-funds", $validated);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to deduct funds: ' . ($response->json()['message'] ?? 'Unknown error')
                ], $response->status());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Exception in deductFunds', [
                'message' => $e->getMessage(),
                'contact_id' => $contactId
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while deducting funds'
            ], 500);
        }
    }

    public function getTransactionHistory($contactId, Request $request)
    {
        try {
            $params = [];
            
            // Add date parameter if provided
            if ($request->has('date')) {
                $params['date'] = $request->get('date');
            }
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/contact-wallets/{$contactId}/transactions", $params);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch transaction history'
                ], $response->status());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Exception in getTransactionHistory', [
                'message' => $e->getMessage(),
                'contact_id' => $contactId
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching transaction history'
            ], 500);
        }
    }

    public function getClientWallets(Request $request)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/contact-wallets/client-summary", [
                    'client_identifier' => $clientIdentifier
                ]);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch client wallets'
                ], $response->status());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Exception in getClientWallets', [
                'message' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching client wallets'
            ], 500);
        }
    }

    public function transferFunds(Request $request)
    {
        try {
            $validated = $request->validate([
                'from_contact_id' => 'required|numeric|min:1',
                'to_contact_id' => 'required|numeric|min:1',
                'amount' => 'required|numeric|min:0.01',
                'description' => 'nullable|string|max:255',
                'reference' => 'nullable|string|max:255',
            ]);

            if (empty($validated['reference'])) {
                $validated['reference'] = $this->generateReference();
            }

            // In transferFunds, update the description format
            // Get recipient contact details for email and description
            try {
                $recipientResponse = Http::withToken($this->apiToken)
                    ->get("{$this->apiUrl}/contacts/{$validated['to_contact_id']}");
                
                if ($recipientResponse->successful()) {
                    $recipientData = $recipientResponse->json();
                    $recipientEmail = $recipientData['email'] ?? null;
                    $recipientName = ($recipientData['first_name'] ?? '') . ' ' . ($recipientData['last_name'] ?? '');
                    $recipientNumber = $recipientData['sms_number'] ?? 'Unknown';
                    
                    // Get sender contact details
                    $senderResponse = Http::withToken($this->apiToken)
                        ->get("{$this->apiUrl}/contacts/{$validated['from_contact_id']}");
                    
                    if ($senderResponse->successful()) {
                        $senderData = $senderResponse->json();
                        $senderName = ($senderData['first_name'] ?? '') . ' ' . ($senderData['last_name'] ?? '');
                        $senderNumber = $senderData['sms_number'] ?? 'Unknown';
                        
                        // Update the transfer request with contact number in description
                        $transferRequest = [
                            'from_contact_id' => $validated['from_contact_id'],
                            'to_contact_id' => $validated['to_contact_id'],
                            'amount' => $validated['amount'],
                            'description' => $validated['description'] ?? "Transfer to {$recipientNumber}",
                            'reference' => $validated['reference'],
                        ];
                        
                        $response = Http::withToken($this->apiToken)
                            ->post("{$this->apiUrl}/contact-wallets/transfer", $transferRequest);
                        
                        if ($response->successful()) {
                            $responseData = $response->json();
                            
                            // Send email notification to recipient
                            if ($recipientEmail) {
                                Mail::to($recipientEmail)->send(new WalletTransferNotification(
                                    $responseData,
                                    trim($recipientName),
                                    trim($senderName),
                                    $validated['amount'],
                                    'PHP', // Default currency
                                    $validated['reference'],
                                    $validated['description'] ?? "Transfer from {$senderNumber}"
                                ));
                            }
                            
                            return response()->json([
                                'success' => true,
                                'message' => 'Transfer completed successfully',
                                'data' => [
                                    'reference' => $validated['reference'],
                                ]
                            ]);
                        }
                    }
                }
            } catch (\Exception $e) {
                Log::warning('Failed to send wallet transfer email notification', [
                    'error' => $e->getMessage(),
                    'recipient_id' => $validated['to_contact_id'],
                    'sender_id' => $validated['from_contact_id']
                ]);
                // Don't fail the transfer if email fails
            }
            
            // Fallback if contact details can't be fetched
            // Ensure we have a proper description even in fallback
            $fallbackData = $validated;
            if (empty($fallbackData['description'])) {
                // Try to get recipient SMS number for fallback description
                try {
                    $recipientResponse = Http::withToken($this->apiToken)
                        ->get("{$this->apiUrl}/contacts/{$validated['to_contact_id']}");
                    
                    if ($recipientResponse->successful()) {
                        $recipientData = $recipientResponse->json();
                        $recipientNumber = $recipientData['sms_number'] ?? 'Unknown';
                        $fallbackData['description'] = "Transfer to {$recipientNumber}";
                    } else {
                        $fallbackData['description'] = 'Transfer to recipient';
                    }
                } catch (\Exception $e) {
                    $fallbackData['description'] = 'Transfer to recipient';
                }
            }
            
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/contact-wallets/transfer", $fallbackData);

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Transfer completed successfully',
                    'data' => [
                        'reference' => $validated['reference'],
                    ]
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Exception in transferFunds', [
                'message' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while transferring funds'
            ], 500);
        }
    }

    // Public wallet methods that don't require authentication
    public function getPublicWalletBalance($contactId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/contact-wallets/{$contactId}/balance");

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch wallet balance'
                ], $response->status());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Exception in getPublicWalletBalance', [
                'message' => $e->getMessage(),
                'contact_id' => $contactId
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching wallet balance'
            ], 500);
        }
    }

    public function getPublicTransactionHistory($contactId, Request $request)
    {
        try {
            $params = [];
            
            // Add date parameter if provided
            if ($request->has('date')) {
                $params['date'] = $request->get('date');
            }
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/contact-wallets/{$contactId}/transactions", $params);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch transaction history'
                ], $response->status());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Exception in getPublicTransactionHistory', [
                'message' => $e->getMessage(),
                'contact_id' => $contactId
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching transaction history'
            ], 500);
        }
    }

    public function publicTransferFunds(Request $request, $contactId)
    {
        try {
            $validated = $request->validate([
                'to_contact_id' => 'required|numeric|min:1',
                'amount' => 'required|numeric|min:0.01',
                'description' => 'nullable|string|max:255',
                'reference' => 'nullable|string|max:255',
            ]);

            if (empty($validated['reference'])) {
                $validated['reference'] = $this->generateReference();
            }

            // Set the from_contact_id to the current contact
            $validated['from_contact_id'] = $contactId;

            // Get recipient contact details for email and description
            try {
                $recipientResponse = Http::withToken($this->apiToken)
                    ->get("{$this->apiUrl}/contacts/{$validated['to_contact_id']}");
                
                if ($recipientResponse->successful()) {
                    $recipientData = $recipientResponse->json();
                    $recipientEmail = $recipientData['email'] ?? null;
                    $recipientName = ($recipientData['first_name'] ?? '') . ' ' . ($recipientData['last_name'] ?? '');
                    $recipientNumber = $recipientData['sms_number'] ?? 'Unknown';
                    
                    // Get sender contact details
                    $senderResponse = Http::withToken($this->apiToken)
                        ->get("{$this->apiUrl}/contacts/{$contactId}");
                    
                    if ($senderResponse->successful()) {
                        $senderData = $senderResponse->json();
                        $senderName = ($senderData['first_name'] ?? '') . ' ' . ($senderData['last_name'] ?? '');
                        $senderNumber = $senderData['sms_number'] ?? 'Unknown';
                        
                        // Update the transfer request with contact number in description
                        $transferRequest = [
                            'to_contact_id' => $validated['to_contact_id'],
                            'amount' => $validated['amount'],
                            'description' => $validated['description'] ?? "Transfer to {$recipientNumber}",
                            'reference' => $validated['reference'],
                        ];
                        
                        $response = Http::withToken($this->apiToken)
                            ->post("{$this->apiUrl}/contact-wallets/transfer", $transferRequest);
                        
                        if ($response->successful()) {
                            $responseData = $response->json();
                            
                            // Send email notification to recipient
                            if ($recipientEmail) {
                                Mail::to($recipientEmail)->send(new WalletTransferNotification(
                                    $responseData,
                                    trim($recipientName),
                                    trim($senderName),
                                    $validated['amount'],
                                    'PHP', // Default currency
                                    $validated['reference'],
                                    $validated['description'] ?? "Transfer from {$senderNumber}"
                                ));
                            }
                            
                            return response()->json([
                                'success' => true,
                                'message' => 'Transfer completed successfully',
                                'data' => [
                                    'reference' => $validated['reference'],
                                ]
                            ]);
                        }
                    }
                }
            } catch (\Exception $e) {
                Log::warning('Failed to send wallet transfer email notification', [
                    'error' => $e->getMessage(),
                    'recipient_id' => $validated['to_contact_id'],
                    'sender_id' => $contactId
                ]);
                // Don't fail the transfer if email fails
            }
            
            // Fallback if contact details can't be fetched
            // Ensure we have a proper description even in fallback
            $fallbackData = $validated;
            if (empty($fallbackData['description'])) {
                // Try to get recipient SMS number for fallback description
                try {
                    $recipientResponse = Http::withToken($this->apiToken)
                        ->get("{$this->apiUrl}/contacts/{$validated['to_contact_id']}");
                    
                    if ($recipientResponse->successful()) {
                        $recipientData = $recipientResponse->json();
                        $recipientNumber = $recipientData['sms_number'] ?? 'Unknown';
                        $fallbackData['description'] = "Transfer to {$recipientNumber}";
                    } else {
                        $fallbackData['description'] = 'Transfer to recipient';
                    }
                } catch (\Exception $e) {
                    $fallbackData['description'] = 'Transfer to recipient';
                }
            }
            
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/contact-wallets/transfer", $fallbackData);

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Transfer completed successfully',
                    'data' => [
                        'reference' => $validated['reference'],
                    ]
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Exception in publicTransferFunds', [
                'message' => $e->getMessage(),
                'contact_id' => $contactId
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while transferring funds'
            ], 500);
        }
    }

    public function getPublicAvailableContacts($contactId)
    {
        try {
            Log::info('getPublicAvailableContacts called', [
                'contact_id' => $contactId,
                'api_url' => $this->apiUrl
            ]);

            // Get the current contact to find their client_identifier
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/contacts/{$contactId}");

            Log::info('Single contact API response', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            if (!$response->successful()) {
                Log::error('Failed to fetch single contact', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch contact information: ' . $response->body()
                ], $response->status());
            }

            $contactData = $response->json();
            Log::info('Contact data received', [
                'contact_data' => $contactData
            ]);

            // The backend returns the contact directly, not wrapped in a 'data' key
            $clientIdentifier = $contactData['client_identifier'] ?? null;
            
            if (!$clientIdentifier) {
                Log::error('No client_identifier found in contact data', [
                    'contact_data' => $contactData
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Contact does not have a client identifier'
                ], 400);
            }

            // Get all contacts for the same client
            $contactsResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/contacts", [
                    'client_identifier' => $clientIdentifier
                ]);

            Log::info('Contacts list API response', [
                'status' => $contactsResponse->status(),
                'body' => $contactsResponse->body()
            ]);

            if (!$contactsResponse->successful()) {
                Log::error('Failed to fetch contacts list', [
                    'status' => $contactsResponse->status(),
                    'body' => $contactsResponse->body()
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch available contacts: ' . $contactsResponse->body()
                ], $contactsResponse->status());
            }

            $contacts = $contactsResponse->json()['data'] ?? [];
            Log::info('Contacts list received', [
                'contacts_count' => count($contacts),
                'contacts' => $contacts
            ]);
            
            // Filter out the current contact and format the response
            $availableContacts = collect($contacts)
                ->filter(function ($contact) use ($contactId) {
                    return $contact['id'] != $contactId;
                })
                ->map(function ($contact) {
                    return [
                        'id' => $contact['id'],
                        'name' => $contact['first_name'] . ' ' . $contact['last_name'],
                        'sms_number' => $contact['sms_number']
                    ];
                })
                ->values()
                ->toArray();

            Log::info('Available contacts processed', [
                'available_contacts' => $availableContacts
            ]);

            return response()->json([
                'success' => true,
                'data' => $availableContacts
            ]);

        } catch (\Exception $e) {
            Log::error('Exception in getPublicAvailableContacts', [
                'message' => $e->getMessage(),
                'contact_id' => $contactId,
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching available contacts: ' . $e->getMessage()
            ], 500);
        }
    }

    private function generateReference() {
        $now = now();
        $date = $now->format('Ymd');
        $time = $now->format('His');
        $rand = rand(1000, 9999);
        return "TRF-{$date}-{$time}-{$rand}";
    }
}

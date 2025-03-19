<?php

namespace App\Http\Controllers;

use App\Models\EmailTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class EmailTemplateController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $templates = EmailTemplate::client($clientIdentifier)
                ->orderBy('name')
                ->get();

            if (request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'data' => $templates
                ]);
            }

            return Inertia::render('Email/Templates/Index', [
                'templates' => $templates
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch email templates', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            if (request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch email templates'
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to fetch email templates']);
        }
    }

    /**
     * Get templates as JSON response
     */
    public function getTemplates()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $templates = EmailTemplate::client($clientIdentifier)
                ->orderBy('name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $templates
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch email templates', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch email templates'
            ], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Email/Templates/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'category' => 'nullable|string|max:50',
            'variables' => 'nullable|array',
            'variables.*' => 'string',
            'is_active' => 'boolean',
        ]);

        try {
            $validated['client_identifier'] = auth()->user()->identifier;
            
            $template = EmailTemplate::create($validated);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Email template created successfully',
                    'data' => $template
                ]);
            }

            return redirect()->route('email.templates.index')
                ->with('message', 'Email template created successfully');
        } catch (\Exception $e) {
            Log::error('Failed to create email template', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create email template'
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to create email template']);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(EmailTemplate $template)
    {
        try {
            // Check if the template belongs to the authenticated user
            if ($template->client_identifier !== auth()->user()->identifier) {
                if (request()->wantsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'You are not authorized to view this template'
                    ], 403);
                }
                return back()->withErrors(['error' => 'You are not authorized to view this template']);
            }

            if (request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'data' => $template
                ]);
            }

            return Inertia::render('Email/Templates/Show', [
                'template' => $template
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch email template', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            if (request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch email template'
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to fetch email template']);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(EmailTemplate $template)
    {
        try {
            // Check if the template belongs to the authenticated user
            if ($template->client_identifier !== auth()->user()->identifier) {
                if (request()->wantsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'You are not authorized to edit this template'
                    ], 403);
                }
                return back()->withErrors(['error' => 'You are not authorized to edit this template']);
            }

            if (request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'data' => $template
                ]);
            }

            return Inertia::render('Email/Templates/Edit', [
                'template' => $template
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch email template for editing', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            if (request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch email template'
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to fetch email template']);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, EmailTemplate $template)
    {
        // Check if the template belongs to the authenticated user
        if ($template->client_identifier !== auth()->user()->identifier) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to update this template'
                ], 403);
            }
            return back()->withErrors(['error' => 'You are not authorized to update this template']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'category' => 'nullable|string|max:50',
            'variables' => 'nullable|array',
            'variables.*' => 'string',
            'is_active' => 'boolean',
        ]);

        try {
            $template->update($validated);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Email template updated successfully',
                    'data' => $template
                ]);
            }

            return redirect()->route('email.templates.index')
                ->with('message', 'Email template updated successfully');
        } catch (\Exception $e) {
            Log::error('Failed to update email template', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update email template'
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to update email template']);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EmailTemplate $template)
    {
        try {
            // Check if the template belongs to the authenticated user
            if ($template->client_identifier !== auth()->user()->identifier) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to delete this template'
                ], 403);
            }

            $template->delete();

            return response()->json([
                'success' => true,
                'message' => 'Email template deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete email template', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete email template'
            ], 500);
        }
    }

    public function preview(Request $request, EmailTemplate $template)
    {
        try {
            // Check if the template belongs to the authenticated user
            if ($template->client_identifier !== auth()->user()->identifier) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to preview this template'
                ], 403);
            }

            $data = $request->validate([
                'variables' => 'required|array',
                'variables.*' => 'required|string'
            ]);

            $preview = $template->replaceVariables($data['variables']);

            return response()->json([
                'success' => true,
                'data' => $preview
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to preview email template', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to preview email template'
            ], 500);
        }
    }

    public function toggleStatus(EmailTemplate $template)
    {
        try {
            // Check if the template belongs to the authenticated user
            if ($template->client_identifier !== auth()->user()->identifier) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to modify this template'
                ], 403);
            }

            $template->update([
                'is_active' => !$template->is_active
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Email template status updated successfully',
                'data' => [
                    'is_active' => $template->is_active
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to toggle email template status', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update template status'
            ], 500);
        }
    }
}

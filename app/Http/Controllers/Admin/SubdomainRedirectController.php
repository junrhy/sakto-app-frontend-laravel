<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubdomainRedirect;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SubdomainRedirectController extends Controller
{
    /**
     * Display a listing of subdomain redirects.
     */
    public function index(): Response
    {
        $redirects = SubdomainRedirect::query()
            ->orderBy('subdomain')
            ->get();

        return Inertia::render('Admin/SubdomainRedirects/Index', [
            'redirects' => $redirects,
            'statusOptions' => [
                ['label' => '302 Temporary', 'value' => 302],
                ['label' => '301 Permanent', 'value' => 301],
                ['label' => '307 Temporary (cacheable)', 'value' => 307],
                ['label' => '308 Permanent (cacheable)', 'value' => 308],
            ],
        ]);
    }

    /**
     * Store a newly created redirect.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateRedirect($request);

        SubdomainRedirect::create($data);

        return redirect()
            ->back()
            ->with('success', 'Redirect created successfully.');
    }

    /**
     * Update an existing redirect.
     */
    public function update(Request $request, SubdomainRedirect $subdomainRedirect): RedirectResponse
    {
        $data = $this->validateRedirect($request, $subdomainRedirect->id);

        $subdomainRedirect->update($data);

        return redirect()
            ->back()
            ->with('success', 'Redirect updated successfully.');
    }

    /**
     * Remove the specified redirect from storage.
     */
    public function destroy(SubdomainRedirect $subdomainRedirect): RedirectResponse
    {
        $subdomainRedirect->delete();

        return redirect()
            ->back()
            ->with('success', 'Redirect removed.');
    }

    protected function validateRedirect(Request $request, ?int $ignoreId = null): array
    {
        $validated = $request->validate([
            'subdomain' => [
                'required',
                'string',
                'max:100',
                'regex:/^[a-z0-9-]+$/i',
                Rule::unique('subdomain_redirects', 'subdomain')->ignore($ignoreId),
            ],
            'destination_url' => ['required', 'string', 'max:255'],
            'http_status' => ['required', 'integer', Rule::in([301, 302, 307, 308])],
            'is_active' => ['sometimes', 'boolean'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $validated['subdomain'] = Str::lower($validated['subdomain']);
        $validated['destination_url'] = trim($validated['destination_url']);
        $validated['is_active'] = $request->boolean('is_active', true);

        return $validated;
    }
}


<?php

namespace App\Http\Controllers\Customer;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class NewsfeedController extends CustomerProjectController
{
    public function overview(Request $request, string $project, $ownerIdentifier): Response
    {
        $this->ensureCustomerProject($request, $project);

        try {
            $owner = $this->resolveOwner($project, $ownerIdentifier);
            $owner->app_currency = $this->decodeCurrency($owner->app_currency);

            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/content-creator", [
                    'client_identifier' => $owner->identifier,
                    'status' => 'published',
                    'per_page' => 24,
                    'page' => 1,
                ]);

            $updates = [];

            if ($response->successful()) {
                $payload = $response->json();
                $updates = $payload['data'] ?? ($payload['updates'] ?? $payload ?? []);
            }

            return Inertia::render('Customer/Newsfeed/Overview', [
                'project' => $project,
                'owner' => $this->transformOwner($owner),
                'updates' => $updates,
                'appCurrency' => $owner->app_currency ?? $this->decodeCurrency($request->user()->app_currency),
                'backUrl' => $this->resolveBackUrl($project, $owner),
            ]);
        } catch (ModelNotFoundException $e) {
            abort(404, 'Owner not found');
        } catch (\Throwable $th) {
            abort(500, 'Failed to load newsfeed');
        }
    }

    private function transformOwner($owner): array
    {
        return [
            'id' => $owner->id,
            'name' => $owner->name,
            'slug' => $owner->slug,
            'identifier' => $owner->identifier,
            'project_identifier' => $owner->project_identifier,
        ];
    }

    private function resolveBackUrl(string $project, $owner): string
    {
        if ($project === 'community') {
            $identifier = $owner->slug ?? $owner->identifier ?? $owner->id;

            return route('customer.communities.show', $identifier);
        }

        return route('customer.dashboard');
    }
}



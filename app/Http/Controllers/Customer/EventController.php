<?php

namespace App\Http\Controllers\Customer;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends CustomerProjectController
{
    public function overview(Request $request, string $project, $ownerIdentifier): Response
    {
        $this->ensureCustomerProject($request, $project);

        try {
            $owner = $this->resolveOwner($project, $ownerIdentifier);
            $owner->app_currency = $this->decodeCurrency($owner->app_currency);

            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/events", [
                    'client_identifier' => $owner->identifier,
                    'is_public' => true,
                    'per_page' => 24,
                    'page' => 1,
                ]);

            $events = [];

            if ($response->successful()) {
                $payload = $response->json();
                $events = $payload['data'] ?? ($payload['events'] ?? $payload ?? []);
            }

            return Inertia::render('Customer/Events/Overview', [
                'project' => $project,
                'owner' => $this->transformOwner($owner),
                'events' => $events,
                'appCurrency' => $owner->app_currency ?? $this->decodeCurrency($request->user()->app_currency),
                'backUrl' => $this->resolveBackUrl($project, $owner),
            ]);
        } catch (ModelNotFoundException $e) {
            abort(404, 'Owner not found');
        } catch (\Throwable $th) {
            abort(500, 'Failed to load events');
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



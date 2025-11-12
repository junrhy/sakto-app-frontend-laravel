<?php

namespace App\Http\Controllers\Customer;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class ChallengeController extends CustomerProjectController
{
    public function overview(Request $request, string $project, $ownerIdentifier): Response
    {
        $this->ensureCustomerProject($request, $project);

        try {
            $owner = $this->resolveOwner($project, $ownerIdentifier);

            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/challenges", [
                    'client_identifier' => $owner->identifier,
                    'limit' => 24,
                ]);

            $challenges = [];

            if ($response->successful()) {
                $payload = $response->json();
                $challenges = $payload['data'] ?? ($payload['challenges'] ?? $payload ?? []);
            }

            return Inertia::render('Customer/Challenges/Overview', [
                'project' => $project,
                'owner' => $this->transformOwner($owner),
                'challenges' => $challenges,
                'backUrl' => $this->resolveBackUrl($project, $owner),
            ]);
        } catch (ModelNotFoundException $e) {
            abort(404, 'Owner not found');
        } catch (\Throwable $th) {
            abort(500, 'Failed to load challenges');
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



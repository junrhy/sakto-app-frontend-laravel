<?php

namespace App\Http\Controllers\Customer;

use App\Models\User;
use App\Models\UserCustomer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class MortuaryController extends CustomerProjectController
{
    public function index(Request $request, string $project, $ownerIdentifier): Response
    {
        $this->ensureCustomerProject($request, $project);

        $owner = $this->resolveOwner($project, $ownerIdentifier);
        $owner->app_currency = $this->decodeCurrency($owner->app_currency);
        $this->ensureCustomerAccess($request, $owner);

        $records = [];
        $error = null;

        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/mortuary", [
                    'client_identifier' => $owner->identifier,
                ]);

            if (!$response->successful()) {
                throw new \RuntimeException('API request failed: ' . $response->body());
            }

            $payload = $response->json();
            $data = $payload['data'] ?? $payload;

            $members = collect($data['members'] ?? []);
            $contributionsByMember = collect($data['contributions'] ?? [])
                ->groupBy(fn ($item) => (string) data_get($item, 'member_id'));
            $claimsByMember = collect($data['claims'] ?? [])
                ->groupBy(fn ($item) => (string) data_get($item, 'member_id'));

            $records = $members
                ->map(function ($member) use ($contributionsByMember, $claimsByMember) {
                    $memberId = (string) data_get($member, 'id');
                    $memberContributions = $contributionsByMember->get($memberId);
                    $memberClaims = $claimsByMember->get($memberId);

                    $contributions = $memberContributions
                        ? $memberContributions
                            ->map(function ($contribution) {
                                return [
                                    'id' => data_get($contribution, 'id'),
                                    'amount' => data_get($contribution, 'amount'),
                                    'payment_date' => data_get($contribution, 'payment_date'),
                                    'payment_method' => data_get($contribution, 'payment_method'),
                                    'reference_number' => data_get($contribution, 'reference_number'),
                                    'created_at' => data_get($contribution, 'created_at'),
                                ];
                            })
                            ->values()
                            ->all()
                        : [];

                    $claims = $memberClaims
                        ? $memberClaims
                            ->map(function ($claim) {
                                return [
                                    'id' => data_get($claim, 'id'),
                                    'claim_type' => data_get($claim, 'claim_type'),
                                    'amount' => data_get($claim, 'amount'),
                                    'date_of_death' => data_get($claim, 'date_of_death'),
                                    'deceased_name' => data_get($claim, 'deceased_name'),
                                    'relationship_to_member' => data_get($claim, 'relationship_to_member'),
                                    'cause_of_death' => data_get($claim, 'cause_of_death'),
                                    'status' => data_get($claim, 'status'),
                                    'created_at' => data_get($claim, 'created_at'),
                                ];
                            })
                            ->values()
                            ->all()
                        : [];

                    return [
                        'id' => data_get($member, 'id'),
                        'name' => data_get($member, 'name'),
                        'status' => data_get($member, 'status'),
                        'membership_start_date' => data_get($member, 'membership_start_date'),
                        'contribution_amount' => data_get($member, 'contribution_amount'),
                        'contribution_frequency' => data_get($member, 'contribution_frequency'),
                        'contact_number' => data_get($member, 'contact_number'),
                        'gender' => data_get($member, 'gender'),
                        'group' => data_get($member, 'group'),
                        'contributions' => $contributions,
                        'claims' => $claims,
                    ];
                })
                ->values()
                ->all();
        } catch (\Throwable $th) {
            Log::error('Failed to fetch mortuary members for customer', [
                'project' => $project,
                'owner_id' => $owner->id,
                'customer_id' => $request->user()->id,
                'message' => $th->getMessage(),
            ]);

            $error = 'We were unable to load mortuary members right now. Please try again later.';
        }

        return Inertia::render('Customer/Mortuary/Index', [
            'project' => $project,
            'owner' => $this->transformOwner($owner),
            'records' => $records,
            'appCurrency' => $owner->app_currency ?? $this->decodeCurrency($request->user()->app_currency),
            'error' => $error,
            'backUrl' => $this->resolveBackUrl($project, $owner),
        ]);
    }

    public function contributions(Request $request, string $project, $ownerIdentifier, $memberId): Response
    {
        $this->ensureCustomerProject($request, $project);

        $owner = $this->resolveOwner($project, $ownerIdentifier);
        $owner->app_currency = $this->decodeCurrency($owner->app_currency);
        $this->ensureCustomerAccess($request, $owner);

        $memberData = null;
        $contributions = [];
        $error = null;

        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/mortuary/members/{$memberId}", [
                    'client_identifier' => $owner->identifier,
                ]);

            if (!$response->successful()) {
                throw new \RuntimeException('API request failed: ' . $response->body());
            }

            $payload = $response->json();
            $data = $payload['data'] ?? $payload;

            if (is_array($data)) {
                $memberData = [
                    'id' => data_get($data, 'id'),
                    'name' => data_get($data, 'name'),
                    'status' => data_get($data, 'status'),
                    'contribution_amount' => data_get($data, 'contribution_amount'),
                    'contribution_frequency' => data_get($data, 'contribution_frequency'),
                    'group' => data_get($data, 'group'),
                ];
            }

            $contributions = collect($data['contributions'] ?? [])
                ->map(function ($contribution) {
                    return [
                        'id' => (string) data_get($contribution, 'id'),
                        'amount' => (float) data_get($contribution, 'amount', 0),
                        'payment_date' => data_get($contribution, 'payment_date'),
                        'payment_method' => data_get($contribution, 'payment_method'),
                        'reference_number' => data_get($contribution, 'reference_number'),
                        'created_at' => data_get($contribution, 'created_at'),
                    ];
                })
                ->sortByDesc(function ($contribution) {
                    $date = $contribution['payment_date'] ?? $contribution['created_at'] ?? null;

                    return $date ? strtotime($date) : 0;
                })
                ->values()
                ->all();
        } catch (\Throwable $th) {
            Log::error('Failed to fetch mortuary contributions for customer', [
                'project' => $project,
                'owner_id' => $owner->id,
                'member_id' => $memberId,
                'customer_id' => $request->user()->id,
                'message' => $th->getMessage(),
            ]);

            $error = 'We were unable to load the contribution history right now. Please try again later.';
        }

        return Inertia::render('Customer/Mortuary/Contributions', [
            'project' => $project,
            'owner' => $this->transformOwner($owner),
            'member' => $memberData,
            'contributions' => $contributions,
            'appCurrency' => $owner->app_currency ?? $this->decodeCurrency($request->user()->app_currency),
            'error' => $error,
            'backUrl' => $this->resolveBackUrl($project, $owner),
        ]);
    }

    public function claims(Request $request, string $project, $ownerIdentifier, $memberId): Response
    {
        $this->ensureCustomerProject($request, $project);

        $owner = $this->resolveOwner($project, $ownerIdentifier);
        $owner->app_currency = $this->decodeCurrency($owner->app_currency);
        $this->ensureCustomerAccess($request, $owner);

        $memberData = null;
        $claims = [];
        $error = null;

        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/mortuary/members/{$memberId}", [
                    'client_identifier' => $owner->identifier,
                ]);

            if (!$response->successful()) {
                throw new \RuntimeException('API request failed: ' . $response->body());
            }

            $payload = $response->json();
            $data = $payload['data'] ?? $payload;

            if (is_array($data)) {
                $memberData = [
                    'id' => data_get($data, 'id'),
                    'name' => data_get($data, 'name'),
                    'status' => data_get($data, 'status'),
                    'contribution_amount' => data_get($data, 'contribution_amount'),
                    'contribution_frequency' => data_get($data, 'contribution_frequency'),
                    'group' => data_get($data, 'group'),
                ];
            }

            $claims = collect($data['claims'] ?? [])
                ->map(function ($claim) {
                    return [
                        'id' => (string) data_get($claim, 'id'),
                        'claim_type' => data_get($claim, 'claim_type'),
                        'amount' => (float) data_get($claim, 'amount', 0),
                        'date_of_death' => data_get($claim, 'date_of_death'),
                        'deceased_name' => data_get($claim, 'deceased_name'),
                        'relationship_to_member' => data_get($claim, 'relationship_to_member'),
                        'cause_of_death' => data_get($claim, 'cause_of_death'),
                        'status' => data_get($claim, 'status'),
                        'created_at' => data_get($claim, 'created_at'),
                    ];
                })
                ->sortByDesc(function ($claim) {
                    $date = $claim['date_of_death'] ?? $claim['created_at'] ?? null;

                    return $date ? strtotime($date) : 0;
                })
                ->values()
                ->all();
        } catch (\Throwable $th) {
            Log::error('Failed to fetch mortuary claims for customer', [
                'project' => $project,
                'owner_id' => $owner->id,
                'member_id' => $memberId,
                'customer_id' => $request->user()->id,
                'message' => $th->getMessage(),
            ]);

            $error = 'We were unable to load the claims history right now. Please try again later.';
        }

        return Inertia::render('Customer/Mortuary/Claims', [
            'project' => $project,
            'owner' => $this->transformOwner($owner),
            'member' => $memberData,
            'claims' => $claims,
            'appCurrency' => $owner->app_currency ?? $this->decodeCurrency($request->user()->app_currency),
            'error' => $error,
            'backUrl' => $this->resolveBackUrl($project, $owner),
        ]);
    }

    private function ensureCustomerAccess(Request $request, User $owner): void
    {
        if ($owner->project_identifier === 'community') {
            $hasMembership = UserCustomer::where('user_id', $owner->id)
                ->where('customer_id', $request->user()->id)
                ->where('relationship_type', 'member')
                ->exists();

            if (!$hasMembership) {
                abort(403, 'You must be a member of this community to view these records.');
            }
        }
    }

    private function transformOwner(User $owner): array
    {
        return [
            'id' => $owner->id,
            'name' => $owner->name,
            'slug' => $owner->slug,
            'identifier' => $owner->identifier,
            'project_identifier' => $owner->project_identifier,
        ];
    }

    private function resolveBackUrl(string $project, User $owner): string
    {
        if ($project === 'community') {
            $identifier = $owner->slug ?? $owner->identifier ?? $owner->id;

            return route('customer.communities.show', $identifier);
        }

        return route('customer.dashboard');
    }
}



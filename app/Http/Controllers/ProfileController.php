<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;
use App\Models\UserAddress;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'currency' => json_decode($request->user()->app_currency),
            'addresses' => UserAddress::where('user_id', auth()->user()->id)->get(),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account and all associated data.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();
        $clientIdentifier = $user->identifier;
        $userId = $user->id;

        // Logout the user first
        Auth::logout();

        // Delete all associated data using the client_identifier and user_id
        $this->deleteUserAssociatedData($clientIdentifier, $userId);
        
        // Delete user data from external API
        $this->deleteUserDataFromExternalApi($clientIdentifier);

        // Delete the user record
        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    /**
     * Delete all data associated with a user's client_identifier and user_id.
     */
    private function deleteUserAssociatedData(string $clientIdentifier, int $userId): void
    {
        // Delete user subscriptions (using client_identifier)
        \App\Models\UserSubscription::where('user_identifier', $clientIdentifier)->delete();

        // Delete team members (using client_identifier)
        \App\Models\TeamMember::where('user_identifier', $clientIdentifier)->delete();

        // Delete user addresses (using user_id)
        \App\Models\UserAddress::where('user_id', $userId)->delete();

        // Delete dashboards (using user_id)
        \App\Models\Dashboard::where('user_id', $userId)->delete();

        // Delete widgets (using user_id)
        \App\Models\Widget::where('user_id', $userId)->delete();

        // Delete transactions (using user_id)
        \App\Models\Transaction::where('user_id', $userId)->delete();

        // Note: We could also add deletion of other related data here if needed
        // For example, if there are logs, audit trails, or other user-specific data
        // that should be deleted when a user account is removed.
    }

    /**
     * Delete user data from external API using client_identifier.
     */
    private function deleteUserDataFromExternalApi(string $clientIdentifier): void
    {
        $apiUrl = config('api.url');
        $apiToken = config('api.token');

        if (!$apiUrl || !$apiToken) {
            Log::warning('External API configuration missing, skipping external data deletion', [
                'client_identifier' => $clientIdentifier
            ]);
            return;
        }

        try {
            // Use the new single endpoint to delete all user data
            $response = Http::withToken($apiToken)
                ->delete("{$apiUrl}/user-data/all", [
                    'client_identifier' => $clientIdentifier
                ]);

            if ($response->successful()) {
                $responseData = $response->json();
                Log::info('Successfully deleted all user data from external API', [
                    'client_identifier' => $clientIdentifier,
                    'deleted_counts' => $responseData['deleted_counts'] ?? []
                ]);
            } else {
                Log::error('Failed to delete user data from external API', [
                    'client_identifier' => $clientIdentifier,
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Exception while deleting user data from external API', [
                'client_identifier' => $clientIdentifier,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    public function updateCurrency(Request $request): RedirectResponse
    {
        $user = User::find(auth()->user()->id);
        $user->fill(['app_currency' => json_encode($request->all())]);
        $user->save();

        return Redirect::route('profile.edit');
    }

    public function updateTheme(Request $request): RedirectResponse
    {
        $user = User::find(auth()->user()->id);
        $user->fill(['theme' => $request->theme]);
        $user->save();

        return Redirect::route('profile.edit');
    }

    public function updateColor(Request $request): RedirectResponse
    {
        $user = User::find(auth()->user()->id);
        $user->fill(['theme_color' => $request->color]);
        $user->save();

        return Redirect::route('profile.edit');
    }

    public function updateAddresses(Request $request): RedirectResponse
    {
        // dd($request->all());
        foreach ($request->addresses as $address) {
            if (isset($address['id'])) {
                $address['user_id'] = auth()->user()->id;
                UserAddress::find($address['id'])->update($address);
            } else {
                $address['user_id'] = auth()->user()->id;
                UserAddress::create($address);
            }
        }

        return Redirect::route('profile.edit');
    }
}

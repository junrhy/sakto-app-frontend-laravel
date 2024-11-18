<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
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
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
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
        dd($request->all());
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

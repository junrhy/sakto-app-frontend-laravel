<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\UserAddress;
use App\Models\UserCustomer;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the customer's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $address = UserAddress::where('user_id', $user->id)
            ->where('is_primary', true)
            ->first();

        // Get businesses this customer is connected to
        $connectedBusinesses = $user->businesses()
            ->with('business')
            ->where('is_active', true)
            ->get();

        return Inertia::render('Customer/Profile/Edit', [
            'address' => $address,
            'connectedBusinesses' => $connectedBusinesses,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the customer's profile information.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_number' => [
                'required',
                'string',
                'max:20',
                'regex:/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/'
            ],
        ], [
            'contact_number.regex' => 'The phone number format is invalid. Please use a valid format (e.g., +1 (555) 123-4567).'
        ]);

        $request->user()->fill($validated);
        $request->user()->save();

        return redirect()->route('customer.profile.edit')->with('status', 'profile-updated');
    }

    /**
     * Update the customer's password.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => 'required|current_password',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->route('customer.profile.edit')->with('status', 'password-updated');
    }

    /**
     * Update the customer's address.
     */
    public function updateAddress(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'street' => 'required|string|max:255',
            'unit_number' => 'nullable|string|max:50',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'country' => 'required|string|max:100',
        ]);

        $address = UserAddress::where('user_id', $request->user()->id)
            ->where('is_primary', true)
            ->first();

        if ($address) {
            $address->update($validated);
        } else {
            UserAddress::create([
                'user_id' => $request->user()->id,
                'address_type' => 'home',
                'is_primary' => true,
                'phone' => $request->user()->contact_number,
                ...$validated,
            ]);
        }

        return redirect()->route('customer.profile.edit')->with('status', 'address-updated');
    }
}


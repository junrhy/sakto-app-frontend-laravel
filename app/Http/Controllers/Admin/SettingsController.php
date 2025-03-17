<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Setting;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class SettingsController extends Controller
{
    /**
     * Display the settings page.
     */
    public function index()
    {
        $settings = Setting::all();
        
        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings
        ]);
    }

    /**
     * Update the specified setting.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'key' => 'required|string|exists:settings,key',
            'value' => 'required|string',
        ]);

        Setting::set($validated['key'], $validated['value']);

        return Redirect::back()->with('success', 'Setting updated successfully.');
    }

    /**
     * Update registration enabled setting.
     */
    public function updateRegistrationEnabled(Request $request)
    {
        $validated = $request->validate([
            'enabled' => 'required|boolean',
        ]);

        Setting::set('registration_enabled', $validated['enabled'] ? 'true' : 'false');

        return Redirect::back()->with('success', 'Registration setting updated successfully.');
    }

    /**
     * Update maintenance mode settings.
     */
    public function updateMaintenanceMode(Request $request)
    {
        $validated = $request->validate([
            'enabled' => 'required|boolean',
            'message' => 'required|string|max:500',
        ]);

        Setting::set('maintenance_mode', $validated['enabled'] ? 'true' : 'false');
        Setting::set('maintenance_message', $validated['message']);

        return Redirect::back()->with('success', 'Maintenance mode settings updated successfully.');
    }

    /**
     * Update IP restriction settings.
     */
    public function updateIpRestriction(Request $request)
    {
        $validated = $request->validate([
            'enabled' => 'required|boolean',
            'allowed_ips' => 'nullable|string',
        ]);

        // Validate IP addresses if enabled and not empty
        if ($validated['enabled'] && !empty($validated['allowed_ips'])) {
            $ips = array_map('trim', explode(',', $validated['allowed_ips']));
            
            foreach ($ips as $ip) {
                if (!filter_var($ip, FILTER_VALIDATE_IP)) {
                    return Redirect::back()->withErrors(['allowed_ips' => 'One or more IP addresses are invalid.'])->withInput();
                }
            }
        }

        Setting::set('ip_restriction_enabled', $validated['enabled'] ? 'true' : 'false');
        Setting::set('allowed_ips', $validated['allowed_ips']);

        return Redirect::back()->with('success', 'IP restriction settings updated successfully.');
    }
}

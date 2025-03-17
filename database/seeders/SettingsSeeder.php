<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Add setting for enabling/disabling user registration
        Setting::set(
            'registration_enabled', 
            'true', 
            'Enable or disable user registration (true/false)'
        );

        // Add setting for maintenance mode
        Setting::set(
            'maintenance_mode', 
            'false', 
            'Enable or disable site-wide maintenance mode (true/false)'
        );

        // Add setting for maintenance message
        Setting::set(
            'maintenance_message', 
            'The site is currently undergoing scheduled maintenance. Please check back soon.', 
            'Custom message to display during maintenance mode'
        );

        // Add setting for IP restrictions
        Setting::set(
            'ip_restriction_enabled', 
            'false', 
            'Enable or disable IP restrictions for admin access (true/false)'
        );

        // Add setting for allowed IPs
        Setting::set(
            'allowed_ips', 
            '', 
            'Comma-separated list of IP addresses allowed to access admin area'
        );
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DeliveryController extends Controller
{
    public function show($identifier)
    {
        try {
            // Check if identifier is numeric (ID) or string (slug)
            $delivery = null;
            
            if (is_numeric($identifier)) {
                // Search by ID
                $delivery = \App\Models\User::where('project_identifier', 'delivery')
                    ->where('id', $identifier)
                    ->select('id', 'name', 'email', 'contact_number', 'app_currency', 'created_at', 'identifier', 'slug')
                    ->first();
            } else {
                // Search by slug
                $delivery = \App\Models\User::where('project_identifier', 'delivery')
                    ->where('slug', $identifier)
                    ->select('id', 'name', 'email', 'contact_number', 'app_currency', 'created_at', 'identifier', 'slug')
                    ->first();
            }

            if (!$delivery) {
                abort(404, 'Delivery service not found');
            }

            return Inertia::render('Landing/Delivery/Show', [
                'delivery' => $delivery,
                'identifier' => $identifier,
                'canLogin' => \Illuminate\Support\Facades\Route::has('login'),
                'canRegister' => \Illuminate\Support\Facades\Route::has('register'),
                'auth' => [
                    'user' => auth()->user()
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('DeliveryController show error: ' . $e->getMessage());
            abort(500, 'Unable to load delivery information');
        }
    }
}
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ShopController extends Controller
{
    public function show($identifier)
    {
        try {
            // Check if identifier is numeric (ID) or string (slug)
            $shop = null;
            
            if (is_numeric($identifier)) {
                // Search by ID
                $shop = \App\Models\User::where('project_identifier', 'shop')
                    ->where('id', $identifier)
                    ->select('id', 'name', 'email', 'contact_number', 'app_currency', 'created_at', 'identifier', 'slug')
                    ->first();
            } else {
                // Search by slug
                $shop = \App\Models\User::where('project_identifier', 'shop')
                    ->where('slug', $identifier)
                    ->select('id', 'name', 'email', 'contact_number', 'app_currency', 'created_at', 'identifier', 'slug')
                    ->first();
            }

            if (!$shop) {
                abort(404, 'Shop service not found');
            }

            return Inertia::render('Landing/Shop/Show', [
                'shop' => $shop,
                'identifier' => $identifier,
                'canLogin' => \Illuminate\Support\Facades\Route::has('login'),
                'canRegister' => \Illuminate\Support\Facades\Route::has('register'),
                'auth' => [
                    'user' => auth()->user()
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('ShopController show error: ' . $e->getMessage());
            abort(500, 'Unable to load shop information');
        }
    }
}
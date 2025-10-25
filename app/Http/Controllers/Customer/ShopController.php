<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    /**
     * Display a listing of shops.
     */
    public function index(Request $request): Response
    {
        // Check if user is logged in and has shop project_identifier
        if (!auth()->check() || auth()->user()->project_identifier !== 'shop') {
            abort(403, 'Unauthorized access');
        }

        // Get all shop users with user_type = 'user'
        $shops = User::where('project_identifier', 'shop')
            ->where('user_type', 'user')
            ->select('id', 'name', 'email', 'contact_number', 'created_at', 'slug', 'identifier')
            ->latest()
            ->get();

        return Inertia::render('Customer/Shop/Index', [
            'shops' => $shops,
        ]);
    }
}


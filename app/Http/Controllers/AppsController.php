<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AppsController extends Controller
{
    public function index()
    {
        $appCurrency = json_decode(auth()->user()->app_currency);

        return Inertia::render('Apps', [
            'auth' => [
                'user' => [
                    'name' => auth()->user()->name,
                    'email' => auth()->user()->email,
                    'identifier' => auth()->user()->identifier,
                    'app_currency' => $appCurrency,
                ]
            ],
            'apps' => config('apps')
        ]);
    }

    public function getApps()
    {
        return response()->json([
            'apps' => config('apps')
        ]);
    }
} 
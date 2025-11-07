<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Employee/Dashboard', [
            'profile' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }
}

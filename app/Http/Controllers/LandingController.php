<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Inertia\Inertia;
use App\Models\User;

class LandingController extends Controller
{
    public function index(Request $request)
    {
        if (str_contains($request->getHost(), 'shop') || str_contains($request->getPathInfo(), 'shop')) {
            return Inertia::render('Landing/Shop', [
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
                'laravelVersion' => Application::VERSION,
                'phpVersion' => PHP_VERSION,
            ]);
        }

        if (str_contains($request->getHost(), 'delivery') || str_contains($request->getPathInfo(), 'delivery')) {
            return Inertia::render('Landing/Delivery', [
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
                'laravelVersion' => Application::VERSION,
                'phpVersion' => PHP_VERSION,
            ]);
        }

        if (str_contains($request->getHost(), 'jobs') || str_contains($request->getPathInfo(), 'jobs')) {
            return Inertia::render('Landing/Jobs', [
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
                'laravelVersion' => Application::VERSION,
                'phpVersion' => PHP_VERSION,
            ]);
        }

        if (str_contains($request->getHost(), 'community') || str_contains($request->getPathInfo(), 'community')) {
            return Inertia::render('Landing/Community', [
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
                'laravelVersion' => Application::VERSION,
                'phpVersion' => PHP_VERSION,
            ]);
        }

        if (str_contains($request->getHost(), 'logistics') || str_contains($request->getPathInfo(), 'logistics')) {
            return Inertia::render('Landing/Logistics', [
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
                'laravelVersion' => Application::VERSION,
                'phpVersion' => PHP_VERSION,
            ]);
        }

        return Inertia::render('Landing/Default', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }

    public function shop()
    {
        return Inertia::render('Landing/Shop', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }

    public function delivery()
    {
        return Inertia::render('Landing/Delivery', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }

    public function jobs()
    {
        return Inertia::render('Landing/Jobs', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }

    public function community()
    {
        $communityUsers = User::where('project_identifier', 'community')
            ->select('id', 'name', 'email', 'created_at')
            ->latest()
            ->get();

        return Inertia::render('Landing/Community/Index', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'communityUsers' => $communityUsers,
        ]);
    }

    public function communityMember($id)
    {
        $member = User::where('project_identifier', 'community')
            ->where('id', $id)
            ->select('id', 'name', 'email', 'contact_number', 'created_at')
            ->firstOrFail();

        return Inertia::render('Landing/Community/Member', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'member' => $member,
        ]);
    }

    public function logistics()
    {
        return Inertia::render('Landing/Logistics', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }
} 
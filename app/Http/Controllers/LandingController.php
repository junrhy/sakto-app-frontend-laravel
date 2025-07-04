<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Inertia\Inertia;

class LandingController extends Controller
{

    public function index(Request $request)
    {
        // Check if the request is from a mobile device
        if ($request->header('User-Agent') && preg_match('/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i', $request->header('User-Agent'))) {
            return redirect()->route('login');
        }

        if (str_contains($request->getHost(), 'shop') || str_contains($request->getPathInfo(), 'shop')) {
            return Inertia::render('Landing/Shop/Index', [
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
                'laravelVersion' => Application::VERSION,
                'phpVersion' => PHP_VERSION,
            ]);
        }

        if (str_contains($request->getHost(), 'delivery') || str_contains($request->getPathInfo(), 'delivery')) {
            return Inertia::render('Landing/Delivery/Index', [
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
                'laravelVersion' => Application::VERSION,
                'phpVersion' => PHP_VERSION,
            ]);
        }

        if (str_contains($request->getHost(), 'jobs') || str_contains($request->getPathInfo(), 'jobs')) {
            return Inertia::render('Landing/Jobs/Index', [
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
                'laravelVersion' => Application::VERSION,
                'phpVersion' => PHP_VERSION,
            ]);
        }

        if (str_contains($request->getHost(), 'logistics') || str_contains($request->getPathInfo(), 'logistics')) {
            return Inertia::render('Landing/Logistics/Index', [
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
                'laravelVersion' => Application::VERSION,
                'phpVersion' => PHP_VERSION,
            ]);
        }

        if (str_contains($request->getHost(), 'travel') || str_contains($request->getPathInfo(), 'travel')) {
            return Inertia::render('Landing/Travel/Index', [
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
                'laravelVersion' => Application::VERSION,
                'phpVersion' => PHP_VERSION,
            ]);
        }

        return Inertia::render('Landing/Index', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }

    public function shop()
    {
        return Inertia::render('Landing/Shop/Index', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }

    public function delivery()
    {
        return Inertia::render('Landing/Delivery/Index', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }

    public function jobs()
    {
        return Inertia::render('Landing/Jobs/Index', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }

    public function logistics()
    {
        return Inertia::render('Landing/Logistics/Index', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }

    public function medical()
    {
        return Inertia::render('Landing/Medical', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }

    public function travel()
    {
        return Inertia::render('Landing/Travel/Index', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }
}
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Inertia\Inertia;

class PublicController extends Controller
{

    public function index(Request $request)
    {
        $userAgent = $request->header('User-Agent');
        
        // Allow force mobile view with query parameter (?mobile=1)
        if ($request->query('mobile') === '1') {
            return Inertia::render('Public/MobileSolutions', [
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
            ]);
        }
        
        // Check if the request is from a mobile device or tablet
        // Includes all iPad models (iPad, iPad Air, iPad Pro, iPad Mini), iPhones, Android devices, and other tablets
        $isMobileOrTablet = $userAgent && (
            // Standard mobile/tablet detection
            preg_match('/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|playbook|silk/i', $userAgent) ||
            // Explicit iPad detection (catches all iPad models including Air and Pro in dev tools)
            preg_match('/ipad/i', $userAgent) ||
            // Tablet keyword detection
            preg_match('/tablet/i', $userAgent)
        );

        if ($isMobileOrTablet) {
            return Inertia::render('Public/MobileSolutions', [
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
            ]);
        }

        if (str_contains($request->getHost(), 'shop') || str_contains($request->getPathInfo(), 'shop')) {
            // Redirect authenticated users to home
            if (auth()->check()) {
                return redirect()->route('home');
            }

            return Inertia::render('Public/Shop/Index', [
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
                'laravelVersion' => Application::VERSION,
                'phpVersion' => PHP_VERSION,
            ]);
        }

        if (str_contains($request->getHost(), 'delivery') || str_contains($request->getPathInfo(), 'delivery')) {
            // Redirect authenticated users to home
            if (auth()->check()) {
                return redirect()->route('home');
            }

            return Inertia::render('Public/Delivery/Index', [
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
                'laravelVersion' => Application::VERSION,
                'phpVersion' => PHP_VERSION,
            ]);
        }

        if (str_contains($request->getHost(), 'jobs') || str_contains($request->getHost(), 'hr') || str_contains($request->getPathInfo(), 'jobs') || str_contains($request->getPathInfo(), 'hr')) {
            // Redirect authenticated users to home
            if (auth()->check()) {
                return redirect()->route('home');
            }

            return Inertia::render('Public/Jobs/Index', [
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
                'laravelVersion' => Application::VERSION,
                'phpVersion' => PHP_VERSION,
            ]);
        }

        if (str_contains($request->getHost(), 'travel') || str_contains($request->getPathInfo(), 'travel')) {
            // Redirect authenticated users to home
            if (auth()->check()) {
                return redirect()->route('home');
            }

            return Inertia::render('Public/Travel/Index', [
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
                'laravelVersion' => Application::VERSION,
                'phpVersion' => PHP_VERSION,
            ]);
        }

        if (str_contains($request->getHost(), 'fnb') || str_contains($request->getHost(), 'f&b') || str_contains($request->getPathInfo(), 'fnb')) {
            // Redirect authenticated users to home
            if (auth()->check()) {
                return redirect()->route('home');
            }

            return Inertia::render('Public/Fnb/Index', [
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
                'laravelVersion' => Application::VERSION,
                'phpVersion' => PHP_VERSION,
            ]);
        }

        // Redirect authenticated users to home
        if (auth()->check()) {
            return redirect()->route('home');
        }

        return Inertia::render('Public/Index', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }

    public function shop()
    {
        // Redirect authenticated users to home
        if (auth()->check()) {
            return redirect()->route('home');
        }

        return Inertia::render('Public/Shop/Index', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }

    public function delivery()
    {
        // Redirect authenticated users to home
        if (auth()->check()) {
            return redirect()->route('home');
        }

        return Inertia::render('Public/Delivery/Index', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }

    public function jobs()
    {
        // Redirect authenticated users to home
        if (auth()->check()) {
            return redirect()->route('home');
        }

        return Inertia::render('Public/Jobs/Index', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }

    public function medical()
    {
        // Redirect authenticated users to home
        if (auth()->check()) {
            return redirect()->route('home');
        }

        return Inertia::render('Public/Medical/Index', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }

    public function travel()
    {
        // Redirect authenticated users to home
        if (auth()->check()) {
            return redirect()->route('home');
        }

        return Inertia::render('Public/Travel/Index', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }

    public function fnb()
    {
        // Redirect authenticated users to home
        if (auth()->check()) {
            return redirect()->route('home');
        }

        return Inertia::render('Public/Fnb/Index', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }

    public function neulify()
    {
        // Redirect authenticated users to home
        if (auth()->check()) {
            return redirect()->route('home');
        }

        return Inertia::render('Public/Neulify', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }

    public function mobileSolutions()
    {
        // Redirect authenticated users to home
        if (auth()->check()) {
            return redirect()->route('home');
        }

        return Inertia::render('Public/MobileSolutions', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
        ]);
    }
}
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="overflow-x-hidden">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>
            @php
                $routeName = request()->route()->getName();
                $title = config('app.name', 'Sakto');
    
                // Get user slug name for community member routes
                if (in_array($routeName, ['community.member', 'member.short'])) {
                    $identifier = request()->route('identifier');
                    if ($identifier) {
                        // Check if identifier is numeric (ID) or string (slug)
                        $member = null;
                        
                        if (is_numeric($identifier)) {
                            // Search by ID
                            $member = \App\Models\User::where('project_identifier', 'community')
                                ->where('id', $identifier)
                                ->first();
                        } else {
                            // Search by slug
                            $member = \App\Models\User::where('project_identifier', 'community')
                                ->where('slug', $identifier)
                                ->first();
                        }
                        
                        if ($member) {
                            $title = $member->name;
                        }
                    }
                }
            @endphp
            {{ $title }}
        </title>

        <!-- Add these lines for favicon support -->
        <link rel="icon" type="image" href="{{ asset('images/tetris-white-bg.png') }}" media="(prefers-color-scheme: light)">
        <link rel="icon" type="image" href="{{ asset('images/tetris-white.png') }}" media="(prefers-color-scheme: dark)">

        <!-- iOS home screen icons -->
        <link rel="apple-touch-icon" href="{{ asset('images/tetris-white-bg.png') }}">
        <link rel="apple-touch-icon" sizes="152x152" href="{{ asset('images/tetris-white-bg.png') }}">
        <link rel="apple-touch-icon" sizes="167x167" href="{{ asset('images/tetris-white-bg.png') }}">
        <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('images/tetris-white-bg.png') }}">
        
        <!-- iOS web app meta tags -->
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="{{ config('app.name', 'Laravel') }}">
        
        <!-- PWA manifest -->
        @if(in_array(request()->route()->getName(), ['community.member', 'member.short']))
            <link rel="manifest" href="{{ asset('manifest/member/' . request()->route('identifier') . '.json') }}">
        @elseif(request()->route()->getName() === 'content-creator.public')
            <link rel="manifest" href="{{ asset('manifest/content/' . request()->route('slug') . '.json') }}">
        @else
            <link rel="manifest" href="{{ asset('manifest.json') }}">
        @endif
        
        <!-- Theme color for Safari -->
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)">
        
        <!-- Splash screen for iOS -->
        <link href="{{ asset('images/tetris-white-bg.png') }}" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" rel="apple-touch-startup-image">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead

        <script>
            // Inject API configuration
            window.config = {
                api: {
                    url: '{{ config('api.url') }}',
                    token: '{{ config('api.token') }}'
                }
            };

            // Check user's theme preference first, then fall back to system preference
            const userTheme = localStorage.getItem('sakto-theme');
            if (userTheme === 'light') {
                document.documentElement.classList.remove('dark');
            } else if (userTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                // Fall back to system preference for 'system' theme or no preference
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }

            // Watch for system theme changes
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                if (e.matches) {
                    document.documentElement.classList.add('dark')
                } else {
                    document.documentElement.classList.remove('dark')
                }
                updateFavicon();
            });

            // Add this script to handle favicon color scheme
            function updateFavicon() {
                const isDark = document.documentElement.classList.contains('dark');
                const favicon = document.querySelector('link[rel="icon"]');
                favicon.href = isDark ? '{{ asset('images/sakto-white.svg') }}' : '{{ asset('images/sakto.svg') }}';
            }

            // Initial update
            updateFavicon();

            // Watch for theme changes
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'class') {
                        updateFavicon();
                    }
                });
            });

            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['class']
            });
        </script>
    </head>
    <body class="font-sans antialiased overflow-x-hidden">
        @inertia
    </body>
</html>

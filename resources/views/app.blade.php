<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="overflow-x-hidden overscroll-y-none">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>
            @php
                use Illuminate\Support\Str;

                $routeName = request()->route()->getName();
                $title = config('app.name', 'Neulify');

                $host = request()->getHost();
                $primaryHost = parse_url(config('app.url'), PHP_URL_HOST) ?: $host;

                if ($host !== $primaryHost && Str::endsWith($host, $primaryHost)) {
                    $subdomain = Str::before($host, '.' . $primaryHost);
                    if ($subdomain && $subdomain !== 'www') {
                        $member = \App\Models\User::where('project_identifier', 'community')
                            ->where(function ($query) use ($subdomain) {
                                $query->where('slug', $subdomain)->orWhere('identifier', $subdomain);
                            })
                            ->first();

                        if ($member) {
                            $title = $member->name;
                        }
                    }
                } elseif (in_array($routeName, ['community.member', 'member.short'])) {
                    $identifier = request()->route('identifier');
                    if ($identifier) {
                        $member = \App\Models\User::where('project_identifier', 'community')
                            ->where(function ($query) use ($identifier) {
                                if (is_numeric($identifier)) {
                                    $query->where('id', $identifier);
                                } else {
                                    $query->where('slug', $identifier)->orWhere('identifier', $identifier);
                                }
                            })
                            ->first();

                        if ($member) {
                            $title = $member->name;
                        }
                    }
                }

                $manifestStartPath = request()->getRequestUri();
                $manifestParams = ['start' => $manifestStartPath];

            @endphp
            {{ $title }}
        </title>

        <!-- Add these lines for favicon support -->
        <link rel="icon" type="image/png" href="{{ asset('images/neulify-logo-app-icon.png') }}" media="(prefers-color-scheme: light)">
        <link rel="icon" type="imag/png" href="{{ asset('images/neulify-logo-app-icon.png') }}" media="(prefers-color-scheme: dark)">

        <!-- iOS home screen icons -->
        <link rel="apple-touch-icon" href="{{ asset('images/neulify-logo-app-icon.png') }}">
        <link rel="apple-touch-icon" sizes="152x152" href="{{ asset('images/neulify-logo-app-icon.png') }}">
        <link rel="apple-touch-icon" sizes="167x167" href="{{ asset('images/neulify-logo-app-icon.png') }}">
        <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('images/neulify-logo-app-icon.png') }}">
        
        <!-- iOS web app meta tags -->
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="{{ config('app.name', 'Laravel') }}">
        
        <!-- PWA manifest -->
        <link rel="manifest" href="{{ route('manifest', $manifestParams) }}">
        
        <!-- Theme color for Safari -->
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)">
        
        <!-- Splash screen for iOS -->
        <link href="{{ asset('images/neulify-logo.png') }}" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" rel="apple-touch-startup-image">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Google Maps API - Commented out since we're using OpenStreetMap -->
        <!-- <script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places"></script> -->
        
        <!-- Leaflet CSS -->
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" 
              integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==" 
              crossorigin=""/>

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
            const userTheme = localStorage.getItem('neulify-theme');
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
                favicon.href = isDark ? '{{ asset('images/neulify-logo.png') }}' : '{{ asset('images/neulify-logo.png') }}';
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
    <body class="font-sans antialiased overflow-x-hidden overscroll-y-none">
        @inertia
    </body>
</html>

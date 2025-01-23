<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Add these lines for favicon support -->
        <link rel="icon" type="image/svg+xml" href="{{ asset('images/sakto.svg') }}" media="(prefers-color-scheme: light)">
        <link rel="icon" type="image/svg+xml" href="{{ asset('images/sakto-white.svg') }}" media="(prefers-color-scheme: dark)">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead

        <script>
            // Check system dark mode preference and set class accordingly
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
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
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>

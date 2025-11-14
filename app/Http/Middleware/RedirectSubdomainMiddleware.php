<?php

namespace App\Http\Middleware;

use App\Models\SubdomainRedirect;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class RedirectSubdomainMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
    {
        $host = $request->getHost();
        $primaryHost = $this->resolvePrimaryHost($request);

        if (!$primaryHost || $host === $primaryHost) {
            return $next($request);
        }

        if (!str_ends_with($host, $primaryHost)) {
            return $next($request);
        }

        $subdomain = rtrim(
            substr($host, 0, -strlen($primaryHost)),
            '.'
        );

        if ($subdomain === '' || $subdomain === 'www') {
            return $next($request);
        }

        $redirect = Cache::remember(
            "subdomain_redirect:{$subdomain}",
            now()->addMinutes(5),
            fn () => SubdomainRedirect::query()
                ->active()
                ->where('subdomain', $subdomain)
                ->first()
        );

        if (!$redirect) {
            return $next($request);
        }

        $destination = $this->buildDestinationUrl(
            $redirect->destination_url,
            $request,
            $primaryHost
        );

        return redirect()->to($destination, $redirect->http_status ?? 302);
    }

    protected function resolvePrimaryHost(Request $request): ?string
    {
        $appUrl = config('app.url');

        if ($appUrl) {
            $host = parse_url($appUrl, PHP_URL_HOST);
            if ($host) {
                return ltrim($host, '.');
            }
        }

        return $request->getHost();
    }

    protected function buildDestinationUrl(
        string $destination,
        Request $request,
        string $primaryHost
    ): string {
        if (preg_match('/^https?:\/\//i', $destination)) {
            return $destination;
        }

        $scheme = $request->getScheme();

        return sprintf(
            '%s://%s/%s',
            $scheme,
            $primaryHost,
            ltrim($destination, '/')
        );
    }
}


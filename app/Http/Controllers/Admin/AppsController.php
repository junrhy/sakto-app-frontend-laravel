<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Cache;

class AppsController extends Controller
{
    public function index()
    {
        $apps = config('apps');
        
        return Inertia::render('Admin/Apps/Index', [
            'apps' => $apps
        ]);
    }

    public function create()
    {
        $subscriptionPlans = SubscriptionPlan::where('is_active', true)
            ->with('project:id,name,identifier')
            ->orderBy('price')
            ->get(['id', 'name', 'slug', 'price', 'duration_in_days', 'project_id']);
            
        return Inertia::render('Admin/Apps/Create', [
            'subscriptionPlans' => $subscriptionPlans
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'route' => 'required|string|max:255',
            'visible' => 'boolean',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'categories' => 'required|array',
            'categories.*' => 'string',
            'comingSoon' => 'boolean',
            'pricingType' => 'required|in:free,one-time,subscription',
            'includedInPlans' => 'array',
            'includedInPlans.*' => 'string',
            'bgColor' => 'required|string',
            'rating' => 'required|numeric|min:0|max:5',
        ]);

        $apps = config('apps');
        $apps[] = $validated;
        
        $this->updateConfigFile($apps);
        
        // Clear config cache
        Cache::forget('config_apps');
        
        return redirect()->route('admin.apps.index')
            ->with('success', 'App created successfully.');
    }

    public function edit($index)
    {
        $apps = config('apps');
        
        if (!isset($apps[$index])) {
            return redirect()->route('admin.apps.index')
                ->with('error', 'App not found.');
        }
        
        $subscriptionPlans = SubscriptionPlan::where('is_active', true)
            ->with('project:id,name,identifier')
            ->orderBy('price')
            ->get(['id', 'name', 'slug', 'price', 'duration_in_days', 'project_id']);
        
        return Inertia::render('Admin/Apps/Edit', [
            'app' => $apps[$index],
            'index' => $index,
            'subscriptionPlans' => $subscriptionPlans
        ]);
    }

    public function update(Request $request, $index)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'route' => 'required|string|max:255',
            'visible' => 'boolean',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'categories' => 'required|array',
            'categories.*' => 'string',
            'comingSoon' => 'boolean',
            'pricingType' => 'required|in:free,one-time,subscription',
            'includedInPlans' => 'array',
            'includedInPlans.*' => 'string',
            'bgColor' => 'required|string',
            'rating' => 'required|numeric|min:0|max:5',
        ]);

        $apps = config('apps');
        
        if (!isset($apps[$index])) {
            return redirect()->route('admin.apps.index')
                ->with('error', 'App not found.');
        }
        
        $apps[$index] = $validated;
        
        $this->updateConfigFile($apps);
        
        // Clear config cache
        Cache::forget('config_apps');
        
        return redirect()->route('admin.apps.index')
            ->with('success', 'App updated successfully.');
    }

    public function destroy($index)
    {
        $apps = config('apps');
        
        if (!isset($apps[$index])) {
            return redirect()->route('admin.apps.index')
                ->with('error', 'App not found.');
        }
        
        array_splice($apps, $index, 1);
        
        $this->updateConfigFile($apps);
        
        // Clear config cache
        Cache::forget('config_apps');
        
        return redirect()->route('admin.apps.index')
            ->with('success', 'App deleted successfully.');
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'order' => 'required|array',
            'order.*' => 'integer|min:0',
        ]);

        $apps = config('apps');
        $newOrder = [];
        
        foreach ($validated['order'] as $newIndex => $oldIndex) {
            if (isset($apps[$oldIndex])) {
                $newOrder[] = $apps[$oldIndex];
            }
        }
        
        $this->updateConfigFile($newOrder);
        
        // Clear config cache
        Cache::forget('config_apps');
        
        return response()->json(['success' => true]);
    }

    private function updateConfigFile($apps)
    {
        $configPath = config_path('apps.php');
        
        // Generate the PHP array content
        $content = "<?php\n\nreturn [\n";
        
        foreach ($apps as $app) {
            $content .= "    [\n";
            $content .= "        'title' => '" . addslashes($app['title']) . "',\n";
            $content .= "        'route' => '" . addslashes($app['route']) . "',\n";
            $content .= "        'visible' => " . ($app['visible'] ? 'true' : 'false') . ",\n";
            $content .= "        'description' => '" . addslashes($app['description']) . "',\n";
            $content .= "        'price' => " . $app['price'] . ",\n";
            $content .= "        'categories' => [" . implode(', ', array_map(function($cat) { return "'" . addslashes($cat) . "'"; }, $app['categories'])) . "],\n";
            $content .= "        'comingSoon' => " . ($app['comingSoon'] ? 'true' : 'false') . ",\n";
            $content .= "        'pricingType' => '" . addslashes($app['pricingType']) . "',\n";
            $content .= "        'includedInPlans' => [" . implode(', ', array_map(function($plan) { return "'" . addslashes($plan) . "'"; }, $app['includedInPlans'] ?? [])) . "],\n";
            $content .= "        'bgColor' => '" . addslashes($app['bgColor']) . "',\n";
            $content .= "        'rating' => " . $app['rating'] . "\n";
            $content .= "    ],\n";
        }
        
        $content .= "];\n";
        
        // Write to file
        try {
            File::put($configPath, $content);
            
            // Clear OPcache for this specific file if OPcache is enabled
            if (function_exists('opcache_invalidate')) {
                opcache_invalidate($configPath, true);
            }
            
            // Clear OPcache completely if the above doesn't work
            if (function_exists('opcache_reset')) {
                opcache_reset();
            }
        } catch (\Exception $e) {
            \Log::error('Failed to update apps.php config file: ' . $e->getMessage());
            throw new \Exception('Failed to update apps configuration. Please check file permissions.');
        }
    }
}

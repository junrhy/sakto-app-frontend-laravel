<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Project;
use App\Models\Module;
use App\Models\UserApp;
use App\Services\AppBillingService;

class AppsController extends Controller
{
    protected $billingService;

    public function __construct(AppBillingService $billingService)
    {
        $this->billingService = $billingService;
    }
    public function index()
    {
        $appCurrency = json_decode(auth()->user()->app_currency);
        $project = Project::where('identifier', auth()->user()->project_identifier)->first();

        // Ensure enabledModules is properly cast as array
        $enabledModules = [];
        if ($project) {
            $enabledModules = is_array($project->enabledModules) 
                ? $project->enabledModules 
                : (is_string($project->enabledModules) ? json_decode($project->enabledModules, true) : []);
        }

        return Inertia::render('Apps', [
            'enabledModules' => $enabledModules
        ]);
    }

    public function getApps()
    {
        $project = Project::where('identifier', auth()->user()->project_identifier)->first();
        
        // Ensure enabledModules is properly cast as array
        $enabledModules = [];
        if ($project) {
            $enabledModules = is_array($project->enabledModules) 
                ? $project->enabledModules 
                : (is_string($project->enabledModules) ? json_decode($project->enabledModules, true) : []);
        }
        
        // Get user-added apps with payment status
        $userAddedAppsData = UserApp::forUser(auth()->user()->identifier)
            ->select('module_identifier', 'payment_status', 'billing_type', 'next_billing_date', 'cancelled_at', 'auto_renew')
            ->get()
            ->keyBy('module_identifier');
        
        $userAddedApps = $userAddedAppsData
            ->where('payment_status', UserApp::STATUS_PAID)
            ->where('cancelled_at', null)  // Exclude cancelled subscriptions
            ->keys()
            ->toArray();
        
        // Get ALL apps from database (not just active ones)
        $apps = Module::ordered()
            ->get()
            ->map(function ($module) use ($enabledModules, $userAddedApps, $userAddedAppsData) {
                $isInSubscription = in_array($module->identifier, $enabledModules);
                $isUserAdded = in_array($module->identifier, $userAddedApps);
                $userAppData = $userAddedAppsData->get($module->identifier);
                
                return [
                    'id' => $module->id,
                    'identifier' => $module->identifier,
                    'title' => $module->title,
                    'route' => $module->route,
                    'visible' => $module->visible,
                    'description' => $module->description,
                    'price' => (float) $module->price, // Ensure price is returned as float for frontend
                    'categories' => $module->categories,
                    'comingSoon' => $module->coming_soon,
                    'pricingType' => $module->pricing_type,
                    'includedInPlans' => $module->included_in_plans,
                    'bgColor' => $module->bg_color,
                    'icon' => $module->icon,
                    'rating' => (float) $module->rating, // Ensure rating is also returned as float
                    'isInSubscription' => $isInSubscription,
                    'isUserAdded' => $isUserAdded,
                    'isAvailable' => $isInSubscription || $isUserAdded,
                    'paymentStatus' => $userAppData ? $userAppData->payment_status : null,
                    'billingType' => $userAppData ? $userAppData->billing_type : null,
                    'nextBillingDate' => $userAppData ? $userAppData->next_billing_date : null,
                    'cancelledAt' => $userAppData ? $userAppData->cancelled_at : null,
                    'autoRenew' => $userAppData ? (bool) $userAppData->auto_renew : false,
                ];
            })
            ->toArray();
        
        return response()->json([
            'apps' => $apps,
            'enabledModules' => $enabledModules,
            'userAddedApps' => $userAddedApps
        ]);
    }

    public function addApp(Request $request)
    {
        $validated = $request->validate([
            'module_identifier' => 'required|string|exists:modules,identifier',
            'payment_method' => 'required|string|in:credits',
            'auto_renew' => 'boolean',
        ]);

        $user = auth()->user();
        $moduleIdentifier = $validated['module_identifier'];

        // Get the module to check if it exists and get its details
        $module = Module::where('identifier', $moduleIdentifier)->first();
        
        if (!$module) {
            return response()->json([
                'message' => 'Module not found'
            ], 404);
        }

        // Check if user already has this app (and it's not cancelled)
        $existingUserApp = UserApp::forUser($user->identifier)
            ->forModule($moduleIdentifier)
            ->where('cancelled_at', null)  // Only check non-cancelled apps
            ->first();

        if ($existingUserApp) {
            return response()->json([
                'message' => 'App already added to your collection'
            ], 400);
        }

        // Check if there's a cancelled subscription that we can reactivate
        $cancelledUserApp = UserApp::forUser($user->identifier)
            ->forModule($moduleIdentifier)
            ->whereNotNull('cancelled_at')
            ->first();

        // Check if the app is coming soon
        if ($module->coming_soon) {
            return response()->json([
                'message' => 'This app is coming soon and cannot be added yet'
            ], 400);
        }

        // Handle free apps
        if ($module->pricing_type === 'free' || $module->price == 0) {
            UserApp::create([
                'user_identifier' => $user->identifier,
                'module_identifier' => $moduleIdentifier,
                'billing_type' => UserApp::BILLING_FREE,
                'payment_status' => UserApp::STATUS_PAID,
            ]);

            return response()->json([
                'message' => 'Free app added successfully',
                'app' => [
                    'title' => $module->title,
                    'price' => (float) $module->price,
                    'pricingType' => $module->pricing_type
                ]
            ]);
        }

        // Process paid app purchase
        $paymentData = [
            'auto_renew' => $validated['auto_renew'] ?? true,
        ];

        // If there's a cancelled subscription, reactivate it instead of creating a new one
        if ($cancelledUserApp) {
            $result = $this->billingService->reactivateAppSubscription(
                $user,
                $module,
                $validated['payment_method'],
                $paymentData,
                $cancelledUserApp
            );
        } else {
            $result = $this->billingService->processAppPurchase(
                $user,
                $module,
                $validated['payment_method'],
                $paymentData
            );
        }

        if ($result['success']) {
            return response()->json([
                'message' => $result['message'],
                'app' => [
                    'title' => $module->title,
                    'price' => (float) $module->price,
                    'pricingType' => $module->pricing_type
                ],
                'invoice' => [
                    'id' => $result['invoice']->id,
                    'invoice_number' => $result['invoice']->invoice_number,
                    'total_amount' => $result['invoice']->total_amount,
                ]
            ]);
        } else {
            return response()->json([
                'message' => $result['message']
            ], 400);
        }
    }

    public function removeApp(Request $request)
    {
        $validated = $request->validate([
            'module_identifier' => 'required|string|exists:modules,identifier'
        ]);

        $userIdentifier = auth()->user()->identifier;
        $moduleIdentifier = $validated['module_identifier'];

        // Get the module to return its details
        $module = Module::where('identifier', $moduleIdentifier)->first();

        // Remove the app from user's collection
        $deleted = UserApp::forUser($userIdentifier)
            ->forModule($moduleIdentifier)
            ->delete();

        if ($deleted) {
            return response()->json([
                'message' => 'App removed successfully',
                'app' => $module ? [
                    'title' => $module->title,
                    'price' => (float) $module->price,
                    'pricingType' => $module->pricing_type
                ] : null
            ]);
        } else {
            return response()->json([
                'message' => 'App not found in your collection'
            ], 404);
        }
    }

    /**
     * Get user's billing history.
     */
    public function getBillingHistory(Request $request)
    {
        $user = auth()->user();
        $limit = $request->get('limit', 20);
        
        $billingHistory = $this->billingService->getUserBillingHistory($user->identifier, $limit);
        
        return response()->json([
            'billing_history' => $billingHistory
        ]);
    }

    /**
     * Add multiple apps in a single checkout.
     */
    public function addMultipleApps(Request $request)
    {
        $validated = $request->validate([
            'module_identifiers' => 'required|array|min:1',
            'module_identifiers.*' => 'required|string|exists:modules,identifier',
            'payment_method' => 'required|string|in:credits',
            'auto_renew' => 'boolean',
        ]);

        $user = auth()->user();
        $moduleIdentifiers = $validated['module_identifiers'];

        // Get all modules to check if they exist and get their details
        $modules = Module::whereIn('identifier', $moduleIdentifiers)->get();
        
        if ($modules->count() !== count($moduleIdentifiers)) {
            return response()->json([
                'message' => 'One or more modules not found'
            ], 404);
        }

        // Check for any coming soon apps
        $comingSoonModules = $modules->where('coming_soon', true);
        if ($comingSoonModules->count() > 0) {
            return response()->json([
                'message' => 'One or more apps are coming soon and cannot be added yet: ' . $comingSoonModules->pluck('title')->join(', ')
            ], 400);
        }

        // Check if user already has any of these apps (and they're not cancelled)
        $existingUserApps = UserApp::forUser($user->identifier)
            ->whereIn('module_identifier', $moduleIdentifiers)
            ->where('cancelled_at', null)
            ->get();

        if ($existingUserApps->count() > 0) {
            $existingTitles = $existingUserApps->pluck('module_identifier')->map(function($identifier) use ($modules) {
                return $modules->where('identifier', $identifier)->first()->title ?? $identifier;
            })->join(', ');
            
            return response()->json([
                'message' => 'You already have these apps in your collection: ' . $existingTitles
            ], 400);
        }

        // Separate free and paid apps
        $freeModules = $modules->where('pricing_type', 'free')->where('price', 0);
        $paidModules = $modules->where('pricing_type', '!=', 'free')->where('price', '>', 0);

        $results = [
            'free_apps' => [],
            'paid_apps' => [],
            'invoice' => null,
            'total_amount' => 0
        ];

        // Handle free apps first
        foreach ($freeModules as $module) {
            UserApp::create([
                'user_identifier' => $user->identifier,
                'module_identifier' => $module->identifier,
                'billing_type' => UserApp::BILLING_FREE,
                'payment_status' => UserApp::STATUS_PAID,
            ]);

            $results['free_apps'][] = [
                'title' => $module->title,
                'price' => (float) $module->price,
                'pricingType' => $module->pricing_type
            ];
        }

        // Handle paid apps if any
        if ($paidModules->count() > 0) {
            $paymentData = [
                'auto_renew' => $validated['auto_renew'] ?? true,
            ];

            $result = $this->billingService->processMultipleAppPurchase(
                $user,
                $paidModules,
                $validated['payment_method'],
                $paymentData
            );

            if ($result['success']) {
                $results['paid_apps'] = $result['apps'];
                $results['invoice'] = [
                    'id' => $result['invoice']->id,
                    'invoice_number' => $result['invoice']->invoice_number,
                    'total_amount' => $result['invoice']->total_amount,
                ];
                $results['total_amount'] = $result['invoice']->total_amount;
            } else {
                return response()->json([
                    'message' => $result['message']
                ], 400);
            }
        }

        $totalApps = count($results['free_apps']) + count($results['paid_apps']);
        $message = "Successfully added {$totalApps} app(s) to your collection";
        if (count($results['free_apps']) > 0 && count($results['paid_apps']) > 0) {
            $freeCount = count($results['free_apps']);
            $paidCount = count($results['paid_apps']);
            $message .= " ({$freeCount} free, {$paidCount} paid)";
        }

        return response()->json([
            'message' => $message,
            'results' => $results
        ]);
    }

    /**
     * Toggle auto-renew for app subscription.
     */
    public function toggleAutoRenew(Request $request)
    {
        $validated = $request->validate([
            'module_identifier' => 'required|string|exists:modules,identifier',
            'auto_renew' => 'required|boolean',
        ]);

        $user = auth()->user();
        $moduleIdentifier = $validated['module_identifier'];
        $autoRenew = $validated['auto_renew'];

        $userApp = UserApp::forUser($user->identifier)
            ->forModule($moduleIdentifier)
            ->where('billing_type', UserApp::BILLING_SUBSCRIPTION)
            ->where('payment_status', UserApp::STATUS_PAID)
            ->where('cancelled_at', null)
            ->first();

        if (!$userApp) {
            return response()->json([
                'message' => 'Active app subscription not found'
            ], 404);
        }

        $userApp->update(['auto_renew' => $autoRenew]);

        return response()->json([
            'message' => $autoRenew ? 'Auto-renew enabled successfully' : 'Auto-renew disabled successfully',
            'auto_renew' => $autoRenew
        ]);
    }

    /**
     * Cancel app subscription.
     */
    public function cancelAppSubscription(Request $request)
    {
        $validated = $request->validate([
            'module_identifier' => 'required|string|exists:modules,identifier',
            'reason' => 'nullable|string|max:500',
        ]);

        $user = auth()->user();
        $moduleIdentifier = $validated['module_identifier'];

        $userApp = UserApp::forUser($user->identifier)
            ->forModule($moduleIdentifier)
            ->where('billing_type', UserApp::BILLING_SUBSCRIPTION)
            ->first();

        if (!$userApp) {
            return response()->json([
                'message' => 'App subscription not found'
            ], 404);
        }

        if ($userApp->cancelled_at) {
            return response()->json([
                'message' => 'App subscription is already cancelled'
            ], 400);
        }

        $userApp->cancel($validated['reason'] ?? null);

        return response()->json([
            'message' => 'App subscription cancelled successfully'
        ]);
    }
} 
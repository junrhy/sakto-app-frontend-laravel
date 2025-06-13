<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ClinicController;
use App\Http\Controllers\PosRetailController;
use App\Http\Controllers\PosRetailSaleController;
use App\Http\Controllers\PosRestaurantController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\WarehousingController;
use App\Http\Controllers\TransportationController;
use App\Http\Controllers\RentalItemController;
use App\Http\Controllers\RentalPropertyController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\TravelController;
use App\Http\Controllers\HelpController;
use App\Http\Controllers\WidgetController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\FlightController;
use App\Http\Controllers\SmsTwilioController;
use App\Http\Controllers\SmsSemaphoreController;
use App\Http\Controllers\EmailController;
use App\Http\Controllers\ContactsController;
use App\Http\Controllers\CreditsController;
use App\Http\Controllers\GenealogyController;
use App\Http\Controllers\InboxController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\MayaWebhookController;
use App\Http\Controllers\EmailTemplateController;
use App\Http\Controllers\AppsController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\ChallengeController;
use App\Http\Controllers\ContentCreatorController;
use App\Http\Controllers\DigitalProductController;
use App\Http\Controllers\PagesController;
use App\Http\Controllers\HealthInsuranceController;
use App\Http\Controllers\LandingController;

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

// Public routes
Route::group(['middleware' => ['web']], function () {
    // Welcome and Policy Routes
    Route::get('/landing', [LandingController::class, 'index'])->name('landing');
    Route::get('/shop', [LandingController::class, 'shop'])->name('shop');
    Route::get('/delivery', [LandingController::class, 'delivery'])->name('delivery');
    Route::get('/jobs', [LandingController::class, 'jobs'])->name('jobs');
    Route::get('/community', [LandingController::class, 'community'])->name('community');
    Route::get('/community/member/{id}', [LandingController::class, 'communityMember'])->name('community.member');
    Route::get('/logistics', [LandingController::class, 'logistics'])->name('logistics');

    Route::get('/', function (Request $request) {
        $host = $request->getHost();
        $path = $request->path();
        
        // Check for shop, delivery, or jobs in host or path
        if (stripos($host, 'shop') !== false || stripos($path, 'shop') !== false) {
            return redirect()->route('shop');   
        } elseif (stripos($host, 'delivery') !== false || stripos($path, 'delivery') !== false) {
            return redirect()->route('delivery');
        } elseif (stripos($host, 'jobs') !== false || stripos($path, 'jobs') !== false) {
            return redirect()->route('jobs');
        } elseif (stripos($host, 'community') !== false || stripos($path, 'community') !== false) {
            return redirect()->route('community');
        } elseif (stripos($host, 'logistics') !== false || stripos($path, 'logistics') !== false) {
            return redirect()->route('logistics');
        }
        
        // Default welcome page
        return redirect()->route('landing');
    });

    Route::get('/pricing', function () {
        return Inertia::render('Pricing', [
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    })->name('pricing');

    Route::get('/features', function () {
        return Inertia::render('Features', [
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    })->name('features');

    // Policy Routes
    Route::prefix('policies')->group(function () {
        Route::get('/privacy', function () { return Inertia::render('PrivacyPolicy'); })->name('privacy-policy');
        Route::get('/terms', function () { return Inertia::render('TermsAndConditions'); })->name('terms-and-conditions');
        Route::get('/cookies', function () { return Inertia::render('CookiePolicy'); })->name('cookie-policy');
        Route::get('/faq', function () { return Inertia::render('FAQ'); })->name('faq');
    });

    // Google Auth Routes
    Route::prefix('auth/google')->group(function () {
        Route::get('/', [GoogleController::class, 'redirect'])->name('google.redirect');
        Route::get('/callback', [GoogleController::class, 'callback'])->name('google.callback');
        Route::post('/register', [GoogleController::class, 'register'])->name('google.register');
    });

    // Public Contact Routes
    Route::prefix('contacts')->group(function () {
        Route::get('/self-registration', [ContactsController::class, 'selfRegistration'])->name('contacts.self-registration');
        Route::post('/store-self', [ContactsController::class, 'storeSelf'])->name('contacts.store-self');
        Route::get('/{id}/public', [ContactsController::class, 'publicProfile'])->name('contacts.public-profile');
        Route::get('/list', [ContactsController::class, 'getContacts'])->name('contacts.list');
    });

    // Public Genealogy Routes
    Route::prefix('genealogy/{clientIdentifier}')->group(function () {
        Route::get('/full-view', [GenealogyController::class, 'fullView'])->name('genealogy.full-view');
        Route::post('/request-edit', [GenealogyController::class, 'requestEdit'])->name('genealogy.request-edit');
        Route::get('/all-members', [GenealogyController::class, 'getAllMembers'])->name('genealogy.all-members');
        Route::get('/member/{memberId}', [GenealogyController::class, 'memberProfile'])->name('genealogy.member-profile');
        Route::get('/circular', [GenealogyController::class, 'circularView'])->name('genealogy.circular');
        Route::get('/printable', [GenealogyController::class, 'printableView'])->name('genealogy.printable');
        Route::get('/members', [GenealogyController::class, 'familyMemberFullView'])->name('genealogy.members');
        Route::get('/settings', [GenealogyController::class, 'getPublicSettings'])->name('genealogy.public-settings');
    });

    // Public Event Registration Routes
    Route::get('/events/{id}/public-register', [EventController::class, 'publicRegister'])->name('events.public-register');
    Route::post('/events/{id}/public-register', [EventController::class, 'publicRegisterParticipant'])->name('events.public-register.store');
    Route::get('/events/{id}/public', [EventController::class, 'publicShow'])->name('events.public-show');

    // Maya Webhook Route - exclude from CSRF protection
    Route::post('/webhooks/maya', [MayaWebhookController::class, 'handleWebhook'])
        ->name('webhooks.maya')
        ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);

    // Pages
    Route::get('/link/{slug}', [PagesController::class, 'getPage'])->name('pages.public');
    Route::get('/api/pages/{slug}', [PagesController::class, 'getPageBySlug'])->name('api.pages.get-by-slug');

    // Health Insurance Public Routes
    Route::get('/health-insurance/members/{id}/public', [HealthInsuranceController::class, 'showMember'])->name('health-insurance.members.show.public');
});

// Admin Auth Routes
Route::get('/admin/login', [App\Http\Controllers\Admin\AuthController::class, 'showLoginForm'])->name('admin.login');
Route::post('/admin/login', [App\Http\Controllers\Admin\AuthController::class, 'login'])->name('admin.login.attempt');
Route::post('/admin/logout', [App\Http\Controllers\Admin\AuthController::class, 'logout'])->name('admin.logout');

// Routes that require authentication but not subscription
Route::middleware(['auth', 'verified'])->group(function () {
    // Core features
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::patch('/profile/currency', [ProfileController::class, 'updateCurrency'])->name('profile.currency');
    Route::patch('/profile/theme', [ProfileController::class, 'updateTheme'])->name('profile.theme');
    Route::patch('/profile/color', [ProfileController::class, 'updateColor'])->name('profile.color');
    Route::post('/profile/addresses', [ProfileController::class, 'updateAddresses'])->name('profile.addresses.update');
    
    // Apps and Dashboard
    Route::get('/apps', [AppsController::class, 'index'])->name('apps');
    Route::get('/api/apps', [AppsController::class, 'getApps'])->name('api.apps');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboards', [DashboardController::class, 'gallery'])->name('dashboard.gallery');
    Route::post('/dashboard', [DashboardController::class, 'store'])->name('dashboard.store');
    Route::post('/dashboard/{dashboard}/set-default', [DashboardController::class, 'setDefault'])->name('dashboard.set-default');
    Route::post('/dashboard/{dashboard}/toggle-star', [DashboardController::class, 'toggleStar'])->name('dashboard.toggle-star');
    Route::delete('/dashboard/{dashboard}', [DashboardController::class, 'destroy'])->name('dashboard.destroy');
    Route::patch('/dashboard/{dashboard}', [DashboardController::class, 'update'])->name('dashboard.update');
    Route::get('/dashboard/{dashboard}/widgets', [DashboardController::class, 'getWidgets'])->name('dashboard.widgets');
    
    // Widgets
    Route::post('/widgets', [WidgetController::class, 'store'])->name('widgets.store');
    Route::delete('/widgets/{widget}', [WidgetController::class, 'destroy'])->name('widgets.destroy');
    Route::patch('/widgets/{widget}', [WidgetController::class, 'update'])->name('widgets.update');
    Route::patch('/widgets/{widget}/reorder', [WidgetController::class, 'reorder'])->name('widgets.reorder');
    
    // Free Apps (based on config/apps.php)
    // POS Retail
    Route::get('/pos-retail', [PosRetailController::class, 'index'])->name('pos-retail');
    Route::post('/pos-retail', [PosRetailController::class, 'store']);
    Route::put('/pos-retail/{id}', [PosRetailController::class, 'update']);
    Route::delete('/pos-retail/{id}', [PosRetailController::class, 'destroy']);
    Route::get('/retail-sale', [PosRetailSaleController::class, 'index'])->name('retail-sale');
    Route::delete('/retail-sale/{id}', [PosRetailSaleController::class, 'destroy'])->name('sales.destroy');
    Route::delete('/retail-sales/bulk-delete', [PosRetailSaleController::class, 'bulkDelete'])->name('sales.bulk-delete');
    Route::get('/retail-sale-overview', [PosRetailSaleController::class, 'getSalesOverview']);
    
    // Restaurant Management
    Route::get('/pos-restaurant', [PosRestaurantController::class, 'index'])->name('pos-restaurant');
    Route::get('/pos-restaurant/settings', [PosRestaurantController::class, 'settings'])->name('pos-restaurant.settings');
    Route::post('/pos-restaurant/settings', [PosRestaurantController::class, 'saveSettings'])->name('pos-restaurant.settings.save');
    Route::prefix('pos-restaurant')->group(function () {
        Route::get('/menu-items', [PosRestaurantController::class, 'getMenuItems']);
        Route::post('/menu-items', [PosRestaurantController::class, 'storeMenuItem']);
        Route::put('/menu-item/{id}', [PosRestaurantController::class, 'updateMenuItem']);
        Route::delete('/menu-item/{id}', [PosRestaurantController::class, 'destroyMenuItem']);
        Route::post('/menu-items/bulk-destroy', [PosRestaurantController::class, 'bulkDestroyMenuItem']);
        Route::get('/tables', [PosRestaurantController::class, 'getTables']);
        Route::post('/tables', [PosRestaurantController::class, 'storeTable']);
        Route::put('/table/{id}', [PosRestaurantController::class, 'updateTable']);
        Route::delete('/table/{id}', [PosRestaurantController::class, 'destroyTable']);
        Route::get('/tables/joined', [PosRestaurantController::class, 'getJoinedTables'])->name('pos-restaurant.tables.joined');
        Route::post('/tables/join', [PosRestaurantController::class, 'joinTables'])->name('pos-restaurant.tables.join');
        Route::post('/tables/unjoin', [PosRestaurantController::class, 'unjoinTables'])->name('pos-restaurant.tables.unjoin');
        Route::get('/tables-overview', [PosRestaurantController::class, 'getTablesOverview']);
        Route::post('/kitchen-order', [PosRestaurantController::class, 'storeKitchenOrder']);
        Route::get('/current-order/{tableNumber}', [PosRestaurantController::class, 'getCurrentOrder']);
        Route::post('/orders/add-item', [PosRestaurantController::class, 'addItemToOrder'])->name('pos-restaurant.add-item-to-order');
        Route::delete('/current-order/{table}/item/{id}', [PosRestaurantController::class, 'removeOrderItem'])->name('pos-restaurant.remove-order-item');
        Route::post('/orders/complete', [PosRestaurantController::class, 'completeOrder'])->name('pos-restaurant.complete-order');
        Route::get('/kitchen-orders/overview', [PosRestaurantController::class, 'getKitchenOrdersOverview']);
        Route::get('/reservations', [PosRestaurantController::class, 'getReservations']);
        Route::post('/reservations', [PosRestaurantController::class, 'storeReservation']);
        Route::delete('/reservations/{id}', [PosRestaurantController::class, 'destroyReservation']);
        Route::get('/reservations-overview', [PosRestaurantController::class, 'getReservationsOverview']);
    });
    
    // Lending
    Route::prefix('loan')->group(function () {
        Route::get('/', [LoanController::class, 'index'])->name('loan');
        Route::get('/settings', [LoanController::class, 'settings'])->name('loan.settings');
        Route::post('/', [LoanController::class, 'store']);
        Route::put('/{id}', [LoanController::class, 'update']);
        Route::delete('/{id}', [LoanController::class, 'destroy']);
        Route::post('/bulk-delete', [LoanController::class, 'bulkDestroy']);
        Route::post('/{id}/payment', [LoanController::class, 'recordPayment']);
        Route::delete('/{id}/payment/{paymentId}', [LoanController::class, 'deletePayment']);
        Route::get('/bills/{id}', [LoanController::class, 'getBills']);
        Route::post('/bill/{id}', [LoanController::class, 'createBill']);
        Route::put('/bill/{id}', [LoanController::class, 'updateBill']);
        Route::delete('/bill/{id}', [LoanController::class, 'deleteBill']);
        Route::patch('/bill/{id}/status', [LoanController::class, 'updateBillStatus']);

        // CBU (Capital Build Up) Routes
        Route::prefix('cbu')->group(function () {
            Route::get('/', [LoanController::class, 'getCbuFunds'])->name('loan.cbu.index');
            Route::get('/settings', [LoanController::class, 'cbuSettings'])->name('loan.cbu.settings');
            Route::post('/', [LoanController::class, 'storeCbuFund'])->name('loan.cbu.store');
            Route::put('/{id}', [LoanController::class, 'updateCbuFund'])->name('loan.cbu.update');
            Route::delete('/{id}', [LoanController::class, 'destroyCbuFund'])->name('loan.cbu.destroy');
            Route::post('/{id}/contribution', [LoanController::class, 'addCbuContribution'])->name('loan.cbu.contribution');
            Route::get('/{id}/contributions', [LoanController::class, 'getCbuContributions'])->name('loan.cbu.contributions');
            Route::get('/{id}/withdrawals', [LoanController::class, 'getCbuWithdrawals'])->name('loan.cbu.withdrawals');
            Route::get('/{id}/dividends', [LoanController::class, 'getCbuDividends'])->name('loan.cbu.dividends');
            Route::post('/{id}/dividend', [LoanController::class, 'addCbuDividend'])->name('loan.cbu.dividend');
            Route::get('/{id}/withdraw', [LoanController::class, 'withdrawCbuFund'])->name('loan.cbu.withdraw');
            Route::post('/{id}/withdraw', [LoanController::class, 'processCbuWithdrawal'])->name('loan.cbu.withdraw.process');
            Route::get('/{id}/history', [LoanController::class, 'getCbuHistory'])->name('loan.cbu.history');
            Route::get('/report', [LoanController::class, 'generateCbuReport'])->name('loan.cbu.report');
            Route::post('/{id}/send-report', [LoanController::class, 'sendFundReportEmail'])->name('loan.cbu.send-report');
        });
    });
    
    // Rental Items
    Route::prefix('rental-item')->group(function () {
        Route::get('/', [RentalItemController::class, 'index'])->name('rental-items');
        Route::get('/settings', [RentalItemController::class, 'settings'])->name('rental-item.settings');
        Route::get('/list', [RentalItemController::class, 'getItems']);
        Route::post('/', [RentalItemController::class, 'store']);
        Route::put('/{id}', [RentalItemController::class, 'update']);
        Route::delete('/{id}', [RentalItemController::class, 'destroy']);
        Route::post('/bulk-delete', [RentalItemController::class, 'bulkDestroy']);
        Route::post('/{id}/payment', [RentalItemController::class, 'recordPayment']);
        Route::get('/{id}/payment-history', [RentalItemController::class, 'getPaymentHistory']);
    });
    
    // Payroll
    Route::prefix('payroll')->group(function () {
        Route::get('/', [PayrollController::class, 'index'])->name('payroll');
        Route::get('/settings', [PayrollController::class, 'settings'])->name('payroll.settings');
        Route::get('/list', [PayrollController::class, 'getList']);
        Route::post('/', [PayrollController::class, 'store']);
        Route::put('/{id}', [PayrollController::class, 'update']);
        Route::delete('/{id}', [PayrollController::class, 'destroy']);
        Route::delete('/bulk', [PayrollController::class, 'bulkDestroy']);
    });
    
    // Contacts
    Route::resource('contacts', ContactsController::class);
    Route::get('/contacts/settings', [ContactsController::class, 'settings'])->name('contacts.settings');
    Route::get('/contacts/list', [ContactsController::class, 'getContacts'])->name('contacts.list');
    
    // Subscription Management
    Route::get('/subscriptions', [SubscriptionController::class, 'index'])->name('subscriptions.index');
    Route::post('/subscriptions/subscribe', [SubscriptionController::class, 'subscribe'])->name('subscriptions.subscribe');
    Route::post('/subscriptions/cancel/{identifier}', [SubscriptionController::class, 'cancel'])->name('subscriptions.cancel');
    Route::get('/subscriptions/{userIdentifier}/active', [SubscriptionController::class, 'getActiveSubscription'])->name('subscriptions.active');
    Route::get('/subscriptions/payment/success', [SubscriptionController::class, 'paymentSuccess'])->name('subscriptions.payment.success');
    Route::get('/subscriptions/payment/failure', [SubscriptionController::class, 'paymentFailure'])->name('subscriptions.payment.failure');
    Route::get('/subscriptions/payment/cancel', [SubscriptionController::class, 'paymentCancel'])->name('subscriptions.payment.cancel');
    
    // Stripe payment routes
    Route::get('/subscriptions/stripe/success', [SubscriptionController::class, 'stripeSuccess'])->name('subscriptions.stripe.success');
    Route::get('/subscriptions/stripe/cancel', [SubscriptionController::class, 'stripeCancel'])->name('subscriptions.stripe.cancel');
    Route::post('/subscriptions/stripe/webhook', [SubscriptionController::class, 'stripeWebhook'])->name('subscriptions.stripe.webhook');
    
    // Credits
    Route::prefix('credits')->group(function () {
        Route::get('/buy', [CreditsController::class, 'buy'])->name('credits.buy');
        Route::get('/{clientIdentifier}/balance', [CreditsController::class, 'getBalance'])->name('credits.balance');
        Route::post('/request', [CreditsController::class, 'requestCredit'])->name('credits.request');
        Route::get('/{clientIdentifier}/history', [CreditsController::class, 'getCreditHistory'])->name('credits.history');
        Route::get('/{clientIdentifier}/spent-history', [CreditsController::class, 'getSpentCreditHistory'])->name('credits.spent-history');
        Route::post('/spend', [CreditsController::class, 'spendCredit'])->name('credits.spend');
    });

    // Home route
    Route::get('/home', function () {
        return Inertia::render('Home', [
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    })->name('home');

    // Inbox
    Route::get('/inbox', [InboxController::class, 'index'])->name('inbox');
    Route::patch('/inbox/{id}/read', [InboxController::class, 'markAsRead'])->name('inbox.mark-as-read');
    Route::delete('/inbox/{id}', [InboxController::class, 'delete'])->name('inbox.delete');

    // Travel
    Route::prefix('travel')->group(function () {
        Route::get('/', [TravelController::class, 'index'])->name('travel');
        Route::get('/packages', [TravelController::class, 'getPackages']);
        Route::post('/packages', [TravelController::class, 'storePackage']);
        Route::put('/packages/{id}', [TravelController::class, 'updatePackage']);
        Route::delete('/packages/{id}', [TravelController::class, 'deletePackage']);
        Route::get('/bookings', [TravelController::class, 'getBookings']);
        Route::post('/bookings', [TravelController::class, 'storeBooking']);
        Route::put('/bookings/{id}', [TravelController::class, 'updateBooking']);
        Route::delete('/bookings/{id}', [TravelController::class, 'deleteBooking']);
    });

    // Flight search
    Route::get('/flight-search', [FlightController::class, 'index'])->name('flight-search');
    Route::get('/flights', [FlightController::class, 'index'])->name('flights');
    Route::get('/api/flights/search-airports', [FlightController::class, 'searchAirports']);
    Route::get('/api/flights/search', [FlightController::class, 'search']);

    // Inventory
    Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory');
    Route::get('/inventory/products', [InventoryController::class, 'getProducts']);
    Route::post('/inventory', [InventoryController::class, 'store']);
    Route::put('/inventory/{id}', [InventoryController::class, 'update']);
    Route::delete('/inventory/{id}', [InventoryController::class, 'destroy']);
    Route::post('/inventory/bulk', [InventoryController::class, 'bulkDestroy']);
    Route::get('/inventory/export', [InventoryController::class, 'exportProducts']);
    Route::post('/inventory/import', [InventoryController::class, 'importProducts']);
    Route::get('/inventory/low-stock', [InventoryController::class, 'checkLowStock']);
    Route::get('/inventory/{id}/history', [InventoryController::class, 'getInventoryHistory']);
    Route::get('/inventory/{sku}/barcode', [InventoryController::class, 'generateBarcode']);
    Route::get('/inventory/products-overview', [InventoryController::class, 'getProductsOverview']);

    // Health Insurance Routes
    Route::prefix('health-insurance')->group(function () {
        Route::get('/', [HealthInsuranceController::class, 'index'])->name('health-insurance');
        
        // Member routes
        Route::get('/members/{id}', [HealthInsuranceController::class, 'showMember'])->name('health-insurance.members.show');
        Route::post('/members', [HealthInsuranceController::class, 'storeMember'])->name('health-insurance.members.store');
        Route::put('/members/{id}', [HealthInsuranceController::class, 'updateMember'])->name('health-insurance.members.update');
        Route::delete('/members/{id}', [HealthInsuranceController::class, 'deleteMember'])->name('health-insurance.members.delete');
        
        // Contributions
        Route::post('/contributions/{memberId}', [HealthInsuranceController::class, 'recordContribution'])->name('health-insurance.contributions.store');
        Route::put('/contributions/{memberId}/{contributionId}', [HealthInsuranceController::class, 'updateContribution'])->name('health-insurance.contributions.update');
        Route::get('/contributions/{memberId}', [HealthInsuranceController::class, 'getMemberContributions'])->name('health-insurance.contributions.index');
        Route::delete('/contributions/{memberId}/{contributionId}', [HealthInsuranceController::class, 'deleteContribution'])->name('health-insurance.contributions.delete');
        
        // Claims
        Route::post('/claims/{memberId}', [HealthInsuranceController::class, 'submitClaim'])->name('health-insurance.claims.store');
        Route::put('/claims/{memberId}/{claimId}', [HealthInsuranceController::class, 'updateClaim'])->name('health-insurance.claims.update');
        Route::delete('/claims/{memberId}/{claimId}', [HealthInsuranceController::class, 'deleteClaim'])->name('health-insurance.claims.delete');
        Route::patch('/claims/{claimId}/status', [HealthInsuranceController::class, 'updateClaimStatus'])->name('health-insurance.claims.status');
        Route::get('/claims/{memberId}', [HealthInsuranceController::class, 'getMemberClaims'])->name('health-insurance.claims.member');
        Route::get('/contributions/{memberId}', [HealthInsuranceController::class, 'getMemberContributions'])->name('health-insurance.contributions.member');
        
        // Reports
        Route::post('/report', [HealthInsuranceController::class, 'generateReport'])->name('health-insurance.report');
    });
});

// Routes that require subscription
Route::middleware(['auth', 'verified', 'subscription.access'])->group(function () {
    // Help route
    Route::get('/help', function () {
        return Inertia::render('Help', [
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    })->name('help');
    
    // Digital Products (subscription required)
    Route::prefix('digital-products')->group(function () {
        Route::get('/', [DigitalProductController::class, 'index'])->name('digital-products.index');
        Route::get('/create', [DigitalProductController::class, 'create'])->name('digital-products.create');
        Route::post('/', [DigitalProductController::class, 'store'])->name('digital-products.store');
        Route::get('/{id}', [DigitalProductController::class, 'show'])->name('digital-products.show');
        Route::get('/{id}/edit', [DigitalProductController::class, 'edit'])->name('digital-products.edit');
        Route::put('/{id}', [DigitalProductController::class, 'update'])->name('digital-products.update');
        Route::delete('/{id}', [DigitalProductController::class, 'destroy'])->name('digital-products.destroy');
        Route::get('/settings', [DigitalProductController::class, 'settings'])->name('digital-products.settings');
        Route::get('/list', [DigitalProductController::class, 'getProducts'])->name('digital-products.list');
        Route::get('/{id}/download', [DigitalProductController::class, 'download'])->name('digital-products.download');
    });
    
    // Content Management (subscription required)
    Route::prefix('content-creator')->group(function () {
        Route::get('/', [ContentCreatorController::class, 'index'])->name('content-creator.index');
        Route::get('/create', [ContentCreatorController::class, 'create'])->name('content-creator.create');
        Route::post('/', [ContentCreatorController::class, 'store'])->name('content-creator.store');
        Route::get('/{id}', [ContentCreatorController::class, 'show'])->name('content-creator.show');
        Route::get('/{id}/edit', [ContentCreatorController::class, 'edit'])->name('content-creator.edit');
        Route::put('/{id}', [ContentCreatorController::class, 'update'])->name('content-creator.update');
        Route::delete('/{id}', [ContentCreatorController::class, 'destroy'])->name('content-creator.destroy');
        Route::get('/settings', [ContentCreatorController::class, 'settings'])->name('content-creator.settings');
        Route::get('/list', [ContentCreatorController::class, 'getContent'])->name('content-creator.list');
        Route::patch('/{id}/status', [ContentCreatorController::class, 'updateStatus'])->name('content-creator.update-status');
        Route::post('/bulk-delete', [ContentCreatorController::class, 'bulkDestroy'])->name('content-creator.bulk-destroy');
        Route::get('/{id}/preview', [ContentCreatorController::class, 'preview'])->name('content-creator.preview');
    });
    
    // Challenges (subscription required)
    Route::prefix('challenges')->group(function () {
        Route::get('/', [ChallengeController::class, 'index'])->name('challenges');
        Route::get('/settings', [ChallengeController::class, 'settings'])->name('challenges.settings');
        Route::get('/list', [ChallengeController::class, 'getList'])->name('challenges.list');
        Route::get('/participants-list', [ChallengeController::class, 'getParticipantsList'])->name('challenges.participants-list');
        Route::post('/', [ChallengeController::class, 'store'])->name('challenges.store');
        Route::put('/{id}', [ChallengeController::class, 'update'])->name('challenges.update');
        Route::delete('/{id}', [ChallengeController::class, 'destroy'])->name('challenges.destroy');
        Route::delete('/bulk', [ChallengeController::class, 'bulkDestroy'])->name('challenges.bulk-destroy');
        
        // Social features
        Route::get('/{id}/participants', [ChallengeController::class, 'getParticipants'])->name('challenges.participants');
        Route::post('/{id}/participants', [ChallengeController::class, 'addParticipant'])->name('challenges.add-participant');
        Route::delete('/{id}/participants/{participantId}', [ChallengeController::class, 'removeParticipant'])->name('challenges.remove-participant');
        Route::post('/{id}/progress', [ChallengeController::class, 'updateProgress'])->name('challenges.progress');
        Route::patch('/{id}/participation', [ChallengeController::class, 'updateParticipationStatus'])->name('challenges.participation');
        Route::get('/{id}/leaderboard', [ChallengeController::class, 'getLeaderboard'])->name('challenges.leaderboard');
        Route::get('/{id}/statistics', [ChallengeController::class, 'getStatistics'])->name('challenges.statistics');
    });
    
    // Clinic (subscription required)
    Route::prefix('clinic')->group(function () {
        Route::get('/', [ClinicController::class, 'index'])->name('clinic');
        Route::get('/settings', [ClinicController::class, 'settings'])->name('clinic.settings');
        Route::post('/patients', [ClinicController::class, 'store']);
        Route::put('/patients/{id}', [ClinicController::class, 'update']);
        Route::delete('/patients/{id}', [ClinicController::class, 'destroy']);
        Route::post('/patients/{patientId}/bills', [ClinicController::class, 'addBill']);
        Route::delete('/patients/{patientId}/bills/{billId}', [ClinicController::class, 'deleteBill']);
        Route::post('/patients/{patientId}/payments', [ClinicController::class, 'addPayment']);
        Route::delete('/patients/{patientId}/payments/{id}', [ClinicController::class, 'deletePayment']);
        Route::post('/patients/{patientId}/checkups', [ClinicController::class, 'addCheckup']);
        Route::delete('/patients/{patientId}/checkups/{checkupId}', [ClinicController::class, 'deleteCheckup']);
        Route::put('/patients/{patientId}/dental-chart', [ClinicController::class, 'updateDentalChart']);
        Route::put('/patients/{patientId}/next-visit', [ClinicController::class, 'updateNextVisit']);
        Route::get('/patients/{patientId}/bills', [ClinicController::class, 'getBills']);
        Route::get('/patients/{patientId}/payments', [ClinicController::class, 'getPayments']);
        Route::get('/patients/{patientId}/checkups', [ClinicController::class, 'getCheckups']);
    });
    
    // Real Estate (subscription required)
    Route::prefix('rental-property')->group(function () {
        Route::get('/', [RentalPropertyController::class, 'index'])->name('rental-property');
        Route::get('/settings', [RentalPropertyController::class, 'settings'])->name('rental-property.settings');
        Route::get('/list', [RentalPropertyController::class, 'getProperties']);
        Route::post('/', [RentalPropertyController::class, 'store']);
        Route::put('/{id}', [RentalPropertyController::class, 'update']);
        Route::delete('/{id}', [RentalPropertyController::class, 'destroy']);
        Route::post('/bulk', [RentalPropertyController::class, 'bulkDestroy']);
        Route::post('/{id}/payment', [RentalPropertyController::class, 'recordPayment']);
        Route::get('/{id}/payment-history', [RentalPropertyController::class, 'getPaymentHistory']);
    });
    
    // Transportation (subscription required)
    Route::get('/transportation', [TransportationController::class, 'index'])->name('transportation');
    
    // SMS (subscription required)
    Route::prefix('sms')->group(function () {
        Route::get('/settings', [SmsTwilioController::class, 'settings'])->name('sms.settings');
    });
    
    // Twilio SMS
    Route::get('/sms-twilio', [SmsTwilioController::class, 'index'])->name('twilio-sms');
    Route::post('/sms-twilio/send', [SmsTwilioController::class, 'send'])->name('twilio-sms.send');
    Route::get('/sms-twilio/balance', [SmsTwilioController::class, 'getBalance'])->name('twilio-sms.balance');
    Route::get('/sms-twilio/status/{messageId}', [SmsTwilioController::class, 'getMessageStatus'])->name('twilio-sms.status');
    
    // Semaphore SMS
    Route::get('/sms-semaphore', [SmsSemaphoreController::class, 'index'])->name('semaphore-sms');
    Route::post('/sms-semaphore/send', [SmsSemaphoreController::class, 'send'])->name('semaphore-sms.send');
    Route::get('/sms-semaphore/balance', [SmsSemaphoreController::class, 'getBalance'])->name('semaphore-sms.balance');
    Route::get('/sms-semaphore/status/{messageId}', [SmsSemaphoreController::class, 'getMessageStatus'])->name('semaphore-sms.status');
    Route::get('/sms-semaphore/pricing', [SmsSemaphoreController::class, 'getPricing'])->name('semaphore-sms.pricing');
    
    // Email (subscription required)
    Route::prefix('email')->group(function () {
        Route::get('/', [EmailController::class, 'index'])->name('email.index');
        Route::get('/settings', [EmailController::class, 'settings'])->name('email.settings');
        Route::post('/send', [EmailController::class, 'send'])->name('email.send');
        Route::get('/config', [EmailController::class, 'getConfig'])->name('email.config');
        
        // Email Templates
        Route::prefix('templates')->group(function () {
            Route::get('/', [EmailTemplateController::class, 'index'])->name('email.templates.index');
            Route::get('/list', [EmailTemplateController::class, 'getTemplates'])->name('email.templates.list');
            Route::get('/create', [EmailTemplateController::class, 'create'])->name('email.templates.create');
            Route::post('/', [EmailTemplateController::class, 'store'])->name('email.templates.store');
            Route::get('/{template}', [EmailTemplateController::class, 'show'])->name('email.templates.show');
            Route::get('/{template}/edit', [EmailTemplateController::class, 'edit'])->name('email.templates.edit');
            Route::put('/{template}', [EmailTemplateController::class, 'update'])->name('email.templates.update');
            Route::delete('/{template}', [EmailTemplateController::class, 'destroy'])->name('email.templates.destroy');
            Route::get('/{template}/preview', [EmailTemplateController::class, 'preview'])->name('email.templates.preview');
            Route::match(['patch', 'post'], '/{template}/toggle-status', [EmailTemplateController::class, 'toggleStatus'])->name('email.templates.toggle-status');
        });
    });
    
    // Genealogy (subscription required)
    Route::prefix('genealogy')->group(function () {
        Route::get('/', [GenealogyController::class, 'index'])->name('genealogy');
        Route::get('/settings', [GenealogyController::class, 'settings'])->name('genealogy.settings');
        Route::post('/settings', [GenealogyController::class, 'saveSettings'])->name('genealogy.settings.save');
        Route::get('/members', [GenealogyController::class, 'getFamilyMembers'])->name('genealogy.members');
        Route::get('/widget-stats', [GenealogyController::class, 'getWidgetStats'])->name('genealogy.widget-stats');
        Route::post('/members', [GenealogyController::class, 'store'])->name('genealogy.members.store');
        Route::put('/members/{id}', [GenealogyController::class, 'update'])->name('genealogy.members.update');
        Route::delete('/members/{id}', [GenealogyController::class, 'destroy'])->name('genealogy.members.destroy');
        Route::post('/relationships', [GenealogyController::class, 'addRelationship'])->name('genealogy.relationships.add');
        Route::delete('/relationships/{id}', [GenealogyController::class, 'removeRelationship'])->name('genealogy.relationships.remove');
        Route::get('/export', [GenealogyController::class, 'export'])->name('genealogy.export');
        Route::post('/import', [GenealogyController::class, 'import'])->name('genealogy.import');
        Route::get('/visualization', [GenealogyController::class, 'getVisualizationData'])->name('genealogy.visualization');
        Route::get('/edit-requests', [GenealogyController::class, 'editRequests'])->name('genealogy.edit-requests');
        Route::get('/edit-requests/data', [GenealogyController::class, 'getEditRequests'])->name('genealogy.edit-requests.data');
        Route::post('/edit-requests/{id}/accept', [GenealogyController::class, 'acceptEditRequest'])->name('genealogy.edit-requests.accept');
        Route::post('/edit-requests/{id}/reject', [GenealogyController::class, 'rejectEditRequest'])->name('genealogy.edit-requests.reject');
    });

    // Warehousing (one-time payment/subscription required)
    Route::get('/warehousing', [WarehousingController::class, 'index'])->name('warehousing');

    // Community Events (subscription required)
    Route::prefix('events')->group(function () {
        // Main resource routes
        Route::get('/', [EventController::class, 'index'])->name('events.index');
        Route::post('/', [EventController::class, 'store'])->name('events.store');
        Route::put('/{id}', [EventController::class, 'update'])->name('events.update');
        Route::delete('/{id}', [EventController::class, 'destroy'])->name('events.destroy');
        
        // Create and edit routes
        Route::get('/create', [EventController::class, 'create'])->name('events.create');
        Route::get('/{id}/edit', [EventController::class, 'edit'])->name('events.edit');
        
        // Settings route
        Route::get('/settings', [EventController::class, 'settings'])->name('events.settings');
        
        // Calendar routes
        Route::get('/calendar', [EventController::class, 'calendar'])->name('events.calendar');
        Route::get('/calendar-events', [EventController::class, 'getCalendarEvents'])->name('events.calendar-events');
        
        // Participant management routes
        Route::prefix('{event}/participants')->group(function () {
            Route::get('/', [EventController::class, 'getParticipants'])->name('events.participants.index');
            Route::post('/', [EventController::class, 'registerParticipant'])->name('events.participants.register');
            Route::delete('/{participant}', [EventController::class, 'unregisterParticipant'])->name('events.participants.unregister');
            Route::post('/{participant}/check-in', [EventController::class, 'checkInParticipant'])->name('events.participants.check-in');
        });
        
        // Filtering routes
        Route::get('/upcoming', [EventController::class, 'getUpcomingEvents'])->name('events.upcoming');
        Route::get('/past', [EventController::class, 'getPastEvents'])->name('events.past');
        
        // Bulk operations
        Route::post('/bulk-delete', [EventController::class, 'bulkDestroy'])->name('events.bulk-delete');
        
        // Import/Export routes
        Route::get('/export', [EventController::class, 'exportEvents'])->name('events.export');
        Route::post('/import', [EventController::class, 'importEvents'])->name('events.import');
    });

    // Pages Creator
    Route::resource('pages', PagesController::class);
    Route::get('/pages/settings', [PagesController::class, 'settings'])->name('pages.settings');
    Route::get('/pages/list', [PagesController::class, 'getPages'])->name('pages.list');
    Route::get('/pages/{id}/duplicate', [PagesController::class, 'duplicate'])->name('pages.duplicate');
});

// Admin routes
Route::middleware(['auth', 'ip_restriction', 'admin'])->group(function () {
    // Admin Dashboard
    Route::get('/admin/dashboard', function () {
        return Inertia::render('Admin/Dashboard');
    })->name('admin.dashboard');
    
    // Admin User Management
    Route::prefix('admin/users')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\UserAdminController::class, 'index'])->name('admin.users.index');
        Route::get('/create', [App\Http\Controllers\Admin\UserAdminController::class, 'create'])->name('admin.users.create');
        Route::post('/', [App\Http\Controllers\Admin\UserAdminController::class, 'store'])->name('admin.users.store');
        Route::get('/{id}/edit', [App\Http\Controllers\Admin\UserAdminController::class, 'edit'])->name('admin.users.edit');
        Route::put('/{id}', [App\Http\Controllers\Admin\UserAdminController::class, 'update'])->name('admin.users.update');
        Route::delete('/{id}', [App\Http\Controllers\Admin\UserAdminController::class, 'destroy'])->name('admin.users.destroy');
        Route::get('/{id}/toggle-admin', [App\Http\Controllers\Admin\UserAdminController::class, 'toggleAdminStatus'])->name('admin.users.toggle-admin');
        Route::get('/{id}/resend-verification', [App\Http\Controllers\Admin\UserAdminController::class, 'resendVerification'])->name('admin.users.resend-verification');
    });
    
    // Admin Project Management
    Route::prefix('admin/projects')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\ProjectController::class, 'index'])->name('admin.projects.index');
        Route::get('/create', [App\Http\Controllers\Admin\ProjectController::class, 'create'])->name('admin.projects.create');
        Route::post('/', [App\Http\Controllers\Admin\ProjectController::class, 'store'])->name('admin.projects.store');
        Route::get('/{id}/edit', [App\Http\Controllers\Admin\ProjectController::class, 'edit'])->name('admin.projects.edit');
        Route::put('/{id}', [App\Http\Controllers\Admin\ProjectController::class, 'update'])->name('admin.projects.update');
        Route::delete('/{id}', [App\Http\Controllers\Admin\ProjectController::class, 'destroy'])->name('admin.projects.destroy');
    });
    
    // Admin Settings
    Route::prefix('admin/settings')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\SettingsController::class, 'index'])->name('admin.settings.index');
        Route::post('/update', [App\Http\Controllers\Admin\SettingsController::class, 'update'])->name('admin.settings.update');
        Route::post('/registration', [App\Http\Controllers\Admin\SettingsController::class, 'updateRegistrationEnabled'])->name('admin.settings.registration');
        Route::post('/maintenance', [App\Http\Controllers\Admin\SettingsController::class, 'updateMaintenanceMode'])->name('admin.settings.maintenance');
        Route::post('/ip-restriction', [App\Http\Controllers\Admin\SettingsController::class, 'updateIpRestriction'])->name('admin.settings.ip-restriction');
    });
    
    // Admin Subscription Management
    Route::prefix('admin/subscriptions')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\SubscriptionAdminController::class, 'index'])->name('admin.subscriptions.index');
        Route::post('/plans', [App\Http\Controllers\Admin\SubscriptionAdminController::class, 'storePlan'])->name('admin.subscriptions.plans.store');
        Route::put('/plans/{id}', [App\Http\Controllers\Admin\SubscriptionAdminController::class, 'updatePlan'])->name('admin.subscriptions.plans.update');
        Route::delete('/plans/{id}', [App\Http\Controllers\Admin\SubscriptionAdminController::class, 'destroyPlan'])->name('admin.subscriptions.plans.destroy');
        Route::get('/plans/{id}/toggle-status', [App\Http\Controllers\Admin\SubscriptionAdminController::class, 'togglePlanStatus'])->name('admin.subscriptions.plans.toggle-status');
        Route::get('/{id}', [App\Http\Controllers\Admin\SubscriptionAdminController::class, 'viewSubscription'])->name('admin.subscriptions.view');
        Route::post('/{id}/cancel', [App\Http\Controllers\Admin\SubscriptionAdminController::class, 'cancelSubscription'])->name('admin.subscriptions.cancel');
        Route::post('/{id}/add-credits', [App\Http\Controllers\Admin\SubscriptionAdminController::class, 'addCredits'])->name('admin.subscriptions.add-credits');
        Route::post('/{id}/mark-as-paid', [App\Http\Controllers\Admin\SubscriptionAdminController::class, 'markAsPaid'])->name('admin.subscriptions.mark-as-paid');
        Route::post('/run-renewal', [App\Http\Controllers\Admin\SubscriptionAdminController::class, 'runRenewalCommand'])->name('admin.subscriptions.run-renewal');
    });
});

require __DIR__.'/auth.php';

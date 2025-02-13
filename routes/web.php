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
use App\Http\Controllers\FamilyTreeController;
use App\Models\FamilyMember;

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

// Add these routes with your other auth routes
Route::get('auth/google', [GoogleController::class, 'redirect'])
    ->name('google.redirect');
Route::get('auth/google/callback', [GoogleController::class, 'callback'])
    ->name('google.callback');
Route::post('auth/google/register', [GoogleController::class, 'register'])->name('google.register');

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Privacy Policy route
Route::get('/privacy-policy', function () {
    return Inertia::render('PrivacyPolicy');
})->name('privacy-policy');

// Terms and Conditions route
Route::get('/terms-and-conditions', function () {
    return Inertia::render('TermsAndConditions');
})->name('terms-and-conditions');

// Cookie Policy route
Route::get('/cookie-policy', function () {
    return Inertia::render('CookiePolicy');
})->name('cookie-policy');

// FAQ route
Route::get('/faq', function () {
    return Inertia::render('FAQ');
})->name('faq');

// Public routes
Route::get('/contacts/self-registration', [ContactsController::class, 'selfRegistration'])
    ->name('contacts.self-registration');
Route::post('/contacts/store-self', [ContactsController::class, 'storeSelf'])
    ->name('contacts.store-self');
Route::get('/contacts/{id}/public', [ContactsController::class, 'publicProfile'])
    ->name('contacts.public-profile');

Route::middleware('auth')->group(function () {
    // Help route
    Route::get('/help', function () {
        return Inertia::render('Help', [
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    })->name('help');

    // Home routes
    Route::get('/home', function () {
        return Inertia::render('Home', [
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    })->name('home');

    Route::get('/apps', function () {
        $appCurrency = json_decode(auth()->user()->app_currency);

        return Inertia::render('Apps', [
            'auth' => [
                'user' => [
                    'name' => auth()->user()->name,
                    'email' => auth()->user()->email,
                    'app_currency' => $appCurrency,
                ]
            ]
        ]);
    })->name('apps');

    Route::get('/inbox', function () {
        return Inertia::render('Inbox', [
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    })->name('inbox');

    // Dashboard routes
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::patch('/dashboard/{dashboard}', [DashboardController::class, 'update'])->name('dashboard.update');
    Route::get('/dashboard/{dashboard}/widgets', [DashboardController::class, 'getWidgets'])
        ->name('dashboard.widgets');

    // Widget routes
    Route::post('/widgets', [WidgetController::class, 'store'])->name('widgets.store');
    Route::delete('/widgets/{widget}', [WidgetController::class, 'destroy'])->name('widgets.destroy');
    Route::patch('/widgets/{widget}', [WidgetController::class, 'update'])->name('widgets.update');
    Route::patch('/widgets/{widget}/reorder', [WidgetController::class, 'reorder'])
        ->name('widgets.reorder');

    // Inventory routes
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

    // Pos Retail routes
    Route::get('/pos-retail', [PosRetailController::class, 'index'])->name('pos-retail');
    Route::post('/pos-retail', [PosRetailController::class, 'store']);
    Route::put('/pos-retail/{id}', [PosRetailController::class, 'update']);
    Route::delete('/pos-retail/{id}', [PosRetailController::class, 'destroy']);

    // Pos Retail Sale routes
    Route::get('/retail-sale', [PosRetailSaleController::class, 'index'])->name('retail-sale');
    Route::delete('/retail-sale/{id}', [PosRetailSaleController::class, 'destroy'])->name('sales.destroy');
    Route::delete('/retail-sales/bulk-delete', [PosRetailSaleController::class, 'bulkDelete'])->name('sales.bulk-delete');
    Route::get('/retail-sale-overview', [PosRetailSaleController::class, 'getSalesOverview']);

    // Clinic routes
    Route::get('/clinic', [ClinicController::class, 'index'])->name('clinic');
    Route::post('/clinic/patients', [ClinicController::class, 'store']);
    Route::put('/clinic/patients/{id}', [ClinicController::class, 'update']);
    Route::delete('/clinic/patients/{id}', [ClinicController::class, 'destroy']);
    Route::post('/clinic/patients/{patientId}/bills', [ClinicController::class, 'addBill']);
    Route::delete('/clinic/patients/{patientId}/bills/{billId}', [ClinicController::class, 'deleteBill']);
    Route::post('/clinic/patients/{patientId}/payments', [ClinicController::class, 'addPayment']);
    Route::delete('/clinic/patients/{patientId}/payments/{id}', [ClinicController::class, 'deletePayment']);
    Route::post('/clinic/patients/{patientId}/checkups', [ClinicController::class, 'addCheckup']);
    Route::delete('/clinic/patients/{patientId}/checkups/{checkupId}', [ClinicController::class, 'deleteCheckup']);
    Route::put('/clinic/patients/{patientId}/dental-chart', [ClinicController::class, 'updateDentalChart']);
    Route::put('/clinic/patients/{patientId}/next-visit', [ClinicController::class, 'updateNextVisit']);
    Route::get('/clinic/patients/{patientId}/bills', [ClinicController::class, 'getBills']);
    Route::get('/clinic/patients/{patientId}/payments', [ClinicController::class, 'getPayments']);
    Route::get('/clinic/patients/{patientId}/checkups', [ClinicController::class, 'getCheckups']);

    // Pos Restaurant routes
    Route::get('/pos-restaurant', [PosRestaurantController::class, 'index'])->name('pos-restaurant');

    // Pos Restaurant Menu Items routes
    Route::get('/pos-restaurant/menu-items', [PosRestaurantController::class, 'getMenuItems']);
    Route::post('/pos-restaurant/menu-items', [PosRestaurantController::class, 'storeMenuItem']);
    Route::put('/pos-restaurant/menu-item/{id}', [PosRestaurantController::class, 'updateMenuItem']);
    Route::delete('/pos-restaurant/menu-item/{id}', [PosRestaurantController::class, 'destroyMenuItem']);
    Route::post('/pos-restaurant/menu-items/bulk-destroy', [PosRestaurantController::class, 'bulkDestroyMenuItem']);

    // Pos Restaurant Tables routes
    Route::get('/pos-restaurant/tables', [PosRestaurantController::class, 'getTables']);
    Route::post('/pos-restaurant/tables', [PosRestaurantController::class, 'storeTable']);
    Route::put('/pos-restaurant/table/{id}', [PosRestaurantController::class, 'updateTable']);
    Route::delete('/pos-restaurant/table/{id}', [PosRestaurantController::class, 'destroyTable']);
    Route::get('/pos-restaurant/tables/joined', [PosRestaurantController::class, 'getJoinedTables'])
        ->name('pos-restaurant.tables.joined');
    Route::post('/pos-restaurant/tables/join', [PosRestaurantController::class, 'joinTables'])
        ->name('pos-restaurant.tables.join');
    Route::post('/pos-restaurant/tables/unjoin', [PosRestaurantController::class, 'unjoinTables'])
        ->name('pos-restaurant.tables.unjoin');
    Route::get('/pos-restaurant/tables-overview', [PosRestaurantController::class, 'getTablesOverview']);
    // Pos Restaurant Kitchen Order routes
    Route::post('/pos-restaurant/kitchen-order', [PosRestaurantController::class, 'storeKitchenOrder']);

    // Pos Restaurant Current Order routes
    Route::get('/pos-restaurant/current-order/{tableNumber}', [PosRestaurantController::class, 'getCurrentOrder']);
    Route::post('/pos-restaurant/orders/add-item', [PosRestaurantController::class, 'addItemToOrder'])
        ->name('pos-restaurant.add-item-to-order');
    Route::delete('/pos-restaurant/current-order/{table}/item/{id}', [PosRestaurantController::class, 'removeOrderItem'])
        ->name('pos-restaurant.remove-order-item');
    Route::post('/pos-restaurant/orders/complete', [PosRestaurantController::class, 'completeOrder'])
        ->name('pos-restaurant.complete-order');
    Route::get('/pos-restaurant/kitchen-orders/overview', [PosRestaurantController::class, 'getKitchenOrdersOverview']);
    // Pos Restaurant Reservations routes
    Route::get('/pos-restaurant/reservations', [PosRestaurantController::class, 'getReservations']);
    Route::post('/pos-restaurant/reservations', [PosRestaurantController::class, 'storeReservation']);
    Route::delete('/pos-restaurant/reservations/{id}', [PosRestaurantController::class, 'destroyReservation']);
    Route::get('/pos-restaurant/reservations-overview', [PosRestaurantController::class, 'getReservationsOverview']);
    // Warehousing routes
    Route::get('/warehousing', [WarehousingController::class, 'index'])->name('warehousing');

    // Transportation routes
    Route::get('/transportation', [TransportationController::class, 'index'])->name('transportation');

    // Rental Item routes
    Route::prefix('rental-item')->group(function () {
        Route::get('/', [RentalItemController::class, 'index'])->name('rental-items');
        Route::get('/list', [RentalItemController::class, 'getItems']);
        Route::post('/', [RentalItemController::class, 'store']);
        Route::put('/{id}', [RentalItemController::class, 'update']);
        Route::delete('/{id}', [RentalItemController::class, 'destroy']);
        Route::post('/bulk-delete', [RentalItemController::class, 'bulkDestroy']);
        Route::post('/{id}/payment', [RentalItemController::class, 'recordPayment']);
        Route::get('/{id}/payment-history', [RentalItemController::class, 'getPaymentHistory']);
    });

    // Rental Property routes
    Route::prefix('rental-property')->group(function () {
        Route::get('/', [RentalPropertyController::class, 'index'])->name('rental-property');
        Route::get('/list', [RentalPropertyController::class, 'getProperties']);
        Route::post('/', [RentalPropertyController::class, 'store']);
        Route::put('/{id}', [RentalPropertyController::class, 'update']);
        Route::delete('/{id}', [RentalPropertyController::class, 'destroy']);
        Route::post('/bulk', [RentalPropertyController::class, 'bulkDestroy']);
        Route::post('/{id}/payment', [RentalPropertyController::class, 'recordPayment']);
        Route::get('/{id}/payment-history', [RentalPropertyController::class, 'getPaymentHistory']);
    });

    // Loan routes
    Route::prefix('loan')->group(function () {
        Route::get('/', [LoanController::class, 'index'])->name('loan');
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
    });

    // Payroll routes
    Route::prefix('payroll')->group(function () {
        Route::get('/', [PayrollController::class, 'index'])->name('payroll');
        Route::get('/list', [PayrollController::class, 'getList']);
        Route::post('/', [PayrollController::class, 'store']);
        Route::put('/{id}', [PayrollController::class, 'update']);
        Route::delete('/{id}', [PayrollController::class, 'destroy']);
        Route::delete('/bulk', [PayrollController::class, 'bulkDestroy']);
    });

    // Travel routes
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

    // Flight search route
    Route::get('/flight-search', [FlightController::class, 'index'])->name('flight-search');
    Route::get('/flights', [FlightController::class, 'index'])->name('flights');
    Route::get('/api/flights/search-airports', [FlightController::class, 'searchAirports']);
     Route::get('/api/flights/search', [FlightController::class, 'search']);

    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::patch('/profile/currency', [ProfileController::class, 'updateCurrency'])
        ->middleware(['auth'])
        ->name('profile.currency');

    Route::patch('/profile/theme', [ProfileController::class, 'updateTheme'])
        ->middleware(['auth'])
        ->name('profile.theme');

    Route::patch('/profile/color', [ProfileController::class, 'updateColor'])
        ->middleware(['auth'])
        ->name('profile.color');

    Route::post('/profile/addresses', [ProfileController::class, 'updateAddresses'])
        ->middleware(['auth'])
        ->name('profile.addresses.update');

    // Twilio Routes
    Route::get('/sms-twilio', [SmsTwilioController::class, 'index'])->name('twilio-sms');
    Route::post('/sms-twilio/send', [SmsTwilioController::class, 'send'])->name('twilio-sms.send');
    Route::get('/sms-twilio/balance', [SmsTwilioController::class, 'getBalance'])->name('twilio-sms.balance');
    Route::get('/sms-twilio/status/{messageId}', [SmsTwilioController::class, 'getMessageStatus'])->name('twilio-sms.status');

    // Semaphore Routes
    Route::get('/sms-semaphore', [SmsSemaphoreController::class, 'index'])->name('semaphore-sms');
    Route::post('/sms-semaphore/send', [SmsSemaphoreController::class, 'send'])->name('semaphore-sms.send');
    Route::get('/sms-semaphore/balance', [SmsSemaphoreController::class, 'getBalance'])->name('semaphore-sms.balance');
    Route::get('/sms-semaphore/status/{messageId}', [SmsSemaphoreController::class, 'getMessageStatus'])->name('semaphore-sms.status');
    Route::get('/sms-semaphore/pricing', [SmsSemaphoreController::class, 'getPricing'])->name('semaphore-sms.pricing');

    // Email routes
    Route::get('/email', [EmailController::class, 'index'])->name('email.index');
    Route::post('/email/send', [EmailController::class, 'send'])->name('email.send');
    Route::get('/email/config', [EmailController::class, 'getConfig'])->name('email.config');

    // Contacts routes
    Route::resource('contacts', ContactsController::class);

    // Credits routes
    Route::prefix('credits')->group(function () {
        Route::get('/buy', [CreditsController::class, 'buy'])->name('credits.buy');
        Route::get('/{clientIdentifier}/balance', [CreditsController::class, 'getBalance'])->name('credits.balance');
        Route::post('/request', [CreditsController::class, 'requestCredit'])->name('credits.request');
        Route::get('/{clientIdentifier}/history', [CreditsController::class, 'getCreditHistory'])->name('credits.history');
        Route::get('/{clientIdentifier}/spent-history', [CreditsController::class, 'getSpentCreditHistory'])->name('credits.spent-history');
        Route::post('/spend', [CreditsController::class, 'spendCredit'])->name('credits.spend');
    });

    // Family Tree routes
    Route::prefix('family-tree')->group(function () {
        Route::get('/', [FamilyTreeController::class, 'index'])->name('family-tree');
        Route::get('/members', [FamilyTreeController::class, 'getFamilyMembers']);
        Route::post('/members', [FamilyTreeController::class, 'store']);
        Route::put('/members/{id}', [FamilyTreeController::class, 'update']);
        Route::delete('/members/{id}', [FamilyTreeController::class, 'destroy']);
        Route::post('/relationships', [FamilyTreeController::class, 'addRelationship']);
        Route::delete('/relationships/{id}', [FamilyTreeController::class, 'removeRelationship']);
        Route::get('/export', [FamilyTreeController::class, 'export']);
        Route::post('/import', [FamilyTreeController::class, 'import']);
        Route::get('/visualization', [FamilyTreeController::class, 'getVisualizationData']);
        Route::get('/full-view', function () {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken(config('api.token'))
                ->get(config('api.url') . "/family-tree/members", [
                    'client_identifier' => $clientIdentifier
                ]);

            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Failed to fetch family members']);
            }

            return Inertia::render('FamilyTree/FullView', [
                'familyMembers' => $response->json('data', [])
            ]);
        })->name('family-tree.full-view');
    });
});

require __DIR__.'/auth.php';

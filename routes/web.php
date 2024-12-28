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

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware('auth')->group(function () {
    // Home routes
    Route::get('/home', function () {
        return Inertia::render('Home', [
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    })->name('home');

    Route::get('/shop', function () {
        return Inertia::render('Shop', [
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    })->name('shop');

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

    // Help routes
    Route::get('/help', [HelpController::class, 'index'])->middleware(['auth', 'verified'])->name('help');

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
});

require __DIR__.'/auth.php';

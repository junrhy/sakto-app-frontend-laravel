<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// Public routes (no authentication required)
Route::group(['middleware' => ['web']], function () {
    require __DIR__.'/web/public/LandingController.php';
    require __DIR__.'/web/public/TravelController.php';
    require __DIR__.'/web/public/MedicalController.php';
    require __DIR__.'/web/public/ClinicEmbedController.php';
    require __DIR__.'/web/public/ContactsController.php';
    require __DIR__.'/web/public/EventController.php';
    require __DIR__.'/web/public/ChallengeController.php';
    require __DIR__.'/web/public/MayaWebhookController.php';
    require __DIR__.'/web/public/PagesController.php';
    require __DIR__.'/web/public/HealthInsuranceController.php';
    require __DIR__.'/web/public/ProductOrderController.php';
    require __DIR__.'/web/public/ContentCreatorController.php';
    require __DIR__.'/web/public/GoogleController.php';
    require __DIR__.'/web/public/TransportationController.php';
    require __DIR__.'/web/public/Static.php';
});

// Admin routes
require __DIR__.'/web/admin.php';

// Include controller-specific route files
require __DIR__.'/web/DashboardController.php';
require __DIR__.'/web/WidgetController.php';
require __DIR__.'/web/AppsController.php';
require __DIR__.'/web/ProfileController.php';
require __DIR__.'/web/QueueController.php';
require __DIR__.'/web/QueueDisplayController.php';
require __DIR__.'/web/ClinicController.php';
require __DIR__.'/web/ContactsController.php';
require __DIR__.'/web/TeamsController.php';
require __DIR__.'/web/SubscriptionController.php';
require __DIR__.'/web/PosRetailController.php';
require __DIR__.'/web/PosRestaurantController.php';
require __DIR__.'/web/InventoryController.php';
require __DIR__.'/web/LoanController.php';
require __DIR__.'/web/WarehousingController.php';
require __DIR__.'/web/TransportationController.php';
require __DIR__.'/web/RentalItemController.php';
require __DIR__.'/web/RentalPropertyController.php';
require __DIR__.'/web/PayrollController.php';
require __DIR__.'/web/TravelController.php';
require __DIR__.'/web/FlightController.php';
require __DIR__.'/web/SmsTwilioController.php';
require __DIR__.'/web/EmailController.php';
require __DIR__.'/web/GenealogyController.php';
require __DIR__.'/web/InboxController.php';
require __DIR__.'/web/EventController.php';
require __DIR__.'/web/ChallengeController.php';
require __DIR__.'/web/ProductController.php';
require __DIR__.'/web/ProductOrderController.php';
require __DIR__.'/web/CourseController.php';
require __DIR__.'/web/ContentCreatorController.php';
require __DIR__.'/web/PagesController.php';
require __DIR__.'/web/HealthInsuranceController.php';
require __DIR__.'/web/MortuaryController.php';
require __DIR__.'/web/BillPaymentController.php';
require __DIR__.'/web/DeliveryController.php';
require __DIR__.'/web/JobsController.php';
require __DIR__.'/web/ShopController.php';
require __DIR__.'/web/LogisticsController.php';
require __DIR__.'/web/CommunityController.php';
require __DIR__.'/web/CommunityKioskTerminalController.php';
require __DIR__.'/web/MedicalController.php';
require __DIR__.'/web/ClinicEmbedController.php';

// Include authentication routes
require __DIR__.'/auth.php';

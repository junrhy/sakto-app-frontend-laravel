# Customer Authentication System

## Overview

This document describes the Customer Authentication System that has been implemented in the Sakto App Frontend Laravel project. The system provides a separate authentication flow for customers, similar to the existing admin authentication system.

## Email Verification

The customer authentication system includes **full email verification support** with **custom verification URLs** for customers. When customers register, they must verify their email address before accessing the dashboard.

### Email Verification Flow

1. Customer registers an account
2. System sends **custom verification email** with customer-specific URL
3. Customer is redirected to verification notice page
4. Customer clicks link in email to verify (goes to `/customer/verify-email/`)
5. After verification, customer is redirected to customer dashboard

### Custom Notification System

**CustomerVerifyEmail Notification** (`app/Notifications/CustomerVerifyEmail.php`):
- Automatically used for customer accounts
- Generates URLs pointing to `customer.verification.verify` route
- Email subject: "Verify Your Customer Account Email Address"
- Ensures customers always go to customer dashboard after verification

**User Model Override** (`app/Models/User.php`):
- Overrides `sendEmailVerificationNotification()` method
- Detects user type and sends appropriate notification
- Customers get `CustomerVerifyEmail` notification
- Regular users get default Laravel notification

### Email Verification Controllers

- **EmailVerificationPromptController** - Shows verification notice page
- **VerifyEmailController** - Handles the verification link from email
- **EmailVerificationNotificationController** - Resends verification emails (uses custom notification)

### Email Verification Routes

| Method | URL | Purpose |
|--------|-----|---------|
| GET | `/customer/verify-email` | Show verification notice |
| GET | `/customer/verify-email/{id}/{hash}` | Verify email from link (customer-specific) |
| POST | `/customer/email/verification-notification` | Resend verification email |

## What Was Created

### 1. Database Migration
**File:** `database/migrations/2025_10_25_000000_add_user_type_to_users_table.php`

Added a `user_type` column to the `users` table with three possible values:
- `user` (default)
- `admin`
- `customer`

### 2. Backend Controllers

#### AuthController
**File:** `app/Http/Controllers/Customer/AuthController.php`

Handles customer authentication:
- `showLoginForm()` - Displays the customer login page
- `login()` - Processes customer login (checks if user has customer type)
- `logout()` - Logs out the customer

#### DashboardController
**File:** `app/Http/Controllers/Customer/DashboardController.php`

Handles customer dashboard:
- `index()` - Displays the customer dashboard
- Fetches user's primary address from `user_addresses` table
- Passes address data to the dashboard view

#### ProfileController
**File:** `app/Http/Controllers/Customer/ProfileController.php`

Handles customer profile management:
- `edit()` - Displays the profile edit page with current data
- `update()` - Updates customer name and phone number
- `updatePassword()` - Updates customer password with current password verification
- `updateAddress()` - Updates customer's primary address information
- Phone number validation with regex pattern
- Email is not editable (read-only)

#### RegisteredCustomerController
**File:** `app/Http/Controllers/Customer/RegisteredCustomerController.php`

Handles customer registration:
- `create()` - Displays the registration form with project parameter support
- `store()` - Creates a new customer account with `user_type = 'customer'`
- Validates required fields: name, email, phone number (with format validation), password, address
- Phone number validation supports multiple formats: +1 (555) 123-4567, +1-555-123-4567, 555-123-4567
- Creates primary address in `user_addresses` table
- Automatically creates default dashboards for all apps
- Registers the customer in the backend API
- Sends email verification notification
- Redirects to email verification page

#### Email Verification Controllers

**EmailVerificationPromptController**  
**File:** `app/Http/Controllers/Customer/EmailVerificationPromptController.php`
- Displays the email verification notice page
- Redirects verified users to customer dashboard

**VerifyEmailController**  
**File:** `app/Http/Controllers/Customer/VerifyEmailController.php`
- Verifies the email from the signed URL (uses customer route)
- Marks email as verified
- Redirects to customer dashboard with verified flag

**EmailVerificationNotificationController**  
**File:** `app/Http/Controllers/Customer/EmailVerificationNotificationController.php`
- Resends verification email (uses custom CustomerVerifyEmail notification)
- Throttled to prevent spam (6 requests per minute)
- Generates correct customer verification URLs

### 3. Middleware
**File:** `app/Http/Middleware/CustomerMiddleware.php`

Protects customer routes by:
- Checking if user is authenticated
- Verifying user has `user_type = 'customer'`
- Redirecting non-customers to login page

**Registered in:** `bootstrap/app.php` as `'customer'` alias

### 4. Routes
**File:** `routes/web/customer.php`

Customer routes:
- `GET /customer/login` - Customer login page
- `POST /customer/login` - Customer login submission
- `POST /customer/logout` - Customer logout
- `GET /customer/register` - Customer registration page
- `POST /customer/register` - Customer registration submission
- `GET /customer/verify-email` - Email verification notice
- `GET /customer/verify-email/{id}/{hash}` - Email verification link
- `POST /customer/email/verification-notification` - Resend verification email
- `GET /customer/dashboard` - Customer dashboard with address data
- `GET /customer/profile` - Profile edit page
- `PATCH /customer/profile` - Update account information
- `PUT /customer/profile/password` - Update password
- `POST /customer/profile/address` - Update address

**Controllers Used:**
- `Customer\AuthController` - Login and logout
- `Customer\RegisteredCustomerController` - Registration
- `Customer\DashboardController` - Dashboard with address data
- `Customer\ProfileController` - Profile management and editing
- `Customer\EmailVerificationPromptController` - Verification notice
- `Customer\VerifyEmailController` - Email verification
- `Customer\EmailVerificationNotificationController` - Resend verification

**Imported in:** `routes/web.php`

### 5. React Components

#### Customer Layout
**File:** `resources/js/Layouts/Customer/CustomerLayout.tsx`

A dedicated layout for customer pages with:
- Indigo-themed sidebar (different from admin's gray theme)
- Customer branding ("Sakto Customer")
- Navigation menu (Dashboard, Profile)
- User profile section with logout
- Active state highlighting for current page
- Responsive sidebar toggle

#### Login Page
**File:** `resources/js/Pages/Customer/Auth/Login.tsx`

Customer login page featuring:
- Indigo-themed design
- Email and password fields
- Link to customer registration
- Link back to regular login
- Project parameter support

#### Register Page
**File:** `resources/js/Pages/Customer/Auth/Register.tsx`

Customer registration page with:
- Split-screen design (form + image)
- **Project from URL parameter only** - No manual selector (uses `?project=` param)
- Error notification for invalid/missing project parameter (red banner)
- Submit button disabled if no valid project parameter
- Beautiful project-specific background images
- All standard registration fields (name, email, phone number, password)
- Complete address form (street, unit, city, state, postal code, country)
- Responsive layout optimized for large screens

#### Dashboard Page
**File:** `resources/js/Pages/Customer/Dashboard.tsx`

Customer dashboard displaying:
- Welcome message
- Quick access cards (Orders, **Profile with "Edit Profile" button**, Wishlist - coming soon)
- Recent activity section
- Account information display (name, email, phone, account type, project)
- **Primary address display** with full address details (street, city, state, postal code, country)

#### Profile Edit Page
**File:** `resources/js/Pages/Customer/Profile/Edit.tsx`

Customer profile management page with three sections:

**1. Account Information:**
- Name (editable)
- Email (read-only, cannot be changed)
- Phone number (editable with validation)
- Success toast notifications

**2. Update Password:**
- Current password field
- New password field
- Confirm password field
- Password strength validation

**3. Primary Address:**
- Street address (2/3 width) + Unit (1/3 width)
- City + State (side-by-side)
- Postal Code + Country (side-by-side)
- Updates or creates primary address

#### Verify Email Page
**File:** `resources/js/Pages/Customer/Auth/VerifyEmail.tsx`

Email verification page with:
- Clear instructions for email verification
- Resend verification email button
- Success notification when email sent
- Logout option
- Beautiful split-screen design

### 6. Custom Email Verification Notification
**File:** `app/Notifications/CustomerVerifyEmail.php`

Custom notification that:
- Extends Laravel's VerifyEmail notification
- Generates verification URLs pointing to customer routes (`/customer/verify-email/`)
- Uses `customer.verification.verify` route instead of default `verification.verify`
- Customized email subject and content for customers

### 7. User Model Updates
**File:** `app/Models/User.php`

Added:
- `user_type` to fillable array
- `isCustomer()` method to check if user is a customer
- Overridden `sendEmailVerificationNotification()` method that:
  - Sends `CustomerVerifyEmail` notification for customers
  - Sends default verification for regular users
  - Ensures customers get the correct verification link

## How to Use

### 1. Run Migrations

First, run the migration to add the `user_type` column:

```bash
# Frontend
cd /Users/junrhycrodua/Job/JRC/sakto-app-frontend-laravel
docker-compose exec app php artisan migrate
```

### 2. Access Customer Registration

Customers can register at:
```
https://your-domain.com/customer/register
```

**With project parameter (pre-selects project):**
```
https://your-domain.com/customer/register?project=shop
```

**IMPORTANT:** Customer registration **requires** a valid project parameter in the URL. Without it, the form will display an error and the submit button will be disabled.

### 3. Access Customer Login

Customers can log in at:
```
https://your-domain.com/customer/login
```

With project parameter:
```
https://your-domain.com/customer/login?project=shop
```

### 4. Customer Dashboard

After logging in, customers are redirected to:
```
https://your-domain.com/customer/dashboard
```

## Route Structure

| Method | URL | Name | Middleware | Description |
|--------|-----|------|------------|-------------|
| GET | `/customer/login` | `customer.login` | guest | Show login form |
| POST | `/customer/login` | `customer.login.attempt` | guest | Process login |
| POST | `/customer/logout` | `customer.logout` | - | Logout customer |
| GET | `/customer/register` | `customer.register` | guest | Show registration form |
| POST | `/customer/register` | `customer.register.store` | guest | Process registration |
| GET | `/customer/verify-email` | `customer.verification.notice` | auth, customer | Show verification notice |
| GET | `/customer/verify-email/{id}/{hash}` | `customer.verification.verify` | auth, customer, signed, throttle | Verify email from link |
| POST | `/customer/email/verification-notification` | `customer.verification.send` | auth, customer, throttle | Resend verification email |
| GET | `/customer/dashboard` | `customer.dashboard` | auth, customer, verified | Customer dashboard |
| GET | `/customer/profile` | `customer.profile.edit` | auth, customer, verified | Show profile edit page |
| PATCH | `/customer/profile` | `customer.profile.update` | auth, customer, verified | Update account info |
| PUT | `/customer/profile/password` | `customer.profile.password.update` | auth, customer, verified | Update password |
| POST | `/customer/profile/address` | `customer.profile.address.update` | auth, customer, verified | Update address |

## Security Features

1. **Middleware Protection:** All customer routes (except login/register) are protected by the `customer` middleware
2. **Email Verification Required:** Dashboard and protected routes require verified email (`verified` middleware)
3. **Input Validation:** 
   - Email format validation
   - Phone number format validation (regex pattern)
   - Password strength requirements
   - Address field validation
4. **Type Checking:** The `isCustomer()` method ensures only users with `user_type = 'customer'` can access customer areas
5. **Signed URLs:** Email verification links use signed URLs to prevent tampering
6. **Rate Limiting:** Email resend is throttled to 6 requests per minute to prevent abuse
7. **Session Management:** Proper session invalidation on logout
8. **Auto Logout:** Non-customers attempting to access customer areas are automatically logged out

## Design Differences from Admin

| Feature | Admin | Customer |
|---------|-------|----------|
| **Color Theme** | Gray/Blue | Indigo |
| **Branding** | "Sakto Admin" | "Sakto Customer" |
| **User Type** | `is_admin = true` | `user_type = 'customer'` |
| **URL Prefix** | `/admin/*` | `/customer/*` |
| **Middleware** | `admin` | `customer` |
| **Layout** | AdminLayout | CustomerLayout |

## Project Parameter Support

### URL Parameter (Required)

**IMPORTANT:** Customer registration **requires** the `?project=<identifier>` URL parameter. There is no manual project selector in the UI.

```
/customer/register?project=shop
/customer/login?project=medical
```

### Valid Project Identifiers

The registration form accepts these project identifiers:
- `trial`
- `community`
- `logistics`
- `medical`
- `travel`
- `delivery`
- `jobs`
- `shop`
- `enterprise`
- `fnb`

### How It Works

1. **User clicks registration link** with project parameter
2. **System validates** project identifier
3. **If valid:** Form loads with project pre-filled, background image shows
4. **If invalid/missing:** Red error banner appears, submit button disabled

### Error Handling

**Missing project parameter:**
```
Red banner: "Invalid or Missing Project Parameter"
Message: "This registration link requires a valid project parameter."
Example shown: /customer/register?project=community
Submit button: Disabled with text "Invalid Registration Link"
```

**Invalid project identifier:**
```
Red banner: "Invalid or Missing Project Parameter"  
Message: Shows which project is invalid
Submit button: Disabled
```

### Benefits

- ✅ **Forced project association** - Every customer must have a project
- ✅ **Link-based registration** - Share project-specific registration links
- ✅ **Clear error messages** - Users know exactly what's wrong
- ✅ **Submit prevention** - Can't register without valid project
- ✅ **Visual feedback** - Background image confirms project selection

## Testing the System

### 1. Create a Test Customer

Visit: `https://your-domain.com/customer/register?project=trial`

Fill in:
- Name: John Customer
- Email: customer@example.com
- Phone Number: +1 (555) 123-4567
- Password: password123
- Confirm Password: password123
- Street Address: 123 Main Street
- Unit Number: Apt 4B (optional)
- City: New York
- State: NY
- Postal Code: 10001
- Country: United States

### 2. Verify Database

Check the `users` table - the new user should have:
```sql
user_type = 'customer'
project_identifier = 'trial'
```

### 3. Test Email Verification

After registration:
1. You should be redirected to `/customer/verify-email`
2. Check your email for verification link
3. Click the verification link
4. Should redirect to `/customer/dashboard?verified=1`

### 4. Test Resend Verification Email

1. On the verification page, click "Resend Verification Email"
2. Should see green success message
3. Check email for new verification link

### 5. Test Login

1. Logout (if logged in)
2. Visit: `https://your-domain.com/customer/login`
3. Login with customer credentials
4. If email not verified, redirected to `/customer/verify-email`
5. If email verified, redirected to `/customer/dashboard`

### 4. Test Access Control

Try accessing customer dashboard as:
- **Regular user:** Should be denied
- **Admin user:** Should be denied
- **Customer user:** Should be granted access

## Future Enhancements

Consider adding these features:

1. **Customer Profile Management** ✅ **IMPLEMENTED**
   - ✅ Edit profile information (name, phone)
   - ✅ Change password
   - ✅ Update address
   - Upload profile picture (future)
   - Multiple addresses support (future)

2. **Order Management**
   - View order history
   - Track current orders
   - Download invoices

3. **Wishlist Feature**
   - Save favorite products
   - Share wishlist

4. **Customer Support**
   - Contact form
   - Live chat integration
   - Ticket system

5. **Notifications**
   - Email notifications
   - In-app notifications
   - Order status updates

## Troubleshooting

### Issue: "You do not have permission to access the customer area"

**Solution:** Check that the user's `user_type` field is set to `'customer'` in the database.

### Issue: "The selected project identifier is invalid"

**Error:** Red notification banner appears on registration page and submit button is disabled.

**Solution:**
1. **No project in URL:** Add `?project=community` (or other valid identifier) to the URL
2. **Invalid project in URL:** Change to a valid project identifier from the allowed list
3. **Valid project identifiers:** trial, community, logistics, medical, travel, delivery, jobs, shop, enterprise, fnb
4. The form will only work with a valid project parameter in the URL

**Example valid URLs:**
```
/customer/register?project=community
/customer/register?project=fnb
/customer/register?project=shop
```

### Issue: Phone number validation error

**Error:** "The phone number format is invalid."

**Solution:** 
- Phone number must match the validation pattern
- Accepted formats:
  - `+1 (555) 123-4567`
  - `+1-555-123-4567`
  - `555-123-4567`
  - `5551234567`
  - `+15551234567`
- Cannot contain letters or special characters (except +, -, spaces, parentheses, periods)
- Must be between 1-20 characters

### Issue: Not receiving verification emails

**Solutions:**
1. Check your mail configuration in `.env`:
   ```env
   MAIL_MAILER=smtp
   MAIL_HOST=your-smtp-host
   MAIL_PORT=587
   MAIL_USERNAME=your-username
   MAIL_PASSWORD=your-password
   MAIL_ENCRYPTION=tls
   MAIL_FROM_ADDRESS=noreply@yourdomain.com
   MAIL_FROM_NAME="${APP_NAME}"
   ```
2. Check if Laravel queue is running (if using queued emails)
3. Check `storage/logs/laravel.log` for email errors
4. Test with Mailtrap or similar service for development

### Issue: Email verification link goes to wrong dashboard

**Problem:** Customer clicks verification link and goes to regular user dashboard instead of customer dashboard.

**Solution:** This has been fixed! Customers now receive a custom verification email with the correct URL:
- Customer verification URL: `/customer/verify-email/{id}/{hash}`
- Regular user verification URL: `/verify-email/{id}/{hash}`

The system automatically detects user type and sends the appropriate notification.

### Issue: Email verification link not working

**Solutions:**
1. Ensure `APP_URL` in `.env` is set correctly
2. Check that the link hasn't expired (default: 60 minutes)
3. Verify the signature hasn't been tampered with
4. Check if user is already verified in database
5. For customers, ensure the link uses `/customer/verify-email/` route

### Issue: Can't access dashboard after verification

**Solution:** 
1. Check if `email_verified_at` column is set in database
2. Ensure `verified` middleware is not blocking access
3. Clear browser cache and cookies
4. Try logging out and back in

### Issue: Customer routes not found

**Solution:** Clear route cache:
```bash
docker-compose exec app php artisan route:clear
```

### Issue: Middleware not working

**Solution:** Ensure the middleware is registered in `bootstrap/app.php`:
```php
'customer' => \App\Http\Middleware\CustomerMiddleware::class,
```

## Code Examples

### Checking if User is a Customer (PHP)

```php
if (auth()->user()->isCustomer()) {
    // User is a customer
}
```

### Protecting Routes with Customer Middleware

```php
Route::middleware(['auth', 'customer'])->group(function () {
    Route::get('/customer/orders', [OrderController::class, 'index']);
});
```

### Updating Customer Profile

**Account Information:**
```php
// In ProfileController
$validated = $request->validate([
    'name' => 'required|string|max:255',
    'contact_number' => [
        'required',
        'string',
        'max:20',
        'regex:/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/'
    ],
]);

$request->user()->fill($validated);
$request->user()->save();
```

**Address:**
```php
// Update primary address
$address = UserAddress::where('user_id', $request->user()->id)
    ->where('is_primary', true)
    ->first();

$address->update([
    'street' => $request->street,
    'city' => $request->city,
    'state' => $request->state,
    'postal_code' => $request->postal_code,
    'country' => $request->country,
]);
```

### Creating a Customer Programmatically

```php
$customer = User::create([
    'name' => 'Jane Doe',
    'email' => 'jane@example.com',
    'contact_number' => '+1 (555) 123-4567',
    'password' => Hash::make('password'),
    'project_identifier' => 'shop',
    'user_type' => 'customer',
]);

// Create primary address
UserAddress::create([
    'user_id' => $customer->id,
    'address_type' => 'home',
    'street' => '123 Main Street',
    'unit_number' => 'Apt 4B',
    'city' => 'New York',
    'state' => 'NY',
    'postal_code' => '10001',
    'country' => 'United States',
    'phone' => '+1 (555) 123-4567',
    'is_primary' => true,
]);
```

## Notes

- Customers are automatically registered in the backend API (just like regular users)
- Default dashboards are created for all app types
- The system follows the same patterns as the admin authentication
- All customer pages support dark mode
- The system is fully TypeScript typed on the frontend

## Conclusion

The Customer Authentication System is now fully functional and ready to use. It provides a complete, secure, and user-friendly way for customers to register, login, and access their dedicated dashboard area.

### Key Features Summary:
✅ Complete customer registration and login flow  
✅ **Email verification required** for dashboard access  
✅ **Address collection and storage** in user_addresses table  
✅ **Profile management** - Edit account info, password, and address  
✅ **URL-based project assignment** - Project from URL parameter only  
✅ Beautiful, responsive UI with dark mode support  
✅ Clear error handling for invalid/missing project parameters  
✅ Secure middleware protection  
✅ Rate limiting on verification emails  
✅ Signed URLs for security  
✅ Phone number format validation  
✅ Toast notifications for user feedback  
✅ Easy to extend and customize  

The system follows Laravel best practices and includes comprehensive error handling, making it production-ready for your customer-facing application.


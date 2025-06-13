<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Stripe\Customer;
use Stripe\Subscription as StripeSubscription;

class StripePaymentService
{
    protected $stripeSecret;
    protected $webhookSecret;

    public function __construct()
    {
        $this->stripeSecret = config('services.stripe.secret');
        $this->webhookSecret = config('services.stripe.webhook_secret');
        Stripe::setApiKey($this->stripeSecret);
    }

    /**
     * Generate a unique reference number for Stripe payment
     */
    public function generateReferenceNumber()
    {
        return 'STRIPE-' . strtoupper(uniqid());
    }

    /**
     * Create a Stripe checkout session
     */
    public function createCheckout($data)
    {
        try {
            // Create or retrieve customer
            $customer = $this->getOrCreateCustomer($data);

            // Create checkout session
            $session = Session::create([
                'customer' => $customer->id,
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'php',
                        'product_data' => [
                            'name' => $data['plan_name'],
                            'description' => $data['plan_description'] ?? null,
                        ],
                        'unit_amount' => $data['amount'] * 100, // Convert to cents
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => route('subscriptions.stripe.success') . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('subscriptions.stripe.cancel') . '?session_id={CHECKOUT_SESSION_ID}',
                'metadata' => [
                    'reference_number' => $data['reference_number'],
                    'plan_id' => $data['plan_id'],
                    'user_identifier' => $data['user_identifier'],
                    'auto_renew' => $data['auto_renew'] ? 'true' : 'false',
                ],
            ]);

            return [
                'success' => true,
                'checkout_url' => $session->url,
                'session_id' => $session->id,
            ];
        } catch (\Exception $e) {
            Log::error('Stripe checkout creation failed: ' . $e->getMessage(), [
                'data' => $data,
                'exception' => $e
            ]);

            return [
                'success' => false,
                'message' => 'Failed to create payment session. Please try again later.',
            ];
        }
    }

    /**
     * Create a Stripe subscription
     */
    public function createSubscription($data)
    {
        try {
            // Create or retrieve customer
            $customer = $this->getOrCreateCustomer($data);

            // Create subscription
            $subscription = StripeSubscription::create([
                'customer' => $customer->id,
                'items' => [[
                    'price_data' => [
                        'currency' => 'php',
                        'product_data' => [
                            'name' => $data['plan_name'],
                            'description' => $data['plan_description'] ?? null,
                        ],
                        'unit_amount' => $data['amount'] * 100, // Convert to cents
                        'recurring' => [
                            'interval' => 'month',
                        ],
                    ],
                ]],
                'payment_behavior' => 'default_incomplete',
                'expand' => ['latest_invoice.payment_intent'],
                'metadata' => [
                    'reference_number' => $data['reference_number'],
                    'plan_id' => $data['plan_id'],
                    'user_identifier' => $data['user_identifier'],
                ],
            ]);

            return [
                'success' => true,
                'checkout_url' => $subscription->latest_invoice->hosted_invoice_url,
                'subscription_id' => $subscription->id,
            ];
        } catch (\Exception $e) {
            Log::error('Stripe subscription creation failed: ' . $e->getMessage(), [
                'data' => $data,
                'exception' => $e
            ]);

            return [
                'success' => false,
                'message' => 'Failed to create subscription. Please try again later.',
            ];
        }
    }

    /**
     * Get or create a Stripe customer
     */
    protected function getOrCreateCustomer($data)
    {
        try {
            // Search for existing customer by email
            $customers = Customer::search([
                'query' => "email:'{$data['user_email']}'",
            ]);

            if ($customers->data) {
                return $customers->data[0];
            }

            // Create new customer if not found
            return Customer::create([
                'email' => $data['user_email'],
                'name' => $data['user_name'] . ' ' . ($data['user_lastname'] ?? ''),
                'phone' => $data['user_phone'] ?? null,
                'metadata' => [
                    'user_identifier' => $data['user_identifier'],
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Stripe customer creation failed: ' . $e->getMessage(), [
                'data' => $data,
                'exception' => $e
            ]);
            throw $e;
        }
    }

    /**
     * Verify Stripe webhook signature
     */
    public function verifyWebhookSignature($payload, $signature)
    {
        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload,
                $signature,
                $this->webhookSecret
            );
            return $event;
        } catch (\Exception $e) {
            Log::error('Stripe webhook signature verification failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Cancel a Stripe subscription
     */
    public function cancelSubscription($subscriptionId)
    {
        try {
            $subscription = StripeSubscription::retrieve($subscriptionId);
            $subscription->cancel();
            
            return [
                'success' => true,
                'message' => 'Subscription cancelled successfully',
            ];
        } catch (\Exception $e) {
            Log::error('Stripe subscription cancellation failed: ' . $e->getMessage(), [
                'subscription_id' => $subscriptionId,
                'exception' => $e
            ]);

            return [
                'success' => false,
                'message' => 'Failed to cancel subscription. Please try again later.',
            ];
        }
    }
} 
<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Services\AppBillingService;
use App\Mail\UpcomingInvoicesNotification;

class SendUpcomingInvoicesEmail implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $user;
    public $upcomingInvoices;

    /**
     * Create a new job instance.
     */
    public function __construct(User $user, array $upcomingInvoices)
    {
        $this->user = $user;
        $this->upcomingInvoices = $upcomingInvoices;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $billingService = new AppBillingService();
            $pdfContent = $billingService->generateUpcomingInvoicesPDF($this->user->identifier);
            
            Mail::to($this->user->email)->send(
                new UpcomingInvoicesNotification($this->user, $this->upcomingInvoices, $pdfContent)
            );
            
            Log::info('Upcoming invoices email sent successfully', [
                'user_id' => $this->user->id,
                'user_email' => $this->user->email,
                'invoices_count' => count($this->upcomingInvoices)
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to send upcoming invoices email', [
                'user_id' => $this->user->id,
                'user_email' => $this->user->email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Re-throw the exception to mark the job as failed
            throw $e;
        }
    }
}

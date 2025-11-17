<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BillPaymentNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $billPayment;
    public $customerName;
    public $customerEmail;

    /**
     * Create a new message instance.
     */
    public function __construct(array $billPayment, string $customerEmail, string $customerName = null)
    {
        $this->billPayment = $billPayment;
        $this->customerEmail = $customerEmail;
        $this->customerName = $customerName ?? 'Customer';
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $billerName = '';
        if (isset($this->billPayment['biller']) && isset($this->billPayment['biller']['name'])) {
            $billerName = " from {$this->billPayment['biller']['name']}";
        }
        
        $subject = "New Bill Payment{$billerName}: {$this->billPayment['bill_title']}";
        
        // Add recurring indicator if it's a recurring bill
        if (isset($this->billPayment['is_recurring']) && $this->billPayment['is_recurring']) {
            $frequency = isset($this->billPayment['recurring_frequency']) 
                ? ucfirst($this->billPayment['recurring_frequency']) 
                : 'Recurring';
            $subject = "New {$frequency} Bill Payment{$billerName}: {$this->billPayment['bill_title']}";
        }
        
        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.bill-payment-notification',
            with: [
                'billPayment' => $this->billPayment,
                'customerName' => $this->customerName,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}

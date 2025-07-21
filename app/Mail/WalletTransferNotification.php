<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class WalletTransferNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $transferData;
    public $recipientName;
    public $senderName;
    public $amount;
    public $currency;
    public $reference;
    public $description;

    /**
     * Create a new message instance.
     */
    public function __construct($transferData, $recipientName, $senderName, $amount, $currency, $reference, $description = null)
    {
        $this->transferData = $transferData;
        $this->recipientName = $recipientName;
        $this->senderName = $senderName;
        $this->amount = $amount;
        $this->currency = $currency;
        $this->reference = $reference;
        $this->description = $description;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): \Illuminate\Mail\Mailables\Envelope
    {
        return new \Illuminate\Mail\Mailables\Envelope(
            subject: "Wallet Transfer Received - {$this->currency} {$this->amount}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): \Illuminate\Mail\Mailables\Content
    {
        return new \Illuminate\Mail\Mailables\Content(
            view: 'emails.wallet-transfer-notification',
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
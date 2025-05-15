<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CbuFundReport extends Mailable
{
    use Queueable, SerializesModels;

    public $fund;
    public $recentContributions;
    public $recentWithdrawals;
    public $recentDividends;
    public $statistics;
    public $message;

    /**
     * Create a new message instance.
     */
    public function __construct($fund, $recentContributions, $recentWithdrawals, $recentDividends, $statistics, $message = null)
    {
        $this->fund = $fund;
        $this->recentContributions = $recentContributions;
        $this->recentWithdrawals = $recentWithdrawals;
        $this->recentDividends = $recentDividends;
        $this->statistics = $statistics;
        $this->message = $message;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): \Illuminate\Mail\Mailables\Envelope
    {
        return new \Illuminate\Mail\Mailables\Envelope(
            subject: "CBU Fund Report - {$this->fund['name']}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): \Illuminate\Mail\Mailables\Content
    {
        return new \Illuminate\Mail\Mailables\Content(
            view: 'emails.cbu-fund-report',
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
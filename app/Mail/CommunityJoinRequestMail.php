<?php

namespace App\Mail;

use App\Models\CommunityJoinRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CommunityJoinRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public CommunityJoinRequest $joinRequest
    ) {
        //
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Community Join Request - ' . $this->joinRequest->customer->name,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.community-join-request',
            with: [
                'joinRequest' => $this->joinRequest,
                'customerName' => $this->joinRequest->customer->name,
                'customerEmail' => $this->joinRequest->customer->email,
                'approveUrl' => route('customer.communities.approve', $this->joinRequest->approval_token),
                'denyUrl' => route('customer.communities.deny', $this->joinRequest->approval_token),
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

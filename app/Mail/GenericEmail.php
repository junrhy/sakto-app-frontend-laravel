<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class GenericEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $subject;
    public $content;
    public $attachments;

    public function __construct($subject, $content, $attachments = [])
    {
        $this->subject = $subject;
        $this->content = $content;
        $this->attachments = $attachments;
    }

    public function build()
    {
        $mail = $this->subject($this->subject)
                    ->view('emails.generic')
                    ->with([
                        'content' => $this->content
                    ]);

        foreach ($this->attachments as $attachment) {
            $mail->attach($attachment['file'], $attachment['options']);
        }

        return $mail;
    }
}
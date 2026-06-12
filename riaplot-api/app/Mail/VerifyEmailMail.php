<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerifyEmailMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $name,
        public string $verifyUrl,
    ) {}

    public function build(): self
    {
        return $this->subject('Confirma o teu email — RiaPlot')
            ->view('emails.verify');
    }
}

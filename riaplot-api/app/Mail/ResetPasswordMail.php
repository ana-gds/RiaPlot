<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ResetPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $name,
        public string $resetUrl,
        public int $expiresMinutes,
    ) {}

    public function build(): self
    {
        return $this->subject('Repor a tua palavra-passe — RiaPlot')
            ->view('emails.reset');
    }
}

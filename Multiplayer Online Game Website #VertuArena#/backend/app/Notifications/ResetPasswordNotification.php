<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Lang;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public $token;
    public $email;

    public function __construct($token, $email)
    {
        $this->token = $token;
        $this->email = $email;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $resetUrl = url(config('app.frontend_url') . '/reset-password') . 
                    '?token=' . $this->token . 
                    '&email=' . $this->email;

        return (new MailMessage)
            ->subject('Reset Your VertuArena Password')
            ->view('emails.reset-password', ['resetUrl' => $resetUrl]);
    }

    public function toArray($notifiable)
    {
        return [
            //
        ];
    }
}

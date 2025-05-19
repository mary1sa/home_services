<?php

namespace App\Notifications;

use App\Models\Tasker;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewTaskerRegistered extends Notification implements ShouldQueue
{
    use Queueable;

    protected $tasker;

    public function __construct(Tasker $tasker)
    {
        $this->tasker = $tasker;
    }

   public function via($notifiable)
{
    return in_array('mail', config('notifications.channels')) 
        ? ['database', 'mail']
        : ['database'];
}

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('New Tasker Registration: ' . $this->tasker->user->full_name)
            ->greeting('Hello Admin!')
            ->line('A new tasker has registered:')
            ->line('Name: ' . $this->tasker->user->full_name)
            ->line('Email: ' . $this->tasker->user->email)
            ->action('Review Application', url('/admin/taskers/' . $this->tasker->id))
            ->line('Thank you for using our application!');
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'new_tasker_registration',
            'tasker_id' => $this->tasker->id,
            'user_id' => $this->tasker->user_id,
            'user_name' => $this->tasker->user->full_name,
            'message' => 'New tasker registration: ' . $this->tasker->user->full_name,
            'link' => '/admin/taskers/' . $this->tasker->id,
            'timestamp' => now()->toDateTimeString(),
        ];
    }
}
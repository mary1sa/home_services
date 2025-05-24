<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewUserRegistered extends Notification
{
    use Queueable;
protected $user;
    /**
     * Create a new notification instance.
     */
    public function __construct(User $user)
    {
       $this->user=$user;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
   public function toArray(object $notifiable): array
{
    return [
        'message' => 'A new user has registered: ' . $this->user->email, 
        'user_id' => $this->user->id, 
        'action_url' => '/admin/users/' . $this->user->id,  
        'type' => 'new_user_registered'  
    ];
}
}
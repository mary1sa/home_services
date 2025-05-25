<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FaqsSeeder extends Seeder
{
    public function run()
    {
        DB::table('faqs')->insert([
            [
                'question' => 'How do I book a service?',
                'answer' => 'You can book a service through our website or mobile app by selecting the service and scheduling a convenient time.',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'question' => 'What payment methods do you accept?',
                'answer' => 'We accept cash, credit/debit cards, and popular online payment gateways.',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'question' => 'Are your service providers insured?',
                'answer' => 'Yes, all our professionals are fully insured and background-checked for your peace of mind.',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'question' => 'What if I need to cancel or reschedule?',
                'answer' => 'You can cancel or reschedule your appointment up to 24 hours before the scheduled time without any penalty.',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'question' => 'Do you offer service guarantees?',
                'answer' => 'Yes, we guarantee satisfaction for all our services. If you are not happy, we will make it right.',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}

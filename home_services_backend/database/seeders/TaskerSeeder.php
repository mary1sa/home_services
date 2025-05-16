<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TaskerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get tasker user IDs
        $tasker1 = DB::table('users')->where('email', 'tasker1@example.com')->first()->id;
        $tasker2 = DB::table('users')->where('email', 'tasker2@example.com')->first()->id;

        DB::table('taskers')->insert([
            [
                'user_id' => $tasker1,
                'country' => 'USA',
                'city' => 'New York',
                'cin' => 'T12345678',
                'certificate_police' => 'certificate1.pdf',
                'certificate_police_date' => '2023-01-15',
                'bio' => 'Experienced tasker with 5 years of professional service in various fields.',
                'experience' => 5,
                'photo' => 'tasker1.jpg',
                'status' => 'approved',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $tasker2,
                'country' => 'Canada',
                'city' => 'Toronto',
                'cin' => 'T87654321',
                'certificate_police' => 'certificate2.pdf',
                'certificate_police_date' => '2023-03-20',
                'bio' => 'Skilled professional offering quality services with attention to detail.',
                'experience' => 3,
                'photo' => 'tasker2.jpg',
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
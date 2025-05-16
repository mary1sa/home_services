<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('users')->insert([
            [
                'first_name' => 'Admin',
                'last_name' => 'User',
                'email' => 'admin@example.com',
                'password' => Hash::make('password'),
                'phone' => '1234567890',
                'address' => '123 Admin Street',
                'is_online' => true,
                'role' => 'admin',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'first_name' => 'Regular',
                'last_name' => 'User',
                'email' => 'user@example.com',
                'password' => Hash::make('password'),
                'phone' => '0987654321',
                'address' => '456 User Avenue',
                'is_online' => false,
                'role' => 'user',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'first_name' => 'Tasker',
                'last_name' => 'One',
                'email' => 'tasker1@example.com',
                'password' => Hash::make('password'),
                'phone' => '5551234567',
                'address' => '789 Tasker Lane',
                'is_online' => true,
                'role' => 'tasker',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'first_name' => 'Tasker',
                'last_name' => 'Two',
                'email' => 'tasker2@example.com',
                'password' => Hash::make('password'),
                'phone' => '5557654321',
                'address' => '321 Worker Road',
                'is_online' => false,
                'role' => 'tasker',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
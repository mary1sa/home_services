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
                'photo' => null,

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
                'photo' => null,

                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'first_name' => 'User',
                'last_name' => 'Two',
                'email' => 'user2@example.com',
                'password' => Hash::make('password'),
                'phone' => '1231231234',
                'address' => '789 Second Street',
                'photo' => null,

                'is_online' => true,
                'role' => 'user',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'first_name' => 'User',
                'last_name' => 'Three',
                'email' => 'user3@example.com',
                'password' => Hash::make('password'),
                'phone' => '3213214321',
                'address' => '101 Third Avenue',
                'photo' => null,

                'is_online' => true,
                'role' => 'user',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'first_name' => 'User',
                'last_name' => 'Four',
                'email' => 'user4@example.com',
                'password' => Hash::make('password'),
                'phone' => '5556667777',
                'address' => '202 Fourth Blvd',
                'photo' => null,

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
                'photo' => null,

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
                'photo' => null,

                'role' => 'tasker',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'first_name' => 'Tasker',
                'last_name' => 'Three',
                'email' => 'tasker3@example.com',
                'password' => Hash::make('password'),
                'phone' => '5551112222',
                'address' => '222 Helper Street',
                'is_online' => true,
                                'photo' => null,

                'role' => 'tasker',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'first_name' => 'Tasker',
                'last_name' => 'Four',
                'email' => 'tasker4@example.com',
                'password' => Hash::make('password'),
                'phone' => '5553334444',
                'address' => '444 Fixer Avenue',
                'is_online' => true,
                'role' => 'tasker',
                                'photo' => null,

                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'first_name' => 'Tasker',
                'last_name' => 'Five',
                'email' => 'tasker5@example.com',
                'password' => Hash::make('password'),
                'phone' => '5555555555',
                'address' => '555 Service Road',
                'is_online' => true,
                                'photo' => null,

                'role' => 'tasker',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'first_name' => 'Tasker',
                'last_name' => 'Six',
                'email' => 'tasker6@example.com',
                'password' => Hash::make('password'),
                'phone' => '5556666666',
                'address' => '666 Repair Street',
                'is_online' => false,
                                'photo' => null,

                'role' => 'tasker',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'first_name' => 'Tasker',
                'last_name' => 'Seven',
                'email' => 'tasker7@example.com',
                'password' => Hash::make('password'),
                'phone' => '5557777777',
                'address' => '777 Fix It Avenue',
                'is_online' => true,
                                'photo' => null,

                'role' => 'tasker',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'first_name' => 'Tasker',
                'last_name' => 'Eight',
                'email' => 'tasker8@example.com',
                'password' => Hash::make('password'),
                'phone' => '5558888888',
                'address' => '888 Home Service Blvd',
                'is_online' => false,
                                'photo' => null,

                'role' => 'tasker',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'first_name' => 'Tasker',
                'last_name' => 'Nine',
                'email' => 'tasker9@example.com',
                'password' => Hash::make('password'),
                'phone' => '5559999999',
                'address' => '999 Tasker Circle',
                'is_online' => true,
                                'photo' => null,

                'role' => 'tasker',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'first_name' => 'Tasker',
                'last_name' => 'Ten',
                'email' => 'tasker10@example.com',
                'password' => Hash::make('password'),
                'phone' => '5550000000',
                'address' => '1000 Fixer Lane',
                'is_online' => false,
                                'photo' => null,

                'role' => 'tasker',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}

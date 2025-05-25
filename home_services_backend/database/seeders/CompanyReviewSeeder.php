<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CompanyReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('company_reviews')->insert([
            [
                'user_id' => 1,
                'company_id' => 1,
                'rating' => 5,
                'comment' => 'Excellent service and quick response time.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 2,
                'company_id' => 1,
                'rating' => 4,
                'comment' => 'Good quality but a bit slow delivery.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 3,
                'company_id' => 1,
                'rating' => 3,
                'comment' => 'Average experience, nothing special.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 4,
                'company_id' => 1,
                'rating' => 2,
                'comment' => 'Had some issues with the product quality.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 5,
                'company_id' => 1,
                'rating' => 1,
                'comment' => 'Very poor customer service.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 6,
                'company_id' => 1,
                'rating' => 4,
                'comment' => 'Helpful staff and reasonable prices.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 7,
                'company_id' => 1,
                'rating' => 5,
                'comment' => 'I highly recommend this company for their professionalism.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 8,
                'company_id' => 1,
                'rating' => 3,
                'comment' => 'Decent service, but room for improvement.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 9,
                'company_id' => 1,
                'rating' => 2,
                'comment' => 'Not satisfied with the delivery time.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 10,
                'company_id' => 1,
                'rating' => 4,
                'comment' => 'Good communication throughout the process.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}

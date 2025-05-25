<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServicesSeeder extends Seeder
{
    public function run()
    {
        DB::table('services')->insert([
            // Cleaning Services - category_id = 1
            [
                'category_id' => 1,
                'name' => 'House Cleaning',
                'description' => 'Comprehensive cleaning of all rooms including dusting, vacuuming, and mopping.',
                'image' => null,
                'price' => 80.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => 1,
                'name' => 'Carpet Cleaning',
                'description' => 'Deep cleaning and stain removal for carpets and rugs.',
                'image' => null,
                'price' => 60.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Plumbing - category_id = 2
            [
                'category_id' => 2,
                'name' => 'Leak Repair',
                'description' => 'Fixing leaks in pipes, faucets, and toilets quickly and efficiently.',
                'image' => null,
                'price' => 50.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => 2,
                'name' => 'Drain Cleaning',
                'description' => 'Clearing clogged drains and ensuring smooth water flow.',
                'image' => null,
                'price' => 70.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Electrical Services - category_id = 3
            [
                'category_id' => 3,
                'name' => 'Wiring & Rewiring',
                'description' => 'Installing or upgrading electrical wiring to meet safety standards.',
                'image' => null,
                'price' => 150.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => 3,
                'name' => 'Lighting Installation',
                'description' => 'Installation of indoor and outdoor lighting fixtures.',
                'image' => null,
                'price' => 90.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Home Maintenance - category_id = 4
            [
                'category_id' => 4,
                'name' => 'HVAC Maintenance',
                'description' => 'Regular maintenance of heating, ventilation, and air conditioning systems.',
                'image' => null,
                'price' => 120.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => 4,
                'name' => 'Pest Control',
                'description' => 'Effective pest control solutions for your home or office.',
                'image' => null,
                'price' => 75.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Gardening & Lawn Care - category_id = 5
            [
                'category_id' => 5,
                'name' => 'Lawn Mowing',
                'description' => 'Regular lawn mowing to keep your yard neat and tidy.',
                'image' => null,
                'price' => 40.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => 5,
                'name' => 'Garden Maintenance',
                'description' => 'Plant care, trimming, and general garden upkeep.',
                'image' => null,
                'price' => 60.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Renovation & Remodeling - category_id = 6
            [
                'category_id' => 6,
                'name' => 'Painting Services',
                'description' => 'Interior and exterior painting with high-quality finishes.',
                'image' => null,
                'price' => 200.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => 6,
                'name' => 'Flooring Installation',
                'description' => 'Installation of hardwood, tile, or laminate flooring.',
                'image' => null,
                'price' => 250.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Moving & Storage - category_id = 7
            [
                'category_id' => 7,
                'name' => 'Local Moving',
                'description' => 'Moving services within the city with packing and unpacking included.',
                'image' => null,
                'price' => 300.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => 7,
                'name' => 'Packing Services',
                'description' => 'Professional packing to protect your belongings during the move.',
                'image' => null,
                'price' => 100.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Beauty & Wellness at Home - category_id = 8
            [
                'category_id' => 8,
                'name' => 'Massage Therapy',
                'description' => 'Relaxing and therapeutic massage sessions at home.',
                'image' => null,
                'price' => 90.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => 8,
                'name' => 'Hair Styling',
                'description' => 'Professional hairstyling and grooming at your doorstep.',
                'image' => null,
                'price' => 70.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}

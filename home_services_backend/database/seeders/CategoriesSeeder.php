<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoriesSeeder extends Seeder
{
    public function run()
    {
        DB::table('categories')->insert([
            [
                'name' => 'Cleaning Services',
                'image' => null,
                'description' => 'Professional home and office cleaning services including deep cleaning and move-out cleaning.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Plumbing',
                'image' => null,
                'description' => 'All plumbing needs including leak repair, pipe installation, and drain cleaning.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Electrical Services',
                'image' => null,
                'description' => 'Electrical repairs, wiring, lighting installation, and appliance connections.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Home Maintenance',
                'image' => null,
                'description' => 'General home upkeep including HVAC, handyman services, and pest control.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Gardening & Lawn Care',
                'image' => null,
                'description' => 'Lawn mowing, garden maintenance, planting, and landscaping.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Renovation & Remodeling',
                'image' => null,
                'description' => 'Painting, flooring, kitchen and bathroom remodeling, and drywall repair.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Moving & Storage',
                'image' => 'categories/moving.png',
                'description' => 'Packing, local and long-distance moving, and storage solutions.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Beauty & Wellness at Home',
                'image' => null,
                'description' => 'At-home beauty treatments including massage, hair styling, and personal training.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}

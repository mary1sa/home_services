<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ContentSeeder extends Seeder
{
    public function run()
    {
        DB::table('content')->insert([
            [
                'section_name' => 'navbar',
                'title' => 'Navigation Menu',
                'content' => 'Links to Home, About, Services, Reviews, Contact, and more.',
                'image' => null,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'section_name' => 'home',
                'title' => 'Welcome to Allo Service',
                'content' => 'Your trusted partner for all home services in Agadir. Fast, reliable, and professional.',
                'image' => null,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'section_name' => 'about',
                'title' => 'About Us',
                'content' => 'Allo Service is dedicated to providing top-quality home services with experienced professionals and excellent customer care.',
                'image' => null,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'section_name' => 'services',
                'title' => 'Our Services',
                'content' => 'We offer a wide range of home services including cleaning, plumbing, electrical work, gardening, and renovation.',
                'image' => 'landing/services_overview.jpg',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'section_name' => 'reviews',
                'title' => 'Customer Reviews',
                'content' => 'Hear from our satisfied customers who trust Allo Service for their home needs.',
                'image' => null,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'section_name' => 'footer',
                'title' => 'Contact & Social Links',
                'content' => 'Reach us anytime via phone, email, or social media. We’re here to help you.',
                'image' => null,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}

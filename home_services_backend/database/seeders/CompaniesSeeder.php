<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CompaniesSeeder extends Seeder
{
    public function run()
    {
        DB::table('companies')->insert([
            [
                'name' => 'Allo Service',
                'description' => 'Your one-stop solution for all home services, including cleaning, plumbing, electrical work, gardening, renovation, and more. Trusted by thousands of homeowners in Agadir and beyond.',
                'address' => '123 Hassan II Boulevard, Agadir, Morocco',
                'phone' => '+212 528 123 456',
                'email' => 'contact@alloservice.com',
                'logo' => null,
                'facebook' => 'https://facebook.com/alloserviceagadir',
                'twitter' => 'https://twitter.com/alloservice_agadir',
                'instagram' => 'https://instagram.com/alloserviceagadir',
                'linkedin' => 'https://linkedin.com/company/alloserviceagadir',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}

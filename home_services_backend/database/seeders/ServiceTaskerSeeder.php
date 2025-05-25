<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServiceTaskerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $taskers = DB::table('taskers')->pluck('id')->toArray();
        $services = DB::table('services')->pluck('id')->toArray();

        $data = [];

        foreach ($taskers as $taskerId) {
            // For each tasker, assign 1 to 3 random services
            $randomServices = collect($services)->random(rand(1, 3));

            foreach ($randomServices as $serviceId) {
                $data[] = [
                    'tasker_id' => $taskerId,
                    'service_id' => $serviceId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        DB::table('service_tasker')->insert($data);
    }
}

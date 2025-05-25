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
        // Fetch tasker user IDs by email
        $taskers = [];
        for ($i = 1; $i <= 10; $i++) {
            $user = DB::table('users')->where('email', 'tasker' . $i . '@example.com')->first();
            if ($user) {
                $taskers[] = $user->id;
            }
        }

        DB::table('taskers')->insert([
            [
                'user_id' => $taskers[0],
                'country' => 'USA',
                'city' => 'New York',
                'cin' => 'T12345678',
                'certificate_police' => 'certificate1.pdf',
                'certificate_police_date' => '2023-01-15',
                'bio' => 'Experienced tasker with 5 years of professional service in various fields.',
                'experience' => 5,
                'photo' => null,
                'status' => 'approved',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $taskers[1],
                'country' => 'Canada',
                'city' => 'Toronto',
                'cin' => 'T87654321',
                'certificate_police' => 'certificate2.pdf',
                'certificate_police_date' => '2023-03-20',
                'bio' => 'Skilled professional offering quality services with attention to detail.',
                'experience' => 3,
                'photo' => null,
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $taskers[2],
                'country' => 'UK',
                'city' => 'London',
                'cin' => 'T11223344',
                'certificate_police' => 'certificate3.pdf',
                'certificate_police_date' => '2022-11-10',
                'bio' => 'Reliable and efficient tasker with expertise in home repairs.',
                'experience' => 4,
                'photo' => null,
                'status' => 'approved',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $taskers[3],
                'country' => 'Australia',
                'city' => 'Sydney',
                'cin' => 'T55667788',
                'certificate_police' => 'certificate4.pdf',
                'certificate_police_date' => '2023-02-05',
                'bio' => 'Professional tasker specializing in cleaning and maintenance.',
                'experience' => 6,
                'photo' => null,
                'status' => 'approved',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $taskers[4],
                'country' => 'Germany',
                'city' => 'Berlin',
                'cin' => 'T99887766',
                'certificate_police' => 'certificate5.pdf',
                'certificate_police_date' => '2023-04-12',
                'bio' => 'Experienced handyman and skilled in electrical work.',
                'experience' => 7,
                'photo' => null,
                'status' => 'approved',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $taskers[5],
                'country' => 'France',
                'city' => 'Paris',
                'cin' => 'T44332211',
                'certificate_police' => 'certificate6.pdf',
                'certificate_police_date' => '2023-05-01',
                'bio' => 'Tasker with expertise in furniture assembly and moving services.',
                'experience' => 3,
                'photo' => null,
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $taskers[6],
                'country' => 'Italy',
                'city' => 'Rome',
                'cin' => 'T66778899',
                'certificate_police' => 'certificate7.pdf',
                'certificate_police_date' => '2023-01-22',
                'bio' => 'Reliable tasker focused on gardening and outdoor maintenance.',
                'experience' => 4,
                'photo' => null,
                'status' => 'approved',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $taskers[7],
                'country' => 'Spain',
                'city' => 'Madrid',
                'cin' => 'T33445566',
                'certificate_police' => 'certificate8.pdf',
                'certificate_police_date' => '2023-03-18',
                'bio' => 'Detail-oriented tasker specializing in cleaning and organizing.',
                'experience' => 2,
                'photo' => null,
                'status' => 'approved',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $taskers[8],
                'country' => 'Netherlands',
                'city' => 'Amsterdam',
                'cin' => 'T77889900',
                'certificate_police' => 'certificate9.pdf',
                'certificate_police_date' => '2022-12-15',
                'bio' => 'Experienced tasker with skills in minor repairs and installations.',
                'experience' => 5,
                'photo' => null,
                'status' => 'approved',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $taskers[9],
                'country' => 'Belgium',
                'city' => 'Brussels',
                'cin' => 'T22110033',
                'certificate_police' => 'certificate10.pdf',
                'certificate_police_date' => '2023-04-30',
                'bio' => 'Tasker experienced in moving and general handyman tasks.',
                'experience' => 6,
                'photo' => null,
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}

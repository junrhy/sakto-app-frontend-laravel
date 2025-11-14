<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'id' => 1,
                'identifier' => 'c3de000a-9b28-11ef-8470-0242ac1d0002',
                'name' => 'Developer',
                'email' => 'developer@sakto.app',
                'password' => Hash::make('password'),
                'project_identifier' => 'community',
                'user_type' => 'admin',
                'is_admin' => true,
                'email_verified_at' => now(),
            ],
            [
                'id' => 2,
                'identifier' => 'c3de000a-9b28-11ef-8470-0242ac1d0003',
                'name' => 'Tester 1',
                'email' => 'tester1@sakto.app',
                'password' => Hash::make('password'),
                'project_identifier' => 'trial',
                'email_verified_at' => now(),
            ],
            [
                'id' => 3,
                'identifier' => 'c3de000a-9b28-11ef-8470-0242ac1d0004',
                'name' => 'Tester 2',
                'email' => 'tester2@sakto.app',
                'password' => Hash::make('password'),
                'project_identifier' => 'trial',
                'email_verified_at' => now(),
            ],
            [
                'id' => 4,
                'identifier' => 'c3de000a-9b28-11ef-8470-0242ac1d0005',
                'name' => 'Project Manager',
                'email' => 'projectmanager@sakto.app',
                'password' => Hash::make('password'),
                'project_identifier' => 'trial',
                'email_verified_at' => now(),
            ],
            [
                'id' => 5,
                'identifier' => 'c3de000a-9b28-11ef-8470-0242ac1d0006',
                'name' => 'Product Owner',
                'email' => 'productowner@sakto.app',
                'password' => Hash::make('password'),
                'project_identifier' => 'trial',
                'email_verified_at' => now(),
            ],
        ];

        foreach ($users as $user) {
            if (!User::where('email', $user['email'])->exists()) {
                User::create($user);
            }
        }
    }
}

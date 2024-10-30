<?php

namespace Database\Seeders;

use App\Models\User;
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
        User::create([
            'id' => 1,
            'name' => 'Test User 1',
            'email' => 'client1@sakto.app',
            'password' => Hash::make('password'),
            'project_identifier' => 'project-1',
        ]);

        User::create([
            'id' => 2,
            'name' => 'Test User 2',
            'email' => 'client2@sakto.app',
            'password' => Hash::make('password'),
            'project_identifier' => 'project-1',
        ]);

        User::create([
            'id' => 3,
            'name' => 'Test User 3',
            'email' => 'client3@sakto.app',
            'password' => Hash::make('password'),
            'project_identifier' => 'project-1',
        ]);
    }
}

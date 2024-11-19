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
            'identifier' => 'c3de000a-9b28-11ef-8470-0242ac1d0002',
            'name' => 'Test User 1',
            'email' => 'client1@sakto.app',
            'password' => Hash::make('password'),
            'project_identifier' => 'project-1',
        ]);
    }
}

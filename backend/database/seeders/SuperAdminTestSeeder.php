<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Seeder;

class SuperAdminTestSeeder extends Seeder
{
    public function run(): void
    {
        // Create test companies
        $companies = [
            ['id_company' => 'comp_001', 'name' => 'Tech Solutions', 'email' => 'tech@solutions.com', 'address' => 'Jl. Tech Street No. 1, Jakarta', 'status' => 'active', 'password' => bcrypt('company123')],
            ['id_company' => 'comp_002', 'name' => 'Digital Innovations', 'email' => 'digital@innovations.com', 'address' => 'Jl. Digital Lane No. 2, Bandung', 'status' => 'active', 'password' => bcrypt('company123')],
            ['id_company' => 'comp_003', 'name' => 'Global Services', 'email' => 'global@services.com', 'address' => 'Jl. Global Ave No. 3, Surabaya', 'status' => 'suspended', 'password' => bcrypt('company123')],
            ['id_company' => 'comp_004', 'name' => 'StartUp Hub', 'email' => 'startup@hub.com', 'address' => 'Jl. Startup Blvd No. 4, Medan', 'status' => 'inactive', 'password' => bcrypt('company123')],
        ];

        foreach ($companies as $comp_data) {
            Company::updateOrCreate(
                ['id_company' => $comp_data['id_company']],
                $comp_data
            );
        }

        // Create test super admin user
        User::updateOrCreate(
            ['id_user' => 'superadm1'],
            [
                'name' => 'Super Admin',
                'email' => 'superadmin@earlypath.id',
                'phone' => '081234567890',
                'password' => bcrypt('password123'),
                'role' => 'super_admin',
                'is_active' => true,
            ]
        );

        // Create test regular users
        $users = [
            ['id_user' => 'user0001', 'id_company' => 'comp_001', 'name' => 'John Doe', 'email' => 'john@tech-solutions.com', 'phone' => '081111111111', 'role' => 'admin'],
            ['id_user' => 'user0002', 'id_company' => 'comp_001', 'name' => 'Jane Smith', 'email' => 'jane@tech-solutions.com', 'phone' => '081111111112', 'role' => 'hr'],
            ['id_user' => 'user0003', 'id_company' => 'comp_002', 'name' => 'Bob Wilson', 'email' => 'bob@digital-innovations.com', 'phone' => '082222222222', 'role' => 'mentor'],
            ['id_user' => 'user0004', 'id_company' => 'comp_002', 'name' => 'Alice Brown', 'email' => 'alice@digital-innovations.com', 'phone' => '082222222223', 'role' => 'peserta'],
            ['id_user' => 'user0005', 'id_company' => 'comp_003', 'name' => 'Charlie Davis', 'email' => 'charlie@global-services.com', 'phone' => '083333333333', 'role' => 'admin'],
        ];

        foreach ($users as $user_data) {
            User::updateOrCreate(
                ['id_user' => $user_data['id_user']],
                array_merge($user_data, ['password' => bcrypt('password123')])
            );
        }
    }
}

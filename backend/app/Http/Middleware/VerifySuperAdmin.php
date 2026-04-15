<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Check if superadmin exists
$superadmin = User::where('email', 'superadmin@earlypath.id')->first();

if ($superadmin) {
    echo "✓ User found: " . $superadmin->name . "\n";
    echo "  ID: " . $superadmin->id_user . "\n";
    echo "  Email: " . $superadmin->email . "\n";
    echo "  Role: " . $superadmin->role . "\n";
    echo "  Is Active: " . ($superadmin->is_active ? 'Yes' : 'No') . "\n";

    // Verify password
    if (Hash::check('password123', $superadmin->password)) {
        echo "✓ Password verification: SUCCESS\n";
    } else {
        echo "✗ Password verification: FAILED - Password mismatch\n";
        echo "  Updating password...\n";
        $superadmin->update(['password' => bcrypt('password123')]);
        echo "  Password updated!\n";
    }
} else {
    echo "✗ User not found\n";
    echo "  Creating superadmin user...\n";
    $user = User::create([
        'id_user' => 'superadm1',
        'name' => 'Super Admin',
        'email' => 'superadmin@earlypath.id',
        'phone' => '081234567890',
        'password' => bcrypt('password123'),
        'role' => 'super_admin',
        'is_active' => true,
    ]);
    echo "  User created with ID: " . $user->id_user . "\n";
}

<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = \App\Models\User::where('id_user', 'superadm1')->first();
if ($user) {
    $token = $user->createToken('test-token')->plainTextToken;
    echo "Token: " . $token . "\n";
} else {
    echo "User not found\n";
}

<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Submission;

$s = Submission::whereHas('user', function($q) {
    $q->where('name', 'like', '%Lee Mark%');
})->first();

if ($s) {
    $s->update(['status' => 'accepted']);
    echo 'Lee Mark status updated to accepted' . PHP_EOL;
} else {
    echo 'Lee Mark not found' . PHP_EOL;
}

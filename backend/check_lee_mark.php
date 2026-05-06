<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Submission;

$s = Submission::whereHas('user', function($q) {
    $q->where('name', 'like', '%Lee Mark%');
})->with('position')->first();

if ($s) {
    echo 'ID: ' . $s->id_submission . PHP_EOL;
    echo 'Status: ' . $s->status . PHP_EOL;
    echo 'Position: ' . $s->position->name . PHP_EOL;
    echo 'Position ID: ' . $s->id_position . PHP_EOL;
} else {
    echo 'Not found' . PHP_EOL;
}

<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Apprentice;
use App\Models\Certificate;

$apps = Apprentice::with(['submission.user', 'submission.vacancy'])->get();
foreach ($apps as $a) {
    $hasCert = Certificate::where('id_submission', $a->id_submission)->exists() ? 'YES' : 'NO';
    echo $a->submission->user->name . " | Status: " . $a->status . " | End Date: " . ($a->end_date ?? 'N/A') . " | Has Cert: " . $hasCert . "\n";
}

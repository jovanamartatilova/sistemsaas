<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/test-gemini', function() {
    $apiKey = env('GEMINI_API_KEY');
    return response()->json([
        'api_key_exists' => !empty($apiKey),
        'api_key_preview' => $apiKey ? substr($apiKey, 0, 10) . '...' : null
    ]);
});

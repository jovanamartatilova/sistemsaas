<?php

use Illuminate\Support\Facades\Route;

Route::get('/test', function () {
    return response()->json([
        "message" => "API Laravel berhasil"
    ]);
});

Route::post('/register', function () {
    return response()->json(['message' => 'register endpoint']);
});

Route::post('/login', function () {
    return response()->json(['message' => 'login endpoint']);
});


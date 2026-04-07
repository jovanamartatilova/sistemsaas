<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->use([
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        $middleware->alias([
            'superadmin' => \App\Http\Middleware\IsSuperAdmin::class,
            'ensureCandidate' => \App\Http\Middleware\EnsureCandidate::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Render custom responses for API routes
        $exceptions->render(function (Throwable $e, Request $request) {
            // All API requests should return JSON
            if ($request->is('api/*') || $request->wantsJson()) {
                // Handle authentication exceptions (this includes token-less requests on auth routes)
                if ($e instanceof \Illuminate\Auth\AuthenticationException) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Unauthenticated',
                    ], 401);
                }
                
                // Handle authorization exceptions  
                if ($e instanceof \Illuminate\Auth\Access\AuthorizationException) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Unauthorized',
                    ], 403);
                }
                
                // Don't try to redirect on API routes
                if ($e instanceof \Symfony\Component\Routing\Exception\RouteNotFoundException) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Route not found'
                    ], 404);
                }
                
                // Return error details for API requests
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage() ?: 'Internal Server Error',
                    'error' => env('APP_DEBUG') ? [
                        'message' => $e->getMessage(),
                        'file' => $e->getFile(),
                        'line' => $e->getLine(),
                    ] : null,
                ], 500);
            }
        });
    })
    ->create();

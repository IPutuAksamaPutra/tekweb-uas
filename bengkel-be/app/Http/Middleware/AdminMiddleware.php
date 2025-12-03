<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Pastikan user login
        if (!auth()->check()) {
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }

        // Pastikan role = admin
        if (auth()->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized (admin only)'
            ], 403);
        }

        return $next($request);
    }
}

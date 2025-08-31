<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Guest Routes
Route::get('/', function () {
    return Inertia::render('Homepage', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Admin Routes
Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('dashboard/admin')
    ->group(function () {
        Route::get('/', function () {
            return Inertia::render('Admin/Dashboard');
        })->name('dashboard.admin');
    });

// Mentor Routes
Route::middleware(['auth', 'verified', 'role:mentor'])
    ->prefix('dashboard/mentor')
    ->group(function () {
        Route::get('/', function () {
            return Inertia::render('Mentor/Dashboard');
        })->name('dashboard.mentor');
    });

// Student Routes
Route::middleware(['auth', 'verified', 'role:student'])
    ->prefix('dashboard/student')
    ->group(function () {
        Route::get('/', function () {
            return Inertia::render('Student/Dashboard');
        }) ->name('dashboard.student');
    });

// Profile Routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

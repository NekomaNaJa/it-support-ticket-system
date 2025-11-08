<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\AttachmentController;
use App\Http\Controllers\Api\KnowledgeBaseController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- Public Routes (ไม่ต้องใช้ Token) ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// --- Protected Routes (ต้องใช้ Token) ---
// *** 1. ใช้ auth:sanctum เพื่อป้องกัน Route เหล่านี้ ***
Route::middleware('auth:sanctum')->group(function () {
    
    // --- Auth ---
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // --- Tickets ---
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::get('/tickets/{id}', [TicketController::class, 'show']);
    Route::put('/tickets/{id}', [TicketController::class, 'update']);
    Route::delete('/tickets/{id}', [TicketController::class, 'destroy']);
    Route::patch('/tickets/{id}/assign', [TicketController::class, 'assign']);
    Route::patch('/tickets/{ticket}/status', [TicketController::class, 'updateStatus']);
    
    // --- Dashboard ---
    Route::get('/admin/dashboard-stats', [AdminDashboardController::class, 'getStats']);
    // --- Category Routes ---
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{id}', [CategoryController::class, 'show']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
    Route::post('/categories', [CategoryController::class, 'store']);

    // Knowledge Base Routes
    Route::get('/knowledge-base', [KnowledgeBaseController::class, 'index']);
    Route::post('/knowledge-base', [KnowledgeBaseController::class, 'store']);
    Route::get('/knowledge-base/{id}', [KnowledgeBaseController::class, 'show']);
    Route::put('/knowledge-base/{id}', [KnowledgeBaseController::class, 'update']);

    // --- Comment Routes ---
    Route::post('/comments', [CommentController::class, 'store']);

    // --- Attachment Routes ---
    Route::post('/attachments', [AttachmentController::class, 'store']);
    Route::delete('/attachments/{id}', [AttachmentController::class, 'destroy']);

    // Admin Routes
    Route::get('/admin/users', [AdminUserController::class, 'index']);
    Route::get('/admin/users/{id}', [AdminUserController::class, 'show']);
    Route::put('/admin/users/{id}', [AdminUserController::class, 'update']);
    Route::delete('/admin/users/{id}', [AdminUserController::class, 'destroy']);

    // (TODO: เพิ่ม Route สำหรับ Staff/Admin ที่นี่)
});
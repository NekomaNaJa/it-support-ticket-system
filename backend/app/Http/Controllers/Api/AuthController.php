<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user and return a token.
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user',
        ]);

        // *** 1. สร้าง Token ทันทีหลังสมัคร ***
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully!',
            'user' => $user,
            'token' => $token, // <-- 2. ส่ง Token กลับไป
        ], 201);
    }

    /**
     * Authenticate the user and return a token.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        $user = Auth::user();
        
        // *** 1. สร้าง Token ตอน Login ***
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful!',
            'user' => $user,
            'token' => $token, // <-- 2. ส่ง Token กลับไป
        ]);
    }

    /**
     * Log the user out (Invalidate the token).
     * (ฟังก์ชันนี้จะทำงานได้เมื่อ Frontend ส่ง Token มา)
     */
    public function logout(Request $request)
    {
        // 1. ดึง User ที่ Login อยู่ (ผ่าน Token)
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully!'
        ]);
    }
}
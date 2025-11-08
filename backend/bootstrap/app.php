<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php', // ตรวจสอบว่าคุณมีบรรทัดนี้สำหรับ api.php
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        
        // นี่คือการเพิ่ม Middleware เข้าไปในกลุ่ม 'api'
        $middleware->api(prepend: [
            
        ]);

        // หมายเหตุ: middleware 'throttle:api' และ 'SubstituteBindings' 
        // ถูกเพิ่มให้กลุ่ม api โดยอัตโนมัติใน Laravel 11 อยู่แล้ว
        // เราจึงไม่จำเป็นต้องเพิ่มซ้ำครับ

    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
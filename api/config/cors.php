<?php
// İzin verilen origin - gerçek domain adresini buraya yazın
$allowed_origin = 'https://kibrisquiz.com';

// Gelen origin kontrolü
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// İzin verilen originden gelen istekleri kabul et
if ($origin === $allowed_origin) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Geliştirme ortamında localhost'a da izin ver
    if (strpos($origin, 'localhost') !== false || strpos($origin, '127.0.0.1') !== false) {
        header("Access-Control-Allow-Origin: $origin");
    }
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// OPTIONS isteği için hemen yanıt ver (preflight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

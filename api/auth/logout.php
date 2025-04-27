<?php
require_once '../config/cors.php';

// Cookie'yi temizle
$secure = true;
$domain = '';
$httponly = true;
$samesite = 'None';

setcookie('token', '', [
    'expires' => time() - 3600,
    'path' => '/',
    'domain' => $domain,
    'secure' => $secure,
    'httponly' => $httponly,
    'samesite' => $samesite
]);

echo json_encode(['success' => true, 'message' => 'Başarıyla çıkış yapıldı']);

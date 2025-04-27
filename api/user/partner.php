<?php
require_once '../config/cors.php';
require_once '../config/db.php';

// Cookie'den token'ı al
$token = $_COOKIE['token'] ?? '';

if (empty($token)) {
    http_response_code(401);
    echo json_encode(['message' => 'Yetkisiz erişim: Token yok']);
    exit;
}

try {
    // Token'ı doğrula
    $payload = verifyJWT($token);
    
    if (!$payload) {
        http_response_code(401);
        echo json_encode(['message' => 'Yetkisiz erişim: Geçersiz token']);
        exit;
    }
    
    // Kullanıcının partner ID'sini al
    $stmt = $db->prepare("SELECT partner_id FROM users WHERE id = ?");
    $stmt->execute([$payload['user_id']]);
    $user = $stmt->fetch();
    
    if (!$user || !$user['partner_id']) {
        http_response_code(404);
        echo json_encode(['message' => 'Partner bulunamadı']);
        exit;
    }
    
    // Partner bilgilerini al
    $stmt = $db->prepare("
        SELECT id, name, latitude, longitude, battery_level, last_seen 
        FROM users 
        WHERE id = ?
    ");
    $stmt->execute([$user['partner_id']]);
    $partner = $stmt->fetch();
    
    if (!$partner) {
        http_response_code(404);
        echo json_encode(['message' => 'Partner bulunamadı']);
        exit;
    }
    
    // Partner bilgilerini döndür
    echo json_encode([
        'partner' => [
            'id' => $partner['id'],
            'name' => $partner['name'],
            'latitude' => $partner['latitude'],
            'longitude' => $partner['longitude'],
            'batteryLevel' => $partner['battery_level'],
            'lastSeen' => $partner['last_seen']
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Sunucu hatası']);
    error_log("Partner bilgileri hatası: " . $e->getMessage());
    exit;
}

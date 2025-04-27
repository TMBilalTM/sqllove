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
    
    // Kullanıcı bilgilerini al
    $stmt = $db->prepare("
        SELECT id, name, email, partner_code, partner_id, latitude, longitude, battery_level, last_seen 
        FROM users 
        WHERE id = ?
    ");
    $stmt->execute([$payload['user_id']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        http_response_code(401);
        echo json_encode(['message' => 'Kullanıcı bulunamadı']);
        exit;
    }
    
    // Yanıt için kullanıcı bilgilerini düzenle
    $responseUser = [
        'id' => $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'partnerCode' => $user['partner_code'],
        'latitude' => $user['latitude'],
        'longitude' => $user['longitude'],
        'batteryLevel' => $user['battery_level'],
        'lastSeen' => $user['last_seen']
    ];
    
    // Kullanıcının partneri varsa, partner bilgilerini de al
    if ($user['partner_id']) {
        $stmt = $db->prepare("
            SELECT id, name, latitude, longitude, battery_level, last_seen 
            FROM users 
            WHERE id = ?
        ");
        $stmt->execute([$user['partner_id']]);
        $partner = $stmt->fetch();
        
        if ($partner) {
            $responsePartner = [
                'id' => $partner['id'],
                'name' => $partner['name'],
                'latitude' => $partner['latitude'],
                'longitude' => $partner['longitude'],
                'batteryLevel' => $partner['battery_level'],
                'lastSeen' => $partner['last_seen']
            ];
            
            echo json_encode(['user' => $responseUser, 'partner' => $responsePartner]);
        } else {
            echo json_encode(['user' => $responseUser]);
        }
    } else {
        echo json_encode(['user' => $responseUser]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Sunucu hatası']);
    error_log("Kullanıcı bilgileri hatası: " . $e->getMessage());
    exit;
}

<?php
require_once '../config/cors.php';
require_once '../config/db.php';

// Sadece POST isteklerini kabul et
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Method Not Allowed']);
    exit;
}

// Cookie'den token'ı al
$token = $_COOKIE['token'] ?? '';

if (empty($token)) {
    http_response_code(401);
    echo json_encode(['message' => 'Yetkisiz erişim: Token yok']);
    exit;
}

// İstek gövdesini al
$data = json_decode(file_get_contents('php://input'), true);
$latitude = $data['latitude'] ?? null;
$longitude = $data['longitude'] ?? null;
$batteryLevel = $data['batteryLevel'] ?? null;

try {
    // Token'ı doğrula
    $payload = verifyJWT($token);
    
    if (!$payload) {
        http_response_code(401);
        echo json_encode(['message' => 'Yetkisiz erişim: Geçersiz token']);
        exit;
    }
    
    // Kullanıcı bilgilerini güncelle
    $updateFields = [];
    $updateValues = [];
    
    if ($latitude !== null && $longitude !== null) {
        $updateFields[] = "latitude = ?";
        $updateValues[] = $latitude;
        
        $updateFields[] = "longitude = ?";
        $updateValues[] = $longitude;
    }
    
    if ($batteryLevel !== null) {
        $updateFields[] = "battery_level = ?";
        $updateValues[] = $batteryLevel;
    }
    
    if (!empty($updateFields)) {
        $updateFields[] = "last_seen = NOW()";
        
        $updateValues[] = $payload['user_id']; // WHERE id = ?
        
        $sql = "UPDATE users SET " . implode(", ", $updateFields) . " WHERE id = ?";
        
        $stmt = $db->prepare($sql);
        $stmt->execute($updateValues);
        
        // Konum geçmişi tablosuna da ekle
        if ($latitude !== null && $longitude !== null) {
            $stmt = $db->prepare("
                INSERT INTO location_history (user_id, latitude, longitude, battery_level)
                VALUES (?, ?, ?, ?)
            ");
            $stmt->execute([$payload['user_id'], $latitude, $longitude, $batteryLevel]);
        }
        
        echo json_encode(['success' => true, 'message' => 'Durum güncellendi']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Güncellenecek veri yok']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Sunucu hatası']);
    error_log("Durum güncelleme hatası: " . $e->getMessage());
    exit;
}

<?php
require_once '../config/cors.php';
require_once '../config/db.php';

// Sadece POST isteklerini kabul et
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

// Cookie'den token'ı al
$token = $_COOKIE['token'] ?? '';

// Authorization header'dan token'ı al (varsa)
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (empty($token) && !empty($authHeader) && strpos($authHeader, 'Bearer ') === 0) {
    $token = substr($authHeader, 7);
}

if (empty($token)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Yetkisiz erişim: Token yok']);
    exit;
}

// İstek gövdesini al
$data = json_decode(file_get_contents('php://input'), true);
$latitude = $data['latitude'] ?? null;
$longitude = $data['longitude'] ?? null;
$batteryLevel = $data['batteryLevel'] ?? null;

// Gelen verinin geçerliliğini kontrol et
if (($latitude === null || $longitude === null) && $batteryLevel === null) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'En az bir değer güncellenmelidir (konum veya batarya)']);
    exit;
}

try {
    // Token'ı doğrula
    $payload = verifyJWT($token);
    
    if (!$payload) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Yetkisiz erişim: Geçersiz token']);
        exit;
    }
    
    // Kullanıcı ID'sini al
    $userId = $payload['user_id'];
    
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
        
        $updateValues[] = $userId; // WHERE id = ?
        
        $sql = "UPDATE users SET " . implode(", ", $updateFields) . " WHERE id = ?";
        
        $stmt = $db->prepare($sql);
        $result = $stmt->execute($updateValues);
        
        if (!$result) {
            throw new Exception("Database update failed: " . implode(", ", $stmt->errorInfo()));
        }
        
        // Konum geçmişi tablosuna da ekle
        if ($latitude !== null && $longitude !== null) {
            $stmt = $db->prepare("
                INSERT INTO location_history (user_id, latitude, longitude, battery_level)
                VALUES (?, ?, ?, ?)
            ");
            $result = $stmt->execute([$userId, $latitude, $longitude, $batteryLevel]);
            
            if (!$result) {
                throw new Exception("Failed to record location history: " . implode(", ", $stmt->errorInfo()));
            }
        }
        
        // Güncellenmiş kullanıcı bilgilerini al
        $stmt = $db->prepare("SELECT latitude, longitude, battery_level, last_seen FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $updatedUser = $stmt->fetch();
        
        echo json_encode([
            'success' => true, 
            'message' => 'Durum güncellendi',
            'user' => [
                'latitude' => $updatedUser['latitude'],
                'longitude' => $updatedUser['longitude'],
                'batteryLevel' => $updatedUser['battery_level'],
                'lastSeen' => $updatedUser['last_seen']
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Güncellenecek veri yok']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Sunucu hatası', 
        'error' => $e->getMessage()
    ]);
    error_log("Durum güncelleme hatası: " . $e->getMessage());
    exit;
}

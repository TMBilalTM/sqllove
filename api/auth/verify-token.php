<?php
require_once '../config/cors.php';
require_once '../config/db.php';

// Sadece POST isteklerini kabul et
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Method Not Allowed']);
    exit;
}

// İstek gövdesini al
$data = json_decode(file_get_contents('php://input'), true);
$token = $data['token'] ?? '';

// Token kontrolü
if (empty($token)) {
    http_response_code(401);
    echo json_encode(['authorized' => false, 'message' => 'Token bulunamadı']);
    exit;
}

try {
    // Token'ı doğrula
    $payload = verifyJWT($token);
    
    if (!$payload) {
        http_response_code(401);
        echo json_encode(['authorized' => false, 'message' => 'Geçersiz veya süresi dolmuş token']);
        exit;
    }
    
    // Kullanıcı bilgilerini al
    $stmt = $db->prepare("SELECT id, name, email, partner_code, partner_id FROM users WHERE id = ?");
    $stmt->execute([$payload['user_id']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        http_response_code(401);
        echo json_encode(['authorized' => false, 'message' => 'Kullanıcı bulunamadı']);
        exit;
    }
    
    // Kullanıcı bilgilerini döndür
    echo json_encode([
        'authorized' => true,
        'user' => [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'partnerCode' => $user['partner_code'],
            'partnerId' => $user['partner_id']
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['authorized' => false, 'message' => 'Sunucu hatası']);
    error_log("Token doğrulama hatası: " . $e->getMessage());
    exit;
}

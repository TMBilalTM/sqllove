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
$partnerCode = $data['partnerCode'] ?? '';

if (empty($partnerCode)) {
    http_response_code(400);
    echo json_encode(['message' => 'Partner kodu gereklidir']);
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
    
    // Kullanıcı ID'sini al
    $user_id = $payload['user_id'];
    
    // Kullanıcının zaten bir partneri var mı kontrol et
    $stmt = $db->prepare("SELECT partner_id FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();
    
    if ($user['partner_id']) {
        http_response_code(400);
        echo json_encode(['message' => 'Zaten bir partneriniz var']);
        exit;
    }
    
    // Partner koduna sahip kullanıcıyı bul
    $stmt = $db->prepare("SELECT id, name FROM users WHERE partner_code = ?");
    $stmt->execute([$partnerCode]);
    $partner = $stmt->fetch();
    
    if (!$partner) {
        http_response_code(404);
        echo json_encode(['message' => 'Bu kod ile kullanıcı bulunamadı']);
        exit;
    }
    
    // Kendisinin kodunu girmeye çalışıyorsa engelle
    if ($partner['id'] == $user_id) {
        http_response_code(400);
        echo json_encode(['message' => 'Kendi partneriniz olamazsınız']);
        exit;
    }
    
    // Partner ID'sini güncelle
    $db->beginTransaction();
    
    // Ana kullanıcıyı güncelle
    $stmt = $db->prepare("UPDATE users SET partner_id = ? WHERE id = ?");
    $stmt->execute([$partner['id'], $user_id]);
    
    // Partner kullanıcıyı güncelle (karşılıklı bağlantı)
    $stmt = $db->prepare("UPDATE users SET partner_id = ? WHERE id = ?");
    $stmt->execute([$user_id, $partner['id']]);
    
    $db->commit();
    
    // Partner bilgisini döndür
    echo json_encode([
        'success' => true,
        'message' => 'Partner başarıyla eklendi',
        'partner' => [
            'id' => $partner['id'],
            'name' => $partner['name']
        ]
    ]);
    
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    
    http_response_code(500);
    echo json_encode(['message' => 'Sunucu hatası']);
    error_log("Partner eşleşme hatası: " . $e->getMessage());
    exit;
}

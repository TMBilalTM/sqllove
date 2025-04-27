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
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

// Gerekli alanları kontrol et
if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['message' => 'E-posta ve şifre gereklidir']);
    exit;
}

try {
    // Kullanıcıyı e-posta ile ara
    $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(['message' => 'Geçersiz e-posta veya şifre']);
        exit;
    }
    
    // JWT token oluştur
    $token = createJWT($user['id'], $user['email']);
    
    // Cookie olarak token ayarla
    $secure = true; // HTTPS için true
    $domain = ''; // Boş bırakırsanız mevcut domain için ayarlanır
    $httponly = true;
    $samesite = 'None'; // CORS için None, güvenlik için Lax veya Strict

    setcookie('token', $token, [
        'expires' => time() + 60*60*24*7, // 7 gün
        'path' => '/',
        'domain' => $domain,
        'secure' => $secure,
        'httponly' => $httponly,
        'samesite' => $samesite
    ]);
    
    // Kullanıcı bilgilerini ve token'ı döndür
    echo json_encode([
        'success' => true,
        'message' => 'Giriş başarılı',
        'user' => [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'partnerCode' => $user['partner_code'],
            'token' => $token  // Token'ı yanıt içinde de gönder
        ]
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Sunucu hatası']);
    error_log("Giriş hatası: " . $e->getMessage());
    exit;
}

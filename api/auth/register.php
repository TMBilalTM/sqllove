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
$name = $data['name'] ?? '';
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

// Gerekli alanları kontrol et
if (empty($name) || empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['message' => 'Ad, e-posta ve şifre gereklidir']);
    exit;
}

// E-posta formatını kontrol et
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['message' => 'Geçerli bir e-posta adresi girin']);
    exit;
}

// Şifre uzunluğunu kontrol et
if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(['message' => 'Şifre en az 8 karakter uzunluğunda olmalıdır']);
    exit;
}

try {
    // E-postanın daha önce kullanılıp kullanılmadığını kontrol et
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode(['message' => 'Bu e-posta adresi zaten kullanılıyor']);
        exit;
    }
    
    // Partner kodu oluştur (6 haneli rastgele alfanumerik)
    $partner_code = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 6));
    
    // Şifreyi hashle
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    // Kullanıcıyı veritabanına ekle
    $stmt = $db->prepare("INSERT INTO users (name, email, password, partner_code) VALUES (?, ?, ?, ?)");
    $stmt->execute([$name, $email, $hashed_password, $partner_code]);
    
    $user_id = $db->lastInsertId();
    
    // JWT token oluştur
    $token = createJWT($user_id, $email);
    
    // Cookie olarak token ayarla
    $secure = true;
    $domain = '';
    $httponly = true;
    $samesite = 'None';

    setcookie('token', $token, [
        'expires' => time() + 60*60*24*7, // 7 gün
        'path' => '/',
        'domain' => $domain,
        'secure' => $secure,
        'httponly' => $httponly,
        'samesite' => $samesite
    ]);
    
    // Kullanıcı bilgilerini döndür
    echo json_encode([
        'success' => true,
        'message' => 'Kayıt başarılı',
        'user' => [
            'id' => $user_id,
            'name' => $name,
            'email' => $email,
            'partnerCode' => $partner_code
        ]
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Sunucu hatası']);
    error_log("Kayıt hatası: " . $e->getMessage());
    exit;
}

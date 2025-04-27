<?php
// Veritabanı bağlantı bilgileri
$host = 'localhost';
$dbname = 'kibrisquiz_sqllove';
$username = 'kibrisquiz_sqllove';
$password = 'kibrisquiz_sqllove'; // Gerçek şifrenizi buraya girin

try {
    $db = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Veritabanı bağlantı hatası']);
    error_log("Veritabanı hatası: " . $e->getMessage());
    exit;
}

// JWT token için gerekli fonksiyonlar
function createJWT($user_id, $email) {
    $secret_key = "BilalTMSQLLoveApp"; // Güvenli bir anahtar belirleyin
    $issued_at = time();
    $expiration = $issued_at + (60 * 60 * 24 * 7); // 7 gün
    
    $payload = [
        'user_id' => $user_id,
        'email' => $email,
        'iat' => $issued_at,
        'exp' => $expiration
    ];
    
    // JWT başlık, içerik ve imza bölümlerini encode et
    $header = base64url_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
    $payload = base64url_encode(json_encode($payload));
    $signature = hash_hmac('sha256', "$header.$payload", $secret_key, true);
    $signature = base64url_encode($signature);
    
    return "$header.$payload.$signature";
}

function verifyJWT($token) {
    $secret_key = "BilalTMSQLLoveApp"; // createJWT ile aynı anahtar
    $token_parts = explode('.', $token);
    
    if (count($token_parts) != 3) {
        return false;
    }
    
    $header = base64url_decode($token_parts[0]);
    $payload = base64url_decode($token_parts[1]);
    $signature_provided = $token_parts[2];
    
    // Signature doğrulama
    $verified_signature = hash_hmac('sha256', "$token_parts[0].$token_parts[1]", $secret_key, true);
    $verified_signature = base64url_encode($verified_signature);
    
    if ($signature_provided !== $verified_signature) {
        return false;
    }
    
    $payload_data = json_decode($payload, true);
    
    // Süre kontrolü
    if ($payload_data['exp'] < time()) {
        return false;
    }
    
    return $payload_data;
}

// Base64URL encoding (JWT için gerekli)
function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data) {
    return base64_decode(strtr($data, '-_', '+/'));
}

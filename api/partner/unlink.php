<?php
require_once '../config/cors.php';
require_once '../config/db.php';

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

    // Kullanıcı bilgilerini al
    $stmt = $db->prepare("SELECT name, partner_code FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Kullanıcı bulunamadı']);
        exit;
    }

    // POST isteği - Partner bağlantısını sonlandır
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Partner ID'yi al
        $data = json_decode(file_get_contents('php://input'), true);
        $partnerId = $data['partner_id'] ?? null;

        // Partner ID boş kontrolü
        if (!$partnerId) {
            // Partner ID boşsa, kullanıcının mevcut partnerini bul
            $stmt = $db->prepare("SELECT partner_id FROM partner_links WHERE user_id = ?");
            $stmt->execute([$userId]);
            $partnerLink = $stmt->fetch();
            
            if (!$partnerLink) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Aktif bir partner bulunamadı']);
                exit;
            }
            
            $partnerId = $partnerLink['partner_id'];
        }

        try {
            // Transaction başlat
            $db->beginTransaction();

            // İlgili tüm partner bağlantılarını sil
            $stmt = $db->prepare("DELETE FROM partner_links WHERE (user_id = ? AND partner_id = ?) OR (user_id = ? AND partner_id = ?)");
            $stmt->execute([$userId, $partnerId, $partnerId, $userId]);

            // İlişki verisini sil
            $stmt = $db->prepare("DELETE FROM relationships WHERE (user_id = ? AND partner_id = ?) OR (user_id = ? AND partner_id = ?)");
            $stmt->execute([$userId, $partnerId, $partnerId, $userId]);

            // Users tablosundaki partner_id değerlerini sıfırla
            $stmt = $db->prepare("UPDATE users SET partner_id = NULL WHERE id = ? OR id = ?");
            $stmt->execute([$userId, $partnerId]);

            // İşlemleri tamamla
            $db->commit();

            echo json_encode([
                'success' => true,
                'message' => 'Partner bağlantısı başarıyla sonlandırıldı'
            ]);

        } catch (PDOException $e) {
            // Hata durumunda transaction'ı geri al
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Veritabanı hatası: ' . $e->getMessage()]);
            error_log("Partner unlink hatası: " . $e->getMessage());
        }
        exit;
    }

    // Diğer HTTP metodları için hata mesajı
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Sunucu hatası: ' . $e->getMessage()]);
    exit;
}
?>

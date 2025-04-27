<?php
require_once '../config/cors.php';
require_once '../config/db.php';

// Token kontrolü
$token = $_COOKIE['token'] ?? '';
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
    $payload = verifyJWT($token);
    
    if (!$payload) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Yetkisiz erişim: Geçersiz token']);
        exit;
    }
    
    $userId = $payload['user_id'];
    
    // GET isteği - İlişki bilgisini al
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Partner bilgisini al
        $stmt = $db->prepare("
            SELECT p.id, p.name, p.email, l.latitude, l.longitude, l.battery_level, l.last_seen 
            FROM partner_links pl
            JOIN users p ON pl.partner_id = p.id
            LEFT JOIN locations l ON p.id = l.user_id
            WHERE pl.user_id = ?
        ");
        $stmt->execute([$userId]);
        $partner = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$partner) {
            echo json_encode(['success' => false, 'message' => 'Partner bulunamadı']);
            exit;
        }
        
        // İlişki bilgisini al
        $stmt = $db->prepare("
            SELECT id, start_date FROM relationships 
            WHERE (user_id = ? AND partner_id = ?) OR (user_id = ? AND partner_id = ?)
        ");
        $stmt->execute([$userId, $partner['id'], $partner['id'], $userId]);
        $relationship = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$relationship) {
            // İlişki kaydı yoksa varsayılan değerlerle oluştur
            $defaultStartDate = date('Y-m-d', strtotime('-1 month')); // Varsayılan olarak 1 ay önce
            
            $stmt = $db->prepare("
                INSERT INTO relationships (user_id, partner_id, start_date) 
                VALUES (?, ?, ?)
            ");
            $stmt->execute([$userId, $partner['id'], $defaultStartDate]);
            
            $relationshipId = $db->lastInsertId();
            $startDate = $defaultStartDate;
        } else {
            $relationshipId = $relationship['id'];
            $startDate = $relationship['start_date'];
        }
        
        // İlişki süresini hesapla
        $now = new DateTime();
        $start = new DateTime($startDate);
        $interval = $start->diff($now);
        
        $duration = [
            'years' => $interval->y,
            'months' => $interval->m,
            'days' => $interval->d,
            'total_days' => $interval->days
        ];
        
        echo json_encode([
            'success' => true,
            'relationship' => [
                'id' => $relationshipId,
                'start_date' => $startDate,
                'duration' => $duration
            ]
        ]);
        exit;
    }
    
    // POST isteği - İlişki başlangıç tarihini güncelle
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $startDate = $data['start_date'] ?? null;
        
        if (!$startDate) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Başlangıç tarihi gerekli']);
            exit;
        }
        
        // Geçerli tarih formatını kontrol et (YYYY-MM-DD)
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $startDate)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Geçersiz tarih formatı. YYYY-MM-DD kullanın']);
            exit;
        }
        
        // Partner bilgisini al
        $stmt = $db->prepare("SELECT partner_id FROM partner_links WHERE user_id = ?");
        $stmt->execute([$userId]);
        $partnerLink = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$partnerLink) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Partner bulunamadı']);
            exit;
        }
        
        $partnerId = $partnerLink['partner_id'];
        
        // İlişki kaydı var mı kontrol et
        $stmt = $db->prepare("
            SELECT id FROM relationships 
            WHERE (user_id = ? AND partner_id = ?) OR (user_id = ? AND partner_id = ?)
        ");
        $stmt->execute([$userId, $partnerId, $partnerId, $userId]);
        $relationship = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($relationship) {
            // Kayıt varsa güncelle
            $stmt = $db->prepare("
                UPDATE relationships 
                SET start_date = ? 
                WHERE id = ?
            ");
            $stmt->execute([$startDate, $relationship['id']]);
        } else {
            // Kayıt yoksa oluştur
            $stmt = $db->prepare("
                INSERT INTO relationships (user_id, partner_id, start_date) 
                VALUES (?, ?, ?)
            ");
            $stmt->execute([$userId, $partnerId, $startDate]);
        }
        
        // İlişki süresini hesapla
        $now = new DateTime();
        $start = new DateTime($startDate);
        $interval = $start->diff($now);
        
        $duration = [
            'years' => $interval->y,
            'months' => $interval->m,
            'days' => $interval->d,
            'total_days' => $interval->days
        ];
        
        echo json_encode([
            'success' => true,
            'message' => 'İlişki başlangıç tarihi güncellendi',
            'relationship' => [
                'start_date' => $startDate,
                'duration' => $duration
            ]
        ]);
        exit;
    }
    
    // Diğer metot istekleri için
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Sunucu hatası: ' . $e->getMessage()]);
    exit;
}
?>

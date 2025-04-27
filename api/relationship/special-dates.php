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
    
    // GET isteği - Özel günleri listeleme
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $db->prepare("SELECT * FROM special_dates WHERE user_id = ? ORDER BY date ASC");
        $stmt->execute([$userId]);
        $specialDates = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Yaklaşan özel günleri hesapla
        $upcoming = [];
        
        foreach ($specialDates as &$date) {
            // Unix timestamp'e çevir
            $dateTimestamp = strtotime($date['date']);
            
            // Bu yılki tarihi hesapla (yıldönümleri için)
            if ($date['is_recurring']) {
                $thisYear = date('Y');
                $dateThisYear = date('Y-m-d', strtotime(date('Y', $dateTimestamp) . '-' . date('m-d', $dateTimestamp)));
                $dateThisYearTimestamp = strtotime($dateThisYear);
                
                // Eğer bu yılki tarih geçmişse, gelecek yılı hesapla
                if ($dateThisYearTimestamp < time()) {
                    $nextYear = $thisYear + 1;
                    $dateNextYear = date('Y-m-d', strtotime($nextYear . '-' . date('m-d', $dateTimestamp)));
                    $date['next_occurrence'] = $dateNextYear;
                    $date['days_remaining'] = ceil((strtotime($dateNextYear) - time()) / (60 * 60 * 24));
                } else {
                    $date['next_occurrence'] = $dateThisYear;
                    $date['days_remaining'] = ceil(($dateThisYearTimestamp - time()) / (60 * 60 * 24));
                }
            } else {
                // Tekrar etmeyen bir tarih
                $date['next_occurrence'] = $date['date'];
                if ($dateTimestamp > time()) {
                    $date['days_remaining'] = ceil(($dateTimestamp - time()) / (60 * 60 * 24));
                } else {
                    $date['days_remaining'] = 0; // Geçmiş tarih
                }
            }
            
            // Yaklaşan tarihse diziye ekle
            if ($date['days_remaining'] <= $date['reminder_days'] && $date['days_remaining'] > 0) {
                $upcoming[] = $date;
            }
        }
        
        echo json_encode([
            'success' => true,
            'special_dates' => $specialDates,
            'upcoming_reminders' => $upcoming
        ]);
        exit;
    }
    
    // POST isteği - Yeni özel gün ekleme
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Zorunlu alanları kontrol et
        $requiredFields = ['title', 'date'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => $field . ' alanı zorunludur']);
                exit;
            }
        }
        
        // Geçerli tarih formatını kontrol et (YYYY-MM-DD)
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $data['date'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Geçersiz tarih formatı. YYYY-MM-DD kullanın']);
            exit;
        }
        
        // Opsiyonel alanlar için varsayılan değerler
        $description = $data['description'] ?? '';
        $reminderDays = isset($data['reminder_days']) ? intval($data['reminder_days']) : 7;
        $isRecurring = isset($data['is_recurring']) ? (bool) $data['is_recurring'] : true;
        $notificationEnabled = isset($data['notification_enabled']) ? (bool) $data['notification_enabled'] : true;
        
        // Veritabanına ekle
        $stmt = $db->prepare("
            INSERT INTO special_dates 
            (user_id, title, date, description, reminder_days, is_recurring, notification_enabled) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $userId,
            $data['title'],
            $data['date'],
            $description,
            $reminderDays,
            $isRecurring ? 1 : 0,
            $notificationEnabled ? 1 : 0
        ]);
        
        $newId = $db->lastInsertId();
        
        // Eklenen veriyi geri döndür
        $stmt = $db->prepare("SELECT * FROM special_dates WHERE id = ?");
        $stmt->execute([$newId]);
        $specialDate = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'message' => 'Özel gün başarıyla eklendi',
            'special_date' => $specialDate
        ]);
        exit;
    }
    
    // PUT isteği - Özel gün güncelleme
    if ($_SERVER['REQUEST_METHOD'] === 'PUT' || $_SERVER['REQUEST_METHOD'] === 'PATCH') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // ID kontrolü
        if (!isset($data['id']) || empty($data['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID alanı zorunludur']);
            exit;
        }
        
        // Kaydın var olduğunu ve kullanıcıya ait olduğunu kontrol et
        $stmt = $db->prepare("SELECT * FROM special_dates WHERE id = ? AND user_id = ?");
        $stmt->execute([$data['id'], $userId]);
        $specialDate = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$specialDate) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Özel gün bulunamadı veya erişim izniniz yok']);
            exit;
        }
        
        // Güncellenecek alanları hazırla
        $updateFields = [];
        $updateParams = [];
        
        if (isset($data['title'])) {
            $updateFields[] = "title = ?";
            $updateParams[] = $data['title'];
        }
        
        if (isset($data['date'])) {
            // Geçerli tarih formatını kontrol et (YYYY-MM-DD)
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $data['date'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Geçersiz tarih formatı. YYYY-MM-DD kullanın']);
                exit;
            }
            
            $updateFields[] = "date = ?";
            $updateParams[] = $data['date'];
        }
        
        if (isset($data['description'])) {
            $updateFields[] = "description = ?";
            $updateParams[] = $data['description'];
        }
        
        if (isset($data['reminder_days'])) {
            $updateFields[] = "reminder_days = ?";
            $updateParams[] = intval($data['reminder_days']);
        }
        
        if (isset($data['is_recurring'])) {
            $updateFields[] = "is_recurring = ?";
            $updateParams[] = $data['is_recurring'] ? 1 : 0;
        }
        
        if (isset($data['notification_enabled'])) {
            $updateFields[] = "notification_enabled = ?";
            $updateParams[] = $data['notification_enabled'] ? 1 : 0;
        }
        
        // Hiçbir alan güncellenmeyecekse hata ver
        if (empty($updateFields)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Güncellenecek alan bulunamadı']);
            exit;
        }
        
        // Güncelleme için ID'yi ve kullanıcı ID'sini ekle
        $updateParams[] = $data['id'];
        $updateParams[] = $userId;
        
        // Güncelleme sorgusunu hazırla ve çalıştır
        $sql = "UPDATE special_dates SET " . implode(", ", $updateFields) . " WHERE id = ? AND user_id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute($updateParams);
        
        // Güncellenmiş kaydı geri döndür
        $stmt = $db->prepare("SELECT * FROM special_dates WHERE id = ?");
        $stmt->execute([$data['id']]);
        $updatedDate = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'message' => 'Özel gün başarıyla güncellendi',
            'special_date' => $updatedDate
        ]);
        exit;
    }
    
    // DELETE isteği - Özel gün silme
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // ID kontrolü
        if (!isset($data['id']) || empty($data['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID alanı zorunludur']);
            exit;
        }
        
        // Kaydın var olduğunu ve kullanıcıya ait olduğunu kontrol et
        $stmt = $db->prepare("SELECT * FROM special_dates WHERE id = ? AND user_id = ?");
        $stmt->execute([$data['id'], $userId]);
        $specialDate = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$specialDate) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Özel gün bulunamadı veya erişim izniniz yok']);
            exit;
        }
        
        // Kaydı sil
        $stmt = $db->prepare("DELETE FROM special_dates WHERE id = ? AND user_id = ?");
        $stmt->execute([$data['id'], $userId]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Özel gün başarıyla silindi'
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

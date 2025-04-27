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
    
    // GET request için kullanıcı ayarlarını getir
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Önce settings tablosunda kullanıcının kaydı var mı kontrol et
        $stmt = $db->prepare("SELECT * FROM settings WHERE user_id = ?");
        $stmt->execute([$userId]);
        $settings = $stmt->fetch();

        if (!$settings) {
            // Kayıt yoksa varsayılan değerlerle oluştur
            $stmt = $db->prepare("
                INSERT INTO settings 
                (user_id, share_location, share_battery, notification_enabled, background_location_enabled, show_background_notification)
                VALUES (?, 1, 1, 1, 0, 1)
            ");
            $stmt->execute([$userId]);

            $settings = [
                'share_location' => true,
                'share_battery' => true,
                'notification_enabled' => true,
                'background_location_enabled' => false,
                'show_background_notification' => true
            ];
        } else {
            // Boolean değerlere çevir
            $settings['share_location'] = (bool)$settings['share_location'];
            $settings['share_battery'] = (bool)$settings['share_battery'];
            $settings['notification_enabled'] = (bool)$settings['notification_enabled'];
            $settings['background_location_enabled'] = (bool)($settings['background_location_enabled'] ?? false);
            $settings['show_background_notification'] = (bool)($settings['show_background_notification'] ?? true);
        }

        echo json_encode([
            'success' => true,
            'settings' => [
                'shareLocation' => $settings['share_location'],
                'shareBattery' => $settings['share_battery'],
                'notificationEnabled' => $settings['notification_enabled'],
                'backgroundLocationEnabled' => $settings['background_location_enabled'],
                'showBackgroundNotification' => $settings['show_background_notification']
            ]
        ]);
        exit;
    }
    
    // POST request için kullanıcı ayarlarını güncelle
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Kullanıcı ayarlarını güncellemek için SQL alanları
        $updateFields = [];
        $updateValues = [];

        // Ayarları kontrol et ve güncelle
        if (isset($data['shareLocation'])) {
            $updateFields[] = "share_location = ?";
            $updateValues[] = $data['shareLocation'] ? 1 : 0;
        }

        if (isset($data['shareBattery'])) {
            $updateFields[] = "share_battery = ?";
            $updateValues[] = $data['shareBattery'] ? 1 : 0;
        }
        
        if (isset($data['notificationEnabled'])) {
            $updateFields[] = "notification_enabled = ?";
            $updateValues[] = $data['notificationEnabled'] ? 1 : 0;
        }
        
        if (isset($data['backgroundLocationEnabled'])) {
            $updateFields[] = "background_location_enabled = ?";
            $updateValues[] = $data['backgroundLocationEnabled'] ? 1 : 0;
        }

        // Add new background notification setting
        if (isset($data['showBackgroundNotification'])) {
            $updateFields[] = "show_background_notification = ?";
            $updateValues[] = $data['showBackgroundNotification'] ? 1 : 0;
        }

        if (!empty($updateFields)) {
            // Kullanıcı ID'sini ekle
            $updateValues[] = $userId;

            // Önce settings tablosunda kullanıcının kaydı var mı kontrol et
            $stmt = $db->prepare("SELECT COUNT(*) FROM settings WHERE user_id = ?");
            $stmt->execute([$userId]);
            $exists = (int)$stmt->fetchColumn() > 0;
            
            if ($exists) {
                // Kayıt varsa güncelle
                $sql = "UPDATE settings SET " . implode(", ", $updateFields) . " WHERE user_id = ?";
                $stmt = $db->prepare($sql);
                $stmt->execute($updateValues);
            } else {
                // Kayıt yoksa oluştur
                $fields = ["user_id"];
                $placeholders = ["?"];
                $values = [$userId];

                if (isset($data['shareLocation'])) {
                    $fields[] = "share_location";
                    $placeholders[] = "?";
                    $values[] = $data['shareLocation'] ? 1 : 0;
                }

                if (isset($data['shareBattery'])) {
                    $fields[] = "share_battery";
                    $placeholders[] = "?";
                    $values[] = $data['shareBattery'] ? 1 : 0;
                }
                
                if (isset($data['notificationEnabled'])) {
                    $fields[] = "notification_enabled";
                    $placeholders[] = "?";
                    $values[] = $data['notificationEnabled'] ? 1 : 0;
                }
                
                if (isset($data['backgroundLocationEnabled'])) {
                    $fields[] = "background_location_enabled";
                    $placeholders[] = "?";
                    $values[] = $data['backgroundLocationEnabled'] ? 1 : 0;
                }
                
                if (isset($data['showBackgroundNotification'])) {
                    $fields[] = "show_background_notification";
                    $placeholders[] = "?";
                    $values[] = $data['showBackgroundNotification'] ? 1 : 0;
                }

                $sql = "INSERT INTO settings (" . implode(", ", $fields) . ") VALUES (" . implode(", ", $placeholders) . ")";
                $stmt = $db->prepare($sql);
                $stmt->execute($values);
            }
            
            // Güncellenmiş ayarları al
            $stmt = $db->prepare("SELECT * FROM settings WHERE user_id = ?");
            $stmt->execute([$userId]);
            $settings = $stmt->fetch();

            echo json_encode([
                'success' => true,
                'message' => 'Ayarlar güncellendi',
                'settings' => [
                    'shareLocation' => (bool)$settings['share_location'],
                    'shareBattery' => (bool)$settings['share_battery'],
                    'notificationEnabled' => (bool)$settings['notification_enabled'],
                    'backgroundLocationEnabled' => (bool)$settings['background_location_enabled'],
                    'showBackgroundNotification' => (bool)($settings['show_background_notification'] ?? true)
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Güncellenecek ayar bulunamadı']);
        }
        exit;
    }
    
    // Diğer HTTP metotları için hata
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Sunucu hatası: ' . $e->getMessage()]);
    error_log("Ayarlar hatası: " . $e->getMessage());
    exit;
}

<?php

// Partner bağlantısı kurma
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $partnerCode = $data['partner_code'] ?? '';

    if (empty($partnerCode)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Partner kodu gereklidir']);
        exit;
    }

    try {
        // Kullanıcının kendi kodunu girmesini engelle
        if ($user['partner_code'] === $partnerCode) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Kendi kodunuzu giremezsiniz']);
            exit;
        }

        // Partner kodunun geçerli bir kullanıcıya ait olup olmadığını kontrol et
        $stmt = $db->prepare("SELECT id, name, email FROM users WHERE partner_code = ?");
        $stmt->execute([$partnerCode]);
        $partner = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$partner) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Partner kodu geçersiz']);
            exit;
        }

        // Zaten partner olup olmadığını kontrol et
        $stmt = $db->prepare("SELECT id FROM partner_links WHERE user_id = ? AND partner_id = ?");
        $stmt->execute([$userId, $partner['id']]);
        $existingLink = $stmt->fetch();

        if ($existingLink) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Bu kullanıcı zaten partneriniz']);
            exit;
        }

        // Transaction başlat
        $db->beginTransaction();

        // Çift yönlü partner bağlantısı kur
        $stmt = $db->prepare("INSERT INTO partner_links (user_id, partner_id) VALUES (?, ?)");
        $stmt->execute([$userId, $partner['id']]);
        $stmt->execute([$partner['id'], $userId]); // Partner için de bağlantı oluştur

        // İlişki tablosuna kayıt ekle (varsayılan başlangıç tarihi bugün)
        $today = date('Y-m-d');
        $stmt = $db->prepare("INSERT INTO relationships (user_id, partner_id, start_date) VALUES (?, ?, ?)");
        $stmt->execute([$userId, $partner['id'], $today]);

        // İşlemleri tamamla
        $db->commit();

        // Partner bilgilerini döndür
        echo json_encode([
            'success' => true,
            'message' => "{$partner['name']} başarıyla partner olarak eklendi!",
            'partner' => [
                'id' => $partner['id'],
                'name' => $partner['name'],
                'email' => $partner['email']
            ]
        ]);
        
    } catch (PDOException $e) {
        // Hata durumunda transaction'ı geri al
        if ($db->inTransaction()) {
            $db->rollBack();
        }

        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Veritabanı hatası: ' . $e->getMessage()]);
        error_log("Partner link hatası: " . $e->getMessage());
    } catch (Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Sunucu hatası: ' . $e->getMessage()]);
        error_log("Partner link hatası: " . $e->getMessage());
    }
    exit;
}
# SQLLove PHP API

Bu klasördeki PHP dosyaları, kibrisquiz.com'un API klasörüne yüklenmelidir.

## Kurulum Adımları

1. `database.sql` dosyasındaki SQL komutlarını veritabanında çalıştırın
2. PHP dosyalarını kibrisquiz.com'da `/api/` dizinine yükleyin
3. `config/db.php` dosyasında veritabanı bağlantı bilgilerini güncelleyin
4. `config/cors.php` dosyasında izin verilen origin'i kendi domain adresinizle değiştirin

## API Yapısı

### Kimlik Doğrulama

- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/logout` - Çıkış yapma
- `POST /api/auth/verify-token` - Token doğrulama

### Kullanıcı İşlemleri

- `GET /api/user/me` - Kullanıcı bilgilerini al
- `GET /api/user/partner` - Partner bilgilerini al
- `POST /api/user/update-status` - Konum ve şarj durumunu güncelle
- `POST /api/user/link-partner` - Partner kodu ile eşleşme

## Güvenlik Notları

- Canlı ortamda `db.php` dosyasındaki JWT anahtarını değiştirmeyi unutmayın
- Hassas bilgileri `.env` dosyasında saklamayı tercih edebilirsiniz
- API isteklerini HTTPS üzerinden yapın

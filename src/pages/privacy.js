import Link from "next/link";
import { FaArrowLeft, FaShieldAlt } from "react-icons/fa";
import Logo from "../components/Logo";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
        <div className="max-w-6xl mx-auto flex items-center">
          <Link href="/" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 mr-4">
            <FaArrowLeft />
          </Link>
          <Logo size="sm" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="love-card bg-white dark:bg-gray-800 p-6 md:p-8 shadow-xl">
          <div className="flex items-center mb-6">
            <FaShieldAlt className="text-primary text-3xl mr-4" />
            <h1 className="text-3xl font-bold">Gizlilik Politikası</h1>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg mb-6">
              SQLLove uygulaması kullanıcı gizliliğine büyük önem verir. Bu gizlilik politikası, 
              uygulamayı kullanmanız sırasında topladığımız ve işlediğimiz verileri açıklamaktadır.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Topladığımız Veriler</h2>
            <ul className="space-y-2">
              <li>
                <strong>Konum Verileri:</strong> Uygulamanın temel işlevi, konumunuzu partnerinizle paylaşmaktır.
                Bu amaçla GPS koordinatlarınızı toplar ve saklarız.
              </li>
              <li>
                <strong>Batarya Durumu:</strong> Cihazınızın batarya seviyesi, partnerinize gösterilmek üzere toplanır.
              </li>
              <li>
                <strong>Kişisel Bilgiler:</strong> Adınız, e-posta adresiniz ve şifreniz kayıt sırasında toplanır.
              </li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">Verilerin Kullanımı</h2>
            <p>
              Topladığımız verileri yalnızca uygulamanın temel işlevlerini sağlamak için kullanırız:
            </p>
            <ul className="space-y-2">
              <li>Konum verileriniz, yalnızca partnerinize gösterilir.</li>
              <li>Batarya seviyeniz, yalnızca partnerinize gösterilir.</li>
              <li>Kişisel bilgileriniz, hesabınızı yönetmek ve kimlik doğrulama için kullanılır.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">Verilerinizin Güvenliği</h2>
            <p>
              Verilerinizi korumak için endüstri standardı güvenlik önlemleri kullanırız. Tüm veriler şifrelenmiş 
              bir şekilde saklanır ve iletilir. Ancak, internet üzerinden veri iletimi veya elektronik depolama 
              yöntemlerinin %100 güvenli olmadığını unutmayınız.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Üçüncü Taraflarla Paylaşım</h2>
            <p>
              Verilerinizi hiçbir üçüncü tarafla paylaşmıyoruz. Konum ve batarya bilgileriniz 
              yalnızca sizin onay verdiğiniz partner ile paylaşılır.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Verilerinizin Kontrolü</h2>
            <p>
              Uygulama içindeki ayarlar menüsünden:
            </p>
            <ul className="space-y-2">
              <li>Konum paylaşımını açıp kapatabilirsiniz.</li>
              <li>Batarya bilgisi paylaşımını açıp kapatabilirsiniz.</li>
              <li>Hesabınızı tamamen silebilirsiniz.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">Politika Değişiklikleri</h2>
            <p>
              Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Değişiklikler olduğunda, 
              bu sayfada bildirimde bulunacağız.
            </p>

            <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Son güncelleme: Ocak 2024
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="py-6 text-center text-sm text-gray-500">
        <p>SQLLove &copy; 2025 - Sevgi Her Yerde</p>
      </footer>
    </div>
  );
}

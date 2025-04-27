import Link from "next/link";
import { FaArrowLeft, FaFileContract } from "react-icons/fa";
import Logo from "../components/Logo";

export default function Terms() {
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
            <FaFileContract className="text-primary text-3xl mr-4" />
            <h1 className="text-3xl font-bold">Kullanım Koşulları</h1>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg mb-6">
              SQLLove uygulamasını kullanarak, aşağıdaki koşulları kabul etmiş olursunuz.
              Lütfen bu koşulları dikkatlice okuyunuz.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">1. Hizmet Kullanımı</h2>
            <p>
              SQLLove, sevgililer arasında konum ve batarya durumu paylaşımı için tasarlanmış bir uygulamadır.
              Bu hizmeti kullanarak:
            </p>
            <ul className="space-y-2">
              <li>18 yaşından büyük olduğunuzu onaylıyorsunuz.</li>
              <li>Yalnızca rıza gösteren kişilerle konum bilginizi paylaşacağınızı kabul ediyorsunuz.</li>
              <li>Hizmeti yasa dışı amaçlar için kullanmayacağınızı taahhüt ediyorsunuz.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">2. Hesap Güvenliği</h2>
            <p>
              Hesabınızın güvenliğinden siz sorumlusunuz. Şifrenizi güvende tutmalı ve hesabınızla
              gerçekleştirilen tüm etkinliklerden sorumlu olduğunuzu kabul etmelisiniz.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">3. Konum ve Batarya Verileri</h2>
            <p>
              SQLLove, temel işlevi olarak konum ve batarya verilerinizi toplar ve paylaşır. Bu veriler:
            </p>
            <ul className="space-y-2">
              <li>Yalnızca onay verdiğiniz partnerle paylaşılır.</li>
              <li>Uygulamadan çıkış yaptığınızda veya veri paylaşımını durdurduğunuzda toplanmayı durdurur.</li>
              <li>Hesabınızı sildiğinizde tamamen silinir.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">4. Sorumluluk Sınırlaması</h2>
            <p>
              SQLLove, aşağıdaki durumlardan sorumlu değildir:
            </p>
            <ul className="space-y-2">
              <li>GPS hataları veya konum belirleme sorunları nedeniyle oluşan hatalı veriler.</li>
              <li>Uygulama kullanımından kaynaklanan cihaz batarya tüketimi.</li>
              <li>İnternet kesintileri veya sinyal sorunları nedeniyle yaşanan veri iletim sorunları.</li>
              <li>Kullanıcıların uygulamayı kötüye kullanması sonucu oluşan zararlar.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">5. Değişiklikler</h2>
            <p>
              Bu koşulları herhangi bir zamanda değiştirme hakkını saklı tutarız. Değişiklikler 
              uygulamaya yeni sürümler yayınlandığında veya bu sayfada duyurulduğunda geçerli olur.
              Hizmeti kullanmaya devam etmeniz, güncel koşulları kabul ettiğiniz anlamına gelir.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">6. Fikri Mülkiyet</h2>
            <p>
              SQLLove ve içeriği, fikri mülkiyet hakları ile korunmaktadır. Uygulama içeriğini 
              kopyalama, değiştirme veya dağıtma hakkına sahip değilsiniz.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">7. Hesap Feshi</h2>
            <p>
              İhlal durumunda hesabınızı askıya alma veya sonlandırma hakkını saklı tutarız.
              Ayrıca istediğiniz zaman hesabınızı silme hakkına sahipsiniz.
            </p>

            <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Son güncelleme: Nisan 2025
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

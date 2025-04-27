import { useState } from "react";
import Link from "next/link";
import { FaArrowLeft, FaEnvelope, FaUser, FaPaperPlane, FaCheck } from "react-icons/fa";
import Logo from "../components/Logo";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // API isteği burada olacak
      // Şimdilik API entegrasyonu olmadığından simüle ediyoruz
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        message: ""
      });
    } catch (err) {
      setError("Mesajınız gönderilemedi. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

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
            <FaEnvelope className="text-primary text-3xl mr-4" />
            <h1 className="text-3xl font-bold">Bize Ulaşın</h1>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Soru, öneri veya destekleriniz için formu doldurarak bize ulaşabilirsiniz.
            En kısa sürede size dönüş yapacağız.
          </p>

          {success ? (
            <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-xl text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheck className="text-green-500 text-2xl" />
              </div>
              <h3 className="text-xl font-medium text-green-800 dark:text-green-300 mb-2">Teşekkürler!</h3>
              <p className="text-green-700 dark:text-green-400">
                Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.
              </p>
              <button 
                onClick={() => setSuccess(false)} 
                className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
              >
                Yeni Mesaj Gönder
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-xl text-sm border-l-4 border-red-500">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Ad Soyad
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <FaUser />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Adınız ve soyadınız"
                    required
                    className="love-input pl-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  E-posta
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <FaEnvelope />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="E-posta adresiniz"
                    required
                    className="love-input pl-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Mesajınız
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Mesajınızı buraya yazın..."
                  rows={5}
                  required
                  className="love-input w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-love w-full flex items-center justify-center gap-2 py-3"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Gönderiliyor...
                  </div>
                ) : (
                  <>
                    <FaPaperPlane /> Mesaj Gönder
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>
      
      <footer className="py-6 text-center text-sm text-gray-500">
        <p>SQLLove &copy; 2025 - Sevgi Her Yerde</p>
      </footer>
    </div>
  );
}

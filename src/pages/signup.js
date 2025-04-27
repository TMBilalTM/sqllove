import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { FaUserPlus, FaUser, FaEnvelope, FaLock, FaHeart } from "react-icons/fa";
import Logo from "../components/Logo";
import { register } from "../lib/api";

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const data = await register(name, email, password);
      
      if (data.success) {
        router.push("/dashboard");
      } else {
        setError(data.message || "Kayıt başarısız oldu. Lütfen tekrar deneyin.");
      }
    } catch (err) {
      setError("Bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-white to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <div className="love-card bg-white dark:bg-gray-800 p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <Logo size="xl" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Sevgiliniz ile her an bağlantıda kalın
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-xl text-sm border-l-4 border-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  type="text"
                  placeholder="Adınız ve soyadınız"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  type="email"
                  placeholder="E-posta adresiniz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="love-input pl-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <FaLock />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="En az 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="love-input pl-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Şifre Tekrar
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <FaLock />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Şifrenizi tekrar girin"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="love-input pl-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-love w-full flex items-center justify-center gap-2 py-3 mt-4"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Kaydediliyor
                </div>
              ) : (
                <>
                  <FaUserPlus /> Kayıt Ol
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px bg-gray-300 dark:bg-gray-700 flex-1"></div>
              <FaHeart className="text-primary" />
              <div className="h-px bg-gray-300 dark:bg-gray-700 flex-1"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Zaten hesabınız var mı?{" "}
              <Link href="/login" className="text-primary hover:text-primary-dark font-medium">
                Giriş yap
              </Link>
            </p>
          </div>
        </div>
        
        <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
          <p>SQLLove &copy; 2025. Sevgi Her Yerde.</p>
        </div>
      </div>
    </div>
  );
}

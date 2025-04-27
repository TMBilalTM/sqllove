import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { FaHeart, FaMapMarkerAlt, FaBatteryThreeQuarters, FaUserPlus, FaSignInAlt } from "react-icons/fa";
import Logo from "../components/Logo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const router = useRouter();

  return (
    <div
      className={`${geistSans.className} ${geistMono.className} grid grid-rows-[80px_1fr_80px] min-h-screen p-4 font-[family-name:var(--font-geist-sans)]`}
    >
      <header className="flex justify-between items-center px-4">
        <Logo size="md" />
        <div className="flex gap-4">
          <Link 
            href="/login" 
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700"
          >
            <FaSignInAlt /> Giriş
          </Link>
          <Link 
            href="/signup" 
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-foreground text-background"
          >
            <FaUserPlus /> Kayıt Ol
          </Link>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center gap-8 text-center px-4">
        <Logo size="2xl" />
        
        <p className="text-xl max-w-lg mb-6">
          Sevgililerle gerçek zamanlı konum paylaşımı ve şarj durumu takibi için modern bir çözüm
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-3xl">
          <div className="flex flex-col items-center p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <FaUserPlus className="text-4xl mb-4 text-blue-500" />
            <h3 className="text-lg font-semibold mb-2">Hesap Oluştur</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Hızlı kayıt olun ve partner kodunuzu alın</p>
          </div>
          
          <div className="flex flex-col items-center p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <FaHeart className="text-4xl mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">Partner Ekle</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Partner kodunu kullanarak eşleşin</p>
          </div>
          
          <div className="flex flex-col items-center p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <FaMapMarkerAlt className="text-4xl mb-4 text-green-500" />
            <h3 className="text-lg font-semibold mb-2">Konumu Takip Et</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Canlı harita üzerinde şarj durumu ve konum paylaşımı</p>
          </div>
        </div>
        
        <div className="mt-8">
          <Link 
            href="/signup" 
            className="px-8 py-3 rounded-full bg-foreground text-background hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-lg font-medium"
          >
            Hemen Başla
          </Link>
        </div>
      </main>

      <footer className="flex justify-center items-center text-sm text-gray-500">
        <p>© 2023 SQLLove - Sevgi Her Yerde</p>
      </footer>
    </div>
  );
}

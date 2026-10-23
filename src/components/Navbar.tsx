"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import {
  ShoppingBag,
  Globe,
  User,
  ChevronDown,
  LogOut,
  ShieldCheck,
  Bike,
  UtensilsCrossed,
  MapPin,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function Navbar() {
  const { locale, toggleLocale, t } = useLanguage();
  const { totalItemCount } = useCart();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-[#FFE6D7]/70 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF5A36] to-[#FF8A65] flex items-center justify-center shadow-lg shadow-[#FF5A36]/30 group-hover:scale-105 transition-transform">
              <span className="text-2xl font-black text-white">খ</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-[#222222] font-bangla group-hover:text-[#FF5A36] transition-colors">
                  খালি খাই
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF5A36]/10 text-[#FF5A36] font-extrabold tracking-wide">
                  Khali Khai
                </span>
              </div>
              <span className="text-[10px] font-bold text-gray-500">
                {locale === "bn" ? "ভিন্ন রেস্টুরেন্ট • এক ডেলিভারি" : "Multi-Restaurant Food Delivery"}
              </span>
            </div>
          </Link>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-gray-700">
            <Link
              href="/location"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#FFEADB]/50 hover:text-[#FF5A36] transition-all"
            >
              <MapPin className="w-3.5 h-3.5 text-[#FF5A36]" />
              <span>{locale === "bn" ? "লোকেশন ও শহর" : "Location"}</span>
            </Link>

            <Link
              href="/restaurants"
              className="px-3 py-1.5 rounded-full hover:bg-[#FFEADB]/50 hover:text-[#FF5A36] transition-all"
            >
              {locale === "bn" ? "রেস্টুরেন্ট দেখুন" : "Explore Restaurants"}
            </Link>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Language Switch */}
            <button
              onClick={toggleLocale}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#FFE6D7] text-xs font-black text-[#222222] hover:bg-[#FFF5EC] transition-all shadow-xs"
              title="বাংলা / English"
            >
              <Globe className="w-3.5 h-3.5 text-[#FF5A36]" />
              <span>{locale === "bn" ? "EN" : "বাংলা"}</span>
            </button>

            {/* Cart Button */}
            <Link
              href="/checkout"
              className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-[#FFE6D7] text-[#222222] font-black text-xs hover:border-[#FF5A36] transition-all shadow-xs"
            >
              <ShoppingBag className="w-4 h-4 text-[#FF5A36]" />
              <span className="hidden sm:inline">{t.cart}</span>
              {totalItemCount > 0 && (
                <span className="flex items-center justify-center bg-[#FF5A36] text-white text-[10px] font-black h-4.5 min-w-[18px] px-1 rounded-full">
                  {totalItemCount}
                </span>
              )}
            </Link>

            {/* User Profile or Login Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 rounded-full bg-white border border-[#FFE6D7] hover:border-[#FF5A36] transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-[#FF5A36] text-white flex items-center justify-center text-xs font-black">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-[#222222] hidden sm:block max-w-[90px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:block" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#FFE6D7] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-black text-[#222222] truncate">{user.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-black bg-[#FF5A36]/10 text-[#FF5A36]">
                        {user.role}
                      </span>
                    </div>

                    {user.role === "CUSTOMER" && (
                      <Link
                        href="/dashboard/customer"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-[#FFF5EC] hover:text-[#FF5A36]"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        <span>কাস্টমার ড্যাশবোর্ড</span>
                      </Link>
                    )}

                    {user.role === "RESTAURANT_MANAGER" && (
                      <Link
                        href="/dashboard/restaurant"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-[#FFF5EC] hover:text-[#FF5A36]"
                      >
                        <UtensilsCrossed className="w-4 h-4 text-gray-400" />
                        <span>কিচেন পোর্টাল</span>
                      </Link>
                    )}

                    {user.role === "RIDER" && (
                      <Link
                        href="/dashboard/rider"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-[#FFF5EC] hover:text-[#FF5A36]"
                      >
                        <Bike className="w-4 h-4 text-gray-400" />
                        <span>রাইডার পোর্টাল</span>
                      </Link>
                    )}

                    {user.role === "ADMIN" && (
                      <Link
                        href="/dashboard/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-[#FFF5EC] hover:text-[#FF5A36]"
                      >
                        <ShieldCheck className="w-4 h-4 text-gray-400" />
                        <span>অ্যাডমিন প্যানেল</span>
                      </Link>
                    )}

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>লগআউট</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#FF5A36] to-[#E64A19] text-white font-black text-xs shadow-md shadow-[#FF5A36]/25 hover:shadow-lg hover:scale-102 active:scale-98 transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span>{locale === "bn" ? "লগইন" : "Sign In"}</span>
              </Link>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}

"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import {
  Lock,
  Mail,
  User,
  UtensilsCrossed,
  Bike,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";

function LoginForm() {
  const { locale, t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const demoAccounts = [
    {
      role: "CUSTOMER",
      name: "কাস্টমার (Customer)",
      email: "demo.customer@example.com",
      icon: User,
      color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
      target: "/location",
    },
    {
      role: "RESTAURANT_MANAGER",
      name: "রেস্টুরেন্ট ম্যানেজার (Manager)",
      email: "demo.restaurant@example.com",
      icon: UtensilsCrossed,
      color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
      target: "/dashboard/restaurant",
    },
    {
      role: "RIDER",
      name: "ডেলিভারি রাইডার (Rider)",
      email: "demo.rider@example.com",
      icon: Bike,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
      target: "/dashboard/rider",
    },
    {
      role: "ADMIN",
      name: "প্ল্যাটফর্ম অ্যাডমিন (Admin)",
      email: "demo.admin@example.com",
      icon: ShieldCheck,
      color: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
      target: "/dashboard/admin",
    },
  ];

  const performLogin = async (loginEmail: string, loginPass: string, defaultTarget?: string) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "লগইন ব্যর্থ হয়েছে");
      }

      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      // Role redirect
      if (data.user?.role === "ADMIN") {
        window.location.href = "/dashboard/admin";
      } else if (data.user?.role === "RESTAURANT_MANAGER") {
        window.location.href = "/dashboard/restaurant";
      } else if (data.user?.role === "RIDER") {
        window.location.href = "/dashboard/rider";
      } else {
        window.location.href = defaultTarget || "/location";
      }
    } catch (err: any) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  const handleQuickDemoLogin = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    setPassword("KhaliKhai@2026");
    performLogin(acc.email, "KhaliKhai@2026", acc.target);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F0]">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="text-center max-w-md mx-auto mb-10 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF735C] to-[#FFE2CF] flex items-center justify-center text-white font-black text-2xl mx-auto shadow-md">
            খ
          </div>
          <h1 className="text-3xl font-black text-[#343434] font-bangla">
            {t.login}
          </h1>
          <p className="text-xs text-gray-500">
            {locale === "bn"
              ? "খালি খাই অ্যাকাউন্টে সাইন ইন করুন অথবা ডেমো অ্যাকাউন্টে এক ক্লিকে প্রবেশ করুন"
              : "Sign in to Khali Khai or explore via 1-click seeded demo accounts"}
          </p>
        </div>

        {/* Demo Accounts Panel */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FFE2CF] shadow-warm mb-8">
          <div className="flex items-center gap-2 mb-4 text-xs font-black text-[#167D75] uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#FF735C]" />
            <span>ডেভেলপমেন্ট ডেমো অ্যাকাউন্টস (১-ক্লিক অটো লগইন)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {demoAccounts.map((acc) => {
              const Icon = acc.icon;
              return (
                <button
                  key={acc.role}
                  onClick={() => handleQuickDemoLogin(acc)}
                  disabled={loading}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${acc.color}`}
                >
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-white/80 flex items-center justify-center mb-2 shadow-xs">
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="font-black text-xs">{acc.name}</p>
                    <p className="text-[10px] opacity-80 mt-0.5 truncate">{acc.email}</p>
                  </div>
                  <span className="text-[10px] font-bold mt-3 block underline">
                    লগইন করুন →
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-[10px] text-gray-400 mt-3 text-center">
            সব ডেমো অ্যাকাউন্টের পাসওয়ার্ড: <code className="font-bold text-gray-700 bg-gray-100 px-1 py-0.5 rounded">KhaliKhai@2026</code>
          </p>
        </div>

        {/* Standard Email/Password Login Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FFE2CF] shadow-xs max-w-md mx-auto">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                ইমেইল ঠিকানা (Email)
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#FFF9F0] border border-[#FFE2CF] focus-within:border-[#FF735C]">
                <Mail className="w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-transparent border-none outline-none text-xs text-[#343434]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                পাসওয়ার্ড (Password)
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#FFF9F0] border border-[#FFE2CF] focus-within:border-[#FF735C]">
                <Lock className="w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-transparent border-none outline-none text-xs text-[#343434]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-[#FF735C] hover:bg-[#E25842] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>লগইন হচ্ছে...</span>
              ) : (
                <>
                  <span>লগইন করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            নতুন কাস্টমার?{" "}
            <Link href="/register" className="font-bold text-[#167D75] hover:underline">
              নিবন্ধন করুন (Register)
            </Link>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center text-xs font-bold text-gray-400">লোড হচ্ছে...</div>}>
      <LoginForm />
    </Suspense>
  );
}

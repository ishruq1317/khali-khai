"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { User, Mail, Phone, Lock, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

export default function RegisterPage() {
  const { locale, t } = useLanguage();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "নিবন্ধন ব্যর্থ হয়েছে");
      }

      window.location.href = "/dashboard/customer";
    } catch (err: any) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F0]">
      <Navbar />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-12">
        <div className="text-center mb-8 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF735C] to-[#FFE2CF] flex items-center justify-center text-white font-black text-2xl mx-auto shadow-md">
            খ
          </div>
          <h1 className="text-3xl font-black text-[#343434] font-bangla">
            {t.register}
          </h1>
          <p className="text-xs text-gray-500">
            {locale === "bn"
              ? "খালি খাই-তে অ্যাকাউন্ট তৈরি করে উপভোগ করুন প্রথম অর্ডারে ডেলিভারি ছাড়"
              : "Create an account and enjoy special first-order delivery benefits"}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FFE2CF] shadow-warm">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                আপনার নাম (Full Name)
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#FFF9F0] border border-[#FFE2CF] focus-within:border-[#FF735C]">
                <User className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: তানভীর আহমেদ"
                  required
                  className="w-full bg-transparent border-none outline-none text-xs text-[#343434]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                ইমেইল (Email)
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
                মোবাইল নম্বর (Phone)
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#FFF9F0] border border-[#FFE2CF] focus-within:border-[#FF735C]">
                <Phone className="w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
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
                  placeholder="কমপক্ষে ৬ অক্ষর"
                  required
                  minLength={6}
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
                <span>অ্যাকাউন্ট তৈরি হচ্ছে...</span>
              ) : (
                <>
                  <span>নিবন্ধন সম্পন্ন করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
            <Link href="/login" className="font-bold text-[#167D75] hover:underline">
              লগইন করুন (Login)
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

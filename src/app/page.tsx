"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AnimatedBrandTitle } from "@/components/AnimatedBrandTitle";
import { useLanguage } from "@/context/LanguageContext";
import {
  ArrowRight,
  Sparkles,
  MapPin,
  UtensilsCrossed,
  Flame,
  Star,
} from "lucide-react";

export default function HomePage() {
  const { locale, t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#FFF5EC] via-[#FFEADB] to-[#FFF0E5] relative overflow-hidden select-none">
      <Navbar />

      {/* Floating Animated Food Objects in Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        
        {/* Ambient Glow Lights */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF5A36]/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[32rem] h-[32rem] bg-[#FFB300]/15 rounded-full blur-3xl" />

        {/* Floating Food Object 1: Kacchi Biryani (Top Left) */}
        <div className="absolute top-16 left-6 sm:left-16 w-44 sm:w-56 glass-card p-3 rounded-3xl shadow-food animate-drift-1">
          <div className="relative h-28 sm:h-36 rounded-2xl overflow-hidden mb-2">
            <img
              src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=70"
              alt="Kacchi Biryani"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-white flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>4.9</span>
            </div>
          </div>
          <p className="text-xs font-black text-[#222222] truncate">শাহী মাটন কাচ্চি</p>
          <p className="text-[10px] text-[#E64A19] font-bold">ধানমণ্ডি বিরিয়ানি হাউস</p>
        </div>

        {/* Floating Food Object 2: Smashed Beef Burger (Top Right) */}
        <div className="absolute top-12 right-6 sm:right-20 w-48 sm:w-60 glass-card p-3 rounded-3xl shadow-food animate-drift-2">
          <div className="relative h-32 sm:h-40 rounded-2xl overflow-hidden mb-2">
            <img
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=70"
              alt="Gourmet Burger"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-[#FF5A36] text-white text-[9px] font-black px-2 py-0.5 rounded-full">
              হট ফেভারিট 🔥
            </div>
          </div>
          <p className="text-xs font-black text-[#222222] truncate">ডাবল চিজ স্ম্যাশ বার্গার</p>
          <p className="text-[10px] text-[#0D8275] font-bold">ক্রাঞ্চ বার্গার অ্যান্ড ফ্রাইস</p>
        </div>

        {/* Floating Food Object 3: Chittagong Kala Bhuna (Bottom Left) */}
        <div className="absolute bottom-20 left-4 sm:left-24 w-44 sm:w-56 glass-card p-3 rounded-3xl shadow-food animate-drift-3">
          <div className="relative h-28 sm:h-36 rounded-2xl overflow-hidden mb-2">
            <img
              src="https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=70"
              alt="Chittagong Kala Bhuna"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-[#0D8275] text-white text-[9px] font-black px-2 py-0.5 rounded-full">
              চট্টগ্রাম স্পেশাল
            </div>
          </div>
          <p className="text-xs font-black text-[#222222] truncate">চাটগাঁর কালা ভুনা</p>
          <p className="text-[10px] text-[#E64A19] font-bold">চিটাগং মেজবান হাউস</p>
        </div>

        {/* Floating Food Object 4: Cheesy Pepperoni Pizza (Bottom Right) */}
        <div className="absolute bottom-16 right-6 sm:right-28 w-48 sm:w-60 glass-card p-3 rounded-3xl shadow-food animate-drift-4">
          <div className="relative h-32 sm:h-40 rounded-2xl overflow-hidden mb-2">
            <img
              src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=70"
              alt="Cheesy Pizza"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 right-2 bg-white/90 text-[#FF5A36] text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
              ৳৩৫০
            </div>
          </div>
          <p className="text-xs font-black text-[#222222] truncate">চিজ লোডেড পিজ্জা</p>
          <p className="text-[10px] text-gray-500 font-bold">ইতালিয়ান ক্রাস্ট</p>
        </div>

      </div>

      {/* Centerpiece Hero Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 relative z-10 py-16 sm:py-24 max-w-4xl mx-auto">
        
        {/* Subtle Pill Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[#FF5A36]/30 text-xs font-black text-[#E64A19] shadow-sm mb-6 animate-in fade-in zoom-in-95 duration-200">
          <Flame className="w-4 h-4 text-[#FF5A36]" />
          <span>{locale === "bn" ? "ভিন্ন রেস্টুরেন্ট • এক কার্ট • এক ডেলিভারি প্ল্যান" : "Different Restaurants • One Smart Cart"}</span>
        </div>

        {/* Dominant Brand Typography with Staggered Kinetic Letter Reveal */}
        <div className="space-y-3 mb-6">
          <AnimatedBrandTitle />

          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#E64A19] tracking-wide">
              Khali Khai
            </span>
            <span className="w-2 h-2 rounded-full bg-[#E64A19]" />
            <span className="text-sm sm:text-base font-bold text-[#0D8275] tracking-wider uppercase">
              সমগ্র বাংলাদেশ
            </span>
          </div>
        </div>

        {/* Slogan */}
        <p className="text-base sm:text-xl text-[#333333] max-w-xl mx-auto font-medium leading-relaxed mb-10">
          {t.tagline}
        </p>

        {/* Single Dominant Glowing CTA Button leading to Login */}
        <div className="w-full max-w-xs sm:max-w-sm">
          <Link
            href="/login"
            className="w-full py-4 px-8 rounded-full bg-gradient-to-r from-[#FF5A36] via-[#FF451A] to-[#E64A19] text-white font-black text-base sm:text-lg shadow-2xl shadow-[#FF5A36]/40 hover:shadow-3xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group animate-cta-pulse"
          >
            <span>{locale === "bn" ? "লগইন করুন / শুরু করুন" : "Sign In / Get Started"}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Quick Division Highlights */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold text-gray-600 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/60">
          <span className="flex items-center gap-1 text-[#E64A19]">
            <MapPin className="w-3.5 h-3.5" />
            <span>ঢাকা</span>
          </span>
          <span>•</span>
          <span>চট্টগ্রাম</span>
          <span>•</span>
          <span>সিলেট</span>
          <span>•</span>
          <span>কক্সবাজার</span>
          <span>•</span>
          <span>রাজশাহী</span>
          <span>•</span>
          <span>খুলনা</span>
          <span>•</span>
          <span>বরিশাল</span>
          <span>•</span>
          <span>রংপুর</span>
        </div>

      </main>

      <Footer />
    </div>
  );
}

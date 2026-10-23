"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Search, MapPin, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export function LandingHero() {
  const { locale, t } = useLanguage();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("Dhanmondi");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/restaurants?q=${encodeURIComponent(searchQuery)}&area=${selectedArea}`);
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-[#FFE2CF]/50 via-[#DDF5E5]/40 to-[#FFF9F0] blur-3xl -z-10 pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text & Form Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFE2CF] border border-[#FF735C]/30 text-xs font-bold text-[#FF735C] shadow-xs">
              <Sparkles className="w-4 h-4 text-[#FF735C]" />
              <span>{locale === "bn" ? "ভিন্ন রেস্টুরেন্ট • এক কার্ট • এক ডেলিভারি প্ল্যান" : "Different Restaurants • One Smart Cart"}</span>
            </div>

            {/* Dominant Brand Typography */}
            <div className="space-y-2">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-[#343434] tracking-tight font-bangla leading-[1.15]">
                {t.brandName}
              </h1>
              <p className="text-xl sm:text-2xl font-bold text-[#167D75]">
                {t.tagline}
              </p>
            </div>

            <p className="text-sm sm:text-base text-[#343434]/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {t.heroSubtitle}
            </p>

            {/* Interactive Search & Location Box */}
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-3xl shadow-warm border border-[#FFE2CF] max-w-xl mx-auto lg:mx-0 space-y-3"
            >
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Area Select */}
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-[#FFF9F0] border border-[#FFE2CF] text-xs font-medium text-[#343434] sm:w-44">
                  <MapPin className="w-4 h-4 text-[#FF735C] shrink-0" />
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs font-bold text-[#343434] w-full cursor-pointer"
                  >
                    <option value="Dhanmondi">ধানমণ্ডি (Dhanmondi)</option>
                    <option value="Gulshan">গুলশান (Gulshan)</option>
                    <option value="Banani">বনানী (Banani)</option>
                    <option value="all">সব এলাকা (All)</option>
                  </select>
                </div>

                {/* Query Input */}
                <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-white border border-[#FFE2CF] focus-within:border-[#FF735C] transition-colors">
                  <Search className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full bg-transparent border-none outline-none text-xs font-medium text-[#343434] placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-[#FF735C] to-[#E25842] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#FF735C]/25 hover:shadow-lg hover:scale-101 active:scale-98 transition-all"
                >
                  <span>{t.orderNow}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <Link
                  href="/restaurants"
                  className="flex items-center justify-center py-3 px-5 rounded-2xl bg-[#DDF5E5] text-[#167D75] font-bold text-xs sm:text-sm hover:bg-[#cbf0d7] transition-all"
                >
                  {t.exploreRestaurants}
                </Link>
              </div>
            </form>

            {/* Quick Benefits Checkmarks */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-[#167D75]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2A9D6A]" />
                {locale === "bn" ? "এক ডেলিভারি চার্জ" : "One Shared Delivery Fee"}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2A9D6A]" />
                {locale === "bn" ? "গরম ও সতেজ খাবার" : "Synchronized Fresh Pickups"}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2A9D6A]" />
                {locale === "bn" ? "১৫+ অর্ডারে ২৫% ছাড়" : "25% Off Next Month for 15+ Orders"}
              </span>
            </div>

          </div>

          {/* Right Floating Food Objects Showcase (5 cols) */}
          <div className="lg:col-span-5 relative h-[380px] sm:h-[420px] flex items-center justify-center">
            
            {/* Center Main Card: Shared Delivery Route Snapshot */}
            <div className="z-20 w-72 sm:w-80 rounded-3xl bg-white p-5 shadow-warm-lg border border-[#FFE2CF] animate-float-1">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-[#167D75]">
                    {locale === "bn" ? "স্মার্ট শেয়ার্ড রুট সক্রিয়" : "Smart Route Active"}
                  </span>
                </div>
                <span className="text-[11px] font-black bg-[#DDF5E5] text-[#167D75] px-2 py-0.5 rounded-full">
                  ৳৯০ সাশ্রয়
                </span>
              </div>

              {/* Clustered 3 items preview */}
              <div className="py-3 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700">ধানমণ্ডি বিরিয়ানি হাউস</span>
                  <span className="font-bold text-[#FF735C]">৳৩৬০</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700">চিটাগং মেজবান অ্যান্ড কাবাব</span>
                  <span className="font-bold text-[#FF735C]">৳৩২০</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700">চা খোর ও স্ন্যাকস কর্নার</span>
                  <span className="font-bold text-[#FF735C]">৳৯০</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <div>
                  <p className="text-[11px] text-gray-400 line-through">আলাদা ডেলিভারি: ৳১৮০</p>
                  <p className="font-black text-[#167D75]">শেয়ার্ড ডেলিভারি: মাত্র ৳৯০</p>
                </div>
                <Link
                  href="/restaurants"
                  className="px-3 py-1.5 rounded-xl bg-[#FF735C] text-white font-bold text-[11px] hover:bg-[#E25842] transition-colors"
                >
                  ট্রাই করুন
                </Link>
              </div>
            </div>

            {/* Floating Food Card 1: Biryani (Top Right) */}
            <div className="absolute top-2 -right-4 sm:right-2 z-10 w-44 rounded-2xl bg-white/95 p-2.5 shadow-md border border-[#FFE2CF] animate-float-2">
              <img
                src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=60"
                alt="Biryani"
                className="w-full h-20 object-cover rounded-xl mb-1.5"
              />
              <p className="text-[11px] font-bold text-[#343434] truncate">মাটন কাচ্চি বিরিয়ানি</p>
              <p className="text-[10px] text-[#167D75] font-semibold">ধানমণ্ডি বিরিয়ানি</p>
            </div>

            {/* Floating Food Card 2: Burger (Bottom Left) */}
            <div className="absolute bottom-4 -left-4 sm:left-2 z-30 w-44 rounded-2xl bg-white/95 p-2.5 shadow-md border border-[#FFE2CF] animate-float-3">
              <img
                src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=60"
                alt="Smash Burger"
                className="w-full h-20 object-cover rounded-xl mb-1.5"
              />
              <p className="text-[11px] font-bold text-[#343434] truncate">স্ম্যাশ বিফ বার্গার</p>
              <p className="text-[10px] text-[#167D75] font-semibold">ক্রাঞ্চ বার্গার</p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

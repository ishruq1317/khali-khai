"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { ShoppingCart, Route, Bike, Clock, Sparkles } from "lucide-react";

export function MultiCartExplainer() {
  const { locale, t } = useLanguage();

  return (
    <section id="how-it-works" className="py-16 bg-[#FFF9F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFE2CF] text-[#FF735C] text-xs font-bold">
            <Sparkles className="w-4 h-4 text-[#FF735C]" />
            <span>{t.howItWorks}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#343434] tracking-tight font-bangla">
            {t.multiCartHeadline}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
            {t.multiCartDesc}
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Step 1 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FFE2CF] shadow-warm relative">
            <div className="w-12 h-12 rounded-2xl bg-[#FFE2CF] text-[#FF735C] flex items-center justify-center font-black text-lg mb-6 shadow-xs">
              ১
            </div>
            <h3 className="text-lg font-black text-[#343434] mb-2 font-bangla">
              {locale === "bn" ? "পছন্দের খাবার কার্টে নিন" : "Add from Multiple Places"}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {locale === "bn"
                ? "একই এলাকার বিরিয়ানি হাউস থেকে কাচ্চি, বার্গার শপ থেকে ফ্রাইস এবং ক্যাফে থেকে মালাই চা—সব এক কার্টেই যোগ করুন।"
                : "Select Kacchi from Biryani House, cheesy fries from the burger joint, and clay-cup tea from the café into one single unified cart."}
            </p>
            <div className="mt-5 p-3 rounded-2xl bg-[#FFF9F0] border border-[#FFE2CF] flex items-center gap-3">
              <ShoppingCart className="w-5 h-5 text-[#FF735C]" />
              <span className="text-[11px] font-bold text-gray-700">
                ৩টি ভিন্ন রেস্টুরেন্ট = ১টি কার্ট
              </span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FFE2CF] shadow-warm relative">
            <div className="w-12 h-12 rounded-2xl bg-[#DDF5E5] text-[#167D75] flex items-center justify-center font-black text-lg mb-6 shadow-xs">
              ২
            </div>
            <h3 className="text-lg font-black text-[#343434] mb-2 font-bangla">
              {locale === "bn" ? "স্মার্ট রুট ও টাইমিং সিঙ্ক" : "Smart Logistics & Prep Sync"}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {locale === "bn"
                ? "আমাদের অ্যালগরিদম প্রতিটি কিচেনের রান্নার সময় হিসাব করে রাইডারকে এমনভাবে গাইড করে যাতে খাবার কোনোভাবেই ঠান্ডা না হয়।"
                : "Our logistics engine synchronizes kitchen preparation times and calculates the fastest pickup order to keep your food piping hot."}
            </p>
            <div className="mt-5 p-3 rounded-2xl bg-[#FFF9F0] border border-[#FFE2CF] flex items-center gap-3">
              <Route className="w-5 h-5 text-[#167D75]" />
              <span className="text-[11px] font-bold text-gray-700">
                ৫০০-৬০০ মিটারের স্মার্ট ক্লাস্টার
              </span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FFE2CF] shadow-warm relative">
            <div className="w-12 h-12 rounded-2xl bg-[#FFE2CF] text-[#FF735C] flex items-center justify-center font-black text-lg mb-6 shadow-xs">
              ৩
            </div>
            <h3 className="text-lg font-black text-[#343434] mb-2 font-bangla">
              {locale === "bn" ? "এক রাইডারে দ্রুত ডেলিভারি" : "One Fast Shared Delivery"}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {locale === "bn"
                ? "একজন দক্ষ রাইডার পর্যায়ক্রমে সব খাবার পিকআপ করে আপনার দরজায় পৌঁছে দেন। আপনি সাশ্রয় করেন ডেলিভারি ফি!"
                : "One dedicated rider completes the collection run and arrives at your door. Transparent pricing with massive delivery savings."}
            </p>
            <div className="mt-5 p-3 rounded-2xl bg-[#FFF9F0] border border-[#FFE2CF] flex items-center gap-3">
              <Bike className="w-5 h-5 text-[#FF735C]" />
              <span className="text-[11px] font-bold text-gray-700">
                এক ডেলিভারি চার্জে সব খাবার
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

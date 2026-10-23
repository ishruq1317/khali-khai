"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Award, Gift, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export function LoyaltyBanner() {
  const { locale, t } = useLanguage();

  return (
    <section id="loyalty" className="py-16 bg-white border-t border-[#FFE2CF]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-gradient-to-br from-[#167D75] to-[#0F5852] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-warm-lg">
          
          {/* Subtle Decorative Background Rings */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute -right-10 -top-10 w-60 h-60 rounded-full border border-white/15 pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left Content (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white border border-white/20">
                <Award className="w-4 h-4 text-[#FFE2CF]" />
                <span>{locale === "bn" ? "খালি খাই রয়াল লয়্যালটি প্রোগ্রাম" : "Khali Khai Royal Loyalty"}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight font-bangla text-white leading-tight">
                {t.monthlyLoyaltyTitle}
              </h2>

              <p className="text-xs sm:text-sm text-white/85 leading-relaxed max-w-2xl">
                {locale === "bn"
                  ? "একই ক্যালেন্ডার মাসে ১৫টি সফল অর্ডার সম্পন্ন করলেই আপনি পাচ্ছেন পরবর্তী পুরো এক মাসের জন্য প্রতিটি অর্ডারে নিশ্চিত ২৫% ডেলিভারি ডিসকাউন্ট! কোনো লুকানো শর্ত নেই।"
                  : "Complete 15 qualifying orders in any calendar month to unlock a flat 25% discount on all delivery fees for the entire next month! Fully automatic and transparent."}
              </p>

              {/* Progress Simulation Pill */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 max-w-md space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span>{locale === "bn" ? "মাসিক লয়্যালটি লক্ষ্যমাত্রা:" : "Monthly Loyalty Goal:"}</span>
                  <span className="text-[#FFE2CF] font-black">১৫টি অর্ডার</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#FF735C] to-[#FFE2CF] h-full rounded-full transition-all"
                    style={{ width: "20%" }}
                  />
                </div>
                <p className="text-[11px] text-white/80">
                  {locale === "bn" ? "প্রতি মাসে ০ থেকে শুরু: ১৫টি অর্ডার পূরণ করলেই পরবর্তী মাসে ২৫% ছাড়!" : "Resets monthly: complete 15 orders within 30 days to enjoy 25% off next month!"}
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#FF735C] hover:bg-[#E25842] text-white text-xs sm:text-sm font-bold shadow-md transition-all"
                >
                  <span>{locale === "bn" ? "আপনার লয়্যালটি প্রোগ্রেস দেখুন" : "View Your Loyalty Progress"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Badge Graphic (4 cols) */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="w-56 h-56 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center text-center p-6 shadow-inner">
                <Gift className="w-12 h-12 text-[#FFE2CF] mb-2 animate-bounce" />
                <span className="text-4xl font-black text-[#FFE2CF] font-bangla">২৫%</span>
                <span className="text-xs font-bold uppercase tracking-wider text-white mt-1">
                  {locale === "bn" ? "ডেলিভারি ছাড়" : "Delivery Discount"}
                </span>
                <span className="text-[10px] text-white/70 mt-1">
                  {locale === "bn" ? "পরবর্তী মাস জুড়ে" : "All Next Month Long"}
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

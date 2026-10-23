"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { calculatePricing } from "@/lib/pricing";
import { Calculator, Check, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

export function SavingsCalculator() {
  const { locale, t } = useLanguage();
  const [selectedCount, setSelectedCount] = useState<number>(3);
  const [distanceKm, setDistanceKm] = useState<number>(3.0);

  // Generate synthetic coordinates based on selectedCount
  const baseLat = 23.7461;
  const baseLng = 90.3752;
  const restaurantCoords = [];
  for (let i = 0; i < selectedCount; i++) {
    restaurantCoords.push({
      lat: baseLat + i * 0.0018, // ~200m apart in cluster
      lng: baseLng + i * 0.0012,
    });
  }

  const pricing = calculatePricing({
    foodSubtotal: 800,
    restaurantCount: selectedCount,
    restaurantCoordinates: restaurantCoords,
    customerCoordinates: {
      lat: baseLat + (distanceKm / 111),
      lng: baseLng,
    },
    baseDeliveryFee: 50,
    additionalStopFee: 25,
    perKmRate: 12,
  });

  return (
    <section id="savings-calc" className="py-16 bg-white border-y border-[#FFE2CF]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#DDF5E5] text-[#167D75] text-xs font-bold">
            <Calculator className="w-4 h-4 text-[#167D75]" />
            <span>{t.savingsCalculator}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#343434] tracking-tight font-bangla">
            {locale === "bn"
              ? "আলাদা বনাম স্মার্ট শেয়ার্ড ডেলিভারির খরচ তুলনা"
              : "Separate vs. Combined Delivery Fee Comparison"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            {locale === "bn"
              ? "ঐতিহ্যবাহী ডেলিভারিতে প্রতিটি রেস্টুরেন্টের জন্য আলাদা ডেলিভারি চার্জ গুনতে হয়। খালি খাই-তে এক স্মার্ট রুটে ডেলিভারি এনে বাঁচান টাকা।"
              : "Traditional platforms charge a full independent delivery fee for every single restaurant. With Khali Khai, synchronized routes let you save significantly."}
          </p>
        </div>

        {/* Interactive Calculator Box */}
        <div className="max-w-4xl mx-auto bg-[#FFF9F0] rounded-3xl p-6 sm:p-10 border border-[#FFE2CF] shadow-warm">
          
          {/* Controls: Restaurant Count & Distance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 pb-8 border-b border-[#FFE2CF]">
            {/* Restaurant Count Picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#167D75] mb-2">
                {locale === "bn" ? "রেস্টুরেন্ট সংখ্যা বেছে নিন" : "Select Number of Restaurants"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSelectedCount(num)}
                    className={`py-2.5 rounded-2xl font-black text-xs transition-all ${
                      selectedCount === num
                        ? "bg-[#FF735C] text-white shadow-md shadow-[#FF735C]/25"
                        : "bg-white text-gray-700 border border-[#FFE2CF] hover:border-[#FF735C]"
                    }`}
                  >
                    {num} {locale === "bn" ? "টি দোকান" : num === 1 ? "Restaurant" : "Restaurants"}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#167D75]">
                  {locale === "bn" ? "গ্রাহকের দূরত্ব" : "Distance to Customer"}
                </label>
                <span className="text-xs font-extrabold text-[#343434] bg-white px-2 py-0.5 rounded-lg border border-[#FFE2CF]">
                  {distanceKm.toFixed(1)} কিমি (km)
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="8.0"
                step="0.5"
                value={distanceKm}
                onChange={(e) => setDistanceKm(parseFloat(e.target.value))}
                className="w-full accent-[#FF735C] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>১ কিমি (কাছে)</span>
                <span>৮ কিমি (সর্বোচ্চ রেঞ্জ)</span>
              </div>
            </div>
          </div>

          {/* Pricing Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            
            {/* Plan A: Separate Delivery (Traditional) */}
            <div className="bg-white rounded-2xl p-5 border border-red-200/60 shadow-xs flex flex-col justify-between">
              <div>
                <span className="inline-block text-[10px] font-black uppercase tracking-wider text-red-500 bg-red-50 px-2 py-0.5 rounded-md mb-2">
                  {locale === "bn" ? "সাধারণ আলাদা অর্ডার" : "Separate Orders (Traditional)"}
                </span>
                <p className="text-2xl font-black text-[#343434] mb-3">
                  ৳{pricing.separateDeliveryFee}
                </p>
                <div className="space-y-1.5 text-xs text-gray-600">
                  {pricing.breakdown.individualRestaurantFees.map((fee, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>রেস্টুরেন্ট #{idx + 1} ডেলিভারি:</span>
                      <span className="font-semibold text-gray-800">৳{fee}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-4 pt-3 border-t border-gray-100">
                {selectedCount} জন আলাদা রাইডার আলাদা ট্রিপে খাবার আনবে।
              </p>
            </div>

            {/* Plan B: Khali Khai Shared Delivery */}
            <div className="bg-gradient-to-b from-[#DDF5E5]/50 to-white rounded-2xl p-5 border-2 border-[#167D75] shadow-md flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#167D75] text-white text-[10px] font-black px-3 py-0.5 rounded-bl-xl">
                স্মার্ট প্ল্যান
              </div>
              <div>
                <span className="inline-block text-[10px] font-black uppercase tracking-wider text-[#167D75] bg-[#DDF5E5] px-2 py-0.5 rounded-md mb-2">
                  {locale === "bn" ? "খালি খাই শেয়ার্ড ডেলিভারি" : "Khali Khai Shared Plan"}
                </span>
                <p className="text-2xl font-black text-[#167D75] mb-3">
                  ৳{pricing.combinedDeliveryFee}
                </p>
                <div className="space-y-1 text-xs text-[#343434]">
                  <div className="flex justify-between">
                    <span>বেস ডেলিভারি ফি:</span>
                    <span className="font-semibold">৳{pricing.breakdown.baseFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>অতিরিক্ত পিকআপ ফি:</span>
                    <span className="font-semibold">৳{pricing.breakdown.extraStopsFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>দূরত্ব সমন্বয়:</span>
                    <span className="font-semibold">৳{pricing.breakdown.distanceFee}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#DDF5E5] flex items-center gap-1.5 text-[11px] text-[#167D75] font-bold">
                <Zap className="w-3.5 h-3.5 text-[#2A9D6A]" />
                <span>১ জন রাইডারে দ্রুত ও সাশ্রয়ী ডেলিভারি</span>
              </div>
            </div>

            {/* Total Savings Card */}
            <div className="bg-gradient-to-br from-[#FFE2CF] to-[#FFF9F0] rounded-2xl p-5 border border-[#FF735C]/40 shadow-md flex flex-col justify-between text-center">
              <div>
                <span className="inline-block text-[10px] font-black uppercase tracking-wider text-[#FF735C] bg-white px-2.5 py-0.5 rounded-full mb-2">
                  {t.yourSavings}
                </span>
                <p className="text-3xl sm:text-4xl font-black text-[#FF735C] my-2">
                  ৳{pricing.deliverySavings}
                </p>
                <p className="text-xs text-gray-700 font-medium">
                  {locale === "bn"
                    ? `আপনি ডেলিভারি চার্জে এক অর্ডারে ৳${pricing.deliverySavings} সাশ্রয় করছেন!`
                    : `You save ৳${pricing.deliverySavings} on delivery fees in just one order!`}
                </p>
              </div>

              <div className="mt-4">
                <Link
                  href="/restaurants"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#FF735C] text-white text-xs font-bold hover:bg-[#E25842] shadow-sm transition-all"
                >
                  <span>{t.orderNow}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>

          {/* Operational Fairness Note */}
          <div className="mt-6 pt-5 border-t border-[#FFE2CF] flex items-center justify-between flex-wrap gap-3 text-[11px] text-gray-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#167D75]" />
              {locale === "bn"
                ? `রাইডার ফেয়ার পে-আউট সুরক্ষিত: এই ট্রিপে রাইডার পাবেন আনুমানিক ৳${pricing.riderPayout}`
                : `Rider Fair Compensation Protected: Estimated rider payout ৳${pricing.riderPayout}`}
            </span>
            <span className="text-gray-400">
              * দূরত্বের উপর ভিত্তি করে সিস্টেমে স্বয়ংক্রিয়ভাবে বাস্তবায়ন হয়
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}

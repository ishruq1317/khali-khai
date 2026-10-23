"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Star, ChevronDown, ChevronUp, Quote, Sparkles } from "lucide-react";
import Link from "next/link";

export function TestimonialsAndFaq() {
  const { locale, t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const testimonials = [
    {
      name: "নাফিসা আনজুম (ধানমণ্ডি)",
      role: "খাবারপ্রেমী গ্রাহক (Verified Demo)",
      comment:
        "আমার প্রিয় কাচ্চি এক দোকান থেকে আর ফ্রেন্ডদের জন্য বার্গার অন্য দোকান থেকে আনিয়েছি। আলাদা আলাদা ডেলিভারি ফি দিতে হয়নি, একটাই চার্জে একসাথে চলে এসেছে!",
      rating: 5,
    },
    {
      name: "ইমতিয়াজ মাহমুদ (ধানমণ্ডি)",
      role: "নিয়মিত ব্যবহারকারী (Verified Demo)",
      comment:
        "গত মাসে ১৬টা অর্ডার কমপ্লিট করার পর এই পুরো মাস জুড়ে ২৫% ডেলিভারি ডিসকাউন্ট পাচ্ছি! খালি খাই-এর এই লয়্যালটি অফারটা আসলেই দুর্দান্ত।",
      rating: 5,
    },
    {
      name: "রফিকুল ইসলাম",
      role: "রেস্টুরেন্ট পার্টনার (ম্যানেজার)",
      comment:
        "কিচেন প্রিপারেশন টাইম দিয়ে রাখা যায়, ফলে রাইডার এসে অহেতুক ভিড় করে না। খাবার রেডি হতেই রাইডার পিক করে নিয়ে যায়।",
      rating: 5,
    },
  ];

  const faqs = [
    {
      q: "একসাথে কয়টি রেস্টুরেন্ট থেকে খাবার অর্ডার করা যায়?",
      a: "আপনি একই এলাকার (৫০০-৬০০ মিটারের মধ্যকার ক্লাস্টার) ২ বা ৩টি রেস্টুরেন্ট থেকে একই সাথে একটি কার্টে আইটেম যোগ করে অর্ডার করতে পারেন।",
    },
    {
      q: "শেয়ার্ড ডেলিভারিতে খাবার কি গরম ও সতেজ থাকবে?",
      a: "হ্যাঁ! আমাদের স্মার্ট অ্যালগরিদম প্রতিটি রেস্টুরেন্টের কিচেন টাইমিং বিবেচনা করে রাইডারকে স্ট্যাগার্ড সময় অনুযায়ী পাঠায়। রান্নার সময়ের ব্যবধান ২০ মিনিটের বেশি হলে গ্রাহককে অবগত করে স্প্লিট ডেলিভারি দেওয়া হয়।",
    },
    {
      q: "মাসে ১৫+ অর্ডারের ২৫% লয়্যালটি ডিসকাউন্ট কীভাবে কাজ করে?",
      a: "এশিয়া/ঢাকা টাইমজোনে প্রতি ক্যালেন্ডার মাসে যখন আপনার মোট সফল ডেলিভারি ১৫টি অতিক্রম করবে (১৬তম অর্ডার থেকে), তখন পরবর্তী ক্যালেন্ডার মাসের ১ তারিখ থেকে শেষ দিন পর্যন্ত স্বয়ংক্রিয়ভাবে ২৫% ডেলিভারি ছাড় পাবেন।",
    },
    {
      q: "কোন কোন পেমেন্ট মাধ্যম গ্রহণ করা হয়?",
      a: "বিকাশ (bKash), নগদ (Nagad), ডেবিট/ক্রেডিট কার্ড এবং ক্যাশ অন ডেলিভারি (COD) এর মাধ্যমে একবারে একটি সহজ পেমেন্টে সম্পূর্ণ অর্ডার কনফার্ম করা যায়।",
    },
  ];

  return (
    <section className="py-16 bg-[#FFF9F0] border-t border-[#FFE2CF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Testimonials */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE2CF] text-[#FF735C] text-xs font-bold">
              <Quote className="w-4 h-4 text-[#FF735C]" />
              <span>{t.testimonials}</span>
            </div>
            <h2 className="text-3xl font-black text-[#343434] font-bangla">
              {locale === "bn" ? "আমাদের সন্তুষ্ট গ্রাহকদের অভিজ্ঞতা" : "What Our Food Lovers Say"}
            </h2>
            <p className="text-xs text-gray-500">
              {locale === "bn" ? "*পরীক্ষামূলক ডেমো পর্যালোচনার ভিত্তিতে সংকলিত" : "*Based on verified demonstration experience"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-[#FFE2CF] shadow-warm flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 text-amber-400 mb-3">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed italic mb-4">
                    "{item.comment}"
                  </p>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs font-black text-[#343434]">{item.name}</p>
                  <p className="text-[11px] text-[#167D75] font-semibold">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div id="faq" className="max-w-3xl mx-auto">
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-3xl font-black text-[#343434] font-bangla">
              {t.faqs}
            </h2>
            <p className="text-xs text-gray-500">
              {locale === "bn" ? "খালি খাই প্ল্যাটফর্ম সম্পর্কিত সাধারণ প্রশ্ন ও উত্তর" : "Common queries about Khali Khai"}
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#FFE2CF] shadow-xs overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-4.5 flex items-center justify-between text-xs sm:text-sm font-bold text-[#343434] hover:text-[#FF735C] transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-[#FF735C] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-4.5 pb-4.5 text-xs text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Partnership CTAs */}
        <div className="mt-16 bg-gradient-to-r from-[#FFE2CF]/80 via-white to-[#DDF5E5]/70 rounded-3xl p-8 border border-[#FFE2CF] shadow-warm text-center space-y-4">
          <h3 className="text-xl sm:text-2xl font-black text-[#343434] font-bangla">
            {locale === "bn" ? "খালি খাই নেটওয়ার্কে যুক্ত হতে চান?" : "Want to Join the Khali Khai Network?"}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
            {locale === "bn"
              ? "রেস্টুরেন্ট পার্টনার হয়ে বিক্রি বাড়ান অথবা রাইডার হিসেবে কাজ করে স্মার্ট ট্রিপে নিশ্চিত আয় করুন।"
              : "Grow your restaurant business with aggregated orders or earn fair payouts on coordinated delivery trips."}
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              href="/login"
              className="px-6 py-2.5 rounded-full bg-[#167D75] text-white text-xs font-bold hover:bg-[#0F5852] transition-all shadow-xs"
            >
              {t.restaurantPartner}
            </Link>
            <Link
              href="/login"
              className="px-6 py-2.5 rounded-full bg-[#FF735C] text-white text-xs font-bold hover:bg-[#E25842] transition-all shadow-xs"
            >
              {t.riderPartner}
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}

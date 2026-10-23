"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import {
  MapPin,
  Navigation,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Building2,
  Compass,
} from "lucide-react";

export default function LocationPermissionPage() {
  const { locale } = useLanguage();
  const router = useRouter();
  const { setCustomerCoordinates } = useCart();
  const [detecting, setDetecting] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const bangladeshCities = [
    {
      id: "savar-radio-colony",
      nameBn: "সাভার (রেডিও কলোনি)",
      nameEn: "Savar (Radio Colony)",
      lat: 23.8480,
      lng: 90.2600,
      tag: "সক্রিয় ক্লাস্টার",
      area: "Radio Colony",
    },
    {
      id: "dhaka-dhanmondi",
      nameBn: "ঢাকা (ধানমণ্ডি)",
      nameEn: "Dhaka (Dhanmondi)",
      lat: 23.7461,
      lng: 90.3752,
      tag: "সক্রিয় ক্লাস্টার",
      area: "Dhanmondi",
    },
    {
      id: "chittagong",
      nameBn: "চট্টগ্রাম (জিইসি মোড়)",
      nameEn: "Chittagong (GEC Circle)",
      lat: 22.3590,
      lng: 91.8215,
      tag: "মেজবানি ক্লাস্টার",
      area: "GEC Circle",
    },
    {
      id: "sylhet",
      nameBn: "সিলেট (জিন্দাবাজার)",
      nameEn: "Sylhet (Zindabazar)",
      lat: 24.8949,
      lng: 91.8687,
      tag: "সাতকড়া স্পেশাল",
      area: "Zindabazar",
    },
    {
      id: "coxsbazar",
      nameBn: "কক্সবাজার (কলাতলী বিচ)",
      nameEn: "Cox's Bazar (Kolatoli Beach)",
      lat: 21.4272,
      lng: 91.9806,
      tag: "সি-ফুড ক্লাস্টার",
      area: "Kolatoli",
    },
    {
      id: "rajshahi",
      nameBn: "রাজশাহী (সাহেব বাজার)",
      nameEn: "Rajshahi (Shaheb Bazar)",
      lat: 24.3636,
      lng: 88.6241,
      tag: "কালাই রুটি স্পেশাল",
      area: "Shaheb Bazar",
    },
    {
      id: "khulna",
      nameBn: "খুলনা (শিববাড়ি মোড়)",
      nameEn: "Khulna (Shibbari)",
      lat: 22.8456,
      lng: 89.5403,
      tag: "খুলনা ক্লাস্টার",
      area: "Khulna",
    },
    {
      id: "barishal",
      nameBn: "বরিশাল (সদর রোড)",
      nameEn: "Barishal (Sadar Road)",
      lat: 22.7010,
      lng: 90.3535,
      tag: "বরিশাল ক্লাস্টার",
      area: "Barishal",
    },
    {
      id: "rangpur",
      nameBn: "রংপুর (জাহাজ কোম্পানি মোড়)",
      nameEn: "Rangpur (City Center)",
      lat: 25.7439,
      lng: 89.2752,
      tag: "রংপুর ক্লাস্টার",
      area: "Rangpur",
    },
  ];

  const handleDeviceLocation = () => {
    setDetecting(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError("আপনার ব্রাউজারে জিও-লোকেশন সমর্থিত নয়। অনুগ্রহ করে নিচের শহরগুলোর যেকোনো একটি বেছে নিন।");
      setDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCustomerCoordinates(latitude, longitude);
        try {
          localStorage.setItem(
            "khali_khai_user_location",
            JSON.stringify({ lat: latitude, lng: longitude, isDevice: true })
          );
        } catch {}
        setDetecting(false);
        router.push(`/restaurants?lat=${latitude}&lng=${longitude}`);
      },
      (error) => {
        setDetecting(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError(
            "ডিভাইসের লোকেশন অনুমতি দেওয়া হয়নি। নিচের তালিকা থেকে আপনার নিকটবর্তী শহর বা এলাকা বেছে নিন:"
          );
        } else {
          setGeoError("লোকেশন সংগ্রহ করতে সমস্যা হয়েছে। নিচের যেকোনো শহর বেছে নিন:");
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleSelectCity = (city: typeof bangladeshCities[0]) => {
    setCustomerCoordinates(city.lat, city.lng);
    try {
      localStorage.setItem(
        "khali_khai_user_location",
        JSON.stringify({ lat: city.lat, lng: city.lng, cityName: city.nameEn, isDevice: false })
      );
    } catch {}
    router.push(`/restaurants?lat=${city.lat}&lng=${city.lng}&area=${city.area}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#FFF5EC] via-[#FFEADB] to-[#FFF0E5]">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center">
        
        {/* Radar Graphic */}
        <div className="relative mb-8">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#FF5A36] to-[#FF8A65] flex items-center justify-center text-white shadow-2xl shadow-[#FF5A36]/40 animate-pulse">
            <MapPin className="w-14 h-14" />
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-[#FF5A36]/20 animate-ping pointer-events-none" />
          <div className="absolute -inset-4 rounded-full border-2 border-[#FF5A36]/10 animate-ping duration-1000 pointer-events-none" />
        </div>

        {/* Title & Instructions */}
        <div className="text-center max-w-lg mb-8 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-white/80 border border-[#FF5A36]/30 text-xs font-black text-[#E64A19] shadow-sm">
            <Compass className="w-4 h-4 text-[#FF5A36]" />
            <span>সমগ্র বাংলাদেশ ডেলিভারি কাভারেজ</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#222222] font-bangla tracking-tight">
            আপনার লোকেশন চালু করুন
          </h1>

          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            আপনার ডিভাইসের লোকেশন চালু করলে আমরা স্বয়ংক্রিয়ভাবে আপনার আশেপাশে থাকা সেরা রেস্টুরেন্টগুলো খুঁজে দেব — ঢাকা, চট্টগ্রাম, সিলেট, কক্সবাজারসহ সমগ্র বাংলাদেশ জুড়ে।
          </p>
        </div>

        {/* Turn On Device Location Primary Button */}
        <div className="w-full max-w-md space-y-4 mb-10">
          <button
            onClick={handleDeviceLocation}
            disabled={detecting}
            className="w-full py-4 px-6 rounded-3xl bg-gradient-to-r from-[#FF5A36] via-[#FF451A] to-[#E64A19] text-white font-black text-sm sm:text-base shadow-xl shadow-[#FF5A36]/30 hover:shadow-2xl hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
          >
            <Navigation className={`w-5 h-5 ${detecting ? "animate-spin" : ""}`} />
            <span>
              {detecting
                ? "ডিভাইস লোকেশন শনাক্ত হচ্ছে..."
                : "ডিভাইস লোকেশন চালু করুন (Turn On Location)"}
            </span>
          </button>

          {geoError && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{geoError}</span>
            </div>
          )}
        </div>

        {/* Bangladesh Major Hubs Quick Selector */}
        <div className="w-full max-w-2xl bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-[#FFE2CF] shadow-food">
          <div className="flex items-center gap-2 mb-4 text-xs font-black uppercase tracking-wider text-[#0D8275]">
            <Building2 className="w-4 h-4 text-[#FF5A36]" />
            <span>অথবা বাংলাদেশের যেকোনো বিভাগ বা শহর বেছে নিন:</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {bangladeshCities.map((city) => (
              <button
                key={city.id}
                onClick={() => handleSelectCity(city)}
                className="p-3 rounded-2xl bg-[#FFFDF9] border border-[#FFE2CF] hover:border-[#FF5A36] hover:bg-[#FFEADB]/40 text-left transition-all group flex flex-col justify-between"
              >
                <div>
                  <p className="font-black text-xs text-[#222222] group-hover:text-[#FF5A36] transition-colors">
                    {locale === "bn" ? city.nameBn : city.nameEn}
                  </p>
                  <span className="inline-block mt-1 text-[9px] font-bold text-[#0D8275] bg-[#DDF5E5] px-1.5 py-0.5 rounded">
                    {city.tag}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#FF5A36] mt-2 block">
                  খাবার দেখুন →
                </span>
              </button>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import {
  Search,
  MapPin,
  Star,
  Clock,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Navigation,
  Compass,
  SlidersHorizontal,
} from "lucide-react";

interface Restaurant {
  id: string;
  nameBn: string;
  nameEn: string;
  slug: string;
  descriptionBn: string;
  descriptionEn: string;
  area: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  image: string;
  rating: number;
  reviewCount: number;
  avgPrepTimeMinutes: number;
  isOpen: boolean;
  distanceKm: number;
  isServiceable: boolean;
  categories: any[];
}

export default function RestaurantsPage() {
  const { locale, t } = useLanguage();
  const { customerLat, customerLng, setCustomerCoordinates } = useCart();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRadius, setSelectedRadius] = useState<number>(8); // Default 8 km
  const [searchQuery, setSearchQuery] = useState("");
  const [detectedLocationName, setDetectedLocationName] = useState("");

  const fetchRestaurants = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append("lat", String(customerLat));
    params.append("lng", String(customerLng));
    params.append("radius", String(selectedRadius));
    if (searchQuery) params.append("q", searchQuery);

    fetch(`/api/restaurants?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.restaurants) setRestaurants(data.restaurants);
        if (data.detectedLocationName) setDetectedLocationName(data.detectedLocationName);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchRestaurants();
  }, [customerLat, customerLng, selectedRadius]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRestaurants();
  };

  // Quick switch to Savar Radio Colony
  const handleSwitchToSavar = () => {
    setCustomerCoordinates(23.8480, 90.2600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#FFF5EC] via-[#FFEADB]/40 to-[#FFF0E5]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Dynamic Location & Coverage Radius Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#FFE2CF] shadow-food mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#DDF5E5] text-[#0D8275] text-xs font-black mb-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0D8275] animate-ping" />
                <span>আপনার নিকটবর্তী ডেলিভারি জোন</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#222222] font-bangla flex items-center gap-2">
                <MapPin className="w-6 h-6 text-[#FF5A36] shrink-0" />
                <span>{detectedLocationName || "রেডিও কলোনি, সাভার, ঢাকা"}</span>
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                খাবার যাতে গরম ও সতেজ থাকে, তাই কেবলমাত্র আপনার চারপাশের {selectedRadius} কিমি এলাকার রেস্টুরেন্টগুলো প্রদর্শিত হচ্ছে।
              </p>
            </div>

            <Link
              href="/location"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FF5A36] hover:bg-[#E64A19] text-white text-xs font-black shadow-md shadow-[#FF5A36]/25 transition-all self-start md:self-auto"
            >
              <Navigation className="w-4 h-4" />
              <span>ডিভাইস লোকেশন রিফ্রেশ করুন</span>
            </Link>
          </div>

          {/* Delivery Radius Selector Controls */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-600 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF5A36]" />
                <span>ডেলিভারি ব্যাসার্ধ (Radius):</span>
              </span>
              {[
                { r: 6, label: "৬ কিমি (দ্রুততম)" },
                { r: 8, label: "৮ কিমি (প্রস্তাবিত)" },
                { r: 10, label: "১০ কিমি (সর্বোচ্চ)" },
              ].map((item) => (
                <button
                  key={item.r}
                  onClick={() => setSelectedRadius(item.r)}
                  className={`px-3 py-1.5 rounded-xl font-black transition-all ${
                    selectedRadius === item.r
                      ? "bg-[#0D8275] text-white shadow-xs"
                      : "bg-[#FFF5EC] text-gray-700 hover:bg-[#FFEADB]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <span className="text-[11px] font-bold text-gray-500">
              মোট সক্রিয় রেস্টুরেন্ট: {restaurants.length}টি
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mb-8 max-w-xl">
          <div className="flex items-center gap-2 p-2 bg-white rounded-3xl border border-[#FFE2CF] shadow-xs">
            <Search className="w-5 h-5 text-gray-400 ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="কাচ্চি, কালা ভুনা, বার্গার, পিজ্জা বা রেস্টুরেন্ট খুঁজুন..."
              className="w-full bg-transparent border-none outline-none text-xs font-semibold text-[#222222] placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-[#FF5A36] text-white text-xs font-black hover:bg-[#E64A19] transition-all shadow-xs shrink-0"
            >
              খুঁজুন
            </button>
          </div>
        </form>

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl h-72 animate-pulse border border-[#FFE2CF]" />
            ))}
          </div>
        )}

        {/* Empty state within radius */}
        {!loading && restaurants.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#FFE2CF] p-8 max-w-lg mx-auto">
            <AlertCircle className="w-12 h-12 text-[#FF5A36] mx-auto mb-3" />
            <h3 className="text-lg font-black text-[#222222]">
              এই {selectedRadius} কিমি ব্যাসার্ধের মধ্যে কোনো রেস্টুরেন্ট পাওয়া যায়নি
            </h3>
            <p className="text-xs text-gray-500 mt-2 mb-6">
              আপনার লোকেশন যদি সাভার রেডিও কলোনিতে হয়, তবে নিচে ক্লিক করে সাভার ক্লাস্টারের রেস্টুরেন্টগুলো ব্রাউজ করুন।
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={handleSwitchToSavar}
                className="px-5 py-2.5 rounded-2xl bg-[#FF5A36] text-white text-xs font-black hover:bg-[#E64A19] transition-all"
              >
                সাভার (রেডিও কলোনি) ক্লাস্টার দেখুন
              </button>
              <button
                onClick={() => setSelectedRadius(10)}
                className="px-5 py-2.5 rounded-2xl bg-gray-100 text-gray-800 text-xs font-black hover:bg-gray-200 transition-all"
              >
                ১০ কিমি পর্যন্ত রেঞ্জ বাড়ান
              </button>
            </div>
          </div>
        )}

        {/* Restaurant Cards Grid (Filtered within 6-8 km!) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {restaurants.map((rest) => (
            <Link
              key={rest.id}
              href={`/restaurants/${rest.slug}`}
              className="bg-white rounded-3xl border border-[#FFE2CF] overflow-hidden shadow-food hover:shadow-food-lg hover:border-[#FF5A36] transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={rest.image}
                    alt={rest.nameEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-black text-white flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{rest.rating}</span>
                    <span className="text-[10px] text-gray-300 font-normal">({rest.reviewCount})</span>
                  </div>

                  <div className="absolute top-3 left-3 bg-[#FF5A36] text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                    {rest.area} • {rest.city}
                  </div>

                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md text-[#222222] text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <Clock className="w-3 h-3 text-[#FF5A36]" />
                    <span>রান্না: ~{rest.avgPrepTimeMinutes} মিনিট</span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-black text-base text-[#222222] font-bangla group-hover:text-[#FF5A36] transition-colors">
                      {locale === "bn" ? rest.nameBn : rest.nameEn}
                    </h3>
                    {rest.isOpen ? (
                      <span className="shrink-0 text-[10px] font-black bg-[#DDF5E5] text-[#0D8275] px-2 py-0.5 rounded-full">
                        খোলা আছে
                      </span>
                    ) : (
                      <span className="shrink-0 text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        এখন বন্ধ
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {locale === "bn" ? rest.descriptionBn : rest.descriptionEn}
                  </p>

                  <div className="pt-2 flex items-center gap-3 text-[11px] text-gray-500 font-semibold">
                    <span className="flex items-center gap-1 text-[#FF5A36] font-black">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{rest.distanceKm} কিমি কাছে</span>
                    </span>
                    <span>•</span>
                    <span className="truncate">{rest.address}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="w-full py-2.5 rounded-2xl bg-[#FFF5EC] border border-[#FFE2CF] text-[#FF5A36] text-xs font-black text-center group-hover:bg-[#FF5A36] group-hover:text-white transition-all flex items-center justify-center gap-1.5">
                  <span>মেনু দেখুন ও এক কার্টে যোগ করুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </main>

      <Footer />
    </div>
  );
}

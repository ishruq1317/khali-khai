"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { calculateDistanceKm } from "@/lib/pricing";
import {
  Star,
  Clock,
  MapPin,
  Plus,
  Check,
  AlertTriangle,
  ShoppingBag,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { locale, t } = useLanguage();
  const { addItem, items, totalItemCount, pricing } = useCart();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});
  const [clusterWarning, setClusterWarning] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/restaurants/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.restaurant) setRestaurant(data.restaurant);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleAddItem = (item: any) => {
    if (!restaurant) return;

    // Check cluster distance with existing items in cart!
    // Threshold: 600m
    if (items.length > 0) {
      for (const cartItem of items) {
        if (cartItem.restaurantId !== restaurant.id) {
          const distMeters =
            calculateDistanceKm(
              cartItem.restaurantLat,
              cartItem.restaurantLng,
              restaurant.latitude,
              restaurant.longitude
            ) * 1000;

          if (distMeters > 600) {
            setClusterWarning(
              `মনোযোগ দিন: এই রেস্টুরেন্টটি কার্টের পূর্ববর্তী রেস্টুরেন্ট (${cartItem.restaurantNameBn}) থেকে ${(distMeters / 1000).toFixed(1)} কিমি দূরে। ফলে এটি শেয়ার্ড ট্রিপের বদলে স্প্লিট ডেলিভারি হিসেবে প্রসেস হতে পারে।`
            );
            break;
          }
        }
      }
    }

    addItem({
      id: item.id,
      nameBn: item.nameBn,
      nameEn: item.nameEn,
      price: item.price,
      quantity: 1,
      restaurantId: restaurant.id,
      restaurantNameBn: restaurant.nameBn,
      restaurantNameEn: restaurant.nameEn,
      restaurantLat: restaurant.latitude,
      restaurantLng: restaurant.longitude,
      prepTimeMinutes: item.preparationTimeMinutes || restaurant.avgPrepTimeMinutes,
    });

    setAddedMap((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFF9F0]">
        <Navbar />
        <div className="flex-1 max-w-7xl w-full mx-auto p-10">
          <div className="h-64 bg-white rounded-3xl animate-pulse mb-8" />
          <div className="h-96 bg-white rounded-3xl animate-pulse" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFF9F0]">
        <Navbar />
        <div className="flex-1 max-w-7xl w-full mx-auto p-12 text-center">
          <h2 className="text-2xl font-bold">রেস্টুরেন্ট পাওয়া যায়নি</h2>
          <Link href="/restaurants" className="mt-4 inline-block text-[#FF735C] underline">
            রেস্টুরেন্ট তালিকায় ফিরুন
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F0]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Restaurant Header Banner */}
        <div className="bg-white rounded-3xl border border-[#FFE2CF] overflow-hidden shadow-warm mb-8">
          <div className="relative h-64 sm:h-80 w-full">
            <img
              src={restaurant.image}
              alt={restaurant.nameEn}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#167D75] text-[11px] font-bold">
                  {restaurant.area}
                </span>
                {restaurant.isOpen ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#DDF5E5] text-[#167D75] text-[11px] font-bold">
                    খোলা আছে
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[11px] font-bold">
                    এখন বন্ধ
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-black font-bangla tracking-tight">
                {locale === "bn" ? restaurant.nameBn : restaurant.nameEn}
              </h1>

              <p className="text-xs sm:text-sm text-gray-200 max-w-2xl line-clamp-2">
                {locale === "bn" ? restaurant.descriptionBn : restaurant.descriptionEn}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold pt-1">
                <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{restaurant.rating} ({restaurant.reviewCount} রিভিউ)</span>
                </span>
                <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5 text-[#FFE2CF]" />
                  <span>গড় প্রস্তুতি: {restaurant.avgPrepTimeMinutes} মিনিট</span>
                </span>
                <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full">
                  <MapPin className="w-3.5 h-3.5 text-[#FF735C]" />
                  <span>{restaurant.address}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Proximity / Distance Notification Alert */}
        {clusterWarning && (
          <div className="mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">ক্লাস্টার দূরত্বের সতর্কতা</p>
              <p className="mt-0.5">{clusterWarning}</p>
            </div>
          </div>
        )}

        {/* Menu Section */}
        <div className="space-y-10 mb-16">
          {restaurant.categories.map((cat: any) => (
            <div key={cat.id} className="space-y-4">
              <div className="border-b border-[#FFE2CF] pb-2">
                <h2 className="text-xl sm:text-2xl font-black text-[#343434] font-bangla">
                  {locale === "bn" ? cat.nameBn : cat.nameEn}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cat.items.map((item: any) => {
                  const isAdded = addedMap[item.id];
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-3xl p-4 sm:p-5 border border-[#FFE2CF] shadow-xs hover:border-[#FF735C] transition-all flex justify-between gap-4"
                    >
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-black text-sm sm:text-base text-[#343434] font-bangla mb-1">
                            {locale === "bn" ? item.nameBn : item.nameEn}
                          </h3>
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                            {locale === "bn" ? item.descriptionBn : item.descriptionEn}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-base sm:text-lg font-black text-[#FF735C]">
                            ৳{item.price}
                          </span>

                          <button
                            onClick={() => handleAddItem(item)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-xs ${
                              isAdded
                                ? "bg-[#2A9D6A] text-white"
                                : "bg-[#FF735C] hover:bg-[#E25842] text-white active:scale-95"
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>যোগ হয়েছে</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>কার্টে নিন</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border border-[#FFE2CF]">
                        <img
                          src={item.image}
                          alt={item.nameEn}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

      </main>

      {/* Floating Bottom Cart Bar (if items in cart) */}
      {totalItemCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-3xl mx-auto z-40 bg-[#167D75] text-white p-4 rounded-3xl shadow-warm-lg flex items-center justify-between animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-black">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                {totalItemCount}টি খাবার যোগ করা হয়েছে
              </p>
              <p className="text-[11px] text-[#FFE2CF] font-semibold">
                আনুমানিক সাশ্রয়: ৳{pricing.deliverySavings}
              </p>
            </div>
          </div>

          <Link
            href="/checkout"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FF735C] hover:bg-[#E25842] text-white text-xs font-bold shadow-md transition-all"
          >
            <span>চেকআউট করুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      <Footer />
    </div>
  );
}

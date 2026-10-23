"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { Star, Clock, MapPin, Plus, Check, ArrowRight } from "lucide-react";

interface Restaurant {
  id: string;
  nameBn: string;
  nameEn: string;
  slug: string;
  descriptionBn: string;
  descriptionEn: string;
  area: string;
  latitude: number;
  longitude: number;
  image: string;
  rating: number;
  reviewCount: number;
  avgPrepTimeMinutes: number;
  isOpen: boolean;
  categories: Array<{
    id: string;
    nameBn: string;
    nameEn: string;
    items: Array<{
      id: string;
      nameBn: string;
      nameEn: string;
      price: number;
      image: string;
      preparationTimeMinutes: number;
    }>;
  }>;
}

export function FeaturedRestaurants() {
  const { locale, t } = useLanguage();
  const { addItem, items } = useCart();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedItemMap, setAddedItemMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/restaurants?area=Dhanmondi")
      .then((res) => res.json())
      .then((data) => {
        if (data.restaurants) {
          setRestaurants(data.restaurants.slice(0, 4));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleQuickAdd = (
    rest: Restaurant,
    item: Restaurant["categories"][0]["items"][0]
  ) => {
    addItem({
      id: item.id,
      nameBn: item.nameBn,
      nameEn: item.nameEn,
      price: item.price,
      quantity: 1,
      restaurantId: rest.id,
      restaurantNameBn: rest.nameBn,
      restaurantNameEn: rest.nameEn,
      restaurantLat: rest.latitude,
      restaurantLng: rest.longitude,
      prepTimeMinutes: item.preparationTimeMinutes || rest.avgPrepTimeMinutes,
    });

    setAddedItemMap((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItemMap((prev) => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#DDF5E5] text-[#167D75] text-xs font-bold mb-2">
              <span>ধানমণ্ডি স্মার্ট ক্লাস্টার (Dhanmondi Cluster)</span>
            </div>
            <h2 className="text-3xl font-black text-[#343434] tracking-tight font-bangla">
              {locale === "bn" ? "আশেপাশের জনপ্রিয় রেস্টুরেন্ট" : "Nearby Featured Restaurants"}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {locale === "bn"
                ? "এই রেস্টুরেন্টগুলো পরস্পর ৫০০ মিটারের মধ্যে অবস্থিত — ফলে এক কার্টেই নিতে পারেন সব খাবার!"
                : "These restaurants are within 500m of each other — combine them into one single cart!"}
            </p>
          </div>

          <Link
            href="/restaurants"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#FF735C] hover:text-[#E25842] transition-colors"
          >
            <span>{locale === "bn" ? "সব রেস্টুরেন্ট দেখুন" : "View All Restaurants"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#FFF9F0] rounded-3xl h-80 animate-pulse border border-[#FFE2CF]" />
            ))}
          </div>
        )}

        {/* Restaurant Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {restaurants.map((rest) => {
            const sampleItem = rest.categories?.[0]?.items?.[0];
            const isAdded = sampleItem ? addedItemMap[sampleItem.id] : false;

            return (
              <div
                key={rest.id}
                className="bg-[#FFF9F0] rounded-3xl border border-[#FFE2CF] overflow-hidden shadow-warm flex flex-col justify-between hover:border-[#FF735C] transition-all group"
              >
                <div>
                  {/* Image banner */}
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={rest.image}
                      alt={rest.nameEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[11px] font-black text-[#343434] flex items-center gap-1 shadow-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{rest.rating}</span>
                    </div>

                    <div className="absolute bottom-3 left-3 bg-[#167D75]/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{rest.avgPrepTimeMinutes} মি. রেডি</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-black text-sm text-[#343434] font-bangla group-hover:text-[#FF735C] transition-colors truncate">
                      {locale === "bn" ? rest.nameBn : rest.nameEn}
                    </h3>
                    <p className="text-[11px] text-gray-500 line-clamp-2">
                      {locale === "bn" ? rest.descriptionBn : rest.descriptionEn}
                    </p>

                    {/* Popular item quick add */}
                    {sampleItem && (
                      <div className="mt-3 p-2.5 bg-white rounded-2xl border border-[#FFE2CF] flex items-center justify-between">
                        <div className="truncate mr-2">
                          <p className="text-[11px] font-bold text-gray-800 truncate">
                            {locale === "bn" ? sampleItem.nameBn : sampleItem.nameEn}
                          </p>
                          <p className="text-[11px] font-black text-[#FF735C]">
                            ৳{sampleItem.price}
                          </p>
                        </div>
                        <button
                          onClick={() => handleQuickAdd(rest, sampleItem)}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                            isAdded
                              ? "bg-[#2A9D6A] text-white"
                              : "bg-[#FF735C] hover:bg-[#E25842] text-white"
                          }`}
                          title="কার্টে যোগ করুন"
                        >
                          {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card footer link */}
                <div className="p-4 pt-0">
                  <Link
                    href={`/restaurants/${rest.slug}`}
                    className="block w-full text-center py-2 rounded-2xl bg-white text-xs font-bold text-[#167D75] border border-[#FFE2CF] hover:bg-[#DDF5E5] transition-all"
                  >
                    {locale === "bn" ? "পুরো মেনু দেখুন" : "View Full Menu"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

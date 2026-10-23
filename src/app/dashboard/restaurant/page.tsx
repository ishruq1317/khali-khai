"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import {
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Power,
  ChevronRight,
} from "lucide-react";

export default function RestaurantDashboardPage() {
  const { locale } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchDashboard = () => {
    fetch("/api/restaurant/dashboard")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.restaurant) setData(resData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleUpdateStatus = async (subOrderId: string, nextStatus: string, prepTime?: number) => {
    setUpdating(subOrderId);
    try {
      const res = await fetch(`/api/orders/sub-order/${subOrderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, prepTimeMinutes: prepTime }),
      });
      if (res.ok) {
        fetchDashboard();
      }
    } catch {
      // ignore
    } finally {
      setUpdating(null);
    }
  };

  const handleToggleOpen = async () => {
    if (!data?.restaurant) return;
    const nextState = !data.restaurant.isOpen;
    await fetch("/api/restaurant/dashboard", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOpen: nextState }),
    });
    fetchDashboard();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFF9F0]">
        <Navbar />
        <div className="flex-1 max-w-7xl w-full mx-auto p-10">
          <div className="h-64 bg-white rounded-3xl animate-pulse mb-6" />
          <div className="h-96 bg-white rounded-3xl animate-pulse" />
        </div>
        <Footer />
      </div>
    );
  }

  const restaurant = data?.restaurant;
  const metrics = data?.metrics;

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F0]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-[#FFE2CF] gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FFE2CF] text-[#FF735C] text-xs font-bold mb-1">
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>রেস্টুরেন্ট কিচেন পোর্টাল (Kitchen Operations)</span>
            </div>
            <h1 className="text-3xl font-black text-[#343434] font-bangla">
              {restaurant?.nameBn}
            </h1>
            <p className="text-xs text-gray-500">
              {restaurant?.address} • এলাকা: {restaurant?.area}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleOpen}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-xs ${
                restaurant?.isOpen
                  ? "bg-[#DDF5E5] text-[#167D75] border border-[#167D75]/30 hover:bg-emerald-100"
                  : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{restaurant?.isOpen ? "অর্ডার গ্রহণ চালু (Open)" : "বর্তমানে বন্ধ (Closed)"}</span>
            </button>

            <button
              onClick={fetchDashboard}
              className="p-2.5 rounded-2xl bg-white border border-[#FFE2CF] text-gray-600 hover:text-[#167D75] shadow-xs"
              title="রিফ্রেশ"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Operational Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-3xl p-5 border border-[#FFE2CF] shadow-xs">
            <p className="text-xs font-bold text-gray-400">অপেক্ষমান কিচেন অর্ডার</p>
            <p className="text-2xl font-black text-[#FF735C] mt-1">
              {metrics?.pendingOrders || 0}
            </p>
            <p className="text-[10px] text-gray-400">চলতি রান্নার লাইন</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#FFE2CF] shadow-xs">
            <p className="text-xs font-bold text-gray-400">সম্পন্ন ডেলিভারি</p>
            <p className="text-2xl font-black text-[#167D75] mt-1">
              {metrics?.completedOrders || 0}
            </p>
            <p className="text-[10px] text-gray-400">সফলভাবে পৌঁছে গেছে</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#FFE2CF] shadow-xs">
            <p className="text-xs font-bold text-gray-400">মোট আয় (বিক্রি)</p>
            <p className="text-2xl font-black text-[#343434] mt-1">
              ৳{metrics?.totalEarnings || 0}
            </p>
            <p className="text-[10px] text-gray-400">খাবারের মোট মূল্য</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#FFE2CF] shadow-xs">
            <p className="text-xs font-bold text-gray-400">গড় রান্নার সময়</p>
            <p className="text-2xl font-black text-amber-600 mt-1">
              {restaurant?.avgPrepTimeMinutes} মিনিট
            </p>
            <p className="text-[10px] text-gray-400">লজিস্টিক টাইমিং সিঙ্ক</p>
          </div>
        </div>

        {/* Incoming Kitchen Sub-Orders */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-[#343434] font-bangla">
            কিচেন সাব-অর্ডার ব্যবস্থাপনা ({restaurant?.subOrders?.length || 0})
          </h2>

          <div className="space-y-4">
            {restaurant?.subOrders?.map((sub: any) => (
              <div
                key={sub.id}
                className="bg-white rounded-3xl p-6 border border-[#FFE2CF] shadow-warm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#167D75]">
                        প্যারেন্ট অর্ডার: {sub.parentOrder?.orderNumber}
                      </span>
                      <span className="text-[10px] bg-[#FFE2CF] text-[#FF735C] font-extrabold px-2 py-0.5 rounded-full">
                        {sub.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      গ্রাহক: {sub.parentOrder?.customer?.user?.name} • ঠিকানা: {sub.parentOrder?.deliveryAddress?.area}
                    </p>
                  </div>

                  {/* Kitchen Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {sub.status === "PENDING_ACCEPTANCE" && (
                      <button
                        onClick={() => handleUpdateStatus(sub.id, "ACCEPTED")}
                        disabled={updating === sub.id}
                        className="px-4 py-2 rounded-xl bg-[#167D75] text-white text-xs font-bold hover:bg-[#0F5852] transition-colors"
                      >
                        অর্ডার গ্রহণ করুন (Accept)
                      </button>
                    )}

                    {sub.status === "ACCEPTED" && (
                      <button
                        onClick={() => handleUpdateStatus(sub.id, "PREPARING", 15)}
                        disabled={updating === sub.id}
                        className="px-4 py-2 rounded-xl bg-[#FF735C] text-white text-xs font-bold hover:bg-[#E25842] transition-colors"
                      >
                        রান্না শুরু করুন (Start Cooking)
                      </button>
                    )}

                    {sub.status === "PREPARING" && (
                      <button
                        onClick={() => handleUpdateStatus(sub.id, "READY_FOR_PICKUP")}
                        disabled={updating === sub.id}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                      >
                        খাবার রেডি (Ready for Pickup)
                      </button>
                    )}

                    {sub.status === "READY_FOR_PICKUP" && (
                      <span className="px-3 py-1.5 rounded-xl bg-[#DDF5E5] text-[#167D75] text-xs font-bold">
                        রাইডার আসার অপেক্ষায়...
                      </span>
                    )}

                    {sub.status === "PICKED_UP" && (
                      <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold">
                        রাইডার সংগ্রহ করেছেন
                      </span>
                    )}

                    {sub.status === "DELIVERED" && (
                      <span className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold">
                        সম্পন্ন হয়েছে
                      </span>
                    )}
                  </div>
                </div>

                {/* Items ordered in this sub-order */}
                <div className="bg-[#FFF9F0] p-4 rounded-2xl border border-[#FFE2CF] space-y-2">
                  <p className="text-[11px] font-bold uppercase text-gray-500">
                    রান্নার মেনু আইটেম তালিকা:
                  </p>
                  <div className="space-y-1 text-xs">
                    {sub.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between font-bold text-[#343434]">
                        <span>
                          {item.quantity}× {item.itemNameBn}
                        </span>
                        <span className="text-[#FF735C]">৳{item.totalItemPrice}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-[#FFE2CF] flex justify-between text-xs font-black text-[#167D75]">
                    <span>সাবটোটাল</span>
                    <span>৳{sub.subtotal}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}

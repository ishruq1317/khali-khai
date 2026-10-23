"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import {
  Award,
  Clock,
  MapPin,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Gift,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export default function CustomerDashboardPage() {
  const { locale, t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [loyalty, setLoyalty] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/customer/loyalty").then((r) => r.json()),
      fetch("/api/customer/orders").then((r) => r.json()),
    ])
      .then(([userData, loyaltyData, ordersData]) => {
        if (userData.user) setUser(userData.user);
        if (loyaltyData.loyalty) setLoyalty(loyaltyData.loyalty);
        if (loyaltyData.addresses) setAddresses(loyaltyData.addresses);
        if (ordersData.orders) setOrders(ordersData.orders);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalSavedAllTime = orders.reduce(
    (sum, o) => sum + (o.deliverySavings || 0),
    0
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F0]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-[#FFE2CF] gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FFE2CF] text-[#FF735C] text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>কাস্টমার ড্যাশবোর্ড (Customer Hub)</span>
            </div>
            <h1 className="text-3xl font-black text-[#343434] font-bangla">
              স্বাগতম, {user?.name || "সম্মানিত গ্রাহক"}!
            </h1>
            <p className="text-xs text-gray-500">
              আপনার লয়্যালটি প্রোগ্রেস, অর্ডার হিস্ট্রি ও সেভিংস রিপোর্ট
            </p>
          </div>

          <Link
            href="/restaurants"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FF735C] hover:bg-[#E25842] text-white text-xs font-bold shadow-md transition-all self-start md:self-auto"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>নতুন অর্ডার করুন</span>
          </Link>
        </div>

        {/* 3 Metric Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Card 1: Total Savings */}
          <div className="bg-white rounded-3xl p-6 border border-[#FFE2CF] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFE2CF] text-[#FF735C] flex items-center justify-center font-black">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold">মোট ডেলিভারি সাশ্রয়</p>
              <p className="text-2xl font-black text-[#FF735C]">৳{totalSavedAllTime}</p>
              <p className="text-[10px] text-gray-500">স্মার্ট শেয়ার্ড রুটের মাধ্যমে অর্জিত</p>
            </div>
          </div>

          {/* Card 2: Completed Orders */}
          <div className="bg-white rounded-3xl p-6 border border-[#FFE2CF] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#DDF5E5] text-[#167D75] flex items-center justify-center font-black">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold">চলতি মাসের অর্ডার</p>
              <p className="text-2xl font-black text-[#167D75]">
                {loyalty?.currentMonthOrdersCount || 0} টি
              </p>
              <p className="text-[10px] text-gray-500">ঢাকা টাইমজোন ক্যালেন্ডার মাস</p>
            </div>
          </div>

          {/* Card 3: Loyalty Qualification */}
          <div className="bg-white rounded-3xl p-6 border border-[#FFE2CF] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-black">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold">লয়্যালটি স্ট্যাটাস</p>
              <p className="text-base font-black text-[#343434]">
                {loyalty?.thresholdMet
                  ? "২৫% ছাড় নিশ্চিত! 🎉"
                  : loyalty?.remainingOrdersNeeded === 0
                  ? "কোয়ালিফাইড"
                  : `আর ${loyalty?.remainingOrdersNeeded ?? 15}টি বাকি`}
              </p>
              <p className="text-[10px] text-gray-500">পরের মাসের ডেলিভারি সুবিধার জন্য</p>
            </div>
          </div>

        </div>

        {/* Loyalty Program Detailed Progress Widget */}
        <div className="bg-gradient-to-r from-[#167D75] to-[#0F5852] rounded-3xl p-6 sm:p-8 text-white mb-10 shadow-warm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-xs font-bold text-[#FFE2CF]">
                <Gift className="w-3.5 h-3.5" />
                <span>মাসিক ১৫+ অর্ডার রিওয়ার্ড নীতি (Asia/Dhaka)</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black font-bangla text-white">
                পরের মাসের জন্য ২৫% ডেলিভারি ছাড় আনলক করুন
              </h3>
              <p className="text-xs text-white/80 leading-relaxed">
                চলতি মাসে ১৫ বা তার বেশি অর্ডার সম্পন্ন করলেই পরবর্তী ক্যালেন্ডার মাসের সম্পূর্ণ সময়ব্যাপী প্রতিটি অর্ডারে পাচ্ছেন নিশ্চিত ২৫% ডেলিভারি ছাড়।
              </p>

              {/* Progress Bar */}
              <div className="pt-3 space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span>অগ্রগতি:</span>
                  <span className="text-[#FFE2CF]">
                    {loyalty?.currentMonthOrdersCount ?? 0} / {loyalty?.thresholdTarget ?? 15} টি অর্ডার
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#FF735C] to-[#FFE2CF] h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        ((loyalty?.currentMonthOrdersCount ?? 0) / (loyalty?.thresholdTarget ?? 15)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20">
              <span className="text-xs text-white/80 block">পরবর্তী সুবিধার মেয়াদ</span>
              <span className="text-lg font-black text-[#FFE2CF] block my-1">
                {loyalty?.benefitStartDate || "2026-11-01"} হতে
              </span>
              <span className="text-[11px] text-white/70 block">
                {loyalty?.benefitExpiryDate || "2026-11-30"} পর্যন্ত
              </span>
            </div>
          </div>
        </div>

        {/* Orders History & Details */}
        <div className="space-y-4 mb-10">
          <h2 className="text-lg font-black text-[#343434] font-bangla">
            আপনার সাম্প্রতিক অর্ডার সমূহ ({orders.length})
          </h2>

          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-[#FFE2CF] text-center text-xs text-gray-500">
              এখনো কোনো অর্ডার করা হয়নি।
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-[#FFE2CF] shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#167D75]">
                          {order.orderNumber}
                        </span>
                        <span className="text-[10px] bg-[#DDF5E5] text-[#167D75] font-extrabold px-2 py-0.5 rounded-full">
                          {order.status}
                        </span>
                        <span className="text-[10px] bg-[#FFE2CF] text-[#FF735C] font-extrabold px-2 py-0.5 rounded-full">
                          {order.routeType} রুট
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleString("bn-BD")}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block">মোট মূল্য</span>
                        <span className="text-sm font-black text-[#FF735C]">
                          ৳{order.totalAmount}
                        </span>
                      </div>
                      <Link
                        href={`/orders/${order.id}`}
                        className="px-4 py-2 rounded-xl bg-[#FFF9F0] border border-[#FFE2CF] text-[#FF735C] text-xs font-bold hover:bg-[#FF735C] hover:text-white transition-all"
                      >
                        ট্র্যাক দেখুন →
                      </Link>
                    </div>
                  </div>

                  {/* Sub orders summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {order.subOrders?.map((sub: any) => (
                      <div
                        key={sub.id}
                        className="p-3 rounded-2xl bg-[#FFF9F0] border border-[#FFE2CF] text-xs"
                      >
                        <p className="font-bold text-[#343434] truncate">
                          {sub.restaurant.nameBn}
                        </p>
                        <p className="text-[11px] text-[#167D75] mt-1 font-semibold">
                          স্ট্যাটাস: {sub.status}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Savings Badge */}
                  <div className="text-[11px] text-gray-500 flex items-center justify-between pt-2 border-t border-gray-50">
                    <span>
                      আলাদা ডেলিভারি হলে খরচ হত ৳{order.separateDeliveryFee}
                    </span>
                    <span className="font-extrabold text-[#167D75]">
                      স্মার্ট সেভিংস: ৳{order.deliverySavings}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}

"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import {
  CheckCircle2,
  Clock,
  Bike,
  MapPin,
  Utensils,
  Receipt,
  Sparkles,
  RefreshCw,
  Phone,
  ArrowLeft,
} from "lucide-react";

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { locale, t } = useLanguage();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = () => {
    setRefreshing(true);
    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) setOrder(data.order);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchOrder();
    // Poll every 5 seconds for live status updates
    const timer = setInterval(fetchOrder, 5000);
    return () => clearInterval(timer);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFF9F0]">
        <Navbar />
        <div className="flex-1 max-w-5xl w-full mx-auto p-10">
          <div className="h-64 bg-white rounded-3xl animate-pulse mb-6" />
          <div className="h-80 bg-white rounded-3xl animate-pulse" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFF9F0]">
        <Navbar />
        <div className="flex-1 max-w-5xl w-full mx-auto p-12 text-center">
          <h2 className="text-xl font-bold">অর্ডারটি খুঁজে পাওয়া যায়নি</h2>
          <Link href="/restaurants" className="mt-4 inline-block text-[#FF735C] underline text-xs">
            রেস্টুরেন্ট তালিকায় ফিরে যান
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const assignedRider =
    order.deliveryPlans?.[0]?.assignments?.[0]?.rider?.user || null;
  const stops = order.deliveryPlans?.[0]?.stops || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F0]">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/dashboard/customer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#343434] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ড্যাশবোর্ডে ফিরুন</span>
          </Link>

          <button
            onClick={fetchOrder}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#FFE2CF] text-xs font-bold text-[#167D75] hover:bg-[#DDF5E5] transition-all shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>রিফ্রেশ</span>
          </button>
        </div>

        {/* Order Status Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FFE2CF] shadow-warm mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-gray-400">অর্ডার নম্বর:</span>
                <span className="text-sm font-black text-[#167D75] tracking-wide">
                  {order.orderNumber}
                </span>
                <span className="text-[10px] bg-[#FFE2CF] text-[#FF735C] font-extrabold px-2 py-0.5 rounded-full">
                  {order.routeType === "SHARED" ? "স্মার্ট শেয়ার্ড রুট" : "স্প্লিট ডেলিভারি"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#343434] font-bangla">
                {order.status === "DELIVERED"
                  ? "ডেলিভারি সম্পন্ন হয়েছে!"
                  : order.status === "OUT_FOR_DELIVERY"
                  ? "রাইডার পথে আছেন!"
                  : order.status === "PREPARING"
                  ? "রেস্টুরেন্টে খাবার তৈরি হচ্ছে"
                  : "অর্ডার কনফার্মড"}
              </h1>
            </div>

            <div className="text-right">
              <span className="text-xs text-gray-400 block">আনুমানিক ডেলিভারি সময়:</span>
              <span className="text-xl font-black text-[#FF735C]">
                ~{order.estimatedDeliveryMinutes} মিনিট
              </span>
            </div>
          </div>

          {/* Progress Timeline Stepper */}
          <div className="pt-6 grid grid-cols-4 gap-2 text-center text-xs">
            {[
              { label: "নিশ্চিত", status: "CONFIRMED", active: true },
              {
                label: "রান্না হচ্ছে",
                status: "PREPARING",
                active: ["PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.status),
              },
              {
                label: "রাইডার পথে",
                status: "OUT_FOR_DELIVERY",
                active: ["OUT_FOR_DELIVERY", "DELIVERED"].includes(order.status),
              },
              {
                label: "পৌঁছে গেছে",
                status: "DELIVERED",
                active: order.status === "DELIVERED",
              },
            ].map((step, idx) => (
              <div key={idx} className="space-y-2">
                <div
                  className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    step.active
                      ? "bg-[#167D75] text-white shadow-sm"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step.active ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`block text-[11px] font-bold ${
                    step.active ? "text-[#167D75]" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (7 cols): Sub-orders preparation & Rider Steps */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Restaurant Sub-Orders Preparation Status */}
            <div className="bg-white rounded-3xl p-6 border border-[#FFE2CF] shadow-xs space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#167D75] flex items-center gap-2">
                <Utensils className="w-4 h-4 text-[#FF735C]" />
                <span>প্রতিটি রেস্টুরেন্টের কিচেন অবস্থা ({order.subOrders.length}টি দোকান)</span>
              </h2>

              <div className="space-y-4">
                {order.subOrders.map((sub: any) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-2xl bg-[#FFF9F0] border border-[#FFE2CF] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#167D75] animate-ping" />
                        <span className="font-black text-xs text-[#343434] font-bangla">
                          {sub.restaurant.nameBn}
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold bg-[#DDF5E5] text-[#167D75] px-2 py-0.5 rounded-full">
                        {sub.status === "PENDING_ACCEPTANCE"
                          ? "অপেক্ষমান"
                          : sub.status === "ACCEPTED"
                          ? "গৃহীত"
                          : sub.status === "PREPARING"
                          ? "রান্না চলছে"
                          : sub.status === "READY_FOR_PICKUP"
                          ? "পিকআপের জন্য প্রস্তুত"
                          : sub.status === "PICKED_UP"
                          ? "রাইডার সংগ্রহ করেছেন"
                          : sub.status === "DELIVERED"
                          ? "ডেলিভার্ড"
                          : sub.status}
                      </span>
                    </div>

                    {/* Ordered Items under this restaurant */}
                    <div className="pl-4 border-l-2 border-[#FFE2CF] space-y-1 text-xs text-gray-700">
                      {sub.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between">
                          <span>
                            {item.quantity}× {item.itemNameBn}
                          </span>
                          <span className="font-semibold">৳{item.totalItemPrice}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Planned Shared Route Sequence */}
            {stops.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-[#FFE2CF] shadow-xs space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#167D75] flex items-center gap-2">
                  <Bike className="w-4 h-4 text-[#FF735C]" />
                  <span>রাইডারের রুট ও পিকআপ সিকোয়েন্স</span>
                </h2>

                <div className="space-y-2">
                  {stops.map((stop: any) => (
                    <div
                      key={stop.id}
                      className={`p-3 rounded-2xl flex items-center justify-between text-xs border ${
                        stop.isCompleted
                          ? "bg-[#DDF5E5]/40 border-[#167D75]/40 text-[#167D75]"
                          : "bg-[#FFF9F0] border-[#FFE2CF] text-[#343434]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            stop.isCompleted
                              ? "bg-[#167D75] text-white"
                              : "bg-[#FFE2CF] text-[#FF735C]"
                          }`}
                        >
                          {stop.isCompleted ? "✓" : stop.stopSequence}
                        </span>
                        <div>
                          <p className="font-bold">{stop.addressText}</p>
                          <p className="text-[10px] text-gray-500">
                            {stop.stopType === "PICKUP" ? "খাবার পিকআপ স্টপ" : "গ্রাহকের ড্রপঅফ"}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold">
                        {stop.isCompleted ? "সম্পন্ন" : "পরবর্তী স্টপ"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assigned Rider Info */}
            {assignedRider && (
              <div className="bg-white rounded-3xl p-5 border border-[#FFE2CF] shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#DDF5E5] text-[#167D75] flex items-center justify-center font-black">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#343434]">{assignedRider.name}</p>
                    <p className="text-[11px] text-gray-500 font-semibold">আপনার নির্ধারিত রাইডার</p>
                  </div>
                </div>

                <a
                  href={`tel:${assignedRider.phone}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#167D75] text-white text-xs font-bold hover:bg-[#0F5852] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>কল করুন</span>
                </a>
              </div>
            )}

          </div>

          {/* Right Column (5 cols): Order Receipt & Transparent Savings */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Transparent Receipt */}
            <div className="bg-white rounded-3xl p-6 border border-[#FFE2CF] shadow-warm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2 text-xs font-black text-[#167D75]">
                  <Receipt className="w-4 h-4 text-[#FF735C]" />
                  <span>অর্ডারের পাকা রসিদ</span>
                </div>
                <span className="text-[10px] font-extrabold bg-[#DDF5E5] text-[#167D75] px-2 py-0.5 rounded-full">
                  পরিশোধিত ({order.paymentMethod})
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span>খাবারের মোট সাবটোটাল:</span>
                  <span className="font-bold text-[#343434]">৳{order.foodSubtotal}</span>
                </div>

                <div className="flex justify-between text-gray-400 line-through">
                  <span>আলাদা ডেলিভারি চার্জ:</span>
                  <span>৳{order.separateDeliveryFee}</span>
                </div>

                <div className="flex justify-between text-[#167D75] font-bold">
                  <span>স্মার্ট শেয়ার্ড ডেলিভারি ফি:</span>
                  <span>৳{order.combinedDeliveryFee}</span>
                </div>

                {order.firstOrderDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>প্রথম অর্ডার ডিসকাউন্ট:</span>
                    <span>-৳{order.firstOrderDiscount}</span>
                  </div>
                )}

                {order.loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>লয়্যালটি ২৫% ছাড়:</span>
                    <span>-৳{order.loyaltyDiscount}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                  <span className="text-sm font-black text-[#343434]">মোট পরিশোধিত:</span>
                  <span className="text-2xl font-black text-[#FF735C]">
                    ৳{order.totalAmount}
                  </span>
                </div>
              </div>

              {/* Savings Highlight Box */}
              <div className="p-3 rounded-2xl bg-[#FFE2CF]/60 border border-[#FF735C]/30 text-center">
                <p className="text-[11px] text-[#FF735C] font-extrabold flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>এই অর্ডারে আপনি ডেলিভারি ফি সাশ্রয় করেছেন ৳{order.deliverySavings}!</span>
                </p>
              </div>

              {/* Delivery Address */}
              <div className="pt-2 text-xs text-gray-500">
                <p className="font-bold text-[#343434] mb-0.5">ডেলিভারি গন্তব্য:</p>
                <p>{order.deliveryAddress?.fullAddress}</p>
              </div>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}

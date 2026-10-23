"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import {
  Bike,
  MapPin,
  CheckCircle2,
  Clock,
  Phone,
  Power,
  RefreshCw,
  Navigation,
  ArrowRight,
} from "lucide-react";

export default function RiderDashboardPage() {
  const { locale } = useLanguage();
  const [plans, setPlans] = useState<any[]>([]);
  const [rider, setRider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchDeliveries = () => {
    fetch("/api/rider/deliveries")
      .then((res) => res.json())
      .then((data) => {
        if (data.deliveryPlans) setPlans(data.deliveryPlans);
        if (data.riderProfile) setRider(data.riderProfile);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleToggleOnline = async () => {
    if (!rider) return;
    const nextState = !rider.isOnline;
    await fetch("/api/rider/deliveries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "TOGGLE_ONLINE", isOnline: nextState }),
    });
    fetchDeliveries();
  };

  const handleCompleteStop = async (stopId: string, planId: string) => {
    setUpdating(stopId);
    try {
      await fetch("/api/rider/deliveries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "COMPLETE_STOP", stopId, deliveryPlanId: planId }),
      });
      fetchDeliveries();
    } catch {
      // ignore
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFF9F0]">
        <Navbar />
        <div className="flex-1 max-w-5xl w-full mx-auto p-10">
          <div className="h-64 bg-white rounded-3xl animate-pulse mb-6" />
          <div className="h-96 bg-white rounded-3xl animate-pulse" />
        </div>
        <Footer />
      </div>
    );
  }

  const activePlans = plans.filter((p) => p.status !== "COMPLETED");
  const completedPlans = plans.filter((p) => p.status === "COMPLETED");
  const totalRiderEarnings = plans.reduce((sum, p) => sum + (p.riderPayout || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F0]">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[#FFE2CF] gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FFE2CF] text-[#FF735C] text-xs font-bold mb-1">
              <Bike className="w-3.5 h-3.5" />
              <span>রাইডার ট্রানজিট ড্যাশবোর্ড (Delivery Operations)</span>
            </div>
            <h1 className="text-3xl font-black text-[#343434] font-bangla">
              রাইডার পোর্টাল
            </h1>
            <p className="text-xs text-gray-500">
              যানবাহন: {rider?.vehicleType || "MOTORCYCLE"} • রেটিং: ★ {rider?.rating || 4.9}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleOnline}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-xs ${
                rider?.isOnline
                  ? "bg-[#DDF5E5] text-[#167D75] border border-[#167D75]/30 hover:bg-emerald-100"
                  : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{rider?.isOnline ? "অনলাইন (অর্ডার নিচ্ছেন)" : "অফলাইন"}</span>
            </button>

            <button
              onClick={fetchDeliveries}
              className="p-2.5 rounded-2xl bg-white border border-[#FFE2CF] text-gray-600 hover:text-[#167D75] shadow-xs"
              title="রিফ্রেশ"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Rider Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl p-5 border border-[#FFE2CF] shadow-xs">
            <p className="text-xs font-bold text-gray-400">সক্রিয় ডেলিভারি ট্রিপ</p>
            <p className="text-2xl font-black text-[#FF735C] mt-1">{activePlans.length}</p>
            <p className="text-[10px] text-gray-400">শেয়ার্ড মাল্টি-পিকআপ রুট</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#FFE2CF] shadow-xs">
            <p className="text-xs font-bold text-gray-400">সম্পন্ন ডেলিভারি</p>
            <p className="text-2xl font-black text-[#167D75] mt-1">{completedPlans.length}</p>
            <p className="text-[10px] text-gray-400">সফল ট্রিপ</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#FFE2CF] shadow-xs">
            <p className="text-xs font-bold text-gray-400">মোট রাইডার আয় (Payout)</p>
            <p className="text-2xl font-black text-[#343434] mt-1">৳{totalRiderEarnings}</p>
            <p className="text-[10px] text-gray-400">ন্যায্য ট্রিপ ইনসেন্টিভ</p>
          </div>
        </div>

        {/* Assigned Active Delivery Plans */}
        <div className="space-y-6 mb-12">
          <h2 className="text-lg font-black text-[#343434] font-bangla">
            বরাদ্দকৃত সক্রিয় ট্রিপ ({activePlans.length})
          </h2>

          {activePlans.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-[#FFE2CF] text-center text-xs text-gray-500">
              বর্তমানে কোনো সক্রিয় ট্রিপ নেই। নতুন অর্ডারের জন্য অপেক্ষা করা হচ্ছে...
            </div>
          ) : (
            <div className="space-y-6">
              {activePlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white rounded-3xl p-6 border border-[#FFE2CF] shadow-warm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#167D75]">
                          অর্ডার: {plan.parentOrder?.orderNumber}
                        </span>
                        <span className="text-[10px] bg-[#FFE2CF] text-[#FF735C] font-extrabold px-2 py-0.5 rounded-full">
                          {plan.planType === "SHARED" ? "শেয়ার্ড রুট" : "স্প্লিট রুট"}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        গ্রাহক: {plan.parentOrder?.customer?.user?.name} (
                        {plan.parentOrder?.deliveryAddress?.fullAddress})
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-gray-400 block">রাইডার পে-আউট</span>
                      <span className="text-lg font-black text-[#167D75]">
                        ৳{plan.riderPayout}
                      </span>
                    </div>
                  </div>

                  {/* Multi-Stop Sequence Execution */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#167D75]">
                      পর্যায়ক্রমিক স্টপ তালিকা (Sequential Delivery Route):
                    </p>

                    <div className="space-y-2">
                      {plan.stops?.map((stop: any) => (
                        <div
                          key={stop.id}
                          className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                            stop.isCompleted
                              ? "bg-[#DDF5E5]/40 border-[#167D75]/40 text-[#167D75]"
                              : "bg-[#FFF9F0] border-[#FFE2CF] text-[#343434]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                                stop.isCompleted
                                  ? "bg-[#167D75] text-white"
                                  : "bg-[#FF735C] text-white"
                              }`}
                            >
                              {stop.isCompleted ? "✓" : stop.stopSequence}
                            </span>
                            <div>
                              <p className="font-bold text-xs">{stop.addressText}</p>
                              <p className="text-[10px] text-gray-500">
                                {stop.stopType === "PICKUP"
                                  ? "খাবার পিকআপ স্টপ"
                                  : "গ্রাহকের ঠিকানায় ডেলিভারি"}
                              </p>
                            </div>
                          </div>

                          <div>
                            {stop.isCompleted ? (
                              <span className="text-xs font-black text-[#167D75] flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>সম্পন্ন</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleCompleteStop(stop.id, plan.id)}
                                disabled={updating === stop.id}
                                className="px-4 py-2 rounded-xl bg-[#167D75] hover:bg-[#0F5852] text-white text-xs font-bold shadow-xs transition-colors"
                              >
                                {stop.stopType === "PICKUP"
                                  ? "খাবার সংগ্রহ করেছি (Picked Up)"
                                  : "ডেলিভারি সম্পন্ন (Delivered)"}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
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

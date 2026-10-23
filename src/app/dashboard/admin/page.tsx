"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import {
  ShieldCheck,
  Users,
  Store,
  Bike,
  DollarSign,
  Award,
  Layers,
  Settings,
  History,
  RefreshCw,
  Save,
  CheckCircle2,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { locale } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [settingsForm, setSettingsForm] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const fetchOverview = () => {
    fetch("/api/admin/overview")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.metrics) {
          setData(resData);
          const sObj: Record<string, string> = {};
          resData.settings?.forEach((s: any) => {
            sObj[s.key] = s.value;
          });
          setSettingsForm(sObj);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleSaveSetting = async (key: string) => {
    setSavingKey(key);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: settingsForm[key] }),
      });
      if (res.ok) {
        setSaveSuccess(key);
        setTimeout(() => setSaveSuccess(null), 2000);
        fetchOverview();
      }
    } catch {
      // ignore
    } finally {
      setSavingKey(null);
    }
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

  const metrics = data?.metrics || {};

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F0]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[#FFE2CF] gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>প্ল্যাটফর্ম অ্যাডমিন ওভারসাইট (Platform Governance)</span>
            </div>
            <h1 className="text-3xl font-black text-[#343434] font-bangla">
              প্রশাসন ও অডিট ড্যাশবোর্ড
            </h1>
            <p className="text-xs text-gray-500">
              লজিস্টিক প্যারামিটার, অর্ডার বিশ্লেষণ এবং রিয়েলটাইম ক্লাস্টার ওভারভিউ
            </p>
          </div>

          <button
            onClick={fetchOverview}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white border border-[#FFE2CF] text-xs font-bold text-[#167D75] hover:bg-[#DDF5E5] transition-all shadow-xs self-start sm:self-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>তথ্য রিফ্রেশ</span>
          </button>
        </div>

        {/* 6 Key Platform KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          
          <div className="bg-white rounded-3xl p-5 border border-[#FFE2CF] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFE2CF] text-[#FF735C] flex items-center justify-center font-black">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold">প্যারেন্ট বনাম সাব-অর্ডার</p>
              <p className="text-2xl font-black text-[#343434]">
                {metrics.totalParentOrders || 0} / {metrics.totalSubOrders || 0}
              </p>
              <p className="text-[10px] text-gray-500">
                মাল্টি-রেস্টুরেন্ট অর্ডার: {metrics.multiRestaurantOrders || 0} টি
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#FFE2CF] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#DDF5E5] text-[#167D75] flex items-center justify-center font-black">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold">গ্রাহকের মোট ডেলিভারি সাশ্রয়</p>
              <p className="text-2xl font-black text-[#167D75]">
                ৳{metrics.totalCustomerSavings || 0}
              </p>
              <p className="text-[10px] text-gray-500">গড় ডেলিভারি ফি: ৳{metrics.avgDeliveryFee || 0}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#FFE2CF] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold">শেয়ার্ড বনাম স্প্লিট রুট</p>
              <p className="text-2xl font-black text-[#343434]">
                {metrics.sharedDeliveries || 0} : {metrics.splitDeliveries || 0}
              </p>
              <p className="text-[10px] text-gray-500">অনলাইন রাইডার: {metrics.onlineRiders || 0} জন</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#FFE2CF] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold">লয়্যালটি কোয়ালিফাইড কাস্টমার</p>
              <p className="text-2xl font-black text-amber-600">
                {metrics.loyaltyQualifiedCount || 0} জন
              </p>
              <p className="text-[10px] text-gray-500">মাসে ১৫+ সম্পন্ন অর্ডার</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#FFE2CF] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold">সক্রিয় পার্টনার রেস্টুরেন্ট</p>
              <p className="text-2xl font-black text-emerald-700">
                {metrics.activeRestaurants || 0} টি
              </p>
              <p className="text-[10px] text-gray-500">ধানমণ্ডি ও গুলশান ক্লাস্টার</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#FFE2CF] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold">মোট নিবন্ধিত গ্রাহক</p>
              <p className="text-2xl font-black text-purple-700">
                {metrics.totalCustomers || 0} জন
              </p>
              <p className="text-[10px] text-gray-500">আজকের অর্ডার: {metrics.ordersToday || 0} টি</p>
            </div>
          </div>

        </div>

        {/* Platform Settings Configuration Panel */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FFE2CF] shadow-warm mb-10 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
            <Settings className="w-5 h-5 text-[#FF735C]" />
            <h2 className="text-lg font-black text-[#343434] font-bangla">
              লজিস্টিক ও বিজনেস রুল কনফিগারেশন
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Setting: Cluster Distance */}
            <div className="p-4 rounded-2xl bg-[#FFF9F0] border border-[#FFE2CF] space-y-2">
              <label className="block text-xs font-bold text-[#343434]">
                রেস্টুরেন্ট ক্লাস্টার সীমা (মিটার) — max_cluster_distance_meters
              </label>
              <p className="text-[11px] text-gray-500">
                এই দূরত্বের ভেতরের রেস্টুরেন্টগুলো শেয়ার্ড রুটে একত্র করা হয় (ডিফল্ট: ৬০০ মিটার)।
              </p>
              <div className="flex gap-2 pt-1">
                <input
                  type="number"
                  value={settingsForm["max_cluster_distance_meters"] || "600"}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, max_cluster_distance_meters: e.target.value })
                  }
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#FFE2CF] text-xs font-bold"
                />
                <button
                  onClick={() => handleSaveSetting("max_cluster_distance_meters")}
                  disabled={savingKey === "max_cluster_distance_meters"}
                  className="px-3.5 py-1.5 rounded-xl bg-[#167D75] text-white text-xs font-bold hover:bg-[#0F5852] flex items-center gap-1"
                >
                  {saveSuccess === "max_cluster_distance_meters" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  <span>সেভ</span>
                </button>
              </div>
            </div>

            {/* Setting: Loyalty Threshold */}
            <div className="p-4 rounded-2xl bg-[#FFF9F0] border border-[#FFE2CF] space-y-2">
              <label className="block text-xs font-bold text-[#343434]">
                মাসিক লয়্যালটি থ্রেশহোল্ড (অর্ডার সংখ্যা) — loyalty_threshold_orders
              </label>
              <p className="text-[11px] text-gray-500">
                এক মাসে এর চেয়ে বেশি অর্ডার সম্পন্ন করলে পরবর্তী মাসে ২৫% ছাড় সক্রিয় হবে (ডিফল্ট: ১৫)।
              </p>
              <div className="flex gap-2 pt-1">
                <input
                  type="number"
                  value={settingsForm["loyalty_threshold_orders"] || "15"}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, loyalty_threshold_orders: e.target.value })
                  }
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#FFE2CF] text-xs font-bold"
                />
                <button
                  onClick={() => handleSaveSetting("loyalty_threshold_orders")}
                  disabled={savingKey === "loyalty_threshold_orders"}
                  className="px-3.5 py-1.5 rounded-xl bg-[#167D75] text-white text-xs font-bold hover:bg-[#0F5852] flex items-center gap-1"
                >
                  {saveSuccess === "loyalty_threshold_orders" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  <span>সেভ</span>
                </button>
              </div>
            </div>

            {/* Setting: Base Delivery Fee */}
            <div className="p-4 rounded-2xl bg-[#FFF9F0] border border-[#FFE2CF] space-y-2">
              <label className="block text-xs font-bold text-[#343434]">
                বেস ডেলিভারি ফি (টাকা) — base_delivery_fee
              </label>
              <p className="text-[11px] text-gray-500">
                একক রেস্টুরেন্ট বা শেয়ার্ড রুটের প্রাথমিক শুরু ফি (ডিফল্ট: ৫০ টাকা)।
              </p>
              <div className="flex gap-2 pt-1">
                <input
                  type="number"
                  value={settingsForm["base_delivery_fee"] || "50"}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, base_delivery_fee: e.target.value })
                  }
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#FFE2CF] text-xs font-bold"
                />
                <button
                  onClick={() => handleSaveSetting("base_delivery_fee")}
                  disabled={savingKey === "base_delivery_fee"}
                  className="px-3.5 py-1.5 rounded-xl bg-[#167D75] text-white text-xs font-bold hover:bg-[#0F5852] flex items-center gap-1"
                >
                  {saveSuccess === "base_delivery_fee" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  <span>সেভ</span>
                </button>
              </div>
            </div>

            {/* Setting: Additional Stop Fee */}
            <div className="p-4 rounded-2xl bg-[#FFF9F0] border border-[#FFE2CF] space-y-2">
              <label className="block text-xs font-bold text-[#343434]">
                অতিরিক্ত পিকআপ স্টপ ফি (টাকা) — additional_restaurant_fee
              </label>
              <p className="text-[11px] text-gray-500">
                প্রতিটি অতিরিক্ত রেস্টুরেন্ট স্টপের জন্য যুক্ত ফি (ডিফল্ট: ২৫ টাকা)।
              </p>
              <div className="flex gap-2 pt-1">
                <input
                  type="number"
                  value={settingsForm["additional_restaurant_fee"] || "25"}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, additional_restaurant_fee: e.target.value })
                  }
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#FFE2CF] text-xs font-bold"
                />
                <button
                  onClick={() => handleSaveSetting("additional_restaurant_fee")}
                  disabled={savingKey === "additional_restaurant_fee"}
                  className="px-3.5 py-1.5 rounded-xl bg-[#167D75] text-white text-xs font-bold hover:bg-[#0F5852] flex items-center gap-1"
                >
                  {saveSuccess === "additional_restaurant_fee" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  <span>সেভ</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Security Audit Log */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FFE2CF] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <History className="w-5 h-5 text-[#167D75]" />
            <h2 className="text-lg font-black text-[#343434] font-bangla">
              প্ল্যাটফর্ম সিকিউরিটি ও অপারেশনাল অডিট লগ
            </h2>
          </div>

          <div className="space-y-2 overflow-x-auto">
            {data?.auditLogs?.map((log: any) => (
              <div
                key={log.id}
                className="p-3 rounded-2xl bg-[#FFF9F0] border border-[#FFE2CF] flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2"
              >
                <div>
                  <span className="font-extrabold text-[#167D75] mr-2">[{log.action}]</span>
                  <span className="text-gray-700">{log.details}</span>
                </div>
                <div className="text-[11px] text-gray-400 shrink-0">
                  {new Date(log.createdAt).toLocaleString("bn-BD")}
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

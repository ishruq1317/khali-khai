"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  MapPin,
  CreditCard,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function CheckoutPage() {
  const { locale, t } = useLanguage();
  const router = useRouter();
  const {
    items,
    removeItem,
    updateQuantity,
    restaurantGroups,
    foodSubtotal,
    pricing,
    clearCart,
    isFirstOrder,
    hasLoyaltyDiscount,
    setDiscounts,
  } = useCart();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [customAddress, setCustomAddress] = useState({
    label: "হোম (Home)",
    fullAddress: "হাউজ ১২, রোড ৫, ধানমণ্ডি, ঢাকা-১২০৫",
    area: "Dhanmondi",
    latitude: 23.7430,
    longitude: 90.3800,
  });
  const [paymentMethod, setPaymentMethod] = useState("BKASH");
  const [orderNotes, setOrderNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Load customer profile and loyalty info
  useEffect(() => {
    fetch("/api/customer/loyalty")
      .then((res) => res.json())
      .then((data) => {
        if (data.loyalty) {
          setDiscounts(
            data.loyalty.isFirstOrderEligible,
            data.loyalty.isEligibleForDiscountThisMonth
          );
        }
        if (data.addresses && data.addresses.length > 0) {
          setAddresses(data.addresses);
          const defaultAddr = data.addresses.find((a: any) => a.isDefault);
          setSelectedAddressId(defaultAddr ? defaultAddr.id : data.addresses[0].id);
        }
      })
      .catch(() => {});

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems: items,
          deliveryAddressId: selectedAddressId || undefined,
          customAddress: !selectedAddressId ? customAddress : undefined,
          paymentMethod,
          notes: orderNotes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login?redirect=/checkout");
          return;
        }
        throw new Error(data.error || "অর্ডার সম্পন্ন হতে ব্যর্থ হয়েছে");
      }

      // Clear cart on successful placement and update first-order status
      clearCart();
      setDiscounts(false, hasLoyaltyDiscount);
      router.push(`/orders/${data.orderId}`);
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFF9F0]">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-[#FFE2CF] flex items-center justify-center text-[#FF735C] mb-4">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-[#343434] font-bangla mb-2">
            আপনার কার্ট বর্তমানে খালি!
          </h2>
          <p className="text-xs text-gray-500 max-w-sm mb-6">
            পছন্দের রেস্টুরেন্টগুলো থেকে খাবার বেছে নিয়ে এক কার্টেই সব খাবার যোগ করুন।
          </p>
          <Link
            href="/restaurants"
            className="px-6 py-3 rounded-2xl bg-[#FF735C] text-white text-xs font-bold hover:bg-[#E25842] transition-all shadow-md"
          >
            {t.exploreRestaurants}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F0]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#343434] font-bangla">
            {locale === "bn" ? "অর্ডার চেকআউট ও পেমেন্ট" : "Unified Checkout & Payment"}
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            {locale === "bn"
              ? "একাধিক রেস্টুরেন্টের খাবার এক অর্ডারে। দেখুন আপনার স্বচ্ছ ডেলিভারি হিসাব।"
              : "Multiple restaurants unified into one order with transparent delivery fee breakdown."}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (7 cols): Items grouped by Restaurant & Delivery Address */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Restaurant Groups */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#167D75]">
                {locale === "bn"
                  ? `নির্বাচিত খাবার (${restaurantGroups.length}টি রেস্টুরেন্ট)`
                  : `Selected Dishes (${restaurantGroups.length} Restaurants)`}
              </h2>

              {restaurantGroups.map((group) => (
                <div
                  key={group.restaurantId}
                  className="bg-white rounded-3xl p-5 border border-[#FFE2CF] shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#FFF9F0] border border-[#FFE2CF] flex items-center justify-center text-xs font-black text-[#FF735C]">
                        {group.restaurantNameBn.charAt(0)}
                      </div>
                      <span className="font-black text-sm text-[#343434] font-bangla">
                        {locale === "bn" ? group.restaurantNameBn : group.restaurantNameEn}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#167D75] bg-[#DDF5E5] px-2.5 py-0.5 rounded-full">
                      সাবটোটাল: ৳{group.subtotal}
                    </span>
                  </div>

                  {/* Group Items */}
                  <div className="space-y-3">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs py-1"
                      >
                        <div className="flex-1 mr-4">
                          <p className="font-bold text-[#343434]">
                            {locale === "bn" ? item.nameBn : item.nameEn}
                          </p>
                          <p className="text-[11px] text-gray-500 font-medium">
                            ৳{item.price} × {item.quantity} = ৳{item.price * item.quantity}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-[#FFE2CF] rounded-xl bg-[#FFF9F0] overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-1 text-gray-600 hover:text-[#FF735C]"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-black text-[#343434]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-1 text-gray-600 hover:text-[#FF735C]"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Address Box */}
            <div className="bg-white rounded-3xl p-5 border border-[#FFE2CF] shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#167D75]">
                <MapPin className="w-4 h-4 text-[#FF735C]" />
                <span>{locale === "bn" ? "ডেলিভারি ঠিকানা" : "Delivery Address"}</span>
              </div>

              {addresses.length > 0 ? (
                <div className="space-y-2">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer text-xs transition-all ${
                        selectedAddressId === addr.id
                          ? "border-[#167D75] bg-[#DDF5E5]/40"
                          : "border-gray-200 hover:border-[#FFE2CF]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-0.5 accent-[#167D75]"
                      />
                      <div>
                        <p className="font-bold text-[#343434]">{addr.label}</p>
                        <p className="text-gray-600 mt-0.5">{addr.fullAddress}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={customAddress.fullAddress}
                    onChange={(e) =>
                      setCustomAddress({ ...customAddress, fullAddress: e.target.value })
                    }
                    placeholder="আপনার সম্পূর্ণ ঠিকানা লিখুন..."
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FFF9F0] border border-[#FFE2CF] text-xs text-[#343434] outline-none focus:border-[#FF735C]"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customAddress.area}
                      onChange={(e) =>
                        setCustomAddress({ ...customAddress, area: e.target.value })
                      }
                      placeholder="এলাকা (যেমন: ধানমণ্ডি)"
                      className="flex-1 px-3.5 py-2 rounded-2xl bg-[#FFF9F0] border border-[#FFE2CF] text-xs text-[#343434] outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Special Instructions Note */}
            <div className="bg-white rounded-3xl p-5 border border-[#FFE2CF] shadow-xs space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                {locale === "bn" ? "রাইডার বা কিচেনের জন্য বিশেষ নির্দেশনা (ঐচ্ছিক)" : "Special Instructions (Optional)"}
              </label>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="যেমন: ঝাল একটু কম দেবেন, দরজায় বেল বাজাবেন না..."
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FFF9F0] border border-[#FFE2CF] text-xs text-[#343434] outline-none focus:border-[#FF735C]"
              />
            </div>

          </div>

          {/* Right Column (5 cols): Live Fee Comparison & Payment */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Transparent Delivery Comparison Card */}
            <div className="bg-gradient-to-br from-[#FFE2CF]/60 to-[#FFF9F0] rounded-3xl p-6 border border-[#FF735C]/30 shadow-warm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#FFE2CF]">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#FF735C]">
                  <Sparkles className="w-4 h-4 text-[#FF735C]" />
                  <span>স্বচ্ছ ডেলিভারি ফি তুলনা</span>
                </div>
                <span className="text-[11px] font-black bg-[#FF735C] text-white px-2.5 py-0.5 rounded-full">
                  ৳{pricing.deliverySavings} সাশ্রয়
                </span>
              </div>

              {/* Price rows */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-gray-700">
                  <span>খাবারের মোট সাবটোটাল:</span>
                  <span className="font-bold text-[#343434]">৳{foodSubtotal}</span>
                </div>

                <div className="flex justify-between text-gray-500 line-through">
                  <span>আলাদা অর্ডার করলে ডেলিভারি ফি:</span>
                  <span>৳{pricing.separateDeliveryFee}</span>
                </div>

                <div className="flex justify-between text-[#167D75] font-bold">
                  <span>স্মার্ট শেয়ার্ড ডেলিভারি চার্জ:</span>
                  <span>৳{pricing.combinedDeliveryFee}</span>
                </div>

                {pricing.firstOrderDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>প্রথম অর্ডার প্রোমো ছাড়:</span>
                    <span>-৳{pricing.firstOrderDiscount}</span>
                  </div>
                )}

                {pricing.loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>লয়্যালটি ২৫% ডেলিভারি ছাড়:</span>
                    <span>-৳{pricing.loyaltyDiscount}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-[#FFE2CF] flex justify-between items-baseline">
                  <span className="text-sm font-black text-[#343434]">সর্বমোট প্রদেয়:</span>
                  <span className="text-2xl font-black text-[#FF735C]">
                    ৳{pricing.grandTotal}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white rounded-3xl p-6 border border-[#FFE2CF] shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#167D75]">
                <CreditCard className="w-4 h-4 text-[#FF735C]" />
                <span>{locale === "bn" ? "পেমেন্ট পদ্ধতি বেছে নিন" : "Select Payment Method"}</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: "BKASH", name: "বিকাশ (bKash)", badge: "জনপ্রিয়" },
                  { id: "NAGAD", name: "নগদ (Nagad)" },
                  { id: "CARD", name: "কার্ড (Card)" },
                  { id: "COD", name: "ক্যাশ অন ডেলিভারি" },
                ].map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all ${
                      paymentMethod === method.id
                        ? "border-[#FF735C] bg-[#FFE2CF]/40 text-[#FF735C] shadow-xs"
                        : "border-gray-200 text-gray-700 hover:border-[#FFE2CF]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{method.name}</span>
                      {method.badge && (
                        <span className="text-[9px] bg-[#FF735C] text-white px-1.5 py-0.2 rounded">
                          {method.badge}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full py-4 rounded-3xl bg-gradient-to-r from-[#FF735C] to-[#E25842] text-white text-sm font-black shadow-warm hover:shadow-warm-lg hover:scale-101 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span>অর্ডার প্রসেস হচ্ছে...</span>
              ) : (
                <>
                  <span>৳{pricing.grandTotal} পেমেন্ট করে নিশ্চিত করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>নিরাপদ ও এনক্রিপ্টেড চেকআউট গেটওয়ে</span>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}

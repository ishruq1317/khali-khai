"use client";

import React from "react";
import Link from "next/link";
import { Phone, Mail, MessageSquare, Heart } from "lucide-react";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-white/80 backdrop-blur-md border-t border-[#FFE6D7] py-4 text-[#343434] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Brand & Copyright */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#FF5A36] to-[#FF8A65] flex items-center justify-center text-white font-black text-xs shadow-xs">
            খ
          </div>
          <div className="flex items-center gap-2">
            <span className="font-black text-[#222222] font-bangla">খালি খাই (Khali Khai)</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500 text-[11px]">© ২০২৬ সর্বস্বত্ব সংরক্ষিত</span>
          </div>
        </div>

        {/* Compact Functional Contact Shortcuts */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
          <a
            href="tel:01405080369"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFF5EC] text-gray-700 hover:text-[#FF5A36] hover:bg-[#FFEADB] transition-all"
            title="ফোন কল করুন"
          >
            <Phone className="w-3.5 h-3.5 text-[#FF5A36]" />
            <span>01405080369</span>
          </a>

          <a
            href="https://wa.me/8801405080369"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-all"
            title="হোয়াটসঅ্যাপ চ্যাট"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>হোয়াটসঅ্যাপ</span>
          </a>

          <a
            href="mailto:nabil12e4@gmail.com"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFF5EC] text-gray-700 hover:text-[#0D8275] hover:bg-[#DDF5E5] transition-all"
            title="ইমেইল পাঠান"
          >
            <Mail className="w-3.5 h-3.5 text-[#0D8275]" />
            <span>nabil12e4@gmail.com</span>
          </a>

          <a
            href="https://www.facebook.com/share/19grsqhXYj/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 hover:bg-blue-100 transition-all"
            title="ফেসবুক পেজ"
          >
            <FacebookIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>ফেসবুক</span>
          </a>
        </div>

      </div>
    </footer>
  );
}

"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

export function AnimatedBrandTitle() {
  const { locale } = useLanguage();

  if (locale === "en") {
    const word1 = ["K", "h", "a", "l", "i"];
    const word2 = ["K", "h", "a", "i"];

    return (
      <div className="animate-brand-container relative inline-block select-none py-2">
        {/* Ambient Backlight Halo */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#FF5A36]/25 via-[#FFB300]/25 to-[#0D8275]/20 blur-3xl rounded-full scale-110 pointer-events-none" />

        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-sans tracking-tight leading-none flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6">
          <span className="inline-flex whitespace-nowrap">
            {word1.map((char, i) => (
              <span
                key={`w1-${i}`}
                className="inline-block animate-letter-reveal gradient-shimmer-text"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {char}
              </span>
            ))}
          </span>

          <span className="inline-flex whitespace-nowrap">
            {word2.map((char, i) => (
              <span
                key={`w2-${i}`}
                className="inline-block animate-letter-reveal gradient-shimmer-text"
                style={{ animationDelay: `${0.55 + i * 0.1}s` }}
              >
                {char}
              </span>
            ))}
          </span>
        </h1>
      </div>
    );
  }

  // Bengali Brand Name: খালি খাই
  // Two words: "খালি" and "খাই"
  // Graphemes: ["খা", "লি"] and ["খা", "ই"]
  const word1 = ["খা", "লি"];
  const word2 = ["খা", "ই"];

  return (
    <div className="animate-brand-container relative inline-block select-none py-2">
      {/* Ambient Backlight Halo */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#FF5A36]/25 via-[#FFB300]/25 to-[#0D8275]/20 blur-3xl rounded-full scale-110 pointer-events-none" />

      <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-bangla tracking-tight leading-none flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 md:gap-x-8">
        {/* Word 1: খালি */}
        <span className="inline-flex whitespace-nowrap">
          <span
            className="inline-block animate-letter-reveal gradient-shimmer-text"
            style={{ animationDelay: "0.0s" }}
          >
            খা
          </span>
          <span
            className="inline-block animate-letter-reveal gradient-shimmer-text"
            style={{ animationDelay: "0.22s" }}
          >
            লি
          </span>
        </span>

        {/* Word 2: খাই */}
        <span className="inline-flex whitespace-nowrap">
          <span
            className="inline-block animate-letter-reveal gradient-shimmer-text"
            style={{ animationDelay: "0.48s" }}
          >
            খা
          </span>
          <span
            className="inline-block animate-letter-reveal gradient-shimmer-text"
            style={{ animationDelay: "0.70s" }}
          >
            ই
          </span>
        </span>
      </h1>
    </div>
  );
}

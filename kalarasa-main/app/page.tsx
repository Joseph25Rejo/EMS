"use client";
import React, { useState } from "react";
import { Inter, Instrument_Sans, Instrument_Serif } from 'next/font/google';
//import Link from "next/link";

const inter = Inter({ subsets: ['latin'] });
const instrumentSans = Instrument_Sans({ subsets: ['latin'] });
const instrumentSerif = Instrument_Serif({ subsets: ['latin'],weight:["400"] });

export default function KalarasaLanding() {
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);

  return (
      <div className="min-h-screen overflow-hidden relative" style={{ backgroundColor: "#ECFF72" }}>

      {/* Left SVG */}
      <div className="absolute top-8 left-13 z-10">
        <img src="/left.svg" alt="Left decoration" className="w-20 h-20" />
      </div>

      {/* Header */}
      <header className="flex justify-end items-center p-6 relative z-10">
        <div className="space-x-4">
          <a
            href="/login"
            className="px-4 py-2 text-black hover:text-red-700 transition-colors duration-300 font-medium"
          >
            Login
          </a>
          <a
            href="/login"
            className="px-6 py-2 text-black hover:text-red-700 transition-colors duration-300 font-medium"
          >
            Signup
          </a>
        </div>
      </header>


      <div className="flex items-center min-h-[calc(100vh-100px)] px-15">
        {/* Left Content */}
        <div className="flex-1 space-y-8 relative z-10 max-w-md">
          {/* Kalarasa - Inter Regular */}
          <h1 className={`text-5xl mb-23 text-black font-normal ${inter.className}`}>Kalarasa</h1>

          <div className="space-y-4">
            {/* EXPLORE - Inter Regular */}
            <h2 className={`text-4xl text-black font-normal leading-relaxed ${inter.className}`}>
              EXPLORE{" "}
              {/* INDIAN ART - Instrument Sans Regular */}
              <span className={`text-red-700 text-4xl font-normal ${instrumentSans.className}`}>
                INDIAN ART
              </span>
            </h2>

            {/* LIKE NEVER BEFORE - Inter Regular */}
            <p className={`text-4xl text-black font-normal ${inter.className}`}>
              LIKE NEVER BEFORE
            </p>

            <div className="w-64 h-0.5 bg-black"></div>
          </div>

          {/* Categories - Instrument Serif Regular */}
          <div className="space-y-6 mt-12">
            {["Folk", "Tribal Art", "Handicrafts"].map((category, index) => (
              <div
                key={category}
                className={`cursor-pointer transition-all duration-300 ${
                  hoveredCategory === index ? "transform translate-x-2" : ""
                }`}
                onMouseEnter={() => setHoveredCategory(index)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <h3 className={`text-4xl text-black hover:text-red-700 transition-colors duration-300 font-normal ${instrumentSerif.className}`}>
                  {category}
                </h3>
              </div>
            ))}
          </div>
        </div>

        {/* Right SVG */}
        <div className="flex-1 flex justify-start items-center relative">
          <img
            src="/right.svg"
            alt="Tribal art decoration"
            className="w-[600px] h-auto ml-90"
          />
        </div>
      </div>
    </div>
  );
}
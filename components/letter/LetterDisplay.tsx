"use client";

import { useState } from "react";
import type { Letter } from "@/lib/types";

export default function LetterDisplay({ letter }: { letter: Letter }) {
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);

  const handleOpen = () => {
    setOpening(true);
    // Wait for the lid popping animation before showing the contents
    setTimeout(() => {
      setOpened(true);
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Card */}
      <div className="glass rounded-3xl p-8 text-center shadow-xl relative overflow-hidden">
        {/* Decorative corners */}
        <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-rose-200 rounded-tl-lg opacity-50" />
        <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-rose-200 rounded-tr-lg opacity-50" />
        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-rose-200 rounded-bl-lg opacity-50" />
        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-rose-200 rounded-br-lg opacity-50" />

        {/* Pill label */}
        <div className="inline-block px-4 py-1.5 bg-rose-100 text-rose-500 rounded-full text-xs font-medium tracking-wider uppercase mb-6 shadow-sm">
          A Special Gift Just For You
        </div>

        {/* Heading */}
        <h2 className="text-3xl lg:text-4xl font-[family-name:var(--font-heading)] font-bold text-warm-gray mb-2 leading-tight">
          {letter.heading}
        </h2>

        {letter.subheading && (
          <p className="text-warm-gray/60 italic mb-6">{letter.subheading}</p>
        )}

        {/* Present Box or Revealed Content */}
        <div className="mt-12 mb-8 min-h-[300px] flex items-center justify-center">
          {!opened ? (
            <button
              onClick={handleOpen}
              disabled={opening}
              className="group relative cursor-pointer"
            >
              {/* The Gift Box */}
              <div className={`relative w-48 h-48 bg-gradient-to-br from-rose-400 to-rose-500 rounded-xl shadow-xl transition-transform duration-300 ${!opening ? 'group-hover:scale-105 group-hover:rotate-1 group-hover:shadow-2xl' : ''}`}>
                
                {/* Vertical Ribbon */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-white/30 backdrop-blur-sm" />
                
                {/* Horizontal Ribbon */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-8 bg-white/30 backdrop-blur-sm" />

                {/* Gift Lid */}
                <div className={`absolute -top-4 -left-2 -right-2 h-14 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg shadow-lg z-10 ${opening ? 'gift-lid-open' : ''}`}>
                  {/* Vertical Ribbon on Lid */}
                  <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-white/40" />
                  
                  {/* The Bow */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-12 flex justify-center items-end">
                    {/* Left Loop */}
                    <div className="w-10 h-10 border-4 border-white/60 rounded-full rounded-br-none -mr-2 rotate-12" />
                    {/* Right Loop */}
                    <div className="w-10 h-10 border-4 border-white/60 rounded-full rounded-bl-none -ml-2 -rotate-12" />
                    {/* Center Knot */}
                    <div className="absolute bottom-1 w-6 h-6 bg-white/80 rounded-full shadow-sm" />
                  </div>
                </div>
              </div>
              <p className={`text-sm text-rose-400 mt-10 transition-opacity ${opening ? 'opacity-0' : 'group-hover:text-rose-500 animate-pulse-soft'}`}>
                Tap to open your present 🎁
              </p>
            </button>
          ) : (
            <div className="letter-reveal w-full max-w-2xl">
              {/* Opened Present Content */}
              <div className="bg-white/90 rounded-3xl p-6 sm:p-10 shadow-2xl border border-rose-100 flex flex-col md:flex-row items-center gap-8 text-left relative">
                
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🎀</span>
                    <h3 className="font-[family-name:var(--font-heading)] font-bold text-2xl text-rose-500">
                      Surprise!
                    </h3>
                  </div>
                  
                  <p className="text-warm-gray leading-relaxed whitespace-pre-wrap font-medium text-lg">
                    {letter.message}
                  </p>
                  
                  <div>
                    <p className="text-rose-400 font-medium italic">with all my love ♡</p>
                  </div>
                </div>

                {letter.gifPath && (
                  <div className="shrink-0 md:w-64">
                    <div className="bg-rose-50 p-2 rounded-2xl rotate-2 hover:rotate-0 transition-transform duration-300 shadow-md">
                      <img
                        src={letter.gifPath}
                        alt="A cute surprise"
                        className="w-full h-auto rounded-xl object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => {
                  setOpened(false);
                  setOpening(false);
                }}
                className="mt-8 px-6 py-2 rounded-full border border-rose-200 text-sm text-warm-gray/60 hover:text-rose-500 hover:border-rose-300 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                Re-wrap present
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

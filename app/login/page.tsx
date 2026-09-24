"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-100 via-blush to-cream relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-rose-200 rounded-full opacity-40 blur-xl animate-float" />
      <div className="absolute bottom-32 right-16 w-48 h-48 bg-gold-light rounded-full opacity-30 blur-2xl animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-10 w-20 h-20 bg-rose-300 rounded-full opacity-20 blur-lg animate-float" style={{ animationDelay: "2s" }} />

      <div className="glass rounded-3xl p-10 w-full max-w-md shadow-2xl animate-fade-in-up relative z-10">
        {/* Heart icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-[family-name:var(--font-heading)] font-bold text-center text-warm-gray mb-2">
          Our Timeline
        </h1>
        <p className="text-center text-rose-400 mb-8 text-sm tracking-wide">
          a little world, made for us ♡
        </p>

        <form action={action} className="space-y-5">
          <div className="relative">
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter our secret password..."
              className="w-full px-5 py-4 bg-white/60 border border-rose-200 rounded-2xl text-warm-gray placeholder:text-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-center text-lg"
              autoFocus
            />
          </div>

          {state?.error && (
            <div className="text-center">
              <p className="text-rose-500 text-sm animate-fade-in-up">{state.error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-4 bg-gradient-to-r from-rose-400 to-rose-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:from-rose-500 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer"
          >
            {pending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Opening...
              </span>
            ) : (
              "Enter ♡"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

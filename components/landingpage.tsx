"use client";
import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Shield,
  MessageCircle,
  Lock,
  Check,
  ChevronRight,
  Zap,
  Users,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function KabootarLanding() {
  const [activeStep, setActiveStep] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsLoaded(true);
    // Auto-cycle through steps
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="pt-24 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div
              className={`transition-all duration-1000 ${
                isLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              {/* Status Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-white rounded-full text-sm text-slate-600 mb-8 shadow-sm border border-slate-200">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                Trusted by users worldwide
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-8 tracking-tight leading-tight">
                Messages That
                <br />
                <span className="bg-gradient-to-r from-slate-600 to-slate-400 bg-clip-text text-transparent">
                  Fly Secure
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Like the trusted kabootar of ancient times, your messages reach
                their destination safely.
                <span className="block mt-2 text-lg text-slate-500">
                  End-to-end encrypted. Zero tracking. Simply secure.
                </span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <button
                  onClick={() => router.push("/conversations")}
                  className="bg-slate-800 text-white px-8 py-4 rounded-xl font-semibold hover:bg-slate-900 transition-all duration-300 flex items-center justify-center group shadow-lg hover:shadow-xl"
                >
                  Start Flying Messages
                  <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500 mb-20">
                <div className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                  No phone number required
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                  Works on any device
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                  Free forever plan
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-24 bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-8">🕊️</div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Let Your Messages Fly?
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Join thousands who've rediscovered the joy of truly private
            messaging. Your kabootar awaits.
          </p>

          <button
            onClick={() => router.push("/conversations")}
            className="bg-white text-slate-800 px-10 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all duration-300 flex items-center justify-center group mx-auto shadow-xl"
          >
            Start Your Secure Journey
            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </button>

          <div className="flex flex-wrap items-center justify-center gap-8 mt-12 text-sm text-slate-400">
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-green-400" />
              Setup in 30 seconds
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-green-400" />
              No credit card needed
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-green-400" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-slate-400">
              © 2025 Kabootar. Secure messaging, inspired by ancient wisdom.
              <span className="block mt-2 text-sm">
                Made with 💙 for privacy-conscious communicators
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

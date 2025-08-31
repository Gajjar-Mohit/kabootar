"use client";
import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Shield,
  MessageCircle,
  Lock,
  Check,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function KabootarLanding() {
  const [activeStep, setActiveStep] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const steps = [
    {
      number: "01",
      title: "Secure by Design",
      description: "End-to-end encryption protects every message",
    },
    {
      number: "02",
      title: "Simple to Use",
      description: "Clean interface, no learning curve required",
    },
    {
      number: "03",
      title: "Always Private",
      description: "Your data stays yours, no tracking or storage",
    },
  ];

  return (
    <div className="pt-17 min-h-screen bg-white">
      {/* Hero Section */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 mb-8">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Trusted secure messaging
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
                Secure Messages.
                <br />
                <span className="text-gray-400">Simply Delivered.</span>
              </h1>

              <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                Professional-grade encryption meets effortless messaging. Your
                conversations, protected and private.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
              <button
                onClick={() => {
                  router.push("/conversations");
                }}
                className="bg-black text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition-all duration-300 flex items-center justify-center group"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-medium hover:border-gray-400 hover:bg-gray-50 transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {[
              {
                icon: Shield,
                title: "End-to-End Encrypted",
                desc: "Military-grade protection for every message",
              },
              {
                icon: MessageCircle,
                title: "Zero Complexity",
                desc: "Clean design that anyone can use instantly",
              },
              {
                icon: Lock,
                title: "No Data Collection",
                desc: "Your privacy isn't our product",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`p-8 border border-gray-200 rounded-2xl hover:border-gray-300 transition-all duration-300 ${
                  isLoaded
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <feature.icon className="w-8 h-8 text-black mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Three steps to secure communication
            </p>
          </div>

          <div className="space-y-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center p-8 bg-white rounded-2xl border border-gray-200 cursor-pointer transition-all duration-300 ${
                  activeStep === index
                    ? "border-black shadow-lg"
                    : "hover:border-gray-300"
                }`}
                onClick={() => setActiveStep(index)}
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mr-6 font-mono text-sm font-bold transition-all duration-300 ${
                    activeStep === index
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {step.number}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                <ChevronRight
                  className={`w-5 h-5 transition-all duration-300 ${
                    activeStep === index
                      ? "text-black translate-x-1"
                      : "text-gray-400"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready for Secure Messaging?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Join professionals who trust Kabootar with their communications
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-black text-white px-10 py-4 rounded-lg font-medium hover:bg-gray-800 transition-all duration-300 flex items-center justify-center group">
              Start Messaging Securely
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="flex items-center justify-center space-x-8 mt-12 text-sm text-gray-500">
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-green-500" />
              No setup required
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-green-500" />
              Free to start
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-green-500" />
              Works everywhere
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">K</span>
            </div>
            <span className="font-semibold text-gray-900">Kabootar</span>
          </div>
          <p className="text-center text-gray-500 text-sm">
            Secure messaging, simplified. © 2025 Kabootar.
          </p>
        </div>
      </footer>
    </div>
  );
}

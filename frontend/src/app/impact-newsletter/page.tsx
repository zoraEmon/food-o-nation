"use client";

import React, { useState, useEffect } from "react";
import { Mail, TrendingUp, Users, Heart, Calendar, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

export default function ImpactNewsletterPage() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubscribed(true);
    setLoading(false);
  };

  const impactStats = [
    { icon: Users, label: "Families Helped", value: "2,847", description: "Households supported this year" },
    { icon: Heart, label: "Meals Distributed", value: "156,320", description: "Nutritious meals provided" },
    { icon: TrendingUp, label: "Community Impact", value: "94%", description: "Beneficiaries report improved food security" },
    { icon: Calendar, label: "Programs Active", value: "12", description: "Ongoing aid initiatives" }
  ];

  const recentUpdates = [
    {
      title: "Q4 2025 Impact Report Released",
      date: "December 10, 2025",
      summary: "Our latest quarterly report shows significant improvements in food security across partner communities."
    },
    {
      title: "New School Feeding Program Launch",
      date: "November 28, 2025",
      summary: "Expanded nutrition program now serving 500+ school children in underserved areas."
    },
    {
      title: "Community Garden Initiative Success",
      date: "November 15, 2025",
      summary: "Local farming projects have increased fresh produce availability by 40% in participating communities."
    }
  ];

  const news = [
    {
      id: 1,
      image: "https://via.placeholder.com/800x400?text=Community+Program+Launch",
      headline: "New Community Program Launched",
      content: "We are excited to announce the launch of our new community program aimed at providing sustainable food solutions to underserved areas. This initiative will help thousands of families achieve food security through innovative farming techniques and community partnerships.",
      publisher: "Admin",
      date: "December 15, 2025"
    },
    {
      id: 2,
      image: "https://via.placeholder.com/800x400?text=Impact+Report+2025",
      headline: "Q4 2025 Impact Report Released",
      content: "Our latest quarterly report shows significant improvements in food security across partner communities. With over 2,800 families helped and 150,000 meals distributed, we're making a real difference in the lives of those we serve.",
      publisher: "Admin",
      date: "December 10, 2025"
    },
    {
      id: 3,
      image: "https://via.placeholder.com/800x400?text=School+Feeding+Program",
      headline: "School Feeding Program Expansion",
      content: "Our expanded nutrition program now serves 500+ school children in underserved areas. This program ensures that children receive nutritious meals daily, improving their health, concentration, and overall academic performance.",
      publisher: "Admin",
      date: "November 28, 2025"
    },
    {
      id: 4,
      image: "https://via.placeholder.com/800x400?text=Community+Garden+Success",
      headline: "Community Garden Initiative Success",
      content: "Local farming projects have increased fresh produce availability by 40% in participating communities. These gardens not only provide fresh food but also create jobs and foster community spirit.",
      publisher: "Admin",
      date: "November 15, 2025"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % news.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + news.length) % news.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary text-white py-20">
          <div className="container mx-auto px-6 text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              Impact & Newsletter
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto font-sans">
              Stay informed about our mission's progress and subscribe to receive updates on how your support is making a difference.
            </p>
          </div>
        </section>

        {/* Impact Statistics */}
        <section className="py-16 bg-white dark:bg-[#0a291a]">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl font-bold text-primary dark:text-white mb-4">
                Our Impact in Numbers
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                See the real difference we're making in communities across the Philippines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {impactStats.map((stat, index) => (
                <div key={index} className="bg-gray-50 dark:bg-white/5 p-6 rounded-xl border border-gray-200 dark:border-white/10 text-center">
                  <div className="bg-secondary/10 p-4 rounded-full w-fit mx-auto mb-4">
                    <stat.icon className="w-8 h-8 text-secondary" />
                  </div>
                  <div className="text-3xl font-bold text-primary dark:text-white mb-2">{stat.value}</div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{stat.label}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* News Slideshow */}
        <section className="py-16 bg-gray-50 dark:bg-[#0a291a]">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl font-bold text-primary dark:text-white mb-4">
                Latest News & Updates
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Stay informed with our latest news, achievements, and community impact stories.
              </p>
            </div>

            <div className="relative max-w-6xl mx-auto overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {news.map((item, index) => (
                  <div key={item.id} className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-4">
                    <div className="bg-white dark:bg-[#0a291a] rounded-xl border border-gray-200 dark:border-white/10 shadow-lg overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.headline}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <h3 className="font-heading text-xl font-bold text-primary dark:text-white mb-3">
                          {item.headline}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                          {item.content}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span>By {item.publisher}</span>
                          <span>{item.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-[#0a291a] p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-white/10 z-10"
              >
                <ChevronLeft className="w-6 h-6 text-primary dark:text-white" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-[#0a291a] p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-white/10 z-10"
              >
                <ChevronRight className="w-6 h-6 text-primary dark:text-white" />
              </button>

              {/* Slide Indicators */}
              <div className="flex justify-center mt-6 gap-2">
                {Array.from({ length: Math.ceil(news.length / 3) }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentSlide
                        ? 'bg-primary'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white/10 p-8 rounded-2xl border border-white/20">
                <Mail className="w-12 h-12 text-secondary mx-auto mb-6" />
                <h2 className="font-heading text-3xl font-bold mb-4">
                  Stay Connected
                </h2>
                <p className="text-gray-200 mb-8 font-sans">
                  Subscribe to our newsletter for monthly impact reports, success stories, and updates on how you can help make a difference.
                </p>

                {!subscribed ? (
                  <form onSubmit={handleSubscribe} className="space-y-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full p-4 rounded-lg bg-white text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary"
                      required
                    />
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-secondary text-black hover:bg-yellow-400 font-heading font-bold py-4 rounded-lg text-lg"
                    >
                      {loading ? "Subscribing..." : "Subscribe to Newsletter"}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="font-heading text-2xl font-bold mb-2">Thank You!</h3>
                    <p className="text-gray-200">You've successfully subscribed to our newsletter.</p>
                  </div>
                )}

                <p className="text-xs text-gray-300 mt-4">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
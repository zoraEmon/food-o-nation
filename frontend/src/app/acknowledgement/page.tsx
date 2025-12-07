import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function AcknowledgementPage() {
  
  // Mock Data - In a real app, this comes from your database
  const monetaryDonors = [
    { name: "The Santos Family", tier: "Gold" },
    { name: "Global Tech Solutions", tier: "Gold" },
    { name: "Maria Clara", tier: "Silver" },
    { name: "Juan Dela Cruz", tier: "Silver" },
    { name: "Anonymous Donor", tier: "Bronze" },
  ];

  const goodsDonors = [
    { name: "Barangay 143 Bakery", items: "500 Loaves of Bread" },
    { name: "City Rice Mill", items: "20 Sacks of Rice" },
    { name: "PureWaters Inc.", items: "100 Gallons Water" },
    { name: "Sunrise Grocery", items: "Canned Goods Assortment" },
    { name: "Local Farmers Co-op", items: "Fresh Vegetables" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-16">
        <div className="container mx-auto px-6">
          
          {/* 1. Page Header */}
          <div className="text-center mb-16">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary dark:text-white mb-4">
              Our Heroes
            </h1>
            <p className="font-sans text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We extend our heartfelt gratitude to the generous individuals and organizations 
              who make our mission possible. Your contributions feed hope.
            </p>
          </div>

          {/* 2. Main Content Grid (Matches Wireframe) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* LEFT SIDE: The Lists (Spans 7 columns) */}
            <div className="lg:col-span-7 space-y-12">
              
              {/* List A: Monetary Donors */}
              <div className="bg-white dark:bg-[#0a291a] p-8 rounded-xl border border-primary/10 shadow-sm relative overflow-hidden">
                 {/* Decorative top border */}
                 <div className="absolute top-0 left-0 right-0 h-2 bg-secondary"></div>
                 
                 <h2 className="font-heading text-2xl font-bold text-primary dark:text-secondary mb-6 flex items-center gap-3">
                   <span>💰</span> Top Monetary Donors
                 </h2>
                 
                 <ul className="space-y-4">
                   {monetaryDonors.map((donor, idx) => (
                     <li key={idx} className="flex items-center gap-4 border-b border-gray-100 dark:border-white/10 pb-3 last:border-0 last:pb-0">
                       {/* Avatar Placeholder */}
                       <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                         {donor.name.charAt(0)}
                       </div>
                       <div>
                         <p className="font-heading font-semibold text-gray-800 dark:text-gray-200">{donor.name}</p>
                         <span className="text-xs font-sans text-secondary uppercase tracking-wider font-bold">{donor.tier} Tier</span>
                       </div>
                     </li>
                   ))}
                 </ul>
              </div>

              {/* List B: Goods Donors */}
              <div className="bg-white dark:bg-[#0a291a] p-8 rounded-xl border border-primary/10 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 left-0 right-0 h-2 bg-primary"></div>

                 <h2 className="font-heading text-2xl font-bold text-primary dark:text-secondary mb-6 flex items-center gap-3">
                   <span>📦</span> Top Goods Donors
                 </h2>
                 
                 <ul className="space-y-4">
                   {goodsDonors.map((donor, idx) => (
                     <li key={idx} className="flex items-center gap-4 border-b border-gray-100 dark:border-white/10 pb-3 last:border-0 last:pb-0">
                       <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center text-secondary-dark font-bold text-sm">
                         {donor.name.charAt(0)}
                       </div>
                       <div>
                         <p className="font-heading font-semibold text-gray-800 dark:text-gray-200">{donor.name}</p>
                         <p className="text-sm text-gray-500 dark:text-gray-400 font-sans italic">{donor.items}</p>
                       </div>
                     </li>
                   ))}
                 </ul>
              </div>

            </div>

            {/* RIGHT SIDE: Featured / CTA (Spans 5 columns) */}
            <div className="lg:col-span-5 flex flex-col h-full">
              
              {/* Sticky Container so it stays visible while scrolling lists */}
              <div className="sticky top-24 space-y-8">
                
                {/* Large Image Placeholder (Matches the 'X' box in wireframe) */}
                <div className="relative w-full aspect-[4/3] bg-primary/5 dark:bg-white/5 border-2 border-dashed border-primary/20 rounded-xl flex items-center justify-center overflow-hidden group">
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
                      {/* Wireframe 'X' */}
                      <svg className="w-full h-full text-primary" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" />
                        <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="0.5" />
                      </svg>
                  </div>
                  <p className="text-primary/40 font-heading font-bold text-xl relative z-10">
                    Community Impact Highlight
                  </p>
                </div>

                {/* Call to Action */}
                <div className="text-center space-y-4">
                   <h3 className="font-heading text-2xl font-bold text-primary dark:text-white">
                     Make a Difference Today
                   </h3>
                   <p className="text-gray-600 dark:text-gray-400 font-sans">
                     Join this list of changemakers. Your contribution, big or small, helps us bridge the hunger gap.
                   </p>
                   
                   <Link href="/donate" className="block">
                     <Button size="lg" className="w-full bg-secondary text-black hover:bg-yellow-400 font-heading font-bold text-lg py-6 shadow-lg hover:shadow-xl transition-all">
                       Be a Donor
                     </Button>
                   </Link>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
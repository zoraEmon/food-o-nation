import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-16">
        {/* ... Same About Us content as before ... */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="relative w-full max-w-[500px] aspect-square border-2 border-primary dark:border-gray-600 bg-muted/30">
             <svg className="w-full h-full text-primary dark:text-gray-500 opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" />
              <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="0.5" />
            </svg>
          </div>
        </div>

        <div className="w-full md:w-1/2 space-y-8">
          <h1 className="font-heading text-5xl font-bold text-secondary dark:text-secondary text-center md:text-left">
            About Us
          </h1>
          <div className="space-y-6 text-lg text-justify leading-relaxed font-sans text-primary dark:text-gray-300">
            <p className="border-b border-primary/20 pb-4">
              We are a dedicated non-profit organization committed to bridging the gap 
              in the food aid ecosystem. Our mission is to transparently connect donors, 
              volunteers, and beneficiaries to ensure no one goes hungry.
            </p>
            <p className="border-b border-primary/20 pb-4">
              Established in 2024, our core activities focus on efficient food distribution, 
              community pantry management, and rapid response aid programs.
            </p>
            <p className="border-b border-primary/20 pb-4">
              Through this platform, we aim to build public trust by providing real-time 
              transparency on where donations go and how they impact lives.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
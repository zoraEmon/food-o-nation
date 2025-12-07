import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Phone, MapPin, Mail, Clock } from "lucide-react"; // Make sure to npm install lucide-react

export default function Footer() {
  return (
    <footer className="bg-primary text-white border-t-4 border-secondary">
      <div className="container mx-auto px-6 py-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT SIDE: Brand, Contact Info & Links (Spans 5 columns) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            
            {/* 1. Brand */}
            <div className="mb-8">
                <div className="font-hand text-7xl text-secondary mb-4">FoodONation</div>
                <p className="text-gray-200 text-sm leading-relaxed max-w-sm font-sans text-justify">
                Bridging the gap in the food aid ecosystem. We connect resources to those who need them most through transparency and care.
                </p>
            </div>

            {/* 2. NEW: Detailed Contact Info (Matches your 'footer' wireframe request) */}
            <div className="grid grid-cols-2 gap-6 mb-8 border-t border-white/10 pt-6">
                
                <div className="space-y-1">
                    <h4 className="flex items-center gap-2 text-secondary font-bold text-sm">
                        <Phone size={14}/> Contact No:
                    </h4>
                    <p className="text-xs text-gray-300 font-sans">+63 912 345 6789</p>
                </div>

                <div className="space-y-1">
                    <h4 className="flex items-center gap-2 text-secondary font-bold text-sm">
                        <MapPin size={14}/> Location:
                    </h4>
                    <p className="text-xs text-gray-300 font-sans">Quezon City, PH</p>
                </div>

                <div className="space-y-1">
                    <h4 className="flex items-center gap-2 text-secondary font-bold text-sm">
                        <Mail size={14}/> Email:
                    </h4>
                    <p className="text-xs text-gray-300 font-sans">hello@foodonation.org</p>
                </div>

                <div className="space-y-1">
                    <h4 className="flex items-center gap-2 text-secondary font-bold text-sm">
                        <Clock size={14}/> Hours:
                    </h4>
                    <p className="text-xs text-gray-300 font-sans">Mon-Fri: 9AM - 5PM</p>
                </div>

            </div>
            
            {/* 3. Navigation Links */}
            <div className="flex gap-6 text-sm font-heading font-medium text-secondary">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
              <Link href="/programs" className="hover:text-white transition-colors">Programs</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>

          {/* RIGHT SIDE: The Form (Apply & Partner Only) */}
          <div className="lg:col-span-7 bg-[#00331f] p-8 rounded-xl border border-white/10 shadow-lg flex flex-col justify-center">
            <h3 className="font-heading text-2xl font-bold text-white mb-2">
              Get Involved
            </h3>
            <p className="text-gray-300 text-sm mb-6 font-sans">
              Select <strong>Apply</strong> if you are a beneficiary seeking aid, or <strong>Partner</strong> if you wish to collaborate.
            </p>
            
            <form className="flex flex-col md:flex-row gap-3">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="flex-[2] px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-secondary transition-colors"
              />
              
              <div className="flex-1 relative">
                <select className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white focus:outline-none focus:border-secondary appearance-none cursor-pointer">
                  <option className="text-black" value="apply">Apply for Volunteer</option>
                  <option className="text-black" value="partner">Partner With Us</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                  ▼
                </div>
              </div>

              <Button className="bg-secondary text-black hover:bg-yellow-400 font-heading font-bold px-8">
                Submit
              </Button>
            </form>
          </div>

        </div>

        <div className="border-t border-white/10 mt-12 pt-6 text-center text-gray-400 text-xs font-sans">
          <p>&copy; {new Date().getFullYear()} Food-O-Nation. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
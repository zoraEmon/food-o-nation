"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="text-center max-w-md">
          <ShieldAlert className="w-24 h-24 text-red-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-[#004225] dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            You don't have permission to access this page. Please log in with an account that has the required access level.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => router.push("/login")}
              className="bg-[#ffb000] text-black hover:bg-[#ffc107]"
            >
              Go to Login
            </Button>
            <Button
              onClick={() => router.push("/")}
              className="bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

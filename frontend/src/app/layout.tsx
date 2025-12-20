import type { Metadata } from "next";
import { Inter, Poppins, Dancing_Script } from "next/font/google"; // Import standard fonts
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext"; // Import AuthProvider
import { NotificationProvider } from '@/components/ui/NotificationProvider'; // Global notification modal

// 1. Configure Fonts
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap'
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: 'swap'
});

const dancing = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing", // For that "Logo Font" look
  display: 'swap'
});

export const metadata: Metadata = {
  title: "Food-O-Nation",
  description: "Bridging the gap in the food aid ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} ${dancing.variable} font-sans bg-background text-foreground transition-colors duration-300 antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <NotificationProvider>
            <AuthProvider> {/* Wrap with AuthProvider */}
              {children}
            </AuthProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Outfit, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/ui/providers/ThemeProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Interview Assessment Simulator",
  description:
    "Professional timed technical interview simulations with deterministic rubric scoring and comprehensive skill benchmarking.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`h-full ${outfit.variable} ${ibmPlexArabic.variable}`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#fbfbf9] text-stone-900 dark:bg-[#090a0e] dark:text-stone-100 transition-colors antialiased selection:bg-[#e8c676]/30 selection:text-stone-950 dark:selection:text-stone-100">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}



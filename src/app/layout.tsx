import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSessionProvider } from "@/components/providers/session-provider";
import { TopNav } from "@/components/nav/top-nav";
import { Footer } from "@/components/nav/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CSA Prep Platform — Independent ServiceNow CSA Exam Preparation",
  description:
    "An independent, unofficial ServiceNow CSA certification preparation platform: realistic practice exams, verified study content, and weak-area coaching.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AppSessionProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
          >
            Skip to main content
          </a>
          <TopNav />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </AppSessionProvider>
      </body>
    </html>
  );
}

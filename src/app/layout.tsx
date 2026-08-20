import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSessionProvider } from "@/components/providers/session-provider";
import { TopNav } from "@/components/nav/top-nav";
import { Footer } from "@/components/nav/footer";
import { ToastProvider } from "@/components/ui/toast";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const TITLE = "CSA Prep Platform — Independent ServiceNow CSA Exam Preparation";
const DESCRIPTION =
  "An independent, unofficial ServiceNow CSA certification preparation platform: realistic practice exams, verified study content, and weak-area coaching.";

export const metadata: Metadata = {
  // Required for Next.js to resolve every page's relative Open Graph/Twitter
  // image URLs (and the ones below) into absolute ones.
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: `%s · ${SITE_NAME}` },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// Organization + WebSite structured data, reflecting only what's actually
// true and visible on the site — no fabricated logo, address, or founding
// date. WebSite has no `potentialAction` (SearchAction) because /search
// requires a login; a SearchAction pointing at a page anonymous crawlers
// can't actually use would be misleading structured data, not helpful.
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      description: DESCRIPTION,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      description: DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en",
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* Static, hardcoded JSON — never interpolates user input, so this
            is the standard safe use of dangerouslySetInnerHTML for JSON-LD. */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
        <AppSessionProvider>
          <ToastProvider>
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
          </ToastProvider>
        </AppSessionProvider>
      </body>
    </html>
  );
}

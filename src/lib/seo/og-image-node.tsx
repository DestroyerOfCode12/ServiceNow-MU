import { SITE_NAME } from "@/lib/site";

export const OG_IMAGE_SIZE = { width: 1200, height: 630 };

/**
 * Shared JSX for the site's social-preview image, used by both
 * opengraph-image.tsx and twitter-image.tsx so the two stay in sync.
 * Plain text only — no fabricated logo or screenshot, just the name and
 * tagline that already appear on the homepage.
 */
export function ogImageNode() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        backgroundColor: "#0b1b33",
        backgroundImage: "linear-gradient(135deg, #0b1b33 0%, #14335c 60%, #0d7c8c 100%)",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 72,
          height: 72,
          borderRadius: 16,
          backgroundColor: "#ffffff",
          color: "#14335c",
          fontSize: 28,
          fontWeight: 700,
        }}
      >
        CSA
      </div>
      <div
        style={{
          marginTop: 40,
          fontSize: 64,
          fontWeight: 700,
          color: "#ffffff",
          lineHeight: 1.1,
        }}
      >
        Master the ServiceNow CSA Exam
      </div>
      <div
        style={{
          marginTop: 20,
          fontSize: 30,
          color: "#c9d6e8",
        }}
      >
        {`${SITE_NAME} — independent, unofficial exam preparation`}
      </div>
    </div>
  );
}

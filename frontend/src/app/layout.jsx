import { Suspense } from "react";
import StoreProvider from "@/redux/StoreProvider";
import { Toaster } from "sonner";
import { PageSkeleton } from "@/components/website/ui/PageStates";
import "./globals.css";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Nestro",
  title: {
    default: "Nestro Furniture | Modern Furniture Online in India",
    template: "%s | Nestro Furniture",
  },
  description:
    "Shop modern furniture online in India at Nestro. Explore sofas, beds, dining tables, chairs and storage furniture by room, material and style.",
  authors: [{ name: "Nestro" }],
  creator: "Nestro",
  publisher: "Nestro",
  category: "Furniture and home decor",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Nestro Furniture",
    locale: "en_IN",
    title: "Nestro Furniture | Modern Furniture Online in India",
    description:
      "Discover thoughtfully designed furniture for living rooms, bedrooms, dining rooms and home offices.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nestro Furniture | Modern Furniture Online in India",
    description: "Discover thoughtfully designed furniture for every room.",
  },
};
export default function RootLayout({ children }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Nestro Furniture",
        url: siteUrl,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Nestro Furniture",
        publisher: { "@id": `${siteUrl}/#organization` },
        inLanguage: "en-IN",
      },
    ],
  };
  return (
    <html lang="en-IN">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        <StoreProvider>
          <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
          <Toaster position="top-center" richColors />
        </StoreProvider>
      </body>
    </html>
  );
}

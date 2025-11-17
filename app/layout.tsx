import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "NoMoreFOMO - Stop the LLM FOMO, Get the Best AI Answer Every Time",
    template: "%s | NoMoreFOMO",
  },
  description: "Intelligent AI router that automatically picks the best LLM for your prompt. Compare GPT-4o, Claude, Gemini, and more. Stop worrying about which AI to use - we pick the best one for you.",
  keywords: [
    "AI chat",
    "LLM router",
    "GPT-4o",
    "Claude",
    "Gemini",
    "best AI model",
    "AI comparison",
    "intelligent AI routing",
    "ChatGPT alternative",
    "AI assistant",
    "multi-model AI",
    "LLM FOMO",
  ],
  authors: [{ name: "NoMoreFOMO" }],
  creator: "NoMoreFOMO",
  publisher: "NoMoreFOMO",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: defaultUrl,
    siteName: "NoMoreFOMO",
    title: "NoMoreFOMO - Stop the LLM FOMO, Get the Best AI Answer Every Time",
    description: "Intelligent AI router that automatically picks the best LLM for your prompt. Compare GPT-4o, Claude, Gemini, and more.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "NoMoreFOMO - Intelligent AI Router",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NoMoreFOMO - Stop the LLM FOMO",
    description: "Intelligent AI router that picks the best LLM for your prompt. GPT-4o, Claude, Gemini - we choose the best for you.",
    images: ["/opengraph-image"],
    creator: "@nomorefomo",
  },
  verification: {
    // Add these later when you have them
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
  alternates: {
    canonical: defaultUrl,
  },
  category: "technology",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'NoMoreFOMO',
    applicationCategory: 'AI Tool',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free tier with 100K tokens per month',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '100',
    },
    description:
      'Intelligent AI router that automatically picks the best LLM for your prompt. Compare GPT-4o, Claude, Gemini, and more.',
    featureList: [
      'Intelligent model routing',
      'GPT-4o support',
      'Claude support',
      'Gemini support',
      'Cost optimization',
      'Performance rankings',
    ],
  };

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NoMoreFOMO',
    url: defaultUrl,
    logo: `${defaultUrl}/opengraph-image`,
    sameAs: [],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

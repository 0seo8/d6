import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR, Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { MobileAppLayout } from "@/components/layout/mobile-app-layout";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "데이식스 음원총공팀",
  description: "DAY6 음원 차트 실시간 추적 및 스트리밍/투표 지원 서비스",
  keywords:
    "DAY6, 데이식스, 음원차트, 스트리밍, 투표, K-pop, 차트분석, 음악방송",
  authors: [{ name: " Team" }],
  creator: "",
  publisher: "",

  // Next.js 15 메타데이터 베이스 URL
  metadataBase: new URL("https://day6-dev.vercel.app/"),

  // Open Graph 메타데이터
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://day6-dev.vercel.app/",
    title: "데이식스 음원총공팀",
    description: "DAY6 음원 차트 실시간 추적 및 스트리밍/투표 지원 서비스",
  },

  // Twitter Card 메타데이터
  twitter: {
    card: "summary_large_image",
    title: "데이식스 음원총공팀",
    description: "DAY6 음원 차트 실시간 추적 및 스트리밍/투표 지원 서비스",
    creator: "@Day6_vote_team",
  },

  // 추가 메타데이터
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

  // 앱 관련 메타데이터
  manifest: "/manifest.json",

  // Next.js 15 기능 - 대체 언어
  alternates: {
    canonical: "https://day6-dev.vercel.app/",
  },

  // 검증
  verification: {
    google: "google-site-verification-code",
    other: {
      "naver-site-verification": "naver-site-verification-code",
    },
  },
};

// Next.js 15 Viewport 설정 (별도 export)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#22c55e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${notoSansKR.variable} ${montserrat.variable} antialiased font-sans`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

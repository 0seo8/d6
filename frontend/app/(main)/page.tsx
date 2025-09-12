"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CompactChart } from "@/components/compact-chart";
import Link from "next/link";
import YouTubeBanner from "@/components/home/youtube-banner";
import MVStatsCard from "@/components/home/mv-stats-card";
import QuickAccessCard from "@/components/home/quick-access-card";
import { MelonMusicwaveBanner } from "@/components/home/melon-musicwave-banner";
import { QuickLinksBanner } from "@/components/home/quick-links-banner";
import { SectionHeader } from "@/components/ui/section-header";

export default function HomePage() {
  return (
    <div>
      {/* YouTube Banner - 모바일에서는 전체 너비 */}
      <div className="px-0 md:px-6 lg:px-8 xl:px-12 md:pt-0 pb-6">
        <YouTubeBanner />
      </div>

      <div className="px-5 md:px-6 lg:px-8 xl:px-12 space-y-6">
        {/* Mobile Layout */}
        <div className="md:hidden">
          <SectionHeader title="실시간 차트 순위" showDateTime={true} />
          <CompactChart />
          <div className="mt-4">
            <Button
              asChild
              className="w-full bg-mint-primary hover:bg-mint-dark text-white"
            >
              <Link href="/charts">전체 차트 보기</Link>
            </Button>
          </div>
          <div
            className="mt-6 -mx-5"
            style={{ borderBottom: "0.6rem solid #f7f8f9" }}
          ></div>
        </div>

        {/* Desktop Layout */}
        <Card className="hidden md:block bg-white/60 backdrop-blur-sm border-mint-primary/20 shadow-sm">
          <CardHeader>
            <SectionHeader title="실시간 차트 순위" showDateTime={true} />
          </CardHeader>
          <CardContent>
            <CompactChart />
            <div className="mt-4">
              <Button
                asChild
                className="w-full bg-mint-primary hover:bg-mint-dark text-white"
              >
                <Link href="/charts">전체 차트 보기</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            원클릭 스트리밍 리스트
          </h2>
          <QuickAccessCard />
        </div>

        {/* Desktop Layout */}
        <Card className="hidden md:block bg-white/60 backdrop-blur-sm border-mint-dark/20 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl font-bold text-gray-900">
              원클릭 스트리밍 리스트
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QuickAccessCard />
          </CardContent>
        </Card>

        <MelonMusicwaveBanner />
        <QuickLinksBanner />

        {/* Mobile Divider */}
        <div
          className="md:hidden mt-6 -mx-5"
          style={{ borderBottom: "0.6rem solid #f7f8f9" }}
        ></div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <SectionHeader title="뮤직비디오 조회수" showDateTime={false} />
          <MVStatsCard />
        </div>

        {/* Desktop Layout */}
        <Card className="hidden md:block bg-white/60 backdrop-blur-sm border-navy-dark/20 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg md:text-xl font-bold text-gray-900">
                뮤직비디오 조회수
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <MVStatsCard />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

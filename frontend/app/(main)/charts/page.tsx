"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { fetchChartData } from "@/lib/api";
import { PlatformType } from "@/lib/types";
import { PlatformFilters } from "@/components/charts/platform-filters";
import { ChartSection } from "@/components/charts/chart-section";
import { SectionHeader } from "@/components/ui/section-header";

export default function ChartsPage() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>(
    []
  );

  const handlePlatformChange = useCallback(
    (
      platforms: PlatformType[] | ((prev: PlatformType[]) => PlatformType[])
    ) => {
      setSelectedPlatforms(platforms);
    },
    []
  );

  const { data: chartData, isLoading } = useQuery({
    queryKey: ["chartData"],
    queryFn: fetchChartData,
  });

  return (
    <div>
      {/* Content with same padding as homepage */}
      <div className="px-5 md:px-6 lg:px-8 xl:px-12 space-y-6 pt-6">
        {/* Section Header - same style as homepage */}
        <SectionHeader title="차트" showDateTime={true} />

        {/* Mobile Layout - Platform Filters & Chart Section */}
        <div className="md:hidden">
          <h3 className="text-lg font-bold text-gray-900 mb-4">플랫폼 필터</h3>
          <PlatformFilters
            selectedPlatforms={selectedPlatforms}
            onPlatformChange={handlePlatformChange}
          />

          <div className="mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">차트 순위</h3>
            <ChartSection
              selectedPlatforms={selectedPlatforms}
              chartData={chartData}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Desktop Layout - Platform Filters & Chart Section */}
        <Card className="hidden md:block bg-white/60 backdrop-blur-sm border-navy-dark/20 shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              플랫폼 필터
            </h3>
            <PlatformFilters
              selectedPlatforms={selectedPlatforms}
              onPlatformChange={handlePlatformChange}
            />

            <div className="mt-6">
              <ChartSection
                selectedPlatforms={selectedPlatforms}
                chartData={chartData}
                isLoading={isLoading}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom spacing for mobile nav */}
      <div className="h-20 md:h-8"></div>
    </div>
  );
}

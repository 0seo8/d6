"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchChartData } from "@/lib/api";
import { ChartSong } from "@/lib/types";
import {
  getPlatformName,
  getRankChangeIcon,
  getRankChangeColor,
} from "@/lib/utils";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

export function CompactChart() {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ["chartData"],
    queryFn: fetchChartData,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-100 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  const platforms = [
    "melon_top100",
    "melon_hot100",
    "genie",
    "bugs",
    "vibe",
    "flo",
  ];
  const platformData: { platform: string; song: ChartSong | null }[] = [];

  platforms.forEach((platform) => {
    const songs =
      (chartData?.[platform as keyof typeof chartData] as ChartSong[]) || [];

    if (songs.length > 0) {
      // "INSIDE OUT"만 찾아서 표시
      const insideOutSong = songs.find(
        (song) => song.title && song.title.includes("INSIDE OUT")
      );

      if (insideOutSong) {
        platformData.push({ platform, song: insideOutSong });
      } else {
        // INSIDE OUT이 없으면 차트아웃 상태 표시
        platformData.push({
          platform,
          song: {
            title: "차트아웃",
            artist: "DAY6",
            album: "",
            rank: null,
            change: 0,
            timestamp: "",
          } as ChartSong,
        });
      }
    } else {
      // 차트에 곡이 없으면 차트아웃 상태 표시
      platformData.push({
        platform,
        song: {
          title: "차트아웃",
          artist: "DAY6",
          album: "",
          rank: null,
          change: 0,
          timestamp: "",
        } as ChartSong,
      });
    }
  });

  const getPlatformLogo = (platform: string) => {
    const logos: Record<string, string> = {
      melon_top100: "/ico_melon.png",
      melon_hot100: "/ico_melon.png",
      genie: "/Geenie.png",
      bugs: "/bucks.png",
      vibe: "/vibe.jpeg",
      flo: "/fillo.png",
    };
    return logos[platform] || "/file.svg";
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Swiper
          modules={[Autoplay, FreeMode]}
          slidesPerView={2}
          spaceBetween={8}
          freeMode={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 3,
            },
            768: {
              slidesPerView: 4,
            },
            1024: {
              slidesPerView: 5,
            },
          }}
          className="compact-chart-swiper"
        >
          {platformData.map(({ platform, song }) => (
            <SwiperSlide key={platform}>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Image
                      src={getPlatformLogo(platform)}
                      alt={getPlatformName(platform)}
                      width={20}
                      height={20}
                      className="rounded-sm object-cover"
                    />
                    <span className="text-sm font-medium text-gray-800">
                      {getPlatformName(platform)}
                    </span>
                  </div>
                  {song?.change !== undefined && (
                    <div
                      className={`text-xs font-medium ${getRankChangeColor(
                        song.change ?? 0
                      )}`}
                    >
                      {getRankChangeIcon(song.change ?? 0)}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div
                      className={`text-xl font-bold ${
                        song?.rank ? "text-gray-900" : "text-orange-500"
                      }`}
                    >
                      {song?.rank || "-"}
                    </div>
                    <div className="text-xs text-gray-400">위</div>
                  </div>
                  <div className="flex-1 min-w-0 text-center">
                    {song?.rank ? (
                      <>
                        <p className="font-medium text-sm truncate text-gray-900">
                          {song.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {song.artist}
                        </p>
                      </>
                    ) : (
                      <p className="font-medium text-sm text-orange-600">❌</p>
                    )}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </CardContent>
    </Card>
  );
}

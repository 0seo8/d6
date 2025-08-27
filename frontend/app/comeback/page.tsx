"use client";

import { Calendar, TrendingUp, Smartphone, Heart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Link from "next/link";

const comebackSchedule = [
  {
    date: "2025.08.30",
    event: "10주년 콘서트",
    status: "upcoming",
    description: "10th Anniversary Tour - GOYANG STADIUM",
    dDay: Math.ceil(
      (new Date("2025-08-30").getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    ),
  },
  {
    date: "2025.09.05",
    event: "정규 4집 발매",
    status: "upcoming",
    description: "데뷔 10주년 기념 앨범 'The DECADE'",
    dDay: Math.ceil(
      (new Date("2025-09-05").getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    ),
  },
  {
    date: "2025.09.20",
    event: "10주년 콘서트",
    status: "upcoming",
    description: "음악방송 및 프로모션 활동",
    dDay: Math.ceil(
      (new Date("2025-09-20").getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    ),
  },
];

export default function ComebackPage() {
  return (
    <div>
      {/* Content with same padding as homepage */}
      <div className="px-5 md:px-6 lg:px-8 xl:px-12 space-y-6 pt-6">
        {/* Section Header - same style as homepage */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900">
              컴백 지원 센터
            </h2>
          </div>
          <div className="text-gray-300"></div>
        </div>

        {/* Comeback Status Banner */}
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          className="bg-gradient-to-r from-[#49c4b0] to-[#6dd5c0] text-white rounded-lg"
        >
          {/* 정규 4집 발매 카드 */}
          <SwiperSlide className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-6 h-6" />
                  <Badge className="bg-white/20 text-white border-white/30">
                    D-{comebackSchedule[0]?.dDay}
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold mb-1">10주년 콘서트</h3>
                <p className="text-white/80 text-sm">
                  {comebackSchedule[0].date}
                </p>
                <p className="text-white/80 text-sm">
                  {comebackSchedule[0].description}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {comebackSchedule[0]?.dDay}
                  <span className="text-lg ml-1">일</span>
                </div>
                <div className="text-sm text-white">남음</div>
              </div>
            </div>
          </SwiperSlide>

          {/* 정규 4집 발매 카드 */}
          <SwiperSlide className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-6 h-6" />
                  <Badge className="bg-white/20 text-white border-white/30">
                    D-{comebackSchedule[1].dDay}
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold mb-1">INSIDE OUT</h3>
                <p className="text-white/80 text-sm">
                  {comebackSchedule[1].date}
                </p>
                <p className="text-white/80 text-sm">
                  {comebackSchedule[1].description}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {comebackSchedule[1].dDay}
                  <span className="text-lg ml-1">일</span>
                </div>
                <div className="text-sm text-white">남음</div>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>

        {/* Mobile Divider */}
        <div
          className="md:hidden -mx-9"
          style={{ borderBottom: "0.6rem solid #f7f8f9" }}
        ></div>

        {/* 매일 재화 모으기 */}
        <div>
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
            매일 재화 모으기
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 음악중심 뮤빗 */}
            <Link
              href="/guide/musiccore-vote"
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-mint-primary to-mint-dark hover:from-mint-dark hover:to-mint-primary transition-colors rounded-lg shadow-md text-white w-full text-left"
            >
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Smartphone className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold">음악중심</h3>
                <p className="text-sm opacity-90">뮤빗 모으기</p>
              </div>
            </Link>

            {/* 인기가요 하이어 */}
            <Link
              href="/guide/inkigayo-vote"
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 transition-colors rounded-lg shadow-md text-white w-full text-left"
            >
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold">인기가요</h3>
                <p className="text-sm opacity-90">하이어 루비 모으기</p>
              </div>
            </Link>

            {/* 인기가요 링크 */}
            <Link
              href="/guide/inkigayo-vote"
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 transition-colors rounded-lg shadow-md text-white w-full text-left"
            >
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold">인기가요</h3>
                <p className="text-sm opacity-90">링크 팬 포인트 모으기</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom spacing for mobile nav */}
      <div className="h-20 md:h-8"></div>
    </div>
  );
}

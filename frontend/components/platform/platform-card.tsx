"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  TrendingUp,
  Smartphone,
  ChevronDown,
  Settings,
} from "lucide-react";
import { Platform } from "@/lib/constants/platforms";
import { useDeviceType } from "@/lib/hooks/useDeviceType";
import { openPlatformAuto } from "@/lib/deep-link-runtime";
import { useState } from "react";
import { StreamingLinkEditModal } from "@/components/admin/streaming-link-edit-modal";
import { useAdminMode } from "@/lib/contexts/admin-mode-context";
import { useQuery } from "@tanstack/react-query";
import { fetchPlatformLinksById } from "@/lib/api/platform-links";

interface PlatformCardProps {
  platform: Platform;
  variant?: "default" | "compact" | "grid";
  showDescription?: boolean;
  isHome?: boolean;
  platformLinks?: any[];
}

export function PlatformCard({
  platform,
  variant = "default",
  showDescription = true,
  isHome = false,
  platformLinks: externalPlatformLinks,
}: PlatformCardProps) {
  const deviceType = useDeviceType() as "android" | "ios" | "pc";
  const { isAdminMode } = useAdminMode();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // 외부에서 받은 platformLinks가 있으면 우선 사용, 없으면 개별 쿼리
  const { data: individualPlatformLinks } = useQuery({
    queryKey: ["platformLinks", platform.id, isAdminMode],
    queryFn: () => fetchPlatformLinksById(platform.id, isAdminMode),
    staleTime: 60000, // 1분간 캐시
    enabled: !externalPlatformLinks, // 외부 데이터가 없을 때만 실행
  });

  // 외부 데이터가 있으면 그걸 사용, 없으면 개별 쿼리 결과 사용
  const platformLinks = externalPlatformLinks?.find(
    (group: any) => group.platform_id === platform.id
  ) || individualPlatformLinks;

  // DB 데이터 우선, 없으면 정적 데이터 사용
  // 1. DB에서 디바이스별 링크 가져오기
  const deviceKey = deviceType === "ios" ? "iphone" : deviceType;
  let dbUrls = platformLinks?.[deviceKey]?.map((link: any) => link.url) || [];

  // 2. DB 데이터가 없으면 정적 데이터 사용
  const staticUrls = platform.urls?.[deviceKey] || [];

  // 3. iPhone 데이터가 없으면 Android 데이터로 폴백 (DB 우선, 정적 폴백)
  if (deviceType === "ios" && dbUrls.length === 0 && staticUrls.length === 0) {
    dbUrls = platformLinks?.android?.map((link: any) => link.url) || [];
    const androidStaticUrls = platform.urls?.android || [];
    dbUrls = dbUrls.length > 0 ? dbUrls : androidStaticUrls;
  }

  const urls = dbUrls.length > 0 ? dbUrls : staticUrls;
  const hasUrls = urls.length > 0;

  // DB 데이터만 사용 (deeplinks 폴백 제거)
  const links = urls;
  const hasLinks = hasUrls;

  // DB 데이터를 포함한 동적 플랫폼 객체 생성
  const dynamicPlatform: Platform = {
    ...platform,
    urls: {
      android: platformLinks?.android?.map((link: any) => link.url) || platform.urls?.android || [],
      iphone: platformLinks?.iphone?.map((link: any) => link.url) || platform.urls?.iphone || [],
      pc: platformLinks?.pc?.map((link: any) => link.url) || platform.urls?.pc || [],
    }
  };

  // 링크 정보 표시 및 앱 실행 함수
  function showLinksAndOpen() {
    const currentUrls = urls;
    const deviceName = deviceType === "ios" ? "iPhone" : deviceType === "android" ? "Android" : "PC";
    
    if (currentUrls.length > 0) {
      const linksList = currentUrls.map((url, index) => `${index + 1}. ${url}`).join('\n');
      const message = `[${platform.name}] ${deviceName}에서 사용될 링크:\n\n${linksList}\n\n이 링크들로 앱을 실행하시겠습니까?`;
      
      if (confirm(message)) {
        openPlatformAuto(dynamicPlatform);
      }
    } else {
      alert(`[${platform.name}] ${deviceName}용 링크가 설정되지 않았습니다.`);
    }
  }

  function showStepLinksAndOpen(stepIndex: number) {
    const currentUrls = urls;
    const deviceName = deviceType === "ios" ? "iPhone" : deviceType === "android" ? "Android" : "PC";
    const targetUrl = currentUrls[stepIndex] || currentUrls[0];
    
    if (targetUrl) {
      const message = `[${platform.name}] ${deviceName} 링크 ${stepIndex + 1}:\n\n${targetUrl}\n\n이 링크로 앱을 실행하시겠습니까?`;
      
      if (confirm(message)) {
        openPlatformAuto(dynamicPlatform, undefined, {
          androidStep: stepIndex,
          iosStep: stepIndex,
        });
      }
    } else {
      alert(`[${platform.name}] ${deviceName}용 링크 ${stepIndex + 1}이 설정되지 않았습니다.`);
    }
  }

  // 기존 함수들 (호환성 유지)
  function openPrimary() {
    openPlatformAuto(dynamicPlatform);
  }

  function openStep(stepIndex: number) {
    openPlatformAuto(dynamicPlatform, undefined, {
      androidStep: stepIndex,
      iosStep: stepIndex,
    });
  }

  if (variant === "grid") {
    return (
      <div className="relative">
        {/* 관리자 편집 버튼 */}
        {isAdminMode && (
          <div className="absolute top-1 right-1 z-10">
            <button
              onClick={() => setShowEditModal(true)}
              className="w-6 h-6 bg-mint-primary/10 hover:bg-mint-primary/20 rounded-md flex items-center justify-center transition-colors"
            >
              <Settings className="w-3 h-3 text-mint-primary" />
            </button>
          </div>
        )}

        <div className="flex flex-col items-center p-3 border border-gray-100 hover:border-gray-200 rounded-lg">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center mb-2 bg-white border border-gray-100 overflow-hidden">
            {platform.logo !== "/file.svg" ? (
              <Image
                src={platform.logo}
                alt={platform.name}
                width={28}
                height={28}
                className="rounded object-cover"
              />
            ) : (
              <TrendingUp className="w-6 h-6 text-white" />
            )}
          </div>
          <span className="text-xs lg:text-sm font-medium text-gray-700 text-center mb-2">
            {platform.name}
          </span>

          {/* 디바이스에 맞는 링크 자동 선택 */}
          {hasLinks && deviceType !== "pc" ? (
            <>
              {links.length === 1 ? (
                // 단일 딥링크인 경우 바로 표시
                <Button
                  size="sm"
                  className="w-full text-xs bg-mint-primary hover:bg-mint-dark text-white"
                  onClick={() => showStepLinksAndOpen(0)}
                >
                  <Smartphone className="w-3 h-3 mr-1" />
                  앱으로
                </Button>
              ) : (
                // 여러 딥링크인 경우 - 모바일/PC 모두 드롭다운 방식
                <>
                  <Button
                    size="sm"
                    className="w-full text-xs bg-mint-primary hover:bg-mint-dark text-white"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <Smartphone className="w-3 h-3 mr-1" />
                    {isHome ? "앱으로" : "앱으로 열기"}
                    <ChevronDown
                      className={`w-3 h-3 ml-1 transition-transform ${showDropdown ? "rotate-180" : ""}`}
                    />
                  </Button>

                  {showDropdown && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 space-y-1">
                      {urls.map((_: string, index: number) => (
                        <Button
                          key={index}
                          size="sm"
                          variant="ghost"
                          className="w-full justify-start text-xs"
                          onClick={() => openStep(index)}
                        >
                          {`링크 ${index + 1}`}
                        </Button>
                      ))}
                    </div>
                  )}
                </>
              )}
              {/* 플랫폼 안내 메시지 */}
              {links.length > 1 && (
                <p className="text-xs text-gray-500 text-center mt-1 px-1">
                  차례대로 모두 클릭
                </p>
              )}
            </>
          ) : // PC에서 여러 링크가 있으면 순차 실행, 없으면 비활성화
          deviceType === "pc" && urls.length > 1 ? (
            <Button
              size="sm"
              className="w-full text-xs bg-mint-primary hover:bg-mint-dark text-white"
              onClick={() => {
                // 첫 번째 링크는 현재 탭에서 열기
                if (urls[0]) {
                  window.location.href = urls[0];
                }

                // 나머지 링크들은 새 탭에서 열기 (1초 간격)
                urls.slice(1).forEach((url: string, index: number) => {
                  setTimeout(
                    () => {
                      window.open(url, "_blank");
                    },
                    (index + 1) * 1000
                  );
                });
              }}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              {isHome ? "웹" : "웹으로 (전곡)"}
            </Button>
          ) : urls.length === 1 ? (
            // 단일 링크인 경우
            <a
              href={urls[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button
                size="sm"
                className="w-full text-xs bg-mint-primary hover:bg-mint-dark text-white"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                {isHome ? "웹" : "웹으로"}
              </Button>
            </a>
          ) : (
            // DB에 데이터가 없으면 비활성화
            <Button
              size="sm"
              disabled
              className="w-full text-xs bg-gray-300 text-gray-500"
            >
              링크 설정 필요
            </Button>
          )}
        </div>

        {/* 편집 모달 */}
        {showEditModal && (
          <StreamingLinkEditModal
            platform={platform}
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
          />
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Card
        className="w-40 flex-shrink-0 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() =>
          hasLinks ? openPrimary() : window.open(platform.url, "_blank")
        }
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="w-full h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
              {platform.logo !== "/file.svg" ? (
                <Image
                  src={platform.logo}
                  alt={platform.name}
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <div className="text-2xl">
                  {platform.category === "music"
                    ? "🎵"
                    : platform.category === "mv"
                      ? "📺"
                      : "📁"}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm leading-tight">
                {platform.name}
              </h3>
              {showDescription && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {platform.category === "music"
                    ? `${platform.name}에서 스트리밍`
                    : platform.category === "download"
                      ? `${platform.name} 다운로드`
                      : `${platform.name} 뮤직비디오`}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="hover:shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer"
      onClick={() =>
        hasLinks ? openPrimary() : window.open(platform.url, "_blank")
      }
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="w-full h-16 bg-white border border-gray-100 rounded-lg flex items-center justify-center">
            {platform.logo !== "/file.svg" ? (
              <Image
                src={platform.logo}
                alt={platform.name}
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
            ) : (
              <div className="text-2xl text-white">
                {platform.category === "music"
                  ? "🎵"
                  : platform.category === "mv"
                    ? "📺"
                    : "📁"}
              </div>
            )}
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 text-sm">
              {platform.name}
            </h3>
            <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
              {hasLinks ? (
                <>
                  <Smartphone className="w-3 h-3 mr-1" />
                  <span>앱으로 열기</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-3 h-3 mr-1" />
                  <span>링크 설정 필요</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

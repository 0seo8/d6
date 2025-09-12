"use client";

import { Music, Video, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DOWNLOAD_PLATFORMS, MV_PLATFORMS } from "@/lib/constants/platforms";
import { PlatformCard } from "@/components/platform/platform-card";

export default function DownloadPage() {
  return (
    <div>
      <div className="px-5 md:px-6 lg:px-8 xl:px-12 space-y-6 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900">
              다운로드
            </h2>
          </div>
          <Button
            variant="link"
            size="sm"
            className="text-blue-600 hover:text-blue-700 p-0"
            onClick={() => window.open("/guide", "_blank")}
          >
            가이드 <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>

        <Tabs defaultValue="music" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="music" className="flex items-center gap-2">
              <Music className="w-4 h-4" />
              음원 다운로드
            </TabsTrigger>
            <TabsTrigger value="mv" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              MV 다운로드
            </TabsTrigger>
          </TabsList>

          <TabsContent value="music" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {DOWNLOAD_PLATFORMS.map((platform) => (
                      <PlatformCard
                        key={platform.id}
                        platform={platform}
                        variant="grid"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Divider */}
              <div
                className="md:hidden -mx-9"
                style={{ borderBottom: "0.6rem solid #f7f8f9" }}
              ></div>
            </div>
          </TabsContent>

          <TabsContent value="mv" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    {MV_PLATFORMS.map((platform) => (
                      <PlatformCard
                        key={platform.id}
                        platform={platform}
                        variant="grid"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="h-20 md:h-8"></div>
    </div>
  );
}

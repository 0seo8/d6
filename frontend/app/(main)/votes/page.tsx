"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { MUSIC_SHOWS } from "@/lib/constants/music-shows";
import { MusicShowCard } from "@/components/voting/music-show-card";

export default function VotesPage() {
  return (
    <div>
      <div className="px-5 md:px-6 lg:px-8 xl:px-12 space-y-6 pt-6">
        {/* Section Header - same style as homepage */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900">투표</h2>
          </div>
          <div className="text-gray-300"></div>
        </div>
        <Tabs defaultValue="music-shows" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="music-shows">음악방송</TabsTrigger>
            <TabsTrigger value="awards">시상식</TabsTrigger>
          </TabsList>

          <TabsContent value="music-shows" className="mt-6">
            <div className="space-y-6">
              {/* Mobile Divider */}
              <div
                className="md:hidden -mx-9"
                style={{ borderBottom: "0.6rem solid #f7f8f9" }}
              ></div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MUSIC_SHOWS.map((show) => (
                  <MusicShowCard key={show.id} show={show} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="awards" className="mt-6">
            <div className="space-y-6">
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">준비중</h3>
                  <p className="text-sm text-gray-600">준비중</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom spacing for mobile nav */}
      <div className="h-20 md:h-8"></div>
    </div>
  );
}

"use client";

import { ExternalLink, Radio } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const radioStations = [
  {
    name: "KBS",
    url: "https://world.kbs.co.kr/service/program_main.htm?lang=e&procode=weekend",
  },
  {
    name: "MBC",
    url: "https://www.imbc.com/broad/radio",
  },
  {
    name: "SBS",
    url: "https://www.sbs.co.kr/radio?div=gnb_pc",
  },
];

export default function RadioPage() {
  return (
    <div>
      {/* Content with same padding as homepage */}
      <div className="px-5 md:px-6 lg:px-8 xl:px-12 space-y-6 pt-6">
        {/* Section Header - same style as homepage */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900">
              라디오 신청
            </h2>
          </div>
          <div className="text-gray-300"></div>
        </div>

        {/* Mobile Divider */}
        <div
          className="md:hidden -mx-9"
          style={{ borderBottom: "0.6rem solid #f7f8f9" }}
        ></div>

        {/* Radio Stations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {radioStations.map((station, index) => (
            <Card
              key={index}
              className="hover:shadow-md transition-shadow duration-200"
            >
              <CardContent className="p-0">
                <Button
                  asChild
                  variant="ghost"
                  className="w-full h-20 flex items-center justify-center rounded-lg"
                >
                  <a
                    href={station.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-mint-primary rounded-lg flex items-center justify-center">
                        <Radio className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-bold text-lg text-gray-900">
                          {station.name}
                        </span>
                        <span className="text-sm text-gray-500">신청하기</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                    </div>
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom spacing for mobile nav */}
      <div className="h-20 md:h-8"></div>
    </div>
  );
}

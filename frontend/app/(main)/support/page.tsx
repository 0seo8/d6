"use client";

import {
  ExternalLink,
  // ShoppingBag, // 앨범 구매처 주석 처리로 인해 미사용
  Heart,
  Users,
  DollarSign,
  X,
  Package,
  Mail,
  Music,
  Radio,
  Twitter,
  Youtube,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Types
interface LinkItem {
  name: string;
  url: string;
  isModal?: boolean;
  modalType?: "comingSoon" | "priceComparison";
}

interface SubItem {
  name: string;
  url: string;
  isModal?: boolean;
  modalType?: "comingSoon";
}

// Album purchase locations data - 주석 처리 (공구 삭제로 인해 사용 안 함)
// const albumStores = [
//   {
//     name: "FANS SHOP",
//     prices: {
//       standard: "19,300원 (2종)",
//       nemo: "11,900원 (2종)",
//       idCard: "22,300원",
//       earphone: "66,700원 (4종 랜덤)",
//     },
//     shipping: "5만원 미만 3,000원",
//     benefit: "포토카드 증정",
//     note: "",
//     url: "https://bit.ly/45fHCLp",
//   },
//   {
//     name: "YES24",
//     prices: {
//       standard: "19,300원 (2종)",
//       nemo: "11,900원 (2종)",
//       idCard: "22,300원",
//       earphone: "66,700원 (4종 랜덤)",
//     },
//     shipping: "무료",
//     benefit: "예약판매기간 일반반 구매 시 포토카드 4종 중 1종 증정",
//     note: "배송비 무료",
//     url: "https://www.yes24.com/product/category/series/003001018002001?SeriesNumber=364429",
//   },
//   {
//     name: "애플뮤직",
//     prices: {
//       standard: "19,300원 (2종)",
//       nemo: "11,900원 (2종)",
//       idCard: "22,300원",
//       earphone: "66,700원 (4종 랜덤)",
//     },
//     shipping: "5만원 미만 3,500원",
//     benefit:
//       "예약판매기간 일반반 구매 시 포토카드 4종 중 1종 증정 (4종 구매 시 중복 X)",
//     note: "이어폰반 2개 이상 구매 시 버전 중복 없이 발송",
//     url: "https://www.applemusic.co.kr",
//   },
//   {
//     name: "뮤직플랜트",
//     prices: {
//       standard: "19,300원 (2종)",
//       nemo: "11,900원 (2종)",
//       idCard: "22,300원",
//       earphone: "66,700원 (4종 랜덤)",
//     },
//     shipping: "5만원 미만 3,000원",
//     benefit: "예약판매기간 일반반 구매 시 포토카드 4종 중 1종 증정",
//     note: "",
//     url: "https://www.musicplant.co.kr",
//   },
//   {
//     name: "위드뮤",
//     prices: {
//       standard: "19,300원 (2종)",
//       nemo: "11,900원 (2종)",
//       idCard: "22,300원",
//       earphone: "66,700원 (4종 랜덤)",
//     },
//     shipping: "5만원 미만 3,000원",
//     benefit:
//       "예약판매기간 일반반 구매 시 포토카드 4종 중 1종 증정 (4종 구매 시 중복 X)",
//     note: "커버 확인 가능 시 이어폰반 4세트 구매 시 버전별 동일 수량 발송",
//     url: "#",
//   },
//   {
//     name: "뮤직코리아",
//     prices: {
//       standard: "19,300원 (2종)",
//       nemo: "11,900원 (2종)",
//       idCard: "22,300원",
//       earphone: "66,700원 (4종 랜덤)",
//     },
//     shipping: "5만원 미만 3,000원",
//     benefit: "예약판매기간 일반반 구매 시 포토카드 4종 중 1종 증정",
//     note: "",
//     url: "https://www.musickorea.co.kr",
//   },
//   {
//     name: "알라딘",
//     prices: {
//       standard: "19,300원 (2종)",
//       nemo: "11,900원 (2종) / 세트 23,800원",
//       idCard: "22,300원",
//       earphone: "66,700원 (4종 랜덤) / 세트 266,800원",
//     },
//     shipping: "무료",
//     benefit: "",
//     note: "이어폰반 세트로 구매 가능",
//     url: "https://www.aladin.co.kr",
//   },
// ];

const supportItems = [
  // {
  //   title: "앨범 구매처",
  //   icon: ShoppingBag,
  //   color: "bg-purple-500",
  //   links: [
  //     {
  //       name: "일반 구매처 가격 비교",
  //       url: "#",
  //       isModal: true,
  //     },
  //   ],
  // },
  {
    title: "아이디 기부",
    icon: Heart,
    color: "bg-red-500",
    links: [
      {
        name: "아이디 기부 가이드",
        url: "/guide/id-donation",
      },
      {
        name: "아이디 기부하기",
        url: "https://docs.google.com/forms/d/e/1FAIpQLSeO0Yadoe6W1ZILXbYIj7K2yWw77c2pipJijx8slbvbiqE5yA/viewform",
      },
    ],
  },
  {
    title: "헬퍼 지원",
    icon: Users,
    color: "bg-blue-500",
    links: [
      {
        name: "헬퍼 지원 가이드",
        url: "/guide/helper-support",
      },
      {
        name: "헬퍼 지원하기",
        url: "mailto:day6strmteam@gmail.com",
      },
    ],
  },
  {
    title: "기타 활동",
    icon: DollarSign,
    color: "bg-yellow-500",
    subItems: [
      {
        name: "총공 모금",
        url: "/guide/general-meeting",
      },
      {
        name: "투표 모금",
        url: "/guide/vote-collection",
      },
    ],
  },
];

export default function SupportPage() {
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<
    "nemo" | "standard" | "idCard" | "earphone"
  >("standard");

  const getVersionInfo = (version: string) => {
    switch (version) {
      case "nemo":
        return { name: "Nemo Ver.", description: "11,900원 (2종)" };
      case "standard":
        return { name: "CD Ver.", description: "19,300원 (2종)" };
      case "idCard":
        return { name: "ID Card Ver.", description: "22,300원" };
      case "earphone":
        return {
          name: "In Ear Earphones Ver.",
          description: "66,700원 (4종 랜덤)",
        };
      default:
        return { name: "CD Ver.", description: "19,300원 (2종)" };
    }
  };

  return (
    <div>
      {/* Content with same padding as homepage */}
      <div className="px-5 md:px-6 lg:px-8 xl:px-12 space-y-6 pt-6">
        {/* Section Header */}
        <SectionHeader title="서포트 활동" showDateTime={false} />

        {/* 데이식스 음원 총공팀 소셜 링크 */}
        <Card className="bg-transparent from-mint-primary/5 to-mint-light/10 border-mint-primary/20">
          <CardContent className="p-0">
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-mint-primary" />
                데이식스 음원 총공팀
              </h3>
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-4 min-w-max px-2">
                  <a
                    href="mailto:day6strmteam@gmail.com"
                    className="flex flex-col items-center gap-2 min-w-0"
                  >
                    <div className="w-12 h-12 rounded-full bg-mint-primary/10 hover:bg-mint-primary/20 transition-colors flex items-center justify-center">
                      <Mail className="w-6 h-6 text-mint-primary" />
                    </div>
                    <span className="text-xs text-gray-600 whitespace-nowrap">
                      메일
                    </span>
                  </a>

                  <a
                    href="https://x.com/DAY6_STREAM?t=KO5LXMyTvTL2WrdIz8Z9jQ&s=09"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 min-w-0"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors flex items-center justify-center">
                      <Twitter className="w-6 h-6 text-blue-500" />
                    </div>
                    <span className="text-xs text-gray-600 whitespace-nowrap">
                      트위터
                    </span>
                  </a>

                  <a
                    href="https://youtube.com/@day6_stream?si=Z2HBzbbAJgaNM4LM"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 min-w-0"
                  >
                    <div className="w-12 h-12 rounded-full bg-red-100 hover:bg-red-200 transition-colors flex items-center justify-center">
                      <Youtube className="w-6 h-6 text-red-500" />
                    </div>
                    <span className="text-xs text-gray-600 whitespace-nowrap">
                      유튜브
                    </span>
                  </a>

                  <a
                    href="https://kko.kakao.com/q2UMCC03-4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 min-w-0"
                  >
                    <div className="w-12 h-12 rounded-full bg-yellow-100 hover:bg-yellow-200 transition-colors flex items-center justify-center">
                      <Music className="w-6 h-6 text-yellow-600" />
                    </div>
                    <span className="text-xs text-gray-600 whitespace-nowrap">
                      뮤직웨이브
                    </span>
                  </a>

                  <a
                    href="https://stationhead.com/day6strmteam"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 min-w-0"
                  >
                    <div className="w-12 h-12 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors flex items-center justify-center">
                      <Radio className="w-6 h-6 text-purple-500" />
                    </div>
                    <span className="text-xs text-gray-600 whitespace-nowrap">
                      스테이션헤드
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Divider */}
        <div
          className="md:hidden -mx-9"
          style={{ borderBottom: "0.6rem solid #f7f8f9" }}
        ></div>

        {/* Support Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {supportItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={index}
                className="hover:shadow-md transition-shadow duration-200"
              >
                <CardContent className="p-0">
                  <div className="p-3 md:p-6 space-y-4">
                    {/* Icon and Title */}
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    {/* Links or Sub-items */}
                    {item.links ? (
                      <div className="grid grid-cols-1 gap-2">
                        {item.links.map((link, linkIndex) => (
                          <Button
                            key={linkIndex}
                            asChild={!("isModal" in link && link.isModal)}
                            variant="ghost"
                            className="justify-between p-3 h-auto border border-gray-100 hover:border-gray-200"
                            onClick={
                              "isModal" in link && link.isModal
                                ? (link as LinkItem).modalType === "comingSoon"
                                  ? () => setShowComingSoonModal(true)
                                  : () => setShowPriceModal(true)
                                : undefined
                            }
                          >
                            {"isModal" in link && link.isModal ? (
                              <>
                                <span className="text-sm font-medium text-gray-700">
                                  {link.name}
                                </span>
                                <ExternalLink className="w-4 h-4 text-gray-400" />
                              </>
                            ) : (
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <span className="text-sm font-medium text-gray-700">
                                  {link.name}
                                </span>
                                <ExternalLink className="w-4 h-4 text-gray-400" />
                              </a>
                            )}
                          </Button>
                        ))}
                      </div>
                    ) : item.subItems ? (
                      <div className="grid grid-cols-1 gap-2">
                        {item.subItems.map((subItem, subIndex) => (
                          <Button
                            key={subIndex}
                            asChild={!("isModal" in subItem && subItem.isModal)}
                            variant="ghost"
                            className="justify-between p-3 h-auto border border-gray-100 hover:border-gray-200"
                            onClick={
                              "isModal" in subItem && subItem.isModal
                                ? (subItem as SubItem).modalType ===
                                  "comingSoon"
                                  ? () => setShowComingSoonModal(true)
                                  : undefined
                                : undefined
                            }
                          >
                            {"isModal" in subItem && subItem.isModal ? (
                              <>
                                <span className="text-sm font-medium text-gray-700">
                                  {subItem.name}
                                </span>
                                <ExternalLink className="w-4 h-4 text-gray-400" />
                              </>
                            ) : (
                              <a href={subItem.url}>
                                <span className="text-sm font-medium text-gray-700">
                                  {subItem.name}
                                </span>
                                <ExternalLink className="w-4 h-4 text-gray-400" />
                              </a>
                            )}
                          </Button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Price Comparison Modal */}
      <AnimatePresence>
        {showPriceModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-[100] flex items-end md:items-center justify-center md:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowPriceModal(false)}
          >
            {/* Mobile: Bottom Sheet */}
            <motion.div
              className="md:hidden bg-white rounded-t-2xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 300,
                duration: 0.5,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 bg-white rounded-t-2xl shadow-lg flex items-center justify-between sticky top-0">
                <h2 className="text-base font-bold">일반 구매처 가격 비교</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPriceModal(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-4 space-y-4">
                {/* Warning */}
                {/* Version Selector */}
                <div className="overflow-x-auto -mx-4 px-4">
                  <div className="flex gap-2 min-w-max">
                    {(["nemo", "standard", "idCard", "earphone"] as const).map(
                      (version) => {
                        const info = getVersionInfo(version);
                        return (
                          <Badge
                            key={version}
                            className={`cursor-pointer px-3 py-2 text-sm whitespace-nowrap ${
                              selectedVersion === version
                                ? "bg-mint-primary text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                            onClick={() => setSelectedVersion(version)}
                          >
                            {info.name}
                          </Badge>
                        );
                      }
                    )}
                  </div>
                </div>
                {/* Selected Version Info */}
                <div className="bg-mint-primary/10 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      {getVersionInfo(selectedVersion).name}
                    </h3>
                    <div className="text-lg font-bold text-mint-primary">
                      {getVersionInfo(selectedVersion).description}
                    </div>
                  </div>
                </div>
                {/* Store List for Selected Version
                <div className="space-y-2">
                  {albumStores.map((store, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{store.name}</div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-mint-primary">
                            {store.prices[selectedVersion]}
                          </span>
                          <Button
                            asChild
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-mint-primary"
                          >
                            <a
                              href={store.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            배송비: {store.shipping}
                          </span>
                          {store.note && (
                            <span className="text-blue-600 font-medium">
                              {store.note}
                            </span>
                          )}
                        </div>
                        {store.benefit && (
                          <div className="bg-green-50 border border-green-200 rounded p-2">
                            <p className="text-xs text-green-800">
                              <strong>특전:</strong> {store.benefit}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div> */}
                {/* CTA */}
                <Button
                  asChild
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <a
                    href="https://twitter.com/DAY6_STREAM"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    음원총공팀 확인하기 →
                  </a>
                </Button>
              </div>
            </motion.div>

            {/* Desktop: Full Table Modal */}
            <motion.div
              className="hidden md:block bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-700" />
                  <h2 className="text-lg font-bold">일반 구매처 가격 비교</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPriceModal(false)}
                  className="hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-4 space-y-4">
                {/* Warning */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800">
                    아래는 일반 구매 가격입니다.
                  </p>
                </div>

                {/* Price Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-4">구매처</th>
                        <th className="text-center py-3 px-4">Nemo Ver.</th>
                        <th className="text-center py-3 px-4">CD Ver.</th>
                        <th className="text-center py-3 px-4">ID Card Ver.</th>
                        <th className="text-right py-3 px-4">배송비</th>
                        <th className="text-center py-3 px-4"></th>
                      </tr>
                    </thead>
                    {/* <tbody>
                      {albumStores.map((store, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium">{store.name}</div>
                            {store.note && (
                              <div className="text-xs text-blue-600 mt-1">
                                {store.note}
                              </div>
                            )}
                          </td>
                          <td className="text-center py-3 px-4 text-xs">
                            <div className="font-semibold text-mint-primary">
                              {store.prices.nemo}
                            </div>
                          </td>
                          <td className="text-center py-3 px-4 text-xs">
                            <div className="font-semibold text-mint-primary">
                              {store.prices.standard}
                            </div>
                          </td>
                          <td className="text-center py-3 px-4 text-xs">
                            <div className="font-semibold text-mint-primary">
                              {store.prices.idCard}
                            </div>
                          </td>
                          <td className="text-right py-3 px-4 text-xs">
                            <div
                              className={`${store.shipping === "무료" ? "text-green-600 font-semibold" : "text-gray-600"}`}
                            >
                              {store.shipping}
                            </div>
                          </td>
                          <td className="text-center py-3 px-4">
                            <Button
                              asChild
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-mint-primary hover:text-mint-dark"
                            >
                              <a
                                href={store.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody> */}
                  </table>
                </div>

                {/* Special Benefits Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    특전 정보
                  </h4>
                  <div className="space-y-1 text-xs text-blue-800">
                    <p>
                      • <strong>포토카드 중복 방지:</strong> 애플뮤직, 위드뮤
                    </p>
                    <p>
                      • <strong>무료 배송:</strong> YES24, 알라딘
                    </p>
                    <p>
                      • <strong>세트 구매:</strong> 알라딘 (네모반 세트,
                      이어폰반 세트)
                    </p>
                    <p>
                      • <strong>이어폰반 버전 중복 방지:</strong> 애플뮤직,
                      위드뮤
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-purple-800 mb-3">
                      <strong>음원총공팀에서 더 많은 정보를 확인하세요!</strong>
                    </p>
                    <Button
                      asChild
                      size="sm"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <a
                        href="https://twitter.com/DAY6_STREAM"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        데이식스 음원총공팀 확인하기
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coming Soon Modal */}
      <AnimatePresence>
        {showComingSoonModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowComingSoonModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl w-full max-w-sm p-6 text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-2">
                준비 중입니다
              </h2>

              <p className="text-sm text-gray-600 mb-6">
                해당 서비스는 현재 개발 중이에요.
                <br />곧 만나뵐 수 있도록 준비하고 있습니다!
              </p>

              <Button
                onClick={() => setShowComingSoonModal(false)}
                className="w-full bg-mint-primary hover:bg-mint-dark text-white"
              >
                확인
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom spacing for mobile nav */}
      <div className="h-20 md:h-8"></div>
    </div>
  );
}

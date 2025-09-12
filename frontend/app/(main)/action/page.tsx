"use client";

import { motion } from "framer-motion";
import { Music, Download, Radio, Vote, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";

const actionItems = [
  {
    title: "스트리밍",
    description: "음원 스트리밍하기",
    icon: Music,
    href: "/streaming",
    gradient: "from-pink-500 to-rose-400",
  },
  {
    title: "다운로드",
    description: "음원 다운로드하기",
    icon: Download,
    href: "/download",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    title: "라디오신청",
    description: "라디오 신청하기",
    icon: Radio,
    href: "/radio",
    gradient: "from-green-500 to-emerald-400",
  },
  {
    title: "투표",
    description: "음악방송 투표하기",
    icon: Vote,
    href: "/votes",
    gradient: "from-purple-500 to-violet-400",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.9 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 10,
    },
  },
};

export default function ActionPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Action" description="원하는 활동을 선택하세요" />

      <motion.div
        className="grid grid-cols-2 gap-4 px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {actionItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.a
              key={index}
              href={item.href}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="block"
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                {/* 원형 아이콘 */}
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* 제목 */}
                <h3 className="text-lg font-bold text-gray-900 text-center mb-1">
                  {item.title}
                </h3>

                {/* 설명 */}
                <p className="text-sm text-gray-500 text-center mb-3">
                  {item.description}
                </p>

                {/* 화살표 */}
                <div className="flex justify-center">
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </motion.a>
          );
        })}
      </motion.div>

      {/* 하단 여백 */}
      <div className="h-8"></div>
    </div>
  );
}

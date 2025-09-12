import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { GUIDE_CATEGORIES } from "@/content/guide.config";
import Image from "next/image";
import { SectionHeader } from "@/components/ui/section-header";

// 카테고리별로 그룹핑
const categoryGroups = {
  streaming: GUIDE_CATEGORIES.filter((c) => c.category === "streaming"),
  download: GUIDE_CATEGORIES.filter((c) => c.category === "download"),
  voting: GUIDE_CATEGORIES.filter((c) => c.category === "voting"),
  radio: GUIDE_CATEGORIES.filter((c) => c.category === "radio"),
  support: GUIDE_CATEGORIES.filter((c) => c.category === "support"),
};

// 카테고리 아이콘 및 제목
const categoryInfo = {
  streaming: {
    icon: "",
    title: "스트리밍",
    description: "",
  },
  download: {
    icon: "",
    title: "다운로드",
    description: "",
  },
  voting: {
    icon: "",
    title: "투표",
    description: "",
  },
  radio: {
    icon: "",
    title: "라디오",
    description: "",
  },
  support: {
    icon: "",
    title: "서포트",
    description: "",
  },
};

function CategorySection({
  categoryKey,
  items,
}: {
  categoryKey: keyof typeof categoryInfo;
  items: typeof GUIDE_CATEGORIES;
}) {
  const { title } = categoryInfo[categoryKey];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>

      {/* 가로 스크롤 카드 컨테이너 */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-3 min-w-max">
          {items.map((item) => (
            <Link key={item.slug} href={`/guide/${item.slug}`}>
              <Card className="w-40 flex-shrink-0 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* 이미지 영역 */}
                    <div className="w-full h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {item.heroImage ? (
                        <Image
                          src={item.heroImage}
                          alt={item.label}
                          width={160}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400">{/* Placeholder */}</div>
                      )}
                    </div>

                    {/* 제목 및 설명 */}
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm leading-tight">
                        {item.label}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function GuidePage() {
  return (
    <div className="mx-auto w-full max-w-screen-sm mt-5 px-4 pb-20">
      <SectionHeader title="DAY6 응원 가이드" showDateTime={false} />

      <div className="mt-6 space-y-8">
        <CategorySection
          categoryKey="streaming"
          items={categoryGroups.streaming}
        />
        <CategorySection
          categoryKey="download"
          items={categoryGroups.download}
        />
        <CategorySection categoryKey="voting" items={categoryGroups.voting} />
        <CategorySection categoryKey="radio" items={categoryGroups.radio} />
        <CategorySection categoryKey="support" items={categoryGroups.support} />
      </div>
    </div>
  );
}

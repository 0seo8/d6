import { notFound } from "next/navigation";
import { GUIDE_CATEGORIES } from "@/content/guide.config";
import { CategoryTabs } from "@/components/guide/category-tabs";
import { ImageGallery } from "@/components/guide/image-gallery";
import { SectionHeader } from "@/components/ui/section-header";

type Props = { params: Promise<{ slug: string }> };

// 카테고리별 탭 그룹핑
function getCategoryItems(category: string | undefined) {
  return GUIDE_CATEGORIES.filter((item) => item.category === category);
}

// 카테고리별 제목 매핑
function getCategoryTitle(category: string | undefined): string {
  switch (category) {
    case "streaming":
      return "DAY6 스트리밍 가이드";
    case "download":
      return "DAY6 다운로드 가이드";
    case "voting":
      return "DAY6 투표 가이드";
    case "radio":
      return "DAY6 라디오 가이드";
    case "support":
      return "DAY6 서포트 가이드";
    default:
      return "DAY6 응원 가이드";
  }
}

export default async function GuideDetailPage({ params }: Props) {
  const { slug } = await params;
  const c = GUIDE_CATEGORIES.find((x) => x.slug === slug);
  if (!c) return notFound();

  // 현재 항목과 같은 카테고리의 모든 항목들
  const categoryItems = getCategoryItems(c.category);

  return (
    <div className="mx-auto w-full max-w-screen-sm px-4 pb-24">
      {/* 헤더 동일 */}
      <header className="sticky top-0 z-30  pb-3 pt-4">
        {/* <div className="flex items-center justify-between"> */}
        {/* <h1 className="text-lg font-bold">DAY6 응원 가이드</h1>
          <div className="text-xs text-gray-500">
            {c.date ??
              new Intl.DateTimeFormat("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })
                .format(new Date())
                .replace(/\. /g, ".")
                .replace(".", "")}
          </div>

          <ShareButton title={c.label} slug={slug} /> */}
        <SectionHeader
          title={getCategoryTitle(c.category)}
          showDateTime={false}
        />
        {/* </div> */}

        {/* 카테고리 탭 */}
        <CategoryTabs categoryItems={categoryItems} activeSlug={slug} />
      </header>

      {/* 가이드 이미지 갤러리 - 클릭 시 팝업 */}
      <ImageGallery
        images={
          c.images?.length
            ? c.images
            : [c.heroImage].filter((img): img is string => Boolean(img))
        }
        label={c.label}
      />
    </div>
  );
}

import { MobileAppLayout } from "@/components/layout/mobile-app-layout";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileAppLayout>{children}</MobileAppLayout>
  );
}
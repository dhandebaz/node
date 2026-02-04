
import { SpaceAssistant } from "@/components/space/SpaceAssistant";

export default function SpaceDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <SpaceAssistant />
    </>
  );
}

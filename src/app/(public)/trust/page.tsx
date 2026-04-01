import type { Metadata } from "next";
import TrustPage from "@/components/public-site/TrustPage";

export const metadata: Metadata = {
  title: "Trust & Security | Nodebase",
  description:
    "Enterprise-grade security, compliance, and data protection. Learn how Nodebase protects your business and customer data.",
};

export const revalidate = 3600;

export default function Page() {
  return <TrustPage />;
}

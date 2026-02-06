export const dynamic = 'force-dynamic';


import { redirect } from "next/navigation";

export default function DashboardIndex() {
  redirect("/node/dashboard/overview");
}

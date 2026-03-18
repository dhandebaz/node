import {
  User,
  Bell,
  Shield,
  Smartphone,
  Monitor,
  CheckCircle2,
  FileCheck,
  ArrowRight,
} from "lucide-react";
import { getCustomerProfile } from "@/app/actions/customer";
import { getActiveTenantId, getTenantContext } from "@/lib/auth/tenant";
import { ComplianceHubCard } from "@/components/dashboard/settings/ComplianceHubCard";
import { BusinessProfileSettings } from "@/components/dashboard/settings/BusinessProfileSettings";
import { TeamManagement } from "@/components/dashboard/settings/TeamManagement";
import { DownloadSignedAgreementButton } from "@/components/dashboard/settings/DownloadSignedAgreementButton";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CustomerSettingsPage() {
  const profile = await getCustomerProfile();
  const tenantId = await getActiveTenantId();
  if (!tenantId) redirect("/onboarding");
  const tenant = await getTenantContext(tenantId);

  if (!tenant) return null;

  const verificationDetails = [
    tenant.aadhaar_number
      ? `Aadhaar verified (${tenant.aadhaar_number})`
      : null,
    tenant.pan_number ? `PAN verified (${tenant.pan_number})` : null,
    tenant.tax_id && tenant.tax_id !== tenant.pan_number
      ? `Tax ID on file (${tenant.tax_id})`
      : null,
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--public-ink)] mb-1">Settings</h1>
        <p className="text-[var(--public-muted)]">Manage your profile and preferences.</p>
      </div>

      <div className="grid gap-8">
        <BusinessProfileSettings tenant={tenant} />

        <TeamManagement />

        {/* Profile Section */}
        <div className="public-panel border border-[var(--public-line)] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[var(--public-line)] flex items-center gap-4">
            <div className="p-3 bg-[var(--public-panel-muted)] rounded-lg">
              <User className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--public-ink)]">Profile</h2>
              <p className="text-sm text-[var(--public-muted)]">Your personal information</p>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--public-muted)] mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  value={profile.identity.id}
                  readOnly
                  className="w-full bg-[var(--public-bg-soft)] text-[var(--public-ink)] border border-[var(--public-line)] rounded-lg px-4 py-2 text-[var(--public-ink)] focus:outline-none focus:border-blue-500 cursor-not-allowed opacity-70"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--public-muted)] mb-2">
                  Mobile Number (Primary)
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--public-muted)]" />
                  <input
                    type="text"
                    value={profile.identity.phone}
                    readOnly
                    className="w-full bg-[var(--public-bg-soft)] text-[var(--public-ink)] border border-[var(--public-line)] rounded-lg pl-10 pr-4 py-2 text-[var(--public-ink)] focus:outline-none focus:border-blue-500 cursor-not-allowed opacity-70"
                  />
                </div>
                <p className="text-xs text-[var(--public-muted)] mt-1">
                  Used for login and OTP.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--public-muted)] mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={profile.identity.email || ""}
                  readOnly
                  placeholder="Not set"
                  className="w-full bg-[var(--public-bg-soft)] text-[var(--public-ink)] border border-[var(--public-line)] rounded-lg px-4 py-2 text-[var(--public-ink)] focus:outline-none focus:border-blue-500 cursor-not-allowed opacity-70"
                />
              </div>
            </div>
          </div>
        </div>

        {/* KYC Section */}
        {tenant.kyc_status === "verified" ? (
          <div className="public-panel border border-[var(--public-line)] rounded-xl overflow-hidden">
            <div className="p-6 border-b border-[var(--public-line)] flex items-center gap-4">
              <div className="p-3 bg-[var(--public-panel-muted)] rounded-lg">
                <FileCheck className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--public-ink)]">
                  KYC Verification
                </h2>
                <p className="text-sm text-[var(--public-muted)]">
                  Identity verification status
                </p>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/20 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <div>
                  <div className="font-medium text-green-400">
                    Verification Complete
                  </div>
                  <div className="text-sm text-green-500/80">
                    Your identity has been verified. You have full access to all
                    features.
                  </div>
                </div>
              </div>
              <div className="grid gap-4 text-sm text-[var(--public-muted)] md:grid-cols-2">
                {verificationDetails.length > 0 ? (
                  verificationDetails.map((detail) => (
                    <div key={detail} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>{detail}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Verification documents are on file.</span>
                  </div>
                )}
              </div>
              <div className="mt-6">
                <DownloadSignedAgreementButton />
              </div>
            </div>
          </div>
        ) : (
          <div className="public-panel border border-[var(--public-line)] rounded-xl overflow-hidden">
            <div className="p-6 border-b border-[var(--public-line)] flex items-center gap-4">
              <div className="p-3 bg-[var(--public-panel-muted)] rounded-lg">
                <FileCheck className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--public-ink)]">
                  KYC Verification
                </h2>
                <p className="text-sm text-[var(--public-muted)]">
                  Complete identity verification to unlock the platform.
                </p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-4 text-sm text-zinc-200">
                Your workspace still needs the host verification flow. Continue
                to the guided verification page to submit your details, upload
                your document, and sign the agreement.
              </div>
              <Link
                href="/dashboard/verification"
                className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-[var(--public-ink)] transition-colors hover:bg-purple-500"
              >
                Continue verification
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        <ComplianceHubCard tenant={tenant} />

        {/* Notifications Section */}
        <div className="public-panel border border-[var(--public-line)] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[var(--public-line)] flex items-center gap-4">
            <div className="p-3 bg-[var(--public-panel-muted)] rounded-lg">
              <Bell className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--public-ink)]">
                Notifications
              </h2>
              <p className="text-sm text-[var(--public-muted)]">Manage how we contact you</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-[var(--public-bg-soft)] text-[var(--public-ink)] rounded-lg border border-[var(--public-line)]">
              <div>
                <div className="font-medium text-[var(--public-ink)]">Product Updates</div>
                <div className="text-sm text-[var(--public-muted)]">
                  Receive updates about your products
                </div>
              </div>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 cursor-pointer">
                <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-[var(--public-bg-soft)] text-[var(--public-ink)] rounded-lg border border-[var(--public-line)]">
              <div>
                <div className="font-medium text-[var(--public-ink)]">Security Alerts</div>
                <div className="text-sm text-[var(--public-muted)]">
                  Login alerts and critical notifications
                </div>
              </div>
              <div
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 cursor-pointer opacity-50 cursor-not-allowed"
                title="Always enabled"
              >
                <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="public-panel border border-[var(--public-line)] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[var(--public-line)] flex items-center gap-4">
            <div className="p-3 bg-[var(--public-panel-muted)] rounded-lg">
              <Shield className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--public-ink)]">Security</h2>
              <p className="text-sm text-[var(--public-muted)]">
                Manage your active sessions
              </p>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[var(--public-bg-soft)] text-[var(--public-ink)] rounded-lg border border-[var(--public-line)]">
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-[var(--public-muted)]" />
                  <div>
                    <div className="font-medium text-[var(--public-ink)]">
                      Current Session
                    </div>
                    <div className="text-sm text-[var(--public-muted)]">
                      Windows • Chrome • India
                    </div>
                  </div>
                </div>
                <div className="text-xs text-green-400 font-medium px-2 py-1 bg-green-500/10 rounded">
                  Active Now
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--public-bg-soft)] text-[var(--public-ink)] rounded-lg border border-[var(--public-line)]">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-[var(--public-muted)]" />
                  <div>
                    <div className="font-medium text-[var(--public-ink)]">Mobile App</div>
                    <div className="text-sm text-[var(--public-muted)]">
                      iOS • iPhone 14 • India
                    </div>
                  </div>
                </div>
                <button className="text-xs text-red-400 hover:text-red-300 font-medium px-2 py-1 hover:bg-red-500/10 rounded transition-colors">
                  Revoke
                </button>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[var(--public-line)]">
              <button className="text-red-400 hover:text-red-300 font-medium text-sm flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Log out of all devices
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

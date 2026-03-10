"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { BadgeCheck, ExternalLink, Loader2, AlertCircle } from "lucide-react";

interface ConnectStatus {
  connected: boolean;
  charges_enabled: boolean;
  details_submitted: boolean;
}

interface Props {
  accessToken: string;
}

export default function StripeConnectBanner({ accessToken }: Props) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/connect/status`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => r.json())
      .then((data) => setStatus(data))
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, [accessToken]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/connect/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // silent
    } finally {
      setConnecting(false);
    }
  };

  if (loading) return null;

  // Fully connected and charges enabled — show a subtle success indicator
  if (status?.charges_enabled) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 mb-4">
        <BadgeCheck className="h-4 w-4 flex-shrink-0" />
        <span>{t("wallet.stripeAccountConnected")}</span>
      </div>
    );
  }

  // Account created but onboarding not complete
  if (status?.connected && !status.charges_enabled) {
    return (
      <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">{t("wallet.stripeSetupIncomplete")}</p>
            <p className="text-xs text-amber-700">{t("wallet.stripeOnboardingDesc")}</p>
          </div>
        </div>
        <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5 flex-shrink-0"
          onClick={handleConnect} disabled={connecting}>
          {connecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
          {t("wallet.stripeResumeSetup")}
        </Button>
      </div>
    );
  }

  // Not connected at all
  return (
    <div className="flex items-center justify-between gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4">
      <div>
        <p className="text-sm font-medium text-green-800">{t("wallet.stripeGetPaid")}</p>
        <p className="text-xs text-green-700">{t("wallet.stripeConnectDesc")}</p>
      </div>
      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5 flex-shrink-0"
        onClick={handleConnect} disabled={connecting}>
        {connecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
        {t("wallet.connectStripe")}
      </Button>
    </div>
  );
}

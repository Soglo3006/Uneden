import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import ProfilePictureUploader from "@/components/profile/ProfilePicture";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  User, Lock, Bell, Globe, Link2, LogOut, Trash2, ChevronRight,
  Mail, Phone, MapPin, Building2, Briefcase, Users, Check, CreditCard,
} from "lucide-react";
import { Toggle } from "./settings/SubPageHeader";
import ChangePasswordPage from "./settings/ChangePasswordPage";
import BlockedUsersPage from "./settings/BlockedUsersPage";
import LogoutPage from "./settings/LogoutPage";
import DeleteAccountPage from "./settings/DeleteAccountPage";

type Screen = "default" | "changePassword" | "blockedUsers" | "paymentMethods" | "billingHistory" | "logout" | "deleteAccount";

function PaymentMethodsPage({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  return (
    <div className="bg-gray-50">
      <div className="bg-white border-b relative">
        <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-900 text-xl cursor-pointer">✕</button>
        <button onClick={onBack} className="absolute top-3 left-3 sm:top-4 sm:left-4 text-gray-600 hover:text-gray-900 cursor-pointer text-sm sm:text-base">← Back</button>
        <div className="px-3 sm:px-4 py-4 sm:py-6 text-center">
          <h1 className="text-lg sm:text-3xl font-bold text-gray-900 mt-6 sm:mt-0">Payment Methods</h1>
        </div>
      </div>
      <div className="px-3 sm:px-4 py-4 sm:py-8">
        <Card className="p-4 sm:p-6">Coming soon...</Card>
      </div>
    </div>
  );
}

function BillingHistoryPage({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  return (
    <div className="bg-gray-50">
      <div className="bg-white border-b relative">
        <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-900 text-xl cursor-pointer">✕</button>
        <button onClick={onBack} className="absolute top-3 left-3 sm:top-4 sm:left-4 text-gray-600 hover:text-gray-900 cursor-pointer text-sm sm:text-base">← Back</button>
        <div className="px-3 sm:px-4 py-4 sm:py-6 text-center">
          <h1 className="text-lg sm:text-3xl font-bold text-gray-900 mt-6 sm:mt-0">Billing History</h1>
        </div>
      </div>
      <div className="px-3 sm:px-4 py-4 sm:py-8">
        <Card className="p-4 sm:p-6">Coming soon...</Card>
      </div>
    </div>
  );
}

export default function SettingsPage({ onClose, scrollRef }: { onClose: () => void; scrollRef?: React.RefObject<HTMLElement> }) {
  const { user, session } = useAuth();
  const [userProfilePicture, setUserProfilePicture] = useState(user?.user_metadata?.avatar_url || "");
  const [profileData, setProfileData] = useState<Record<string, string> | null>(() => {
    if (!user) return null;
    const meta = user.user_metadata || {};
    return {
      email: user.email || "",
      full_name: meta.full_name || meta.name || "",
      company_name: meta.company_name || "",
      profession: meta.profession || "",
      industry: meta.industry || "",
      team_size: meta.team_size || "",
      account_type: meta.account_type || "",
      avatar: meta.avatar_url || meta.avatar || "",
      phone: meta.phone || "",
      city: meta.city || "",
      province: meta.province || "",
    };
  });
  const [loading, setLoading] = useState(!user);
  const [screen, setScreen] = useState<Screen>("default");
  const [scrollPosition, setScrollPosition] = useState(0);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const [emailPrefs, setEmailPrefs] = useState({
    email_messages: true, email_payments: true, email_listings: true, email_complaints: true,
  });
  const [language, setLanguage] = useState("en");
  const [region, setRegion] = useState("CA");
  const [connectedAccounts, setConnectedAccounts] = useState<{ provider: string }[]>([]);

  const goToScreen = (screenName: Screen) => {
    if (scrollRef?.current) setScrollPosition(scrollRef.current.scrollTop);
    setScreen(screenName);
  };

  const goBack = () => {
    setScreen("default");
    setTimeout(() => {
      if (scrollRef?.current) scrollRef.current.scrollTop = scrollPosition;
    }, 0);
  };

  useEffect(() => {
    const fetchAll = async () => {
      if (!session?.access_token) { setLoading(false); return; }
      try {
        const [profileRes, settingsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/me`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/settings`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }),
        ]);
        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfileData(data);
          setUserProfilePicture(data.avatar || "");
        }
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          if (data.language) setLanguage(data.language);
          if (data.region) setRegion(data.region);
        }
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/preferences`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }).then(r => r.ok ? r.json() : null).then(data => {
          if (data) setEmailPrefs(data);
        }).catch(() => {});
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        if (supabaseUser?.identities) setConnectedAccounts(supabaseUser.identities);
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [session]);

  useEffect(() => {
    if (scrollRef?.current) scrollRef.current.scrollTop = 0;
  }, [screen]);

  const saveSettings = async () => {
    if (!session?.access_token) return;
    setSavingSettings(true);
    try {
      const [response] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/settings`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ language, region }),
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/preferences`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify(emailPrefs),
        }),
      ]);
      if (response.ok) {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 2500);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSavingSettings(false);
    }
  };

  if (screen === "changePassword") return <ChangePasswordPage onBack={goBack} onClose={onClose} />;
  if (screen === "blockedUsers") return <BlockedUsersPage onBack={goBack} onClose={onClose} />;
  if (screen === "paymentMethods") return <PaymentMethodsPage onBack={goBack} onClose={onClose} />;
  if (screen === "billingHistory") return <BillingHistoryPage onBack={goBack} onClose={onClose} />;
  if (screen === "logout") return <LogoutPage onBack={goBack} onClose={onClose} />;
  if (screen === "deleteAccount") return <DeleteAccountPage onBack={goBack} onClose={onClose} />;

  const isPerson = profileData?.account_type === "person";
  const isCompany = profileData?.account_type === "company";
  const displayName = isPerson ? profileData?.full_name : profileData?.company_name;
  const isGoogleConnected = connectedAccounts.some(a => a.provider === "google");
  const isFacebookConnected = connectedAccounts.some(a => a.provider === "facebook");
  const isEmailConnected = connectedAccounts.some(a => a.provider === "email");

  if (loading) {
    return (
      <div className="bg-gray-50 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b relative">
        <button onClick={onClose} className="text-gray-500 hover:text-gray-900 text-xl absolute top-3 right-3 sm:top-4 sm:right-4 cursor-pointer">✕</button>
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pr-10">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Settings</h1>
            {isCompany && (
              <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                <Building2 className="h-3 w-3 mr-1" />Company Account
              </Badge>
            )}
          </div>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Manage your {isPerson ? "account" : "company"} settings and preferences
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="grid gap-4 sm:gap-6">

          {/* Profile Information */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4 sm:mb-6 gap-2">
              <div className="flex items-center gap-3">
                {isPerson ? <User className="h-5 w-5 sm:h-6 sm:w-6 text-green-700 shrink-0" /> : <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-700 shrink-0" />}
                <div>
                  <h2 className="text-base sm:text-xl font-bold text-gray-900">
                    {isPerson ? "Profile Information" : "Company Information"}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Update your {isPerson ? "personal" : "company"} details and profile picture
                  </p>
                </div>
              </div>
              <Link href="/profile/edit">
                <Button variant="outline" size="sm" className="cursor-pointer shrink-0 text-xs sm:text-sm">
                  Edit <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
              <div className="flex justify-center sm:justify-start">
                <ProfilePictureUploader
                  currentProfilePicture={userProfilePicture}
                  userName={displayName || "User"}
                  onProfileChange={(newPic) => setUserProfilePicture(newPic)}
                  size="xl"
                  showLabel={false}
                  readOnly={true}
                />
              </div>
              <div className="flex-1 space-y-2 sm:space-y-3 w-full">
                <div className="flex items-center gap-3 text-gray-700">
                  {isPerson ? <User className="h-4 w-4 text-gray-400 shrink-0" /> : <Building2 className="h-4 w-4 text-gray-400 shrink-0" />}
                  <span className="font-medium text-sm sm:text-base truncate">
                    {displayName || <span className="inline-block h-4 w-32 bg-gray-200 rounded animate-pulse" />}
                  </span>
                  {isCompany && <span className="text-xs text-gray-500 shrink-0">(Company Name)</span>}
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-sm sm:text-base truncate">
                    {profileData?.email || user?.email || <span className="inline-block h-4 w-48 bg-gray-200 rounded animate-pulse" />}
                  </span>
                </div>
                {profileData?.phone && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-sm sm:text-base">{profileData.phone}</span>
                  </div>
                )}
                {profileData?.city && profileData?.province && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-sm sm:text-base">{profileData.city}, {profileData.province}</span>
                  </div>
                )}
                {isPerson && profileData?.profession && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Briefcase className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-sm sm:text-base">{profileData.profession}</span>
                  </div>
                )}
                {isCompany && profileData?.industry && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Briefcase className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-sm sm:text-base">{profileData.industry}</span>
                  </div>
                )}
                {isCompany && profileData?.team_size && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Users className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-sm sm:text-base">{profileData.team_size} employees</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Password & Security */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-green-700 shrink-0" />
              <div>
                <h2 className="text-base sm:text-xl font-bold text-gray-900">Password & Security</h2>
                <p className="text-xs sm:text-sm text-gray-600">Manage your password and blocked users</p>
              </div>
            </div>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-between cursor-pointer text-sm" onClick={() => goToScreen("changePassword")}>
                <span>Change Password</span><ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between cursor-pointer text-sm" onClick={() => goToScreen("blockedUsers")}>
                <span>Blocked Users</span><ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Connected Accounts */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <Link2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-700 shrink-0" />
              <div>
                <h2 className="text-base sm:text-xl font-bold text-gray-900">Connected Accounts</h2>
                <p className="text-xs sm:text-sm text-gray-600">Manage your linked sign-in methods</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <Mail className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm">Email & Password</p>
                    <p className="text-xs text-gray-500 truncate">{profileData?.email}</p>
                  </div>
                </div>
                {isEmailConnected ? (
                  <Badge className="bg-green-100 text-green-700 border-green-300 text-xs shrink-0"><Check className="h-3 w-3 mr-1" />Connected</Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-500 text-xs shrink-0">Not connected</Badge>
                )}
              </div>
              <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Google</p>
                    <p className="text-xs text-gray-500">Sign in with Google</p>
                  </div>
                </div>
                {isGoogleConnected ? (
                  <Badge className="bg-green-100 text-green-700 border-green-300 text-xs shrink-0"><Check className="h-3 w-3 mr-1" />Connected</Badge>
                ) : (
                  <Button variant="outline" size="sm" className="cursor-pointer text-xs shrink-0"
                    onClick={async () => { await supabase.auth.linkIdentity({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } }); }}>
                    Connect
                  </Button>
                )}
              </div>
              <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center shrink-0">
                    <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Facebook</p>
                    <p className="text-xs text-gray-500">Sign in with Facebook</p>
                  </div>
                </div>
                {isFacebookConnected ? (
                  <Badge className="bg-green-100 text-green-700 border-green-300 text-xs shrink-0"><Check className="h-3 w-3 mr-1" />Connected</Badge>
                ) : (
                  <Button variant="outline" size="sm" className="cursor-pointer text-xs shrink-0"
                    onClick={async () => { await supabase.auth.linkIdentity({ provider: "facebook", options: { redirectTo: `${window.location.origin}/auth/callback` } }); }}>
                    Connect
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Notifications */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-green-700 shrink-0" />
              <div>
                <h2 className="text-base sm:text-xl font-bold text-gray-900">Notifications</h2>
                <p className="text-xs sm:text-sm text-gray-600">Choose how you want to be notified</p>
              </div>
            </div>
            <div className="space-y-3">
              {(
                [
                  { key: "email_messages",   label: "Messages",   desc: "New messages from other users" },
                  { key: "email_payments",   label: "Payments",   desc: "Payment received & wallet updates" },
                  { key: "email_listings",   label: "Bookings",   desc: "Booking requests, accepted & completed" },
                  { key: "email_complaints", label: "Complaints", desc: "Disputes & complaint notifications" },
                ] as { key: keyof typeof emailPrefs; label: string; desc: string }[]
              ).map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{label}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{desc}</p>
                  </div>
                  <Toggle checked={emailPrefs[key]} onChange={() => setEmailPrefs(prev => ({ ...prev, [key]: !prev[key] }))} />
                </div>
              ))}
            </div>
          </Card>

          {/* Language & Region */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-green-700 shrink-0" />
              <div>
                <h2 className="text-base sm:text-xl font-bold text-gray-900">Language & Region</h2>
                <p className="text-xs sm:text-sm text-gray-600">Set your preferred language and region</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block text-sm">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="cursor-pointer text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en" className="cursor-pointer">🇬🇧 English</SelectItem>
                    <SelectItem value="fr" className="cursor-pointer">🇫🇷 Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block text-sm">Region</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger className="cursor-pointer text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CA" className="cursor-pointer">🇨🇦 Canada</SelectItem>
                    <SelectItem value="US" className="cursor-pointer">🇺🇸 United States</SelectItem>
                    <SelectItem value="FR" className="cursor-pointer">🇫🇷 France</SelectItem>
                    <SelectItem value="BE" className="cursor-pointer">🇧🇪 Belgium</SelectItem>
                    <SelectItem value="CH" className="cursor-pointer">🇨🇭 Switzerland</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Billing & Payments */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-green-700 shrink-0" />
              <div>
                <h2 className="text-base sm:text-xl font-bold text-gray-900">Billing & Payments</h2>
                <p className="text-xs sm:text-sm text-gray-600">Manage your payment methods</p>
              </div>
            </div>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-between cursor-pointer text-sm" onClick={() => goToScreen("paymentMethods")}>
                <span>Payment Methods</span><ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between cursor-pointer text-sm" onClick={() => goToScreen("billingHistory")}>
                <span>Billing History</span><ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Save Button */}
          <Button
            className="w-full bg-green-700 hover:bg-green-800 text-white cursor-pointer h-12 text-sm sm:text-base"
            onClick={saveSettings}
            disabled={savingSettings}
          >
            {savingSettings ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Saving...
              </span>
            ) : settingsSaved ? (
              <span className="flex items-center gap-2"><Check className="h-5 w-5" /> Settings Saved!</span>
            ) : "Save Settings"}
          </Button>

          <div className="h-px bg-gray-200" />

          {/* Danger Zone */}
          <Card className="p-4 sm:p-6 border-red-200">
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-between border-red-200 text-red-600 hover:bg-red-50 cursor-pointer text-sm" onClick={() => goToScreen("logout")}>
                <span className="flex items-center gap-2"><LogOut className="h-4 w-4" />Logout</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between border-red-200 text-red-600 hover:bg-red-50 cursor-pointer text-sm" onClick={() => goToScreen("deleteAccount")}>
                <span className="flex items-center gap-2"><Trash2 className="h-4 w-4" />Delete Account</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-3">
              Deleting your {isPerson ? "account" : "company account"} is permanent and cannot be undone.
            </p>
          </Card>

        </div>
      </div>
    </div>
  );
}

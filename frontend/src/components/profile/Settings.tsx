import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X, TriangleAlert } from 'lucide-react';
import ProfilePictureUploader from "@/components/profile/ProfilePicture";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabaseClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User, Lock, Bell, Shield, Globe, Link2,
  LogOut, Trash2, ChevronRight, Mail, Phone,
  MapPin, Building2, Briefcase, Users, Check,
  CreditCard,
} from "lucide-react";

// ─── Toggle Component ─────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange }) => (
  <div
    className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${checked ? "bg-green-700" : "bg-gray-300"} relative flex-shrink-0`}
    onClick={onChange}
  >
    <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${checked ? "translate-x-6" : "translate-x-0.5"}`} />
  </div>
);

// ─── Main SettingsPage ────────────────────────────────────────────────────────
export default function SettingsPage({ onClose, scrollRef }) {
  const { user, session } = useAuth();
  const [userProfilePicture, setUserProfilePicture] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState("default");
  const [scrollPosition, setScrollPosition] = useState(0);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const [notifications, setNotifications] = useState({
    email: true, sms: false, push: true, marketing: false,
  });
  const [language, setLanguage] = useState("en");
  const [region, setRegion] = useState("CA");
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);

  const goToScreen = (screenName: string) => {
    if (scrollRef?.current) setScrollPosition(scrollRef.current.scrollTop);
    setScreen(screenName);
  };

  const goBack = () => {
    setScreen("default");
    setTimeout(() => {
      if (scrollRef?.current) scrollRef.current.scrollTop = scrollPosition;
    }, 0);
  };

  // ── Fetch profile + settings + connected accounts
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.access_token) return;
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/me`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
          setUserProfilePicture(data.avatar || "");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    const fetchSettings = async () => {
      if (!session?.access_token) return;
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/settings`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.notifications) setNotifications(prev => ({ ...prev, ...data.notifications }));
          if (data.language) setLanguage(data.language);
          if (data.region) setRegion(data.region);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchConnectedAccounts = async () => {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (supabaseUser?.identities) {
        setConnectedAccounts(supabaseUser.identities);
      }
    };

    fetchProfile();
    fetchSettings();
    fetchConnectedAccounts();
  }, [session]);

  useEffect(() => {
    if (scrollRef?.current) scrollRef.current.scrollTop = 0;
  }, [screen]);

  // ── Save settings to DB
  const saveSettings = async () => {
    if (!session?.access_token) return;
    setSavingSettings(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ notifications, language, region }),
      });
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

  // ── Sub-page routing
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
        <button onClick={onClose} className="text-gray-500 hover:text-gray-900 text-xl absolute top-4 right-4 cursor-pointer">✕</button>
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            {isCompany && (
              <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                <Building2 className="h-3 w-3 mr-1" />Company Account
              </Badge>
            )}
          </div>
          <p className="text-gray-600 mt-1">Manage your {isPerson ? "account" : "company"} settings and preferences</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid gap-6">

          {/* ── Profile Information */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                {isPerson ? <User className="h-6 w-6 text-green-700" /> : <Building2 className="h-6 w-6 text-green-700" />}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{isPerson ? "Profile Information" : "Company Information"}</h2>
                  <p className="text-sm text-gray-600">Update your {isPerson ? "personal" : "company"} details and profile picture</p>
                </div>
              </div>
              <Link href="/profile/edit">
                <Button variant="outline" size="sm" className="cursor-pointer">
                  Edit Profile <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <ProfilePictureUploader
                currentProfilePicture={userProfilePicture}
                userName={displayName || "User"}
                onProfileChange={(newPic) => setUserProfilePicture(newPic)}
                size="xl"
                showLabel={false}
                readOnly={true}
              />
              <div className="flex-1 space-y-3 my-6">
                <div className="flex items-center gap-3 text-gray-700">
                  {isPerson ? <User className="h-4 w-4 text-gray-400" /> : <Building2 className="h-4 w-4 text-gray-400" />}
                  <span className="font-medium">{displayName}</span>
                  {isCompany && <span className="text-xs text-gray-500">(Company Name)</span>}
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{profileData?.email || "No email provided"}</span>
                </div>
                {profileData?.phone && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{profileData.phone}</span>
                  </div>
                )}
                {profileData?.city && profileData?.province && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{profileData.city}, {profileData.province}</span>
                  </div>
                )}
                {isPerson && profileData?.profession && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span>{profileData.profession}</span>
                  </div>
                )}
                {isCompany && profileData?.industry && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span>{profileData.industry}</span>
                  </div>
                )}
                {isCompany && profileData?.team_size && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>{profileData.team_size} employees</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* ── Password & Security */}
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Lock className="h-6 w-6 text-green-700" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Password & Security</h2>
                <p className="text-sm text-gray-600">Manage your password and blocked users</p>
              </div>
            </div>
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-between cursor-pointer" onClick={() => goToScreen("changePassword")}>
                <span>Change Password</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between cursor-pointer" onClick={() => goToScreen("blockedUsers")}>
                <span>Blocked Users</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* ── Connected Accounts */}
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Link2 className="h-6 w-6 text-green-700" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Connected Accounts</h2>
                <p className="text-sm text-gray-600">Manage your linked sign-in methods</p>
              </div>
            </div>
            <div className="space-y-3">
              {/* Email */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Email & Password</p>
                    <p className="text-sm text-gray-500">{profileData?.email}</p>
                  </div>
                </div>
                {isEmailConnected ? (
                  <Badge className="bg-green-100 text-green-700 border-green-300">
                    <Check className="h-3 w-3 mr-1" />Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-500">Not connected</Badge>
                )}
              </div>

              {/* Google */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Google</p>
                    <p className="text-sm text-gray-500">Sign in with Google</p>
                  </div>
                </div>
                {isGoogleConnected ? (
                  <Badge className="bg-green-100 text-green-700 border-green-300">
                    <Check className="h-3 w-3 mr-1" />Connected
                  </Badge>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer text-xs"
                    onClick={async () => {
                      await supabase.auth.linkIdentity({
                        provider: 'google',
                        options: { redirectTo: `${window.location.origin}/auth/callback` }
                      });
                    }}
                  >
                    Connect
                  </Button>
                )}
              </div>

              {/* Facebook */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center">
                    <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Facebook</p>
                    <p className="text-sm text-gray-500">Sign in with Facebook</p>
                  </div>
                </div>
                {isFacebookConnected ? (
                  <Badge className="bg-green-100 text-green-700 border-green-300">
                    <Check className="h-3 w-3 mr-1" />Connected
                  </Badge>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer text-xs"
                    onClick={async () => {
                      await supabase.auth.linkIdentity({
                        provider: 'facebook',
                        options: { redirectTo: `${window.location.origin}/auth/callback` }
                      });
                    }}
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* ── Notifications */}
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Bell className="h-6 w-6 text-green-700" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                <p className="text-sm text-gray-600">Choose how you want to be notified</p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { key: "email", label: "Email Notifications", desc: "Receive updates via email" },
                { key: "sms", label: "SMS Notifications", desc: "Get text messages for important updates" },
                { key: "push", label: "Push Notifications", desc: "Receive notifications on your device" },
                { key: "marketing", label: "Marketing Emails", desc: "Receive tips, offers, and updates" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{label}</p>
                    <p className="text-sm text-gray-600">{desc}</p>
                  </div>
                  <Toggle
                    checked={notifications[key]}
                    onChange={() => setNotifications(prev => ({ ...prev, [key]: !prev[key] }))}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* ── Language & Region */}
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Globe className="h-6 w-6 text-green-700" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Language & Region</h2>
                <p className="text-sm text-gray-600">Set your preferred language and region</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en" className="cursor-pointer">🇬🇧 English</SelectItem>
                    <SelectItem value="fr" className="cursor-pointer">🇫🇷 Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block">Region</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
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

          {/* ── Billing & Payments */}
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <CreditCard className="h-6 w-6 text-green-700" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Billing & Payments</h2>
                <p className="text-sm text-gray-600">Manage your payment methods</p>
              </div>
            </div>
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-between cursor-pointer" onClick={() => goToScreen("paymentMethods")}>
                <span>Payment Methods</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between cursor-pointer" onClick={() => goToScreen("billingHistory")}>
                <span>Billing History</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* ── Save Button */}
          <Button
            className="w-full bg-green-700 hover:bg-green-800 text-white cursor-pointer h-12 text-base"
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
              <span className="flex items-center gap-2">
                <Check className="h-5 w-5" /> Settings Saved!
              </span>
            ) : (
              "Save Settings"
            )}
          </Button>

          <div className="h-px bg-gray-200" />

          {/* ── Danger Zone */}
          <Card className="p-6 border-red-200">
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-between border-red-200 text-red-600 hover:bg-red-50 cursor-pointer" onClick={() => goToScreen("logout")}>
                <span className="flex items-center gap-2"><LogOut className="h-4 w-4" />Logout</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between border-red-200 text-red-600 hover:bg-red-50 cursor-pointer" onClick={() => goToScreen("deleteAccount")}>
                <span className="flex items-center gap-2"><Trash2 className="h-4 w-4" />Delete Account</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Deleting your {isPerson ? "account" : "company account"} is permanent and cannot be undone. All your data will be removed.
            </p>
          </Card>

        </div>
      </div>
    </div>
  );
}

// ─── ChangePasswordPage ───────────────────────────────────────────────────────
function ChangePasswordPage({ onBack, onClose }) {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

  const validateForm = () => {
    const newErrors = { oldPassword: "", newPassword: "", confirmPassword: "" };
    if (!formData.oldPassword) newErrors.oldPassword = "Current password is required";
    if (!formData.newPassword) newErrors.newPassword = "New password is required";
    else if (formData.newPassword.length < 8) newErrors.newPassword = "Password must be at least 8 characters";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (formData.oldPassword === formData.newPassword) newErrors.newPassword = "New password must be different from current password";
    setErrors(newErrors);
    return !Object.values(newErrors).some(e => e !== "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ oldPassword: formData.oldPassword, newPassword: formData.newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to change password");
      setSuccess(true);
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => onBack(), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50">
      <div className="bg-white border-b relative">
        <button onClick={onClose} className="absolute top-1 right-4 text-xl cursor-pointer">✕</button>
        <button onClick={onBack} className="absolute top-1 left-4 text-gray-600 cursor-pointer">← Back</button>
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Change Password</h1>
          <p className="text-gray-600 mt-1">Update your account password</p>
        </div>
      </div>
      <div className="mx-auto px-4 py-8">
        <Card className="p-6 mx-auto">
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">Password changed successfully!</p>
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="oldPassword" className="pb-2">Current Password</Label>
              <Input id="oldPassword" type="password" value={formData.oldPassword}
                onChange={(e) => { setFormData({ ...formData, oldPassword: e.target.value }); setErrors({ ...errors, oldPassword: "" }); }}
                className={errors.oldPassword ? "border-red-500" : ""} disabled={loading} />
              {errors.oldPassword && <p className="text-xs text-red-500 mt-1">{errors.oldPassword}</p>}
            </div>
            <div>
              <Label htmlFor="newPassword" className="pb-2">New Password</Label>
              <Input id="newPassword" type="password" value={formData.newPassword}
                onChange={(e) => { setFormData({ ...formData, newPassword: e.target.value }); setErrors({ ...errors, newPassword: "" }); }}
                className={errors.newPassword ? "border-red-500" : ""} disabled={loading} />
              {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>}
              <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="pb-2">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" value={formData.confirmPassword}
                onChange={(e) => { setFormData({ ...formData, confirmPassword: e.target.value }); setErrors({ ...errors, confirmPassword: "" }); }}
                className={errors.confirmPassword ? "border-red-500" : ""} disabled={loading} />
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>
            <Button type="submit" className="w-full bg-green-700 text-white hover:bg-green-800 cursor-pointer" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

// ─── BlockedUsersPage ─────────────────────────────────────────────────────────
function BlockedUsersPage({ onBack, onClose }) {
  const { user } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unblocking, setUnblocking] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      if (!user) return;
      try {
        const { data: blocks, error: blocksError } = await supabase
          .from('blocked_users').select('blocked_user_id, created_at')
          .eq('blocker_id', user.id).order('created_at', { ascending: false });
        if (blocksError) throw blocksError;
        if (blocks && blocks.length > 0) {
          const userPromises = blocks.map(async (b) => {
            try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/${b.blocked_user_id}`);
              if (response.ok) {
                const userData = await response.json();
                return {
                  id: b.blocked_user_id,
                  name: userData.account_type === 'person' ? userData.full_name : userData.company_name,
                  avatar: userData.avatar,
                  account_type: userData.account_type,
                  blocked_at: b.created_at,
                };
              }
              return null;
            } catch { return null; }
          });
          const users = await Promise.all(userPromises);
          setBlockedUsers(users.filter(u => u !== null));
        }
      } catch (err) {
        console.error('Error fetching blocked users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlockedUsers();
  }, [user]);

  const handleUnblock = async (userId: string) => {
    if (!user) return;
    const confirmed = window.confirm("Are you sure you want to unblock this user?");
    if (!confirmed) return;
    setUnblocking(userId);
    try {
      const { error } = await supabase.from('blocked_users').delete()
        .eq('blocker_id', user.id).eq('blocked_user_id', userId);
      if (error) throw error;
      setBlockedUsers(blockedUsers.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Error unblocking user:', err);
    } finally {
      setUnblocking(null);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b relative">
        <button onClick={onClose} className="absolute top-1 cursor-pointer right-4 text-xl">✕</button>
        <button onClick={onBack} className="absolute top-1 cursor-pointer left-4 text-gray-600">← Back</button>
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Blocked Users</h1>
          <p className="text-gray-600 mt-1">
            {blockedUsers.length === 0 ? "You haven't blocked anyone yet" : `You have blocked ${blockedUsers.length} user${blockedUsers.length > 1 ? 's' : ''}`}
          </p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700" />
          </div>
        ) : blockedUsers.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <Shield className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No Blocked Users</h3>
            <p className="text-gray-600">Users you block will appear here. You can unblock them at any time.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {blockedUsers.map((blockedUser) => (
              <Card key={blockedUser.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-gray-200">
                      <AvatarImage src={blockedUser.avatar} alt={blockedUser.name} />
                      <AvatarFallback className="bg-gray-100 text-gray-600">{blockedUser.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{blockedUser.name}</p>
                        {blockedUser.account_type === 'company' && (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                            <Building2 className="h-2.5 w-2.5 mr-1" />Company
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Blocked {new Date(blockedUser.blocked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="cursor-pointer hover:bg-green-50 hover:border-green-600 hover:text-green-600"
                    onClick={() => handleUnblock(blockedUser.id)} disabled={unblocking === blockedUser.id}>
                    {unblocking === blockedUser.id ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Unblocking...
                      </span>
                    ) : 'Unblock'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PaymentMethodsPage ───────────────────────────────────────────────────────
function PaymentMethodsPage({ onBack, onClose }) {
  return (
    <div className="bg-gray-50">
      <div className="bg-white border-b relative">
        <button onClick={onClose} className="absolute top-1 cursor-pointer right-4 text-xl">✕</button>
        <button onClick={onBack} className="absolute top-1 cursor-pointer left-4 text-gray-600">← Back</button>
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
        </div>
      </div>
      <div className="mx-auto px-4 py-8 space-y-4">
        <Card className="p-6">Coming soon...</Card>
      </div>
    </div>
  );
}

// ─── BillingHistoryPage ───────────────────────────────────────────────────────
function BillingHistoryPage({ onBack, onClose }) {
  return (
    <div className="bg-gray-50">
      <div className="bg-white border-b relative">
        <button onClick={onClose} className="absolute top-1 cursor-pointer right-4 text-xl">✕</button>
        <button onClick={onBack} className="absolute top-1 cursor-pointer left-4 text-gray-600">← Back</button>
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Billing History</h1>
        </div>
      </div>
      <div className="mx-auto px-4 py-8 space-y-4">
        <Card className="p-6">Coming soon...</Card>
      </div>
    </div>
  );
}

// ─── LogoutPage ───────────────────────────────────────────────────────────────
function LogoutPage({ onBack, onClose }) {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50">
      <div className="bg-white border-b relative">
        <button onClick={onClose} className="absolute top-1 cursor-pointer right-4 text-xl">✕</button>
        <button onClick={onBack} className="absolute top-1 cursor-pointer left-4 text-gray-600">← Back</button>
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Logout</h1>
        </div>
      </div>
      <div className="mx-auto px-4 py-8 space-y-4">
        <Card className="p-6 space-y-4">
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="cursor-pointer flex-1" onClick={onBack} disabled={loading}>Cancel</Button>
            <Button className="bg-red-600 text-white hover:bg-red-700 cursor-pointer flex-1" onClick={handleLogout} disabled={loading}>
              {loading ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── DeleteAccountPage ────────────────────────────────────────────────────────
function DeleteAccountPage({ onBack, onClose }) {
  const { session, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const handleDelete = async () => {
    if (confirmText !== "DELETE") { setError("Please type DELETE to confirm"); return; }
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/delete-account`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete account");
      await signOut();
    } catch (err) {
      console.error("Delete account error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-xl text-gray-500 hover:text-gray-900 cursor-pointer">✕</button>
        <button onClick={onBack} className="absolute top-4 left-4 text-gray-600 hover:text-gray-900 cursor-pointer flex items-center gap-2">← Back</button>
        <div className="max-w-3xl mx-auto px-4 py-6 text-center">
          <h1 className="text-3xl font-bold text-red-600">Delete Account</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="p-8 border-2 border-red-200 shadow-lg">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <TriangleAlert className="w-10 h-10 text-red-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Permanent Account Deletion</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-2">
            <p className="text-gray-800 text-center leading-relaxed">
              Deleting your account is <span className="font-bold text-red-600">permanent and irreversible</span>. All your data will be permanently removed, including:
            </p>
          </div>
          <div className="space-y-3 mb-6">
            {["Your profile and account information", "All messages and conversations", "Services and listings", "Bookings and transaction history", "Reviews and ratings"].map((item) => (
              <div key={item} className="flex items-start gap-3 text-gray-700">
                <span className="text-red-500 font-bold"><X /></span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg">
              <p className="text-red-800 text-sm text-center font-medium">{error}</p>
            </div>
          )}
          <div className="mb-2">
            <Label htmlFor="confirmText" className="block text-center mb-3 text-gray-700 font-medium">
              To confirm, please type <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded">DELETE</span>
            </Label>
            <Input
              id="confirmText" type="text" value={confirmText}
              onChange={(e) => { setConfirmText(e.target.value); setError(""); }}
              disabled={loading} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
              className={`text-center font-mono text-lg uppercase tracking-wider ${confirmText && confirmText !== "DELETE" ? "border-red-300" : ""}`}
            />
            {confirmText && confirmText !== "DELETE" && (
              <p className="text-xs text-red-500 text-center mt-2">Please type exactly: DELETE</p>
            )}
          </div>
          <div className="flex gap-4 w-full">
            <Button variant="outline" className="w-auto flex-1 cursor-pointer" onClick={onBack} disabled={loading}>Cancel</Button>
            <Button
              className={`w-auto cursor-pointer flex-1 transition-all ${confirmText === "DELETE" && !loading ? "bg-red-600 hover:bg-red-700 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
              onClick={handleDelete} disabled={loading || confirmText !== "DELETE"}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Deleting...
                </span>
              ) : "Delete My Account Permanently"}
            </Button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">This action cannot be undone. Your account will be deleted immediately.</p>
        </Card>
      </div>
    </div>
  );
}
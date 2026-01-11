import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label} from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X, TriangleAlert  } from 'lucide-react';
import ProfilePictureUploader from "@/components/profile/ProfilePicture";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Lock,
  Bell,
  Shield,
  CreditCard,
  BarChart3,
  LogOut,
  Trash2,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  Users,
} from "lucide-react";

export default function SettingsPage({ onClose, scrollRef }) {
  const { user, session } = useAuth();
  const [userProfilePicture, setUserProfilePicture] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState("default");
  const [scrollPosition, setScrollPosition] = useState(0);

const goToScreen = (screenName: string) => {
  // Sauvegarder la position actuelle avant de changer d'écran
  if (scrollRef?.current) {
    setScrollPosition(scrollRef.current.scrollTop);
  }
  setScreen(screenName);
};

const goBack = () => {
  setScreen("default");
  setTimeout(() => {
    if (scrollRef?.current) {
      scrollRef.current.scrollTop = scrollPosition;
    }
  }, 0);
};

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.access_token) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/profiles/me`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
          setUserProfilePicture(data.avatar || "");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

  useEffect(() => {
    if (scrollRef?.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [screen]);

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
  });

  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showReviews: true,
    showLocation: false,
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    loginAlerts: true,
  });

  const toggleNotification = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const togglePrivacy = (key) => {
    setPrivacy({ ...privacy, [key]: !privacy[key] });
  };

  const toggleSecurity = (key) => {
    setSecurity({ ...security, [key]: !security[key] });
  };

  const Toggle = ({ checked }) => (
    <div
      className={`w-12 h-6 rounded-full transition-colors ${
        checked ? "bg-green-700" : "bg-gray-300"
      } relative`}
    >
      <div
        className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
          checked ? "translate-x-6" : "translate-x-0.5"
        }`}
      ></div>
    </div>
  );

  useEffect(() => {
    localStorage.setItem("fh_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("fh_privacy", JSON.stringify(privacy));
  }, [privacy]);

  useEffect(() => {
    localStorage.setItem("fh_security", JSON.stringify(security));
  }, [security]);

  if (screen === "changePassword")
    return (
      <ChangePasswordPage onBack={goBack} onClose={onClose} />
    );
  if (screen === "blockedUsers")
    return (
      <BlockedUsersPage onBack={goBack} onClose={onClose} />
    );
  if (screen === "paymentMethods")
    return (
      <PaymentMethodsPage onBack={goBack} onClose={onClose} />
    );
  if (screen === "billingHistory")
    return (
      <BillingHistoryPage onBack={goBack} onClose={onClose} />
    );
  if (screen === "logout")
    return <LogoutPage onBack={goBack} onClose={onClose} />;
  if (screen === "deleteAccount")
    return (
      <DeleteAccountPage onBack={goBack} onClose={onClose} />
    );

  // Déterminer le type de compte
  const isPerson = profileData?.account_type === "person";
  const isCompany = profileData?.account_type === "company";
  const displayName = isPerson
    ? profileData?.full_name
    : profileData?.company_name;

  if (loading) {
    return (
      <div className="bg-gray-50 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="bg-white border-b relative">
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-900 text-xl absolute top-4 right-4 cursor-pointer"
        >
          ✕
        </button>
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            {isCompany && (
              <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                <Building2 className="h-3 w-3 mr-1" />
                Company Account
              </Badge>
            )}
          </div>
          <p className="text-gray-600 mt-1">
            Manage your {isPerson ? "account" : "company"} settings and preferences
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Profile Information */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                {isPerson ? (
                  <User className="h-6 w-6 text-green-700" />
                ) : (
                  <Building2 className="h-6 w-6 text-green-700" />
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {isPerson ? "Profile Information" : "Company Information"}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Update your {isPerson ? "personal" : "company"} details and
                    profile picture
                  </p>
                </div>
              </div>
              <Link href="/profile/edit">
                <Button variant="outline" size="sm" className="cursor-pointer">
                  Edit Profile
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex flex-col items-start gap-3">
                <ProfilePictureUploader
                  currentProfilePicture={userProfilePicture}
                  userName={displayName || "User"}
                  onProfileChange={(newProfilePicture) =>
                    setUserProfilePicture(newProfilePicture)
                  }
                  size="xl"
                  showLabel={false}
                  readOnly={true}
                />
              </div>

              <div className="flex-1 space-y-3 my-6">
                {/* Name - Different icon based on account type */}
                <div className="flex items-center gap-3 text-gray-700">
                  {isPerson ? (
                    <User className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Building2 className="h-4 w-4 text-gray-400" />
                  )}
                  <div>
                    <span className="font-medium">{displayName}</span>
                    {isCompany && (
                      <span className="text-xs text-gray-500 ml-2">
                        (Company Name)
                      </span>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{profileData?.email || "No email provided"}</span>
                </div>

                {/* Phone */}
                {profileData?.phone && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{profileData.phone}</span>
                  </div>
                )}

                {/* Location */}
                {profileData?.city && profileData?.province && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>
                      {profileData.city}, {profileData.province}
                    </span>
                  </div>
                )}

                {/* Profession (Person only) */}
                {isPerson && profileData?.profession && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span>{profileData.profession}</span>
                  </div>
                )}

                {/* Industry (Company only) */}
                {isCompany && profileData?.industry && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span>{profileData.industry}</span>
                  </div>
                )}

                {/* Team Size (Company only) */}
                {isCompany && profileData?.team_size && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>{profileData.team_size} employees</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Password & Security */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <Lock className="h-6 w-6 text-green-700" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Password & Security
                  </h2>
                  <p className="text-sm text-gray-600">
                    Manage your password and security preferences
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-between cursor-pointer"
                onClick={() => goToScreen("changePassword")}
              >
                <span>Change Password</span>
                <ChevronRight className="h-4 w-4" />
              </Button>

              <div
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleSecurity("twoFactor")}
              >
                <div>
                  <p className="font-medium text-gray-900">
                    Two-Factor Authentication
                  </p>
                  <p className="text-sm text-gray-600">
                    Add an extra layer of security
                  </p>
                </div>
                <Toggle checked={security.twoFactor} />
              </div>

              <div
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleSecurity("loginAlerts")}
              >
                <div>
                  <p className="font-medium text-gray-900">Login Alerts</p>
                  <p className="text-sm text-gray-600">Get notified of new logins</p>
                </div>
                <Toggle checked={security.loginAlerts} />
              </div>
            </div>
          </Card>

          {/* Notifications */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <Bell className="h-6 w-6 text-green-700" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                  <p className="text-sm text-gray-600">
                    Choose how you want to be notified
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleNotification("email")}
              >
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive updates via email</p>
                </div>
                <Toggle checked={notifications.email} />
              </div>

              <div
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleNotification("sms")}
              >
                <div>
                  <p className="font-medium text-gray-900">SMS Notifications</p>
                  <p className="text-sm text-gray-600">
                    Get text messages for important updates
                  </p>
                </div>
                <Toggle checked={notifications.sms} />
              </div>

              <div
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleNotification("push")}
              >
                <div>
                  <p className="font-medium text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-600">
                    Receive notifications on your device
                  </p>
                </div>
                <Toggle checked={notifications.push} />
              </div>

              <div
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleNotification("marketing")}
              >
                <div>
                  <p className="font-medium text-gray-900">Marketing Emails</p>
                  <p className="text-sm text-gray-600">
                    Receive tips, offers, and updates
                  </p>
                </div>
                <Toggle checked={notifications.marketing} />
              </div>
            </div>
          </Card>

          {/* Privacy & Visibility */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <Shield className="h-6 w-6 text-green-700" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Privacy & Visibility
                  </h2>
                  <p className="text-sm text-gray-600">
                    Control who can see your information
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => togglePrivacy("showProfile")}
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {isPerson ? "Public Profile" : "Public Company Profile"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Make your profile visible to everyone
                  </p>
                </div>
                <Toggle checked={privacy.showProfile} />
              </div>

              <div
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => togglePrivacy("showReviews")}
              >
                <div>
                  <p className="font-medium text-gray-900">Show Reviews</p>
                  <p className="text-sm text-gray-600">
                    Display reviews on your profile
                  </p>
                </div>
                <Toggle checked={privacy.showReviews} />
              </div>

              <div
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => togglePrivacy("showLocation")}
              >
                <div>
                  <p className="font-medium text-gray-900">Show Exact Location</p>
                  <p className="text-sm text-gray-600">
                    {isPerson
                      ? "Display your precise address"
                      : "Display your company's precise address"}
                  </p>
                </div>
                <Toggle checked={privacy.showLocation} />
              </div>

              <Button
                variant="outline"
                className="w-full justify-between cursor-pointer"
                onClick={() => goToScreen("blockedUsers")}
              >
                <span>Blocked Users</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Billing & Payments */}
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <CreditCard className="h-6 w-6 text-green-700" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Billing & Payments
                  </h2>
                  <p className="text-sm text-gray-600">
                    Manage your payment methods
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-between cursor-pointer"
                onClick={() => goToScreen("paymentMethods")}
              >
                <span>Payment Methods</span>
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between cursor-pointer"
                onClick={() => goToScreen("billingHistory")}
              >
                <span>Billing History</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Dashboard & Analytics */}
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <BarChart3 className="h-6 w-6 text-green-700" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Dashboard & Analytics
                  </h2>
                  <p className="text-sm text-gray-600">
                    View your {isPerson ? "performance" : "company's performance"} and
                    insights
                  </p>
                </div>
              </div>
            </div>

            <Button className="w-full bg-green-700 hover:bg-green-800 text-white cursor-pointer">
              Go to Dashboard
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </Card>

          <div className="h-px bg-gray-200 my-4" />

          {/* Danger Zone */}
          <Card className="p-6 border-red-200">
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-between border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                onClick={() => goToScreen("logout")}
              >
                <span className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                onClick={() => goToScreen("deleteAccount")}
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Deleting your {isPerson ? "account" : "company account"} is permanent
              and cannot be undone. All your data will be removed.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Sub-pages remain the same
function ChangePasswordPage({ onBack, onClose }) {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const validateForm = () => {
    const newErrors = {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    if (!formData.oldPassword) {
      newErrors.oldPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.oldPassword === formData.newPassword) {
      newErrors.newPassword = "New password must be different from current password";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    console.log("🔍 Starting password change...");
    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
    console.log("Session token:", session?.access_token ? "EXISTS" : "MISSING");
    console.log("Form data:", { 
      oldPassword: "***", 
      newPassword: "***" 
    });

    if (!validateForm()) return;

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`;
      console.log("FETCH URL:", url);
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            oldPassword: formData.oldPassword,
            newPassword: formData.newPassword,
          }),
        }
      );

      console.log("STATUS:", response.status);
      console.log("Ok:", response.ok);

      const data = await response.json();
      console.log("📥 Response data:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      setSuccess(true);
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      
      // Fermer après 2 secondes
      setTimeout(() => {
        onBack();
      }, 2000);

    } catch (err: any) {
      console.error("❌ Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50">
      <div className="bg-white border-b relative">
        <button
          onClick={onClose}
          className="absolute top-1 right-4 text-xl cursor-pointer"
        >
          ✕
        </button>
        <button
          onClick={onBack}
          className="absolute top-1 left-4 text-gray-600 cursor-pointer"
        >
          ← Back
        </button>

        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Change Password</h1>
          <p className="text-gray-600 mt-1">Update your account password</p>
        </div>
      </div>

      <div className="mx-auto px-4 py-8">
        <Card className="p-6 mx-auto">
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
               Password changed successfully!
              </p>
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
              <Input
                id="oldPassword"
                type="password"
                value={formData.oldPassword}
                onChange={(e) => {
                  setFormData({ ...formData, oldPassword: e.target.value });
                  setErrors({ ...errors, oldPassword: "" });
                }}
                className={errors.oldPassword ? "border-red-500" : ""}
                disabled={loading}
              />
              {errors.oldPassword && (
                <p className="text-xs text-red-500 mt-1">{errors.oldPassword}</p>
              )}
            </div>

            <div>
              <Label htmlFor="newPassword" className="pb-2">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={(e) => {
                  setFormData({ ...formData, newPassword: e.target.value });
                  setErrors({ ...errors, newPassword: "" });
                }}
                className={errors.newPassword ? "border-red-500" : ""}
                disabled={loading}
              />
              {errors.newPassword && (
                <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters
              </p>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="pb-2">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value });
                  setErrors({ ...errors, confirmPassword: "" });
                }}
                className={errors.confirmPassword ? "border-red-500" : ""}
                disabled={loading}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-green-700 text-white hover:bg-green-800 cursor-pointer"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

function BlockedUsersPage({ onBack, onClose }) {
  const blocked = ["John Smith", "Emily Carter", "Mario Lopez"];

  return (
    <div className="bg-gray-50">
      <div className="bg-white border-b relative">
        <button
          onClick={onClose}
          className="absolute top-1 cursor-pointer right-4 text-xl"
        >
          ✕
        </button>
        <button
          onClick={onBack}
          className="absolute top-1 cursor-pointer left-4 text-gray-600"
        >
          ← Back
        </button>

        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Blocked Users</h1>
        </div>
      </div>

      <div className="mx-auto px-4 py-8 space-y-4">
        {blocked.map((u, i) => (
          <Card key={i} className="p-4 flex justify-between items-center">
            <span>{u}</span>
            <Button variant="outline" className="cursor-pointer">
              Unblock
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PaymentMethodsPage({ onBack, onClose }) {
  return (
    <div className="bg-gray-50">
      <div className="bg-white border-b relative">
        <button
          onClick={onClose}
          className="absolute top-1 cursor-pointer right-4 text-xl"
        >
          ✕
        </button>
        <button
          onClick={onBack}
          className="absolute top-1 cursor-pointer left-4 text-gray-600"
        >
          ← Back
        </button>

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

function BillingHistoryPage({ onBack, onClose }) {
  return (
    <div className="bg-gray-50">
      <div className="bg-white border-b relative">
        <button
          onClick={onClose}
          className="absolute top-1 cursor-pointer right-4 text-xl"
        >
          ✕
        </button>
        <button
          onClick={onBack}
          className="absolute top-1 cursor-pointer left-4 text-gray-600"
        >
          ← Back
        </button>

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
        <button
          onClick={onClose}
          className="absolute top-1 cursor-pointer right-4 text-xl"
        >
          ✕
        </button>
        <button
          onClick={onBack}
          className="absolute top-1 cursor-pointer left-4 text-gray-600"
        >
          ← Back
        </button>

        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Logout</h1>
        </div>
      </div>

      <div className="mx-auto px-4 py-8 space-y-4">
        <Card className="p-6 space-y-4">
          <div className="flex gap-3 w-full">
            <Button 
              variant="outline"
              className=" cursor-pointer flex-1"
              onClick={onBack}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              className=" bg-red-600 text-white hover:bg-red-700 cursor-pointer flex-1"
              onClick={handleLogout}
              disabled={loading}
            >
              {loading ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function DeleteAccountPage({ onBack, onClose }) {
  const { session, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const handleDelete = async () => {
    // Sécurité: l'utilisateur doit taper "DELETE" pour confirmer
    if (confirmText !== "DELETE") {
      setError("Please type DELETE to confirm");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/delete-account`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete account");
      }

      // Déconnecter l'utilisateur après suppression
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
      {/* Header */}
      <div className="bg-white border-b relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xl text-gray-500 hover:text-gray-900 cursor-pointer transition-colors"
        >
          ✕
        </button>
        <button
          onClick={onBack}
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors flex items-center gap-2"
        >
          ← <span>Back</span>
        </button>

        <div className="max-w-3xl mx-auto px-4 py-6 text-center">
          <h1 className="text-3xl font-bold text-red-600">Delete Account</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="p-8 border-2 border-red-200 shadow-lg">
          {/* Warning Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <TriangleAlert className="w-10 h-10 text-red-600"/>
            </div>
          </div>

          {/* Warning Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Permanent Account Deletion
          </h2>

          {/* Warning Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-2">
            <p className="text-gray-800 text-center leading-relaxed">
              Deleting your account is <span className="font-bold text-red-600">permanent and irreversible</span>. 
              All your data will be permanently removed, including:
            </p>
          </div>

          {/* List of what will be deleted */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 text-gray-700">
              <span className="text-red-500 font-bold"><X/></span>
              <span>Your profile and account information</span>
            </div>
            <div className="flex items-start gap-3 text-gray-700">
              <span className="text-red-500 font-bold"><X/></span>
              <span>All messages and conversations</span>
            </div>
            <div className="flex items-start gap-3 text-gray-700">
              <span className="text-red-500 font-bold"><X/></span>
              <span>Services and listings</span>
            </div>
            <div className="flex items-start gap-3 text-gray-700">
              <span className="text-red-500 font-bold"><X/></span>
              <span>Bookings and transaction history</span>
            </div>
            <div className="flex items-start gap-3 text-gray-700">
              <span className="text-red-500 font-bold"><X/></span>
              <span>Reviews and ratings</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg">
              <p className="text-red-800 text-sm text-center font-medium">
                {error}
              </p>
            </div>
          )}

          {/* Confirmation Input */}
          <div className="mb-2">
            <Label 
              htmlFor="confirmText" 
              className="block text-center mb-3 text-gray-700 font-medium"
            >
              To confirm, please type{" "}
              <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                DELETE
              </span>
            </Label>
            <Input
              id="confirmText"
              type="text"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                setError("");
              }}
              disabled={loading}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off" 
              spellCheck="false"
              className={`text-center font-mono text-lg uppercase tracking-wider ${
                confirmText && confirmText !== "DELETE" 
                  ? "border-red-300 focus:border-red-500" 
                  : ""
              }`}
            />
            {confirmText && confirmText !== "DELETE" && (
              <p className="text-xs text-red-500 text-center mt-2">
                Please type exactly: DELETE
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 w-full">
            <Button
              variant="outline"
              className="w-auto flex-1 cursor-pointer border-gray-300 hover:bg-gray-50"
              onClick={onBack}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              className={`w-auto cursor-pointer flex-1 transition-all ${
                confirmText === "DELETE" && !loading
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick={handleDelete}
              disabled={loading || confirmText !== "DELETE"}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                      fill="none"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Deleting...
                </span>
              ) : (
                "Delete My Account Permanently"
              )}
            </Button>
          </div>

          {/* Final warning */}
          <p className="text-xs text-gray-500 text-center mt-2">
            This action cannot be undone. Your account will be deleted immediately.
          </p>
        </Card>
      </div>
    </div>
  );
}
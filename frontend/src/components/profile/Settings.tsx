import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  const [notifications, setNotifications] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("fh_notifications");
      return saved
        ? JSON.parse(saved)
        : {
            email: true,
            sms: false,
            push: true,
            marketing: false,
          };
    }
  });

  const [privacy, setPrivacy] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("fh_privacy");
      return saved
        ? JSON.parse(saved)
        : {
            showProfile: true,
            showReviews: true,
            showLocation: false,
          };
    }
  });

  const [security, setSecurity] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("fh_security");
      return saved
        ? JSON.parse(saved)
        : {
            twoFactor: false,
            loginAlerts: true,
          };
    }
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
      <ChangePasswordPage onBack={() => setScreen("default")} onClose={onClose} />
    );
  if (screen === "blockedUsers")
    return (
      <BlockedUsersPage onBack={() => setScreen("default")} onClose={onClose} />
    );
  if (screen === "paymentMethods")
    return (
      <PaymentMethodsPage onBack={() => setScreen("default")} onClose={onClose} />
    );
  if (screen === "billingHistory")
    return (
      <BillingHistoryPage onBack={() => setScreen("default")} onClose={onClose} />
    );
  if (screen === "logout")
    return <LogoutPage onBack={() => setScreen("default")} onClose={onClose} />;
  if (screen === "deleteAccount")
    return (
      <DeleteAccountPage onBack={() => setScreen("default")} onClose={onClose} />
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
                  showLabel={true}
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
                onClick={() => setScreen("changePassword")}
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
                onClick={() => setScreen("blockedUsers")}
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
                onClick={() => setScreen("paymentMethods")}
              >
                <span>Payment Methods</span>
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between cursor-pointer"
                onClick={() => setScreen("billingHistory")}
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
                onClick={() => setScreen("logout")}
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
                onClick={() => setScreen("deleteAccount")}
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-3">
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
        </div>
      </div>

      <div className="mx-auto px-4 py-8 space-y-4">
        <Card className="p-6 space-y-4">
          <input
            type="password"
            placeholder="Old Password"
            className="w-full border rounded-lg p-3"
          />
          <input
            type="password"
            placeholder="New Password"
            className="w-full border rounded-lg p-3"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            className="w-full border rounded-lg p-3"
          />
          <Button className="w-full bg-green-700 text-white hover:bg-green-800 cursor-pointer">
            Update Password
          </Button>
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
          <p className="text-gray-700 flex justify-center font-medium text-2xl">
            Are you sure you want to logout?
          </p>
          <Button className="w-full bg-red-600 text-white hover:bg-red-700 cursor-pointer">
            Logout
          </Button>
        </Card>
      </div>
    </div>
  );
}

function DeleteAccountPage({ onBack, onClose }) {
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
          <h1 className="text-3xl font-bold text-red-600">Delete Account</h1>
        </div>
      </div>

      <div className="mx-auto px-4 py-8 space-y-4">
        <Card className="p-6 border-red-300 space-y-4">
          <p className="text-gray-700 flex justify-center font-medium text-lg text-center">
            Deleting your account is permanent. All your data, history, messages,
            and listings will be permanently removed.
          </p>

          <Button className="w-full bg-red-600 text-white hover:bg-red-700 cursor-pointer">
            Confirm Delete
          </Button>
        </Card>
      </div>
    </div>
  );
}
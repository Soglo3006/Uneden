import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProfilePictureUploader from "@/components/profile/ProfilePicture"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
User,
Lock,
Bell,
Shield,
CreditCard,
BarChart3,
LogOut,
Trash2,
Camera,
ChevronRight,
Mail,
Phone,
MapPin,
} from "lucide-react";

export default function SettingsPage({onClose}) {

    const [userProfilePicture, setUserProfilePicture] = useState("");


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
<div className={`w-12 h-6 rounded-full transition-colors ${checked ? 'bg-green-700' : 'bg-gray-300'} relative`}>
    <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${checked ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
</div>
);

return (
<div className="min-h-screen bg-gray-50">
    <div className="bg-white border-b relative">
        <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-900 text-xl absolute top-4 right-4"
        >
        ✕
        </button>
    <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
    </div>
    </div>


    <div className="max-w-5xl mx-auto px-4 py-8">
    <div className="grid gap-6">
        
        <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
            <User className="h-6 w-6 text-green-700" />
            <div>
                <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                <p className="text-sm text-gray-600">Update your personal details and profile picture</p>
            </div>
            </div>
            <Button variant="outline" size="sm">
            Edit Profile
            <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center gap-3">
            <ProfilePictureUploader
            currentProfilePicture={userProfilePicture}
            userName="Alexandre Booh Louha"
            onProfileChange={(newProfilePicture) => setUserProfilePicture(newProfilePicture)}
            size="md"
            showLabel={true}
            />
            </div>

            <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3 text-gray-700">
                <User className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Alexandre Booh Louha</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>alexandre@example.com</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>+1 (514) 123-4567</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>Toronto, ON</span>
            </div>
            </div>
        </div>
        </Card>

        <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
            <Lock className="h-6 w-6 text-green-700" />
            <div>
                <h2 className="text-xl font-bold text-gray-900">Password & Security</h2>
                <p className="text-sm text-gray-600">Manage your password and security preferences</p>
            </div>
            </div>
        </div>

        <div className="space-y-4">
            <Button variant="outline" className="w-full justify-between">
            <span>Change Password</span>
            <ChevronRight className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => toggleSecurity('twoFactor')}>
            <div>
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
            </div>
            <Toggle checked={security.twoFactor} />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => toggleSecurity('loginAlerts')}>
            <div>
                <p className="font-medium text-gray-900">Login Alerts</p>
                <p className="text-sm text-gray-600">Get notified of new logins</p>
            </div>
            <Toggle checked={security.loginAlerts} />
            </div>
        </div>
        </Card>

        <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
            <Bell className="h-6 w-6 text-green-700" />
            <div>
                <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                <p className="text-sm text-gray-600">Choose how you want to be notified</p>
            </div>
            </div>
        </div>

        <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => toggleNotification('email')}>
            <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive updates via email</p>
            </div>
            <Toggle checked={notifications.email} />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => toggleNotification('sms')}>
            <div>
                <p className="font-medium text-gray-900">SMS Notifications</p>
                <p className="text-sm text-gray-600">Get text messages for important updates</p>
            </div>
            <Toggle checked={notifications.sms} />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => toggleNotification('push')}>
            <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-600">Receive notifications on your device</p>
            </div>
            <Toggle checked={notifications.push} />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => toggleNotification('marketing')}>
            <div>
                <p className="font-medium text-gray-900">Marketing Emails</p>
                <p className="text-sm text-gray-600">Receive tips, offers, and updates</p>
            </div>
            <Toggle checked={notifications.marketing} />
            </div>
        </div>
        </Card>

        <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
            <Shield className="h-6 w-6 text-green-700" />
            <div>
                <h2 className="text-xl font-bold text-gray-900">Privacy & Visibility</h2>
                <p className="text-sm text-gray-600">Control who can see your information</p>
            </div>
            </div>
        </div>

        <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => togglePrivacy('showProfile')}>
            <div>
                <p className="font-medium text-gray-900">Public Profile</p>
                <p className="text-sm text-gray-600">Make your profile visible to everyone</p>
            </div>
            <Toggle checked={privacy.showProfile} />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => togglePrivacy('showReviews')}>
            <div>
                <p className="font-medium text-gray-900">Show Reviews</p>
                <p className="text-sm text-gray-600">Display reviews on your profile</p>
            </div>
            <Toggle checked={privacy.showReviews} />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => togglePrivacy('showLocation')}>
            <div>
                <p className="font-medium text-gray-900">Show Exact Location</p>
                <p className="text-sm text-gray-600">Display your precise address</p>
            </div>
            <Toggle checked={privacy.showLocation} />
            </div>

            <Button variant="outline" className="w-full justify-between">
            <span>Blocked Users</span>
            <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
        </Card>

        <Card className="p-6">
        <div className="flex items-start justify-between ">
            <div className="flex items-center gap-4">
            <CreditCard className="h-6 w-6 text-green-700" />
            <div>
                <h2 className="text-xl font-bold text-gray-900">Billing & Payments</h2>
                <p className="text-sm text-gray-600">Manage your payment methods</p>
            </div>
            </div>
        </div>

        <div className="space-y-4">

            <Button variant="outline" className="w-full justify-between">
            <span>Payment Methods</span>
            <ChevronRight className="h-4 w-4" />
            </Button>

            <Button variant="outline" className="w-full justify-between">
            <span>Billing History</span>
            <ChevronRight className="h-4 w-4" />
            </Button>

        </div>
        </Card>

        <Card className="p-6">
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
            <BarChart3 className="h-6 w-6 text-green-700" />
            <div>
                <h2 className="text-xl font-bold text-gray-900">Dashboard & Analytics</h2>
                <p className="text-sm text-gray-600">View your performance and insights</p>
            </div>
            </div>
        </div>

        <Button className="w-full bg-green-700 hover:bg-green-800 text-white">
            Go to Dashboard
            <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
        </Card>

        <div className="h-px bg-gray-200 my-4" />

        <Card className="p-6 border-red-200">
        <div className="space-y-3">
            <Button
            variant="outline"
            className="w-full justify-between border-red-200 text-red-600 hover:bg-red-50"
            >
            <span className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
            </span>
            <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
            variant="outline"
            className="w-full justify-between border-red-200 text-red-600 hover:bg-red-50"
            >
            <span className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Account
            </span>
            <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
        <p className="text-sm text-gray-500">
            Deleting your account is permanent and cannot be undone. All your data will be removed.
        </p>
        </Card>
    </div>
    </div>
</div>
);
}
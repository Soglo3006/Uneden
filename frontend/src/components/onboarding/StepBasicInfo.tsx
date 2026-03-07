"use client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ProfilePictureUploader from "@/components/profile/ProfilePicture";
import { OnboardingData } from "./onboardingTypes";

interface Props {
  data: OnboardingData;
  accountType: string;
  onChange: (patch: Partial<OnboardingData>) => void;
}

export default function StepBasicInfo({ data, accountType, onChange }: Props) {
  const handlePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, "");
    if (input.length > 3 && input.length <= 6) input = input.replace(/(\d{3})(\d+)/, "$1-$2");
    else if (input.length > 6) input = input.replace(/(\d{3})(\d{3})(\d+)/, "$1-$2-$3");
    onChange({ phone: input });
  };

  return (
    <Card className="p-6 sm:p-8 animate-in fade-in duration-300">
      <h2 className="text-xl font-bold text-gray-900 mb-0">Profile Picture & Basic Info</h2>
      <p className="text-gray-600">Let&apos;s start with the basics</p>

      <div className="space-y-6">
        {accountType === "person" && (
          <div>
            <div className="flex flex-col items-center">
              <ProfilePictureUploader
                currentProfilePicture={data.avatar}
                userName={data.fullName}
                onProfileChange={(pic) => onChange({ avatar: pic })}
                size="xl"
                showLabel={true}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-base font-medium text-gray-900">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={data.fullName || ""}
                onChange={(e) => onChange({ fullName: e.target.value })}
                className="h-12"
              />
            </div>
          </div>
        )}

        {accountType === "company" && (
          <div>
            <div className="flex flex-col items-center">
              <ProfilePictureUploader
                currentProfilePicture={data.avatar}
                userName={data.companyName}
                onProfileChange={(pic) => onChange({ avatar: pic })}
                size="xl"
                showLabel={true}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-base font-medium text-gray-900">Company Name</Label>
              <Input
                id="companyName"
                type="text"
                value={data.companyName || ""}
                onChange={(e) => onChange({ companyName: e.target.value })}
                className="h-12"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-base font-medium text-gray-900">
            {accountType === "company" ? "Company Email" : "Email"}
          </Label>
          <Input id="email" type="email" value={data.email} disabled className="h-12 bg-gray-50 cursor-not-allowed" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-base font-medium text-gray-900">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input id="phone" type="tel" placeholder="123-456-7890" value={data.phone} onChange={handlePhone} maxLength={12} className="h-12" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="adresse" className="text-base font-medium text-gray-900">
            Address <span className="text-red-500">*</span>
          </Label>
          <Input id="adresse" type="text" placeholder="123 Main St, Apt 4B" value={data.adresse} onChange={(e) => onChange({ adresse: e.target.value })} className="h-12" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ville" className="text-base font-medium text-gray-900">
            City <span className="text-red-500">*</span>
          </Label>
          <Input id="ville" type="text" placeholder="Montreal" value={data.ville} onChange={(e) => onChange({ ville: e.target.value })} className="h-12" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="province" className="text-base font-medium text-gray-900">
            Province <span className="text-red-500">*</span>
          </Label>
          <Input id="province" type="text" placeholder="Quebec" value={data.province} onChange={(e) => onChange({ province: e.target.value })} className="h-12" />
        </div>
      </div>
    </Card>
  );
}

"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { OnboardingData, professionSuggestions } from "./onboardingTypes";

interface Props {
  data: OnboardingData;
  accountType: string;
  onChange: (patch: Partial<OnboardingData>) => void;
}

export default function StepAbout({ data, accountType, onChange }: Props) {
  const [professionInput, setProfessionInput] = useState(data.profession || "");
  const [showSuggestions, setShowSuggestions] = useState(false);

  return (
    <Card className="p-6 sm:p-8 animate-in fade-in duration-300">
      <h2 className="text-xl font-bold text-gray-900">
        {accountType === "company" ? "Tell us about your company" : "Tell us about yourself"}
      </h2>
      <p className="text-gray-600">
        {accountType === "company"
          ? "Your company profile helps clients understand what you offer."
          : "Your bio helps customers understand who you are."}
      </p>

      <div className="space-y-6">
        {accountType === "person" && (
          <>
            <div className="space-y-2 relative">
              <Label className="text-base font-medium text-gray-900">
                Profession / Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="profession"
                type="text"
                placeholder="e.g., Electrician, Math Tutor, House Cleaner"
                value={professionInput}
                onChange={(e) => {
                  const v = e.target.value;
                  setProfessionInput(v);
                  onChange({ profession: v });
                  setShowSuggestions(!!v.trim());
                }}
                onFocus={() => { if (professionInput.trim()) setShowSuggestions(true); }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                className="h-12"
              />
              {showSuggestions && professionInput.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-md shadow-lg z-20 max-h-38 overflow-y-auto">
                  {professionSuggestions
                    .filter((p) => p.toLowerCase().includes(professionInput.toLowerCase()))
                    .slice(0, 6)
                    .map((s) => (
                      <div
                        key={s}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onMouseDown={() => {
                          setProfessionInput(s);
                          onChange({ profession: s });
                          setShowSuggestions(false);
                        }}
                      >
                        {s}
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-base font-medium text-gray-900">
                Bio <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="bio"
                placeholder="Tell potential customers about your experience, skills, and what makes you unique..."
                value={data.bio || ""}
                onChange={(e) => onChange({ bio: e.target.value })}
                className="min-h-40 resize-none"
              />
              <div className="flex justify-between text-xs">
                <span className={(data.bio?.length ?? 0) < 80 ? "text-red-500" : "text-gray-500"}>Minimum 80 characters</span>
                <span className={(data.bio?.length ?? 0) < 80 ? "text-red-500" : "text-gray-500"}>{data.bio?.length ?? 0} / 500</span>
              </div>
            </div>
          </>
        )}

        {accountType === "company" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="companyBio" className="text-base font-medium text-gray-900">
                Company Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="companyBio"
                placeholder="Describe your company, mission, experience, and what makes your services unique..."
                value={data.companyBio || ""}
                onChange={(e) => onChange({ companyBio: e.target.value })}
                className="min-h-40 resize-none"
              />
              <div className="flex justify-between text-xs">
                <span className={(data.companyBio?.length ?? 0) < 80 ? "text-red-500" : "text-gray-500"}>Minimum 80 characters</span>
                <span className={(data.companyBio?.length ?? 0) < 80 ? "text-red-500" : "text-gray-500"}>{data.companyBio?.length ?? 0} / 500</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry" className="text-base font-medium text-gray-900">
                Industry / Sector <span className="text-red-500">*</span>
              </Label>
              <Input
                id="industry"
                type="text"
                placeholder="e.g., Construction, Cleaning Services, Marketing"
                value={data.industry || ""}
                onChange={(e) => onChange({ industry: e.target.value })}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamSize" className="text-base font-medium text-gray-900">Team Size (Optional)</Label>
              <Input
                id="teamSize"
                type="text"
                placeholder="e.g., 1-5 employees"
                value={data.teamSize || ""}
                onChange={(e) => onChange({ teamSize: e.target.value })}
                className="h-12"
              />
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

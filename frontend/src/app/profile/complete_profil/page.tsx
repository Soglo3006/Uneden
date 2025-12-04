"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import getCroppedImg from "@/utils/cropImage";
import Cropper from "react-easy-crop";
import ProfilePictureUploader from "@/components/profile/ProfilePicture"
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select";
import {
Upload,
X,
Plus,
Trash2,
Camera,
Check,
ChevronRight,
ChevronLeft,
User,
FileText,
Languages,
Briefcase,
Image,
} from "lucide-react";

// Types
interface Language {
id: number;
language: string;
proficiency: string;
}

interface Experience {
id: number;
title: string;
company: string;
period: string;
description: string;
}

interface PortfolioItem {
id: number;
image: string;
title: string;
description: string;
}

interface OnboardingData {
// Step 1
avatar: string;
fullName: string;
email: string;
phone: string;
adresse: string;
ville: string;
province: string;

// Step 2
bio: string;
profession: string;
// Step 3
skills: string[];
languages: Language[];
// Step 4
experiences: Experience[];
// Step 5
portfolio: PortfolioItem[];
}

const languageOptions = [
"English",
"French",
"Spanish",
"Arabic",
"Mandarin",
"Portuguese",
"German",
"Italian",
"Japanese",
"Korean",
"Hindi",
"Russian",
];

const proficiencyOptions = ["Basic", "Conversational", "Fluent", "Native"];

const stepIcons = [User, FileText, Languages, Briefcase, Image];
const stepTitles = ["Basic Info", "About You", "Skills", "Experience", "Portfolio"];

export default function OnboardingPage() {
const [currentStep, setCurrentStep] = useState(1);
const [showSuccess, setShowSuccess] = useState(false);
const [newSkill, setNewSkill] = useState("");

const [data, setData] = useState<OnboardingData>({
    avatar: "",
    fullName: "Alexandre Booh Louha",
    email: "alexandre.boohlouha@gmail.com",
    phone: "",
    adresse: "",
    ville: "",
    province: "",
    bio: "",
    profession: "",
    skills: [],
    languages: [{ id: 1, language: "English", proficiency: "Native" }],
    experiences: [],
    portfolio: [],
});

const totalSteps = 5;
const progress = (currentStep / totalSteps) * 100;

// Step validation
const isStep1Valid = data.phone.trim() !== "" && data.adresse.trim() !== "" && data.ville.trim() !== "" && data.province.trim() !== "";
const isStep2Valid = data.bio.length >= 80 && data.profession.trim() !== "";
const isStep3Valid = data.skills.length > 0 && data.languages.length > 0;
const isStep4Valid = true; // Experience is optional
const isStep5Valid = true; // Portfolio is optional

const canProceed = () => {
    switch (currentStep) {
    case 1:
        return isStep1Valid;
    case 2:
        return isStep2Valid;
    case 3:
        return isStep3Valid;
    case 4:
        return isStep4Valid;
    case 5:
        return isStep5Valid;
    default:
        return false;
    }
};

const handleNext = () => {
    if (currentStep < totalSteps) {
    setCurrentStep(currentStep + 1);
    } else {
    setShowSuccess(true);
    }
};

const handleBack = () => {
    if (currentStep > 1) {
    setCurrentStep(currentStep - 1);
    }
};

// Skills handlers
const handleAddSkill = () => {
    if (newSkill.trim() && !data.skills.includes(newSkill.trim()) && data.skills.length < 10) {
    setData({ ...data, skills: [...data.skills, newSkill.trim()] });
    setNewSkill("");
    }
};

const handleRemoveSkill = (skill: string) => {
    setData({ ...data, skills: data.skills.filter((s) => s !== skill) });
};

// Language handlers
const handleAddLanguage = () => {
    const newId = Math.max(0, ...data.languages.map((l) => l.id)) + 1;
    setData({
    ...data,
    languages: [...data.languages, { id: newId, language: "", proficiency: "" }],
    });
};

const handleRemoveLanguage = (id: number) => {
    setData({ ...data, languages: data.languages.filter((l) => l.id !== id) });
};

const handleUpdateLanguage = (id: number, field: "language" | "proficiency", value: string) => {
    setData({
    ...data,
    languages: data.languages.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    });
};

// Experience handlers
const handleAddExperience = () => {
    const newId = Math.max(0, ...data.experiences.map((e) => e.id)) + 1;
    setData({
    ...data,
    experiences: [
        ...data.experiences,
        { id: newId, title: "", company: "", period: "", description: "" },
    ],
    });
};

const handleRemoveExperience = (id: number) => {
    setData({ ...data, experiences: data.experiences.filter((e) => e.id !== id) });
};

const handleUpdateExperience = (id: number, field: keyof Experience, value: string) => {
    setData({
    ...data,
    experiences: data.experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    });
};

const [showCropper, setShowCropper] = useState(false);
const [imageToCrop, setImageToCrop] = useState<string | null>(null);
const [crop, setCrop] = useState({ x: 0, y: 0 });
const [zoom, setZoom] = useState(1);
const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

const saveCroppedImage = async () => {
  try {
    const croppedImage = await getCroppedImg(imageToCrop!, croppedAreaPixels);
    setData({ ...data, avatar: croppedImage });
    setShowCropper(false);
  } catch (err) {
    console.error(err);
  }
};


const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please upload an image.");
    return;
  }

  const reader = new FileReader();
  reader.onloadend = () => {
    setImageToCrop(reader.result as string);
    setShowCropper(true); 
  };
  reader.readAsDataURL(file);
};


// Portfolio handlers
const handleAddPortfolio = () => {
    const newId = Math.max(0, ...data.portfolio.map((p) => p.id)) + 1;
    setData({
    ...data,
    portfolio: [
        ...data.portfolio,
        {
        id: newId,
        image: `https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80`,
        title: "",
        description: "",
        },
    ],
    });
};

const handleRemovePortfolio = (id: number) => {
    setData({ ...data, portfolio: data.portfolio.filter((p) => p.id !== id) });
};

const handleUpdatePortfolio = (id: number, field: keyof PortfolioItem, value: string) => {
    setData({
    ...data,
    portfolio: data.portfolio.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    });
};

if (showSuccess) {
    return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-green-700" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your profile is now complete!</h1>
        <p className="text-gray-600 mb-8">
            You're all set to start posting listings and connecting with customers.
        </p>
        <div className="flex flex-col gap-3">
            <Button className="w-full bg-green-700 hover:bg-green-800 text-white h-12">
            Check on the services available to you
            </Button>
            <Button variant="outline" className="w-full h-12">
            View My Profile
            </Button>
        </div>
        </Card>
    </div>
    );
}

return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
    <div className="bg-white border-b border-gray-200 top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Complete Your Profile</h1>
        <p className="text-gray-600 mb-6">Step {currentStep} of {totalSteps}</p>

        <div className="relative">
            <div className="flex justify-between mt-4">
            {stepTitles.map((title, index) => {
                const StepIcon = stepIcons[index];
                const stepNum = index + 1;
                const isCompleted = stepNum < currentStep;
                const isCurrent = stepNum === currentStep;

                return (
                <div key={index} className="flex flex-col items-center">
                    <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                        ? "bg-green-700 text-white"
                        : isCurrent
                        ? "bg-green-700 text-white ring-4 ring-green-100"
                        : "bg-gray-200 text-gray-500"
                    }`}
                    >
                    {isCompleted ? <Check className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                    </div>
                    <span
                    className={`text-xs mt-2 hidden sm:block ${
                        isCurrent ? "text-green-700 font-medium" : "text-gray-500"
                    }`}
                    >
                    {title}
                    </span>
                </div>
                );
            })}
            </div>
        </div>
        </div>
    </div>
    <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
        {currentStep === 1 && (
            <Card className="p-6 sm:p-8 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Picture & Basic Info</h2>
            <p className="text-gray-600 mb-6">Let's start with the basics</p>

            <div className="space-y-6">
                <div className="flex flex-col items-center">
                <ProfilePictureUploader
                currentProfilePicture={data.avatar}
                userName={data.fullName}
                onProfileChange={(newProfilePicture) => setData({ ...data, avatar: newProfilePicture })}
                size="md"
                showLabel={true}
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="fullName" className="text-base font-medium text-gray-900">
                    Full Name
                </Label>
                <Input
                    id="fullName"
                    type="text"
                    value={data.fullName}
                    onChange={(e) => setData({ ...data, fullName: e.target.value })}
                    className="h-12"
                />
                </div>

                {/* Email */}
                <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium text-gray-900">
                    Email
                </Label>
                <Input
                    id="email"
                    type="email"
                    value={data.email}
                    disabled
                    className="h-12 bg-gray-50 cursor-not-allowed"
                />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                <Label htmlFor="phone" className="text-base font-medium text-gray-900">
                    Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="phone"
                    type="tel"
                    placeholder="123-456-7890"
                    value={data.phone}
                    onChange={(e) => {
                        let input = e.target.value.replace(/\D/g, ""); // remove non-digits

                        if (input.length > 3 && input.length <= 6) {
                        input = input.replace(/(\d{3})(\d+)/, "$1-$2");
                        } else if (input.length > 6) {
                        input = input.replace(/(\d{3})(\d{3})(\d+)/, "$1-$2-$3");
                        }

                        setData({ ...data, phone: input });
                    }}
                    maxLength={12}
                    className="h-12"
                    />
                </div>

                <div className="space-y-2">
                <Label htmlFor="adresse" className="text-base font-medium text-gray-900">
                    Address <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="adresse"
                    type="text"
                    placeholder="123 Main St, Apt 4B"
                    value={data.adresse}
                    onChange={(e) => setData({ ...data, adresse: e.target.value })}
                    className="h-12"
                />
                </div>

                <div className="space-y-2">
                <Label htmlFor="ville" className="text-base font-medium text-gray-900">
                    City <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="ville"
                    type="text"
                    placeholder="Montreal"
                    value={data.ville}
                    onChange={(e) => setData({ ...data, ville: e.target.value })}
                    className="h-12"
                />
                </div>

                <div className="space-y-2">
                <Label htmlFor="province" className="text-base font-medium text-gray-900">
                    Province <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="province"
                    type="text"
                    placeholder="Quebec"
                    value={data.province}
                    onChange={(e) => setData({ ...data, province: e.target.value })}
                    className="h-12"
                />
                </div>

            
            </div>
            </Card>
        )}

        {/* STEP 2 — Bio / Description */}
        {currentStep === 2 && (
            <Card className="p-6 sm:p-8 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Tell us about yourself</h2>
            <p className="text-gray-600 mb-6">Your bio helps customers understand who you are</p>

            <div className="space-y-6">
                {/* Profession */}
                <div className="space-y-2">
                <Label htmlFor="profession" className="text-base font-medium text-gray-900">
                    Profession / Title <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="profession"
                    type="text"
                    placeholder="e.g., Electrician, Math Tutor, House Cleaner"
                    value={data.profession}
                    onChange={(e) => setData({ ...data, profession: e.target.value })}
                    className="h-12"
                />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                <Label htmlFor="bio" className="text-base font-medium text-gray-900">
                    Bio <span className="text-red-500">*</span>
                </Label>
                <Textarea
                    id="bio"
                    placeholder="Tell potential customers about your experience, skills, and what makes you unique..."
                    value={data.bio}
                    onChange={(e) => setData({ ...data, bio: e.target.value })}
                    className="min-h-40 resize-none"
                />
                <div className="flex justify-between text-xs">
                    <span className={data.bio.length < 80 ? "text-red-500" : "text-gray-500"}>
                    Minimum 80 characters
                    </span>
                    <span className={data.bio.length < 80 ? "text-red-500" : "text-gray-500"}>
                    {data.bio.length} / 500
                    </span>
                </div>
                </div>
            </div>
            </Card>
        )}

        {/* STEP 3 — Skills & Languages */}
        {currentStep === 3 && (
            <Card className="p-6 sm:p-8 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Skills & Languages</h2>
            <p className="text-gray-600 mb-6">Help customers find you based on your expertise</p>

            <div className="space-y-8">
                {/* Skills Section */}
                <div>
                <Label className="text-base font-medium text-gray-900 mb-3 block">
                    Skills <span className="text-red-500">*</span>
                    <span className="text-gray-500 font-normal text-sm ml-2">
                    ({data.skills.length}/10)
                    </span>
                </Label>


                <div className="flex gap-2">
                    <Input
                    type="text"
                    placeholder="Type you're skill and press Enter"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
                    className="h-12"
                    disabled={data.skills.length >= 10}
                    />

                
                </div>
                {data.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                    {data.skills.map((skill) => (
                        <Badge
                        key={skill}
                        variant="secondary"
                        className="bg-green-100 text-green-700 pl-3 pr-2 py-1.5 text-sm"
                        >
                        {skill}
                        <button
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-2 hover:text-red-600"
                        >
                            <X className="h-3 w-3" />
                        </button>
                        </Badge>
                    ))}
                    </div>
                )}
                </div>

                {/* Languages Section */}
                <div>
                <Label className="text-base font-medium text-gray-900 mb-3 block">
                    Languages <span className="text-red-500">*</span>
                </Label>

                <div className="space-y-3">
                    {data.languages.map((lang) => (
                    <div key={lang.id} className="flex gap-3 items-center">
                        <Select
                        value={lang.language}
                        onValueChange={(value) => handleUpdateLanguage(lang.id, "language", value)}
                        >
                        <SelectTrigger className="h-12 flex-1">
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            {languageOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                                {option}
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>

                        <Select
                        value={lang.proficiency}
                        onValueChange={(value) =>
                            handleUpdateLanguage(lang.id, "proficiency", value)
                        }
                        >
                        <SelectTrigger className="h-12 flex-1">
                            <SelectValue placeholder="Proficiency" />
                        </SelectTrigger>
                        <SelectContent>
                            {proficiencyOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                                {option}
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>

                        <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveLanguage(lang.id)}
                        className="text-gray-400 hover:text-red-500"
                        disabled={data.languages.length === 1}
                        >
                        <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    ))}
                </div>

                <Button
                    variant="outline"
                    onClick={handleAddLanguage}
                    className="mt-4 gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Add Language
                </Button>
                </div>
            </div>
            </Card>
        )}

        {/* STEP 4 — Experience */}
        {currentStep === 4 && (
            <Card className="p-6 sm:p-8 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Work Experience</h2>
            <p className="text-gray-600 mb-6">
                Add your relevant work experience (Optional)
            </p>

            <div className="space-y-6">
                {data.experiences.map((exp, index) => (
                <div
                    key={exp.id}
                    className="p-4 border border-gray-200 rounded-xl relative"
                >
                    <button
                    onClick={() => handleRemoveExperience(exp.id)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                    >
                    <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="space-y-4 pr-8">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Job Title</Label>
                        <Input
                            placeholder="e.g., Senior Electrician"
                            value={exp.title}
                            onChange={(e) =>
                            handleUpdateExperience(exp.id, "title", e.target.value)
                            }
                            className="h-10"
                        />
                        </div>
                        <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                            Company / Client
                        </Label>
                        <Input
                            placeholder="e.g., ABC Electric Co."
                            value={exp.company}
                            onChange={(e) =>
                            handleUpdateExperience(exp.id, "company", e.target.value)
                            }
                            className="h-10"
                        />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Time Period</Label>
                        <Input
                        placeholder="e.g., 2019 - 2023 or 4 years"
                        value={exp.period}
                        onChange={(e) =>
                            handleUpdateExperience(exp.id, "period", e.target.value)
                        }
                        className="h-10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Description</Label>
                        <Textarea
                        placeholder="Briefly describe your responsibilities and achievements..."
                        value={exp.description}
                        onChange={(e) =>
                            handleUpdateExperience(exp.id, "description", e.target.value)
                        }
                        className="min-h-20 resize-none"
                        />
                    </div>
                    </div>
                </div>
                ))}

                {data.experiences.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                    <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No experience added yet</p>
                </div>
                )}

                <Button variant="outline" onClick={handleAddExperience} className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Add Experience
                </Button>
            </div>
            </Card>
        )}

        {/* STEP 5 — Portfolio */}
        {currentStep === 5 && (
            <Card className="p-6 sm:p-8 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Portfolio</h2>
            <p className="text-gray-600 mb-6">
                Upload images that showcase your work (Optional)
            </p>

            <div className="space-y-6">
                {data.portfolio.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-4">
                    {data.portfolio.map((item) => (
                    <div
                        key={item.id}
                        className="border border-gray-200 rounded-xl overflow-hidden"
                    >
                        <div className="relative aspect-video bg-gray-100">
                        <img
                            src={item.image}
                            alt={item.title || "Portfolio item"}
                            className="w-full h-full object-cover"
                        />
                        <button
                            onClick={() => handleRemovePortfolio(item.id)}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                        </div>
                        <div className="p-4 space-y-3">
                        <Input
                            placeholder="Title (e.g., Kitchen Renovation)"
                            value={item.title}
                            onChange={(e) =>
                            handleUpdatePortfolio(item.id, "title", e.target.value)
                            }
                            className="h-10"
                        />
                        <Textarea
                            placeholder="Short description..."
                            value={item.description}
                            onChange={(e) =>
                            handleUpdatePortfolio(item.id, "description", e.target.value)
                            }
                            className="min-h-16 resize-none text-sm"
                        />
                        </div>
                    </div>
                    ))}
                </div>
                )}

                {data.portfolio.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                    <Image className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No portfolio items yet</p>
                </div>
                )}

                <Button variant="outline" onClick={handleAddPortfolio} className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Add Portfolio Item
                </Button>
            </div>
            </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
            <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-2 h-12 px-6"
            >
            <ChevronLeft className="h-4 w-4" />
            Back
            </Button>

            <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="bg-green-600 hover:bg-green-700 text-white gap-2 h-12 px-6"
            >
            {currentStep === totalSteps ? "Finish Profile" : "Next Step"}
            <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
        </div>
        {showCropper && imageToCrop && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-[90%] max-w-xl">
                <h2 className="text-lg font-semibold mb-4">Adjust your profile photo</h2>

                <div className="relative w-full h-64 bg-gray-200 rounded-xl overflow-hidden">
                    <Cropper
                    image={imageToCrop}
                    crop={crop}
                    zoom={zoom}
                    aspect={1} // carré pour profil
                    cropShape="round" // rond, optionnel
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={(croppedArea, croppedPixels) =>
                        setCroppedAreaPixels(croppedPixels)
                    }
                    />
                </div>

                <div className="mt-4 flex justify-between">
                    <Button variant="outline" onClick={() => setShowCropper(false)}>
                    Cancel
                    </Button>
                    <Button onClick={saveCroppedImage}>Save</Button>
                </div>
                </div>
            </div>
            )}
    </main>
    </div>
);
}

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";
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
X,
Plus,
Trash2,
Check,
ChevronRight,
ChevronLeft,
User,
Users,
Building2,
UserPen,
FileText,
Languages,
Briefcase,
FileUser,
ImageIcon,
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
    accountType: "" | "person" | "company";

    avatar: string;
    email: string;
    phone: string;
    adresse: string;
    ville: string;
    province: string;

    fullName?: string;          
    profession?: string;        
    bio?: string;
    skills?: string[];         
    languages?: Language[];    
    experiences?: Experience[]; 

    companyName?: string;
    industry?: string;
    companyBio?: string;
    teamSize?: string;

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

const professionSuggestions = [
    "Electrician",
    "Plumber",
    "Carpenter",
    "House Cleaner",
    "Math Tutor",
    "English Tutor",
    "Personal Trainer",
    "Graphic Designer",
    "Web Developer",
    "Photographer",
    "Videographer",
    "Painter",
    "Landscaper",
    "Handyman",
    "HVAC Technician",
    "Mechanic",
    "Dog Walker",
    "Pet Sitter",
    "Babysitter",
    "Chef",
    "Massage Therapist",
    "Yoga Instructor",
    "Music Teacher",
    "Piano Teacher",
    "Guitar Teacher",
];

const skillSuggestions = [
    "Electrical Work",
    "Plumbing",
    "Carpentry",
    "House Cleaning",
    "Deep Cleaning",
    "Tutoring",
    "Math",
    "English",
    "French",
    "Personal Training",
    "Graphic Design",
    "Web Development",
    "Photography",
    "Video Editing",
    "Painting",
    "Landscaping",
    "Garden Maintenance",
    "Home Repairs",
    "HVAC Repair",
    "Auto Repair",
    "Dog Training",
    "Pet Care",
    "Child Care",
    "Cooking",
    "Massage",
    "Yoga",
    "Piano",
    "Guitar",
    "Microsoft Office",
    "Adobe Photoshop",
    "Customer Service",
];

const serviceSuggestions = [
    "Residential Cleaning",
    "Commercial Cleaning",
    "Deep Cleaning",
    "Electrical Services",
    "Electrical Repair",
    "Electrical Installation",
    "Plumbing Services",
    "Plumbing Repair",
    "Drain Cleaning",
    "Construction",
    "Home Renovation",
    "Kitchen Renovation",
    "Bathroom Renovation",
    "Roofing",
    "HVAC Services",
    "Heating & Cooling",
    "Landscaping Services",
    "Lawn Care",
    "Snow Removal",
    "Moving Services",
    "Pest Control",
    "Painting Services",
    "Interior Painting",
    "Exterior Painting",
    "Carpet Cleaning",
    "Window Cleaning",
    "Pressure Washing",
    "Web Design",
    "Digital Marketing",
    "SEO Services",
    "Catering",
    "Event Planning",
];

const personIcons = [User ,UserPen , FileText, Languages, Briefcase, FileUser ];
const companyIcons = [Users, Building2,FileText,FileUser ];

const companyStepTitles = [ "Company Info", "About the Company","Services", "Summary"];
const personStepTitles = ["Basic Info","About You","Skills","Experience","Portfolio", "Summary"];


export default function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);
    const [newSkill, setNewSkill] = useState("");
    const [professionInput, setProfessionInput] = useState("");
    const [showProfessionSuggestions, setShowProfessionSuggestions] = useState(false);

    const [showPortfolioModal, setShowPortfolioModal] = useState(false);
    const [portfolioImage, setPortfolioImage] = useState<string | null>(null);
    const [portfolioTitle, setPortfolioTitle] = useState("");
    const [portfolioCrop, setPortfolioCrop] = useState({ x: 0, y: 0 });
    const [portfolioZoom, setPortfolioZoom] = useState(1);
    const [portfolioCroppedAreaPixels, setPortfolioCroppedAreaPixels] = useState(null);
    const [errorPortfolio, setErrorPortfolio] = useState(false);
    const [loading, setLoading] = useState(false);

    const { user,session } = useAuth();
    const router = useRouter();


    const [data, setData] = useState<OnboardingData>({
    accountType: "",
    avatar: "",
    email: "", 
    phone: "",
    adresse: "",
    ville: "",
    province: "",

    fullName: "",
    profession: "",
    bio: "",
    skills: [],
    languages: [],
    experiences: [],

    companyName: "",
    industry: "",
    companyBio: "",
    teamSize: "",

    portfolio: []
    });

    useEffect(() => {
    if (user) {
      setData((prev) => ({
        ...prev,
        email: user.email || "",
        fullName: user.user_metadata?.full_name || "",
      }));
    }
  }, [user]);


    const searchParams = useSearchParams();
    const accountType = searchParams.get("type") || "person";

    useEffect(() => {
        setData(prev => ({ ...prev, accountType }));
        }, [accountType]);

        useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key !== "Enter") return;

        const target = e.target as HTMLElement;

        if (showPortfolioModal) {
        e.preventDefault(); 

        if (portfolioTitle.trim().length > 0) {
            savePortfolioItem();
        }

        return;
        }

        if (target.id === "skill-input") return;
        if (target.tagName === "TEXTAREA") return;

        if (canProceed()) {
        e.preventDefault();
        handleNext();
        }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentStep, data, showPortfolioModal, portfolioTitle]);

    const titles = accountType === "company" ? companyStepTitles : personStepTitles;
    const icons  = accountType === "company" ? companyIcons : personIcons;
    const totalSteps = accountType === "company" ? 4 : 6;

    const isStep1Valid =
    accountType === "person"
        ? data.fullName.trim() !== "" &&
        data.phone.trim() !== "" &&
        data.adresse.trim() !== "" &&
        data.ville.trim() !== "" &&
        data.province.trim() !== ""
        : data.companyName?.trim() !== "" &&
        data.phone.trim() !== "" &&
        data.adresse.trim() !== "" &&
        data.ville.trim() !== "" &&
        data.province.trim() !== "";

    const isStep2Valid = accountType === "person" ? data.bio.length >= 80 && data.profession.trim() !== "" : (data.companyBio?.length ?? 0) >= 80 && data.industry.trim() !== "";
    const isStep3Valid = data.skills.length > 0;
    const isStep4Valid = true; // Experience is optional and for the summary
    const isStep5Valid = true; // Portfolio is optional

    const canProceed = () => {
        switch (currentStep) {
        case 1:
            return isStep1Valid
        case 2:
            return isStep2Valid;
        case 3:
            return isStep3Valid;
        case 4:
            return isStep4Valid;
        case 5:
            return isStep5Valid;
        case 6:
            return true;
        default:
            return false;
        }
    };

    const handleNext = async () => {
  if (currentStep < totalSteps) {
    setCurrentStep(currentStep + 1);
  } else {
    try {
      setLoading(true);

      const token = session?.access_token;

      if (!token) {
        alert("Authentication error. Please login again.");
        router.push("/login");
        return;
      }

      // Préparer les données proprement
      const payload = {
        account_type: data.accountType,
        phone: data.phone || "",
        address: data.adresse || "",
        city: data.ville || "",
        province: data.province || "",
        bio: data.bio || data.companyBio || "",
        avatar: data.avatar || "",
        
        // Person data
        profession: data.profession || "",
        skills: data.skills || [],
        languages: data.languages || [],
        experiences: data.experiences || [],
        
        // Company data
        company_name: data.companyName || "",
        industry: data.industry || "",
        team_size: data.teamSize || "",
        
        // Portfolio
        portfolio: data.portfolio || [],
      };

      console.log("Sending payload:", payload);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/complete`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save profile");
      }

      console.log("Profile saved to backend");

      // 2. Marquer le profil comme complété dans Supabase Auth
      const { error } = await supabase.auth.updateUser({
        data: {
          profile_completed: true,
        },
      });

      if (error) throw error;

      console.log("Profile marked as completed in Supabase Auth");

      setShowSuccess(true);

      setTimeout(() => {
        router.push("/");
      }, 2000);

    } catch (err: any) {
      console.error("Error completing profile:", err);
      alert(`Failed to complete profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }
};

    const handleBack = () => {
        if (currentStep > 1) {
        setCurrentStep(currentStep - 1);
        }
    };

    const handleAddSkill = () => {
        const skill = newSkill.trim();

        if (!skill) return;
        if (data.skills.includes(skill)) return;
        setData({ ...data, skills: [...data.skills, skill] });
        setNewSkill("");
        };


    const handleRemoveSkill = (skill: string) => {
        setData({ ...data, skills: data.skills.filter((s) => s !== skill) });
    };

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

    const handlePortfolioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please upload an image file.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPortfolioImage(reader.result as string);
            setPortfolioCrop({ x: 0, y: 0 });
            setPortfolioZoom(1);
            setPortfolioTitle("");
            setShowPortfolioModal(true);
        };
        reader.readAsDataURL(file);
    };

    const savePortfolioItem = async () => {
        if (!portfolioImage || !portfolioTitle.trim()) {
            setErrorPortfolio(true);
            return;
        }

        try {
            const cropped = await getCroppedImg(portfolioImage, portfolioCroppedAreaPixels);

            const newItem = {
                id: data.portfolio.length + 1,
                image: cropped,
                title: portfolioTitle.trim(),
                description: ""
            };

            setData({
                ...data,
                portfolio: [...data.portfolio, newItem],
            });

            closePortfolioModal();
        } catch (err) {
            console.error("Cropping error:", err);
            alert("Failed to crop image.");
        }
    };

    const closePortfolioModal = () => {
        setShowPortfolioModal(false);
        setPortfolioImage(null);
        setPortfolioTitle("");
        setPortfolioCrop({ x: 0, y: 0 });
        setPortfolioZoom(1);
        setPortfolioCroppedAreaPixels(null);
        setErrorPortfolio(false);
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
            <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1">Complete Your Profile</h1>
            <p className="text-gray-600 text-sm">Step {currentStep} of {totalSteps}</p>

            <div className="relative">
                <div className="flex justify-between mt-4">
                {titles.map((title, index) => {
                    const StepIcon = icons[index];
                    const stepNum = index + 1;
                    const isCompleted = stepNum < currentStep;
                    const isCurrent = stepNum === currentStep;

                    return (
                    <div key={index} className="flex flex-col items-center">
                        <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                            isCompleted
                            ? "bg-green-700 text-white"
                            : isCurrent
                            ? "bg-green-700 text-white ring-4 ring-green-100"
                            : "bg-gray-200 text-gray-500"
                        }`}
                        >
                        {isCompleted ? ( <Check className="h-4 w-4 sm:h-5 sm:w-5" /> ) : ( StepIcon && <StepIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />)}
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
        <main className="flex-1 py-4 sm:py-8 px-3 sm:px-4">
            <div className="max-w-2xl mx-auto">
            {currentStep === 1 && (
                <Card className="p-6 sm:p-8 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-0">Profile Picture & Basic Info</h2>
                <p className="text-gray-600">Let's start with the basics</p>

                <div className="space-y-6">
                    {accountType === "person" && (
                    <div>
                        <div className="flex flex-col items-center">
                    <ProfilePictureUploader
                    currentProfilePicture={data.avatar}
                    userName={data.fullName}
                    onProfileChange={(newProfilePicture) => setData({ ...data, avatar: newProfilePicture })}
                    size="xl"
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
                    </div>
                    )}

                    {accountType === "company" && (
                        <div>
                        <div className="flex flex-col items-center">
                    <ProfilePictureUploader
                    currentProfilePicture={data.avatar}
                    userName={data.companyName}
                    onProfileChange={(newProfilePicture) => setData({ ...data, avatar: newProfilePicture })}
                    size="xl"
                    showLabel={true}
                    />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="companyName" className="text-base font-medium text-gray-900">
                        Company Name
                        </Label>
                        <Input
                        id="companyName"
                        type="text"
                        value={data.companyName || ""}
                        onChange={(e) => setData({ ...data, companyName: e.target.value })}
                        className="h-12"
                        />
                    </div>
                    </div>
                    )}

                    <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-medium text-gray-900">
                        {accountType === "company" ? "Company Email" : "Email"}
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

            {currentStep === 2 && (
                <Card className="p-6 sm:p-8 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-gray-900">{accountType === "company" ? "Tell us about your company" : "Tell us about yourself"}</h2>
                <p className="text-gray-600">{accountType === "company" ? "Your company profile helps clients understand what you offer." : "Your bio helps customers understand who you are."}</p>

                <div className="space-y-6">
                    {/* Profession */}
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
                                    const value = e.target.value;
                                    setProfessionInput(value);
                                    setData({ ...data, profession: value });
                                    setShowProfessionSuggestions(!!value.trim());
                                }}
                                className="h-12"
                                onFocus={() => {
                                    if (professionInput.trim()) setShowProfessionSuggestions(true);
                                }}
                                onBlur={() => {
                                    setTimeout(() => setShowProfessionSuggestions(false), 150);
                                }}
                            />
                                {showProfessionSuggestions && professionInput.length > 0 && (
                                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-md shadow-lg z-20 max-h-38 overflow-y-auto">
                                        {professionSuggestions
                                            .filter((p) =>
                                                p.toLowerCase().includes(professionInput.toLowerCase())
                                            )
                                            .slice(0, 6)
                                            .map((suggestion) => (
                                                <div
                                                    key={suggestion}
                                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                    onMouseDown={() => {
                                                        setData({ ...data, profession: suggestion });
                                                        setProfessionInput(suggestion);
                                                        setShowProfessionSuggestions(false);
                                                    }}
                                                >
                                                    {suggestion}
                                                </div>
                                            ))}
                                    </div>
                                )}
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
                        </>
                    )}


                    {accountType === "company" && (
                        <>
                        {/* Company Bio */}
                        <div className="space-y-2">
                            <Label htmlFor="companyBio" className="text-base font-medium text-gray-900">
                            Company Description <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                            id="companyBio"
                            placeholder="Describe your company, mission, experience, and what makes your services unique..."
                            value={data.companyBio || ""}
                            onChange={(e) => setData({ ...data, companyBio: e.target.value })}
                            className="min-h-40 resize-none"
                            />
                            <div className="flex justify-between text-xs">
                            <span className={(data.companyBio?.length ?? 0) < 80 ? "text-red-500" : "text-gray-500"}>
                                Minimum 80 characters
                            </span>
                            <span className={(data.companyBio?.length ?? 0) < 80 ? "text-red-500" : "text-gray-500"}>
                                {(data.companyBio?.length ?? 0)} / 500
                            </span>
                            </div>
                        </div>

                        {/* Industry */}
                        <div className="space-y-2">
                            <Label htmlFor="industry" className="text-base font-medium text-gray-900">
                            Industry / Sector <span className="text-red-500">*</span>
                            </Label>
                            <Input
                            id="industry"
                            type="text"
                            placeholder="e.g., Construction, Cleaning Services, Marketing"
                            value={data.industry || ""}
                            onChange={(e) => setData({ ...data, industry: e.target.value })}
                            className="h-12"
                            />
                        </div>

                        {/* Team size (optional) */}
                        <div className="space-y-2">
                            <Label htmlFor="teamSize" className="text-base font-medium text-gray-900">
                            Team Size (Optional)
                            </Label>
                            <Input
                            id="teamSize"
                            type="text"
                            placeholder="e.g., 1-5 employees"
                            value={data.teamSize || ""}
                            onChange={(e) => setData({ ...data, teamSize: e.target.value })}
                            className="h-12"
                            />
                        </div>
                        </>
                    )}
                </div>
                </Card>
            )}

            {currentStep === 3 && (
            <Card className="p-6 sm:p-8 animate-in fade-in duration-300">

                {/* TITRE DYNAMIQUE */}
                <h2 className="text-xl font-bold text-gray-900">
                {accountType === "company" ? "Services Your Company Provides" : "Skills & Languages"}
                </h2>

                <p className="text-gray-600">
                {accountType === "company"
                    ? "Help customers understand what services your company offers."
                    : "Help customers find you based on your expertise"}
                </p>

                <div className="space-y-8">
                {accountType === "person" && (
                    <>
                    <div>
                        <Label className="text-base font-medium text-gray-900 mb-3 block">
                            Skills <span className="text-red-500">*</span>
                            <span className="text-gray-500 font-normal text-sm ml-2">
                            ({data.skills.length}/10)
                            </span>
                        </Label>

                        <div className="flex gap-2">
                             <div className="relative flex-1">
                            <Input
                            id="skill-input"
                            type="text"
                            placeholder="Type your skill and press Enter"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                            className="h-12"
                            disabled={data.skills.length >= 10}
                            />
                            {newSkill.length > 0 && (
                                <div className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-md shadow-lg z-20 max-h-38 overflow-y-auto">
                                    {skillSuggestions
                                    .filter((s) =>
                                        s.toLowerCase().includes(newSkill.toLowerCase())
                                    )
                                    .slice(0, 6)
                                    .map((suggestion) => (
                                        <div
                                        key={suggestion}
                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                        onMouseDown={() => {
                                        if (!data.skills.includes(suggestion)) {
                                            setData({
                                            ...data,
                                            skills: [...data.skills, suggestion],
                                            });
                                        }
                                        setNewSkill(""); 
                                        }}
                                        >
                                        {suggestion}
                                        </div>
                                    ))}
                                </div>
                                )}
                            </div>
                            <Button 
                            onClick={handleAddSkill}
                            className="h-12 px-4 bg-green-600 text-white hover:bg-green-700"
                            disabled={!newSkill.trim() || data.skills.length >= 10}
                            >
                            Add
                            </Button>
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
                                    className="cursor-pointer ml-2 hover:text-red-600"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                                </Badge>
                            ))}
                            </div>
                        )}
                        </div>


                    {/* LANGUAGES */}
                    <div>
                        <Label className="text-base font-medium text-gray-900 mb-3 block">
                        Languages
                        </Label>

                        <div className="space-y-3">
                        {data.languages.map((lang) => (
                            <div key={lang.id} className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center">
                            <div className="flex gap-2 w-full sm:flex-1">
                            <Select
                                className="flex-1"
                                value={lang.language}
                                onValueChange={(value) =>
                                handleUpdateLanguage(lang.id, "language", value)
                                }
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
                                className="flex-1"
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
                            </div>

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

                        <Button variant="outline" onClick={handleAddLanguage} className="mt-4 gap-2">
                        <Plus className="h-4 w-4" />
                        Add Language
                        </Button>
                    </div>
                    </>
                )}

                {accountType === "company" && (
                    <>
                    {/* Service list */}
                    <div>
                        <Label className="text-base font-medium text-gray-900 mb-3 block">
                        Services Offered <span className="text-red-500">*</span>
                        </Label>

                        <div className="flex gap-2">
                             <div className="relative flex-1">
                        <Input
                            type="text"
                            id="skill-input"
                            placeholder="e.g., Residential Cleaning, Electrical Repair"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                            className="h-12"
                        />

                        {newSkill.length > 0 && (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-md shadow-lg z-20 max-h-38 overflow-y-auto">
                                {serviceSuggestions
                                .filter((s) =>
                                    s.toLowerCase().includes(newSkill.toLowerCase())
                                )
                                .slice(0, 6)
                                .map((suggestion) => (
                                    <div
                                    key={suggestion}
                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                    onMouseDown={() => {
                                    if (!data.skills.includes(suggestion)) {
                                        setData({
                                        ...data,
                                        skills: [...data.skills, suggestion],
                                        });
                                    }
                                    setNewSkill("");
                                    }}
                                    >
                                    {suggestion}
                                    </div>
                                ))}
                            </div>
                            )}
                        </div>
                        <Button 
                        onClick={handleAddSkill}
                        className="h-12 px-4 bg-green-600 text-white hover:bg-green-700"
                        disabled={!newSkill.trim() || data.skills.length >= 10}
                        >
                        Add
                        </Button>
                        </div>

                        {data.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {data.skills.map((service) => (
                            <Badge
                                key={service}
                                variant="secondary"
                                className="bg-green-100 text-green-700 pl-3 pr-2 py-1.5 text-sm"
                            >
                                {service}
                                <button
                                onClick={() => handleRemoveSkill(service)}
                                className="cursor-pointer ml-2 hover:text-red-600"
                                >
                                <X className="h-3 w-3" />
                                </button>
                            </Badge>
                            ))}
                        </div>
                        )}
                    </div>

                    {/* Company languages (optional) */}
                    <div>
                        <Label className="text-base font-medium text-gray-900 mb-3 block">
                        Languages Spoken (Optional)
                        </Label>

                        <div className="space-y-3">
                        {data.languages.map((lang) => (
                            <div key={lang.id} className="flex gap-3 items-center">
                            <Select
                                value={lang.language}
                                onValueChange={(value) =>
                                handleUpdateLanguage(lang.id, "language", value)
                                }
                            >
                                <SelectTrigger className="h-12 flex-1">
                                <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent
                                position="popper"
                                side="bottom"
                                sideOffset={0} 
                                avoidCollisions={false}
                                className="max-h-60">
                                {languageOptions.map((option) => (
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

                        <Button variant="outline" onClick={handleAddLanguage} className="mt-4 gap-2">
                        <Plus className="h-4 w-4" />
                        Add Language
                        </Button>
                    </div>
                    </>
                )}

                </div>
            </Card>
            )}


            {accountType === "person" && currentStep === 4 && (
                <Card className="p-6 sm:p-8 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-gray-900">Work Experience</h2>
                <p className="text-gray-600">
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
                        className="cursor-pointer absolute top-4 right-4 text-gray-400 hover:text-red-500"
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

            {currentStep === 5 && (
                <Card className="p-6 sm:p-8 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-gray-900">Portfolio</h2>
                <p className="text-gray-600">
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
                            <div className="relative aspect-square bg-gray-100">
                            <img
                                src={item.image}
                                alt={item.title || "Portfolio item"}
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={() => handleRemovePortfolio(item.id)}
                                className="cursor-pointer absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
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
                            </div>
                        </div>
                        ))}
                    </div>
                    )}

                    {data.portfolio.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                        <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-4">No portfolio items yet</p>
                    </div>
                    )}

                    <Button
                    variant="outline"
                    onClick={() => document.getElementById("portfolioInput")?.click()}
                    className="w-full gap-2 cursor-pointer"
                    >
                    <Plus className="h-4 w-4" />
                    Add Portfolio Item
                    </Button>

                    <input
                    type="file"
                    accept="image/*"
                    id="portfolioInput"
                    className="hidden"
                    onChange={handlePortfolioUpload}
                    />
                </div>
                </Card>
            )}
            

            {currentStep === totalSteps && (
            <Card className="p-6 sm:p-8 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-gray-900">Summary</h2>
                <p className="text-gray-600">
                Review your information before finishing your profile.
                </p>
                <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <img 
                    src={data.avatar || "/default-avatar.png"}
                    alt="avatar"
                    className="w-16 h-16 sm:w-24 sm:h-24 rounded-full object-cover"
                    />
                    <div>
                    <h3 className="text-lg font-semibold">{accountType === "person" ? data.fullName : data.companyName}</h3>
                    <p className="text-gray-600">{accountType === "person" ? data.profession : data.industry}</p>
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Contact</h4>
                    <p className="text-gray-700"><strong>Email:</strong> {data.email}</p>
                    <p className="text-gray-700"><strong>Phone:</strong> {data.phone}</p>
                    <p className="text-gray-700"><strong>Address:</strong> {data.adresse}, {data.ville}, {data.province}</p>
                </div>
                {(accountType === "person" ? data.bio.trim().length > 0 : (data.companyBio ?? "").trim().length > 0) && (
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                            {accountType === "person" ? "Bio" : "Company Description"}
                        </h4>
                        <p className="text-gray-700 whitespace-pre-line">
                            {accountType === "person" ? data.bio : data.companyBio}
                        </p>
                    </div>
                )}
                {accountType === "company" && data.teamSize?.trim() && (
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Team Size</h4>
                        <p className="text-gray-700">{data.teamSize}</p>
                    </div>
                )}
                {data.skills.length > 0 && (
                    <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Skills / Services</h4>
                    <div className="flex flex-wrap gap-2">
                        {data.skills.map((skill) => (
                        <span key={skill} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            {skill}
                        </span>
                        ))}
                    </div>
                    </div>
                )}
                {data.languages.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Languages</h4>
                        <div className="flex flex-wrap gap-2">
                            {data.languages.map((lang) => (
                                <span
                                    key={lang.id}
                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                                >
                                    {lang.language}
                                    {lang.proficiency ? ` – ${lang.proficiency}` : ""}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                {data.experiences.some(exp =>
                    exp.title.trim() ||
                    exp.company.trim() ||
                    exp.description.trim()
                ) && (
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Experience</h4>
                        <div className="space-y-4">
                            {data.experiences
                                .filter(exp =>
                                    exp.title.trim() ||
                                    exp.company.trim() ||
                                    exp.description.trim()
                                )
                                .map((exp) => (
                                    <div key={exp.id} className="border border-gray-200 rounded-lg p-4">
                                        <h5 className="font-medium">{exp.title} @ {exp.company}</h5>
                                        <p className="text-sm text-gray-500">{exp.period}</p>
                                        <p className="text-gray-700 mt-2">{exp.description}</p>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
                {data.portfolio.length > 0 && (
                    <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Portfolio</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {data.portfolio.map((item) => (
                        <div key={item.id} className="border rounded-lg overflow-hidden">
                            <div className="relative aspect-square">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-center p-2 text-sm font-medium">{item.title}</p>
                        </div>
                    ))}
                    </div>
                    </div>
                )}

                </div>
            </Card>
            )}


            <div className="flex justify-between mt-6 sm:mt-8 gap-3">
                <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="gap-2 h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base"
                >
                <ChevronLeft className="h-4 w-4" />
                Back
                </Button>

                <Button
                onClick={handleNext}
                disabled={!canProceed() || loading}
                className="bg-green-600 hover:bg-green-700 text-white gap-2 h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base"
                >
                {loading ? "Saving..." : currentStep === totalSteps ? "Finish Profile" : "Next Step"}
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
                        aspect={1} 
                        cropShape="round" 
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
            {showPortfolioModal && portfolioImage && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-3xl">
                    
                    <h2 className="text-xl font-semibold mb-4">Add Portfolio Item</h2>

                    <div className="relative w-full h-80 bg-gray-200 rounded-lg overflow-hidden mb-4">
                        <Cropper
                        image={portfolioImage}
                        crop={portfolioCrop}
                        zoom={portfolioZoom}
                        aspect={1}
                        onCropChange={setPortfolioCrop}
                        onCropComplete={( _, pixels ) => setPortfolioCroppedAreaPixels(pixels)}
                        onZoomChange={setPortfolioZoom}
                        />
                    </div>

                    <div className="space-y-2 mb-6">
                        <Label>Title <span className="text-red-500">*</span></Label>
                        <Input
                        value={portfolioTitle}
                        onChange={(e) => setPortfolioTitle(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" onClick={closePortfolioModal} className="flex-1">
                        Cancel
                        </Button>
                        <Button onClick={savePortfolioItem} disabled={!portfolioTitle.trim()} className="flex-1 bg-green-600 text-white">
                        Add to Portfolio
                        </Button>
                    </div>

                    </div>
                </div>
                )}

        </main>
        </div>
    );
}

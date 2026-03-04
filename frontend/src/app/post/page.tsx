"use client";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import Header from "@/components/home/Header";
import CategoryNav from "@/components/home/Category";
import Footer from "@/components/home/Footer";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import ImageUploader from "@/components/ui/ImageUploader";
import LocationAutocomplete from "@/components/post/LocationAutocomplete";
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select";
import {categories} from "@/lib/categories";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";



const urgencyLevels = [
{ value: "anytime", label: "Anytime" },
{ value: "few-days", label: "Within a few days" },
{ value: "today", label: "Today" },
{ value: "urgent", label: "Urgent" },
];

type PostMode = "offer" | "looking";

export default function PostServicePage() {
    const { session } = useAuth();
    const router = useRouter();
    
    const [mode, setMode] = useState<PostMode>("offer");

    const [serviceTitle, setServiceTitle] = useState("");
    const [serviceDescription, setServiceDescription] = useState("");
    const [serviceCategory, setServiceCategory] = useState("");
    const [servicePrice, setServicePrice] = useState("");
    const [serviceLocation, setServiceLocation] = useState("");

    const [jobTitle, setJobTitle] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [jobCategory, setJobCategory] = useState("");
    const [jobBudget, setJobBudget] = useState("");
    const [jobLocation, setJobLocation] = useState("");
    const [jobUrgency, setJobUrgency] = useState("");

    const [servicePosterType, setServicePosterType] = useState("");
    const [serviceAvailability, setServiceAvailability] = useState("");
    const [serviceLanguage, setServiceLanguage] = useState("");
    const [serviceMobility, setServiceMobility] = useState("");
    const [serviceDuration, setServiceDuration] = useState("");
    const [serviceImage, setServiceImage] = useState<string | null>(null);
    const [serviceSubcategory, setServiceSubcategory] = useState("");


    const [jobPosterType, setJobPosterType] = useState("");
    const [jobAvailability, setJobAvailability] = useState("");
    const [jobLanguage, setJobLanguage] = useState("");
    const [jobMobility, setJobMobility] = useState("");
    const [jobDuration, setJobDuration] = useState("");
    const [jobImage, setJobImage] = useState<string | null>(null);
    const [jobSubcategory, setJobSubcategory] = useState("");
    const [showServiceDetails, setShowServiceDetails] = useState(false);
    const [showJobDetails, setShowJobDetails] = useState(false);
    const [successPopup, setSuccessPopup] = useState<{ show: boolean; type: "offer" | "looking"; id: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOneTime, setIsOneTime] = useState(false);


    const isServiceValid =
    serviceTitle.trim() !== "" &&
    serviceDescription.trim() !== "" &&
    serviceCategory.trim() !== "" &&
    servicePrice.trim() !== "" &&
    Number(servicePrice) > 0 &&
    serviceLocation.trim() !== ""

    const isJobValid =
    jobTitle.trim() !== "" &&
    jobDescription.trim() !== "" &&
    jobCategory.trim() !== "" &&
    jobBudget.trim() !== "" &&
    Number(jobBudget) > 0 &&
    jobLocation.trim() !== ""

    const handleServiceSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!session?.access_token) {
            alert("You must be logged in to post a service");
            router.push("/login");
            return;
        }


        setIsSubmitting(true);
        try {
            const payload = {
            type: "offer",
            title: serviceTitle,
            description: serviceDescription,
            category: serviceCategory,
            category_id: null,
            subcategory: serviceSubcategory,
            price: parseFloat(servicePrice),
            location: serviceLocation,
            poster_type: servicePosterType,
            availability: serviceAvailability,
            language: serviceLanguage,
            mobility: serviceMobility,
            duration: serviceDuration,
            image_url: serviceImage,
            is_one_time: isOneTime,
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify(payload),
            });

            if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to create service");
            }

            const data = await response.json();

            setSuccessPopup({ show: true, type: "offer", id: data.id });
        } catch (error: any) {
            console.error("Error creating service:", error);
            alert(`Failed to post service: ${error.message}`);
        }  finally {
            setIsSubmitting(false);
        }
        };

    const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.access_token) {
        alert("You must be logged in to post a job request");
        router.push("/login");
        return;
    }

    setIsSubmitting(true);
    try {
        const payload = {
        type: "looking",
        title: jobTitle,
        description: jobDescription,
        category: jobCategory,
        category_id: null,
        subcategory: jobSubcategory,
        price: parseFloat(jobBudget),
        location: jobLocation,
        poster_type: jobPosterType,
        availability: jobAvailability,
        language: jobLanguage,
        mobility: jobMobility,
        duration: jobDuration,
        urgency: jobUrgency,
        image_url: jobImage,
        is_one_time: isOneTime,
        };


        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
        });

        if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create job request");
        }

        const data = await response.json();

        setSuccessPopup({ show: true, type: "looking", id: data.id });
    } catch (error: any) {
        console.error("Error creating job request:", error);
        alert(`Failed to post job request: ${error.message}`);
    } finally {
        setIsSubmitting(false);
    }
    };

    const { user, loading } = useProtectedRoute({
        requireAuth: true,
        requireProfileCompleted: true,
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  


return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* Success Popup */}
            {successPopup?.show && (
            <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 overflow-hidden"
                onClick={() => setSuccessPopup(null)}
            >
                <div
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
                onClick={(e) => e.stopPropagation()}
                >
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-9 h-9 text-green-600" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {successPopup.type === "offer" ? "Service Posted!" : "Job Request Posted!"}
                </h2>
                <p className="text-gray-500 mb-6">
                    {successPopup.type === "offer"
                    ? "Your service is now live and visible to everyone."
                    : "Your job request is now live and visible to everyone."}
                </p>
                <div className="flex flex-col gap-3">
                    <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                    onClick={() => router.push(`/serviceDetail/${successPopup.id}`)}
                    >
                    View My Post
                    </Button>
                    <Button
                    variant="outline"
                    className="w-full cursor-pointer"
                    onClick={() => router.push("/")}
                    >
                    Back to Home
                    </Button>
                </div>
                </div>
            </div>
            )}

    <Header />
    <CategoryNav/>
    <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Create a New Post
            </h1>
            <p className="mt-3 text-gray-600 text-lg">
            Choose the type of post you want to create.
            </p>
        </div>

        <div className="flex gap-4 mb-6">
            <button
            type="button"
            onClick={() => setMode("offer")}
            className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl border-2 transition-all duration-200 font-semibold text-lg ${
                mode === "offer"
                ? "bg-green-700 text-white border-green-700 shadow-lg"
                : "bg-white text-gray-700 border-gray-200 hover:border-green-700 hover:bg-green-50 cursor-pointer"
            }`}
            >
            <span>Offer a Service</span>
            </button>
            <button
            type="button"
            onClick={() => setMode("looking")}
            className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl border-2 transition-all duration-200 font-semibold text-lg ${
                mode === "looking"
                ? "bg-green-700 text-white border-green-700 shadow-lg"
                : "bg-white text-gray-700 border-gray-200 hover:border-green-700 hover:bg-green-50 cursor-pointer"
            }`}
            >
            <span>Looking for a Worker</span>
            </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
            {mode === "offer" ? (
            <form onSubmit={handleServiceSubmit} className="space-y-6">
                <div className="space-y-2">
                <Label htmlFor="serviceTitle" className="text-base font-medium text-gray-900">
                    Service Title <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="serviceTitle"
                    type="text"
                    placeholder="Ex: Professional House Cleaning"
                    value={serviceTitle}
                    onChange={(e) => setServiceTitle(e.target.value)}
                    required
                    className="h-12"
                />
                </div>

                <div className="space-y-2">
                <Label htmlFor="serviceDescription" className="text-base font-medium text-gray-900">
                    Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                    id="serviceDescription"
                    placeholder="Describe the service you offer…"
                    value={serviceDescription}
                    onChange={(e) => setServiceDescription(e.target.value)}
                    required
                    className="min-h-32 resize-none"
                />
                </div>

                <div className="space-y-2">
                <Label className="text-base font-medium text-gray-900">
                    Price Range <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                        $
                    </span>
                    <Input
                        type="number"
                        placeholder="Amount"
                        value={servicePrice}
                        onChange={(e) => setServicePrice(e.target.value)}
                        required
                        min="0"
                        className="h-12 pl-8"
                    />
                    </div>
                </div>
                {servicePrice && Number(servicePrice) <= 0 && (
                <p className="text-red-600 text-sm">
                    Price must be greater than zero.
                </p>
                )}
                </div>

                <div className="space-y-2">
                <Label htmlFor="serviceLocation" className="text-base font-medium text-gray-900">
                    Location <span className="text-red-500">*</span>
                </Label>
                <LocationAutocomplete
                    id="serviceLocation"
                    value={serviceLocation}
                    onChange={setServiceLocation}
                    placeholder="City, region (ex: Toronto, ON)"
                    required
                />
                </div>

                <div className="pb-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                    <Label className="text-base font-medium text-gray-900">
                        Category <span className="text-red-500">*</span>
                    </Label>
                    <Select value={serviceCategory} onValueChange={setServiceCategory}>
                        <SelectTrigger className="h-12 cursor-pointer">
                        <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                        {categories.map((cat) => (
                            <SelectItem key={cat.name} value={cat.name} className="cursor-pointer">
                            {cat.name}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-base font-medium text-gray-900">
                            Subcategory
                        </Label>

                        <Select
                            value={serviceSubcategory}
                            onValueChange={setServiceSubcategory}
                            disabled={!serviceCategory}  
                        >
                            <SelectTrigger className="h-12 cursor-pointer">
                            <SelectValue placeholder="Select a subcategory" />
                            </SelectTrigger>

                            <SelectContent>
                            {categories
                                .find((c) => c.name === serviceCategory)
                                ?.subcategories.map((sub) => (
                                <SelectItem key={sub} value={sub} className="cursor-pointer">
                                    {sub}
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        </div>


                    <div className="space-y-2">
                    <Label className="text-base font-medium text-gray-900">
                        Type of Poster 
                    </Label>
                    <Select value={servicePosterType} onValueChange={setServicePosterType}>
                        <SelectTrigger className="h-12 cursor-pointer">
                        <SelectValue placeholder="Individual or Company" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="individual" className="cursor-pointer">Individual</SelectItem>
                        <SelectItem value="company" className="cursor-pointer">Company</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>
                </div>
                </div>

                <div className="pb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                    <Label className="text-base font-medium text-gray-900">
                        Availability
                    </Label>
                    <Select value={serviceAvailability} onValueChange={setServiceAvailability}>
                        <SelectTrigger className="h-12 cursor-pointer">
                        <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="anytime" className="cursor-pointer">Anytime</SelectItem>
                        <SelectItem value="weekends" className="cursor-pointer">Weekends</SelectItem>
                        <SelectItem value="weekdays" className="cursor-pointer">Weekdays</SelectItem>
                        <SelectItem value="evenings" className="cursor-pointer">Evenings</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-base font-medium text-gray-900">
                            Spoken Language 
                        </Label>
                        <Select value={serviceLanguage} onValueChange={setServiceLanguage}>
                            <SelectTrigger className="h-12 cursor-pointer">
                            <SelectValue placeholder="Preferred language" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="french" className="cursor-pointer">French</SelectItem>
                            <SelectItem value="english" className="cursor-pointer">English</SelectItem>
                            <SelectItem value="bilingual" className="cursor-pointer">Bilingual</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                    <Label className="text-base font-medium text-gray-900">
                        Mobility 
                    </Label>
                    <Select value={serviceMobility} onValueChange={setServiceMobility}>
                        <SelectTrigger className="h-12 cursor-pointer">
                        <SelectValue placeholder="Can you travel?" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="yes" className="cursor-pointer">Yes</SelectItem>
                        <SelectItem value="no" className="cursor-pointer">No</SelectItem>
                        <SelectItem value="limited" className="cursor-pointer">Limited distance</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>
                </div>
                </div>

                <div className="space-y-2">
                <Label className="text-base font-medium text-gray-900">
                    Approx. Job Duration 
                </Label>
                <Input
                    type="text"
                    placeholder="Ex: 2 hours, 1 day, 1 week"
                    value={serviceDuration}
                    onChange={(e) => setServiceDuration(e.target.value)}
                    className="h-12"
                />
                </div>

                <div className="space-y-2">
                <Label className="text-base font-medium text-gray-900">
                    Upload an Image (optional)
                </Label>
                <ImageUploader
                    currentImage={serviceImage}
                    onImageChange={(newImage) => setServiceImage(newImage)}
                    label="Upload Service Image"
                    aspectRatio={16 / 9}
                />
                </div>


                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="serviceIsOneTime"
                    checked={isOneTime}
                    onChange={(e) => setIsOneTime(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-600 cursor-pointer"
                  />
                  <label htmlFor="serviceIsOneTime" className="cursor-pointer">
                    <span className="text-sm font-medium text-amber-800">One-time listing</span>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Once a request is accepted, this listing will be hidden and all other pending requests will be automatically declined.
                    </p>
                  </label>
                </div>

                <div className="pt-4">
                <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold rounded-xl h-14 cursor-pointer"
                    disabled={!isServiceValid || isSubmitting}
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                            </svg>
                            Posting...
                        </span>
                    ) : "Post Service"}
                </Button>
                <p className="text-center text-gray-500 text-sm mt-3">
                    Your service will appear publicly after submission.
                </p>
                </div>
            </form>
            ) : (

            <form onSubmit={handleJobSubmit} className="space-y-6">
                <div className="space-y-2">
                <Label htmlFor="jobTitle" className="text-base font-medium text-gray-900">
                    Job Title <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="jobTitle"
                    type="text"
                    placeholder="Ex: Need help moving furniture"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    required
                    className="h-12"
                />
                </div>

                <div className="space-y-2">
                <Label htmlFor="jobDescription" className="text-base font-medium text-gray-900">
                    Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                    id="jobDescription"
                    placeholder="Describe what kind of worker you're looking for and the job details…"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    required
                    className="min-h-32 resize-none"
                />
                </div>


                <div className="space-y-2">
                <Label className="text-base font-medium text-gray-900">
                    Budget <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                        $
                    </span>
                    <Input
                        type="number"
                        placeholder="Amount"
                        value={jobBudget}
                        onChange={(e) => setJobBudget(e.target.value)}
                        required
                        min="0"
                        className="h-12 pl-8"
                    />
                    </div>
                </div>
                {jobBudget && Number(jobBudget) <= 0 && (
                    <p className="text-red-600 text-sm">
                        Budget must be greater than zero.
                    </p>
                    )}
                </div>

                <div className="space-y-2">
                <Label htmlFor="jobLocation" className="text-base font-medium text-gray-900">
                    Location <span className="text-red-500">*</span>
                </Label>
                <LocationAutocomplete
                    id="jobLocation"
                    value={jobLocation}
                    onChange={setJobLocation}
                    placeholder="City, region (ex: Toronto, ON)"
                    required
                />
                </div>

                <div className="space-y-2">
                <Label htmlFor="jobUrgency" className="text-base font-medium text-gray-900">
                    Urgency Level 
                </Label>
                <Select value={jobUrgency} onValueChange={setJobUrgency}>
                    <SelectTrigger className="h-12 cursor-pointer">
                    <SelectValue placeholder="Select urgency level" />
                    </SelectTrigger>
                    <SelectContent>
                    {urgencyLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value} className="cursor-pointer">
                        {level.label}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>

                <div className="pb-6 ">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                    <Label htmlFor="jobCategory" className="text-base font-medium text-gray-900">
                        Category <span className="text-red-500">*</span>
                    </Label>
                    <Select value={jobCategory} onValueChange={setJobCategory}>
                        <SelectTrigger className="h-12 cursor-pointer">
                        <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                        {categories.map((cat) => (
                            <SelectItem key={cat.name}  value={cat.name} className="cursor-pointer">
                            {cat.name}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    </div>

                    <div className="space-y-2">
                    <Label className="text-base font-medium text-gray-900">
                        Subcategory 
                    </Label>

                    <Select
                    value={jobSubcategory}
                    onValueChange={setJobSubcategory}
                    disabled={!jobCategory}
                    >
                    <SelectTrigger className="h-12 cursor-pointer">
                        <SelectValue placeholder="Select a subcategory" />
                    </SelectTrigger>

                    <SelectContent>
                        {categories
                        .find((c) => c.name === jobCategory)
                        ?.subcategories.map((sub) => (
                            <SelectItem key={sub} value={sub} className="cursor-pointer">
                            {sub}
                            </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    </div>



                    <div className="space-y-2">
                    <Label className="text-base font-medium text-gray-900">
                        Type of Poster 
                    </Label>
                    <Select value={jobPosterType} onValueChange={setJobPosterType}>
                        <SelectTrigger className="h-12 cursor-pointer">
                        <SelectValue placeholder="Individual or Company" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="individual" className="cursor-pointer">Individual</SelectItem>
                        <SelectItem value="company" className="cursor-pointer">Company</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>
                </div>
                </div>

                <div className="pb-6 ">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                    <Label className="text-base font-medium text-gray-900">
                        Availability
                    </Label>
                    <Select value={jobAvailability} onValueChange={setJobAvailability}>
                        <SelectTrigger className="h-12 cursor-pointer">
                        <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="anytime" className="cursor-pointer">Anytime</SelectItem>
                        <SelectItem value="weekends" className="cursor-pointer">Weekends</SelectItem>
                        <SelectItem value="weekdays" className="cursor-pointer">Weekdays</SelectItem>
                        <SelectItem value="evenings" className="cursor-pointer">Evenings</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-base font-medium text-gray-900">
                            Spoken Language
                        </Label>
                        <Select value={jobLanguage} onValueChange={setJobLanguage}>
                            <SelectTrigger className="h-12 cursor-pointer">
                            <SelectValue placeholder="Preferred language" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="french" className="cursor-pointer">French</SelectItem>
                            <SelectItem value="english" className="cursor-pointer">English</SelectItem>
                            <SelectItem value="bilingual" className="cursor-pointer">Bilingual</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                    <Label className="text-base font-medium text-gray-900">
                        Mobility
                    </Label>
                    <Select value={jobMobility} onValueChange={setJobMobility}>
                        <SelectTrigger className="h-12 cursor-pointer">
                        <SelectValue placeholder="Can you travel?" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="yes" className="cursor-pointer">Yes</SelectItem>
                        <SelectItem value="no" className="cursor-pointer">No</SelectItem>
                        <SelectItem value="limited" className="cursor-pointer">Limited distance</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>

                </div>
                </div>

                <div className="space-y-2">
                <Label className="text-base font-medium text-gray-900">
                    Approx. Job Duration
                </Label>
                <Input
                    type="text"
                    placeholder="Ex: 2 hours, 1 day, 1 week"
                    value={jobDuration}
                    onChange={(e) => setJobDuration(e.target.value)}
                    className="h-12"
                />
                </div>

                <div className="space-y-2">
                <Label className="text-base font-medium text-gray-900">
                    Upload an Image (optional)
                </Label>
                <ImageUploader
                    currentImage={jobImage}
                    onImageChange={(newImage) => setJobImage(newImage)}
                    label="Upload Job Image"
                    aspectRatio={16 / 9}
                />
                </div>

                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="jobIsOneTime"
                    checked={isOneTime}
                    onChange={(e) => setIsOneTime(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-600 cursor-pointer"
                  />
                  <label htmlFor="jobIsOneTime" className="cursor-pointer">
                    <span className="text-sm font-medium text-amber-800">One-time listing</span>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Once a request is accepted, this listing will be hidden and all other pending requests will be automatically declined.
                    </p>
                  </label>
                </div>

                <div className="pt-4">
                <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold rounded-xl h-14 cursor-pointer"
                    disabled={!isJobValid || isSubmitting}
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                            </svg>
                            Posting...
                        </span>
                    ) : "Post Job Request"}
                </Button>
                <p className="text-center text-gray-500 text-sm mt-3">
                    Your job request will appear publicly after submission.
                </p>
                </div>
            </form>
            )}
        </div>
        </div>
    </main>
    <Footer />
    </div>
);
}

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
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select";
import {categories} from "@/lib/categories.ts";


const urgencyLevels = [
{ value: "anytime", label: "Anytime" },
{ value: "few-days", label: "Within a few days" },
{ value: "today", label: "Today" },
{ value: "urgent", label: "Urgent" },
];

type PostMode = "offer" | "looking";

export default function PostServicePage() {
    
    const [mode, setMode] = useState<PostMode>("offer");

    const [serviceTitle, setServiceTitle] = useState("");
    const [serviceDescription, setServiceDescription] = useState("");
    const [serviceCategory, setServiceCategory] = useState("");
    const [servicePriceMin, setServicePriceMin] = useState("");
    const [servicePriceMax, setServicePriceMax] = useState("");
    const [serviceLocation, setServiceLocation] = useState("");

    const [jobTitle, setJobTitle] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [jobCategory, setJobCategory] = useState("");
    const [jobBudgetMin, setJobBudgetMin] = useState("");
    const [jobBudgetMax, setJobBudgetMax] = useState("");
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

    const isServiceValid =
    serviceTitle.trim() !== "" &&
    serviceDescription.trim() !== "" &&
    serviceCategory.trim() !== "" &&
    serviceSubcategory.trim() !== "" &&
    servicePosterType.trim() !== "" &&
    serviceAvailability.trim() !== "" &&
    serviceLanguage.trim() !== "" &&
    serviceMobility.trim() !== "" &&
    serviceDuration.trim() !== "" &&
    servicePriceMin.trim() !== "" &&
    servicePriceMax.trim() !== "" &&
    serviceLocation.trim() !== ""
    Number(servicePriceMax) > Number(servicePriceMin);

    const isJobValid =
    jobTitle.trim() !== "" &&
    jobDescription.trim() !== "" &&
    jobCategory.trim() !== "" &&
    jobSubcategory.trim() !== "" &&
    jobPosterType.trim() !== "" &&
    jobAvailability.trim() !== "" &&
    jobLanguage.trim() !== "" &&
    jobMobility.trim() !== "" &&
    jobDuration.trim() !== "" &&
    jobBudgetMin.trim() !== "" &&
    jobBudgetMax.trim() !== "" &&
    jobLocation.trim() !== "" &&
    jobUrgency.trim() !== ""
    Number(jobBudgetMax) > Number(jobBudgetMin);


    const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log({
        type: "service",
        serviceTitle,
        serviceDescription,
        serviceCategory,
        priceRange: { min: servicePriceMin, max: servicePriceMax },
        serviceLocation,

        posterType: servicePosterType,
        subcategory: serviceSubcategory,
        availability: serviceAvailability,
        language: serviceLanguage,
        mobility: serviceMobility,
        duration: serviceDuration,
        image: serviceImage ? serviceImage.name : null,
    });
    };


    const handleJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log({
        type: "job",
        jobTitle,
        jobDescription,
        jobCategory,
        budgetRange: { min: jobBudgetMin, max: jobBudgetMax },
        jobLocation,
        jobUrgency,

        posterType: jobPosterType,
        subcategory: jobSubcategory,
        availability: jobAvailability,
        language: jobLanguage,
        mobility: jobMobility,
        duration: jobDuration,
        image: jobImage ? jobImage.name : null,
    });
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
                        placeholder="Min"
                        value={servicePriceMin}
                        onChange={(e) => setServicePriceMin(e.target.value)}
                        required
                        min="0"
                        className="h-12 pl-8"
                    />
                    </div>
                    <span className="flex items-center text-gray-400 font-medium">to</span>
                    <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                        $
                    </span>
                    <Input
                        type="number"
                        placeholder="Max"
                        value={servicePriceMax}
                        onChange={(e) => setServicePriceMax(e.target.value)}
                        required
                        min="0"
                        className="h-12 pl-8"
                    />
                    </div>
                </div>
                {servicePriceMin && servicePriceMax && Number(servicePriceMax) <= Number(servicePriceMin) && (
                <p className="text-red-600 text-sm">
                    Max price must be greater than min price.
                </p>
                )}
                </div>

                <div className="space-y-2">
                <Label htmlFor="serviceLocation" className="text-base font-medium text-gray-900">
                    Location <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="serviceLocation"
                    type="text"
                    placeholder="City, region (ex: Toronto, ON)"
                    value={serviceLocation}
                    onChange={(e) => setServiceLocation(e.target.value)}
                    required
                    className="h-12"
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
                            Subcategory <span className="text-red-500">*</span>
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
                        Type of Poster <span className="text-red-500">*</span>
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
                        Availability <span className="text-red-500">*</span>
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
                            Spoken Language <span className="text-red-500">*</span>
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
                        Mobility <span className="text-red-500">*</span>
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
                    Approx. Job Duration <span className="text-red-500">*</span>
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


                <div className="pt-4">
                <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold rounded-xl h-14 cursor-pointer"
                    disabled= {!isServiceValid}
                >
                    Post Service
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
                    Budget Range <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                        $
                    </span>
                    <Input
                        type="number"
                        placeholder="Min"
                        value={jobBudgetMin}
                        onChange={(e) => setJobBudgetMin(e.target.value)}
                        required
                        min="0"
                        className="h-12 pl-8"
                    />
                    </div>
                    <span className="flex items-center text-gray-400 font-medium">to</span>
                    <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                        $
                    </span>
                    <Input
                        type="number"
                        placeholder="Max"
                        value={jobBudgetMax}
                        onChange={(e) => setJobBudgetMax(e.target.value)}
                        required
                        min="0"
                        className="h-12 pl-8"
                    />
                    </div>
                </div>
                {jobBudgetMin && jobBudgetMax && Number(jobBudgetMax) <= Number(jobBudgetMin) && (
                    <p className="text-red-600 text-sm">
                        Max budget must be greater than min budget.
                    </p>
                    )}
                </div>

                <div className="space-y-2">
                <Label htmlFor="jobLocation" className="text-base font-medium text-gray-900">
                    Location <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="jobLocation"
                    type="text"
                    placeholder="City, region (ex: Toronto, ON)"
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                    required
                    className="h-12"
                />
                </div>

                <div className="space-y-2">
                <Label htmlFor="jobUrgency" className="text-base font-medium text-gray-900">
                    Urgency Level <span className="text-red-500">*</span>
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
                        Subcategory <span className="text-red-500">*</span>
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
                        Type of Poster <span className="text-red-500">*</span>
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
                        Availability <span className="text-red-500">*</span>
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
                            Spoken Language <span className="text-red-500">*</span>
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
                        Mobility <span className="text-red-500">*</span>
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
                    Approx. Job Duration <span className="text-red-500">*</span>
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

                <div className="pt-4">
                <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold rounded-xl h-14 cursor-pointer"
                    disabled= {!isJobValid }
                >
                    Post Job Request
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

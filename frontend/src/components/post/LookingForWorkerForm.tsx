"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ImageUploader from "@/components/ui/ImageUploader";
import LocationAutocomplete from "@/components/post/LocationAutocomplete";
import CategorySubcategoryFields from "@/components/post/CategorySubcategoryFields";
import AvailabilityLanguageMobilityFields from "@/components/post/AvailabilityLanguageMobilityFields";
import OneTimeCheckbox from "@/components/post/OneTimeCheckbox";
import FormSubmitButton from "@/components/post/FormSubmitButton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const urgencyLevels = [
  { value: "anytime", label: "Anytime" },
  { value: "few-days", label: "Within a few days" },
  { value: "today", label: "Today" },
  { value: "urgent", label: "Urgent" },
];

interface Props {
  onSuccess: (id: string) => void;
}

export default function LookingForWorkerForm({ onSuccess }: Props) {
  const { session } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("");
  const [urgency, setUrgency] = useState("");
  const [posterType, setPosterType] = useState("");
  const [availability, setAvailability] = useState("");
  const [language, setLanguage] = useState("");
  const [mobility, setMobility] = useState("");
  const [duration, setDuration] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isOneTime, setIsOneTime] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isValid =
    title.trim() !== "" &&
    description.trim() !== "" &&
    category.trim() !== "" &&
    budget.trim() !== "" &&
    Number(budget) > 0 &&
    location.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) {
      alert("You must be logged in to post a job request");
      router.push("/login");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          type: "looking",
          title,
          description,
          category,
          category_id: null,
          subcategory,
          price: parseFloat(budget),
          location,
          poster_type: posterType,
          availability,
          language,
          mobility,
          duration,
          urgency,
          image_url: image,
          is_one_time: isOneTime,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create job request");
      }
      const data = await res.json();
      onSuccess(data.id);
    } catch (error: any) {
      alert(`Failed to post job request: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="jobTitle" className="text-base font-medium text-gray-900">
          Job Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="jobTitle"
          type="text"
          placeholder="Ex: Need help moving furniture"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
            <Input
              type="number"
              placeholder="Amount"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              required
              min="0"
              className="h-12 pl-8"
            />
          </div>
        </div>
        {budget && Number(budget) <= 0 && (
          <p className="text-red-600 text-sm">Budget must be greater than zero.</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="jobLocation" className="text-base font-medium text-gray-900">
          Location <span className="text-red-500">*</span>
        </Label>
        <LocationAutocomplete
          id="jobLocation"
          value={location}
          onChange={setLocation}
          placeholder="City, region (ex: Toronto, ON)"
          required
        />
      </div>

      <div className="space-y-2">
        <Label className="text-base font-medium text-gray-900">Urgency Level</Label>
        <Select value={urgency} onValueChange={setUrgency}>
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

      <CategorySubcategoryFields
        category={category}
        subcategory={subcategory}
        posterType={posterType}
        onCategoryChange={setCategory}
        onSubcategoryChange={setSubcategory}
        onPosterTypeChange={setPosterType}
        categoryRequired
      />

      <AvailabilityLanguageMobilityFields
        availability={availability}
        language={language}
        mobility={mobility}
        onAvailabilityChange={setAvailability}
        onLanguageChange={setLanguage}
        onMobilityChange={setMobility}
      />

      <div className="space-y-2">
        <Label className="text-base font-medium text-gray-900">Approx. Job Duration</Label>
        <Input
          type="text"
          placeholder="Ex: 2 hours, 1 day, 1 week"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-base font-medium text-gray-900">Upload an Image (optional)</Label>
        <ImageUploader
          currentImage={image}
          onImageChange={setImage}
          label="Upload Job Image"
          aspectRatio={16 / 9}
        />
      </div>

      <OneTimeCheckbox id="jobIsOneTime" checked={isOneTime} onChange={setIsOneTime} />

      <FormSubmitButton
        disabled={!isValid}
        submitting={submitting}
        label="Post Job Request"
        note="Your job request will appear publicly after submission."
      />
    </form>
  );
}

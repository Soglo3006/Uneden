"use client";

import { useState } from "react";
import Header from "@/components/home/Header";
import CategoryNav from "@/components/home/Category";
import Footer from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import ProfilePictureUploader from "@/components/profile/ProfilePicture"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronRight,
  Upload,
  X,
  Trash2,
  Plus,
  Camera,
} from "lucide-react";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/utils/cropImage";

// Mock user data
const initialUserData = {
  fullName: "Alexandre Booh louha",
  email: "alexandre.booh.louha@example.com",
  phone: "(514) 555-1234",
  avatar: "",
  bio: "Professional cleaner with over 10 years of experience in residential and commercial cleaning. I take pride in delivering exceptional results and ensuring every space I work on is spotless.",
  skills: ["Deep Cleaning", "Move-in/Move-out", "Office Cleaning", "Carpet Cleaning", "Window Cleaning"],
  languages: ["English", "French"],
  yearsExperience: 10,
  location: "Montréal, QC",
  portfolio: [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80",
      title: "Modern Kitchen Deep Clean",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400&q=80",
      title: "Living Room Transformation",
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&q=80",
      title: "Bathroom Sanitization",
    },
  ],
  showPublicly: true,
  allowMessages: true,
};

export default function EditProfilePage() {
  const [formData, setFormData] = useState(initialUserData);
  const [newSkill, setNewSkill] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [portfolioImage, setPortfolioImage] = useState<string | null>(null);
  const [portfolioTitle, setPortfolioTitle] = useState("");

  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [showmodified, setShowModied] = useState(false);
  const [modifiedImage, setModifiedImage] = useState<string | null>(null);

  const [userProfilePicture, setUserProfilePicture] = useState("");

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

const saveCroppedImage = async () => {
  try {
    const croppedImage = await getCroppedImg(imageToCrop!, croppedAreaPixels);
    setFormData({ ...formData, avatar: croppedImage });
    setShowCropper(false);
  } catch (err) {
    console.error(err);
  }
};
  

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const handleAddLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      setFormData({
        ...formData,
        languages: [...formData.languages, newLanguage.trim()],
      });
      setNewLanguage("");
    }
  };

  const handleRemoveLanguage = (langToRemove: string) => {
    setFormData({
      ...formData,
      languages: formData.languages.filter((lang) => lang !== langToRemove),
    });
  };

  const handleRemovePortfolioItem = (id: number) => {
    setFormData({
      ...formData,
      portfolio: formData.portfolio.filter((item) => item.id !== id),
    });
  };
  
  const handlePortfolioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please upload an image.");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("File size must be less than 5MB.");
    return;
  }

  const reader = new FileReader();
  reader.onloadend = () => {
    setPortfolioImage(reader.result as string);
    setPortfolioTitle("");
    setShowPortfolioModal(true);
  };
  reader.readAsDataURL(file);
};

const savePortfolioItem = () => {
  if (!portfolioImage) return;
  
  if (!portfolioTitle.trim()) {
    alert("Please enter a title for your portfolio item.");
    return;
  }

  const newId = formData.portfolio.length > 0 
    ? Math.max(...formData.portfolio.map(item => item.id)) + 1 
    : 1;

  const newPortfolioItem = {
    id: newId,
    image: portfolioImage,
    title: portfolioTitle.trim(),
  };

  setFormData({
    ...formData,
    portfolio: [...formData.portfolio, newPortfolioItem],
  });

  setShowPortfolioModal(false);
  setPortfolioImage(null);
  setPortfolioTitle("");
};

  const handleSave = () => {
    console.log("Saving profile data:", formData);
    // Handle save logic here
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />
      <CategoryNav />

      {/* Main Content */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* SECTION 1 — PAGE HEADER */}
          <div className="mb-8">
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <span className="hover:text-green-700 cursor-pointer">Home</span>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span className="hover:text-green-700 cursor-pointer">Profile</span>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span className="text-green-700 font-medium">Edit</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Edit Profile
            </h1>
            <p className="text-gray-600 text-lg">
              Update your personal information
            </p>
          </div>
          <Card className="p-6 sm:p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>

            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium text-gray-900 mb-3 block">
                  Profile Picture
                </Label>
                <div className="flex items-center gap-6">
                  <ProfilePictureUploader
                  currentProfilePicture={formData.avatar}
                  userName={formData.fullName}
                  onProfileChange={(newProfilePicture) => setFormData({ ...formData, avatar: newProfilePicture })}
                  size="md"
                  showLabel={true}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-base font-medium text-gray-900">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium text-gray-900">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="h-12 bg-gray-50 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base font-medium text-gray-900">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-base font-medium text-gray-900">
                  Location <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="City, Province"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-base font-medium text-gray-900">
                  Short Bio / Description
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Tell people about yourself and your services..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="min-h-32 resize-none"
                />
                <p className="text-xs text-gray-500">
                  {formData.bio.length} / 500 characters
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-base font-medium text-gray-900">Skills</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Add a skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
                    className="h-10"
                  />
                  <Button onClick={handleAddSkill} variant="outline" size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.skills.map((skill) => (
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
              </div>
              <div className="space-y-2">
                <Label className="text-base font-medium text-gray-900">Languages Spoken</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Add a language..."
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddLanguage()}
                    className="h-10"
                  />
                  <Button onClick={handleAddLanguage} variant="outline" size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.languages.map((lang) => (
                    <Badge
                      key={lang}
                      variant="secondary"
                      className="bg-blue-100 text-blue-700 pl-3 pr-2 py-1.5 text-sm"
                    >
                      {lang}
                      <button
                        onClick={() => handleRemoveLanguage(lang)}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience" className="text-base font-medium text-gray-900">
                  Years of Experience
                </Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  value={formData.yearsExperience}
                  onChange={(e) =>
                    setFormData({ ...formData, yearsExperience: parseInt(e.target.value) || 0 })
                  }
                  className="h-12"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 sm:p-8 mb-2">
            <h2 className="text-xl font-bold text-gray-900">Portfolio</h2>
            <p className="text-gray-600">Upload images that represent your work</p>

            {formData.portfolio.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {formData.portfolio.map((item) => (
                  <div key={item.id} className="relative group">
                    <div className="relative overflow-hidden rounded-lg aspect-square">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200" />
                      <button
                        onClick={() => handleRemovePortfolioItem(item.id)}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 mt-2 text-center">{item.title}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-700 transition-colors cursor-pointer"
            onClick={() => document.getElementById("portfolioInput")?.click()}
            >
            <input
                type="file"
                accept="image/*"
                id="portfolioInput"
                onChange={handlePortfolioUpload}
                className="hidden"
            />
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Upload Portfolio Images
            </h3>
            <p className="text-gray-500 text-sm mb-4">
                Drag and drop your images here, or click to browse
            </p>
            <Button variant="outline" className="gap-2" onChange={handlePortfolioUpload} className="cursor-pointer">
                <Plus className="h-4 w-4" />
                Choose Files
            </Button>
            <p className="text-xs text-gray-400 mt-3">
                PNG, JPG or GIF. Max 5MB per file.
            </p>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end mt-4">
            <Button
              variant="outline"
              className="w-full sm:w-auto order-2 sm:order-1"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white order-1 sm:order-2"
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </main>

      <Footer />
      {showPortfolioModal && portfolioImage && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Add Portfolio Item</h2>

            <div className="mb-6">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={portfolioImage}
                  alt="Portfolio preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <Label htmlFor="portfolioTitle" className="text-base font-medium text-gray-900">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="portfolioTitle"
                type="text"
                placeholder="e.g., Kitchen Renovation Project"
                value={portfolioTitle}
                onChange={(e) => setPortfolioTitle(e.target.value)}
                className="h-12"
                autoFocus
              />
              <p className="text-xs text-gray-500">
                Give your portfolio item a descriptive title
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowPortfolioModal(false);
                  setPortfolioImage(null);
                  setPortfolioTitle("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={savePortfolioItem}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!portfolioTitle.trim()}
              >
                Add to Portfolio
              </Button>
            </div>
          </div>
        </div>
      )}
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
    </div>
  );
}

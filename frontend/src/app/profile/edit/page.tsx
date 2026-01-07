"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/home/Header";
import CategoryNav from "@/components/home/Category";
import Footer from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import ProfilePictureUploader from "@/components/profile/ProfilePicture";
import { 
  ChevronRight, 
  Upload, 
  X, 
  Trash2, 
  Plus, 
  Camera,
  Building2,
  User,
  Users,
  Briefcase
} from "lucide-react";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/utils/cropImage";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, session } = useAuth();
  
  const [accountType, setAccountType] = useState<"person" | "company">("person");
  
  const [formData, setFormData] = useState({
    // Commun
    email: "",
    phone: "",
    avatar: "",
    bio: "",
    city: "",
    province: "",
    skills: [],
    languages: [],
    portfolio: [],
    
    // Person
    fullName: "",
    profession: "",
    
    // Company
    companyName: "",
    industry: "",
    teamSize: "",
  });

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [newSkill, setNewSkill] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [portfolioImage, setPortfolioImage] = useState<string | null>(null);
  const [portfolioTitle, setPortfolioTitle] = useState("");

  const [showModified, setShowModified] = useState(false);
  const [modifiedImage, setModifiedImage] = useState<string | null>(null);
  const [editingPortfolioId, setEditingPortfolioId] = useState<number | null>(null);
  const [editingPortfolioTitle, setEditingPortfolioTitle] = useState("");

  const [portfolioCrop, setPortfolioCrop] = useState({ x: 0, y: 0 });
  const [portfolioZoom, setPortfolioZoom] = useState(1);
  const [portfolioCroppedAreaPixels, setPortfolioCroppedAreaPixels] = useState(null);
  const [errorPortfolio, setErrorPortfolio] = useState(false);
  const [errorEditPortfolio, setErrorEditPortfolio] = useState(false);

  const isPerson = accountType === "person";
  const isCompany = accountType === "company";

  // Charger les données du profil
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.access_token) return;

      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/profiles/me`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load profile");
        }

        const data = await response.json();
        setAccountType(data.account_type || "person");

        const skills = typeof data.skills === "string" 
          ? JSON.parse(data.skills) 
          : data.skills || [];

        const languages = typeof data.languages === "string"
          ? JSON.parse(data.languages)
          : data.languages || [];

        const portfolio = typeof data.portfolio === "string"
          ? JSON.parse(data.portfolio)
          : data.portfolio || [];

        // Formater les données pour le formulaire
        const profileData = {
          // Commun
          email: data.email || "",
          phone: data.phone || "",
          avatar: data.avatar || "",
          bio: data.bio || "",
          city: data.city || "",
          province: data.province || "",
          skills: skills,
          languages: languages,
          portfolio: portfolio,

          // Person
          fullName: data.full_name || "",
          profession: data.profession || "",
          
          // Company
          companyName: data.company_name || "",
          industry: data.industry || "",
          teamSize: data.team_size || "",
        };

        setFormData(profileData);
        setInitialData(JSON.parse(JSON.stringify(profileData)));
      } catch (err: any) {
        console.error("Error loading profile:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

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
      setPortfolioCrop({ x: 0, y: 0 });
      setPortfolioZoom(1);
      setPortfolioCroppedAreaPixels(null);
      setShowPortfolioModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleModifiedImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setModifiedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleEditPortfolioItem = (item: any) => {
    setEditingPortfolioId(item.id);
    setModifiedImage(item.image);
    setEditingPortfolioTitle(item.title);
    setShowModified(true);
  };

  const saveModifiedPortfolioItem = async () => {
    if (!modifiedImage || !editingPortfolioId) return;
    
    if (!editingPortfolioTitle.trim()) {
      setErrorEditPortfolio(true);
      return;
    }

    try {
      const croppedImage = await getCroppedImg(modifiedImage, portfolioCroppedAreaPixels);

      setFormData({
        ...formData,
        portfolio: formData.portfolio.map(item => 
          item.id === editingPortfolioId 
            ? { ...item, image: croppedImage, title: editingPortfolioTitle.trim() }
            : item
        ),
      });

      setShowModified(false);
      setModifiedImage(null);
      setEditingPortfolioId(null);
      setEditingPortfolioTitle("");
      setPortfolioCrop({ x: 0, y: 0 });
      setPortfolioZoom(1);
      setPortfolioCroppedAreaPixels(null);
    } catch (err) {
      console.error("Error cropping image:", err);
      alert("Failed to crop image. Please try again.");
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

  const savePortfolioItem = async () => {
    if (!portfolioImage) return;
    
    if (!portfolioTitle.trim()) {
      setErrorPortfolio(true);
      return;
    }

    try {
      const croppedImage = await getCroppedImg(portfolioImage, portfolioCroppedAreaPixels);

      const newId = formData.portfolio.length > 0 
        ? Math.max(...formData.portfolio.map(item => item.id)) + 1 
        : 1;

      const newPortfolioItem = {
        id: newId,
        image: croppedImage,
        title: portfolioTitle.trim(),
      };

      setFormData({
        ...formData,
        portfolio: [...formData.portfolio, newPortfolioItem],
      });

      setShowPortfolioModal(false);
      setPortfolioImage(null);
      setPortfolioTitle("");
      setPortfolioCrop({ x: 0, y: 0 });
      setPortfolioZoom(1);
      setPortfolioCroppedAreaPixels(null);
    } catch (err) {
      console.error("Error cropping image:", err);
      alert("Failed to crop image. Please try again.");
    }
  };

  const handleSave = async () => {
    if (!session?.access_token) return;

    try {
      setSaving(true);

      const payload = {
        email: formData.email,
        phone: formData.phone,
        avatar: formData.avatar,
        bio: formData.bio,
        city: formData.city,
        province: formData.province,
        skills: formData.skills,
        languages: formData.languages,
        portfolio: formData.portfolio,
        
        // Champs spécifiques selon le type
        ...(isPerson && {
          full_name: formData.fullName,
          profession: formData.profession,
        }),
        
        ...(isCompany && {
          company_name: formData.companyName,
          industry: formData.industry,
          team_size: formData.teamSize,
        }),
      };

      console.log(payload);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/profiles/me`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      console.log("📊 RESPONSE STATUS:", response.status);
      console.log("📊 RESPONSE OK?:", response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const responseData = await response.json();
    console.log("✅ RÉPONSE DE L'API:", responseData);
    console.log("✅ PROFESSION DANS LA RÉPONSE:", responseData.profession);

      // Rediriger vers la page de profil
      router.push(`/profile/${user?.id}`);
    } catch (err: any) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = () => {
    const commonValid = 
      formData.phone.trim() !== "" &&
      formData.city.trim() !== "" &&
      formData.province.trim() !== "";
    
    if (isPerson) {
      return commonValid && formData.fullName.trim() !== "";
    } else {
      return commonValid && formData.companyName.trim() !== "";
    }
  };

  const isUnchanged = JSON.stringify(formData) === JSON.stringify(initialData);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <CategoryNav />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
        </div>
        <Footer />
      </div>
    );
  }

  const displayName = isPerson ? formData.fullName : formData.companyName;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <CategoryNav />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <Link href="/">
                <span className="hover:text-green-700 cursor-pointer">Home</span>
              </Link>
              <ChevronRight className="h-4 w-4 mx-1" />
              <Link href={`/profile/${user?.id}`}>
                <span className="hover:text-green-700 cursor-pointer">
                  {isPerson ? "Your Profile" : "Your Company Profile"}
                </span>
              </Link>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span className="text-green-700 font-medium">Edit</span>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Edit {isPerson ? "Profile" : "Company Profile"}
              </h1>
              {isCompany && (
                <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                  <Building2 className="h-3 w-3 mr-1" />
                  Company
                </Badge>
              )}
            </div>
            <p className="text-gray-600 text-lg">
              Update your {isPerson ? "personal" : "company"} information
            </p>
          </div>

          {/* Basic Information */}
          <Card className="p-6 sm:p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              {isPerson ? (
                <>
                  <User className="h-5 w-5 text-green-700" />
                  Personal Information
                </>
              ) : (
                <>
                  <Building2 className="h-5 w-5 text-green-700" />
                  Company Information
                </>
              )}
            </h2>
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <Label className="text-base font-medium text-gray-900 mb-3 block">
                  {isPerson ? "Profile Picture" : "Company Logo"}
                </Label>
                <ProfilePictureUploader
                  currentProfilePicture={formData.avatar}
                  userName={displayName}
                  onProfileChange={(newProfilePicture) => 
                    setFormData({ ...formData, avatar: newProfilePicture })
                  }
                  size="xl"
                  showLabel={true}
                />
              </div>

              {/* Name Field - Different for Person vs Company */}
              {isPerson ? (
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
                    placeholder="John Doe"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-base font-medium text-gray-900">
                    Company Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="h-12"
                    placeholder="Acme Corporation"
                  />
                </div>
              )}

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
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              {/* Location Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-base font-medium text-gray-900">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="Toronto"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
                    placeholder="Ontario"
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="h-12"
                  />
                </div>
              </div>

              {/* Profession (Person) or Industry (Company) */}
              {isPerson ? (
                <div className="space-y-2">
                  <Label htmlFor="profession" className="text-base font-medium text-gray-900 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    Profession
                  </Label>
                  <Input
                    id="profession"
                    type="text"
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    className="h-12"
                    placeholder="Software Developer, Plumber, Electrician..."
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="industry" className="text-base font-medium text-gray-900 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      Industry
                    </Label>
                    <Input
                      id="industry"
                      type="text"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="h-12"
                      placeholder="Construction, IT Services, Manufacturing..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teamSize" className="text-base font-medium text-gray-900 flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      Team Size
                    </Label>
                    <Input
                      id="teamSize"
                      type="text"
                      value={formData.teamSize}
                      onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                      className="h-12"
                      placeholder="1-10, 11-50, 51-200..."
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-base font-medium text-gray-900">
                  {isPerson ? "Short Bio / Description" : "Company Description"}
                </Label>
                <Textarea
                  id="bio"
                  placeholder={
                    isPerson 
                      ? "Tell people about yourself and your services..."
                      : "Describe your company, services, and what makes you unique..."
                  }
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="min-h-32 resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500">
                  {formData.bio.length} / 500 characters
                </p>
              </div>

              {/* Skills / Services */}
              <div className="space-y-2">
                <Label className="text-base font-medium text-gray-900">
                  {isPerson ? "Skills" : "Services Offered"}
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder={isPerson ? "Add a skill..." : "Add a service..."}
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
                    className="h-10"
                  />
                  <Button 
                    onClick={handleAddSkill} 
                    variant="outline" 
                    size="sm" 
                    className="gap-1 h-auto cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.skills.map((skill, index) => (
                    <Badge
                      key={`skill-${index}`}
                      variant="secondary"
                      className="bg-green-100 text-green-700 pl-3 pr-2 py-1.5 text-sm"
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-2 hover:text-red-600 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="space-y-2">
                <Label className="text-base font-medium text-gray-900">
                  {isPerson ? "Languages Spoken" : "Languages Supported"}
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Add a language..."
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddLanguage()}
                    className="h-10"
                  />
                  <Button 
                    onClick={handleAddLanguage} 
                    variant="outline" 
                    size="sm" 
                    className="gap-1 h-auto cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.languages.map((lang, index) => {
                    const displayText = typeof lang === "string" 
                      ? lang 
                      : `${lang.language} (${lang.proficiency})`;
                    
                    return (
                      <Badge
                        key={`lang-${index}`}
                        variant="secondary"
                        className="bg-green-100 text-green-700 pl-3 pr-2 py-1.5 text-sm"
                      >
                        {displayText}
                        <button
                          onClick={() => handleRemoveLanguage(lang)}
                          className="ml-2 hover:text-red-600 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          {/* Portfolio Section */}
          <Card className="p-6 sm:p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {isPerson ? "Portfolio" : "Our Work"}
              </h2>
              <Button
                onClick={() => document.getElementById("portfolio-upload")?.click()}
                variant="outline"
                size="sm"
                className="gap-2 cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                Add Image
              </Button>
              <input
                id="portfolio-upload"
                type="file"
                accept="image/*"
                onChange={handlePortfolioUpload}
                className="hidden"
              />
            </div>

            {formData.portfolio.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.portfolio.map((item, index) => (
                  <div key={`portfolio-${index}`} className="relative group">
                    <div className="relative overflow-hidden rounded-lg aspect-square">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200" />
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditPortfolioItem(item)}
                          className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 cursor-pointer"
                        >
                          <Camera className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRemovePortfolioItem(item.id)}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-2 text-center font-medium">
                      {item.title}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">No portfolio items yet</p>
                <p className="text-sm text-gray-500">
                  Upload images to showcase your {isPerson ? "work" : "company's projects"}
                </p>
              </div>
            )}
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button
              variant="outline"
              className="w-full sm:w-auto order-2 sm:order-1 cursor-pointer"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white order-1 sm:order-2 cursor-pointer"
              onClick={handleSave}
              disabled={!isFormValid() || isUnchanged || saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
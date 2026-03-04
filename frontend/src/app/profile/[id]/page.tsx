"use client";

import Header from "@/components/home/Header";
import CategoryNav from "@/components/home/Category";
import Footer from "@/components/home/Footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabaseClient"; 
import { useStartConversation } from '@/hooks/useStartConversation';
import {
  Star,
  MapPin,
  MessageCircle,
  Grid3x3,
  ChevronRight,
  Settings,
  Ellipsis,
  UserStar,
  Users,
  Ban,
  Pencil,
  Trash2,
} from "lucide-react";
import EditListingModal from "@/components/listings/EditListingModal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import SettingsPage from "@/components/profile/Settings";
import EllipsisPage from "@/components/profile/Ellipsis";
import RatingsPage from "@/components/profile/RatingsPage";

export default function UserProfilePage() {
  const params = useParams();
  const profileId = params.id as string;
  const { user, session, profilesById, setProfileInCache, isLoggingOut } = useAuth();

  const [userListings, setUserListings] = useState<any[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  
  const [showSettings, setShowSettings] = useState(false);
  const [showEllipsis, setShowEllipsis] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<any>(null);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [showRatings, setShowRatings] = useState(false);

  const [profileUser, setProfileUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hasFetchedRef = useRef(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [isBlockedByOther, setIsBlockedByOther] = useState(false);

  const isOwner = user?.id === profileId;
  const settingsScrollRef = useRef(null);

  // Listing edit/delete (owner only)
  const [editingListing, setEditingListing] = useState<any>(null);
  const [confirmDeleteListingId, setConfirmDeleteListingId] = useState<string | null>(null);
  const [deletingListingId, setDeletingListingId] = useState<string | null>(null);

  const deleteListing = async (id: string) => {
    setDeletingListingId(id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.ok) setUserListings((prev) => prev.filter((s) => s.id !== id));
    } catch {
      // silent
    } finally {
      setDeletingListingId(null);
      setConfirmDeleteListingId(null);
    }
  };

  const { startConversation, loading: sendMessageLoading } = useStartConversation();

  const handleSendMessage = () => {
    startConversation(profileId);
  };
  

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");
        setProfileUser(null);

        let url = `${process.env.NEXT_PUBLIC_API_URL}/profiles/${profileId}`;
        const headers: HeadersInit = {};

        if (user && user.id === profileId && session?.access_token) {
          url = `${process.env.NEXT_PUBLIC_API_URL}/profiles/me`;
          headers.Authorization = `Bearer ${session.access_token}`;
        }

        console.log("Fetching profile from:", url);
        console.log("Is owner?", user?.id === profileId);

        const response = await fetch(url, { headers });

        if (!response.ok) {
          throw new Error("Profile not found");
        }

        const data = await response.json();
        console.log("Profile loaded:", data)
        setProfileUser(data);
        hasFetchedRef.current = true;
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (profileId && !hasFetchedRef.current) { 
    fetchProfile();
    }
  }, [profileId]);

  // Vérifier si l'utilisateur est bloqué
  useEffect(() => {
    const checkBlocked = async () => {
      if (!user || isOwner || !profileId) return;
      
      try {
        const { data: iBlockedThem } = await supabase
          .from('blocked_users')
          .select('id')
          .eq('blocker_id', user.id)
          .eq('blocked_user_id', profileId)
          .maybeSingle();
        setIsBlocked(!!iBlockedThem);

        const { data: theyBlockedMe } = await supabase
          .from('blocked_users')
          .select('id')
          .eq('blocker_id', profileId)
          .eq('blocked_user_id', user.id)
          .maybeSingle();
        setIsBlockedByOther(!!theyBlockedMe);

      } catch (err) {
        console.error('Error checking blocked status:', err);
      }
    };
    
    checkBlocked();
  }, [user, profileId, isOwner]);

  useEffect(() => {
  hasFetchedRef.current = false;
}, [profileId]);

  // Prevent scrolling when modals are open
  useEffect(() => {
    if (showSettings || showEllipsis || isPortfolioModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showSettings, showEllipsis, isPortfolioModalOpen]);

  // Fetch user listings
  useEffect(() => {
    const fetchUserListings = async () => {
      if (!profileId) return;

      try {
        setListingsLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/services/user/${profileId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch listings");
        }

        const data = await response.json();
        console.log("User listings loaded:", data);
        // Sort by latest if created_at exists
        const sorted = Array.isArray(data)
          ? [...data].sort((a, b) => {
              const aTime = a?.created_at ? new Date(a.created_at).getTime() : 0;
              const bTime = b?.created_at ? new Date(b.created_at).getTime() : 0;
              return bTime - aTime;
            })
          : [];
        setUserListings(sorted);
      } catch (err) {
        console.error("Error fetching listings:", err);
        setUserListings([]);
      } finally {
        setListingsLoading(false);
      }
    };

    fetchUserListings();
  }, [profileId]);

  // Fetch user reviews (latest)
  useEffect(() => {
    const fetchUserReviews = async () => {
      if (!profileId) return;

      try {
        setReviewsLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/reviews/${profileId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }

        const data = await response.json();
        console.log("User reviews loaded:", data);
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchUserReviews();
  }, [profileId]);


  if (loading || isLoggingOut) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <CategoryNav />
      <div className="bg-gray-50 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
      <Footer />
    </div>
  );
}


  // Error state
  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <CategoryNav />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile not found</h1>
            <p className="text-gray-600">{error || "This profile doesn't exist."}</p>
            <Link href="/">
              <Button className="mt-4 bg-green-700 hover:bg-green-800 text-white">
                Go Home
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Déterminer le type de compte
  const isPerson = profileUser.account_type === "person";
  const isCompany = profileUser.account_type === "company";

  // Parse JSON fields
  const skills = typeof profileUser.skills === "string" 
    ? JSON.parse(profileUser.skills) 
    : profileUser.skills || [];
  
  const languages = typeof profileUser.languages === "string"
    ? JSON.parse(profileUser.languages)
    : profileUser.languages || [];
  
  const portfolio = typeof profileUser.portfolio === "string"
    ? JSON.parse(profileUser.portfolio)
    : profileUser.portfolio || [];

  // Calculer la date d'inscription
  const memberSince = profileUser.created_at 
    ? new Date(profileUser.created_at).toLocaleDateString("en-US", { 
        month: "long", 
        year: "numeric" 
      })
    : "Recently";

  // Nom d'affichage selon le type
  const displayName = isPerson ? profileUser.full_name : profileUser.company_name;
  const displayTitle = isPerson ? profileUser.profession : profileUser.industry;


  const handleUnblock = async () => {
  if (!user) return;

  const confirmed = window.confirm(
    `Are you sure you want to unblock ${displayName}?`
  );

  if (!confirmed) return;

  setBlockLoading(true);

  try {
    const { error } = await supabase
      .from('blocked_users')
      .delete()
      .eq('blocker_id', user.id)
      .eq('blocked_user_id', profileId);

    if (error) throw error;

    setIsBlocked(false);
    alert(`${displayName} has been unblocked.`);
  } catch (err) {
    console.error('Error unblocking user:', err);
    alert('Failed to unblock user. Please try again.');
  } finally {
    setBlockLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <CategoryNav />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Link href="/">
              <span className="hover:text-green-700 cursor-pointer">Home</span>
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-green-700 font-medium">
              {isOwner ? (isPerson ? "Your Profile" : "Your Company Profile") : `${displayName}'s Profile`}
            </span>
          </div>

          {/* Profile Header Card */}
          <Card className="p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage src={profileUser.avatar} alt={displayName} />
                <AvatarFallback className="text-2xl">
                  {(displayName).charAt(0)}
                </AvatarFallback>
              </Avatar>

              {/* View all listings link under avatar */}
              <div className="mt-2 w-32 text-center">
                <a href="#listings" className="underline text-green-700 hover:text-green-800">
                  View all listings{!listingsLoading ? ` (${userListings.length})` : ""}
                </a>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {displayName}
                  </h1>
                  {isCompany && (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                      Company
                    </Badge>
                  )}
                </div>

                <p className="text-lg text-gray-600 mb-3">
                  {displayTitle || "Service Provider"}
                </p>

                <div className="flex flex-wrap items-center gap-4 mb-4">
                  {profileUser.stats && (
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-lg">
                        {profileUser.stats.average_rating?.toFixed(1) || "N/A"}
                      </span>
                      <span className="text-gray-500">
                        ({profileUser.stats.total_reviews || 0} reviews)
                      </span>
                    </div>
                  )}
                  {profileUser.city && profileUser.province && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{profileUser.city}, {profileUser.province}</span>
                    </div>
                  )}
                  {isCompany && profileUser.team_size && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{profileUser.team_size} employees</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {isOwner ? (
                    <>
                      <Link href="/messages">
                        <Button className="bg-green-700 hover:bg-green-800 text-white gap-2 cursor-pointer">
                          <MessageCircle className="h-4 w-4" />
                          View Messages
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        className="gap-2 cursor-pointer" 
                        onClick={() => setShowSettings(true)}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Button>
                    </>
                  ) : (
                    <>
                      {isBlocked ? (
                        <>
                          <Button 
                            variant="outline" 
                            className="gap-2 cursor-pointer border-green-600 text-green-600 hover:bg-green-50"
                            onClick={handleUnblock}
                            disabled={blockLoading}
                          >
                            {blockLoading ? (
                              <>
                                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                </svg>
                                Unblocking...
                              </>
                            ) : (
                              <>
                                <Ban className="h-4 w-4" />
                                Unblock User
                              </>
                            )}
                          </Button>
                          <Link 
                            href={`/listings/${(displayName || "user")
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                          >
                            <Button variant="outline" className="gap-2">
                              <Grid3x3 className="h-4 w-4" />
                              View Listings
                            </Button>
                          </Link>
                        </>
                      ) : (
                        <>
                          {!isBlockedByOther && (
                            <Button 
                              onClick={handleSendMessage}
                              disabled={sendMessageLoading}
                              className="bg-green-700 hover:bg-green-800 text-white gap-2 cursor-pointer"
                            >
                              <MessageCircle className="h-4 w-4" />
                              {sendMessageLoading ? 'Loading...' : 'Send Message'}
                            </Button>
                          )}
                          <Button variant="outline" className="gap-2 cursor-pointer" onClick={() => setShowRatings(true)}>
                            <UserStar className="h-4 w-4" />
                            View Ratings
                          </Button>
                          <Link 
                            href={`/listings/${(displayName || "user")
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                          >
                            <Button variant="outline" className="gap-2 cursor-pointer">
                              <Grid3x3 className="h-4 w-4" />
                              View Listings
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            className="gap-2 cursor-pointer" 
                            onClick={() => setShowEllipsis(true)}
                          >
                            <Ellipsis className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* About Section - Adapté selon le type */}
          {!isBlocked && !isBlockedByOther && profileUser.bio && (
            <Card className="p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {isPerson ? "About Me" : "About Our Company"}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                {profileUser.bio}
              </p>
              <Separator className="my-4" />

              <div className="grid md:grid-cols-2 gap-6">
                {/* Skills / Services */}
                {skills.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {isPerson ? "Skills" : "Services Offered"}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-green-100 text-green-700"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {languages.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {isPerson ? "Languages I Speak" : "Languages Supported"}
                    </h3>
                    <p className="text-gray-700">
                      {languages
                        .map((lang: any) => 
                          typeof lang === "string" 
                            ? lang 
                            : `${lang.language} (${lang.proficiency})`
                        )
                        .join(", ")}
                    </p>
                  </div>
                )}

                {/* Team Size - Seulement pour les entreprises */}
                {isCompany && profileUser.team_size && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Team Size</h3>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-gray-500" />
                      <p className="text-gray-700">{profileUser.team_size}</p>
                    </div>
                  </div>
                )}

                {/* Profession - Seulement pour les personnes */}
                {isPerson && profileUser.profession && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Profession</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-700">{profileUser.profession}</p>
                    </div>
                  </div>
                )}

                {/* Industry - Seulement pour les entreprises */}
                {isCompany && profileUser.industry && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Industry</h3>
                    <p className="text-gray-700">{profileUser.industry}</p>
                  </div>
                )}

                {/* Member Since */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {isPerson ? "Member Since" : "Established On"}
                  </h3>
                  <p className="text-gray-700">{memberSince}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Portfolio */}
          {!isBlocked && !isBlockedByOther && portfolio.length > 0 && (
            <Card className="p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {isPerson ? "My Portfolio" : "Our Projects"}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {portfolio.map((item: any, index: number) => (
                  <div
                    key={item.id || index}
                    className="group cursor-pointer"
                    onClick={() => {
                      setSelectedPortfolio(item);
                      setIsPortfolioModalOpen(true);
                    }}
                  >
                    <div className="relative overflow-hidden rounded-lg aspect-square">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <p className="text-sm font-medium text-gray-700 text-center mt-2">
                      {item.title}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Listings */}
          {!isBlocked && !isBlockedByOther && (
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isPerson ? "My Listings" : "Our Services"}
                </h2>
                {isOwner && (
                  <Link href="/post">
                    <Button className="bg-green-700 hover:bg-green-800 text-white cursor-pointer">
                      Create New Listing
                    </Button>
                  </Link>
                )}
              </div>

              {listingsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
                </div>
              ) : userListings.length > 0 ? (
                <>
                  <Carousel
                    opts={{
                      align: "start",
                      loop: false,
                    }}
                    className="w-full"
                  >
                    <CarouselContent className="-ml-4">
                      {userListings.map((listing) => (
                        <CarouselItem key={listing.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                          <div className="border rounded-xl shadow-sm bg-white h-full flex flex-col overflow-hidden hover:shadow-lg transition-all">
                            {/* Image */}
                            <Link href={`/serviceDetail/${listing.id}`} className="block">
                              {listing.image_url ? (
                                <img
                                  src={listing.image_url}
                                  alt={listing.title}
                                  className="w-full h-48 object-cover"
                                />
                              ) : (
                                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                                  <Grid3x3 className="h-12 w-12 text-gray-300" />
                                </div>
                              )}
                            </Link>

                            <div className="p-4 flex flex-col flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Link href={`/serviceDetail/${listing.id}`} className="flex-1">
                                  <h3 className="font-semibold text-gray-900 line-clamp-1 hover:text-green-700 transition-colors">
                                    {listing.title}
                                  </h3>
                                </Link>
                                {listing.type === "looking" && (
                                  <Badge className="bg-blue-100 text-blue-700 text-xs flex-shrink-0 border-0">
                                    Looking
                                  </Badge>
                                )}
                              </div>

                              <p className="text-green-700 font-bold text-lg mb-2">
                                ${listing.price}
                              </p>

                              <div className="flex items-center text-sm text-gray-500 mb-2">
                                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                                <span className="line-clamp-1">{listing.location}</span>
                              </div>

                              {listing.category && (
                                <p className="text-xs text-gray-500 line-clamp-1 mb-3">
                                  {listing.category}
                                  {listing.subcategory && ` • ${listing.subcategory}`}
                                </p>
                              )}

                              {/* Owner edit/delete actions */}
                              {isOwner && (
                                <div className="mt-auto pt-3 border-t border-gray-100 flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1.5 flex-1"
                                    onClick={() => setEditingListing(listing)}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Edit
                                  </Button>
                                  {confirmDeleteListingId === listing.id ? (
                                    <>
                                      <Button
                                        size="sm"
                                        className="bg-red-600 hover:bg-red-700 text-white flex-1"
                                        onClick={() => deleteListing(listing.id)}
                                        disabled={deletingListingId === listing.id}
                                      >
                                        {deletingListingId === listing.id ? "…" : "Confirm"}
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => setConfirmDeleteListingId(null)}>✕</Button>
                                    </>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600 border-red-200 hover:bg-red-50 gap-1.5 flex-1"
                                      onClick={() => setConfirmDeleteListingId(listing.id)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      Delete
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    
                    {userListings.length > 3 && (
                      <>
                        <CarouselPrevious className="hidden md:flex -left-4 cursor-pointer" />
                        <CarouselNext className="hidden md:flex -right-4 cursor-pointer" />
                      </>
                    )}
                  </Carousel>

                  {/* View All Button */}
                  <div className="mt-2">
                    <Link
                      href={isOwner ? "/my-listings" : `/listings/${(displayName || "user")
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      <Button variant="outline" className="w-full cursor-pointer">
                        {isOwner ? "Manage My Listings" : "View All Listings"}
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Grid3x3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No listings yet
                  </h3>
                  <p className="text-gray-500">
                    {isOwner
                      ? "Your listings will appear here once you create them."
                      : "This user hasn't posted any listings yet."}
                  </p>
                  {isOwner && (
                    <Link href="/post">
                      <Button className="mt-4 bg-green-700 hover:bg-green-800 text-white cursor-pointer">
                        Create Your First Listing
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* Latest Ratings Preview */}
          {!isBlocked && (
            <Card className="p-6 mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Latest Ratings</h2>
              </div>

              {reviewsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700" />
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.slice(0, 3).map((r: any, idx: number) => (
                    <div key={r.id || idx} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-gray-900 line-clamp-1">{r.reviewer_name || "Anonymous"}</div>
                        <div className="text-sm text-gray-500">
                          {r.created_at ? new Date(r.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Recently"}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[1,2,3,4,5].map((i) => (
                          <Star key={i} className={`h-4 w-4 ${i <= (r.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                        ))}
                      </div>
                      {r.comment && (
                        <p className="text-gray-700 text-sm line-clamp-3">{r.comment}</p>
                      )}
                    </div>
                  ))}

                  <div>
                    <a href="#all-ratings">
                      <Button variant="outline" className="w-full cursor-pointer">View All Ratings</Button>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserStar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-600">No ratings yet</p>
                </div>
              )}
            </Card>
          )}

          {/* All Ratings Section */}
          {!isBlocked && reviews.length > 0 && (
            <Card id="all-ratings" className="p-6 mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">All Ratings</h2>
              <div className="space-y-4">
                {reviews.map((r: any, idx: number) => (
                  <div key={r.id || idx} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-900 line-clamp-1">{r.reviewer_name || "Anonymous"}</div>
                      <div className="text-sm text-gray-500">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Recently"}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[1,2,3,4,5].map((i) => (
                        <Star key={i} className={`h-4 w-4 ${i <= (r.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                      ))}
                    </div>
                    {r.comment && (
                      <p className="text-gray-700 text-sm">{r.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {isBlocked && (
            <Card className="p-12">
              <div className="text-center">
                <Ban className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  User Blocked
                </h3>
                <p className="text-gray-500 mb-6">
                  You have blocked this user. Unblock them to see their content.
                </p>
                <Button
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50 cursor-pointer"
                  onClick={handleUnblock}
                  disabled={blockLoading}
                >
                  {blockLoading ? "Unblocking..." : "Unblock User"}
                </Button>
              </div>
            </Card>
          )}

          {isBlockedByOther && (
            <Card className="p-12">
              <div className="text-center">
                <Ban className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Contenu non disponible
                </h3>
                <p className="text-gray-500">
                  Vous ne pouvez pas voir le contenu de ce profil.
                </p>
              </div>
            </Card>
          )}

        </div>
      </main>

      <Footer />

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div
            className="w-full max-w-3xl max-h-[90vh] bg-white rounded-xl shadow-xl p-6 overflow-y-auto animate-in fade-in duration-200"
            ref={settingsScrollRef}
          >
            <SettingsPage onClose={() => setShowSettings(false)} scrollRef={settingsScrollRef} />
          </div>
        </div>
      )}

      {/* Ellipsis Modal */}
      {showEllipsis && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="w-full max-w-3xl p-6 bg-white rounded-xl shadow-xl overflow-hidden">
            <EllipsisPage 
              onClose={() => setShowEllipsis(false)}
              profileId={profileId}
              displayName={displayName}
              userListings={userListings} 
            />
          </div>
        </div>
      )}

      {showRatings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="w-full max-w-3xl max-h-[90vh] bg-white rounded-xl shadow-xl overflow-y-auto">
            <RatingsPage
              onClose={() => setShowRatings(false)}
              profileId={profileId}
              displayName={displayName}
            />
          </div>
        </div>
      )}

      {/* Listing Edit Modal */}
      {editingListing && session?.access_token && (
        <EditListingModal
          service={editingListing}
          accessToken={session.access_token}
          onClose={() => setEditingListing(null)}
          onSaved={(updated) => {
            setUserListings((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)));
            setEditingListing(null);
          }}
        />
      )}

      {/* Portfolio Modal */}
      {isPortfolioModalOpen && selectedPortfolio && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl p-4 relative animate-in fade-in duration-200">
            <Button
              className="absolute top-6 right-6 p-2 bg-black/50 hover:bg-black/70 text-white rounded"
              onClick={() => setIsPortfolioModalOpen(false)}
            >
              ✕
            </Button>
            <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-200 max-w-[500px] mx-auto">
              <img
                src={selectedPortfolio.image}
                alt={selectedPortfolio.title}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold text-center mt-4">
              {selectedPortfolio.title}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}
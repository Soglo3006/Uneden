"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Star, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export default function UserInfoSidebar({ conversation }) {
  const { session } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [relatedListings, setRelatedListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (conversation && conversation.other_user_id) {
        setLoading(true);
        await Promise.all([
          fetchUserProfile(),
          fetchRelatedListings()
        ]);
        setLoading(false);
      }
    };
    
    loadData();
  }, [conversation?.other_user_id]);

  const fetchUserProfile = async () => {
    if (!conversation || !conversation.other_user_id) return;

    try {
      // Utiliser l'endpoint profiles pour récupérer les informations complètes
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/profiles/${conversation.other_user_id}`,
        {
          headers: session?.access_token ? {
            Authorization: `Bearer ${session.access_token}`,
          } : {}
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      } else {
        console.error("Failed to fetch user profile:", response.status);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchRelatedListings = async () => {
    if (!conversation || !conversation.other_user_id) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/services/user/${conversation.other_user_id}`,
        {
          headers: session?.access_token ? {
            Authorization: `Bearer ${session.access_token}`,
          } : {}
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRelatedListings(data.slice(0, 3));
      } else {
        console.error("Failed to fetch related listings:", response.status);
      }
    } catch (error) {
      console.error("Error fetching related listings:", error);
    }
  };

  if (!conversation || !conversation.other_user_id) {
    return null;
  }

  if (loading) {
    return (
      <div className="col-span-3 space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return null;
  }

  return (
    <div className="col-span-3 space-y-6">
      {/* About Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">About</h3>

        <div className="flex flex-col items-center text-center mb-6">
          <Avatar className="w-12 h-12">
            <AvatarImage
              src={userProfile.avatar}
              alt={conversation.other_user_name}
            />
            <AvatarFallback className="bg-gray-200 text-gray-700">
              {(conversation.other_user_name).charAt(0)}
            </AvatarFallback>
          </Avatar>
          <h4 className="font-semibold text-gray-900">
            {conversation.other_user_name}
          </h4>
          {userProfile.city && userProfile.province && (
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
              <MapPin className="h-3 w-3" />
              {userProfile.city}, {userProfile.province}
            </div>
          )}
          {userProfile.stats && (
            <div className="flex items-center gap-1 mt-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-sm">
                {userProfile.stats.average_rating?.toFixed(1) || "N/A"}
              </span>
              <span className="text-xs text-gray-500">
                ({userProfile.stats.total_reviews || 0} reviews)
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Member since</span>
            <span className="font-medium text-gray-900">
              {new Date(userProfile.created_at).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          {userProfile.stats && (
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Completed jobs</span>
              <span className="font-medium text-gray-900">
                {userProfile.stats.completed_bookings || 0}
              </span>
            </div>
          )}
        </div>

        {userProfile.bio && (
          <p className="text-sm text-gray-600 mt-4 leading-relaxed line-clamp-4">
            {userProfile.bio}
          </p>
        )}

        <Link href={`/profile/${conversation.other_user_id}`}>
          <button className="w-full mt-4 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
            View Full Profile
          </button>
        </Link>
      </div>

      {/* Related Listings */}
      {relatedListings.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Other Services</h3>
          <div className="space-y-3">
            {relatedListings.map((listing) => (
              <Link key={listing.id} href={`/serviceDetail/${listing.id}`}>
                <div className="group cursor-pointer border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="w-full h-24 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No image</span>
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2">
                      {listing.title}
                    </h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-green-700 font-bold text-sm">
                        ${listing.price}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
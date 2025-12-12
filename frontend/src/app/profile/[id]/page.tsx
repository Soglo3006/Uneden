"use client";

import Header from "@/components/home/Header";
import CategoryNav from "@/components/home/Category";
import Footer from "@/components/home/Footer";
import Link from "next/link"
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
Star,
MapPin,
MessageCircle,
Grid3x3,
ExternalLink,
ChevronRight,
Settings,
Ellipsis,
UserStar,
HeartPlus,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {useParams} from "next/navigation";
import SettingsPage from "@/components/profile/Settings"
import EllipsisPage from "@/components/profile/Ellipsis";
import { mockUsers } from "@/lib/mockData";

export default function UserProfilePage() {
    const params = useParams();
    const profileId = Number(params.id);
    const [showSettings, setShowSettings] = useState(false);
    const [showEllipsis, setShowEllipsis] = useState(false);
    const [selectedPortfolio, setSelectedPortfolio] = useState(null);
    const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
    const MAX_DISPLAY = 8;

    const user = mockUsers.find(u => u.id === profileId);
    const currentUserId = 1; // mock auth
    const profileUser = user;
    const isOwner = profileUser.id === currentUserId;


    const visibleListings = profileUser.userListings.slice(0, MAX_DISPLAY);


    const settingsScrollRef = useRef(null);


    useEffect(() => {
        if (showSettings || showEllipsis || isPortfolioModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        }
    }, [showSettings, showEllipsis, isPortfolioModalOpen]);



return (
<div className="min-h-screen bg-gray-50 flex flex-col">
    <Header />
    <CategoryNav />

    <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
    <div className="max-w-6xl mx-auto">
        <div className="flex items-center text-sm text-gray-500 mb-4">
            <Link href="/">
            <span className="hover:text-green-700 cursor-pointer">Home</span>
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-green-700 font-medium">{isOwner ? "Your Profile" : `${profileUser.name}'s Profile`}</span>
        </div>
        <Card className="p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Avatar className="w-45 h-45 border-4 border-white shadow-lg">
                <AvatarImage src={profileUser.avatar} alt={profileUser.name} />
                <AvatarFallback>{profileUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{profileUser.name}</h1>
            <p className="text-lg text-gray-600 mb-3">{profileUser.tagline}</p>
            <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-lg">{profileUser.rating}</span>
                <span className="text-gray-500">({profileUser.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{profileUser.location}</span>
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                
                    <Button className="bg-green-700 hover:bg-green-700 text-white gap-2 cursor-pointer">
                        <MessageCircle className="h-4 w-4" />
                        {isOwner ? "View Messages" : "Send Message"}
                    </Button>

                    {!isOwner && (
                    <Button variant="outline" className="gap-2 cursor-pointer">
                        <HeartPlus className="h-4 w-4" />
                        Add To Favorites
                    </Button>
                    )}
                    <Link href={`/listings/${profileUser.name
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}>
                    <Button variant="outline" className="gap-2 cursor-pointer">
                        <Grid3x3 className="h-4 w-4" />
                        {isOwner ? "View all my listings" : "View Listings"}
                    </Button>
                    </Link>
                    {isOwner ? (
                        <Button variant="outline" className="gap-2 cursor-pointer" onClick={() => setShowSettings(true)}>
                            <Settings className="h-4 w-4" />
                            Settings
                        </Button>
                    ) : (
                        <>
                        <Button variant="outline" className="gap-2 cursor-pointer">
                            <UserStar className="h-4 w-4" />
                            View Ratings
                        </Button>
                        <Button variant="outline" className="gap-2 cursor-pointer" onClick={() => setShowEllipsis(true)}>
                        <Ellipsis className="h-4 w-4" />
                    </Button>
                    </>
                    )}
                </div>

            </div>
        </div>
        </Card>

        <Card className="p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900">About Me</h2>
        <div className="flex justify-between items-start">
        <p className="text-gray-700 leading-relaxed">
            {profileUser.bio}
        </p>
        </div>
        <Separator className="my-1" />

        <div className="grid md:grid-cols-2 gap-6">
            <div>
            <h3 className="font-semibold text-gray-900 flex mb-1 items-center gap-2">
                Skills
            </h3>
            <div className="flex flex-wrap gap-2">
            {profileUser.skills.map((skill) => (
                <Badge
                key={skill}
                variant="secondary"
                className="bg-green-100 text-green-700"
                >
                {skill}
                </Badge>
            ))}
            </div>
            </div>

            <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                Languages
            </h3>
            <p className="text-gray-700">{profileUser.languages.join(", ")}</p>
            </div>

            <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                Years of Experience
            </h3>
            <p className="text-gray-700">{profileUser.yearsExperience} years</p>
            </div>

            <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                Member Since
            </h3>
            <p className="text-gray-700">{profileUser.memberSince}</p>
            </div>
        </div>
        </Card>


        <Card className="p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Portfolio</h2>
        {profileUser.portfolio.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {profileUser.portfolio.map((item) => (
                <div key={item.id} className="group cursor-pointer" onClick={()=> {
                    setSelectedPortfolio(item);
                    setIsPortfolioModalOpen(true);
                }}>
                <div className="relative overflow-hidden rounded-lg mb-2 aspect-square max-w-[300px] mx-auto">
                    <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
                </div>
                <p className="text-sm font-medium text-gray-700 text-center">{item.title}</p>
                </div>
            ))}
            </div>
        ) : (
            <div className="text-center py-12">
            <Grid3x3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No portfolio uploaded yet.</p>
            </div>
        )}
        </Card>
        <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isOwner ? "Listings made by you" : `${profileUser.name}'s Listings`}
        </h2>
        {(profileUser.userListings.length) > 0 ? (
            <div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleListings.map((listing, index) => (
                <>
                <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative h-48 overflow-hidden">
                    <img
                        src={listing.image}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                    />
                    </div>
                    <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {listing.title}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-sm">{listing.rating}</span>
                        <span className="text-gray-500 text-sm">({listing.reviews})</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                        <MapPin className="h-3 w-3 mr-1" />
                        {listing.location}
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-green-700">
                        ${listing.price}
                        </span>
                    </div>
                    </div>
                </Card>

                {(index + 1) % 6 === 0 && index !== profileUser.userListings.length - 1 && (
                    <Card className="overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                    <div className="h-full flex items-center justify-center p-8">
                        <span className="text-gray-400 font-medium">Advertisement</span>
                    </div>
                    </Card>
                )}
                </>
            ))}
            </div>
            {profileUser.userListings.length > MAX_DISPLAY && (
                <div className="flex justify-center mt-6">
                    <Button 
                        size="lg" 
                        variant="outline" 
                        className="gap-1 cursor-pointer"
                    >
                        View More
                    </Button>
                </div>
            )}
            </div>
            
        ) : (
            <Card className="p-12">
            <div className="text-center">
                <Grid3x3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No listings yet
                </h3>
                <p className="text-gray-500">
                This user hasn't posted any listings yet.
                </p>
            </div>
            </Card>
        )}
        </div>
    </div>
    </main>
    <Footer />
    {showSettings && (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="w-full max-w-3xl max-h-[90vh] bg-white rounded-xl shadow-xl p-6 overflow-y-auto animate-in fade-in duration-200"
        ref={settingsScrollRef}>
        <SettingsPage onClose={() => setShowSettings(false)} scrollRef={settingsScrollRef}/>
        </div>
    </div>
    )}

    {showEllipsis && (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl p-6">
        <EllipsisPage onClose={() => setShowEllipsis(false)} />
        </div>

    </div>
    )}

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

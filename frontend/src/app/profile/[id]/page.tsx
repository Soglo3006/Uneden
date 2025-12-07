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
} from "lucide-react";
import { useState } from "react";
import SettingsPage from "@/components/profile/Settings"

// Mock user data
const userData = {
id: 1,
name: "Alexandre Booh Louha",
avatar: "",
tagline: "Professional Cleaner • 10 years experience",
rating: 4.9,
reviews: 127,
location: "Toronto, ON",
bio: "I'm a dedicated professional cleaner with over 10 years of experience in residential and commercial cleaning. I take pride in delivering exceptional results and ensuring every space I work on is spotless. My attention to detail and commitment to customer satisfaction have earned me a strong reputation in the Toronto area. I use eco-friendly products and modern cleaning techniques to provide the best service possible.",
skills: [
"Deep Cleaning",
"Move-in/Move-out",
"Office Cleaning",
"Carpet Cleaning",
"Window Cleaning",
"Eco-friendly Products",
],
languages: ["English", "Portuguese", "Spanish"],
yearsExperience: 10,
memberSince: "January 2021",
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
{
    id: 4,
    image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&q=80",
    title: "Office Space Cleaning",
},
],
};

//Mock user Listings data
const userListings = [
{
id: 1,
title: "Professional Deep House Cleaning",
price: 75,
location: "Toronto, ON",
rating: 4.9,
reviews: 45,
image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80",
},
{
id: 2,
title: "Move-in/Move-out Cleaning Service",
price: 120,
location: "Toronto, ON",
rating: 5.0,
reviews: 32,
image: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400&q=80",
},
{
id: 3,
title: "Office Cleaning - Weekly Service",
price: 95,
location: "Toronto, ON",
rating: 4.8,
reviews: 28,
image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&q=80",
},
{
id: 4,
title: "Carpet & Upholstery Deep Clean",
price: 85,
location: "Toronto, ON",
rating: 4.9,
reviews: 22,
image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&q=80",
},
];



export default function UserProfilePage() {
    const [showSettings, setShowSettings] = useState(false);

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
            <span className="text-green-700 font-medium">Profile</span>
        </div>
        <Card className="p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Avatar className="w-45 h-45 border-4 border-white shadow-lg">
            <AvatarImage src={userData.avatar} alt={userData.name} />
            <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{userData.name}</h1>
            <p className="text-lg text-gray-600 mb-3">{userData.tagline}</p>

            <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-lg">{userData.rating}</span>
                <span className="text-gray-500">({userData.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{userData.location}</span>
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                <Button className="bg-green-700 hover:bg-green-700 text-white gap-2">
                <MessageCircle className="h-4 w-4" />
                Contact me
                </Button>
                <Button variant="outline" className="gap-2">
                <Grid3x3 className="h-4 w-4" />
                View all listings
                </Button>
                <Button variant="outline" className="gap-2" onClick={()=> setShowSettings(true)}>
                <Settings className="h-4 w-4" />
                Settings
                </Button>
            </div>
            </div>
        </div>
        </Card>

        <Card className="p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900">About Me</h2>
        <p className="text-gray-700 leading-relaxed">{userData.bio}</p>

        <Separator className="my-6" />

        <div className="grid md:grid-cols-2 gap-6">
            {/* Skills */}
            <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                Skills
            </h3>
            <div className="flex flex-wrap gap-2">
                {userData.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="bg-green-100 text-green-700">
                    {skill}
                </Badge>
                ))}
            </div>
            </div>

            {/* Languages */}
            <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                Languages
            </h3>
            <p className="text-gray-700">{userData.languages.join(", ")}</p>
            </div>

            {/* Experience */}
            <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                Years of Experience
            </h3>
            <p className="text-gray-700">{userData.yearsExperience} years</p>
            </div>

            {/* Member Since */}
            <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                Member Since
            </h3>
            <p className="text-gray-700">{userData.memberSince}</p>
            </div>
        </div>
        </Card>


        <Card className="p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Portfolio</h2>
        {userData.portfolio.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {userData.portfolio.map((item) => (
                <div key={item.id} className="group cursor-pointer">
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Listings by {userData.name}</h2>
        {userListings.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userListings.map((listing, index) => (
                <>
                {/* Listing Card */}
                <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                        <Button size="sm" variant="outline" className="gap-1">
                        View
                        <ExternalLink className="h-3 w-3" />
                        </Button>
                    </div>
                    </div>
                </Card>

                {/* Ad Placeholder every 6 listings */}
                {(index + 1) % 6 === 0 && index !== userListings.length - 1 && (
                    <Card className="overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                    <div className="h-full flex items-center justify-center p-8">
                        <span className="text-gray-400 font-medium">Advertisement</span>
                    </div>
                    </Card>
                )}
                </>
            ))}
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
        <div className="w-full max-w-3xl max-h-[90vh] bg-white rounded-xl shadow-xl p-6 overflow-y-auto animate-in fade-in duration-200">
        <SettingsPage onClose={() => setShowSettings(false)} />
        </div>

    </div>
    )}



</div>
);
}

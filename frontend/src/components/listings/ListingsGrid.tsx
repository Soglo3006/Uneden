"use client";

import { useState, useRef } from "react";
import ListingCard from "./ListingCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockListings = [
  {
    id: 1,
    title: "Professional House Cleaning Service",
    price: 75,
    location: "Toronto, ON",
    postedTime: "2 hours ago",
    imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80",
  },
  {
    id: 2,
    title: "Math & Science Tutoring - All Levels",
    price: 45,
    location: "Vancouver, BC",
    postedTime: "5 hours ago",
    imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=80",
  },
  {
    id: 3,
    title: "Local Moving Services - Same Day Available",
    price: 120,
    location: "Montreal, QC",
    postedTime: "1 day ago",
    imageUrl: "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=400&q=80",
  },
  {
    id: 4,
    title: "Dog Walking & Pet Sitting",
    price: 25,
    location: "Calgary, AB",
    postedTime: "3 hours ago",
    imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80",
  },
  {
    id: 5,
    title: "Tax Preparation & Bookkeeping",
    price: 150,
    location: "Ottawa, ON",
    postedTime: "6 hours ago",
    imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80",
  },
  {
    id: 6,
    title: "Event Photography - Weddings & Parties",
    price: 300,
    location: "Edmonton, AB",
    postedTime: "12 hours ago",
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80",
  },
  {
    id: 7,
    title: "Personal Training Sessions",
    price: 60,
    location: "Winnipeg, MB",
    postedTime: "1 day ago",
    imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",
  },
  {
    id: 8,
    title: "Computer Repair & IT Support",
    price: 80,
    location: "Halifax, NS",
    postedTime: "4 hours ago",
    imageUrl: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&q=80",
  },
  {
    id: 9,
    title: "Lawn Care & Landscaping",
    price: 55,
    location: "Victoria, BC",
    postedTime: "8 hours ago",
    imageUrl: "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=400&q=80",
  },
  {
    id: 10,
    title: "Piano Lessons for Beginners",
    price: 40,
    location: "Quebec City, QC",
    postedTime: "2 days ago",
    imageUrl: "https://images.unsplash.com/photo-1552422535-c45813c61732?w=400&q=80",
  },
  {
    id: 11,
    title: "Plumbing Services - Emergency Available",
    price: 95,
    location: "Hamilton, ON",
    postedTime: "5 hours ago",
    imageUrl: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&q=80",
  },
  {
    id: 12,
    title: "French Language Classes",
    price: 35,
    location: "Kitchener, ON",
    postedTime: "1 day ago",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80",
  },
  {
    id: 13,
    title: "Furniture Assembly Service",
    price: 50,
    location: "London, ON",
    postedTime: "7 hours ago",
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80",
  },
  {
    id: 14,
    title: "Cat Sitting & Pet Care",
    price: 30,
    location: "Saskatoon, SK",
    postedTime: "3 days ago",
    imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80",
  },
  {
    id: 15,
    title: "Web Design & Development",
    price: 500,
    location: "Regina, SK",
    postedTime: "10 hours ago",
    imageUrl: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&q=80",
  },
  {
    id: 16,
    title: "Massage Therapy - Home Visits",
    price: 85,
    location: "St. John's, NL",
    postedTime: "1 day ago",
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80",
  },
  {
    id: 17,
    title: "Electrical Repairs & Installation",
    price: 110,
    location: "Mississauga, ON",
    postedTime: "9 hours ago",
    imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80",
  },
  {
    id: 18,
    title: "Yoga Classes - Private & Group",
    price: 45,
    location: "Brampton, ON",
    postedTime: "2 days ago",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80",
  },
];

export default function ListingsGrid() {
    const [currentPage, setCurrentPage] = useState(1);
    const listingsPerPage = 12;
    const totalPages = Math.ceil(mockListings.length / listingsPerPage);

    const startIndex = (currentPage - 1) * listingsPerPage;
    const currentListings = mockListings.slice(startIndex, startIndex + listingsPerPage);

    const renderListingsWithAds = () => {
        const elements: React.ReactNode[] = [];
        
        currentListings.forEach((listing, index) => {
        elements.push(
            <ListingCard
            key={listing.id}
            title={listing.title}
            price={listing.price}
            location={listing.location}
            postedTime={listing.postedTime}
            imageUrl={listing.imageUrl}
            />
        );

        if ((index + 1) % 8 === 0 && index !== currentListings.length - 1) {
            elements.push(
            <div
                key={`ad-${index}`}
                className="bg-gray-100 rounded-xl p-8 flex items-center justify-center border border-gray-200 h-32"
            >
                <span className="text-gray-500 text-sm font-medium">Ad placeholder</span>
            </div>
            );
        }
        });

        return elements;
};

    const gridTopRef = useRef<HTMLDivElement>(null);
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        gridTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="space-y-5" ref={gridTopRef}>
        <div className="space-y-4">
            {renderListingsWithAds()}
        </div>
        <div className="flex items-center justify-center space-x-2 pt-6">
            <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="px-3"
            >
            <ChevronLeft className="h-4 w-4 " />
            <ChevronLeft className="h-4 w-4 -ml-4" />
            </Button>
            <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3"
            >
            <ChevronLeft className="h-4 w-4" />
            </Button>

            {[...Array(totalPages)].map((_, i) => (
            <Button
                key={i + 1}
                variant={currentPage === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(i + 1)}
                className={`px-4 ${currentPage === i + 1
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : ""
                }`}
            >
                {i + 1}
            </Button>
            ))}

            <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3"
            >
            <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3"
            >
            <ChevronRight className="h-4 w-4" />
            <ChevronRight className="h-4 w-4 -ml-4" />
            </Button>
        </div>
        </div>
    );
}

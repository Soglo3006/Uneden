"use client";

import { useState, useRef } from "react";
import ListingCard from "./ListingCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { sampleListings } from "@/lib/listings";
import { mockUsers } from "@/lib/mockData";

export default function ListingsGrid({ username }: { username?: string }) {
    const [currentPage, setCurrentPage] = useState(1);
    const listingsPerPage = 12;

    

    const allListings = mockUsers.flatMap(user =>
        user.userListings.map(listing => ({
            ...listing,
            ownerUsername: user.username,
            ownerName: user.name,
        }))
        );

    const filteredListings = username
        ? allListings.filter(
            (listing) => listing.ownerUsername === username
            )
        : allListings;
    const totalPages = Math.ceil(filteredListings.length / listingsPerPage);


    const startIndex = (currentPage - 1) * listingsPerPage;
    const currentListings = filteredListings.slice(
    startIndex,
    startIndex + listingsPerPage
    );


    const renderListingsWithAds = () => {
        const elements: React.ReactNode[] = [];
        
        currentListings.forEach((listing, index) => {
        elements.push(
            <Link key={listing.id} href={`/serviceDetail/${listing.id}`}>
                                <ListingCard
                title={listing.title}
                price={listing.price as number}
                location={listing.location}
                                    postedTime={"Recently"}
                imageUrl={listing.image}
                                completedCount={(listing as any).completed_count}
              />
            </Link>
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
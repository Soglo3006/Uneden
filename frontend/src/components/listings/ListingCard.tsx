"use client";

import { MapPin, Clock } from "lucide-react";

interface ListingCardProps {
    title?: string;
    price?: number;
    location?: string;
    postedTime?: string;
    imageUrl?: string;
    completedCount?: number;
    category?: string;
    subcategory?: string;
}

export default function ListingCard({
    title = "Professional House Cleaning Service",
    price = 75,
    location = "Toronto, ON",
    postedTime = "2 hours ago",
    imageUrl = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80",
    completedCount,
    category,
    subcategory,
    }: ListingCardProps) {
    const formatCompleted = (n?: number) => {
        if (!n || n <= 0) return "";
        if (n >= 1000) return " (1k+)";
        return ` (${n})`;
    };
    return (
        <div className="cursor-pointer bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col sm:flex-row">
        <div className="w-full h-40 sm:w-40 sm:h-32 shrink-0">
            <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
            />
        </div>
        <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-brand-green transition-colors cursor-pointer line-clamp-1">
                {title}
                <span className="text-gray-500 font-normal">{formatCompleted(completedCount)}</span>
            </h3>
            {(category || subcategory) && (
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                    {[category, subcategory].filter(Boolean).join(" | ")}
                </p>
            )}
            <p className="text-xl font-bold text-brand-green text-green-700 mt-1">
                ${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </p>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
            <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{location}</span>
            </div>
            <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{postedTime}</span>
            </div>
            </div>
        </div>
        </div>
    );
    }

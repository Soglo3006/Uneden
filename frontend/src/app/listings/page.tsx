"use client";
import Header from "@/components/home/Header";
import CategoryNav from "@/components/home/Category";
import Footer from "@/components/home/Footer";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, ChevronRight, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {categories} from "@/lib/categories.ts";
import ListingsGrid from "@/components/listings/ListingsGrid";





export default function Listings() {
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
    const [distance, setDistance] = useState([50]);
    const [priceRange, setPriceRange] = useState([0, 5000]);
    const [location, setLocation] = useState("");
    const [listingType, setListingType] = useState("all");
    
    const toggleCategory = (categoryName: string) => {
        setExpandedCategories((prev) =>
        prev.includes(categoryName)
            ? prev.filter((c) => c !== categoryName)
            : [...prev, categoryName]
        );
    };

    const formatDistance = (value: number) => {
        if (value >= 299) return "Anywhere";
        return `${value} km`;
    };

    const formatPrice = (value: number) => {
        if (value >= 10000) return "< $10,000";
        return `$${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    };

    return (
        <div className="bg-white min-h-screen text-black">
            <Header/>
            <CategoryNav/>
            <div className="bg-gray-200 border-b border-gray-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-32 lg:h-36 flex items-center justify-center">
                    <span className="text-gray-500 font-medium">Ad placeholder</span>
                </div>
                </div>
            </div>


            <main className="flex-1">
                <div className="max-w-7xl mx-auto p-5">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
                        All Listings
                    </h1>

                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="w-full lg:w-1/4 lg:overflow-y-auto lg:h-[800px] border p-4 rounded-lg">
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900 mb-3">Categories</h1>
                            <div className="space-y-1 overflow-y-auto pr-2">
                                {categories.map((category) => (
                                    <div key={category.name}>
                                    <button
                                        onClick={() => toggleCategory(category.name)}
                                        className="w-full flex items-center justify-between py-2 px-2 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-brand-green transition-colors text-sm font-medium"
                                    >
                                        <span>{category.name}</span>
                                        {expandedCategories.includes(category.name) ? (
                                        <ChevronDown className="h-4 w-4" />
                                        ) : (
                                        <ChevronRight className="h-4 w-4" />
                                        )}
                                    </button>
                                    {expandedCategories.includes(category.name) && (
                                        <div className="ml-4 space-y-1 border-l-2 border-gray-100 pl-3">
                                        {category.subcategories.map((sub) => (
                                            <button
                                            key={sub}
                                            className="block w-full text-left py-1.5 px-2 rounded text-gray-600 hover:text-brand-green hover:bg-green-50 transition-colors text-sm"
                                            >
                                            {sub}
                                            </button>
                                        ))}
                                        </div>
                                    )}
                                    </div>
                                ))}
                                </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Location</h3>
                            <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Enter city or address"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="pl-10"
                            />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">Distance</h3>
                            <span className="text-sm font-medium text-brand-green">
                                {formatDistance(distance[0])}
                            </span>
                            </div>
                            <Slider
                            value={distance}
                            onValueChange={setDistance}
                            max={299}
                            step={1}
                            className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0 km</span>
                            <span>Anywhere</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">Price Range ($)</h3>
                            </div>
                            <Slider
                            value={priceRange}
                            onValueChange={setPriceRange}
                            max={10000}
                            step={100}
                            className="w-full"
                            />
                            <div className="flex justify-between text-sm text-gray-600 mt-2">
                            <span className="font-medium text-brand-green">{formatPrice(priceRange[0])}</span>
                            <span className="font-medium text-brand-green">{formatPrice(priceRange[1])}</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Type of Listings</h3>
                            <Select value={listingType} onValueChange={setListingType}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="work">Work</SelectItem>
                                <SelectItem value="workers">Workers</SelectItem>
                            </SelectContent>
                            </Select>
                        </div>

                        <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center border border-gray-200 mt-4">
                            <span className="text-gray-500 text-sm font-medium">Ad placeholder</span>
                        </div>
                        </div>
                        <div className="w-full lg:w-3/4 space-y-6">
                        <ListingsGrid />
                        </div>

                    </div>

                </div>

            </main>
            <Footer/>

        </div>
    );
}
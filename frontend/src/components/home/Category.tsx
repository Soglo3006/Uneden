"use client";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { categories } from "@/lib/categories";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CategoryNav() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full border-b border-gray-200 shadow-sm bg-white">
      <div className="relative flex items-center max-w-7xl mx-auto px-4 sm:px-5">

        {/* Bouton gauche */}
        <button
          onClick={() => scroll("left")}
          className="shrink-0 z-10 bg-white hover:bg-gray-100 border border-gray-200 rounded-full p-1.5 shadow-sm transition-colors cursor-pointer mr-2"
        >
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </button>

        {/* Liste scrollable */}
        <div
          ref={scrollRef}
          className="flex items-center gap-3 py-4 overflow-x-auto no-scrollbar scroll-smooth"
        >
          <Button className="bg-green-700 text-white hover:bg-green-800 cursor-pointer shrink-0 text-xs sm:text-sm">
            View All Listing
          </Button>

          {categories.map((category) => (
            <Select key={category.name}>
              <SelectTrigger className="w-[150px] sm:w-[170px] lg:w-[180px] cursor-pointer shrink-0 text-xs sm:text-sm">
                <SelectValue placeholder={category.name} />
              </SelectTrigger>
              <SelectContent>
                {category.subcategories?.map((subcategory) => (
                  <SelectItem key={subcategory} value={subcategory} className="cursor-pointer">
                    {subcategory}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>

        {/* Bouton droite */}
        <button
          onClick={() => scroll("right")}
          className="shrink-0 z-10 bg-white hover:bg-gray-100 border border-gray-200 rounded-full p-1.5 shadow-sm transition-colors cursor-pointer ml-2"
        >
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </button>

      </div>
    </div>
  );
}
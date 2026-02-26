"use client";
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
import { useEffect, useRef, useState } from "react";

export default function CategoryNav() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollIndicators = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
  };

  useEffect(() => {
    updateScrollIndicators();
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => updateScrollIndicators();
    el.addEventListener("scroll", handler);
    window.addEventListener("resize", handler);
    return () => {
      el.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
    };
  }, []);

  const scrollBy = (amount: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="w-full border-b border-gray-200 shadow-sm bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-5">
        <div className="flex sm:hidden items-center gap-3 py-3">
          <Button className="bg-green-700 text-white hover:bg-green-800 cursor-pointer flex-shrink-0 text-sm px-3 h-9">View All Listings</Button>
          <Select>
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue placeholder="Browse Categories" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {categories.map((category) => (
                <SelectGroup key={category.name}>
                  <SelectLabel>{category.name}</SelectLabel>
                  {category.subcategories?.map((subcategory) => (
                    <SelectItem key={subcategory} value={`${category.name}:${subcategory}`} className="cursor-pointer">
                      {subcategory}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="hidden sm:block relative py-5">
          {canScrollLeft && (
            <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-white to-transparent" />
          )}
          {canScrollRight && (
            <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent" />
          )}

          <div ref={scrollRef} className="flex items-center gap-4 overflow-x-auto whitespace-nowrap no-scrollbar px-10">
            <Button className="bg-green-700 text-white hover:bg-green-800 cursor-pointer flex-shrink-0 px-4 h-10">View All Listings</Button>
            {categories.map((category) => (
              <Select key={category.name}>
                <SelectTrigger className="min-w-[150px] md:min-w-[180px] cursor-pointer">
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

          <div className="absolute inset-y-0 left-2 hidden md:flex items-center">
            <Button
              variant="outline"
              size="icon"
              className="cursor-pointer"
              onClick={() => scrollBy(-320)}
              disabled={!canScrollLeft}
              aria-label="Scroll categories left"
            >
              <span className="sr-only">Left</span>
              ‹
            </Button>
          </div>
          <div className="absolute inset-y-0 right-2 hidden md:flex items-center">
            <Button
              variant="outline"
              size="icon"
              className="cursor-pointer"
              onClick={() => scrollBy(320)}
              disabled={!canScrollRight}
              aria-label="Scroll categories right"
            >
              <span className="sr-only">Right</span>
              ›
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
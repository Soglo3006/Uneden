"use client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/lib/categories";

export default function CategoryNav() {
  return (
    <div className="w-full border-b border-gray-200 shadow-sm bg-white">
      <div className="flex items-center space-x-5 py-5 max-w-7xl mx-auto overflow-x-auto whitespace-nowrap px-5 no-scrollbar">
        <Button>View All Listing</Button>
        {categories.map((category) => (
          <Select key={category.name}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={category.name} />
            </SelectTrigger>
            <SelectContent>
              {category.subcategories?.map((subcategory) => (
                <SelectItem key={subcategory} value={subcategory}>
                  {subcategory}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>
    </div>
  );
}
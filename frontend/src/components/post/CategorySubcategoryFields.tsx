"use client";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { categories } from "@/lib/categories";

interface Props {
  category: string;
  subcategory: string;
  posterType: string;
  onCategoryChange: (v: string) => void;
  onSubcategoryChange: (v: string) => void;
  onPosterTypeChange: (v: string) => void;
  categoryRequired?: boolean;
}

export default function CategorySubcategoryFields({
  category, subcategory, posterType,
  onCategoryChange, onSubcategoryChange, onPosterTypeChange,
  categoryRequired,
}: Props) {
  return (
    <div className="pb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label className="text-base font-medium text-gray-900">
            Category {categoryRequired && <span className="text-red-500">*</span>}
          </Label>
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger className="h-12 cursor-pointer">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.name} value={cat.name} className="cursor-pointer">
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-base font-medium text-gray-900">Subcategory</Label>
          <Select value={subcategory} onValueChange={onSubcategoryChange} disabled={!category}>
            <SelectTrigger className="h-12 cursor-pointer">
              <SelectValue placeholder="Select a subcategory" />
            </SelectTrigger>
            <SelectContent>
              {categories
                .find((c) => c.name === category)
                ?.subcategories.map((sub) => (
                  <SelectItem key={sub} value={sub} className="cursor-pointer">
                    {sub}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-base font-medium text-gray-900">Type of Poster</Label>
          <Select value={posterType} onValueChange={onPosterTypeChange}>
            <SelectTrigger className="h-12 cursor-pointer">
              <SelectValue placeholder="Individual or Company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual" className="cursor-pointer">Individual</SelectItem>
              <SelectItem value="company" className="cursor-pointer">Company</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

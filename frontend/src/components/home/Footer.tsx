"use client";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function Footer() {
  return (
    <footer className="bg-white text-gray-700 py-10 mt-20 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-5 py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
          <h1 className="text-lg font-semibold text-green-800 text-center md:text-left">FieldHearts</h1>

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <h1 className="cursor-pointer hover:text-green-700">About</h1>
            <h1 className="cursor-pointer hover:text-green-700">Contact</h1>
            <h1 className="cursor-pointer hover:text-green-700">Privacy Policy</h1>
            <h1 className="cursor-pointer hover:text-green-700">Terms of use</h1>
          </nav>

          <div className="flex justify-center">
            <ToggleGroup type="single" variant="outline" size="lg">
              <ToggleGroupItem value="EN">EN</ToggleGroupItem>
              <ToggleGroupItem value="FR">FR</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 max-w-7xl mx-auto"></div>

      <div className="mt-5 text-center text-sm text-gray-600">
        <p>© {new Date().getFullYear()} FieldHearts. All rights reserved.</p>
      </div>
    </footer>
  );
}
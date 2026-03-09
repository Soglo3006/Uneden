"use client";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function Footer() {
  return (
    <footer className="bg-green-900 text-gray-300 border-t border-green-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* Rangée principale */}
        <div className="flex flex-col items-center sm:flex-row sm:items-center sm:justify-between gap-6">

          {/* Logo */}
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-white">Uneden</h1>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 text-sm font-medium ">
            <a href="#" className="hover:text-white transition-colors cursor-pointer">About</a>
            <a href="#" className="hover:text-white transition-colors cursor-pointer">Contact</a>
            <a href="#" className="hover:text-white transition-colors cursor-pointer">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors cursor-pointer">Terms of Use</a>
          </nav>

          {/* Toggle langue */}
          <ToggleGroup type="single" variant="outline" className="border-green-700">
            <ToggleGroupItem value="EN" className="cursor-pointer text-sm px-3 h-8 text-white border-green-700 hover:bg-green-800">EN</ToggleGroupItem>
            <ToggleGroupItem value="FR" className="cursor-pointer text-sm px-3 h-8 text-white border-green-700 hover:bg-green-800">FR</ToggleGroupItem>
          </ToggleGroup>

        </div>

        {/* Séparateur */}
        <div className="border-t border-green-800 mt-8 pt-5 text-center">
          <p className="text-xs text-white">
            © {new Date().getFullYear()} FieldHearts. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
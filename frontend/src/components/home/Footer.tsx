"use client";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function Footer() {
  return (
    <footer className="bg-white text-gray-700 py-10 mt-20 border-t border-gray-500">
      <div className="max-w-7xl mx-auto px-5 py-8">
        <div className="flex flex-row justify-between items-center">
          <h1 className="justify-center">FieldHearts</h1>
          
          <nav className="flex flex-wrap space-x-5 justify-center">
            <h1>About</h1>
            <h1>Contact</h1>
            <h1>Privacy Policy</h1>
            <h1>Terms of use</h1>
          </nav>
          
          <div>
            <ToggleGroup type="single" variant="outline" size="lg">
              <ToggleGroupItem value="EN">
                <h1>EN</h1>
              </ToggleGroupItem>
              <ToggleGroupItem value="FR">
                <h1>FR</h1>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-400 max-w-7xl mx-auto"></div>
      
      <div className="mt-5 text-center">
        <p>© {new Date().getFullYear()} FieldHearts. All rights reserved.</p>
      </div>
    </footer>
  );
}
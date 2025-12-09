import {Search} from "lucide-react";
import {Input} from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { categories } from "@/lib/categories";
import { sampleListings } from "@/lib/listings";
import Link from "next/link"


export default function Header(){
    return (
        <div className="w-full border-b border-gray-200 shadow-sm bg-white">
        <div className="flex justify-center items-center space-x-5 p-5 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-green-800 cursor-pointer">FieldHearts</h1>
        <div className="flex items-center space-x-2">
          <Search/>
          <Input
          placeholder="What service are you looking for today"
          type="text"
          className="w-96"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[140px] border-gray-300 rounded-lg cursor-pointer">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all"  className="cursor-pointer">All Posts</SelectItem>
            <SelectItem value="find" className="cursor-pointer">Find Work</SelectItem>
            <SelectItem value="hire" className="cursor-pointer">Hire Worker</SelectItem>
          </SelectContent>
        </Select>
        <div>
          <Select defaultValue="canada">
            <SelectTrigger className="w-[140px] border-gray-300 rounded-lg cursor-pointer">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Country</SelectLabel>
                <SelectItem value="canada" className="cursor-pointer">Canada</SelectItem>
                <SelectItem value="USA" className="cursor-pointer">USA</SelectItem>
                <SelectItem value="UK" className="cursor-pointer">UK</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div>
          <ToggleGroup type="single" variant="outline" size="lg">
            <ToggleGroupItem value="EN" className="cursor-pointer">
              <h1>EN</h1>
            </ToggleGroupItem>
            <ToggleGroupItem value="FR" className="cursor-pointer">
              <h1>FR</h1>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div>
          <ButtonGroup>
            <div className="flex gap-4">
              <Link href="/login">
                <Button variant="outline" size="lg" className="cursor-pointer">Sign In</Button>
              </Link>

              <Link href="/register">
                <Button variant="outline" size="lg" className="cursor-pointer">Register</Button>
              </Link>
            </div>
          </ButtonGroup>
        </div>
        <div>
          <Link href="/post">
          <Button className="bg-green-700 text-white hover:bg-green-800 cursor-pointer">Post</Button>
          </Link>
        </div>
      </div>
      </div>
    )
}
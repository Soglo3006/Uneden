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


export default function HomePage() {

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="w-full border-b border-gray-200 shadow-sm bg-white">
        <div className="flex justify-center items-center space-x-5 p-5 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-green-800">FieldHearts</h1>
        <div className="flex items-center space-x-2">
          <Search/>
          <Input
          placeholder="What service are you looking for today"
          type="text"
          className="w-96"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[140px] border-gray-300 rounded-lg">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Posts</SelectItem>
            <SelectItem value="find">Find Work</SelectItem>
            <SelectItem value="hire">Hire Worker</SelectItem>
          </SelectContent>
        </Select>
        <div>
          <Select defaultValue="canada">
            <SelectTrigger className="w-[140px] border-gray-300 rounded-lg">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Country</SelectLabel>
                <SelectItem value="canada">Canada</SelectItem>
                <SelectItem value="USA">USA</SelectItem>
                <SelectItem value="UK">UK</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div>
          <ToggleGroup type="single" variant="outline" size="lg">
            <ToggleGroupItem value="EN" >
              <h1>EN</h1>
            </ToggleGroupItem>
            <ToggleGroupItem value="FR" >
              <h1>FR</h1>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div>
          <ButtonGroup>
            <Button variant="outline" size="lg">
              Sign In
            </Button>
            <Button variant="outline" size="lg">
              Register
            </Button>
          </ButtonGroup>
        </div>
        <div>
          <Button>Post</Button>
        </div>
      </div>
      </div>
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

    </div>
  );
}

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

      <div className=" bg-gradient-to-br from-green-500 to-blue-150 py-20 ">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-10 text-center max-w-2xl mx-auto">
            <h1 className="text-3xl font-semibold mb-2 ">Find the help you need. <br/>
            Offer the skills you have.</h1>
            <p className="text-gray-600">
              Connect with your local community for services and opportunities
            </p>
          </div>
      </div>

      <div className="max-w-7xl mx-auto p-5">
        <h2 className="text-2xl font-bold mb-5">Recently added near you</h2>

        <div className=" grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="grid lg:col-span-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            <div className="border rounded-xl shadow-sm p-3">
              <img src="/placeholder.jpg" className="w-full h-32 object-cover rounded-lg" />
              <h3 className="font-semibold mt-3">Professional House Cleaning</h3>
              <p className="text-green-700 font-semibold">$20–40/hr</p>
              <p className="text-gray-500 text-sm">Toronto, ON · 2 hours ago</p>
            </div>

            <div className="border rounded-xl shadow-sm p-3">
              <img src="/placeholder.jpg" className="w-full h-32 object-cover rounded-lg" />
              <h3 className="font-semibold mt-3">Math Tutoring for High School</h3>
              <p className="text-green-700 font-semibold">$30–50/hr</p>
              <p className="text-gray-500 text-sm">Vancouver, BC · 5 hours ago</p>
            </div>

            <div className="border rounded-xl shadow-sm p-3">
              <img src="/placeholder.jpg" className="w-full h-32 object-cover rounded-lg" />
              <h3 className="font-semibold mt-3">Professional House Cleaning</h3>
              <p className="text-green-700 font-semibold">$20–40/hr</p>
              <p className="text-gray-500 text-sm">Toronto, ON · 2 hours ago</p>
            </div>

            <div className="border rounded-xl shadow-sm p-3">
              <img src="/placeholder.jpg" className="w-full h-32 object-cover rounded-lg" />
              <h3 className="font-semibold mt-3">Math Tutoring for High School</h3>
              <p className="text-green-700 font-semibold">$30–50/hr</p>
              <p className="text-gray-500 text-sm">Vancouver, BC · 5 hours ago</p>
            </div>

            <div className="border rounded-xl shadow-sm p-3">
              <img src="/placeholder.jpg" className="w-full h-32 object-cover rounded-lg" />
              <h3 className="font-semibold mt-3">Math Tutoring for High School</h3>
              <p className="text-green-700 font-semibold">$30–50/hr</p>
              <p className="text-gray-500 text-sm">Vancouver, BC · 5 hours ago</p>
            </div>

            <div className="border rounded-xl shadow-sm p-3">
              <img src="/placeholder.jpg" className="w-full h-32 object-cover rounded-lg" />
              <h3 className="font-semibold mt-3">Professional House Cleaning</h3>
              <p className="text-green-700 font-semibold">$20–40/hr</p>
              <p className="text-gray-500 text-sm">Toronto, ON · 2 hours ago</p>
            </div>

            <div className="border rounded-xl shadow-sm p-3">
              <img src="/placeholder.jpg" className="w-full h-32 object-cover rounded-lg" />
              <h3 className="font-semibold mt-3">Math Tutoring for High School</h3>
              <p className="text-green-700 font-semibold">$30–50/hr</p>
              <p className="text-gray-500 text-sm">Vancouver, BC · 5 hours ago</p>
            </div>

            <div className="border rounded-xl shadow-sm p-3">
              <img src="/placeholder.jpg" className="w-full h-32 object-cover rounded-lg" />
              <h3 className="font-semibold mt-3">Math Tutoring for High School</h3>
              <p className="text-green-700 font-semibold">$30–50/hr</p>
              <p className="text-gray-500 text-sm">Vancouver, BC · 5 hours ago</p>
            </div>

            <div className="border rounded-xl shadow-sm p-3">
              <img src="/placeholder.jpg" className="w-full h-32 object-cover rounded-lg" />
              <h3 className="font-semibold mt-3">Professional House Cleaning</h3>
              <p className="text-green-700 font-semibold">$20–40/hr</p>
              <p className="text-gray-500 text-sm">Toronto, ON · 2 hours ago</p>
            </div>

            <div className="border rounded-xl shadow-sm p-3">
              <img src="/placeholder.jpg" className="w-full h-32 object-cover rounded-lg" />
              <h3 className="font-semibold mt-3">Math Tutoring for High School</h3>
              <p className="text-green-700 font-semibold">$30–50/hr</p>
              <p className="text-gray-500 text-sm">Vancouver, BC · 5 hours ago</p>
            </div>

            <div className="col-span-full mt-10">
              <h1 className="text-3xl font-bold mb-5">Popular Categories</h1>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-5">
                {categories.map((category)=>(
                  <div key={category.name} className="relative w-full aspect-[4/3] h-full rounded-xl overflow-hidden cursor-pointer group">
                  <img 
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h2 className="text-white text-lg font-semibold drop-shadow-lg">
                      {category.name}
                    </h2>
                  </div>
                </div>
              ))}
              </div>
            </div>

            <div className="col-span-full mt-10 bg-green-800 rounded-2xl p-10 text-center text-white">
              <h1 className="text-3xl font-bold mb-2">Together, we all bring something valuable</h1>
              <h1>Join now to discover nearby help and new earning opportunities</h1>
              <Button className="mt-4">Sign In</Button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl h-[200px] col-span-full flex items-center justify-center text-gray-500">
              Advertisement<br/>728×90
            </div>

            <div className="col-span-full mt-10 ">
              <h1 className="text-2xl font-bold mb-5">Listing near you</h1>
              <div className="grid lg:col-span-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {sampleListings.map((listing) => (
                  <div key={listing.title} className="border rounded-xl shadow-sm p-3">
                    <img src={listing.image} className="w-full h-32 object-cover rounded-lg" />
                    <h3 className="font-semibold mt-3">{listing.title}</h3>
                    <p className="text-green-700 font-semibold">{listing.price}</p>
                    <p className="text-gray-500 text-sm">{listing.location} · {listing.created_at}</p>
                  </div>
                ))}
              </div>

            </div>

          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-xl h-[300px] flex items-center justify-center text-gray-500">
              Advertisement<br/>300×600
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-xl h-[250px] flex items-center justify-center text-gray-500">
              Advertisement<br/>300×250
            </div>
          </div>

        </div>

      </div>

      <footer className="bg-white text-gray-700 py-10 mt-20 border-t border-gray-500">
        <div className="max-w-7xl mx-auto px-5 py-8">
        <div className="flex flex-row justify-between items-center">
          <h1 className="justify-center">FieldHearts</h1>
          <nav className="flex flex-wrap space-x-5 justify-center ">
          <h1>About</h1>
          <h1>Contact</h1>
          <h1>Privacy Policy</h1>
          <h1>Terms of use</h1>
          </nav>
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
        </div>
        </div>
        <div className="border-t border-gray-400 max-w-7xl mx-auto"></div>
        <div className="mt-5 text-center">
          <p> © {new Date().getFullYear()} FieldHearts. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}

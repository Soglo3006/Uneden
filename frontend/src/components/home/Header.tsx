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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useRouter } from "next/navigation";
import { User, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link"


export default function Header(){
    const { user, signOut } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
      await signOut();
      router.push("/");
    };
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
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer h-10 w-10 border-2 border-green-700">
                  <AvatarImage 
                    src={user.user_metadata?.avatar || ""} 
                    alt={user.user_metadata?.full_name || "User"} 
                  />
                  <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                    {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.user_metadata?.full_name || "User"}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/profile/${user.id}`} className="cursor-pointer flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/edit" className="cursor-pointer flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleSignOut} 
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <ButtonGroup>
              <div className="flex gap-4">
                <Link href="/login">
                  <Button variant="outline" size="lg" className="cursor-pointer">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" size="lg" className="cursor-pointer">
                    Register
                  </Button>
                </Link>
              </div>
            </ButtonGroup>
          )}
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
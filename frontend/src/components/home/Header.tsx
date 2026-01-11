import { Search, User, Settings, LogOut, Building2, List, Wallet  } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import SettingsPage from "@/components/profile/Settings";
import { useRef, useState, useEffect } from "react";
import { MessageCircle, Heart } from 'lucide-react';

export default function Header() {
  const { user, signOut, session } = useAuth();
  const router = useRouter();

  const [showSettings, setShowSettings] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const settingsScrollRef = useRef(null);

  // Fetch profile data to determine account type
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !session?.access_token) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/profiles/me`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [user, session]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // Déterminer le type de compte et les informations à afficher
  const isPerson = profileData?.account_type === "person";
  const isCompany = profileData?.account_type === "company";
  
  const displayName = isPerson
    ? profileData?.full_name
    : profileData?.company_name;
  
  const avatarUrl = profileData?.avatar || user?.user_metadata?.avatar || "";
  
  const fallbackInitial = displayName
    ? displayName.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <div className="w-full border-b border-gray-200 shadow-sm bg-white">
      <div className="flex justify-center items-center space-x-5 p-5 max-w-7xl mx-auto">
        <Link href="/">
          <h1 className="text-2xl font-bold text-green-800 cursor-pointer">
            FieldHearts
          </h1>
        </Link>

        <div className="flex items-center space-x-2">
          <Search />
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
            <SelectItem value="all" className="cursor-pointer">
              All Posts
            </SelectItem>
            <SelectItem value="find" className="cursor-pointer">
              Find Work
            </SelectItem>
            <SelectItem value="hire" className="cursor-pointer">
              Hire Worker
            </SelectItem>
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
                <SelectItem value="canada" className="cursor-pointer">
                  Canada
                </SelectItem>
                <SelectItem value="USA" className="cursor-pointer">
                  USA
                </SelectItem>
                <SelectItem value="UK" className="cursor-pointer">
                  UK
                </SelectItem>
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

        {user && (
          <div className="flex items-center gap-3">
            <Link href="/favorites">
              <Button variant="ghost" size="icon" className="relative cursor-pointer hover:bg-gray-100">
                <Heart className="h-10 w-10 text-gray-700" />
              </Button>
            </Link>
            <Link href="/messages">
              <Button variant="ghost" size="icon" className="relative cursor-pointer hover:bg-gray-100">
                <MessageCircle className="h-10 w-10 text-gray-700" />
              </Button>
            </Link>
          </div>
        )}

        <div>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="relative cursor-pointer">
                  <Avatar className="h-10 w-10 border-2 border-green-700">
                    <AvatarImage src={avatarUrl} alt={displayName || "User"} />
                    <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                      {fallbackInitial}
                    </AvatarFallback>
                  </Avatar>
                  {isCompany && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-0.5">
                      <Building2 className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="px-2 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">
                      {displayName || user.email}
                    </p>
                    {isCompany && (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                        <Building2 className="h-2.5 w-2.5 mr-1" />
                        Company
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  {profileData && (
                    <p className="text-xs text-gray-400 mt-1">
                      {isPerson && profileData.profession && (
                        <span>{profileData.profession}</span>
                      )}
                      {isCompany && profileData.industry && (
                        <span>{profileData.industry}</span>
                      )}
                    </p>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <div
                    className="cursor-pointer flex items-center"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    <span>{isPerson ? "My Wallet" : "Company's Wallet"}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <div
                    className="cursor-pointer flex items-center"
                  >
                    <List className="mr-2 h-4 w-4" />
                    <span>{isPerson ? "My Listings" : "Company's Listings"}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/profile/${user.id}`}
                    className="cursor-pointer flex items-center"
                  >
                    {isPerson ? (
                      <User className="mr-2 h-4 w-4" />
                    ) : (
                      <Building2 className="mr-2 h-4 w-4" />
                    )}
                    <span>{isPerson ? "My Profile" : "Company Profile"}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <div
                    className="cursor-pointer flex items-center"
                    onClick={() => setShowSettings(true)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log Out</span>
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
            <Button className="bg-green-700 text-white hover:bg-green-800 cursor-pointer">
              Post
            </Button>
          </Link>
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div
            className="w-full max-w-3xl max-h-[90vh] bg-white rounded-xl shadow-xl p-6 overflow-y-auto animate-in fade-in duration-200"
            ref={settingsScrollRef}
          >
            <SettingsPage
              onClose={() => setShowSettings(false)}
              scrollRef={settingsScrollRef}
            />
          </div>
        </div>
      )}
    </div>
  );
}
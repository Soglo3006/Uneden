// frontend/src/components/home/Header.tsx
import { Search, User, Settings, LogOut, Building2, List, Wallet } from "lucide-react";
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
import { Heart } from "lucide-react";
import MessageNotifications from "@/components/messages/MessageNotifications";

export default function Header() {
  const { user, signOut, session } = useAuth();
  const router = useRouter();

  const [showSettings, setShowSettings] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const settingsScrollRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !session?.access_token) return;
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/profiles/me`,
          { headers: { Authorization: `Bearer ${session.access_token}` } }
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
  };

  const isPerson = profileData?.account_type === "person";
  const isCompany = profileData?.account_type === "company";
  const displayName = isPerson ? profileData?.full_name : profileData?.company_name;
  const avatarUrl = profileData?.avatar || user?.user_metadata?.avatar || "";
  const fallbackInitial = displayName
    ? displayName.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "U";

  const UserDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative cursor-pointer">
          <Avatar className="h-9 w-9 lg:h-10 lg:w-10 border-4 border-white shadow-lg">
            <AvatarImage src={avatarUrl} alt={displayName || "User"} />
            <AvatarFallback className="text-sm">{fallbackInitial}</AvatarFallback>
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
            <p className="text-sm font-medium">{displayName || user?.email}</p>
            {isCompany && (
              <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                <Building2 className="h-2.5 w-2.5 mr-1" />
                Company
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-500">{user?.email}</p>
          {profileData && (
            <p className="text-xs text-gray-400 mt-1">
              {isPerson && profileData.profession && <span>{profileData.profession}</span>}
              {isCompany && profileData.industry && <span>{profileData.industry}</span>}
            </p>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <div className="cursor-pointer flex items-center">
            <Wallet className="mr-2 h-4 w-4" />
            <span>{isPerson ? "My Wallet" : "Company's Wallet"}</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <div className="cursor-pointer flex items-center">
            <List className="mr-2 h-4 w-4" />
            <span>{isPerson ? "My Listings" : "Company's Listings"}</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/profile/${user?.id}`} className="cursor-pointer flex items-center">
            {isPerson ? <User className="mr-2 h-4 w-4" /> : <Building2 className="mr-2 h-4 w-4" />}
            <span>{isPerson ? "My Profile" : "Company Profile"}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <div className="cursor-pointer flex items-center" onClick={() => setShowSettings(true)}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <div className="w-full border-b border-gray-200 shadow-sm bg-white">
        <div className="max-w-7xl mx-auto px-4">

          {/* ── RANGÉE 1 : Logo + Search + actions droite ── */}
          <div className="flex items-center justify-between py-3 gap-3">

            {/* Logo — taille fixe sur tous les écrans */}
            <Link href="/">
              <h1 className="text-2xl font-bold text-green-800 cursor-pointer whitespace-nowrap">
                Uneden
              </h1>
            </Link>

            {/* Search — visible sur tous les écrans */}
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-1.5 flex-1 max-w-xs sm:max-w-sm lg:max-w-md">
              <Search className="shrink-0 text-gray-400 mr-2" size={16} />
              <input
                placeholder="Search a service..."
                type="text"
                className="w-full text-sm outline-none bg-transparent placeholder:text-gray-400"
              />
            </div>

            {/* Selects + Toggle — desktop seulement */}
            <div className="hidden lg:flex items-center gap-3">
              <Select defaultValue="all">
                <SelectTrigger className="w-[130px] xl:w-[140px] border-gray-300 rounded-lg cursor-pointer">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="cursor-pointer">All Posts</SelectItem>
                  <SelectItem value="find" className="cursor-pointer">Find Work</SelectItem>
                  <SelectItem value="hire" className="cursor-pointer">Hire Worker</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="canada">
                <SelectTrigger className="w-[130px] xl:w-[140px] border-gray-300 rounded-lg cursor-pointer">
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

              <ToggleGroup type="single" variant="outline">
                <ToggleGroupItem value="EN" className="cursor-pointer text-sm px-3 h-8">EN</ToggleGroupItem>
                <ToggleGroupItem value="FR" className="cursor-pointer text-sm px-3 h-8">FR</ToggleGroupItem>
              </ToggleGroup>

              
            </div>

            {/* Actions droite — toujours visibles */}
            <div className="flex items-center gap-2 shrink-0">
              {user && (
                <>
                  <MessageNotifications />
                  <Link href="/favorites">
                    <Button variant="ghost" size="icon" className="cursor-pointer hover:bg-gray-100">
                      <Heart className="h-5 w-5 text-gray-700" />
                    </Button>
                  </Link>
                </>
              )}

              {user ? (
                <UserDropdown />
              ) : (
                <div className="flex gap-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="cursor-pointer">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="outline" size="sm" className="cursor-pointer hidden sm:flex">Register</Button>
                  </Link>
                </div>
              )}

              <Link href="/post">
                <Button className="hidden lg:flex bg-green-700 text-white hover:bg-green-800 cursor-pointer">
                  Post
                </Button>
                <Button size="icon" className="lg:hidden bg-green-700 text-white hover:bg-green-800 cursor-pointer font-bold text-lg">
                  +
                </Button>
              </Link>
            </div>
          </div>

          {/* ── RANGÉE 2 : Filtres centrés — mobile/tablette seulement ── */}
          <div className="flex lg:hidden items-center justify-center gap-2 pb-3">
            <Select defaultValue="all">
              <SelectTrigger className="w-[110px] shrink-0 border-gray-300 rounded-lg cursor-pointer text-xs">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">All Posts</SelectItem>
                <SelectItem value="find" className="cursor-pointer">Find Work</SelectItem>
                <SelectItem value="hire" className="cursor-pointer">Hire Worker</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="canada">
              <SelectTrigger className="w-[100px] shrink-0 border-gray-300 rounded-lg cursor-pointer text-xs">
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

            <ToggleGroup type="single" variant="outline" className="shrink-0">
              <ToggleGroupItem value="EN" className="cursor-pointer text-xs px-2 h-8">EN</ToggleGroupItem>
              <ToggleGroupItem value="FR" className="cursor-pointer text-xs px-2 h-8">FR</ToggleGroupItem>
            </ToggleGroup>
          </div>

        </div>

        {/* Settings modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
            <div
              className="w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] bg-white rounded-xl shadow-xl p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200 mx-2 sm:mx-4"
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
    </>
  );
}
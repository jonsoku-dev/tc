import type { Database } from "database.types";
import {
  BellIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import { Link } from "react-router";
import { AlertIndicator } from "~/features/alerts/components/alert-indicator";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";
import { Separator } from "./ui/separator";
import { Bell, Book, BookMarked, MessageSquare, ShoppingCart, Star, User } from "lucide-react";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const commonMenus = [
  {
    name: "전자책",
    href: "/ebooks",
    icon: Book,
  },
  {
    name: "인터뷰",
    href: "/interviews",
    icon: MessageSquare,
  },
];

const userMenus = [
  {
    name: "구매 내역",
    href: "/purchases",
    icon: ShoppingCart,
  },
  {
    name: "구독 관리",
    href: "/subscriptions",
    icon: Star,
  },
  {
    name: "활동",
    href: "/activities",
    icon: BookMarked,
  },
];

export default function Navigation({ unreadAlertCount, profile }: { unreadAlertCount: number, profile: Profile | null }) {
  const user = profile;
  const isLoggedIn = !!user;
  const isAdvertiser = user?.role === "ADVERTISER";
  const isInfluencer = user?.role === "INFLUENCER";
  const isAdmin = user?.role === "ADMIN";

  const renderMenuItems = (menu: typeof commonMenus[0]) => (
    <Button key={menu.href} variant="ghost" asChild>
      <Link to={menu.href} className="flex items-center gap-2">
        <menu.icon className="h-4 w-4" />
        {menu.name}
      </Link>
    </Button>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <Book className="h-6 w-6" />
          <span className="hidden font-bold sm:inline-block">
            전자책 플랫폼
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-2">
            {commonMenus.map(renderMenuItems)}
          </nav>

          <nav className="flex items-center space-x-2">
            {profile ? (
              <>
                {userMenus.map(renderMenuItems)}

                <Button variant="ghost" size="icon" asChild>
                  <Link to="/notifications" className="relative">
                    <Bell className="h-4 w-4" />
                    {unreadAlertCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                        {unreadAlertCount}
                      </span>
                    )}
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile.profile_id} alt={profile.name || "사용자"} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{profile.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">@{profile.username}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/auth/logout">로그아웃</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button variant="default" asChild>
                <Link to="/auth/login">로그인</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

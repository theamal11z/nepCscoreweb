import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { Bell, Home, Calendar, Users, BarChart3, Settings, LogOut, Menu, Trophy } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "organizer":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "player":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "fan":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  // Navigation items for all roles - role-specific dashboards
  const navigationItems = [
    // Role-specific dashboard pages
    {
      href: "/fan-dashboard",
      label: "Dashboard",
      icon: Home,
      roles: ["fan"],
    },
    {
      href: "/organizer-dashboard",
      label: "Dashboard",
      icon: Home,
      roles: ["organizer"],
    },
    {
      href: "/player-dashboard",
      label: "Dashboard",
      icon: Home,
      roles: ["player"],
    },
    {
      href: "/admin-dashboard",
      label: "Dashboard",
      icon: Home,
      roles: ["admin"],
    },
    // Fan-specific pages
    {
      href: "/matches-browse",
      label: "Matches",
      icon: Calendar,
      roles: ["fan"],
    },
    {
      href: "/teams-browse",
      label: "Teams",
      icon: Users,
      roles: ["fan"],
    },
    {
      href: "/players-browse",
      label: "Players",
      icon: Users,
      roles: ["fan"],
    },
    {
      href: "/fan-following",
      label: "Following",
      icon: BarChart3,
      roles: ["fan"],
    },
    // Organizer pages
    {
      href: "/matches",
      label: "Manage Matches",
      icon: Calendar,
      roles: ["organizer"],
    },
    {
      href: "/teams",
      label: "Manage Teams",
      icon: Users,
      roles: ["organizer"],
    },
    {
      href: "/tournaments",
      label: "Tournaments",
      icon: Trophy,
      roles: ["organizer"],
    },
    {
      href: "/stats",
      label: "Statistics",
      icon: BarChart3,
      roles: ["organizer"],
    },
    // Player pages
    {
      href: "/matches",
      label: "Matches",
      icon: Calendar,
      roles: ["player"],
    },
    {
      href: "/teams",
      label: "Teams",
      icon: Users,
      roles: ["player"],
    },
    {
      href: "/stats",
      label: "Statistics",
      icon: BarChart3,
      roles: ["player"],
    },
    // Admin pages
    {
      href: "/admin",
      label: "Admin Panel",
      icon: Settings,
      roles: ["admin"],
    },
  ];

  const filteredNavItems = navigationItems.filter(item => 
    item.roles.includes(user.role)
  );

  const NavItems = ({ isMobile = false }) => (
    <>
      {filteredNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.href;
        
        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant={isActive ? "default" : "ghost"}
              className={`${isMobile ? "w-full justify-start" : ""} ${
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`h-4 w-4 ${isMobile ? "mr-2" : ""}`} />
              {isMobile && item.label}
            </Button>
          </Link>
        );
      })}
    </>
  );

  return (
    <nav className="bg-white dark:bg-card border-b border-border fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - redirects to role-specific dashboard */}
          <Link href={user.role === "fan" ? "/fan-dashboard" : 
                 user.role === "organizer" ? "/organizer-dashboard" : 
                 user.role === "player" ? "/player-dashboard" : 
                 "/admin-dashboard"}>
            <div className="flex items-center">
              <div className="text-2xl font-bold text-primary">nepCscore</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:space-x-2">
            <NavItems />
          </div>

          {/* User menu and mobile menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications Bell - Only for fan users */}
            {user.role === "fan" && (
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white font-medium">3</span>
                </Button>
              </Link>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.fullName}</p>
                    <p className="text-xs leading-none text-muted-foreground">@{user.username}</p>
                    <Badge variant="secondary" className={`w-fit text-xs ${getRoleBadgeColor(user.role)}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
                {user.role === "player" && (
                  <DropdownMenuItem asChild>
                    <Link href={`/player/${user.id}`}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      <span>My Statistics</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-4">
                  <div className="flex items-center space-x-3 pb-4 border-b">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                      <Badge variant="secondary" className={`w-fit text-xs mt-1 ${getRoleBadgeColor(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <NavItems isMobile />
                  <div className="pt-4 border-t">
                    <Button variant="ghost" className="w-full justify-start text-red-600 dark:text-red-400" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

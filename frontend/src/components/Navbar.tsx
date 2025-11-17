import { Button } from "./ui/button";
// @ts-ignore
import { Bell, Settings, User, LogOut, Activity } from "lucide-react";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { UserButton } from "@clerk/clerk-react";

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  unreadAlerts?: number;
}

export function Navbar({ onNavigate, currentPage, unreadAlerts = 0 }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate("dashboard")}>
            <Activity className="w-8 h-8 text-red-600" />
            <div>
              <h1 className="text-sm">EarthGuard</h1>
              <p className="text-xs text-gray-500">Earthquake Monitor</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Button
              variant={currentPage === "dashboard" ? "secondary" : "ghost"}
              onClick={() => onNavigate("dashboard")}
            >
              Dashboard
            </Button>
            <Button
              variant={currentPage === "devices" ? "secondary" : "ghost"}
              onClick={() => onNavigate("devices")}
            >
              Devices
            </Button>
            <Button
              variant={currentPage === "alerts" ? "secondary" : "ghost"}
              onClick={() => onNavigate("alerts")}
              className="relative"
            >
              Alerts
              {unreadAlerts > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-600">
                  {unreadAlerts}
                </Badge>
              )}
            </Button>
            {/*<Button*/}
            {/*  variant={currentPage === "statistics" ? "secondary" : "ghost"}*/}
            {/*  onClick={() => onNavigate("statistics")}*/}
            {/*>*/}
            {/*  Statistics*/}
            {/*</Button>*/}
              <Button
                  variant={currentPage === "settings" ? "secondary" : "ghost"}
                  onClick={() => onNavigate("settings")}
              >
                  Settings
              </Button>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => onNavigate("alerts")}
            >
              <Bell className="w-5 h-5" />
              {unreadAlerts > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
              )}
            </Button>
              <div className="ml-auto">
                  <UserButton afterSignOutUrl="/" />
              </div>
            {/*<DropdownMenu>*/}
            {/*  <DropdownMenuTrigger asChild>*/}
            {/*    <Button variant="ghost" size="icon">*/}
            {/*      <User className="w-5 h-5" />*/}
            {/*    </Button>*/}
            {/*  </DropdownMenuTrigger>*/}
            {/*  <DropdownMenuContent align="end" className="w-56">*/}
            {/*    <DropdownMenuLabel>*/}
            {/*      <div>*/}
            {/*        <p>John Doe</p>*/}
            {/*        <p className="text-xs text-gray-500">john@example.com</p>*/}
            {/*      </div>*/}
            {/*    </DropdownMenuLabel>*/}
            {/*    <DropdownMenuSeparator />*/}
            {/*    <DropdownMenuItem onClick={() => onNavigate("settings")}>*/}
            {/*      <Settings className="w-4 h-4 mr-2" />*/}
            {/*      Settings*/}
            {/*    </DropdownMenuItem>*/}
            {/*    <DropdownMenuSeparator />*/}
            {/*    <DropdownMenuItem onClick={() => onNavigate("login")}>*/}
            {/*      <LogOut className="w-4 h-4 mr-2" />*/}
            {/*      Logout*/}
            {/*    </DropdownMenuItem>*/}
            {/*  </DropdownMenuContent>*/}
            {/*</DropdownMenu>*/}
          </div>
        </div>
      </div>
    </nav>
  );
}

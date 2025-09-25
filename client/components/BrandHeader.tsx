import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Menu, Hammer, X, User, LogOut, Brain, Wifi, Link as LinkIcon } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import NotificationBell from "./NotificationBell";

export default function BrandHeader() {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((v) => !v);
  const { user, logout } = useAuth();

  const NavLinks = () => (
    <>
      <a href="#features" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">Features</a>
      <a href="#timeline" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">Timeline</a>
      <a href="#contact" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">Contact</a>
      {user && (
        <>
          <Link to="/dashboard" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">Dashboard</Link>
          <Link to="/projects" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">Projects</Link>
          <Link to="/analytics" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">Analytics</Link>
          <Link to="/ai-training" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center gap-1">
            <Brain className="h-3 w-3" />
            AI/ML
          </Link>
          <Link to="/iot-management" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center gap-1">
            <Wifi className="h-3 w-3" />
            IoT
          </Link>
          <Link to="/blockchain-marketplace" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center gap-1">
            <LinkIcon className="h-3 w-3" />
            Blockchain
          </Link>
          {user.role === 'admin' && (
            <Link to="/users" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">Users</Link>
          )}
          <Link to="/construction" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">Platform</Link>
        </>
      )}
    </>
  );

  const AuthButtons = () => {
    if (user) {
      return (
        <div className="flex items-center gap-2">
          <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user.avatar || user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium">{user.name}</p>
                <p className="w-[200px] truncate text-sm text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Link to="/login">
          <Button variant="ghost" size="sm">Sign in</Button>
        </Link>
        <Link to="/signup">
          <Button size="sm" className="rounded-full">Get started</Button>
        </Link>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Hammer className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">Construction Success</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <NavLinks />
        </nav>
        <div className="hidden md:block">
          <AuthButtons />
        </div>
        <button aria-label="Open menu" onClick={toggle} className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md border">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t md:hidden">
          <div className="container flex flex-col gap-4 py-4">
            <NavLinks />
            <div className="flex flex-col gap-2">
              <AuthButtons />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

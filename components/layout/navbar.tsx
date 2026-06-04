'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Compass,
  LayoutDashboard,
  GraduationCap,
  Target,
  FileText,
  Users,
  User,
  LogOut,
  Menu,
  Shield,
} from 'lucide-react';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const role = profile?.role;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-nuru-green-600 text-white font-bold text-sm">
            N
          </div>
          <span className="text-lg font-bold text-nuru-green-800 hidden sm:inline">NuruPath AI</span>
        </Link>

        {user && (
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
            <NavLink href="/assessment" icon={<Compass className="h-4 w-4" />} label="Assessment" />
            <NavLink href="/scholarships" icon={<GraduationCap className="h-4 w-4" />} label="Scholarships" />
            <NavLink href="/skills-gap" icon={<Target className="h-4 w-4" />} label="Skills Gap" />
            <NavLink href="/action-plan" icon={<FileText className="h-4 w-4" />} label="Action Plan" />
            {(role === 'counselor' || role === 'admin') && (
              <NavLink href="/counselor" icon={<Users className="h-4 w-4" />} label="Counselor" />
            )}
            {role === 'admin' && (
              <NavLink href="/admin" icon={<Shield className="h-4 w-4" />} label="Admin" />
            )}
          </nav>
        )}

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <MobileNav role={role} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-nuru-green-100 text-nuru-green-700 text-sm font-medium">
                      {profile?.full_name?.charAt(0) || 'U'}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{profile?.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{profile?.role || 'student'}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild className="bg-nuru-green-600 hover:bg-nuru-green-700">
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-nuru-green-700 hover:bg-nuru-green-50 rounded-md transition-colors">
      {icon}
      {label}
    </Link>
  );
}

function MobileNav({ role }: { role: string | null | undefined }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 md:hidden">
        <DropdownMenuItem asChild><Link href="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/assessment"><Compass className="mr-2 h-4 w-4" /> Assessment</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/scholarships"><GraduationCap className="mr-2 h-4 w-4" /> Scholarships</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/skills-gap"><Target className="mr-2 h-4 w-4" /> Skills Gap</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/action-plan"><FileText className="mr-2 h-4 w-4" /> Action Plan</Link></DropdownMenuItem>
        {(role === 'counselor' || role === 'admin') && (
          <DropdownMenuItem asChild><Link href="/counselor"><Users className="mr-2 h-4 w-4" /> Counselor Portal</Link></DropdownMenuItem>
        )}
        {role === 'admin' && (
          <DropdownMenuItem asChild><Link href="/admin"><Shield className="mr-2 h-4 w-4" /> Admin</Link></DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

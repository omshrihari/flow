"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  Activity,
  Plus,
  ChevronRight,
  LogOut,
  CreditCard,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logout } from "@/actions/auth";
import type { User } from "@supabase/supabase-js";

const navItems = [
  {
    title: "My Boards",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Activity",
    href: "/activity",
    icon: Activity,
  },
];

import { ThemeToggle } from "@/components/ThemeToggle";

export function Sidebar({ 
  user, 
  boards = { owned: [], collaborations: [] } 
}: { 
  user?: User | null,
  boards?: {
    owned: any[],
    collaborations: any[]
  }
}) {
  const pathname = usePathname();
  
  const email = user?.email || "user@example.com";
  const fullName = user?.user_metadata?.full_name || email.split('@')[0];
  const initials = fullName.slice(0, 2).toUpperCase();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-card/50 backdrop-blur-xl transition-all md:relative">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Flow
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4">
        {/* Nav omitted for brevity, keeping full content intact via replace chunking */}
        <nav className="space-y-6">
          <div className="space-y-1">
            <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">
              Menu
            </h3>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-muted hover:text-foreground",
                  pathname === item.href
                    ? "bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400"
                    : "text-muted-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    pathname === item.href
                      ? "text-blue-600 dark:text-blue-400"
                      : "group-hover:text-foreground"
                  )}
                />
                {item.title}
              </Link>
            ))}
          </div>

          {/* Owned Boards */}
          {boards.owned.length > 0 && (
            <div className="space-y-1">
              <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">
                My Boards
              </h3>
              {boards.owned.map((board) => (
                <Link
                  key={board.id}
                  href={`/board/${board.slug}`}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-muted hover:text-foreground",
                    pathname === `/board/${board.slug}`
                      ? "bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400"
                      : "text-muted-foreground"
                  )}
                >
                  <div 
                    className="h-2 w-2 rounded-full shrink-0" 
                    style={{ backgroundColor: board.background_color || '#3b82f6' }}
                  />
                  <span className="truncate">{board.title}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Collaborations */}
          {boards.collaborations.length > 0 && (
            <div className="space-y-1">
              <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">
                Collaborations
              </h3>
              {boards.collaborations.map((board) => (
                <Link
                  key={board.id}
                  href={`/board/${board.slug}`}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-muted hover:text-foreground",
                    pathname === `/board/${board.slug}`
                      ? "bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400"
                      : "text-muted-foreground"
                  )}
                >
                  <Users className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span className="truncate">{board.title}</span>
                </Link>
              ))}
            </div>
          )}
        </nav>
      </div>

      <div className="border-t p-4">
        <div className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-muted/50">
          <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
            {initials}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">{fullName}</p>
            <p className="truncate text-[10px] text-muted-foreground">
              {email}
            </p>
          </div>
          <ThemeToggle />
          <form action={async (formData) => { await logout(formData); }}>
            <Button type="submit" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );
}

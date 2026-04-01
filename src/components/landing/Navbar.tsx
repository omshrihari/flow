"use client";

import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-white/5 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl tracking-tight text-foreground">
            <span className="font-bold">Flow</span> <span className="text-sm font-medium text-muted-foreground ml-1">By Quotearn</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="#solutions" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Solutions
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="group bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer">
            Login / Signup
          </Link>
        </div>
      </div>
    </nav>
  );
}

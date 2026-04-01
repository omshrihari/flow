"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BoardOnboarding } from "@/components/dashboard/BoardOnboarding";

export function DashboardHeader() {
  const [isOnboardingOpen, setIsOnboardingOpen] = React.useState(false);

  return (
    <>
      <BoardOnboarding 
        isOpen={isOnboardingOpen} 
        onClose={() => setIsOnboardingOpen(false)} 
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Boards</h1>
          <p className="text-muted-foreground text-sm">
            Manage your projects and collaborate with your team
          </p>
        </div>
        <Button 
          onClick={() => setIsOnboardingOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Board
        </Button>
      </div>
    </>
  );
}

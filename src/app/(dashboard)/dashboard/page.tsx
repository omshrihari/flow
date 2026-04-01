import { Activity, Users, LayoutDashboard } from "lucide-react";
import { getBoards } from "@/actions/boards";
import { getDashboardActivities } from "@/actions/activities";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { BoardsList } from "@/components/dashboard/BoardsList";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

export default async function DashboardPage() {
  const { owned, collaborations } = await getBoards();
  const activities = await getDashboardActivities();

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-16 md:pt-8 space-y-12">
      <DashboardHeader />
      
      <div className="space-y-6">
        <h2 className="text-xl font-bold tracking-tight px-1 flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-blue-600" />
          Your Boards
        </h2>
        <BoardsList boards={owned} showCreateCard={true} />
      </div>

      {collaborations.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight px-1 text-muted-foreground flex items-center gap-2 border-t pt-8">
            <Users className="h-5 w-5" />
            Shared with You
          </h2>
          <BoardsList boards={collaborations} showCreateCard={false} />
        </div>
      )}

      <div className="space-y-6 pt-8 border-t border-border/50">
        <h2 className="text-xl font-bold tracking-tight px-1 flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-100 fill-blue-600" />
          Recent Activity
        </h2>
        <RecentActivity activities={activities} />
      </div>
    </div>
  );
}

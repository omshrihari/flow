import { getAllActivities } from "@/actions/activities";
import { ActivityList } from "@/components/dashboard/ActivityList";
import { Activity as ActivityIcon } from "lucide-react";

export default async function ActivityPage() {
  const activities = await getAllActivities(100);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-16 md:pt-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2 border-b pb-8 border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 text-blue-600">
          <ActivityIcon className="h-6 w-6 stroke-[3px]" />
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 uppercase italic">
            Activity Feed
          </h1>
        </div>
        <p className="text-muted-foreground text-sm font-medium pl-9 opacity-80">
          A comprehensive history of updates, card movements, and collaborator actions across all your boards.
        </p>
      </div>

      <div className="pb-20">
        <ActivityList activities={activities} />
      </div>
    </div>
  );
}

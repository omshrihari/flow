"use client"

import { Activity } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface RecentActivityProps {
  activities: any[]
}

const renderActivityMessage = (activity: any) => {
  const { action, payload } = activity;
  
  switch (action) {
    case 'create_board':
      return <span>created board <span className="font-bold tracking-tight text-slate-900 dark:text-slate-100">{payload.title}</span></span>;
    case 'delete_board':
      return <span>deleted board <span className="font-bold tracking-tight text-slate-900 dark:text-slate-100">{payload.title}</span></span>;
    case 'create_list':
      return <span>created list <span className="font-bold tracking-tight text-slate-900 dark:text-slate-100">{payload.title}</span></span>;
    case 'update_list':
      return <span>renamed list to <span className="font-bold tracking-tight text-slate-900 dark:text-slate-100">{payload.title}</span></span>;
    case 'delete_list':
      return <span>deleted list <span className="font-bold tracking-tight text-slate-900 dark:text-slate-100">{payload.title}</span></span>;
    case 'create_card':
      return (
        <span>
          added <span className="font-bold tracking-tight text-slate-900 dark:text-slate-100">{payload.title}</span>
          {payload.list && (
            <> to <span className="font-bold tracking-tight text-slate-900 dark:text-slate-100 italic"> {payload.list}</span></>
          )}
        </span>
      );
    case 'update_card':
      return <span>updated card <span className="font-bold tracking-tight text-slate-900 dark:text-slate-100">{payload.title}</span></span>;
    case 'delete_card':
      return <span>deleted card <span className="font-bold tracking-tight text-slate-900 dark:text-slate-100">{payload.title}</span></span>;
    case 'move_card':
      return (
        <span>
          moved <span className="font-bold tracking-tight text-slate-900 dark:text-slate-100">{payload.title}</span>
          {payload.fromList && payload.toList && (
            <> from <span className="font-bold tracking-tight text-slate-900 dark:text-slate-100 italic"> {payload.fromList}</span> to <span className="font-bold tracking-tight text-slate-900 dark:text-slate-100 italic"> {payload.toList}</span></>
          )}
        </span>
      );
    case 'accept_invite':
      return <span>joined the board</span>;
    default:
      return <span>performed an action</span>;
  }
};

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <div className="rounded-xl border bg-card/30 p-8 text-center backdrop-blur-sm">
        <Activity className="mx-auto h-8 w-8 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">No recent activity to show.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {activities.map((activity) => (
        <div 
          key={activity.id} 
          className="group relative flex flex-col gap-3 rounded-2xl border bg-card/60 p-4 transition-all hover:shadow-lg hover:border-blue-500/30 backdrop-blur-md"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-[10px] ring-2 ring-white dark:ring-slate-900 shadow-sm transition-transform group-hover:scale-105">
                {(activity.user?.name || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase()}
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[100px]">
                {activity.user?.name || "Someone"}
              </span>
            </div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
            </p>
          </div>

          <div className="flex-1 space-y-2">
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {renderActivityMessage(activity)}
            </p>
            
            {activity.board && (
              <Link 
                href={`/board/${activity.board.slug}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-muted/50 px-2 py-1 text-[10px] font-bold text-muted-foreground transition-colors hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                {activity.board.title}
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

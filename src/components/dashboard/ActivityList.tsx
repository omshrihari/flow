"use client"

import { Activity, Clock, Layout, Calendar } from "lucide-react"
import { formatDistanceToNow, format, isToday, isYesterday, startOfDay } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface ActivityListProps {
  activities: any[]
}

const renderActivityMessage = (activity: any) => {
  const { action, payload } = activity;
  
  switch (action) {
    case 'create_board':
      return <span>created board <span className="font-bold text-slate-900 dark:text-slate-100">{payload.title}</span></span>;
    case 'delete_board':
      return <span>deleted board <span className="font-bold text-slate-900 dark:text-slate-100">{payload.title}</span></span>;
    case 'create_list':
      return <span>created list <span className="font-bold text-slate-900 dark:text-slate-100">{payload.title}</span></span>;
    case 'update_list':
      return <span>renamed list to <span className="font-bold text-slate-900 dark:text-slate-100">{payload.title}</span></span>;
    case 'delete_list':
      return <span>deleted list <span className="font-bold text-slate-900 dark:text-slate-100">{payload.title}</span></span>;
    case 'create_card':
      return (
        <span>
          added <span className="font-bold text-slate-900 dark:text-slate-100">{payload.title}</span>
          {payload.list && (
            <> to <span className="font-bold text-slate-900 dark:text-slate-100 italic"> {payload.list}</span></>
          )}
        </span>
      );
    case 'update_card':
      return <span>updated card <span className="font-bold text-slate-900 dark:text-slate-100">{payload.title}</span></span>;
    case 'delete_card':
      return <span>deleted card <span className="font-bold text-slate-900 dark:text-slate-100">{payload.title}</span></span>;
    case 'move_card':
      return (
        <span>
          moved <span className="font-bold text-slate-900 dark:text-slate-100">{payload.title}</span>
          {payload.fromList && payload.toList && (
            <> from <span className="font-bold text-slate-900 dark:text-slate-100 italic"> {payload.fromList}</span> to <span className="font-bold text-slate-900 dark:text-slate-100 italic"> {payload.toList}</span></>
          )}
        </span>
      );
    case 'accept_invite':
      return <span>joined the board</span>;
    default:
      return <span>performed an action</span>;
  }
};

const getDateHeader = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
};

export function ActivityList({ activities }: ActivityListProps) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
        <Activity className="h-12 w-12 text-muted-foreground/20 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">No activity history found</h3>
        <p className="text-sm text-muted-foreground/60 max-w-xs text-center">
          Activities from all your boards will appear here as soon as they happen.
        </p>
      </div>
    )
  }

  // Group activities by date
  const grouped = activities.reduce((acc, activity) => {
    const date = format(startOfDay(new Date(activity.created_at)), "yyyy-MM-dd");
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, any[]>);

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-12">
      {sortedDates.map((dateKey) => (
        <div key={dateKey} className="space-y-4">
          <div className="sticky top-0 z-10 flex items-center gap-3 bg-background/80 py-2 backdrop-blur-md">
            <Calendar className="h-4 w-4 text-blue-600" />
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {getDateHeader(dateKey)}
            </h3>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-800" />
          </div>

          <div className="space-y-3">
            {grouped[dateKey].map((activity: any) => (
              <div 
                key={activity.id} 
                className="group flex items-center gap-4 p-4 rounded-xl border bg-card/60 backdrop-blur-sm transition-all hover:bg-muted/30 hover:shadow-md border-slate-200/60 dark:border-slate-800/60"
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-xs ring-2 ring-white dark:ring-slate-900 shadow-sm border dark:border-slate-800">
                    {(activity.user?.name || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {activity.user?.name || "Someone"}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                      <Clock className="h-2.5 w-2.5" />
                      {format(new Date(activity.created_at), "h:mm a")}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug">
                    {renderActivityMessage(activity)}
                  </p>
                </div>

                {/* Board Badge */}
                {activity.board && (
                  <Link 
                    href={`/board/${activity.board.slug}`}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border text-[10px] font-bold text-muted-foreground transition-all hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:border-transparent group/badge"
                  >
                    <Layout className="h-3 w-3 opacity-60 group-hover/badge:opacity-100 transition-opacity" />
                    <span className="max-w-[100px] truncate">{activity.board.title}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

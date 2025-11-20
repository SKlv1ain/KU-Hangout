"use client";
import { useEffect, useState, useMemo } from "react";
import userService, { type Contribution } from "@/services/userService";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LogIn, PlusCircle } from "lucide-react";

interface UserProfileContributionGraphProps {
  username: string;
}

// Generate dates for the last year (53 weeks)
function generateDateGrid() {
  const today = new Date();
  const dates: Date[] = [];
  
  // Start from 53 weeks ago
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (53 * 7));
  
  // Adjust to start of week (Sunday)
  const dayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - dayOfWeek);
  
  // Generate all dates
  for (let i = 0; i < 53 * 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date);
  }
  
  return dates;
}

// Get contribution level based on count
function getContributionLevel(count: number): number {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

export default function UserProfileContributionGraph({ username }: UserProfileContributionGraphProps) {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContributions = async () => {
      if (!username || username.trim() === "") {
        setLoading(false);
        return;
      }

      try {
        const data = await userService.getUserContributions(username);
        setContributions(data || []);
      } catch (error) {
        console.error("[UserProfileContributionGraph] Error loading contributions:", error);
        setContributions([]);
      } finally {
        setLoading(false);
      }
    };

    loadContributions();
  }, [username]);

  const dates = useMemo(() => generateDateGrid(), []);
  
  // Group contributions by date
  const contributionsByDate = useMemo(() => {
    const map = new Map<string, Contribution[]>();
    contributions.forEach((contrib) => {
      const dateKey = contrib.date;
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(contrib);
    });
    return map;
  }, [contributions]);

  // Get contribution data for a specific date
  const getDateContributions = (date: Date): Contribution[] => {
    const dateKey = date.toISOString().split('T')[0];
    return contributionsByDate.get(dateKey) || [];
  };

  // Get color class based on contribution level
  const getColorClass = (count: number, type: 'created' | 'joined' | 'mixed'): string => {
    const level = getContributionLevel(count);
    if (level === 0) return 'bg-neutral-200 dark:bg-neutral-800';
    
    if (type === 'created') {
      // Darker green for created plans
      const colors = [
        'bg-green-200 dark:bg-green-900',
        'bg-green-400 dark:bg-green-700',
        'bg-green-500 dark:bg-green-600',
        'bg-green-600 dark:bg-green-500',
        'bg-green-700 dark:bg-green-400',
      ];
      return colors[level - 1] || colors[0];
    } else {
      // Lighter green for joined plans
      const colors = [
        'bg-emerald-200 dark:bg-emerald-900',
        'bg-emerald-300 dark:bg-emerald-800',
        'bg-emerald-400 dark:bg-emerald-700',
        'bg-emerald-500 dark:bg-emerald-600',
        'bg-emerald-600 dark:bg-emerald-500',
      ];
      return colors[level - 1] || colors[0];
    }
  };

  // Organize dates into weeks (7 days per week, 53 weeks)
  const weeks = useMemo(() => {
    const weeksArray: Date[][] = [];
    for (let week = 0; week < 53; week++) {
      const weekDates: Date[] = [];
      for (let day = 0; day < 7; day++) {
        const index = week * 7 + day;
        if (index < dates.length) {
          weekDates.push(dates[index]);
        }
      }
      weeksArray.push(weekDates);
    }
    return weeksArray;
  }, [dates]);

  // Get month labels
  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = [];
    const seenMonths = new Set<string>();
    
    weeks.forEach((week, weekIndex) => {
      if (week.length > 0) {
        const firstDate = week[0];
        const month = firstDate.toLocaleDateString('en-US', { month: 'short' });
        if (!seenMonths.has(month) || weekIndex === 0) {
          labels.push({ month, weekIndex });
          seenMonths.add(month);
        }
      }
    });
    
    return labels;
  }, [weeks]);

  const timelineItems = useMemo(() => {
    if (!contributions.length) return [];
    return [...contributions]
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T00:00:00`);
        const dateB = new Date(`${b.date}T00:00:00`);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 6);
  }, [contributions]);

  const formatThaiDate = (value: string) => {
    try {
      const date = new Date(`${value}T00:00:00`);
      return date.toLocaleDateString("th-TH", {
        timeZone: "Asia/Bangkok",
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return value;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
        <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  const totalContributions = contributions.length;

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          {totalContributions} contributions in the last year
        </h3>
      </div>

      <div className="w-full">
        <div className="w-full">
          <div className="flex gap-0.5 w-full">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1 flex-shrink-0 w-8">
              {/* Empty space for month labels alignment */}
              <div className="h-4 mb-2"></div>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <div
                  key={day}
                  className="text-xs text-neutral-500 dark:text-neutral-400 h-2.5 flex items-center"
                  style={{ visibility: index % 2 === 0 ? 'visible' : 'hidden' }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Contribution grid container with relative positioning for month labels */}
            <div className="flex-1 relative">
              {/* Month labels - positioned relative to grid */}
              <div className="absolute top-0 left-0 right-0 h-4 mb-2">
                {monthLabels.map(({ month, weekIndex }) => {
                  // Calculate position: each week takes 1/53 of the grid width
                  // Position at the start of each week column
                  const position = (weekIndex / 53) * 100;
                  return (
                    <div
                      key={`${month}-${weekIndex}`}
                      className="text-xs text-neutral-500 dark:text-neutral-400 absolute"
                      style={{ 
                        left: `${position}%`,
                        transform: 'translateX(0)'
                      }}
                    >
                      {month}
                    </div>
                  );
                })}
              </div>

              {/* Contribution grid - use flex-1 to fill available space */}
              <div className="flex gap-0.5 mt-4">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-0.5 flex-1">
                  {week.map((date, dayIndex) => {
                    const dateContribs = getDateContributions(date);
                    const count = dateContribs.length;
                    const hasCreated = dateContribs.some(c => c.type === 'created');
                    const hasJoined = dateContribs.some(c => c.type === 'joined');
                    const type = hasCreated && hasJoined ? 'mixed' : hasCreated ? 'created' : 'joined';
                    
                    const dateStr = date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    });

                    return (
                      <TooltipProvider key={`${weekIndex}-${dayIndex}`}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`w-full aspect-square rounded-sm cursor-pointer transition-colors ${getColorClass(count, type)}`}
                              style={{ minHeight: '10px' }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1">
                              <p className="font-semibold">{count} {count === 1 ? 'contribution' : 'contributions'} on {dateStr}</p>
                              {dateContribs.length > 0 && (
                                <div className="text-xs space-y-0.5">
                                  {dateContribs.map((contrib, idx) => (
                                    <p key={idx} className="text-muted-foreground">
                                      {contrib.type === 'created' ? 'Created' : 'Joined'}: {contrib.plan_title}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-4 text-xs text-neutral-500 dark:text-neutral-400">
        <div className="flex items-center gap-4">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-neutral-200 dark:bg-neutral-800"></div>
            <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900"></div>
            <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700"></div>
            <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-600"></div>
            <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500"></div>
          </div>
          <span>More</span>
          <div className="ml-4 flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500"></div>
            <span>Created plans</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-600"></div>
            <span>Joined plans</span>
          </div>
        </div>

        {timelineItems.length > 0 && (
          <div className="mt-2">
            <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-3">Recent activity</h4>
            <div className="space-y-2">
              {timelineItems.map((item, index) => (
                <div
                  key={`${item.plan_id}-${index}`}
                  className="flex items-start gap-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800/60 bg-white/80 dark:bg-neutral-900/40 px-3.5 py-2.5 text-sm"
                >
                  <div className={`mt-0.5 rounded-full p-1 ${item.type === "created" ? "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300" : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300"}`}>
                    {item.type === "created" ? (
                      <PlusCircle className="h-4 w-4" />
                    ) : (
                      <LogIn className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="font-medium text-neutral-800 dark:text-neutral-50">
                      {item.type === "created" ? "Created a plan" : "Joined a plan"}
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-300">{item.plan_title}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {formatThaiDate(item.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

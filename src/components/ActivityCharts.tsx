import { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Timer, MessageSquare, TrendingUp, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { format, subDays, startOfWeek, parseISO, eachDayOfInterval, subWeeks, addDays } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface StaffActivityEntry {
  id: string;
  minutes: number;
  messages_sent: number;
  session_date: string;
  created_at?: string;
  source?: string;
}

interface ActivitySection {
  startTime: Date;
  endTime: Date;
  entries: StaffActivityEntry[];
  totalMinutes: number;
  totalMessages: number;
}

interface ActiveSession {
  id: string;
  started_at: string;
  game_name: string | null;
}

interface ActivityChartsProps {
  activity: StaffActivityEntry[];
  sections: ActivitySection[];
  showSections?: boolean;
  activeSession?: ActiveSession | null;
}

const fmtElapsed = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${m}:${String(sec).padStart(2, "0")}`;
};

const ActivitySectionCard = ({
  section,
  liveSession,
}: {
  section: ActivitySection;
  liveSession?: ActiveSession | null;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [elapsed, setElapsed] = useState(() =>
    liveSession
      ? Math.floor((Date.now() - new Date(liveSession.started_at).getTime()) / 1000)
      : 0
  );

  useEffect(() => {
    if (!liveSession) return;
    const id = setInterval(
      () => setElapsed(Math.floor((Date.now() - new Date(liveSession.started_at).getTime()) / 1000)),
      1000
    );
    return () => clearInterval(id);
  }, [liveSession?.started_at]);

  const duration = Math.round((section.endTime.getTime() - section.startTime.getTime()) / 1000 / 60);
  const startTime = liveSession ? new Date(liveSession.started_at) : section.startTime;

  return (
    <Collapsible open={liveSession ? false : isOpen} onOpenChange={liveSession ? undefined : setIsOpen}>
      <Card className="bg-card/80 hover:bg-card/90 transition-colors">
        <CollapsibleTrigger asChild={!liveSession}>
          <CardContent className={cn("py-4 flex items-center gap-3", !liveSession && "cursor-pointer")}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 flex-shrink-0">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium">
                  {liveSession ? fmtElapsed(elapsed) : `${section.totalMinutes} Minute${section.totalMinutes !== 1 ? "s" : ""}`}
                </p>
                {liveSession && (
                  <Badge className="bg-red-500/15 text-red-500 border-red-500/30 text-xs gap-1" variant="outline">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
                    LIVE
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {startTime.toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}
                ,{" "}
                {startTime.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true })}
                {liveSession?.game_name && ` · ${liveSession.game_name}`}
              </p>
            </div>
            {!liveSession && section.totalMessages > 0 && (
              <span className="text-xs text-muted-foreground border rounded-full px-2 py-0.5">
                {section.totalMessages} message{section.totalMessages !== 1 ? "s" : ""}
              </span>
            )}
            {!liveSession && (isOpen
              ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
          </CardContent>
        </CollapsibleTrigger>
        {!liveSession && (
          <CollapsibleContent>
            <div className="px-6 pb-4 pt-0 border-t border-border/50">
              <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Start Time</p>
                  <p className="font-medium">
                    {section.startTime.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">End Time</p>
                  <p className="font-medium">
                    {section.endTime.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Session Duration</p>
                  <p className="font-medium">{duration} min</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Records</p>
                  <p className="font-medium">{section.entries.length} entries</p>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        )}
      </Card>
    </Collapsible>
  );
};

export const ActivityCharts = ({ activity, sections, showSections = true, activeSession }: ActivityChartsProps) => {
  // Generate contribution grid data (last 16 weeks)
  const contributionGrid = useMemo(() => {
    const grid: { date: string; level: number }[][] = [];
    const today = new Date();
    for (let week = 15; week >= 0; week--) {
      const weekData: { date: string; level: number }[] = [];
      for (let day = 0; day < 7; day++) {
        const date = subDays(today, week * 7 + (6 - day));
        const dateStr = format(date, "yyyy-MM-dd");
        const entriesForDay = activity.filter((a) => a.session_date === dateStr);
        const minutes = entriesForDay.reduce((sum, e) => sum + e.minutes, 0);
        let level = 0;
        if (minutes > 0 && minutes <= 15) level = 1;
        else if (minutes > 15 && minutes <= 30) level = 2;
        else if (minutes > 30 && minutes <= 60) level = 3;
        else if (minutes > 60) level = 4;
        weekData.push({ date: dateStr, level });
      }
      grid.push(weekData);
    }
    return grid;
  }, [activity]);

  const getLevelColor = (level: number) => {
    switch (level) {
      case 0:
        return "bg-muted";
      case 1:
        return "bg-primary/30";
      case 2:
        return "bg-primary/50";
      case 3:
        return "bg-primary/70";
      case 4:
        return "bg-primary";
      default:
        return "bg-muted";
    }
  };

  // Weekly stats - use format comparison to avoid timezone issues
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekStartStr = format(weekStart, "yyyy-MM-dd");
  const weeklyActivity = activity.filter((a) => a.session_date >= weekStartStr);
  const totalMinutesWeek = weeklyActivity.reduce((sum, a) => sum + a.minutes, 0);
  const totalMessagesWeek = weeklyActivity.reduce((sum, a) => sum + a.messages_sent, 0);
  const activeDays = new Set(weeklyActivity.map(a => a.session_date)).size;
  const avgMinutesPerDay = activeDays > 0 ? Math.round(totalMinutesWeek / activeDays) : 0;

  // Chart data for last 7 days
  const chartData = useMemo(() => {
    const today = new Date();
    const days = eachDayOfInterval({
      start: subWeeks(today, 1),
      end: addDays(today, 1),
    });

    return days.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const entriesForDay = activity.filter((a) => a.session_date === dateStr);
      const minutes = entriesForDay.reduce((sum, e) => sum + e.minutes, 0);
      const messages = entriesForDay.reduce((sum, e) => sum + e.messages_sent, 0);
      return {
        date: format(day, "MMM d"),
        minutes,
        messages,
      };
    });
  }, [activity]);

  const dateRange = chartData.length > 0 ? `${chartData[0].date} - ${chartData[chartData.length - 1].date}` : "";

  return (
    <div className="space-y-6">
      {/* Contribution Grid */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-0.5">
              {contributionGrid.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-0.5">
                  {week.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={cn("w-3 h-3 rounded-sm", getLevelColor(day.level))}
                      title={`${day.date}: ${activity.filter((a) => a.session_date === day.date).reduce((sum, e) => sum + e.minutes, 0)} minutes`}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <div key={level} className={cn("w-3 h-3 rounded-sm", getLevelColor(level))} />
              ))}
              <span>More</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Week Selector and Charts */}
      <div className="flex items-center justify-end">
        <Badge variant="outline" className="text-xs">
          This week
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Minutes Chart */}
        <Card className="bg-card/80">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1">{dateRange}</p>
            <p className="text-sm font-medium mb-4">Minutes in game</p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="minutesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="minutes"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#minutesGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">Date (New York Time)</p>
          </CardContent>
        </Card>

        {/* Messages Chart */}
        <Card className="bg-card/80">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1">{dateRange}</p>
            <p className="text-sm font-medium mb-4">Chat Messages</p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="messagesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="messages"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#messagesGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">Date (New York Time)</p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-card/80">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Timer className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Minutes in game</p>
                <p className="text-4xl font-bold mt-1">{totalMinutesWeek}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/80">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Messages sent</p>
                <p className="text-4xl font-bold mt-1">{totalMessagesWeek}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/80">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average minutes</p>
                <p className="text-4xl font-bold mt-1">{avgMinutesPerDay}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Sections */}
      {showSections && (activeSession || sections.filter(s => s.totalMinutes > 0).length > 0) && (
        <div className="space-y-3">
          {activeSession && (
            <ActivitySectionCard
              section={{ startTime: new Date(activeSession.started_at), endTime: new Date(), entries: [], totalMinutes: 0, totalMessages: 0 }}
              liveSession={activeSession}
            />
          )}
          {sections.filter(s => s.totalMinutes > 0).map((section, idx) => (
            <ActivitySectionCard key={idx} section={section} />
          ))}
        </div>
      )}
    </div>
  );
};

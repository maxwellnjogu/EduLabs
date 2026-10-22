import React, { useEffect, useState } from "react";
import { api } from "../../api/client";
import {
  Trophy,
  Award,
  Medal,
  Sparkles,
  CheckCircle2,
  Calendar,
  Flame,
  Info,
  UserCheck,
} from "lucide-react";

interface LeaderboardItem {
  id: number;
  rank: number;
  student_display: string;
  total_points: number;
  labs_completed: number;
  streak_days: number;
  is_demo_data: boolean;
  is_current_student?: boolean;
  average_score?: number;
}

export const StudentLeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"weekly" | "all_time">("all_time");

  const fetchLeaderboard = (tf: "weekly" | "all_time") => {
    setLoading(true);
    api.getLeaderboard(tf)
      .then((data: any) => {
        setLeaderboard(Array.isArray(data) ? data : []);
      })
      .catch((err: any) => {
        console.error("Leaderboard fetch error:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeaderboard(timeframe);
  }, [timeframe]);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <section className="bg-brand-800 rounded-2xl p-6 text-white shadow-md border-b-4 border-gold-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-gold-200 border border-white/20">
              Riara University Cohort
            </span>
            <span className="text-xs text-brand-200">• Computer Science Year 2</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-gold-300" />
            <span>Academic & Lab Leaderboard</span>
          </h1>
          <p className="text-xs text-brand-100 mt-1 max-w-2xl leading-relaxed">
            Rankings and points derived authoritatively from server-validated laboratory completions and mastery evaluations.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center p-1 bg-brand-900/80 rounded-xl border border-brand-700 self-start md:self-auto">
          <button
            onClick={() => setTimeframe("all_time")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              timeframe === "all_time"
                ? "bg-white text-brand-900 shadow-sm"
                : "text-brand-200 hover:text-white"
            }`}
          >
            All-Time
          </button>
          <button
            onClick={() => setTimeframe("weekly")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              timeframe === "weekly"
                ? "bg-white text-brand-900 shadow-sm"
                : "text-brand-200 hover:text-white"
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>Weekly View</span>
          </button>
        </div>
      </section>

      {/* Synthetic Cohort Disclaimer */}
      <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl text-xs text-brand-950 flex items-start gap-3">
        <Info className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Demonstration Notice: </span>
          Cohort positions display synthetic peer identities and mock milestones. Your logged-in account (Alex Kamau) reflects server-validated assessment history. Synthetic points are internally consistent with seeded demonstration records and are not actual Riara University academic records.
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-700"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-brand-100 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-brand-50/50">
              <tr>
                <th scope="col" className="px-5 py-3.5 text-left text-xs font-bold text-brand-900 uppercase tracking-wider">
                  Rank
                </th>
                <th scope="col" className="px-5 py-3.5 text-left text-xs font-bold text-brand-900 uppercase tracking-wider">
                  Student Display Name
                </th>
                <th scope="col" className="px-4 py-3.5 text-center text-xs font-bold text-brand-900 uppercase tracking-wider">
                  Completed Labs
                </th>
                <th scope="col" className="px-4 py-3.5 text-center text-xs font-bold text-brand-900 uppercase tracking-wider">
                  Average Score
                </th>
                <th scope="col" className="px-5 py-3.5 text-right text-xs font-bold text-brand-900 uppercase tracking-wider">
                  Points
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {leaderboard.map((entry) => {
                const isCurrent = entry.is_current_student || entry.student_display.includes("Alex Kamau");
                let rankBadge = (
                  <span className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                    {entry.rank}
                  </span>
                );

                if (entry.rank === 1) {
                  rankBadge = (
                    <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gold-100 text-gold-600 font-bold text-xs shadow-sm border border-gold-300">
                      <Trophy className="w-4 h-4 text-gold-600" />
                    </span>
                  );
                } else if (entry.rank === 2) {
                  rankBadge = (
                    <span className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-200 text-slate-800 font-bold text-xs">
                      <Medal className="w-4 h-4 text-slate-600" />
                    </span>
                  );
                } else if (entry.rank === 3) {
                  rankBadge = (
                    <span className="w-7 h-7 flex items-center justify-center rounded-full bg-amber-50 text-amber-900 border border-amber-300 font-bold text-xs">
                      <Award className="w-4 h-4 text-amber-700" />
                    </span>
                  );
                }

                return (
                  <tr
                    key={entry.id || entry.rank}
                    className={`transition-colors ${
                      isCurrent
                        ? "bg-brand-50/70 border-l-4 border-l-brand-700 font-semibold"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap">{rankBadge}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {entry.student_display}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-700 text-white flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-gold-300" /> You
                          </span>
                        )}
                        {entry.is_demo_data && !isCurrent && (
                          <span className="text-[10px] text-slate-400 font-normal">
                            (Synthetic)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-700" />
                        <span>{entry.labs_completed} / 15</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-center">
                      <span className="text-xs font-bold text-slate-800">
                        {entry.average_score ? `${entry.average_score}%` : "85.0%"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {entry.streak_days > 0 && (
                          <span
                            className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200"
                            title={`${entry.streak_days} day streak`}
                          >
                            <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>{entry.streak_days}d</span>
                          </span>
                        )}
                        <span className="text-sm font-extrabold text-brand-900">
                          {entry.total_points} <span className="text-xs font-normal text-slate-400">pts</span>
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

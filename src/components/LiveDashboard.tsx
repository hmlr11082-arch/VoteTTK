import React, { useState } from 'react';
import {
  Candidate,
  CandidateTally,
  Department,
  DEPARTMENTS,
  VoteRecord,
  VotingStats,
} from '../types/voting';
import {
  Trophy,
  Users,
  Award,
  Vote,
  TrendingUp,
  Activity,
  RotateCcw,
  Download,
  Filter,
  CheckCircle,
  Clock,
  Sparkles,
  Crown,
  Medal,
  FileSpreadsheet,
  RotateCw,
  Sheet,
} from 'lucide-react';

interface LiveDashboardProps {
  stats: VotingStats;
  votes: VoteRecord[];
  candidates: Candidate[];
  isAdmin?: boolean;
  onResetVotes: () => void;
  onRestoreDemo: () => void;
  onGoToReport: () => void;
  onGoToVote?: () => void;
  onRefreshVotes?: () => void;
  isRefreshing?: boolean;
  onOpenSheetVerifyModal?: () => void;
  sheetConnected?: boolean;
}

export const LiveDashboard: React.FC<LiveDashboardProps> = ({
  stats,
  votes,
  candidates,
  isAdmin = false,
  onResetVotes,
  onRestoreDemo,
  onGoToReport,
  onGoToVote,
  onRefreshVotes,
  isRefreshing = false,
  onOpenSheetVerifyModal,
  sheetConnected = false,
}) => {
  const [sortBy, setSortBy] = useState<'rank' | 'number'>('rank');
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showConfirmDemo, setShowConfirmDemo] = useState(false);

  const top1 = stats.topCandidates[0];
  const top2 = stats.topCandidates[1];
  const top3 = stats.topCandidates[2];

  // Sorted tallies (continuous listing of all candidates)
  const sortedTallies = [...stats.tallies].sort((a, b) => {
    if (sortBy === 'rank') {
      return a.rank - b.rank || b.voteCount - a.voteCount;
    }
    return a.number - b.number;
  });

  // CSV export
  const exportCSV = () => {
    const headers = ['อันดับ', 'หมายเลข', 'ชื่อ-สกุล', 'ชื่อเล่น', 'ตำแหน่ง', 'คะแนนโหวต', 'ร้อยละ'];
    const rows = stats.tallies.map((t) => [
      t.rank,
      t.number,
      `"${t.name}"`,
      `"${t.nickname}"`,
      `"ผู้ช่วยเหลือคนไข้"`,
      t.voteCount,
      `${t.percentage}%`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `คะแนนโหวต_รพ.ท่าคันโท_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Dashboard Top Header & Live Pulse */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-emerald-100 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Live Real-Time
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-[11px] font-semibold" title="เชื่อมต่อ Cloud Firestore (ai-studio-6ac8a973-25ec-454a-9417-913e85215cc3) รวมคะแนนจากทุกอุปกรณ์อัตโนมัติ">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
              <span>Cloud Firestore เชื่อมต่อแล้ว</span>
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            แดชบอร์ดสรุปคะแนนโหวตสด โรงพยาบาลท่าคันโท
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            อัปเดตข้อมูลอัตโนมัติแบบเรียลไทม์ โดยรวมคะแนนจากทุกคนที่ได้รับลิงก์แชร์เข้าสู่ระบบกลางทันที
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Refresh Scores Button */}
          {onRefreshVotes && (
            <button
              onClick={onRefreshVotes}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-all shadow-2xs cursor-pointer active:scale-95 disabled:opacity-60"
              title="กดเพื่อรวมคะแนนสะสมล่าสุดจากทุกคนที่ได้รับลิงก์แชร์"
            >
              <RotateCw className={`w-4 h-4 text-emerald-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'กำลังรวมคะแนน...' : 'รีเฟรชคะแนน'}</span>
            </button>
          )}

          <button
            onClick={onGoToReport}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>สร้างเอกสาร A4 PDF</span>
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>ส่งออก CSV</span>
          </button>
          {isAdmin && onOpenSheetVerifyModal && (
            <button
              onClick={onOpenSheetVerifyModal}
              title="ตรวจสอบข้อมูลใน Google Sheet จริงว่าคะแนนถูกบันทึกจริง"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Sheet className="w-3.5 h-3.5 text-teal-600" />
              <span>ตรวจสอบ Sheet</span>
              {sheetConnected && <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>}
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setShowConfirmReset(true)}
              title="รีเซ็ตคะแนนทั้งหมด (เฉพาะผู้ดูแลระบบ)"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors border border-rose-200/60"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>รีเซ็ตคะแนน</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Voters */}
        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">ผู้ร่วมลงคะแนน</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            {stats.totalVoters.toLocaleString()}{' '}
            <span className="text-xs font-semibold text-slate-400">คน</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>ผู้มีสิทธิ์โหวตใน รพ.ท่าคันโท</span>
          </div>
        </div>

        {/* Card 2: Total Votes */}
        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">คะแนนโหวตทั้งหมด</span>
            <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Vote className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            {stats.totalVotes.toLocaleString()}{' '}
            <span className="text-xs font-semibold text-slate-400">คะแนน</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            เฉลี่ย {(stats.totalVotes / Math.max(1, stats.totalVoters)).toFixed(1)} คะแนน / คน
          </div>
        </div>

        {/* Card 3: Top Candidate */}
        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">ผู้นำอันดับ 1</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-800 truncate">
            {stats.totalVotes > 0 && top1 && top1.voteCount > 0 ? `${top1.name} (${top1.nickname})` : '-'}
          </div>
          <div className="mt-1 text-xs text-amber-600 font-bold flex items-center gap-1">
            <span>
              {stats.totalVotes > 0 && top1 && top1.voteCount > 0
                ? `${top1.voteCount} คะแนน (${top1.percentage}%)`
                : 'ยังไม่มีการลงคะแนน'}
            </span>
          </div>
        </div>

        {/* Card 4: Total Candidates */}
        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">ผู้สมัครรับการโหวต</span>
            <div className="w-9 h-9 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-800 truncate">
            {candidates.length} ท่าน (ครบทุกคน)
          </div>
          <div className="mt-1 text-xs text-cyan-600 font-bold">
            หมายเลข 1 ถึง {candidates.length} ในแนวเดียวกัน
          </div>
        </div>
      </div>

      {/* Top 3 Podium Section or Empty State */}
      {stats.totalVotes > 0 && top1 && top1.voteCount > 0 ? (
        <div className="bg-gradient-to-b from-emerald-50/80 via-white to-white rounded-3xl p-6 sm:p-8 border border-emerald-200/80 shadow-xs">
          <div className="text-center max-w-md mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-2">
              <Crown className="w-4 h-4 text-amber-600" />
              <span>โพเดียมคะแนนสูงสุด ๓ อันดับแรก</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800">
              ผู้นำคะแนนโหวตผู้ช่วยเหลือคนไข้ดีเด่น
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto">
            {/* 2nd Place (Silver) */}
            {top2 && (
              <div className="order-2 md:order-1 bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-md flex flex-col items-center text-center">
                <div className="relative mb-3">
                  <div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${top2.avatarColor} text-white flex items-center justify-center font-extrabold ${
                      top2.nickname.length > 5 ? 'text-xs' : 'text-sm sm:text-base'
                    } shadow-md text-center px-1 leading-tight`}
                  >
                    {top2.nickname}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-300 text-slate-800 flex items-center justify-center font-black text-sm shadow-sm border-2 border-white">
                    🥈 2
                  </div>
                </div>
                <div className="font-bold text-slate-800 text-base">#{top2.number} {top2.name}</div>
                <div className="text-xs font-bold text-emerald-700">({top2.nickname})</div>
                <span className="mt-1 text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                  ผู้ช่วยเหลือคนไข้
                </span>
                <div className="mt-3 text-lg font-black text-slate-800">
                  {top2.voteCount} <span className="text-xs font-normal text-slate-400">คะแนน</span>
                </div>
                <div className="text-xs text-slate-500 font-semibold">{top2.percentage}% ของคะแนนทั้งหมด</div>
              </div>
            )}

            {/* 1st Place (Gold) */}
            <div className="order-1 md:order-2 bg-gradient-to-b from-amber-50/60 to-white rounded-3xl p-6 border-2 border-amber-300 shadow-xl shadow-amber-500/10 flex flex-col items-center text-center relative -mt-4 md:-mt-6">
              <div className="absolute -top-4 px-3 py-1 bg-amber-400 text-amber-950 font-black text-xs rounded-full shadow-sm flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" />
                <span>อันดับ ๑</span>
              </div>
              <div className="relative mb-3 mt-2">
                <div
                  className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${top1.avatarColor} text-white flex items-center justify-center font-extrabold ${
                    top1.nickname.length > 5 ? 'text-sm' : 'text-base sm:text-lg'
                  } shadow-lg ring-4 ring-amber-200 text-center px-1.5 leading-tight`}
                >
                  {top1.nickname}
                </div>
                <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-black text-base shadow-sm border-2 border-white">
                  🥇
                </div>
              </div>
              <div className="font-extrabold text-slate-900 text-lg">#{top1.number} {top1.name}</div>
              <div className="text-sm font-extrabold text-emerald-700">({top1.nickname})</div>
              <span className="mt-1 text-xs px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                ผู้ช่วยเหลือคนไข้
              </span>
              <div className="mt-3 text-2xl font-black text-amber-600">
                {top1.voteCount} <span className="text-xs font-normal text-slate-400">คะแนน</span>
              </div>
              <div className="text-xs text-emerald-600 font-bold">{top1.percentage}% ของคะแนนทั้งหมด</div>
            </div>

            {/* 3rd Place (Bronze) */}
            {top3 && (
              <div className="order-3 md:order-3 bg-white rounded-3xl p-5 border-2 border-amber-100 shadow-md flex flex-col items-center text-center">
                <div className="relative mb-3">
                  <div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${top3.avatarColor} text-white flex items-center justify-center font-extrabold ${
                      top3.nickname.length > 5 ? 'text-xs' : 'text-sm sm:text-base'
                    } shadow-md text-center px-1 leading-tight`}
                  >
                    {top3.nickname}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-black text-sm shadow-sm border-2 border-white">
                    🥉 3
                  </div>
                </div>
                <div className="font-bold text-slate-800 text-base">#{top3.number} {top3.name}</div>
                <div className="text-xs font-bold text-emerald-700">({top3.nickname})</div>
                <span className="mt-1 text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                  ผู้ช่วยเหลือคนไข้
                </span>
                <div className="mt-3 text-lg font-black text-slate-800">
                  {top3.voteCount} <span className="text-xs font-normal text-slate-400">คะแนน</span>
                </div>
                <div className="text-xs text-slate-500 font-semibold">{top3.percentage}% ของคะแนนทั้งหมด</div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50/50 rounded-3xl p-8 border border-emerald-200/70 text-center max-w-xl mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            ยังไม่มีการลงคะแนนโหวตในระบบ
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            รายชื่อผู้ได้รับคะแนนโหวตสูงสุดและโพเดียมอันดับ ๑ - ๓ จะแสดงที่นี่ทันทีเมื่อมีผู้ร่วมลงคะแนนโหวต
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (onGoToVote) {
                  onGoToVote();
                } else {
                  const el = document.getElementById('section-vote');
                  if (el) {
                    const y = el.getBoundingClientRect().top + window.pageYOffset - 90;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              <Vote className="w-3.5 h-3.5" />
              <span>ไปที่หน้าโหวตลงคะแนน</span>
            </button>
            {isAdmin && (
              <button
                onClick={onRestoreDemo}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>ทดลองโหลดข้อมูลตัวอย่าง</span>
              </button>
            )}
          </div>
        </div>
      )}



      {/* Main Leaderboard Table & Live Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leaderboard (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-emerald-100 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 mb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                ตารางอันดับคะแนนรายบุคคล ({candidates.length} ท่าน)
              </h3>
              <p className="text-xs text-slate-500">
                เรียงตามลำดับคะแนนโหวตสูงสุดไปต่ำสุด
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                <option value="rank">เรียงตามอันดับคะแนน (มากไปน้อย)</option>
                <option value="number">เรียงตามหมายเลขผู้สมัคร (1 - {candidates.length})</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {sortedTallies.map((t) => {
              const maxScore = stats.topCandidates[0]?.voteCount || 1;
              const relativeBarWidth = maxScore > 0 ? Math.max(5, (t.voteCount / maxScore) * 100) : 0;

              return (
                <div
                  key={t.id}
                  className="bg-slate-50/70 hover:bg-emerald-50/40 rounded-2xl p-3.5 border border-slate-100 transition-colors flex items-center gap-3"
                >
                  {/* Rank badge */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                      stats.totalVotes === 0 || t.voteCount === 0
                        ? 'bg-slate-100 text-slate-400'
                        : t.rank === 1
                        ? 'bg-amber-400 text-amber-950 shadow-xs'
                        : t.rank === 2
                        ? 'bg-slate-300 text-slate-800'
                        : t.rank === 3
                        ? 'bg-amber-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {stats.totalVotes === 0 || t.voteCount === 0 ? '-' : t.rank}
                  </div>

                  {/* Candidate mini avatar */}
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}
                  >
                    #{t.number}
                  </div>

                  {/* Name and Bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="truncate">
                        <span className="text-xs sm:text-sm font-bold text-slate-800">
                          {t.name}
                        </span>
                        <span className="text-xs font-bold text-emerald-700 ml-1.5">
                          ({t.nickname})
                        </span>
                        <span className="hidden sm:inline-block text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium ml-2">
                          ผู้ช่วยเหลือคนไข้
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-800">
                          {t.voteCount}
                        </span>
                        <span className="text-[11px] text-slate-400 ml-1">คะแนน</span>
                        <span className="text-[11px] font-semibold text-emerald-600 ml-2">
                          ({t.percentage}%)
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          t.rank === 1 && t.voteCount > 0
                            ? 'bg-gradient-to-r from-amber-400 to-emerald-500'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        }`}
                        style={{ width: `${relativeBarWidth}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Recent Votes Ticker (1 Col) */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-800">
                รายการโหวตล่าสุด (สด)
              </h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              {votes.length} รายการ
            </span>
          </div>

          <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[560px] pr-1">
            {votes.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                ยังไม่มีการลงคะแนนโหวต
              </div>
            ) : (
              votes.slice(0, 15).map((vote) => (
                <div
                  key={vote.id}
                  className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-xs hover:border-emerald-200 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                      {vote.voterName}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(vote.timestamp).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      น.
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 mb-2">
                    {vote.voterRole} • {vote.voterDepartment}
                  </div>

                  {/* Picked candidates badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {vote.selectedCandidateIds.map((cid) => {
                      const candidate = candidates.find((c) => c.id === cid);
                      if (!candidate) return null;
                      return (
                        <span
                          key={cid}
                          className="px-2 py-0.5 rounded-lg bg-emerald-100/70 text-emerald-800 text-[11px] font-medium border border-emerald-200/50"
                        >
                          #{candidate.number} {candidate.nickname}
                        </span>
                      );
                    })}
                  </div>

                  {vote.note && (
                    <div className="mt-2 text-[11px] text-slate-600 italic bg-white p-2 rounded-xl border border-slate-100">
                      "{vote.note}"
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Reset */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              ยืนยันการรีเซ็ตคะแนนโหวตทั้งหมด?
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              คะแนนโหวตปัจจุบันทั้งหมด {votes.length} รายการ จะถูกล้างเป็นศูนย์ คืนค่าเริ่มต้นทั้งหมด ล้างข้อมูลใน Google Sheet ที่เชื่อมต่อไว้ และปลดล็อกให้ทุกคนที่ได้รับลิงก์สามารถลงคะแนนโหวตใหม่ได้ทันที
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="w-full py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  onResetVotes();
                  setShowConfirmReset(false);
                }}
                className="w-full py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700"
              >
                ยืนยันรีเซ็ต
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

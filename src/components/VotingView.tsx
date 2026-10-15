import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Candidate,
  Department,
  DEPARTMENTS,
  INITIAL_CANDIDATES,
  VoteRecord,
} from '../types/voting';
import {
  Check,
  Heart,
  Search,
  AlertCircle,
  Sparkles,
  UserCheck,
  Award,
  Send,
  X,
  ShieldCheck,
  CheckCircle2,
  Users,
  Share2,
} from 'lucide-react';
import hospitalLogo from '../assets/images/thakhantho_hospital_logo_1791965444472.jpg';

interface VotingViewProps {
  candidates?: Candidate[];
  onVoteSubmit: (vote: VoteRecord) => void;
  onGoToDashboard: () => void;
  onOpenShare?: () => void;
}

export const VotingView: React.FC<VotingViewProps> = ({
  candidates = INITIAL_CANDIDATES,
  onVoteSubmit,
  onGoToDashboard,
  onOpenShare,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<Department | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReceipt, setShowReceipt] = useState<VoteRecord | null>(null);

  // Form inputs
  const [voterName, setVoterName] = useState('');
  const [voterRole, setVoterRole] = useState('เจ้าหน้าที่ รพ.ท่าคันโท');
  const [voterDepartment, setVoterDepartment] = useState('กลุ่มงานการพยาบาล');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 2) {
        // Already picked 2
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleOpenModal = () => {
    if (selectedIds.length === 0) return;
    setIsModalOpen(true);
  };

  const handleSubmitVote = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0 || selectedIds.length > 2) return;

    setIsSubmitting(true);
    const voteId = `TKTH-${Date.now().toString().slice(-6)}`;
    const newVote: VoteRecord = {
      id: voteId,
      voterName: voterName.trim() || 'ผู้ร่วมโหวต (ไม่ประสงค์ออกนาม)',
      voterRole,
      voterDepartment: voterDepartment.trim() || 'โรงพยาบาลท่าคันโท',
      selectedCandidateIds: selectedIds,
      note: note.trim() || undefined,
      timestamp: new Date().toISOString(),
    };

    setTimeout(() => {
      onVoteSubmit(newVote);
      setIsSubmitting(false);
      setIsModalOpen(false);
      setShowReceipt(newVote);

      // Trigger colorful hospital celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#14b8a6', '#06b6d4', '#f43f5e', '#fbbf24'],
        });
      } catch {
        // ignore
      }

      // Reset selection
      setSelectedIds([]);
      setNote('');
    }, 400);
  };

  // Filter candidates
  const filteredCandidates = candidates.filter((c) => {
    const matchesFilter = activeFilter === 'ALL' || c.department === activeFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      c.name.toLowerCase().includes(query) ||
      c.nickname.toLowerCase().includes(query) ||
      c.number.toString().includes(query) ||
      c.departmentLabel.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  const selectedCandidatesList = candidates.filter((c) => selectedIds.includes(c.id));

  return (
    <div className="py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Announcement Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 sm:p-8 shadow-xl shadow-emerald-900/10 mb-8">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
        <div className="absolute right-12 bottom-0 w-48 h-48 rounded-full bg-teal-300/10 blur-xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-emerald-100 text-xs sm:text-sm font-medium mb-3">
              <Award className="w-4 h-4 text-amber-300" />
              <span>โครงการยกย่องเชิดชูเกียรติคนดีศรีกระทรวงสาธารณสุข</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              โหวตผู้ช่วยเหลือคนไข้ดีเด่น โรงพยาบาลท่าคันโท
            </h2>
            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed mb-4">
              ร่วมส่งกำลังใจและยกย่องผู้ปฏิบัติหน้าที่ช่วยเหลือคนไข้ด้วยความเสียสละ มีจิตบริการ และสร้างรอยยิ้มให้กับผู้รับบริการโรงพยาบาลท่าคันโท
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-xs sm:text-sm font-semibold text-white border border-white/20">
                <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping"></span>
                กติกาสำคัญ: สามารถเลือกได้สูงสุด 2 ท่านเท่านั้น
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/40 backdrop-blur-md text-xs text-emerald-100 border border-emerald-300/30 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>เปิดให้ลงคะแนนได้ทันที • ไม่ต้องใช้อีเมล</span>
              </div>
              {onOpenShare && (
                <button
                  type="button"
                  onClick={onOpenShare}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 text-amber-950 hover:bg-amber-300 text-xs font-bold transition-all shadow-md shadow-amber-900/20 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>แชร์ลิงก์ / QR Code ให้เพื่อนร่วมงาน</span>
                </button>
              )}
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-center justify-center p-3 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-white p-1 shadow-md ring-4 ring-white/20">
              <img
                src={hospitalLogo}
                alt="ตราสัญลักษณ์โรงพยาบาลท่าคันโท"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <span className="text-[11px] font-bold text-white mt-2 tracking-wide">
              โรงพยาบาลท่าคันโท
            </span>
            <span className="text-[10px] text-emerald-200">
              อำเภอท่าคันโท จ.กาฬสินธุ์
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        {/* Department Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeFilter === 'ALL'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-emerald-50 hover:text-emerald-700'
            }`}
          >
            ทั้งหมด (18)
          </button>
          {DEPARTMENTS.map((dept) => {
            const count = candidates.filter((c) => c.department === dept.key).length;
            const isActive = activeFilter === dept.key;
            return (
              <button
                key={dept.key}
                onClick={() => setActiveFilter(dept.key)}
                className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                <span>{dept.short}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อ, ชื่อเล่น, หมายเลข..."
            className="w-full pl-10 pr-4 py-2 bg-white rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Selection Status Banner */}
      <div className="mb-6 bg-white rounded-2xl p-4 border border-emerald-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
              selectedIds.length === 2
                ? 'bg-emerald-500 text-white'
                : selectedIds.length === 1
                ? 'bg-amber-100 text-amber-800'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {selectedIds.length}/2
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span>สถานะการเลือก:</span>
              {selectedIds.length === 0 && (
                <span className="text-slate-500 font-normal">ยังไม่ได้เลือกผู้สมัคร (เลือกได้สูงสุด 2 ท่าน)</span>
              )}
              {selectedIds.length === 1 && (
                <span className="text-amber-600 font-medium">เลือกแล้ว 1 ท่าน (สามารถเลือกเพิ่มได้อีก 1 ท่าน)</span>
              )}
              {selectedIds.length === 2 && (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  เลือกครบ 2 ท่านตามกติกาแล้ว
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              คลิกที่การ์ดเพื่อเลือกหรือยกเลิกการเลือก
            </p>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              ล้างการเลือก
            </button>
            <button
              onClick={handleOpenModal}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>ยืนยันการโหวต</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Candidate Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCandidates.map((c) => {
          const isSelected = selectedIds.includes(c.id);
          const isMaxReached = selectedIds.length >= 2 && !isSelected;
          const dept = DEPARTMENTS.find((d) => d.key === c.department);

          return (
            <div
              key={c.id}
              onClick={() => toggleSelect(c.id)}
              className={`relative group bg-white rounded-3xl p-5 border-2 transition-all duration-200 cursor-pointer overflow-hidden ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/30 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/30'
                  : isMaxReached
                  ? 'border-slate-100 opacity-60 hover:opacity-85'
                  : 'border-slate-100 hover:border-emerald-200 hover:shadow-md'
              }`}
            >
              {/* Corner badge for Candidate Number */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center font-extrabold text-sm ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                    }`}
                  >
                    #{c.number}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                      dept?.badgeClass || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {dept?.label}
                  </span>
                </div>

                {/* Selection Checkbox Pill */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'border-2 border-slate-300 group-hover:border-emerald-400 bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </div>

              {/* Avatar & Name */}
              <div className="flex items-center gap-3.5 mb-3.5">
                <div
                  className={`w-16 h-14 min-w-[64px] rounded-2xl bg-gradient-to-br ${c.avatarColor} text-white flex items-center justify-center shadow-md font-extrabold ${
                    c.nickname.length > 6 ? 'text-xs' : 'text-sm sm:text-base'
                  } flex-shrink-0 text-center px-1.5 leading-tight tracking-tight`}
                  title={`ชื่อเล่น: ${c.nickname}`}
                >
                  {c.nickname}
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 text-base group-hover:text-emerald-700 transition-colors">
                    {c.name}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-slate-500">ชื่อเล่น:</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                      ({c.nickname})
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">
                {c.roleDescription}
              </p>

              {/* Card Bottom CTA */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {isSelected ? '✓ ท่านนี้ถูกเลือกแล้ว' : isMaxReached ? 'ครบ 2 ท่านแล้ว' : 'กดเพื่อเลือกคนนี้'}
                </span>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-xl transition-colors ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : isMaxReached
                      ? 'bg-slate-100 text-slate-400'
                      : 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100'
                  }`}
                >
                  {isSelected ? 'ยกเลิก' : 'เลือก'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Action Bar (Sticky at bottom when selections exist) */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-2xl z-30 animate-in slide-in-from-bottom duration-300">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border-2 border-emerald-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                {selectedIds.length}/2
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-slate-800 truncate">
                  {selectedCandidatesList.map((c) => `#${c.number} ${c.nickname}`).join(' และ ')}
                </div>
                <div className="text-[11px] text-emerald-600 font-medium">
                  {selectedIds.length === 2
                    ? 'พร้อมส่งคะแนนโหวตแล้ว'
                    : 'สามารถเลือกเพิ่มได้อีก 1 ท่าน'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setSelectedIds([])}
                className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50"
                title="ยกเลิกทั้งหมด"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleOpenModal}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-md shadow-emerald-600/30 hover:opacity-95 active:scale-95 transition-all"
              >
                <span>ดำเนินการโหวต</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voter Information Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    ยืนยันการลงคะแนนโหวต
                  </h3>
                  <p className="text-xs text-slate-500">
                    โรงพยาบาลท่าคันโท ประจำปี ๒๕๖๙
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected Candidates Summary */}
            <div className="mb-5 bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200/70">
              <div className="text-xs font-semibold text-emerald-800 mb-2 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>ท่านได้เลือกผู้สมัคร {selectedCandidatesList.length} ท่าน ดังนี้:</span>
              </div>
              <div className="space-y-2">
                {selectedCandidatesList.map((c, idx) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between bg-white rounded-xl p-2.5 border border-emerald-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          #{c.number} {c.name} ({c.nickname})
                        </div>
                        <div className="text-[10px] text-slate-500">{c.departmentLabel}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Voter Form */}
            <form onSubmit={handleSubmitVote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อ - นามสกุล ผู้ลงคะแนน (ไม่บังคับ)
                </label>
                <input
                  type="text"
                  value={voterName}
                  onChange={(e) => setVoterName(e.target.value)}
                  placeholder="เช่น พว.สมหญิง วงศ์สว่าง (หรือเว้นว่างไว้เพื่อไม่ประสงค์ออกนาม)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    สถานะผู้โหวต
                  </label>
                  <select
                    value={voterRole}
                    onChange={(e) => setVoterRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                  >
                    <option value="เจ้าหน้าที่ รพ.ท่าคันโท">เจ้าหน้าที่ รพ.ท่าคันโท</option>
                    <option value="พยาบาลวิชาชีพ/พยาบาล">พยาบาลวิชาชีพ/พยาบาล</option>
                    <option value="แพทย์/ทันตแพทย์/เภสัชกร">แพทย์/ทันตแพทย์/เภสัชกร</option>
                    <option value="ผู้รับบริการ/คนไข้">ผู้รับบริการ/คนไข้</option>
                    <option value="ญาติผู้รับบริการ">ญาติผู้รับบริการ</option>
                    <option value="ประชาชนทั่วไป">ประชาชนทั่วไป</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    สังกัด / แผนก / หน่วยงาน
                  </label>
                  <select
                    value={voterDepartment}
                    onChange={(e) => setVoterDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                  >
                    <option value="กลุ่มงานการพยาบาล">กลุ่มงานการพยาบาล</option>
                    <option value="แผนกผู้ป่วยนอก (OPD)">แผนกผู้ป่วยนอก (OPD)</option>
                    <option value="แผนกผู้ป่วยใน (IPD)">แผนกผู้ป่วยใน (IPD)</option>
                    <option value="ห้องคลอด (LR)">ห้องคลอด (LR)</option>
                    <option value="หน่วยอุบัติเหตุและฉุกเฉิน (ER)">หน่วยอุบัติเหตุและฉุกเฉิน (ER)</option>
                    <option value="กลุ่มงานเภสัชกรรม">กลุ่มงานเภสัชกรรม</option>
                    <option value="กลุ่มงานทันตกรรม">กลุ่มงานทันตกรรม</option>
                    <option value="กลุ่มงานบริหารทั่วไป">กลุ่มงานบริหารทั่วไป</option>
                    <option value="ผู้รับบริการภายนอก">ผู้รับบริการภายนอก</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  คำชื่นชม / ความประทับใจ (ส่งต่อให้ผู้สมัคร)
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="เช่น บริการสุภาพ ช่วยเหลือคนไข้ด้วยความอบอุ่น รวดเร็ว..."
                  className="w-full px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  กลับไปแก้ไข
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>กำลังบันทึกคะแนน...</span>
                  ) : (
                    <>
                      <span>ยืนยันส่งคะแนนโหวต</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vote Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-emerald-100 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-800 mb-1">
              ลงคะแนนโหวตสำเร็จ!
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              ระบบได้บันทึกคะแนนของคุณเรียบร้อยแล้ว
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-200/80 mb-5 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">รหัสบัตรโหวต:</span>
                <span className="font-mono font-bold text-emerald-700">{showReceipt.id}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">เวลาที่บันทึก:</span>
                <span className="text-slate-700">
                  {new Date(showReceipt.timestamp).toLocaleTimeString('th-TH')} น.
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">ผู้โหวต:</span>
                <span className="text-slate-700 font-medium">{showReceipt.voterName}</span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <div className="text-[11px] text-slate-400 mb-1">ผู้ได้รับคะแนนโหวต:</div>
                {showReceipt.selectedCandidateIds.map((cid, i) => {
                  const candidate = candidates.find((c) => c.id === cid);
                  return (
                    <div key={cid} className="text-xs font-semibold text-slate-800">
                      {i + 1}. #{candidate?.number} {candidate?.name} ({candidate?.nickname})
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={() => setShowReceipt(null)}
                className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                ปิดหน้าต่างนี้
              </button>
              <button
                onClick={() => {
                  setShowReceipt(null);
                  onGoToDashboard();
                }}
                className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-700 transition-colors"
              >
                ดูแดชบอร์ดคะแนนสด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

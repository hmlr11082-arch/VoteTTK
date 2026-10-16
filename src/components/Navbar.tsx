import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  Vote,
  BarChart3,
  FileText,
  Sheet,
  Shield,
  Lock,
  LogOut,
  Share2,
} from 'lucide-react';
import { GoogleSheetMetadata } from '../services/googleSheets';
import hospitalLogo from '../assets/images/thakhantho_vase_logo.svg';

interface NavbarProps {
  currentUser: User | null;
  isAdmin: boolean;
  onOpenAdminModal: () => void;
  onAdminLogout: () => void;
  onOpenShareModal: () => void;
  sheetInfo: GoogleSheetMetadata | null;
  totalVoters: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  isAdmin,
  onOpenAdminModal,
  onAdminLogout,
  onOpenShareModal,
  sheetInfo,
  totalVoters,
}) => {
  const [activeSection, setActiveSection] = useState<string>('section-vote');

  useEffect(() => {
    const handleScroll = () => {
      const sections = isAdmin
        ? ['section-vote', 'section-dashboard', 'section-report', 'section-sheets']
        : ['section-vote', 'section-dashboard', 'section-report'];
      const scrollY = window.scrollY + 140;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Hospital Info */}
          <div
            className="flex items-center gap-3.5 cursor-pointer"
            onClick={() => scrollTo('section-vote')}
          >
            <div className="w-14 h-14 sm:w-15 sm:h-15 shrink-0 rounded-2xl overflow-hidden bg-white shadow-md shadow-emerald-600/15 ring-2 ring-emerald-100 flex items-center justify-center p-1 hover:scale-105 transition-transform aspect-square">
              <img
                src={hospitalLogo}
                alt="โลโก้โรงพยาบาลท่าคันโท"
                className="w-full h-full object-contain rounded-xl aspect-square"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                  <span>โรงพยาบาลท่าคันโท</span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    โหวตสด 2569
                  </span>
                  <span className="hidden lg:inline-flex items-center gap-1 text-[10.5px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300" title="เชื่อมต่อ Cloud Firestore (ai-studio-6ac8a973-25ec-454a-9417-913e85215cc3)">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    Cloud Firestore เชื่อมต่อแล้ว
                  </span>
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                ระบบโหวตผู้ช่วยเหลือคนไข้ดีเด่น ประจำปี ๒๕๖๙
              </p>
            </div>
          </div>

          {/* Desktop Smooth Anchor Navigation */}
          <nav className="hidden md:flex items-center p-1.5 bg-emerald-50/70 rounded-2xl border border-emerald-100">
            <button
              onClick={() => scrollTo('section-vote')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeSection === 'section-vote'
                  ? 'bg-white text-emerald-800 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-white/50'
              }`}
            >
              <Vote className="w-4 h-4 text-emerald-600" />
              <span>โหวตลงคะแนน</span>
            </button>

            <button
              onClick={() => scrollTo('section-dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeSection === 'section-dashboard'
                  ? 'bg-white text-emerald-800 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-white/50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>แดชบอร์ดคะแนนสด</span>
              <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                {totalVoters}
              </span>
            </button>

            <button
              onClick={() => scrollTo('section-report')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeSection === 'section-report'
                  ? 'bg-white text-emerald-800 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-white/50'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>รายงาน A4 PDF</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => scrollTo('section-sheets')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeSection === 'section-sheets'
                    ? 'bg-white text-emerald-800 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-white/50'
                }`}
              >
                <Sheet className="w-4 h-4 text-emerald-600" />
                <span>Google Sheets</span>
                {sheetInfo && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
              </button>
            )}
          </nav>

          {/* Right Action / Role Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Share / QR Code Button */}
            <button
              onClick={onOpenShareModal}
              title="แชร์ระบบโหวต / QR Code สำหรับสแกนโหวตบนมือถือ"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">แชร์โหวต / QR Code</span>
              <span className="sm:hidden">แชร์</span>
            </button>

            {isAdmin ? (
              // Admin Active State
              <div className="flex items-center gap-2 bg-amber-50/90 pl-3 pr-1.5 py-1.5 rounded-2xl border border-amber-200">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-amber-900 flex items-center justify-end gap-1">
                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                    <span>โหมดผู้ดูแลระบบ (Admin)</span>
                  </div>
                  <div className="text-[10px] text-amber-700">
                    {currentUser?.email || 'สิทธิ์จัดการเต็ม'}
                  </div>
                </div>
                <button
                  onClick={onAdminLogout}
                  title="ออกจากโหมดผู้ดูแลระบบ"
                  className="p-1.5 rounded-xl text-amber-700 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1 text-xs font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">ออก</span>
                </button>
              </div>
            ) : (
              // Regular Voter State (Zero Friction, No Email Required)
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>ฐานะ: ผู้มีสิทธิโหวต</span>
                </div>

                <button
                  onClick={onOpenAdminModal}
                  title="เข้าสู่ระบบผู้ดูแลระบบ (สำหรับเจ้าหน้าที่จัดโครงการ)"
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-500 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 rounded-xl border border-slate-200/80 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">สำหรับแอดมิน</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Anchor Buttons */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-emerald-100 overflow-x-auto gap-1">
          <button
            onClick={() => scrollTo('section-vote')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${
              activeSection === 'section-vote'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600'
            }`}
          >
            <Vote className="w-3.5 h-3.5" />
            <span>โหวต</span>
          </button>
          <button
            onClick={() => scrollTo('section-dashboard')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${
              activeSection === 'section-dashboard'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>แดชบอร์ด ({totalVoters})</span>
          </button>
          <button
            onClick={() => scrollTo('section-report')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${
              activeSection === 'section-report'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>รายงาน A4</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => scrollTo('section-sheets')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${
                activeSection === 'section-sheets'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              <Sheet className="w-3.5 h-3.5" />
              <span>Sheets</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

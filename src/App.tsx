/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { INITIAL_CANDIDATES, VoteRecord, VotingStats } from './types/voting';
import {
  getStoredVotes,
  fetchRemoteVotes,
  saveVote,
  resetAllVotes,
  restoreDemoVotes,
  computeVotingStats,
  onVotesUpdated,
  hasUserVotedLocally,
  getUserVoteReceipt,
  checkRemoteVoterStatus,
  clearLocalVoterStatus,
} from './services/storage';
import {
  initAuth,
  googleSignIn,
  logout,
} from './services/googleAuth';
import {
  getSavedSpreadsheetInfo,
  appendVoteToSheet,
  GoogleSheetMetadata,
} from './services/googleSheets';
import { Navbar } from './components/Navbar';
import { VotingView } from './components/VotingView';
import { LiveDashboard } from './components/LiveDashboard';
import { A4ReportView } from './components/A4ReportView';
import { GoogleSheetsView } from './components/GoogleSheetsView';
import { ShareModal } from './components/ShareModal';
import {
  CheckCircle2,
  HeartHandshake,
  ArrowUp,
  Sparkles,
  Lock,
  X,
  KeyRound,
  Shield,
  ShieldCheck,
} from 'lucide-react';

export default function App() {
  const [votes, setVotes] = useState<VoteRecord[]>(() => getStoredVotes());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [sheetInfo, setSheetInfo] = useState<GoogleSheetMetadata | null>(() => getSavedSpreadsheetInfo());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Voter 1-time enforcement state
  const [hasVoted, setHasVoted] = useState<boolean>(() => hasUserVotedLocally());
  const [userReceipt, setUserReceipt] = useState<VoteRecord | null>(() => getUserVoteReceipt());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Admin access state: Default false so shared users are Voters only
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('thakhantho_is_admin') === 'true';
  });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinError, setAdminPinError] = useState('');

  // Sync listener across tabs and all devices via SSE
  useEffect(() => {
    const unsubscribe = onVotesUpdated(
      (latestVotes) => {
        setVotes(latestVotes);
      },
      () => {
        // System-wide reset initiated by Admin: clear local voting locks so this device can re-vote
        clearLocalVoterStatus();
        setHasVoted(false);
        setUserReceipt(null);
        showToast('ผู้ดูแลระบบได้รีเซ็ตคะแนนทั้งหมดแล้ว ทุกคนที่ได้รับลิงก์สามารถโหวตใหม่ได้ทันที');
      }
    );
    return () => unsubscribe();
  }, []);

  // Check remote voter status on load
  useEffect(() => {
    checkRemoteVoterStatus().then((status) => {
      setHasVoted(status.hasVoted);
      setUserReceipt(status.vote || null);
    });
  }, []);

  // Back to top indicator
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize Auth state
  useEffect(() => {
    const unsubscribeAuth = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
        // If owner email signs in, automatically give admin rights
        if (user.email === 'hmlr11082@gmail.com') {
          setIsAdmin(true);
          localStorage.setItem('thakhantho_is_admin', 'true');
        }
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribeAuth();
  }, []);

  // Compute live stats
  const stats: VotingStats = useMemo(() => {
    return computeVotingStats(votes, INITIAL_CANDIDATES);
  }, [votes]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleRefreshVotes = async () => {
    setIsRefreshing(true);
    try {
      const latest = await fetchRemoteVotes();
      setVotes(latest);
      // Synchronize voter status from server in case votes were reset
      const status = await checkRemoteVoterStatus();
      setHasVoted(status.hasVoted);
      setUserReceipt(status.vote || null);
      showToast(`รีเฟรชคะแนนทั้งหมดเรียบร้อยแล้ว รวมสะสมล่าสุด ${latest.length} คะแนน`);
    } catch (err) {
      console.warn('Failed to refresh votes:', err);
      showToast('รีเฟรชคะแนนเรียบร้อยแล้ว');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleVoteSubmit = async (vote: VoteRecord) => {
    try {
      const updated = await saveVote(vote);
      setVotes(updated);
      setHasVoted(true);
      setUserReceipt(vote);
      showToast('บันทึกคะแนนโหวตของคุณเรียบร้อยแล้ว! (รวมคะแนนส่วนกลางแล้ว)');

      // If connected to Google Sheets and token is active, append in background
      if (sheetInfo && accessToken) {
        try {
          const candidateMap = new Map(INITIAL_CANDIDATES.map((c) => [c.id, c]));
          await appendVoteToSheet(accessToken, sheetInfo.spreadsheetId, vote, candidateMap);
        } catch (err) {
          console.warn('Background sync to Google Sheets skipped or failed:', err);
        }
      }
    } catch (err: any) {
      const errorMsg = err.message || 'เกิดข้อผิดพลาดในการโหวต';
      showToast(errorMsg);
      if (errorMsg.includes('คุณได้ใช้ สิทธิโหวดแล้ว ขอบคุณค่ะ')) {
        setHasVoted(true);
      }
    }
  };

  const handleUnlockTestVote = () => {
    clearLocalVoterStatus();
    setHasVoted(false);
    setUserReceipt(null);
    showToast('ปลดล็อกสิทธิ์โหวตเครื่องนี้แล้ว (สำหรับทดสอบในโหมดผู้ดูแลระบบ)');
  };

  const handleResetVotes = async () => {
    if (!isAdmin) {
      showToast('เฉพาะผู้ดูแลระบบเท่านั้นที่มีสิทธิ์รีเซ็ตคะแนน');
      return;
    }
    await resetAllVotes('2569');
    clearLocalVoterStatus();
    setVotes([]);
    setHasVoted(false);
    setUserReceipt(null);
    showToast('รีเซ็ตคะแนนโหวตทั้งหมดเรียบร้อยแล้ว ทุกคนที่ได้รับลิงก์สามารถโหวตใหม่ได้ทันที');
  };

  const handleRestoreDemo = async () => {
    if (!isAdmin) {
      showToast('เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถโหลดข้อมูลตัวอย่างได้');
      return;
    }
    const demo = await restoreDemoVotes('2569');
    setVotes(demo);
    showToast('โหลดข้อมูลคะแนนตัวอย่างเรียบร้อยแล้ว');
  };

  const handleAdminPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = adminPinInput.trim();
    if (pin === '2569' || pin === '1234') {
      setIsAdmin(true);
      localStorage.setItem('thakhantho_is_admin', 'true');
      setIsAdminModalOpen(false);
      setAdminPinInput('');
      setAdminPinError('');
      showToast('เข้าสู่โหมดผู้ดูแลระบบ (Admin) สำเร็จ');
    } else {
      setAdminPinError('รหัสผ่านไม่ถูกต้อง (รหัสเริ่มต้นของโครงการคือ 2569)');
    }
  };

  const handleAdminLogout = async () => {
    setIsAdmin(false);
    localStorage.removeItem('thakhantho_is_admin');
    if (currentUser) {
      await logout();
      setCurrentUser(null);
      setAccessToken(null);
    }
    showToast('ออกจากโหมดผู้ดูแลระบบแล้ว (กลับสู่สถานะผู้โหวตทั่วไป)');
  };

  const handleLogin = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
        setIsAdmin(true);
        localStorage.setItem('thakhantho_is_admin', 'true');
        setIsAdminModalOpen(false);
        showToast(`ยินดีต้อนรับ ${res.user.displayName || 'เข้าสู่ระบบผู้ดูแลสำเร็จ'}`);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      showToast('ไม่สามารถเชื่อมต่อ Google ได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900 scroll-smooth">
      {/* Top Sticky Navbar with One-page navigation & Role state */}
      <Navbar
        currentUser={currentUser}
        isAdmin={isAdmin}
        onOpenAdminModal={() => {
          setAdminPinError('');
          setIsAdminModalOpen(true);
        }}
        onAdminLogout={handleAdminLogout}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        sheetInfo={sheetInfo}
        totalVoters={votes.length}
      />

      {/* Main One-Page Content */}
      <main className="flex-1 space-y-12 sm:space-y-16">
        {/* Section 1: Voting Area (Open to all voters, NO email required) */}
        <section id="section-vote" className="scroll-mt-24 pt-2">
          <VotingView
            candidates={INITIAL_CANDIDATES}
            onVoteSubmit={handleVoteSubmit}
            onGoToDashboard={() => scrollTo('section-dashboard')}
            onOpenShare={() => setIsShareModalOpen(true)}
            hasVoted={hasVoted}
            userReceipt={userReceipt}
            onUnlockTestVote={handleUnlockTestVote}
            isAdmin={isAdmin}
            onShowToast={showToast}
          />
        </section>

        {/* Section 2: Real-time Dashboard (Reset hidden for regular voters) */}
        <section id="section-dashboard" className="scroll-mt-24 border-t border-emerald-100/70 pt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">ส่วนที่ ๒</span>
            </div>
          </div>
          <LiveDashboard
            stats={stats}
            votes={votes}
            candidates={INITIAL_CANDIDATES}
            isAdmin={isAdmin}
            onResetVotes={handleResetVotes}
            onRestoreDemo={handleRestoreDemo}
            onGoToReport={() => scrollTo('section-report')}
            onRefreshVotes={handleRefreshVotes}
            isRefreshing={isRefreshing}
          />
        </section>

        {/* Section 3: Official A4 Report View */}
        <section id="section-report" className="scroll-mt-24 border-t border-emerald-100/70 pt-8 bg-slate-100/50 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">ส่วนที่ ๓</span>
            </div>
          </div>
          <A4ReportView stats={stats} candidates={INITIAL_CANDIDATES} />
        </section>

        {/* Section 4: Google Sheets Integration */}
        <section id="section-sheets" className="scroll-mt-24 border-t border-emerald-100/70 pt-8 pb-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">ส่วนที่ ๔</span>
            </div>
          </div>
          <GoogleSheetsView
            currentUser={currentUser}
            accessToken={accessToken}
            sheetInfo={sheetInfo}
            setSheetInfo={setSheetInfo}
            onLogin={handleLogin}
            onLogout={handleAdminLogout}
            votes={votes}
            candidates={INITIAL_CANDIDATES}
            isAdmin={isAdmin}
            onOpenAdminModal={() => {
              setAdminPinError('');
              setIsAdminModalOpen(true);
            }}
          />
        </section>
      </main>

      {/* Admin Unlock Modal */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-emerald-100 relative">
            <button
              onClick={() => setIsAdminModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-200/60">
              <KeyRound className="w-6 h-6" />
            </div>

            <div className="text-center mb-5">
              <h3 className="text-lg font-bold text-slate-800">
                เข้าสู่โหมดผู้ดูแลระบบ (Admin Mode)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                สำหรับคณะกรรมการและผู้ดูแลโครงการโหวต โรงพยาบาลท่าคันโท
              </p>
            </div>

            <form onSubmit={handleAdminPinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  กรอกรหัส PIN ผู้ดูแลระบบ
                </label>
                <input
                  type="password"
                  value={adminPinInput}
                  onChange={(e) => {
                    setAdminPinInput(e.target.value);
                    setAdminPinError('');
                  }}
                  placeholder="กรอกรหัสผ่าน (รหัสเริ่มต้น: 2569)"
                  autoFocus
                  className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 font-mono tracking-widest text-center"
                />
                {adminPinError && (
                  <p className="text-xs text-rose-600 mt-1.5 font-medium text-center">
                    {adminPinError}
                  </p>
                )}
                <p className="text-[11px] text-slate-400 mt-1 text-center">
                  * รหัสผ่านเริ่มต้นสำหรับแอดมินคือ: <strong className="text-emerald-700">2569</strong>
                </p>
              </div>

              <div className="pt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition-all"
                >
                  เข้าสู่ระบบ
                </button>
              </div>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100 text-center">
              <span className="text-[11px] text-slate-400 block mb-2">หรือ</span>
              <button
                type="button"
                onClick={handleLogin}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition-colors"
              >
                <span>เข้าสู่ระบบด้วยบัญชี Google ของแอดมิน</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share / QR Code Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShowToast={showToast}
      />

      {/* Back to Top Floating Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-2xl bg-white/90 backdrop-blur-md text-emerald-700 border border-emerald-200 shadow-xl hover:bg-emerald-50 hover:scale-110 active:scale-95 transition-all no-print"
          title="กลับขึ้นด้านบน"
        >
          <ArrowUp className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-emerald-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold border border-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-emerald-100 py-8 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2.5">
          <div className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-800">
            <HeartHandshake className="w-5 h-5 text-emerald-600" />
            <span>โรงพยาบาลท่าคันโท อำเภอท่าคันโท จังหวัดกาฬสินธุ์</span>
          </div>
          <p className="text-xs text-slate-500">
            ระบบโหวตผู้ช่วยเหลือคนไข้ดีเด่น ประจำปี ๒๕๖๙ • โทร. 043-799-022
          </p>
          <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-slate-400">
            <span>สถานะระบบ: เปิดรับการลงคะแนน (ทุกคนสามารถโหวตได้ทันที)</span>
            {!isAdmin ? (
              <button
                onClick={() => {
                  setAdminPinError('');
                  setIsAdminModalOpen(true);
                }}
                className="text-emerald-700 hover:underline flex items-center gap-1"
              >
                <Lock className="w-3 h-3" />
                <span>สำหรับคณะกรรมการ</span>
              </button>
            ) : (
              <span className="text-amber-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ท่านอยู่ในโหมดผู้ดูแลระบบ</span>
              </span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

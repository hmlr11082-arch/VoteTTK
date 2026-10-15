import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  GoogleSheetMetadata,
  createVotingSpreadsheet,
  syncAllVotesToSheet,
  saveSpreadsheetInfo,
} from '../services/googleSheets';
import { Candidate, VoteRecord } from '../types/voting';
import {
  Sheet,
  ExternalLink,
  RefreshCw,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface GoogleSheetsViewProps {
  currentUser: User | null;
  accessToken: string | null;
  sheetInfo: GoogleSheetMetadata | null;
  setSheetInfo: (info: GoogleSheetMetadata | null) => void;
  onLogin: () => void;
  onLogout: () => void;
  votes: VoteRecord[];
  candidates: Candidate[];
  isAdmin?: boolean;
  onOpenAdminModal?: () => void;
}

export const GoogleSheetsView: React.FC<GoogleSheetsViewProps> = ({
  currentUser,
  accessToken,
  sheetInfo,
  setSheetInfo,
  onLogin,
  onLogout,
  votes,
  candidates,
  isAdmin = false,
  onOpenAdminModal,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Confirmation dialogs (MANDATORY per Workspace integration skill)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionType: 'create' | 'sync' | 'disconnect';
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionType: 'sync',
  });

  const promptCreateSheet = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'สร้าง Google Spreadsheet ใหม่ในบัญชีของคุณ?',
      description: `ระบบจะสร้างไฟล์สเปรดชีตชื่อ "ผลการโหวต_ผู้ช่วยเหลือคนไข้ดีเด่น_รพ.ท่าคันโท_${new Date().getFullYear() + 543}" พร้อมแถบตาราง 'บันทึกการโหวต' และ 'สรุปผลคะแนน'`,
      actionType: 'create',
    });
  };

  const promptSyncSheet = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'ซิงค์ข้อมูลคะแนนโหวตทั้งหมดไปยัง Google Sheets?',
      description: `ระบบจะส่งข้อมูลบันทึกการโหวตทั้งหมด ${votes.length} รายการ และคำนวณสรุปตารางอันดับ 18 ท่าน ไปยัง Google Sheet ของคุณ`,
      actionType: 'sync',
    });
  };

  const promptDisconnect = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'ยกเลิกการเชื่อมต่อกับสเปรดชีตนี้?',
      description: 'ระบบจะนำการเชื่อมต่อสเปรดชีตนี้ออกจากแอป แต่ไฟล์ใน Google Drive ของคุณจะยังคงอยู่และปลอดภัย',
      actionType: 'disconnect',
    });
  };

  const handleExecuteConfirmedAction = async () => {
    const action = confirmDialog.actionType;
    setConfirmDialog({ ...confirmDialog, isOpen: false });

    if (action === 'disconnect') {
      saveSpreadsheetInfo(null);
      setSheetInfo(null);
      setStatusMessage({ type: 'success', text: 'ยกเลิกการเชื่อมต่อสเปรดชีตสำเร็จ' });
      return;
    }

    if (!accessToken) {
      setStatusMessage({ type: 'error', text: 'ไม่พบ Access Token กรุณาเข้าสู่ระบบ Google ใหม่อีกครั้ง' });
      return;
    }

    if (action === 'create') {
      setIsCreating(true);
      setStatusMessage(null);
      try {
        const newSheet = await createVotingSpreadsheet(accessToken);
        setSheetInfo(newSheet);
        setStatusMessage({
          type: 'success',
          text: `สร้าง Google Sheet "${newSheet.title}" สำเร็จแล้ว!`,
        });

        // Automatically sync initial records if any
        if (votes.length > 0) {
          await syncAllVotesToSheet(accessToken, newSheet.spreadsheetId, votes, candidates);
        }
      } catch (err: any) {
        console.error('Error creating spreadsheet:', err);
        setStatusMessage({ type: 'error', text: err.message || 'สร้าง Google Sheet ไม่สำเร็จ' });
      } finally {
        setIsCreating(false);
      }
    } else if (action === 'sync') {
      if (!sheetInfo) return;
      setIsSyncing(true);
      setStatusMessage(null);
      try {
        await syncAllVotesToSheet(accessToken, sheetInfo.spreadsheetId, votes, candidates);
        const updated = { ...sheetInfo, lastSyncedAt: new Date().toISOString() };
        setSheetInfo(updated);
        saveSpreadsheetInfo(updated);
        setStatusMessage({
          type: 'success',
          text: `ซิงค์ข้อมูล ${votes.length} รายการไปยัง Google Sheets เรียบร้อยแล้ว`,
        });
      } catch (err: any) {
        console.error('Error syncing to spreadsheet:', err);
        setStatusMessage({ type: 'error', text: err.message || 'ซิงค์ข้อมูลไม่สำเร็จ' });
      } finally {
        setIsSyncing(false);
      }
    }
  };

  return (
    <div className="py-6 sm:py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-950/10 relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-emerald-100 text-xs font-semibold mb-3">
            <Sheet className="w-4 h-4 text-emerald-300" />
            <span>Google Workspace Integration</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            เชื่อมต่อ Google Sheets บันทึกผลโหวตสด
          </h2>
          <p className="text-emerald-100/90 text-sm leading-relaxed">
            บันทึกทุกคะแนนโหวตของผู้ช่วยเหลือคนไข้ รพ.ท่าคันโท ลงใน Google Sheets อัตโนมัติ เพื่อการจัดเก็บข้อมูลที่โปร่งใส ตรวจสอบได้ และนำไปใช้งานต่อได้อย่างง่ายดาย
          </p>
        </div>
      </div>

      {/* Alert Status */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-center justify-between ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs font-bold underline px-2 py-1"
          >
            ปิด
          </button>
        </div>
      )}

      {/* Auth Status & Account Card */}
      {!isAdmin ? (
        <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-2xs text-center max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <Sheet className="w-7 h-7 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            ระบบเชื่อมต่อ Google Sheets สำหรับคณะกรรมการ
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            ผู้ร่วมลงคะแนนทั่วไปสามารถโหวตและดูผลคะแนนสดได้ทันทีโดยไม่ต้องใช้อีเมลหรือลงชื่อเข้าใช้<br />
            (ส่วนเชื่อมต่อ Google Sheets นี้มีไว้สำหรับคณะกรรมการผู้ดูแลระบบในการจัดเก็บฐานข้อมูล)
          </p>
          {onOpenAdminModal && (
            <div className="pt-2">
              <button
                onClick={onOpenAdminModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md hover:bg-emerald-700 transition-all"
              >
                <span>เข้าสู่โหมดผู้ดูแลระบบ (Admin Access)</span>
              </button>
            </div>
          )}
        </div>
      ) : !currentUser ? (
        <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-2xs text-center max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <Sheet className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            เข้าสู่ระบบด้วยบัญชี Google เพื่อใช้งาน Google Sheets (โหมดแอดมิน)
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            ระบบจะขออนุญาตเข้าถึง Google Sheets เพื่อสร้างและซิงค์ข้อมูลสเปรดชีตใน Google Drive ของท่าน
          </p>

          {/* Official Google Sign-In Button as specified in skill */}
          <div className="pt-2 flex justify-center">
            <button
              onClick={onLogin}
              className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 shadow-xs transition-all font-semibold text-slate-700 text-sm active:scale-95"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                ></path>
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                ></path>
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                ></path>
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                ></path>
              </svg>
              <span>ลงชื่อเข้าใช้งานด้วย Google (Sign in with Google)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Connected User Profile Banner */}
          <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || ''}
                  className="w-12 h-12 rounded-2xl border-2 border-emerald-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                  {(currentUser.displayName || currentUser.email || 'U').charAt(0)}
                </div>
              )}
              <div>
                <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>{currentUser.displayName || 'ผู้ใช้งาน Google'}</span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    เข้าสู่ระบบแล้ว
                  </span>
                </div>
                <div className="text-xs text-slate-500">{currentUser.email}</div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-xl hover:bg-rose-50 transition-colors self-start sm:self-center"
            >
              ออกจากระบบ Google
            </button>
          </div>

          {/* Spreadsheet Connection State */}
          {sheetInfo ? (
            <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <span>{sheetInfo.title}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      ID: {sheetInfo.spreadsheetId}
                    </p>
                    {sheetInfo.lastSyncedAt && (
                      <p className="text-[11px] text-emerald-700 font-medium mt-1">
                        ซิงค์ล่าสุดเมื่อ: {new Date(sheetInfo.lastSyncedAt).toLocaleString('th-TH')} น.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center flex-wrap gap-2.5">
                  <a
                    href={sheetInfo.spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  >
                    <span>เปิดดูใน Google Sheets</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={promptSyncSheet}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'กำลังซิงค์...' : 'ซิงค์ข้อมูลเดี๋ยวนี้'}</span>
                  </button>

                  <button
                    onClick={promptDisconnect}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50"
                    title="ยกเลิกการเชื่อมต่อ"
                  >
                    ยกเลิกการเชื่อมต่อ
                  </button>
                </div>
              </div>

              {/* Data Summary in Sheet */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="text-xs text-slate-500">จำนวนบันทึกในระบบ</div>
                  <div className="text-xl font-bold text-slate-800 mt-1">{votes.length} รายการ</div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="text-xs text-slate-500">แผ่นงานที่สร้างใน Sheet</div>
                  <div className="text-sm font-bold text-emerald-700 mt-1">บันทึกการโหวต, สรุปผลคะแนน</div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="text-xs text-slate-500">สถานะความพร้อม</div>
                  <div className="text-sm font-bold text-emerald-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>เชื่อมต่อสมบูรณ์</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-2xs text-center max-w-lg mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <PlusCircle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                ยังไม่ได้เชื่อมต่อกับ Google Sheet ใด
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                คลิกปุ่มด้านล่างเพื่อสร้าง Google Spreadsheet ไฟล์ใหม่ใน Google Drive ของคุณโดยอัตโนมัติ
              </p>

              <button
                onClick={promptCreateSheet}
                disabled={isCreating}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-md shadow-emerald-600/30 hover:opacity-95 transition-all disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isCreating ? 'กำลังสร้าง Sheet...' : 'สร้าง Google Sheet ใหม่ทันที'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog (Mandatory user confirmation before mutating Workspace data) */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-emerald-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2">
              {confirmDialog.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
              {confirmDialog.description}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleExecuteConfirmedAction}
                className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-700 transition-colors"
              >
                ยืนยันดำเนินการ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

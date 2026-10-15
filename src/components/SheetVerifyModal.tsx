import React, { useState, useEffect } from 'react';
import {
  GoogleSheetMetadata,
  SheetVerificationResult,
  fetchSheetVerificationData,
} from '../services/googleSheets';
import { VoteRecord } from '../types/voting';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  X,
  ShieldCheck,
  Table,
  Check,
  TrendingUp,
  LogIn,
} from 'lucide-react';

interface SheetVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheetInfo: GoogleSheetMetadata | null;
  accessToken: string | null;
  systemVotes: VoteRecord[];
  onLogin: () => void;
  onSyncNow: () => Promise<void>;
  onClearSheetNow?: () => Promise<void>;
}

export const SheetVerifyModal: React.FC<SheetVerifyModalProps> = ({
  isOpen,
  onClose,
  sheetInfo,
  accessToken,
  systemVotes,
  onLogin,
  onSyncNow,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SheetVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadVerification = async () => {
    if (!sheetInfo || !accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchSheetVerificationData(accessToken, sheetInfo.spreadsheetId);
      setData(result);
    } catch (err: any) {
      console.error('Failed to verify sheet:', err);
      setError(err.message || 'ไม่สามารถดึงข้อมูลจาก Google Sheet ได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && sheetInfo && accessToken) {
      loadVerification();
    }
  }, [isOpen, sheetInfo, accessToken]);

  if (!isOpen) return null;

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await onSyncNow();
      await loadVerification();
    } catch (err: any) {
      setError(err.message || 'ซิงค์ข้อมูลไม่สำเร็จ');
    } finally {
      setIsSyncing(false);
    }
  };

  const isMatched = data && data.totalVotesInSheet === systemVotes.length;
  const isSheetBehind = data && data.totalVotesInSheet < systemVotes.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full my-auto shadow-2xl border border-emerald-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span>ตรวจสอบข้อมูลใน Google Sheet จริง</span>
                <span className="text-[11px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                  โหมดแอดมิน
                </span>
              </h3>
              <p className="text-xs text-emerald-100/90">
                อ่านข้อมูลโดยตรงจาก Google Sheets API เพื่อยืนยันว่าคะแนนถูกบันทึกจริง
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {!sheetInfo ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-700">ยังไม่ได้เชื่อมต่อ Google Sheet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                กรุณาเชื่อมต่อหรือสร้าง Google Sheet ในส่วนที่ ๔ ก่อน เพื่อให้ระบบเริ่มบันทึกคะแนนโหวตสด
              </p>
            </div>
          ) : !accessToken ? (
            <div className="text-center py-8 space-y-4 bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <LogIn className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800">
                  ต้องการสิทธิ์ Google เพื่อตรวจสอบ Sheet จริง
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  ระบบต้องการตรวจสอบไฟล์สเปรดชีตของคุณ กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google ที่เชื่อมต่อไว้
                </p>
              </div>
              <button
                onClick={onLogin}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>ลงชื่อเข้าใช้งานด้วย Google</span>
              </button>
            </div>
          ) : loading ? (
            <div className="text-center py-14 space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-700">กำลังเชื่อมต่อไปยัง Google Sheets API...</p>
              <p className="text-xs text-slate-400">กำลังดึงข้อมูลแถวบันทึกและตารางสรุปผลคะแนนสด</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2 text-center">
              <AlertTriangle className="w-6 h-6 text-rose-600 mx-auto" />
              <div className="text-sm font-bold">เกิดข้อผิดพลาดในการตรวจสอบ Sheet</div>
              <p className="text-xs text-rose-600">{error}</p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={loadVerification}
                  className="px-4 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700"
                >
                  ลองใหม่อีกครั้ง
                </button>
                <a
                  href={sheetInfo.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 bg-white border border-rose-300 text-rose-700 text-xs font-semibold rounded-lg"
                >
                  เปิดไฟล์ Sheet โดยตรง
                </a>
              </div>
            </div>
          ) : data ? (
            <>
              {/* Spreadsheet Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <span>{data.spreadsheetTitle || sheetInfo.title}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Spreadsheet ID: {sheetInfo.spreadsheetId}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={sheetInfo.spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors"
                  >
                    <span>เปิดดูใน Sheet</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={loadVerification}
                    title="โหลดข้อมูลตรวจสอบใหม่"
                    className="p-1.5 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Real Verification Match Indicator */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  isMatched
                    ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                    : isSheetBehind
                    ? 'bg-amber-50/90 border-amber-200 text-amber-900'
                    : 'bg-blue-50/90 border-blue-200 text-blue-900'
                }`}
              >
                {isMatched ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="text-sm font-bold flex items-center justify-between">
                    <span>
                      {isMatched
                        ? 'ข้อมูลในระบบตรงกับ Google Sheet จริง 100%'
                        : isSheetBehind
                        ? 'มีข้อมูลโหวตใหม่ที่ยังไม่ได้ซิงค์ลง Google Sheet'
                        : 'การตรวจสอบสถานะเรียบร้อย'}
                    </span>
                    <span className="text-[10px] font-semibold opacity-75">
                      ตรวจสอบเมื่อ: {new Date(data.fetchedAt).toLocaleTimeString('th-TH')} น.
                    </span>
                  </div>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">
                    {isMatched
                      ? `คะแนนโหวตทั้งหมด ${systemVotes.length} รายการ ถูกบันทึกและจัดเก็บไว้ใน Google Sheet ครบถ้วนถูกต้องสมบูรณ์`
                      : `ในระบบมี ${systemVotes.length} รายการ แต่ใน Google Sheet มี ${data.totalVotesInSheet} รายการ (ยังไม่ได้ซิงค์อีก ${Math.max(0, systemVotes.length - data.totalVotesInSheet)} รายการ)`}
                  </p>
                </div>
              </div>

              {/* Stats Counters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-center">
                  <div className="text-[11px] text-slate-500 font-medium">คะแนนในระบบ</div>
                  <div className="text-xl font-extrabold text-slate-800 mt-0.5">
                    {systemVotes.length}
                  </div>
                  <div className="text-[10px] text-slate-400">รายการ</div>
                </div>

                <div className="bg-emerald-50/60 rounded-2xl p-3 border border-emerald-100 text-center">
                  <div className="text-[11px] text-emerald-700 font-medium">คะแนนใน Sheet จริง</div>
                  <div className="text-xl font-extrabold text-emerald-800 mt-0.5">
                    {data.totalVotesInSheet}
                  </div>
                  <div className="text-[10px] text-emerald-600">รายการในตาราง</div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-center">
                  <div className="text-[11px] text-slate-500 font-medium">แผ่นงานบันทึก</div>
                  <div className="text-xs font-bold text-slate-800 mt-1.5 truncate">
                    บันทึกการโหวต
                  </div>
                  <div className="text-[10px] text-slate-400">คอลัมน์ A ถึง H</div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-center">
                  <div className="text-[11px] text-slate-500 font-medium">แผ่นงานสรุปผล</div>
                  <div className="text-xs font-bold text-slate-800 mt-1.5 truncate">
                    สรุปผลคะแนน
                  </div>
                  <div className="text-[10px] text-slate-400">{data.summaryTally.length} ผู้สมัคร</div>
                </div>
              </div>

              {/* Sample Records from Google Sheet */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Table className="w-3.5 h-3.5 text-emerald-600" />
                    <span>รายการโหวตล่าสุดที่ดึงมาจาก Google Sheet จริง ({data.sampleVotes.length} รายการ)</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">แผ่นงาน 'บันทึกการโหวต'</span>
                </div>

                {data.sampleVotes.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 text-slate-500 text-xs text-center border border-slate-100">
                    ขณะนี้ยังไม่มีรายการโหวตใน Google Sheet (หรือเพิ่งทำการรีเซ็ต)
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto max-h-56">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100/90 text-slate-700 font-semibold sticky top-0 border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">วัน-เวลา</th>
                            <th className="py-2.5 px-3">รหัสโหวต</th>
                            <th className="py-2.5 px-3">ชื่อผู้ลงคะแนน</th>
                            <th className="py-2.5 px-3">ผู้ที่ได้รับเลือกคนที่ 1</th>
                            <th className="py-2.5 px-3">ผู้ที่ได้รับเลือกคนที่ 2</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {data.sampleVotes.map((v, i) => (
                            <tr key={i} className="hover:bg-slate-50/70">
                              <td className="py-2 px-3 text-slate-500 whitespace-nowrap">{v.time}</td>
                              <td className="py-2 px-3 font-mono font-bold text-emerald-700 whitespace-nowrap">
                                {v.id}
                              </td>
                              <td className="py-2 px-3 text-slate-800 whitespace-nowrap font-medium">
                                {v.voterName}
                              </td>
                              <td className="py-2 px-3 text-slate-700 whitespace-nowrap">{v.c1}</td>
                              <td className="py-2 px-3 text-slate-700 whitespace-nowrap">{v.c2}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Tally from Sheet */}
              {data.summaryTally.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span>สรุปคะแนนสะสม 5 อันดับแรกที่บันทึกใน Sheet</span>
                    </h4>
                    <span className="text-[11px] text-slate-400">แผ่นงาน 'สรุปผลคะแนน'</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {data.summaryTally.slice(0, 6).map((c, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0">
                            {c.rank || idx + 1}
                          </span>
                          <span className="font-semibold text-slate-800 truncate">
                            หมายเลข {c.number}. {c.name} {c.nickname ? `(${c.nickname})` : ''}
                          </span>
                        </div>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                          {c.votes} โหวต
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            {sheetInfo && (
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>เชื่อมต่อ Google Sheets ค้างไว้ตลอดเวลา</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {sheetInfo && accessToken && (
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'กำลังซิงค์...' : 'ซิงค์ข้อมูลลง Sheet ทันที'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Share2, Copy, Check, QrCode, X, ExternalLink, Download, Sparkles, MessageCircle } from 'lucide-react';
import hospitalLogo from '../assets/images/thakhantho_hospital_logo_1791965444472.jpg';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Use the canonical shared URL for Tha Khan Tho Hospital voting
  const shareUrl =
    typeof window !== 'undefined'
      ? (window.location.origin.includes('localhost') || window.location.origin.includes('ais-dev')
          ? 'https://ais-pre-o4nvdzqoghmk2ruhmkuztz-44435437400.asia-southeast1.run.app'
          : window.location.href.split('#')[0])
      : 'https://ais-pre-o4nvdzqoghmk2ruhmkuztz-44435437400.asia-southeast1.run.app';

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(shareUrl)}`;

  const shareText = `🏥 ขอเชิญร่วมโหวต "ผู้ช่วยเหลือคนไข้ดีเด่น" โรงพยาบาลท่าคันโท ประจำปี ๒๕๖๙\n✨ เข้าโหวตได้ทันที (ไม่ต้อง Login / ไม่ต้องใช้อีเมล)\n🔗 ${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      onShowToast('คัดลอกลิงก์โหวตเรียบร้อยแล้ว! สามารถส่งต่อได้ทันที');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      onShowToast('คัดลอกลิงก์สำเร็จ: ' + shareUrl);
    }
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      onShowToast('คัดลอกข้อความสำหรับส่ง LINE เรียบร้อยแล้ว!');
    } catch {
      onShowToast('คัดลอกข้อความสำเร็จ');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'โหวตผู้ช่วยเหลือคนไข้ดีเด่น รพ.ท่าคันโท',
          text: 'ขอเชิญร่วมโหวตผู้ช่วยเหลือคนไข้ดีเด่น รพ.ท่าคันโท (เข้าโหวตได้ทันที ไม่ต้อง Login)',
          url: shareUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-emerald-100 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center p-1 border border-emerald-100">
            <img src={hospitalLogo} alt="โลโก้ รพ.ท่าคันโท" className="w-full h-full object-contain rounded-xl" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              แชร์ระบบโหวต โรงพยาบาลท่าคันโท
            </h3>
            <p className="text-xs text-emerald-700 font-medium">
              เปิดให้ทุกคนเข้าใช้งานได้ทันที • ไม่ต้อง Login ไม่ต้องใช้อีเมล
            </p>
          </div>
        </div>

        {/* QR Code Card for Hospital Poster & Ward Scanning */}
        <div className="bg-gradient-to-b from-emerald-50/70 to-white rounded-2xl p-5 border border-emerald-200/80 text-center mb-5">
          <div className="w-44 h-44 mx-auto bg-white p-2.5 rounded-2xl shadow-md border border-emerald-100 mb-3 flex items-center justify-center">
            <img
              src={qrImageUrl}
              alt="QR Code โหวตผู้ช่วยเหลือคนไข้ดีเด่น รพ.ท่าคันโท"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <p className="text-xs font-bold text-slate-800">
            สแกน QR Code เพื่อเปิดหน้าโหวตบนมือถือทันที
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            สามารถนำไปพิมพ์ติดป้ายประกาศในตึกผู้ป่วย OPD, IPD, LR หรือห้องพักเจ้าหน้าที่ได้
          </p>
        </div>

        {/* Share Link Box */}
        <div className="space-y-3 mb-5">
          <label className="block text-xs font-bold text-slate-700">
            ลิงก์สำหรับแชร์ (เปิดใช้งานได้ทันที):
          </label>
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="bg-transparent flex-1 text-xs text-slate-700 font-mono px-2 py-1 outline-none select-all"
            />
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                copied
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>คัดลอกลิงก์</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
          <button
            onClick={handleCopyMessage}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>คัดลอกข้อความสำหรับ LINE</span>
          </button>

          <button
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>กดส่งแชร์ไปยังแอปอื่น</span>
          </button>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>* ไม่มีการขอข้อมูลส่วนตัวหรือการล็อกอิน</span>
          <button onClick={onClose} className="font-semibold text-slate-600 hover:underline">
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};

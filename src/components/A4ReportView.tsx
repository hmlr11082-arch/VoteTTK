import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Candidate, VotingStats } from '../types/voting';
import { Download, Printer, Award, FileText, Crown } from 'lucide-react';
import hospitalLogo from '../assets/images/thakhantho_logo.svg';

interface A4ReportViewProps {
  stats: VotingStats;
  candidates: Candidate[];
}

export const A4ReportView: React.FC<A4ReportViewProps> = ({ stats, candidates }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const top1 = stats.topCandidates[0];
  const top2 = stats.topCandidates[1];
  const top3 = stats.topCandidates[2];

  const currentDate = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);

    try {
      const targetElement = reportRef.current;

      // Color converter using 2D canvas 1x1 pixel image data
      // This is mathematically guaranteed to output standard rgba(r,g,b,a) regardless of CSS modern color formats (oklch, lab, p3)
      const colorCanvas = document.createElement('canvas');
      colorCanvas.width = 1;
      colorCanvas.height = 1;
      const colorCtx = colorCanvas.getContext('2d', { willReadFrequently: true });

      const toRgbaSafe = (colorStr: string): string => {
        if (!colorStr || colorStr === 'transparent' || colorStr === 'inherit' || colorStr === 'initial') {
          return 'rgba(0, 0, 0, 0)';
        }
        if (!colorCtx) return '#000000';
        try {
          colorCtx.clearRect(0, 0, 1, 1);
          colorCtx.fillStyle = '#ffffff';
          colorCtx.fillStyle = colorStr;
          colorCtx.fillRect(0, 0, 1, 1);
          const [r, g, b, a] = colorCtx.getImageData(0, 0, 1, 1).data;
          return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`;
        } catch {
          return '#000000';
        }
      };

      const canvas = await html2canvas(targetElement, {
        scale: 2, // 2x for sharp print quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // 1. Remove all existing <style> and <link rel="stylesheet"> in clonedDoc.head
          // to ensure html2canvas encounters ZERO Tailwind v4 rules with oklch
          const existingStyles = Array.from(clonedDoc.querySelectorAll('style, link[rel="stylesheet"]'));
          existingStyles.forEach((el) => el.remove());

          // 2. Inject a clean, self-contained stylesheet with standard typography and zero oklch
          const cleanStyle = clonedDoc.createElement('style');
          cleanStyle.textContent = `
            * {
              box-sizing: border-box !important;
              margin: 0;
              padding: 0;
              font-family: 'Prompt', 'Sarabun', system-ui, -apple-system, sans-serif !important;
            }
            body {
              background-color: #ffffff !important;
              color: #0f172a !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            table {
              border-collapse: collapse !important;
              width: 100% !important;
            }
            th, td {
              box-sizing: border-box !important;
            }
            .flex { display: flex !important; }
            .flex-col { flex-direction: column !important; }
            .items-center { align-items: center !important; }
            .justify-between { justify-content: space-between !important; }
            .justify-center { justify-content: center !important; }
            .text-center { text-align: center !important; }
            .text-right { text-align: right !important; }
            .text-left { text-align: left !important; }
            .grid { display: grid !important; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
            .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
            .gap-1 { gap: 4px !important; }
            .gap-1\\.5 { gap: 6px !important; }
            .gap-2 { gap: 8px !important; }
            .gap-3 { gap: 12px !important; }
            .gap-4 { gap: 16px !important; }
            .gap-8 { gap: 32px !important; }
            .w-full { width: 100% !important; }
            .rounded { border-radius: 4px !important; }
            .rounded-lg { border-radius: 8px !important; }
            .rounded-xl { border-radius: 12px !important; }
            .rounded-full { border-radius: 9999px !important; }
            .font-bold { font-weight: 700 !important; }
            .font-semibold { font-weight: 600 !important; }
            .font-extrabold { font-weight: 800 !important; }
            .truncate { overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; }
            .overflow-hidden { overflow: hidden !important; }
            .mx-auto { margin-left: auto !important; margin-right: auto !important; }
            .mb-0\\.5 { margin-bottom: 2px !important; }
            .mb-1 { margin-bottom: 4px !important; }
            .mb-1\\.5 { margin-bottom: 6px !important; }
            .mb-2 { margin-bottom: 8px !important; }
            .mb-2\\.5 { margin-bottom: 10px !important; }
            .mb-3 { margin-bottom: 12px !important; }
            .mb-3\\.5 { margin-bottom: 14px !important; }
            .mb-4 { margin-bottom: 16px !important; }
            .mb-10 { margin-bottom: 40px !important; }
            .mt-0\\.5 { margin-top: 2px !important; }
            .mt-1 { margin-top: 4px !important; }
            .mt-2 { margin-top: 8px !important; }
            .mt-3 { margin-top: 12px !important; }
            .mt-4 { margin-top: 16px !important; }
            .pt-1 { padding-top: 4px !important; }
            .pt-2 { padding-top: 8px !important; }
            .pt-4 { padding-top: 16px !important; }
            .pb-2 { padding-bottom: 8px !important; }
            .pb-4 { padding-bottom: 16px !important; }
            .p-0\\.5 { padding: 2px !important; }
            .p-1\\.5 { padding: 6px !important; }
            .p-2 { padding: 8px !important; }
            .p-2\\.5 { padding: 10px !important; }
            .p-3\\.5 { padding: 14px !important; }
            .p-4 { padding: 16px !important; }
            .py-1 { padding-top: 4px !important; padding-bottom: 4px !important; }
            .py-1\\.5 { padding-top: 6px !important; padding-bottom: 6px !important; }
            .px-2 { padding-left: 8px !important; padding-right: 8px !important; }
            .px-2\\.5 { padding-left: 10px !important; padding-right: 10px !important; }
            .text-xs { font-size: 12px !important; line-height: 16px !important; }
            .text-sm { font-size: 14px !important; line-height: 20px !important; }
            .text-base { font-size: 16px !important; line-height: 24px !important; }
            .text-lg { font-size: 18px !important; line-height: 26px !important; }
            .text-\\[9px\\] { font-size: 9px !important; }
            .text-\\[10px\\] { font-size: 10px !important; }
            .text-\\[11px\\] { font-size: 11px !important; }
            .w-12 { width: 48px !important; }
            .w-14 { width: 56px !important; }
            .w-16 { width: 64px !important; }
            .w-20 { width: 80px !important; }
            .h-20 { height: 80px !important; }
            .w-4 { width: 16px !important; }
            .h-4 { height: 16px !important; }
          `;
          clonedDoc.head.appendChild(cleanStyle);

          // 3. Ensure target element and all children have safe colors and explicit dimensions
          const target = clonedDoc.getElementById('a4-document-content');
          if (target) {
            target.style.backgroundColor = '#ffffff';
            target.style.color = '#0f172a';
            target.style.width = '794px'; // 210mm in pixels at 96dpi
            target.style.minHeight = '1122px'; // 297mm in pixels at 96dpi
            target.style.padding = '48px';
            target.style.boxShadow = 'none';

            const allElements = [target, ...Array.from(target.querySelectorAll('*'))] as HTMLElement[];
            allElements.forEach((el) => {
              ['color', 'backgroundColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'].forEach((prop) => {
                const val = (el.style as any)[prop];
                if (typeof val === 'string' && (val.includes('oklch') || val.includes('color('))) {
                  (el.style as any)[prop] = toRgbaSafe(val);
                }
              });

              if (el.style.boxShadow && (el.style.boxShadow.includes('oklch') || el.style.boxShadow.includes('color('))) {
                el.style.boxShadow = 'none';
              }
            });
          }
        },
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      // A4 dimensions in mm: 210 x 297
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`รายงานผลโหวต_ผู้ช่วยเหลือคนไข้ดีเด่น_รพ.ท่าคันโท_${new Date().getFullYear() + 543}.pdf`);
    } catch (err) {
      console.error('Error generating PDF with html2canvas:', err);
      // Fallback: trigger system print directly
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Controls Toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span>แบบฟอร์มเอกสารทางการ A4 (210 × 297 mm)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">
            เอกสารสรุปผลการโหวต ผู้ช่วยเหลือคนไข้ดีเด่น
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            จัดทำตามมาตรฐานรายงานทางราชการ โรงพยาบาลท่าคันโท
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors shadow-2xs"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>พิมพ์เอกสาร (Print)</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'กำลังสร้างไฟล์ PDF...' : 'ดาวน์โหลด A4 PDF'}</span>
          </button>
        </div>
      </div>

      {/* A4 Container Preview Wrapper */}
      <div className="overflow-x-auto pb-8 flex justify-center">
        {/* Exact A4 Sheet Page: 210mm x 297mm */}
        <div
          ref={reportRef}
          id="a4-document-content"
          className="shadow-2xl rounded-sm print:shadow-none print:rounded-none w-[210mm] min-h-[297mm] p-[16mm] print:border-none flex flex-col justify-between"
          style={{
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
          }}
        >
          {/* Document Header with Emblem & Title */}
          <div>
            <div
              className="text-center pb-4 mb-4"
              style={{ borderBottom: '2px solid #059669' }}
            >
              {/* Official Emblem */}
              <div
                className="w-20 h-20 mx-auto mb-2.5 rounded-2xl overflow-hidden p-1 aspect-square"
                style={{
                  backgroundColor: '#ffffff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  border: '1.5px solid #a7f3d0',
                }}
              >
                <img
                  src={hospitalLogo}
                  alt="ตราสัญลักษณ์โรงพยาบาลท่าคันโท"
                  className="w-full h-full object-contain rounded-xl aspect-square"
                />
              </div>
              <h1 className="text-lg font-bold tracking-tight" style={{ color: '#0f172a' }}>
                รายงานสรุปผลการคัดเลือกและโหวต "ผู้ช่วยเหลือคนไข้ดีเด่น"
              </h1>
              <h2 className="text-base font-semibold" style={{ color: '#065f46' }}>
                โรงพยาบาลท่าคันโท อำเภอท่าคันโท จังหวัดกาฬสินธุ์
              </h2>
              <p className="text-xs mt-1" style={{ color: '#64748b' }}>
                โครงการเสริมสร้างขวัญกำลังใจและยกย่องเชิดชูเกียรติบุคลากร ประจำปีงบประมาณ ๒๕๖๙
              </p>

              <div
                className="flex items-center justify-between text-[11px] mt-3 pt-2"
                style={{ color: '#475569', borderTop: '1px solid #e2e8f0' }}
              >
                <span>
                  <strong>ข้อมูล ณ วันที่:</strong> {currentDate}
                </span>
                <span>
                  <strong>จำนวนผู้มีสิทธิ์ที่ร่วมโหวต:</strong> {stats.totalVoters} คน (คะแนนรวม {stats.totalVotes} คะแนน)
                </span>
                <span>
                  <strong>เกณฑ์การโหวต:</strong> เลือกได้สูงสุด ๒ ท่าน
                </span>
              </div>
            </div>

            {/* Highlights: Top 3 Winners Box */}
            <div
              className="mb-4 rounded-xl p-3.5"
              style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
              }}
            >
              <div
                className="text-xs font-bold mb-2 flex items-center gap-1.5"
                style={{ color: '#064e3b' }}
              >
                <Crown style={{ width: '16px', height: '16px', color: '#d97706' }} />
                <span>รายชื่อผู้ได้รับคะแนนโหวตสูงสุด ๓ อันดับแรก (ดีเด่นประจำปี)</span>
              </div>

              {stats.totalVotes === 0 ? (
                <div
                  className="rounded-lg p-4 text-center"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px dashed #6ee7b7',
                  }}
                >
                  <div className="text-xs font-bold" style={{ color: '#334155' }}>
                    ยังไม่มีการลงคะแนนโหวตในระบบ
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: '#94a3b8' }}>
                    (รายชื่อผู้ได้รับคะแนนโหวตสูงสุด ๓ อันดับแรก จะประมวลผลและแสดงที่นี่เมื่อเริ่มมีการลงคะแนน)
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {/* 1st */}
                  <div
                    className="rounded-lg p-2.5 text-center"
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #fcd34d',
                    }}
                  >
                    <div
                      className="text-[10px] font-bold uppercase tracking-wide"
                      style={{ color: '#92400e' }}
                    >
                      อันดับ ๑ (ชนะเลิศ)
                    </div>
                    <div
                      className="text-xs font-extrabold mt-0.5 truncate"
                      style={{ color: '#0f172a' }}
                    >
                      #{top1?.number} {top1?.name}
                    </div>
                    <div
                      className="text-[11px] font-bold"
                      style={{ color: '#047857' }}
                    >
                      ({top1?.nickname})
                    </div>
                    <div className="text-[10px] truncate" style={{ color: '#047857', fontWeight: 600 }}>
                      ผู้ช่วยเหลือคนไข้
                    </div>
                    <div
                      className="text-xs font-bold mt-1"
                      style={{ color: '#d97706' }}
                    >
                      {top1?.voteCount || 0} คะแนน ({top1?.percentage || 0}%)
                    </div>
                  </div>

                  {/* 2nd */}
                  <div
                    className="rounded-lg p-2.5 text-center"
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                    }}
                  >
                    <div
                      className="text-[10px] font-bold uppercase tracking-wide"
                      style={{ color: '#334155' }}
                    >
                      อันดับ ๒ (รองฯ อันดับ ๑)
                    </div>
                    <div
                      className="text-xs font-extrabold mt-0.5 truncate"
                      style={{ color: '#0f172a' }}
                    >
                      #{top2?.number} {top2?.name}
                    </div>
                    <div
                      className="text-[11px] font-bold"
                      style={{ color: '#047857' }}
                    >
                      ({top2?.nickname})
                    </div>
                    <div className="text-[10px] truncate" style={{ color: '#475569', fontWeight: 600 }}>
                      ผู้ช่วยเหลือคนไข้
                    </div>
                    <div
                      className="text-xs font-bold mt-1"
                      style={{ color: '#475569' }}
                    >
                      {top2?.voteCount || 0} คะแนน ({top2?.percentage || 0}%)
                    </div>
                  </div>

                  {/* 3rd */}
                  <div
                    className="rounded-lg p-2.5 text-center"
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #fed7aa',
                    }}
                  >
                    <div
                      className="text-[10px] font-bold uppercase tracking-wide"
                      style={{ color: '#9a3412' }}
                    >
                      อันดับ ๓ (รองฯ อันดับ ๒)
                    </div>
                    <div
                      className="text-xs font-extrabold mt-0.5 truncate"
                      style={{ color: '#0f172a' }}
                    >
                      #{top3?.number} {top3?.name}
                    </div>
                    <div
                      className="text-[11px] font-bold"
                      style={{ color: '#047857' }}
                    >
                      ({top3?.nickname})
                    </div>
                    <div className="text-[10px] truncate" style={{ color: '#9a3412', fontWeight: 600 }}>
                      ผู้ช่วยเหลือคนไข้
                    </div>
                    <div
                      className="text-xs font-bold mt-1"
                      style={{ color: '#c2410c' }}
                    >
                      {top3?.voteCount || 0} คะแนน ({top3?.percentage || 0}%)
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Official Table of All 18 Candidates */}
            <div className="mb-4">
              <div
                className="text-xs font-bold mb-1.5 flex items-center justify-between"
                style={{ color: '#1e293b' }}
              >
                <span>ตารางสรุปผลคะแนนโหวตผู้สมัครทั้งหมด {candidates.length} ท่าน</span>
                {stats.totalVotes === 0 && (
                  <span className="text-[10px] font-normal" style={{ color: '#94a3b8' }}>
                    * สถานะ: ยังไม่เริ่มการนับคะแนนโหวต
                  </span>
                )}
              </div>
              <table
                className="w-full text-left border-collapse text-[11px]"
                style={{ border: '1px solid #cbd5e1' }}
              >
                <thead>
                  <tr
                    className="font-bold"
                    style={{
                      backgroundColor: '#d1fae5',
                      color: '#064e3b',
                      borderBottom: '1px solid #6ee7b7',
                    }}
                  >
                    <th className="py-1.5 px-2 text-center w-12" style={{ borderRight: '1px solid #a7f3d0' }}>อันดับ</th>
                    <th className="py-1.5 px-2 text-center w-12" style={{ borderRight: '1px solid #a7f3d0' }}>เบอร์</th>
                    <th className="py-1.5 px-2.5" style={{ borderRight: '1px solid #a7f3d0' }}>ชื่อ - สกุล</th>
                    <th className="py-1.5 px-2 text-center w-16" style={{ borderRight: '1px solid #a7f3d0' }}>ชื่อเล่น</th>
                    <th className="py-1.5 px-2.5" style={{ borderRight: '1px solid #a7f3d0' }}>ตำแหน่ง</th>
                    <th className="py-1.5 px-2 text-right w-16" style={{ borderRight: '1px solid #a7f3d0' }}>คะแนน</th>
                    <th className="py-1.5 px-2 text-right w-14">ร้อยละ</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.tallies.map((t, idx) => {
                    const rowBg =
                      stats.totalVotes > 0 && idx < 3
                        ? '#fffbeb'
                        : idx % 2 === 0
                        ? '#f8fafc'
                        : '#ffffff';

                    return (
                      <tr
                        key={t.id}
                        style={{
                          backgroundColor: rowBg,
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        <td className="py-1 px-2 text-center" style={{ borderRight: '1px solid #e2e8f0' }}>
                          {stats.totalVotes === 0
                            ? '-'
                            : idx === 0
                            ? '🥇 1'
                            : idx === 1
                            ? '🥈 2'
                            : idx === 2
                            ? '🥉 3'
                            : t.rank}
                        </td>
                        <td
                          className="py-1 px-2 text-center font-bold"
                          style={{ borderRight: '1px solid #e2e8f0', color: '#334155' }}
                        >
                          {t.number}
                        </td>
                        <td
                          className="py-1 px-2.5 font-medium"
                          style={{ borderRight: '1px solid #e2e8f0', color: '#0f172a' }}
                        >
                          {t.name}
                        </td>
                        <td
                          className="py-1 px-2 text-center font-bold"
                          style={{ borderRight: '1px solid #e2e8f0', color: '#047857' }}
                        >
                          {t.nickname}
                        </td>
                        <td
                          className="py-1 px-2.5"
                          style={{ borderRight: '1px solid #e2e8f0', color: '#475569' }}
                        >
                          ผู้ช่วยเหลือคนไข้
                        </td>
                        <td
                          className="py-1 px-2 text-right font-bold"
                          style={{ borderRight: '1px solid #e2e8f0', color: '#0f172a' }}
                        >
                          {stats.totalVotes === 0 ? '-' : t.voteCount}
                        </td>
                        <td className="py-1 px-2 text-right font-medium" style={{ color: '#475569' }}>
                          {stats.totalVotes === 0 ? '-' : `${t.percentage}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Certified Summary Stats (Concealed Department, Unified Overview) */}
            <div className="grid grid-cols-4 gap-2 mb-4 text-[10px]">
              <div
                className="rounded p-1.5 text-center"
                style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}
              >
                <div style={{ color: '#166534' }}>ผู้มาใช้สิทธิโหวตทั้งหมด</div>
                <div className="font-bold text-xs mt-0.5" style={{ color: '#0f172a' }}>
                  {stats.totalVoters} ท่าน
                </div>
              </div>
              <div
                className="rounded p-1.5 text-center"
                style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}
              >
                <div style={{ color: '#166534' }}>คะแนนโหวตรวมทั้งหมด</div>
                <div className="font-bold text-xs mt-0.5" style={{ color: '#0f172a' }}>
                  {stats.totalVotes} คะแนน
                </div>
              </div>
              <div
                className="rounded p-1.5 text-center"
                style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}
              >
                <div style={{ color: '#92400e' }}>ผู้นำคะแนนอันดับ ๑</div>
                <div className="font-bold text-xs mt-0.5 truncate" style={{ color: '#0f172a' }}>
                  {top1 && stats.totalVotes > 0 ? `#${top1.number} ${top1.name} (${top1.nickname})` : '-'}
                </div>
              </div>
              <div
                className="rounded p-1.5 text-center"
                style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
              >
                <div style={{ color: '#64748b' }}>ระบบตรวจนับคะแนน</div>
                <div className="font-bold text-xs mt-0.5 text-emerald-700">
                  ระบบกลาง รพ.ท่าคันโท
                </div>
              </div>
            </div>
          </div>

          {/* Document Sign-off Footer */}
          <div className="pt-4" style={{ borderTop: '2px solid #cbd5e1' }}>
            <div className="grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <p className="mb-10" style={{ color: '#475569' }}>
                  ลงชื่อ..............................................................
                </p>
                <p className="font-bold" style={{ color: '#0f172a' }}>
                  (..............................................................)
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: '#64748b' }}>
                  ประธานคณะกรรมการจัดโครงการโหวตคนดีศรีกระทรวง
                </p>
                <p className="text-[10px]" style={{ color: '#94a3b8' }}>
                  โรงพยาบาลท่าคันโท
                </p>
              </div>

              <div>
                <p className="mb-10" style={{ color: '#475569' }}>
                  ลงชื่อ..............................................................
                </p>
                <p className="font-bold" style={{ color: '#0f172a' }}>
                  (..............................................................)
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: '#64748b' }}>
                  ผู้อำนวยการโรงพยาบาลท่าคันโท
                </p>
                <p className="text-[10px]" style={{ color: '#94a3b8' }}>
                  นายแพทย์ชำนาญการพิเศษ รักษาการในตำแหน่ง
                </p>
              </div>
            </div>

            <div
              className="mt-4 pt-2 flex justify-between text-[9px]"
              style={{ color: '#94a3b8', borderTop: '1px solid #f1f5f9' }}
            >
              <span>รหัสเอกสาร: TKTH-ADM-2569-VOTE</span>
              <span>ระบบประมวลผลข้อมูลโหวตโรงพยาบาลท่าคันโท</span>
              <span>หน้า ๑ จาก ๑</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

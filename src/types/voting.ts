export type Department = 'GENERAL' | 'OPD' | 'IPD' | 'LR';

export interface Candidate {
  id: string;
  number: number;
  name: string;
  nickname: string;
  department: Department;
  departmentLabel: string;
  avatarColor: string;
  roleDescription: string;
}

export interface VoteRecord {
  id: string;
  voterDeviceId?: string; // Unique client device identifier to enforce 1 vote per voter
  voterName: string;
  voterRole: string; // e.g. 'เจ้าหน้าที่ รพ.ท่าคันโท', 'ผู้รับบริการ/คนไข้', 'ญาติคนไข้'
  voterDepartment?: string;
  selectedCandidateIds: string[]; // Exactly 1 or 2 candidates (max 2)
  note?: string;
  timestamp: string; // ISO string
  syncedToGoogleSheets?: boolean;
}

export interface CandidateTally extends Candidate {
  voteCount: number;
  percentage: number;
  rank: number;
}

export interface VotingStats {
  totalVotes: number;
  totalVoters: number;
  departmentCounts: Record<Department, number>;
  topCandidates: CandidateTally[];
  tallies: CandidateTally[];
  lastVoteTime?: string;
}

export const DEPARTMENTS: { key: Department; label: string; short: string; color: string; badgeClass: string }[] = [
  {
    key: 'GENERAL',
    label: 'ผู้ช่วยเหลือคนไข้ทั่วไป',
    short: 'ทั่วไป',
    color: 'emerald',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    key: 'OPD',
    label: 'เจ้าหน้าที่ OPD (ผู้ป่วยนอก)',
    short: 'OPD',
    color: 'teal',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
  },
  {
    key: 'IPD',
    label: 'เจ้าหน้าที่ IPD (ผู้ป่วยใน)',
    short: 'IPD',
    color: 'cyan',
    badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  },
  {
    key: 'LR',
    label: 'เจ้าหน้าที่ LR (ห้องคลอด)',
    short: 'LR (ห้องคลอด)',
    color: 'rose',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
  },
];

export const INITIAL_CANDIDATES: Candidate[] = [
  // 1. ผู้ช่วยเหลือคนไข้ทั่วไป (4 ท่าน)
  {
    id: 'gen-1',
    number: 1,
    name: 'นายธนาวุฒิ นาเมืองรักษ์',
    nickname: 'หลง',
    department: 'GENERAL',
    departmentLabel: 'ผู้ช่วยเหลือคนไข้ทั่วไป',
    avatarColor: 'from-emerald-400 to-teal-500',
    roleDescription: 'ผู้ช่วยเหลือคนไข้ ปฏิบัติงานด้วยความขยันและเป็นมิตร',
  },
  {
    id: 'gen-2',
    number: 2,
    name: 'นายพลากร ทุมวุงศ์',
    nickname: 'กร',
    department: 'GENERAL',
    departmentLabel: 'ผู้ช่วยเหลือคนไข้ทั่วไป',
    avatarColor: 'from-emerald-500 to-green-600',
    roleDescription: 'ผู้ช่วยเหลือคนไข้ คล่องแคล่ว มีจิตบริการสูง',
  },
  {
    id: 'gen-3',
    number: 3,
    name: 'นายสิทธิชัย พุ่มประภา',
    nickname: 'มิตร',
    department: 'GENERAL',
    departmentLabel: 'ผู้ช่วยเหลือคนไข้ทั่วไป',
    avatarColor: 'from-teal-400 to-emerald-600',
    roleDescription: 'ผู้ช่วยเหลือคนไข้ สุภาพ ใจเย็น อาสาช่วยงานเสมอ',
  },
  {
    id: 'gen-5',
    number: 4,
    name: 'นายจิระศักดิ์ นาเมืองรักษ์',
    nickname: 'เปี๊ยก',
    department: 'GENERAL',
    departmentLabel: 'ผู้ช่วยเหลือคนไข้ทั่วไป',
    avatarColor: 'from-emerald-600 to-teal-700',
    roleDescription: 'ผู้ช่วยเหลือคนไข้ ทุ่มเท อัธยาศัยดี เป็นที่รักของทุกคน',
  },

  // 2. เจ้าหน้าที่ OPD (3 ท่าน)
  {
    id: 'opd-1',
    number: 5,
    name: 'นายเกียรติศักดิ์ ราชบัณฑิต',
    nickname: 'หมู',
    department: 'OPD',
    departmentLabel: 'เจ้าหน้าที่ OPD',
    avatarColor: 'from-teal-500 to-cyan-600',
    roleDescription: 'เจ้าหน้าที่แผนกผู้ป่วยนอก ดูแลจัดคิวและประสานงานคนไข้',
  },
  {
    id: 'opd-2',
    number: 6,
    name: 'น.ส.นุสรา สนธาทร',
    nickname: 'เม',
    department: 'OPD',
    departmentLabel: 'เจ้าหน้าที่ OPD',
    avatarColor: 'from-teal-400 to-sky-500',
    roleDescription: 'เจ้าหน้าที่แผนกผู้ป่วยนอก ยิ้มแย้ม ให้ข้อมูลชัดเจน',
  },
  {
    id: 'opd-3',
    number: 7,
    name: 'น.ส.จารุภา นรพัฒน์',
    nickname: 'ขวัญ',
    department: 'OPD',
    departmentLabel: 'เจ้าหน้าที่ OPD',
    avatarColor: 'from-cyan-500 to-teal-600',
    roleDescription: 'เจ้าหน้าที่แผนกผู้ป่วยนอก ให้บริการด้วยความอบอุ่นและใส่ใจ',
  },

  // 3. เจ้าหน้าที่ IPD (6 ท่าน)
  {
    id: 'ipd-1',
    number: 8,
    name: 'น.ส.ธันยารัตน์ นากองศรี',
    nickname: 'พี่หนิด',
    department: 'IPD',
    departmentLabel: 'เจ้าหน้าที่ IPD',
    avatarColor: 'from-sky-400 to-cyan-600',
    roleDescription: 'เจ้าหน้าที่แผนกผู้ป่วยใน ดูแลผู้ป่วยใกล้ชิด มีประสบการณ์สูง',
  },
  {
    id: 'ipd-2',
    number: 9,
    name: 'น.ส.รุ่งณวรรณ์ สาโรจน์',
    nickname: 'พี่รุ่ง',
    department: 'IPD',
    departmentLabel: 'เจ้าหน้าที่ IPD',
    avatarColor: 'from-cyan-400 to-blue-500',
    roleDescription: 'เจ้าหน้าที่แผนกผู้ป่วยใน อบอุ่น คอยช่วยเหลือผู้ป่วยสม่ำเสมอ',
  },
  {
    id: 'ipd-3',
    number: 10,
    name: 'น.ส.พันธ์วิรา ศรีเศรษฐา',
    nickname: 'ลำใย',
    department: 'IPD',
    departmentLabel: 'เจ้าหน้าที่ IPD',
    avatarColor: 'from-sky-500 to-indigo-500',
    roleDescription: 'เจ้าหน้าที่แผนกผู้ป่วยใน กระตือรือร้น ใส่ใจความสะอาดและปลอดภัย',
  },
  {
    id: 'ipd-4',
    number: 11,
    name: 'น.ส.น้ำฝน ใชยพรม',
    nickname: 'ป๊อป',
    department: 'IPD',
    departmentLabel: 'เจ้าหน้าที่ IPD',
    avatarColor: 'from-teal-500 to-sky-600',
    roleDescription: 'เจ้าหน้าที่แผนกผู้ป่วยใน เป็นกันเอง ดูแลผู้ป่วยอย่างทั่วถึง',
  },
  {
    id: 'ipd-5',
    number: 12,
    name: 'น.ส.พัชรพร ไชยเนตร',
    nickname: 'อิ๋ว',
    department: 'IPD',
    departmentLabel: 'เจ้าหน้าที่ IPD',
    avatarColor: 'from-cyan-500 to-emerald-500',
    roleDescription: 'เจ้าหน้าที่แผนกผู้ป่วยใน มีน้ำใจ ทำงานคล่องตัวและแม่นยำ',
  },
  {
    id: 'ipd-6',
    number: 13,
    name: 'น.ส.ศุภวรรณ วิบุญกุล',
    nickname: 'เจนนี่',
    department: 'IPD',
    departmentLabel: 'เจ้าหน้าที่ IPD',
    avatarColor: 'from-emerald-400 to-cyan-500',
    roleDescription: 'เจ้าหน้าที่แผนกผู้ป่วยใน มีรอยยิ้มสดใส ให้กำลังใจผู้ป่วยดีเยี่ยม',
  },

  // 4. เจ้าหน้าที่ LR (4 ท่าน)
  {
    id: 'lr-1',
    number: 14,
    name: 'นางเพ็ง วงค์อินตา',
    nickname: 'ยายน้อย',
    department: 'LR',
    departmentLabel: 'เจ้าหน้าที่ LR (ห้องคลอด)',
    avatarColor: 'from-rose-400 to-pink-500',
    roleDescription: 'เจ้าหน้าที่ห้องคลอด เปี่ยมด้วยเมตตาและประสบการณ์อันยาวนาน',
  },
  {
    id: 'lr-2',
    number: 15,
    name: 'นางธีรวรรณ กุลชร',
    nickname: 'ยายแดง',
    department: 'LR',
    departmentLabel: 'เจ้าหน้าที่ LR (ห้องคลอด)',
    avatarColor: 'from-pink-400 to-rose-500',
    roleDescription: 'เจ้าหน้าที่ห้องคลอด เอาใจใส่ ดูแลคุณแม่และทารกด้วยความอ่อนโยน',
  },
  {
    id: 'lr-3',
    number: 16,
    name: 'นางหนูบาน สิงห์จรรยา',
    nickname: 'พี่นก',
    department: 'LR',
    departmentLabel: 'เจ้าหน้าที่ LR (ห้องคลอด)',
    avatarColor: 'from-rose-500 to-red-500',
    roleDescription: 'เจ้าหน้าที่ห้องคลอด ทุ่มเทเสียสละ พร้อมรับเคสตลอดเวลา',
  },
  {
    id: 'lr-4',
    number: 17,
    name: 'น.ส.เจศฎาภรณ์ กรไชยา',
    nickname: 'น้องเบียร์บี้',
    department: 'LR',
    departmentLabel: 'เจ้าหน้าที่ LR (ห้องคลอด)',
    avatarColor: 'from-pink-500 to-purple-500',
    roleDescription: 'เจ้าหน้าที่ห้องคลอด ว่องไว สดใส มีความรับผิดชอบสูง',
  },
];

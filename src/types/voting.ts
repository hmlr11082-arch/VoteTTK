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
  // รายชื่อผู้สมัครรับการโหวต ผู้ช่วยเหลือคนไข้ดีเด่น โรงพยาบาลท่าคันโท (หมายเลข 1 ถึง 17)
  {
    id: 'gen-1',
    number: 1,
    name: 'นายธนาวุฒิ นาเมืองรักษ์',
    nickname: 'หลง',
    department: 'GENERAL',
    departmentLabel: 'ผู้ช่วยเหลือคนไข้',
    avatarColor: 'from-emerald-600 to-teal-700',
    roleDescription: 'ผู้ช่วยเหลือคนไข้ ปฏิบัติหน้าที่ด้วยความขยัน มุ่งมั่น และมีจิตบริการ',
  },
  {
    id: 'gen-2',
    number: 2,
    name: 'นายพลากร ทุมวุงศ์',
    nickname: 'กร',
    department: 'GENERAL',
    departmentLabel: 'ผู้ช่วยเหลือคนไข้',
    avatarColor: 'from-emerald-600 to-teal-700',
    roleDescription: 'ผู้ช่วยเหลือคนไข้ คล่องแคล่ว เอาใจใส่และดูแลผู้รับบริการด้วยรอยยิ้ม',
  },
  {
    id: 'gen-3',
    number: 3,
    name: 'นายสิทธิชัย พุ่มประภา',
    nickname: 'มิตร',
    department: 'GENERAL',
    departmentLabel: 'ผู้ช่วยเหลือคนไข้',
    avatarColor: 'from-emerald-600 to-teal-700',
    roleDescription: 'ผู้ช่วยเหลือคนไข้ สุภาพ ใจเย็น มีน้ำใจ และพร้อมช่วยเหลือทุกคน',
  },
  {
    id: 'gen-5',
    number: 4,
    name: 'นายจิระศักดิ์ นาเมืองรักษ์',
    nickname: 'เปี๊ยก',
    department: 'GENERAL',
    departmentLabel: 'ผู้ช่วยเหลือคนไข้',
    avatarColor: 'from-emerald-600 to-teal-700',
    roleDescription: 'ผู้ช่วยเหลือคนไข้ ทุ่มเท เสียสละ อัธยาศัยดี เป็นที่รักของทุกคน',
  },
  {
    id: 'opd-1',
    number: 5,
    name: 'นายเกียรติศักดิ์ ราชบัณฑิต',
    nickname: 'หมู',
    department: 'GENERAL',
    departmentLabel: 'ผู้ช่วยเหลือคนไข้',
    avatarColor: 'from-emerald-600 to-teal-700',
    roleDescription: 'ผู้ช่วยเหลือคนไข้ ดูแลประสานงานและอำนวยความสะดวกให้ผู้ป่วยอย่างรวดเร็ว',
  },
  {
    id: 'opd-2',
    number: 6,
    name: 'น.ส.นุสรา สนธาทร',
    nickname: 'เม',
    department: 'GENERAL',
    departmentLabel: 'ผู้ช่วยเหลือคนไข้',
    avatarColor: 'from-emerald-600 to-teal-700',
    roleDescription: 'ผู้ช่วยเหลือคนไข้ ยิ้มแย้มแจ่มใส ให้บริการด้วยความจริงใจและสุภาพ',
  },
  {
    id: 'opd-3',
    number: 7,
    name: 'น.ส.จารุภา นรพัฒน์',
    nickname: 'ขวัญ',
    department: 'GENERAL',
    departmentLabel: 'ผู้ช่วยเหลือคนไข้',
    avatarColor: 'from-emerald-600 to-teal-700',
    roleDescription: 'ผู้ช่วยเหลือคนไข้ ปฏิบัติงานด้วยความอบอุ่น เอาใจใส่และเอื้ออาทรต่อคนไข้',
  },
  {
    id: 'ipd-1',
    number: 8,
    name: 'น.ส.ธันยารัตน์ นากองศรี',
    nickname: 'พี่หนิด',
    department: 'GENERAL',
    departmentLabel: 'ผู้ช่วยเหลือคนไข้',
    avatarColor: 'from-emerald-600 to-teal-700',
    roleDescription: 'ผู้ช่วยเหลือคนไข้ เปี่ยมด้วยประสบการณ์ ดูแลผู้ป่วยอย่างใกล้ชิดและรอบคอบ',
  },
  {
    id: 'ipd-2',
    number: 9,
    name: 'น.ส.รุ่งณวรรณ์ สาโรจน์',
    nickname: 'พี่รุ่ง',
    department: 'GENERAL',
    departmentLabel: 'ผู้ช่วยเหลือคนไข้',
    avatarColor: 'from-emerald-600 to-teal-700',
    roleDescription: 'ผู้ช่วยเหลือคนไข้ อบอุ่น มีเมตตา คอยช่วยเหลือผู้รับบริการอย่างสม่ำเสมอ',
  },
  {
    id: 'ipd-3',
    number: 10,
    name: 'น.ส.พันธ์วิรา ศรีเศรษฐา',
    nickname: 'ลำใย',
    department: 'GENERAL',
    departmentLabel: 'ผู้ช่วยเหลือคนไข้',
    avatarColor: 'from-emerald-600 to-teal-700',
    roleDescription: 'ผู้ช่วยเหลือคนไข้ กระตือรือร้น ใส่ใจความสะอาดและมาตรฐานความปลอดภัย',
  },
  {
    id: 'ipd-4',
    number: 11,
    name: 'น.ส.น้ำฝน ใชยพรม',
    nickname: 'ป๊อป',
    department: 'GENERAL',
    departmentLabel: 'ผู้ช่วยเหลือคนไข้',
    avatarColor: 'from-emerald-600 to-teal-700',
    roleDescription: 'ผู้ช่วยเหลือคนไข้ เป็นกันเอง สุภาพ อ่อนน้อม และดูแลผู้ป่วยอย่างทั่วถึง',
  },
  {
    id: 'ipd-5',
    number: 12,
    name: 'น.ส.พัชรพร ไชยเนตร',
    nickname: 'อิ๋ว',
    department: 'GENERAL',
    departmentLabel: 'ผู้ช่วยเหลือคนไข้',
    avatarColor: 'from-emerald-600 to-teal-700',
    roleDescription: 'ผู้ช่วยเหลือคนไข้ มีน้ำใจ ทำงานคล่องตัว มีมนุษยสัมพันธ์ดีเยี่ยม',
  },
  {
    id: 'ipd-6',
    number: 13,
    name: 'น.ส.ศุภวรรณ วิบุญกุล',
    nickname: 'เจนนี่',
    department: 'GENERAL',
    departmentLabel: 'ผู้ช่วยเหลือคนไข้',
    avatarColor: 'from-emerald-600 to-teal-700',
    roleDescription: 'ผู้ช่วยเหลือคนไข้ รอยยิ้มสดใส มอบกำลังใจและบริการที่ดีแก่ผู้ป่วยเสมอ',
  },
  {
    id: 'lr-1',
    number: 14,
    name: 'นางเพ็ง วงค์อินตา',
    nickname: 'ยายน้อย',
    department: 'GENERAL',
    departmentLabel: 'ผู้ช่วยเหลือคนไข้',
    avatarColor: 'from-emerald-600 to-teal-700',
    roleDescription: 'ผู้ช่วยเหลือคนไข้ เปี่ยมด้วยความเมตตาและประสบการณ์อันยาวนานในการดูแล',
  },
  {
    id: 'lr-2',
    number: 15,
    name: 'นางธีรวรรณ กุลชร',
    nickname: 'ยายแดง',
    department: 'GENERAL',
    departmentLabel: 'ผู้ช่วยเหลือคนไข้',
    avatarColor: 'from-emerald-600 to-teal-700',
    roleDescription: 'ผู้ช่วยเหลือคนไข้ เอาใจใส่ ดูแลคนไข้และญาติด้วยความอ่อนโยนและอบอุ่น',
  },
  {
    id: 'lr-3',
    number: 16,
    name: 'นางหนูบาน สิงห์จรรยา',
    nickname: 'พี่นก',
    department: 'GENERAL',
    departmentLabel: 'ผู้ช่วยเหลือคนไข้',
    avatarColor: 'from-emerald-600 to-teal-700',
    roleDescription: 'ผู้ช่วยเหลือคนไข้ ทุ่มเทเสียสละ พร้อมปฏิบัติหน้าที่อย่างเต็มกำลังความสามารถ',
  },
  {
    id: 'lr-4',
    number: 17,
    name: 'น.ส.เจศฎาภรณ์ กรไชยา',
    nickname: 'น้องเบียร์บี้',
    department: 'GENERAL',
    departmentLabel: 'ผู้ช่วยเหลือคนไข้',
    avatarColor: 'from-emerald-600 to-teal-700',
    roleDescription: 'ผู้ช่วยเหลือคนไข้ ว่องไว สดใส มีความรับผิดชอบและพร้อมเรียนรู้ช่วยเหลือ',
  },
];

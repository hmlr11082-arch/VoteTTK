import { Candidate, CandidateTally, Department, INITIAL_CANDIDATES, VoteRecord, VotingStats } from '../types/voting';

const STORAGE_VOTES_KEY = 'thakhantho_patient_helper_votes_v1';
const BROADCAST_CHANNEL_NAME = 'thakhantho_vote_sync_channel';

// Initial realistic demo votes for Tha Khan Tho Hospital
const SEED_VOTES: VoteRecord[] = [
  {
    id: 'TKTH-VOTE-101',
    voterName: 'พว.สุดารัตน์ เจริญสุข',
    voterRole: 'พยาบาลวิชาชีพชำนาญการ',
    voterDepartment: 'กลุ่มงานการพยาบาล',
    selectedCandidateIds: ['gen-1', 'ipd-1'],
    note: 'น้องหลงและพี่หนิดช่วยเข็นเปลและยกคนไข้หนักได้อย่างคล่องแคล่ว อบอุ่นมากค่ะ',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'TKTH-VOTE-102',
    voterName: 'นพ.กิตติพงษ์ วิริยะกุล',
    voterRole: 'แพทย์ประจำโรงพยาบาล',
    voterDepartment: 'กลุ่มงานการแพทย์',
    selectedCandidateIds: ['gen-4', 'opd-1'],
    note: 'น้องเบส และพี่หมู บริการว่องไว ประสานงานฉุกเฉินได้ยอดเยี่ยม',
    timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
  },
  {
    id: 'TKTH-VOTE-103',
    voterName: 'นางกาญจนา สมศรี',
    voterRole: 'ผู้รับบริการ/คนไข้',
    voterDepartment: 'แผนกผู้ป่วยนอก (OPD)',
    selectedCandidateIds: ['opd-2', 'lr-2'],
    note: 'น้องเมยิ้มแย้มคอยพาคุณยายไปตรวจ ยายแดงก็ใจดีเหมือนแม่',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'TKTH-VOTE-104',
    voterName: 'ภก.ธีรเดช สุทธิวรรณ',
    voterRole: 'เภสัชกรชำนาญการ',
    voterDepartment: 'กลุ่มงานเภสัชกรรม',
    selectedCandidateIds: ['gen-2', 'ipd-2'],
    note: 'พี่กรและพี่รุ่ง ช่วยงานส่งยาและดูแลเตียงผู้ป่วยอย่างเสียสละ',
    timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
  },
  {
    id: 'TKTH-VOTE-105',
    voterName: 'นายประสิทธิ์ วงศ์ชาลี',
    voterRole: 'ญาติคนไข้',
    voterDepartment: 'ตึกผู้ป่วยใน (IPD)',
    selectedCandidateIds: ['ipd-6', 'lr-1'],
    note: 'น้องเจนนี่น่ารักพูดจาไพเราะ ยายน้อยก็ให้คำแนะนำดีมากครับ',
    timestamp: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
  },
  {
    id: 'TKTH-VOTE-106',
    voterName: 'น.ส.อัมพร ผ่องแผ้ว',
    voterRole: 'เจ้าหน้าที่ธุรการ',
    voterDepartment: 'กลุ่มงานบริหารทั่วไป',
    selectedCandidateIds: ['gen-5', 'lr-3'],
    note: 'พี่เปี๊ยกและพี่นก อาสาช่วยงานส่วนรวมตลอดเวลา',
    timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
  },
  {
    id: 'TKTH-VOTE-107',
    voterName: 'ทพญ.ณิชมน บรรจง',
    voterRole: 'ทันตแพทย์',
    voterDepartment: 'กลุ่มงานทันตกรรม',
    selectedCandidateIds: ['gen-3', 'opd-3'],
    note: 'น้องมิตรและน้องขวัญ ช่วยดูแลคนไข้สูงอายุได้ประทับใจมาก',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: 'TKTH-VOTE-108',
    voterName: 'พว.มัลลิกา ศิริพงษ์',
    voterRole: 'พยาบาลวิชาชีพ',
    voterDepartment: 'ห้องคลอด (LR)',
    selectedCandidateIds: ['lr-4', 'ipd-3'],
    note: 'น้องเบียร์บี้และพี่ลำใย ทำงานไม่มีเหน็ดเหนื่อย มืออาชีพมากๆ',
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
  {
    id: 'TKTH-VOTE-109',
    voterName: 'นายสมบัติ ศรีหาตา',
    voterRole: 'พนักงานขับรถพยาบาล',
    voterDepartment: 'หน่วยอุบัติเหตุและฉุกเฉิน',
    selectedCandidateIds: ['gen-1', 'gen-4'],
    note: 'น้องหลงและน้องเบส ช่วยส่งต่อคนไข้ฉุกเฉินรวดเร็ว ปลอดภัย',
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: 'TKTH-VOTE-110',
    voterName: 'นางสาววิไลวรรณ บุญมี',
    voterRole: 'ผู้รับบริการ/คนไข้',
    voterDepartment: 'แผนกผู้ป่วยใน (IPD)',
    selectedCandidateIds: ['ipd-5', 'ipd-1'],
    note: 'น้องอิ๋วและพี่หนิด ดูแลพลิกตัวคนไข้ด้วยความนุ่มนวล ประทับใจมากค่ะ',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'TKTH-VOTE-111',
    voterName: 'นางสมจิต แก้วตา',
    voterRole: 'พนักงานบริการ',
    voterDepartment: 'ตึกผู้ป่วยใน',
    selectedCandidateIds: ['ipd-4', 'lr-2'],
    note: 'น้องป๊อปและยายแดง ใส่ใจรายละเอียดคนไข้ทุกคน',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
];

let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
} catch {
  // Ignore fallback
}

export const getStoredVotes = (): VoteRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_VOTES_KEY);
    if (!raw) {
      // Start with empty votes by default
      localStorage.setItem(STORAGE_VOTES_KEY, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading stored votes:', e);
    return [];
  }
};

export const saveVote = (vote: VoteRecord): VoteRecord[] => {
  const current = getStoredVotes();
  const updated = [vote, ...current];
  localStorage.setItem(STORAGE_VOTES_KEY, JSON.stringify(updated));

  // Notify other tabs
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'NEW_VOTE', vote });
  }

  return updated;
};

export const resetAllVotes = (): void => {
  localStorage.setItem(STORAGE_VOTES_KEY, JSON.stringify([]));
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'RESET_VOTES' });
  }
};

export const restoreDemoVotes = (): VoteRecord[] => {
  localStorage.setItem(STORAGE_VOTES_KEY, JSON.stringify(SEED_VOTES));
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'RESTORE_DEMO' });
  }
  return SEED_VOTES;
};

export const onVotesUpdated = (callback: () => void): (() => void) => {
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_VOTES_KEY) {
      callback();
    }
  };

  const handleBroadcast = (event: MessageEvent) => {
    if (event.data?.type) {
      callback();
    }
  };

  window.addEventListener('storage', handleStorage);
  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  return () => {
    window.removeEventListener('storage', handleStorage);
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
  };
};

export const computeVotingStats = (
  votes: VoteRecord[],
  candidates: Candidate[] = INITIAL_CANDIDATES
): VotingStats => {
  const counts: Record<string, number> = {};
  candidates.forEach((c) => {
    counts[c.id] = 0;
  });

  let totalVotes = 0;
  const deptCounts: Record<Department, number> = {
    GENERAL: 0,
    OPD: 0,
    IPD: 0,
    LR: 0,
  };

  const candidateMap = new Map(candidates.map((c) => [c.id, c]));

  votes.forEach((vote) => {
    vote.selectedCandidateIds.forEach((cid) => {
      if (counts[cid] !== undefined) {
        counts[cid]++;
        totalVotes++;
        const c = candidateMap.get(cid);
        if (c) {
          deptCounts[c.department] = (deptCounts[c.department] || 0) + 1;
        }
      }
    });
  });

  // Calculate percentages and rank
  const talliesUnranked: CandidateTally[] = candidates.map((c) => {
    const voteCount = counts[c.id] || 0;
    const percentage = totalVotes > 0 ? Number(((voteCount / totalVotes) * 100).toFixed(1)) : 0;
    return {
      ...c,
      voteCount,
      percentage,
      rank: 0,
    };
  });

  if (totalVotes === 0) {
    // When no votes exist yet, maintain original candidate number ordering and no ranks/winners
    return {
      totalVotes: 0,
      totalVoters: 0,
      departmentCounts: deptCounts,
      topCandidates: [], // No winners shown when no votes yet
      tallies: candidates.map((c) => ({
        ...c,
        voteCount: 0,
        percentage: 0,
        rank: 0,
      })),
      lastVoteTime: undefined,
    };
  }

  // Sort descending by vote count
  talliesUnranked.sort((a, b) => b.voteCount - a.voteCount || a.number - b.number);

  // Assign ranks
  let currentRank = 1;
  const tallies: CandidateTally[] = talliesUnranked.map((t, idx) => {
    if (idx > 0 && t.voteCount < talliesUnranked[idx - 1].voteCount) {
      currentRank = idx + 1;
    }
    return {
      ...t,
      rank: currentRank,
    };
  });

  // Only consider candidates with > 0 votes for top podium
  const candidatesWithVotes = tallies.filter((t) => t.voteCount > 0);

  return {
    totalVotes,
    totalVoters: votes.length,
    departmentCounts: deptCounts,
    topCandidates: candidatesWithVotes.slice(0, 3),
    tallies,
    lastVoteTime: votes.length > 0 ? votes[0].timestamp : undefined,
  };
};

import { Candidate, CandidateTally, Department, INITIAL_CANDIDATES, VoteRecord, VotingStats } from '../types/voting';
import { db, validateFirestoreConnection } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  query,
  orderBy,
} from 'firebase/firestore';

const STORAGE_VOTES_KEY = 'thakhantho_patient_helper_votes_v1';
const BROADCAST_CHANNEL_NAME = 'thakhantho_vote_sync_channel';

// Realistic initial demo votes for Tha Khan Tho Hospital
export const SEED_VOTES: VoteRecord[] = [
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
    selectedCandidateIds: ['gen-5', 'opd-1'],
    note: 'พี่เปี๊ยก และพี่หมู บริการว่องไว ประสานงานฉุกเฉินได้ยอดเยี่ยม',
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
    selectedCandidateIds: ['gen-1', 'gen-3'],
    note: 'น้องหลงและน้องมิตร ช่วยส่งต่อคนไข้ฉุกเฉินรวดเร็ว ปลอดภัย',
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

const VOTER_DEVICE_ID_KEY = 'thakhantho_voter_device_id';
const HAS_VOTED_KEY = 'thakhantho_has_voted';
const USER_RECEIPT_KEY = 'thakhantho_user_receipt';

// Test connection on module load
if (typeof window !== 'undefined') {
  validateFirestoreConnection().catch(() => {});
}

// Get or create unique persistent device identifier for voter
export const getVoterDeviceId = (): string => {
  if (typeof window === 'undefined') return 'server-device';
  let deviceId = localStorage.getItem(VOTER_DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = 'DEV-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
    localStorage.setItem(VOTER_DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
};

// Check if user has already voted on this device locally
export const hasUserVotedLocally = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(HAS_VOTED_KEY) === 'true';
};

// Get stored vote receipt for current device
export const getUserVoteReceipt = (): VoteRecord | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_RECEIPT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Clear local vote status (e.g. for testing in Admin Mode or after Admin Reset)
export const clearLocalVoterStatus = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HAS_VOTED_KEY);
  localStorage.removeItem(USER_RECEIPT_KEY);
};

// Check with centralized Firestore & server if this device has already cast a vote
export const checkRemoteVoterStatus = async (): Promise<{ hasVoted: boolean; vote?: VoteRecord | null }> => {
  const deviceId = getVoterDeviceId();

  // 1. Try checking Firestore first
  try {
    const snap = await getDocs(collection(db, 'votes'));
    let foundVote: VoteRecord | null = null;
    snap.forEach((docSnap) => {
      const v = docSnap.data() as VoteRecord;
      if (v.voterDeviceId === deviceId) {
        foundVote = v;
      }
    });

    if (foundVote) {
      localStorage.setItem(HAS_VOTED_KEY, 'true');
      localStorage.setItem(USER_RECEIPT_KEY, JSON.stringify(foundVote));
      return { hasVoted: true, vote: foundVote };
    } else {
      // If no vote found in Firestore for this device, clear local lock
      clearLocalVoterStatus();
      return { hasVoted: false, vote: null };
    }
  } catch (err) {
    console.warn('Firestore voter check fallback to server API:', err);
  }

  // 2. Fallback to server API
  try {
    const res = await fetch(`/api/votes/status?voterDeviceId=${encodeURIComponent(deviceId)}&_t=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.hasVoted) {
        localStorage.setItem(HAS_VOTED_KEY, 'true');
        if (data.vote) {
          localStorage.setItem(USER_RECEIPT_KEY, JSON.stringify(data.vote));
        }
        return { hasVoted: true, vote: data.vote };
      } else {
        clearLocalVoterStatus();
        return { hasVoted: false, vote: null };
      }
    }
  } catch (err) {
    console.warn('Could not verify voter status from server API:', err);
  }

  return { hasVoted: hasUserVotedLocally(), vote: getUserVoteReceipt() };
};

// Read local synchronous fallback
export const getStoredVotes = (): VoteRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_VOTES_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading stored votes:', e);
    return [];
  }
};

// Helper to clean VoteRecord for Firestore (strictly NO undefined properties allowed by Firestore SDK)
export const cleanVoteForFirestore = (vote: VoteRecord): Record<string, any> => {
  const clean: Record<string, any> = {
    id: vote.id,
    voterName: vote.voterName || 'ผู้ร่วมโหวต (ไม่ประสงค์ออกนาม)',
    voterRole: vote.voterRole || 'เจ้าหน้าที่ รพ.ท่าคันโท',
    voterDepartment: vote.voterDepartment || 'กลุ่มงานการพยาบาล',
    selectedCandidateIds: Array.isArray(vote.selectedCandidateIds) ? vote.selectedCandidateIds : [],
    timestamp: vote.timestamp || new Date().toISOString(),
  };
  if (vote.note && vote.note.trim()) {
    clean.note = vote.note.trim();
  }
  if (vote.voterDeviceId) {
    clean.voterDeviceId = vote.voterDeviceId;
  }
  return clean;
};

// Background helper - permanently disabled to avoid resurrecting deleted/reset votes
export const syncMissingVotesToFirestore = async (_votesToSync: VoteRecord[]): Promise<void> => {
  // Intentionally no-op: votes are saved individually in real-time via saveVote()
  return;
};

// Fetch latest votes from centralized Firestore & Server API
export const fetchRemoteVotes = async (): Promise<VoteRecord[]> => {
  let remoteFetchSucceeded = false;
  const votesMap = new Map<string, VoteRecord>();

  // 1. Fetch from Firestore (primary cloud store)
  try {
    const q = query(collection(db, 'votes'), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    snap.forEach((docSnap) => {
      const v = docSnap.data() as VoteRecord;
      if (v && v.id) {
        votesMap.set(v.id, v);
      }
    });
    remoteFetchSucceeded = true;
  } catch (err) {
    console.warn('Firestore fetch warning:', err);
  }

  // 2. Fetch from Server API
  try {
    const res = await fetch('/api/votes?_t=' + Date.now());
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.votes)) {
        if (!remoteFetchSucceeded) {
          // If Firestore query failed, use server votes
          data.votes.forEach((v: VoteRecord) => {
            if (v && v.id) votesMap.set(v.id, v);
          });
        }
        remoteFetchSucceeded = true;
      }
    }
  } catch (err) {
    console.warn('Server API fetch warning:', err);
  }

  // 3. Fallback to local storage ONLY if remote servers could not be contacted (offline mode)
  if (!remoteFetchSucceeded && votesMap.size === 0) {
    const local = getStoredVotes();
    local.forEach((v) => {
      if (v && v.id) votesMap.set(v.id, v);
    });
  }

  const allVotes = Array.from(votesMap.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Sync cache with current verified remote state
  localStorage.setItem(STORAGE_VOTES_KEY, JSON.stringify(allVotes));

  return allVotes;
};

// Save vote to centralized Firestore & server & local cache (1 vote per person per round)
export const saveVote = async (vote: VoteRecord): Promise<VoteRecord[]> => {
  const deviceId = getVoterDeviceId();
  const voteWithDevice: VoteRecord = {
    ...vote,
    voterDeviceId: vote.voterDeviceId || deviceId,
  };

  // 1. Guard against double-voting locally, verified against centralized Firestore
  if (hasUserVotedLocally()) {
    const remote = await checkRemoteVoterStatus();
    if (remote.hasVoted) {
      throw new Error('คุณได้ใช้ สิทธิโหวดแล้ว ขอบคุณค่ะ');
    }
  }

  // Clean data for Firestore so no undefined values cause invalid-argument error
  const cleanDoc = cleanVoteForFirestore(voteWithDevice);

  // 2. Save directly to Cloud Firestore so ALL users on ANY link receive it instantly
  try {
    await setDoc(doc(db, 'votes', cleanDoc.id), cleanDoc);
  } catch (err: any) {
    console.warn('Firestore write warning:', err);
  }

  // 3. Post to local server backend as well
  try {
    await fetch('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanDoc),
    });
  } catch (err) {
    console.warn('Server API backup write warning:', err);
  }

  // 4. Mark locally as voted and store receipt
  localStorage.setItem(HAS_VOTED_KEY, 'true');
  localStorage.setItem(USER_RECEIPT_KEY, JSON.stringify(cleanDoc));

  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'NEW_VOTE', vote: cleanDoc });
  }

  // Return fresh aggregated votes from merged stores
  return await fetchRemoteVotes();
};

// Reset all votes on centralized Firestore & server & unlock voting for everyone
export const resetAllVotes = async (pin: string = '2569'): Promise<void> => {
  const resetTimestamp = Date.now();
  clearLocalVoterStatus();
  localStorage.setItem('thakhantho_last_reset_version', String(resetTimestamp));
  localStorage.setItem(STORAGE_VOTES_KEY, JSON.stringify([]));

  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'RESET_VOTES', resetVersion: resetTimestamp });
  }

  // 1. Reset on server API first so server memory & JSON file are cleared immediately
  try {
    await fetch('/api/votes/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
  } catch (err) {
    console.warn('Failed to call reset API:', err);
  }

  // 2. Reset in Firestore: delete all vote documents & record reset timestamp
  try {
    const snap = await getDocs(collection(db, 'votes'));
    const docs = snap.docs;
    for (let i = 0; i < docs.length; i += 400) {
      const chunk = docs.slice(i, i + 400);
      const batch = writeBatch(db);
      chunk.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
    }

    // Update shared system reset version so all listening devices reset immediately
    await setDoc(
      doc(db, 'system', 'config'),
      {
        resetVersion: resetTimestamp,
        lastResetAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore reset failed:', err);
    throw err;
  }
};

// Restore demo votes on centralized Firestore & server
export const restoreDemoVotes = async (pin: string = '2569'): Promise<VoteRecord[]> => {
  const restoreTimestamp = Date.now();
  const freshVotes = SEED_VOTES.map((v, i) => ({
    ...v,
    timestamp: new Date(restoreTimestamp + i * 1000).toISOString(),
  }));

  localStorage.setItem('thakhantho_last_reset_version', String(restoreTimestamp));
  localStorage.setItem(STORAGE_VOTES_KEY, JSON.stringify(freshVotes));

  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'RESTORE_DEMO' });
  }

  // 1. Write demo votes to Firestore
  try {
    await setDoc(
      doc(db, 'system', 'config'),
      {
        resetVersion: restoreTimestamp,
        lastResetAt: new Date(restoreTimestamp - 10000).toISOString(),
        lastRestoreAt: new Date().toISOString(),
      },
      { merge: true }
    );

    const batch = writeBatch(db);
    freshVotes.forEach((v) => {
      batch.set(doc(db, 'votes', v.id), v);
    });
    await batch.commit();
  } catch (err) {
    console.warn('Firestore restore demo failed:', err);
  }

  // 2. Call server restore API
  try {
    await fetch('/api/votes/restore-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, demoVotes: freshVotes }),
    });
  } catch (err) {
    console.warn('Failed to call restore-demo API:', err);
  }

  return freshVotes;
};

// Real-time synchronization across all devices and tabs via Firestore onSnapshot + SSE
export const onVotesUpdated = (
  callback: (votes: VoteRecord[]) => void,
  onReset?: () => void
): (() => void) => {
  let unsubFirestoreVotes: (() => void) | null = null;
  let unsubFirestoreConfig: (() => void) | null = null;
  let eventSource: EventSource | null = null;
  let pollInterval: any = null;
  let initialLoaded = false;

  // 1. Initial remote fetch & sync check
  fetchRemoteVotes().then((v) => {
    callback(v);
    initialLoaded = true;
    if (v.length === 0 && hasUserVotedLocally()) {
      checkRemoteVoterStatus().then((status) => {
        if (!status.hasVoted) {
          clearLocalVoterStatus();
          if (onReset) onReset();
        }
      });
    }
  });

  // 2. REAL-TIME FIRESTORE LISTENER: Instantly triggers when ANY user on ANY device/link votes
  try {
    const q = query(collection(db, 'votes'), orderBy('timestamp', 'desc'));
    unsubFirestoreVotes = onSnapshot(
      q,
      (snapshot) => {
        const votesList: VoteRecord[] = [];
        snapshot.forEach((docSnap) => {
          votesList.push(docSnap.data() as VoteRecord);
        });
        if (votesList.length > 0) {
          localStorage.setItem(STORAGE_VOTES_KEY, JSON.stringify(votesList));
          callback(votesList);
        } else {
          // Zero documents in Firestore: system is reset or fresh
          localStorage.setItem(STORAGE_VOTES_KEY, JSON.stringify([]));
          callback([]);
          clearLocalVoterStatus();
          if (onReset) onReset();
        }
      },
      (err) => {
        console.warn('Firestore votes onSnapshot warning:', err);
      }
    );

    // Listen to System Config (for instant reset broadcast across all phones)
    unsubFirestoreConfig = onSnapshot(
      doc(db, 'system', 'config'),
      (docSnap) => {
        const data = docSnap.data();
        if (data?.resetVersion) {
          const lastSeen = localStorage.getItem('thakhantho_last_reset_version');
          if (String(data.resetVersion) !== lastSeen) {
            localStorage.setItem('thakhantho_last_reset_version', String(data.resetVersion));
            clearLocalVoterStatus();
            localStorage.setItem(STORAGE_VOTES_KEY, JSON.stringify([]));
            callback([]);
            if (onReset) onReset();
          }
        }
      },
      (err) => {
        console.warn('Firestore config onSnapshot warning:', err);
      }
    );
  } catch (err) {
    console.warn('Failed to attach Firestore real-time listener:', err);
  }

  // 3. Setup Server-Sent Events (SSE) as secondary live update channel
  try {
    if (typeof window !== 'undefined' && 'EventSource' in window) {
      eventSource = new EventSource('/api/votes/stream');

      eventSource.addEventListener('init', (e: MessageEvent) => {
        try {
          const parsed = JSON.parse(e.data);
          const remoteVotes = Array.isArray(parsed) ? parsed : parsed?.votes || [];
          if (!initialLoaded && remoteVotes.length > 0) {
            localStorage.setItem(STORAGE_VOTES_KEY, JSON.stringify(remoteVotes));
            callback(remoteVotes);
          }
        } catch {}
      });

      eventSource.addEventListener('new_vote', (e: MessageEvent) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed && Array.isArray(parsed.allVotes)) {
            localStorage.setItem(STORAGE_VOTES_KEY, JSON.stringify(parsed.allVotes));
            callback(parsed.allVotes);
          }
        } catch {}
      });

      eventSource.addEventListener('reset', () => {
        clearLocalVoterStatus();
        localStorage.setItem(STORAGE_VOTES_KEY, JSON.stringify([]));
        callback([]);
        if (onReset) {
          onReset();
        }
      });

      eventSource.addEventListener('restore_demo', (e: MessageEvent) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed && Array.isArray(parsed.allVotes)) {
            localStorage.setItem(STORAGE_VOTES_KEY, JSON.stringify(parsed.allVotes));
            callback(parsed.allVotes);
          }
        } catch {}
      });
    }
  } catch (err) {
    console.warn('SSE not supported or failed to connect:', err);
  }

  // 4. Polling fallback (runs every 5s to guarantee absolute data consistency)
  pollInterval = setInterval(async () => {
    const v = await fetchRemoteVotes();
    callback(v);
    if (v.length === 0 && hasUserVotedLocally()) {
      const status = await checkRemoteVoterStatus();
      if (!status.hasVoted) {
        clearLocalVoterStatus();
        if (onReset) onReset();
      }
    }
  }, 5000);

  // 5. Local browser storage & multi-tab listeners
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_VOTES_KEY) {
      callback(getStoredVotes());
    } else if (e.key === HAS_VOTED_KEY && !e.newValue) {
      if (onReset) onReset();
    }
  };

  const handleBroadcast = (event: MessageEvent) => {
    if (event.data?.type === 'RESET_VOTES') {
      clearLocalVoterStatus();
      callback([]);
      if (onReset) {
        onReset();
      }
    } else if (event.data?.type) {
      callback(getStoredVotes());
    }
  };

  window.addEventListener('storage', handleStorage);
  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  return () => {
    if (unsubFirestoreVotes) unsubFirestoreVotes();
    if (unsubFirestoreConfig) unsubFirestoreConfig();
    if (eventSource) eventSource.close();
    if (pollInterval) clearInterval(pollInterval);
    window.removeEventListener('storage', handleStorage);
    if (broadcastChannel) broadcastChannel.removeEventListener('message', handleBroadcast);
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

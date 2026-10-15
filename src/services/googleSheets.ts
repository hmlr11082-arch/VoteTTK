import { Candidate, VoteRecord } from '../types/voting';

export interface GoogleSheetMetadata {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  lastSyncedAt?: string;
}

const STORAGE_SHEET_KEY = 'thakhantho_vote_spreadsheet_info';

export const getSavedSpreadsheetInfo = (): GoogleSheetMetadata | null => {
  try {
    const raw = localStorage.getItem(STORAGE_SHEET_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveSpreadsheetInfo = (info: GoogleSheetMetadata | null) => {
  if (info) {
    localStorage.setItem(STORAGE_SHEET_KEY, JSON.stringify(info));
  } else {
    localStorage.removeItem(STORAGE_SHEET_KEY);
  }
};

/**
 * Creates a new Google Spreadsheet in the user's Google Drive formatted for Tha Khan Tho Hospital voting
 */
export async function createVotingSpreadsheet(
  accessToken: string,
  title = `ผลการโหวต_ผู้ช่วยเหลือคนไข้ดีเด่น_รพ.ท่าคันโท_${new Date().getFullYear() + 543}`
): Promise<GoogleSheetMetadata> {
  const requestBody = {
    properties: {
      title,
    },
    sheets: [
      {
        properties: {
          title: 'บันทึกการโหวต',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
      },
      {
        properties: {
          title: 'สรุปผลคะแนน',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
      },
    ],
  };

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'ไม่สามารถสร้าง Google Sheet ได้');
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = data.spreadsheetUrl;

  // Initialize Headers
  const headerData = {
    valueInputOption: 'USER_ENTERED',
    data: [
      {
        range: "'บันทึกการโหวต'!A1:H1",
        values: [
          [
            'รหัสการโหวต',
            'วัน-เวลาที่โหวต',
            'ชื่อผู้ลงคะแนน',
            'สถานะ/กลุ่มผู้โหวต',
            'สังกัด/แผนก',
            'ผู้ได้รับการเลือกคนที่ 1',
            'ผู้ได้รับการเลือกคนที่ 2',
            'ความคิดเห็น/คำชื่นชม',
          ],
        ],
      },
      {
        range: "'สรุปผลคะแนน'!A1:F1",
        values: [
          [
            'อันดับ',
            'หมายเลข',
            'ชื่อ - สกุล',
            'ชื่อเล่น',
            'กลุ่มงาน/แผนก',
            'คะแนนโหวตสะสม',
          ],
        ],
      },
    ],
  };

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(headerData),
  });

  const metadata: GoogleSheetMetadata = {
    spreadsheetId,
    spreadsheetUrl,
    title,
    lastSyncedAt: new Date().toISOString(),
  };

  saveSpreadsheetInfo(metadata);
  return metadata;
}

/**
 * Appends a single vote to Google Sheets
 */
export async function appendVoteToSheet(
  accessToken: string,
  spreadsheetId: string,
  vote: VoteRecord,
  candidateMap: Map<string, Candidate>
): Promise<void> {
  const c1 = vote.selectedCandidateIds[0] ? candidateMap.get(vote.selectedCandidateIds[0]) : null;
  const c2 = vote.selectedCandidateIds[1] ? candidateMap.get(vote.selectedCandidateIds[1]) : null;

  const row = [
    vote.id,
    new Date(vote.timestamp).toLocaleString('th-TH'),
    vote.voterName || 'ไม่ประสงค์ออกนาม',
    vote.voterRole || 'บุคลากรโรงพยาบาล',
    vote.voterDepartment || 'โรงพยาบาลท่าคันโท',
    c1 ? `${c1.number}. ${c1.name} (${c1.nickname}) [${c1.departmentLabel}]` : '-',
    c2 ? `${c2.number}. ${c2.name} (${c2.nickname}) [${c2.departmentLabel}]` : '-',
    vote.note || '-',
  ];

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'บันทึกการโหวต'!A:H:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'ไม่สามารถบันทึกคะแนนลง Google Sheet ได้');
  }
}

/**
 * Syncs full vote history and updates Leaderboard summary tab
 */
export async function syncAllVotesToSheet(
  accessToken: string,
  spreadsheetId: string,
  votes: VoteRecord[],
  candidates: Candidate[]
): Promise<void> {
  const candidateMap = new Map(candidates.map((c) => [c.id, c]));

  // Calculate tallies
  const counts: Record<string, number> = {};
  candidates.forEach((c) => {
    counts[c.id] = 0;
  });
  votes.forEach((v) => {
    v.selectedCandidateIds.forEach((cid) => {
      if (counts[cid] !== undefined) counts[cid]++;
    });
  });

  const sortedCandidates = [...candidates].sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0));

  const voteRows = votes.map((vote) => {
    const c1 = vote.selectedCandidateIds[0] ? candidateMap.get(vote.selectedCandidateIds[0]) : null;
    const c2 = vote.selectedCandidateIds[1] ? candidateMap.get(vote.selectedCandidateIds[1]) : null;

    return [
      vote.id,
      new Date(vote.timestamp).toLocaleString('th-TH'),
      vote.voterName || 'ไม่ประสงค์ออกนาม',
      vote.voterRole || 'บุคลากรโรงพยาบาล',
      vote.voterDepartment || 'โรงพยาบาลท่าคันโท',
      c1 ? `${c1.number}. ${c1.name} (${c1.nickname}) [${c1.departmentLabel}]` : '-',
      c2 ? `${c2.number}. ${c2.name} (${c2.nickname}) [${c2.departmentLabel}]` : '-',
      vote.note || '-',
    ];
  });

  const summaryRows = sortedCandidates.map((c, idx) => [
    idx + 1,
    c.number,
    c.name,
    c.nickname,
    c.departmentLabel,
    counts[c.id] || 0,
  ]);

  // Clear and update 'บันทึกการโหวต' & 'สรุปผลคะแนน'
  const updateData = {
    valueInputOption: 'USER_ENTERED',
    data: [
      {
        range: "'บันทึกการโหวต'!A1:H1",
        values: [
          [
            'รหัสการโหวต',
            'วัน-เวลาที่โหวต',
            'ชื่อผู้ลงคะแนน',
            'สถานะ/กลุ่มผู้โหวต',
            'สังกัด/แผนก',
            'ผู้ได้รับการเลือกคนที่ 1',
            'ผู้ได้รับการเลือกคนที่ 2',
            'ความคิดเห็น/คำชื่นชม',
          ],
        ],
      },
      {
        range: `'บันทึกการโหวต'!A2:H${Math.max(2, voteRows.length + 1)}`,
        values: voteRows.length > 0 ? voteRows : [['ไม่มีข้อมูลการโหวต']],
      },
      {
        range: "'สรุปผลคะแนน'!A1:F1",
        values: [
          [
            'อันดับ',
            'หมายเลข',
            'ชื่อ - สกุล',
            'ชื่อเล่น',
            'กลุ่มงาน/แผนก',
            'คะแนนโหวตสะสม',
          ],
        ],
      },
      {
        range: `'สรุปผลคะแนน'!A2:F${summaryRows.length + 1}`,
        values: summaryRows,
      },
    ],
  };

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'ไม่สามารถซิงค์ข้อมูลไปยัง Google Sheet ได้');
  }

  // Update last synced
  const existing = getSavedSpreadsheetInfo();
  if (existing && existing.spreadsheetId === spreadsheetId) {
    saveSpreadsheetInfo({
      ...existing,
      lastSyncedAt: new Date().toISOString(),
    });
  }
}

import { Candidate, VoteRecord } from '../types/voting';

export interface GoogleSheetMetadata {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  lastSyncedAt?: string;
}

export interface SheetVerificationResult {
  spreadsheetId: string;
  spreadsheetTitle: string;
  totalVotesInSheet: number;
  sampleVotes: Array<{
    id: string;
    time: string;
    voterName: string;
    voterRole: string;
    voterDept: string;
    c1: string;
    c2: string;
    note: string;
  }>;
  summaryTally: Array<{
    rank: string | number;
    number: string | number;
    name: string;
    nickname: string;
    department: string;
    votes: number;
  }>;
  fetchedAt: string;
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

export const saveSpreadsheetInfo = (info: GoogleSheetMetadata | null, persistServer = true) => {
  if (info) {
    localStorage.setItem(STORAGE_SHEET_KEY, JSON.stringify(info));
  } else {
    localStorage.removeItem(STORAGE_SHEET_KEY);
  }

  if (persistServer) {
    fetch('/api/sheet-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sheetInfo: info }),
    }).catch((err) => console.error('Failed to sync sheet info to server:', err));
  }
};

/**
 * Loads sheet configuration from server, falling back to localStorage
 */
export async function fetchRemoteSheetConfig(): Promise<GoogleSheetMetadata | null> {
  try {
    const res = await fetch('/api/sheet-config');
    if (res.ok) {
      const data = await res.json();
      if (data.sheetInfo) {
        saveSpreadsheetInfo(data.sheetInfo, false);
        return data.sheetInfo;
      }
    }
  } catch (err) {
    console.error('Failed to fetch remote sheet config:', err);
  }
  return getSavedSpreadsheetInfo();
}

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

  saveSpreadsheetInfo(metadata, true);
  return metadata;
}

/**
 * Connect to an existing Google Spreadsheet via URL or ID
 */
export async function connectExistingSpreadsheet(
  accessToken: string,
  spreadsheetUrlOrId: string
): Promise<GoogleSheetMetadata> {
  let spreadsheetId = spreadsheetUrlOrId.trim();

  // Extract from full URL e.g. https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0
  const match = spreadsheetId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    spreadsheetId = match[1];
  }

  if (!spreadsheetId) {
    throw new Error('กรุณาระบุ URL หรือ Spreadsheet ID ที่ถูกต้อง');
  }

  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'ไม่สามารถเข้าถึง Google Sheet นี้ได้ (ตรวจสอบสิทธิ์การแชร์หรือรหัส ID)');
  }

  const data = await response.json();
  const title = data.properties?.title || 'Google Spreadsheet เชื่อมต่อแล้ว';
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  const metadata: GoogleSheetMetadata = {
    spreadsheetId,
    spreadsheetUrl,
    title,
    lastSyncedAt: new Date().toISOString(),
  };

  saveSpreadsheetInfo(metadata, true);
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
 * Performs clean wipe of previous data first to prevent ghost rows
 */
export async function syncAllVotesToSheet(
  accessToken: string,
  spreadsheetId: string,
  votes: VoteRecord[],
  candidates: Candidate[]
): Promise<void> {
  const candidateMap = new Map(candidates.map((c) => [c.id, c]));

  // Clear previous data ranges first
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchClear`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ranges: ["'บันทึกการโหวต'!A2:H", "'สรุปผลคะแนน'!A2:F"],
    }),
  }).catch(() => {
    // If clearing fails due to range title, proceed with update
  });

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
    saveSpreadsheetInfo(
      {
        ...existing,
        lastSyncedAt: new Date().toISOString(),
      },
      true
    );
  }
}

/**
 * Clears all vote records and resets scores to 0 in Google Sheet when Admin resets votes
 */
export async function clearVotesInSheet(
  accessToken: string,
  spreadsheetId: string,
  candidates: Candidate[]
): Promise<void> {
  // Clear all previous data rows
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchClear`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ranges: ["'บันทึกการโหวต'!A2:H", "'สรุปผลคะแนน'!A2:F"],
    }),
  });

  const sortedCandidates = [...candidates].sort((a, b) => a.number - b.number);
  const resetSummaryRows = sortedCandidates.map((c, idx) => [
    idx + 1,
    c.number,
    c.name,
    c.nickname,
    c.departmentLabel,
    0,
  ]);

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
        range: "'บันทึกการโหวต'!A2:H2",
        values: [
          [
            '-',
            new Date().toLocaleString('th-TH'),
            'รีเซ็ตระบบโดยผู้ดูแล',
            '-',
            '-',
            '-',
            '-',
            'รีเซ็ตคะแนนเริ่มต้นรอบใหม่เรียบร้อยแล้ว',
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
      {
        range: `'สรุปผลคะแนน'!A2:F${resetSummaryRows.length + 1}`,
        values: resetSummaryRows,
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
    throw new Error(err.error?.message || 'ไม่สามารถล้างข้อมูลใน Google Sheet ได้');
  }

  // Update last synced
  const existing = getSavedSpreadsheetInfo();
  if (existing && existing.spreadsheetId === spreadsheetId) {
    saveSpreadsheetInfo(
      {
        ...existing,
        lastSyncedAt: new Date().toISOString(),
      },
      true
    );
  }
}

/**
 * Fetches actual live data from Google Sheet for verification by Admin
 */
export async function fetchSheetVerificationData(
  accessToken: string,
  spreadsheetId: string
): Promise<SheetVerificationResult> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?includeGridData=false`;
  const metaRes = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  let spreadsheetTitle = 'Google Spreadsheet';
  if (metaRes.ok) {
    const meta = await metaRes.json();
    spreadsheetTitle = meta.properties?.title || spreadsheetTitle;
  }

  const valuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?ranges='บันทึกการโหวต'!A2:H1000&ranges='สรุปผลคะแนน'!A2:F100`;
  const valRes = await fetch(valuesUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!valRes.ok) {
    const err = await valRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'ไม่สามารถเชื่อมต่ออ่านข้อมูลจาก Google Sheet ได้');
  }

  const valData = await valRes.json();
  const valueRanges = valData.valueRanges || [];

  const rawVotes = valueRanges[0]?.values || [];
  // Filter out empty rows or reset placeholder
  const voteRows = rawVotes.filter(
    (r: any[]) =>
      r &&
      r[0] &&
      r[0] !== 'ไม่มีข้อมูลการโหวต' &&
      r[0] !== '-'
  );

  const rawSummaries = valueRanges[1]?.values || [];
  const summaryRows = rawSummaries.filter((r: any[]) => r && r[2]);

  return {
    spreadsheetId,
    spreadsheetTitle,
    totalVotesInSheet: voteRows.length,
    sampleVotes: voteRows
      .slice(-10)
      .reverse()
      .map((r: any[]) => ({
        id: String(r[0] || '-'),
        time: String(r[1] || '-'),
        voterName: String(r[2] || '-'),
        voterRole: String(r[3] || '-'),
        voterDept: String(r[4] || '-'),
        c1: String(r[5] || '-'),
        c2: String(r[6] || '-'),
        note: String(r[7] || '-'),
      })),
    summaryTally: summaryRows.map((r: any[]) => ({
      rank: r[0] || '-',
      number: r[1] || '-',
      name: String(r[2] || '-'),
      nickname: String(r[3] || ''),
      department: String(r[4] || ''),
      votes: parseInt(r[5] || '0', 10) || 0,
    })),
    fetchedAt: new Date().toISOString(),
  };
}

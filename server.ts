import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const app = express();

app.use(express.json());

// Persistent storage location
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'votes.json');

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create data dir:', err);
  }
}

// In-memory cache + file sync
let votes: any[] = [];
let resetVersion: number = Date.now();

if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      votes = parsed;
    } else if (parsed && Array.isArray(parsed.votes)) {
      votes = parsed.votes;
      resetVersion = parsed.resetVersion || Date.now();
    }
  } catch (err) {
    console.error('Failed to parse existing votes.json:', err);
    votes = [];
  }
}

function persistVotes() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ votes, resetVersion }, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write votes to file:', err);
  }
}

// Connected clients for real-time SSE stream
const sseClients = new Set<express.Response>();

function broadcast(type: string, data: any) {
  const message = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch {
      sseClients.delete(client);
    }
  }
}

// API Routes
app.get('/api/votes', (req, res) => {
  res.json({ success: true, votes, count: votes.length, resetVersion });
});

// Real-time SSE stream for all connected devices
app.get('/api/votes/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send current state immediately on connect
  res.write(`event: init\ndata: ${JSON.stringify({ votes, resetVersion })}\n\n`);

  sseClients.add(res);

  // Keep-alive ping every 20s
  const pingInterval = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch {
      clearInterval(pingInterval);
      sseClients.delete(res);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(pingInterval);
    sseClients.delete(res);
  });
});

// Check voter status by device ID
app.get('/api/votes/status', (req, res) => {
  const voterDeviceId = req.query.voterDeviceId as string;
  if (!voterDeviceId) {
    return res.json({ hasVoted: false, resetVersion });
  }
  const existingVote = votes.find((v: any) => v.voterDeviceId === voterDeviceId);
  res.json({
    hasVoted: Boolean(existingVote),
    vote: existingVote || null,
    totalVotes: votes.length,
    resetVersion,
  });
});

// Submit a new vote from any voter (desktop, mobile, shared link)
app.post('/api/votes', (req, res) => {
  const newVote = req.body;
  if (
    !newVote ||
    !Array.isArray(newVote.selectedCandidateIds) ||
    newVote.selectedCandidateIds.length === 0 ||
    newVote.selectedCandidateIds.length > 2
  ) {
    return res.status(400).json({ error: 'ข้อมูลการโหวตไม่ถูกต้อง ต้องเลือก 1-2 ท่าน' });
  }

  // Enforce 1 vote per voter/device in current active votes
  if (newVote.voterDeviceId) {
    const existingVoteByDevice = votes.find(
      (v: any) => v.voterDeviceId === newVote.voterDeviceId && v.id !== newVote.id
    );
    if (existingVoteByDevice) {
      return res.status(400).json({
        error: 'คุณได้ใช้ สิทธิโหวดแล้ว ขอบคุณค่ะ',
        hasVoted: true,
        existingVote: existingVoteByDevice,
      });
    }
  }

  // Check if vote already exists by ID
  const existingIndex = votes.findIndex((v: any) => v.id === newVote.id);
  if (existingIndex >= 0) {
    votes[existingIndex] = newVote;
  } else {
    votes.unshift(newVote);
  }

  persistVotes();
  broadcast('new_vote', { vote: newVote, allVotes: votes, resetVersion });

  res.status(201).json({ success: true, vote: newVote, totalVotes: votes.length, resetVersion });
});

// Admin Reset: Wipe all votes, increment resetVersion, broadcast to allow all link holders to vote again
app.post('/api/votes/reset', (req, res) => {
  const { pin } = req.body;
  if (pin !== '2569' && pin !== '1234') {
    return res.status(403).json({ error: 'รหัส PIN ผู้ดูแลระบบไม่ถูกต้อง' });
  }

  votes = [];
  resetVersion = Date.now();
  persistVotes();
  broadcast('reset', { allVotes: [], resetVersion });

  res.json({
    success: true,
    message: 'รีเซ็ตคะแนนโหวตทั้งหมดเรียบร้อยแล้ว ทุกคนสามารถโหวตใหม่ได้ทันที',
    resetVersion,
  });
});

// Admin Restore Demo
app.post('/api/votes/restore-demo', (req, res) => {
  const { pin, demoVotes } = req.body;
  if (pin !== '2569' && pin !== '1234') {
    return res.status(403).json({ error: 'รหัส PIN ผู้ดูแลระบบไม่ถูกต้อง' });
  }

  if (Array.isArray(demoVotes)) {
    votes = demoVotes;
    resetVersion = Date.now();
    persistVotes();
    broadcast('restore_demo', { allVotes: votes, resetVersion });
  }

  res.json({
    success: true,
    message: 'โหลดข้อมูลตัวอย่างเรียบร้อย',
    totalVotes: votes.length,
    resetVersion,
  });
});

// Vite dev middleware or production static serving
async function setupViteOrStatic() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Tha Khan Tho Server] Running at http://0.0.0.0:${PORT}`);
  });
}

setupViteOrStatic().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

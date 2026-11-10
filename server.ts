import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

export interface SurveyResponse {
  id: string;
  timestamp: number;
  q1: number; // ความชัดเจนและเนื้อหาหลักสูตร
  q2: number; // ความรู้ความสามารถและเทคนิคของวิทยากร
  q3: number; // การนำความรู้ไปประยุกต์ใช้ในการทำงาน
  q4: number; // เอกสารและสื่อการเรียนรู้ประกอบการอบรม
  q5: number; // ความเหมาะสมของเวลา สถานที่/ระบบ และการประสานงาน
  average: number;
  feedback?: string;
  deviceId?: string;
}

// Initial realistic seed responses
const initialResponses: SurveyResponse[] = [
  {
    id: 'seed-1',
    timestamp: Date.now() - 1000 * 60 * 42,
    q1: 5, q2: 5, q3: 5, q4: 4, q5: 5,
    average: 4.8,
    feedback: 'วิทยากรอธิบายเข้าใจง่ายมาก มี Workshop ให้ลงมือทำจริง ทำให้เห็นภาพชัดเจน',
    deviceId: 'seed-dev-1',
  },
  {
    id: 'seed-2',
    timestamp: Date.now() - 1000 * 60 * 35,
    q1: 5, q2: 5, q3: 4, q4: 5, q5: 4,
    average: 4.6,
    feedback: 'สไลด์สวยงาม เอกสารอ่านทบทวนได้ง่าย อยากให้มีเวลาทำแล็บเพิ่มขึ้นอีกนิดครับ',
    deviceId: 'seed-dev-2',
  },
  {
    id: 'seed-3',
    timestamp: Date.now() - 1000 * 60 * 28,
    q1: 4, q2: 5, q3: 5, q4: 4, q5: 4,
    average: 4.4,
    feedback: 'สามารถนำเทคนิค Prompt และการเชื่อมโยงระบบไปใช้กับงานประจำได้ทันที คุ้มค่ามาก',
    deviceId: 'seed-dev-3',
  },
  {
    id: 'seed-4',
    timestamp: Date.now() - 1000 * 60 * 20,
    q1: 5, q2: 4, q3: 4, q4: 4, q5: 5,
    average: 4.4,
    feedback: 'ทีมงานดูแลดี สถานที่และสัญญาณอินเทอร์เน็ตรวดเร็วราบรื่นตลอดการอบรม',
    deviceId: 'seed-dev-4',
  },
  {
    id: 'seed-5',
    timestamp: Date.now() - 1000 * 60 * 15,
    q1: 5, q2: 5, q3: 5, q4: 5, q5: 5,
    average: 5.0,
    feedback: 'ยอดเยี่ยมมากครับ เป็นหลักสูตรที่อัปเดตและตรงกับความต้องการของยุคนี้จริงๆ',
    deviceId: 'seed-dev-5',
  },
  {
    id: 'seed-6',
    timestamp: Date.now() - 1000 * 60 * 8,
    q1: 4, q2: 5, q3: 4, q4: 4, q5: 3,
    average: 4.0,
    feedback: 'อยากให้มีคอร์สขั้นสูง Advance ต่อเนื่องเลยครับ',
    deviceId: 'seed-dev-6',
  },
  {
    id: 'seed-7',
    timestamp: Date.now() - 1000 * 60 * 3,
    q1: 5, q2: 5, q3: 5, q4: 4, q5: 4,
    average: 4.6,
    feedback: 'ชอบช่วงถามตอบ วิทยากรตอบได้ตรงจุดและแนะนำเครื่องมือเสริมที่เป็นประโยชน์มาก',
    deviceId: 'seed-dev-7',
  },
];

let responses: SurveyResponse[] = [...initialResponses];
const sseClients = new Set<express.Response>();

function calculateStats(items: SurveyResponse[]) {
  const count = items.length;
  if (count === 0) {
    return {
      totalRespondents: 0,
      overallAverage: 0,
      interpretation: 'ยังไม่มีข้อมูล',
      questionAverages: [0, 0, 0, 0, 0],
      starDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const sumQ = [0, 0, 0, 0, 0];
  const starDist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  items.forEach((r) => {
    sumQ[0] += r.q1;
    sumQ[1] += r.q2;
    sumQ[2] += r.q3;
    sumQ[3] += r.q4;
    sumQ[4] += r.q5;

    // Distribute star ratings across all answers
    const allAnswers = [r.q1, r.q2, r.q3, r.q4, r.q5];
    allAnswers.forEach((val) => {
      if (val >= 1 && val <= 5) {
        starDist[val as 1 | 2 | 3 | 4 | 5]++;
      }
    });
  });

  const questionAverages = sumQ.map((sum) => Number((sum / count).toFixed(2)));
  const overallAverage = Number(
    (questionAverages.reduce((acc, curr) => acc + curr, 0) / 5).toFixed(2)
  );

  // Thai 5-tier interpretation standard
  let interpretation = 'มากที่สุด';
  if (overallAverage >= 4.51) interpretation = 'มากที่สุด (ดีเยี่ยม)';
  else if (overallAverage >= 3.51) interpretation = 'มาก (ดี)';
  else if (overallAverage >= 2.51) interpretation = 'ปานกลาง';
  else if (overallAverage >= 1.51) interpretation = 'น้อย (ควรปรับปรุง)';
  else interpretation = 'น้อยที่สุด (ต้องเร่งแก้ไข)';

  return {
    totalRespondents: count,
    overallAverage,
    interpretation,
    questionAverages,
    starDistribution: starDist,
  };
}

function broadcastUpdate() {
  const payload = JSON.stringify({
    type: 'UPDATE',
    stats: calculateStats(responses),
    responses: responses.slice(-50), // last 50 for live feed
  });

  sseClients.forEach((client) => {
    client.write(`data: ${payload}\n\n`);
  });
}

// REST API Endpoints
app.get('/api/responses', (_req, res) => {
  const stats = calculateStats(responses);
  res.json({
    success: true,
    stats,
    responses,
  });
});

app.post('/api/responses', (req, res) => {
  const { q1, q2, q3, q4, q5, feedback, deviceId } = req.body;

  // Validate questions 1-5
  const scores = [q1, q2, q3, q4, q5].map(Number);
  const isValid = scores.every((n) => !isNaN(n) && n >= 1 && n <= 5);

  if (!isValid) {
    return res.status(400).json({
      success: false,
      error: 'กรุณาให้คะแนนครบทั้ง 5 ข้อ (1 - 5 คะแนน)',
    });
  }

  // Check duplicate deviceId (unless bypass requested)
  if (deviceId && !req.query.allowDuplicate) {
    const existing = responses.find((r) => r.deviceId === deviceId);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'อุปกรณ์นี้ได้ทำการส่งแบบประเมินเรียบร้อยแล้ว ขอบคุณสำหรับความร่วมมือ',
      });
    }
  }

  const average = Number(
    (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
  );

  const newResponse: SurveyResponse = {
    id: 'res-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    timestamp: Date.now(),
    q1: scores[0],
    q2: scores[1],
    q3: scores[2],
    q4: scores[3],
    q5: scores[4],
    average,
    feedback: feedback ? String(feedback).trim() : '',
    deviceId: deviceId || 'anonymous',
  };

  responses.push(newResponse);
  broadcastUpdate();

  res.status(201).json({
    success: true,
    message: 'บันทึกข้อมูลเรียบร้อยแล้ว ขอบคุณสำหรับความคิดเห็น',
    response: newResponse,
    stats: calculateStats(responses),
  });
});

app.post('/api/reset', (_req, res) => {
  responses = [...initialResponses];
  broadcastUpdate();
  res.json({
    success: true,
    message: 'รีเซ็ตข้อมูลตัวอย่างเรียบร้อยแล้ว',
    stats: calculateStats(responses),
  });
});

app.post('/api/clear-all', (_req, res) => {
  responses = [];
  broadcastUpdate();
  res.json({
    success: true,
    message: 'ล้างข้อมูลทั้งหมดเรียบร้อยแล้ว (0 รายการ)',
    stats: calculateStats(responses),
  });
});

// SSE endpoint for live real-time sync to Projector Dashboard
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial data immediately
  const initialPayload = JSON.stringify({
    type: 'INITIAL',
    stats: calculateStats(responses),
    responses: responses.slice(-50),
  });
  res.write(`data: ${initialPayload}\n\n`);

  sseClients.add(res);

  // Keep-alive ping every 25 seconds
  const keepAliveInterval = setInterval(() => {
    res.write(': keepalive\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(keepAliveInterval);
    sseClients.delete(res);
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LiveFeedback Server running on http://localhost:${PORT}`);
  });
}

startServer();

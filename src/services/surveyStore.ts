import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, onValue, push, set, serverTimestamp, Database } from 'firebase/database';
import { SurveyResponse, DashboardStats } from '../types';

export interface FirebaseConfigObject {
  apiKey?: string;
  authDomain?: string;
  databaseURL: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

// Initial realistic seed responses so that on Netlify or first open, the dashboard is never an empty 0 screen
export const SEED_RESPONSES: SurveyResponse[] = [
  {
    id: 'seed-1',
    timestamp: Date.now() - 1000 * 60 * 42,
    q1: 5, q2: 5, q3: 5, q4: 5, q5: 4,
    average: 4.8,
    feedback: 'วิทยากรอธิบายเข้าใจง่ายมาก มี Workshop ให้ลงมือทำจริง ทำให้เห็นภาพชัดเจนและนำไปใช้ได้ทันที',
    deviceId: 'seed-1',
  },
  {
    id: 'seed-2',
    timestamp: Date.now() - 1000 * 60 * 35,
    q1: 5, q2: 5, q3: 4, q4: 5, q5: 4,
    average: 4.6,
    feedback: 'สไลด์สวยงาม เอกสารอ่านทบทวนได้ง่าย อยากให้มีเวลาทำแล็บเพิ่มขึ้นอีกนิดครับ',
    deviceId: 'seed-2',
  },
  {
    id: 'seed-3',
    timestamp: Date.now() - 1000 * 60 * 25,
    q1: 5, q2: 5, q3: 5, q4: 4, q5: 5,
    average: 4.8,
    feedback: 'สามารถนำเทคนิคและเครื่องมือไปปรับใช้กับภาระงานจริงในองค์กรได้คุ้มค่ามาก',
    deviceId: 'seed-3',
  },
  {
    id: 'seed-4',
    timestamp: Date.now() - 1000 * 60 * 18,
    q1: 4, q2: 5, q3: 4, q4: 4, q5: 4,
    average: 4.2,
    feedback: 'ทีมงานดูแลดีมาก สถานที่และสัญญาณอินเทอร์เน็ตรวดเร็วตลอดการอบรม',
    deviceId: 'seed-4',
  },
  {
    id: 'seed-5',
    timestamp: Date.now() - 1000 * 60 * 10,
    q1: 5, q2: 5, q3: 5, q4: 5, q5: 5,
    average: 5.0,
    feedback: 'ยอดเยี่ยมมากครับ เป็นหลักสูตรที่ทันสมัยและตอบโจทย์การทำงานในปัจจุบันจริงๆ',
    deviceId: 'seed-5',
  },
  {
    id: 'seed-6',
    timestamp: Date.now() - 1000 * 60 * 4,
    q1: 5, q2: 5, q3: 5, q4: 4, q5: 5,
    average: 4.8,
    feedback: 'ชอบช่วงถามตอบ วิทยากรแนะนำได้ตรงประเด็นและแบ่งปัน Best Practice ที่ดีมาก',
    deviceId: 'seed-6',
  },
];

const STORAGE_RESPONSES_KEY = 'livefeedback_local_responses';
const STORAGE_FIREBASE_KEY = 'livefeedback_firebase_config';

// Compute statistical metrics
export function computeStats(items: SurveyResponse[]): DashboardStats {
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
    sumQ[0] += Number(r.q1) || 0;
    sumQ[1] += Number(r.q2) || 0;
    sumQ[2] += Number(r.q3) || 0;
    sumQ[3] += Number(r.q4) || 0;
    sumQ[4] += Number(r.q5) || 0;

    [r.q1, r.q2, r.q3, r.q4, r.q5].forEach((val) => {
      const num = Number(val);
      if (num >= 1 && num <= 5) {
        starDist[num as 1 | 2 | 3 | 4 | 5]++;
      }
    });
  });

  const questionAverages = sumQ.map((sum) => Number((sum / count).toFixed(2)));
  const overallAverage = Number(
    (questionAverages.reduce((acc, curr) => acc + curr, 0) / 5).toFixed(2)
  );

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

let firebaseApp: FirebaseApp | null = null;
let firebaseDb: Database | null = null;
let broadcastChannel: BroadcastChannel | null = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  broadcastChannel = new BroadcastChannel('livefeedback_sync_channel');
}

export function getStoredFirebaseConfig(): FirebaseConfigObject | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_FIREBASE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStoredFirebaseConfig(config: FirebaseConfigObject): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_FIREBASE_KEY, JSON.stringify(config));
  // Broadcast to other tabs
  broadcastChannel?.postMessage({ type: 'FIREBASE_CONFIG_UPDATED' });
}

export function clearStoredFirebaseConfig(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_FIREBASE_KEY);
  firebaseApp = null;
  firebaseDb = null;
  broadcastChannel?.postMessage({ type: 'FIREBASE_CONFIG_UPDATED' });
}

export function getLocalResponses(): SurveyResponse[] {
  if (typeof window === 'undefined') return SEED_RESPONSES;
  const raw = localStorage.getItem(STORAGE_RESPONSES_KEY);
  if (!raw) {
    // Seed initial responses so Netlify / first visit is never empty
    localStorage.setItem(STORAGE_RESPONSES_KEY, JSON.stringify(SEED_RESPONSES));
    return SEED_RESPONSES;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_RESPONSES;
  } catch {
    return SEED_RESPONSES;
  }
}

export function saveLocalResponses(responses: SurveyResponse[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_RESPONSES_KEY, JSON.stringify(responses));
  broadcastChannel?.postMessage({ type: 'LOCAL_RESPONSES_UPDATED', responses });
}

export function initFirebaseFromConfig(config: FirebaseConfigObject): Database | null {
  try {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      firebaseApp = existingApps[0];
    } else {
      firebaseApp = initializeApp(config);
    }
    firebaseDb = getDatabase(firebaseApp, config.databaseURL);
    return firebaseDb;
  } catch (err) {
    console.error('Firebase initialization error:', err);
    return null;
  }
}

// Master subscription: handles either Firebase Realtime Database or Local/Broadcast sync
export function subscribeToResponses(
  onData: (data: {
    responses: SurveyResponse[];
    stats: DashboardStats;
    isFirebaseConnected: boolean;
    databaseUrl?: string;
  }) => void
): () => void {
  const config = getStoredFirebaseConfig();

  if (config && config.databaseURL && config.databaseURL.trim() !== '') {
    const db = initFirebaseFromConfig(config);
    if (db) {
      const responsesRef = ref(db, 'responses');
      const unsubscribeFirebase = onValue(
        responsesRef,
        (snapshot) => {
          const val = snapshot.val();
          let list: SurveyResponse[] = [];
          if (val) {
            list = Object.keys(val).map((k) => ({
              id: k,
              ...val[k],
            }));
            // Sort by timestamp ascending
            list.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
          }
          onData({
            responses: list,
            stats: computeStats(list),
            isFirebaseConnected: true,
            databaseUrl: config.databaseURL,
          });
        },
        (error) => {
          console.warn('Firebase onValue error, falling back to local mode:', error);
          // Fallback to local
          const localList = getLocalResponses();
          onData({
            responses: localList,
            stats: computeStats(localList),
            isFirebaseConnected: false,
          });
        }
      );

      return () => {
        unsubscribeFirebase();
      };
    }
  }

  // Local / Netlify Fallback Mode (Instant works on Netlify out-of-the-box!)
  const emitLocalData = () => {
    const current = getLocalResponses();
    onData({
      responses: current,
      stats: computeStats(current),
      isFirebaseConnected: false,
    });
  };

  emitLocalData();

  const handleBroadcast = (event: MessageEvent) => {
    if (event.data?.type === 'LOCAL_RESPONSES_UPDATED' || event.data?.type === 'FIREBASE_CONFIG_UPDATED') {
      emitLocalData();
    }
  };

  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key === STORAGE_RESPONSES_KEY || event.key === STORAGE_FIREBASE_KEY) {
      emitLocalData();
    }
  };

  broadcastChannel?.addEventListener('message', handleBroadcast);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    broadcastChannel?.removeEventListener('message', handleBroadcast);
    window.removeEventListener('storage', handleStorageEvent);
  };
}

// Add a new response (submits to Firebase if connected, or to LocalStorage + Broadcast)
export async function submitSurveyResponse(payload: {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  feedback?: string;
  deviceId?: string;
}): Promise<SurveyResponse> {
  const scores = [payload.q1, payload.q2, payload.q3, payload.q4, payload.q5];
  const average = Number(
    (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
  );

  const newResponse: SurveyResponse = {
    id: 'res_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    timestamp: Date.now(),
    q1: payload.q1,
    q2: payload.q2,
    q3: payload.q3,
    q4: payload.q4,
    q5: payload.q5,
    average,
    feedback: payload.feedback || '',
    deviceId: payload.deviceId || 'anon',
  };

  const config = getStoredFirebaseConfig();
  if (config && firebaseDb) {
    try {
      const responsesRef = ref(firebaseDb, 'responses');
      await push(responsesRef, {
        ...newResponse,
        timestamp: serverTimestamp(),
      });
      return newResponse;
    } catch (err) {
      console.error('Failed to push to Firebase, saving locally:', err);
    }
  }

  // Local Save
  const current = getLocalResponses();
  const updated = [...current, newResponse];
  saveLocalResponses(updated);

  // Also try backend if running on fullstack node
  try {
    fetch('/api/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch {}

  return newResponse;
}

// Reset data (to seed responses)
export async function resetResponsesData(): Promise<void> {
  const config = getStoredFirebaseConfig();
  if (config && firebaseDb) {
    try {
      const responsesRef = ref(firebaseDb, 'responses');
      const seedObj: { [key: string]: any } = {};
      SEED_RESPONSES.forEach((r, idx) => {
        seedObj[`seed_${idx + 1}`] = r;
      });
      await set(responsesRef, seedObj);
      return;
    } catch (err) {
      console.error('Firebase reset error:', err);
    }
  }

  saveLocalResponses([...SEED_RESPONSES]);

  try {
    fetch('/api/reset', { method: 'POST' }).catch(() => {});
  } catch {}
}

// Clear all data
export async function clearAllResponsesData(): Promise<void> {
  const config = getStoredFirebaseConfig();
  if (config && firebaseDb) {
    try {
      const responsesRef = ref(firebaseDb, 'responses');
      await set(responsesRef, null);
      return;
    } catch (err) {
      console.error('Firebase clear error:', err);
    }
  }

  saveLocalResponses([]);

  try {
    fetch('/api/clear-all', { method: 'POST' }).catch(() => {});
  } catch {}
}

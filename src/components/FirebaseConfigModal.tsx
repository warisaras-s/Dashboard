import React, { useState, useEffect } from 'react';
import {
  X,
  Flame,
  Check,
  AlertCircle,
  ExternalLink,
  Trash2,
  Database,
  ArrowRight
} from 'lucide-react';
import {
  getStoredFirebaseConfig,
  saveStoredFirebaseConfig,
  clearStoredFirebaseConfig,
  FirebaseConfigObject,
} from '../services/surveyStore';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
  isCurrentlyConnected: boolean;
  activeDatabaseUrl?: string;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigChanged,
  isCurrentlyConnected,
  activeDatabaseUrl,
}) => {
  const [configInput, setConfigInput] = useState('');
  const [dbUrlInput, setDbUrlInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const existing = getStoredFirebaseConfig();
    if (existing) {
      setDbUrlInput(existing.databaseURL || '');
      setConfigInput(JSON.stringify(existing, null, 2));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setError(null);
    setSuccessMsg(null);

    let config: FirebaseConfigObject | null = null;

    const trimmedInput = configInput.trim();
    const trimmedDbUrl = dbUrlInput.trim();

    // 1. Try JSON / Object parsing if configInput is filled
    if (trimmedInput) {
      try {
        // Strip js declarations like 'const firebaseConfig = ... ;'
        const clean = trimmedInput
          .replace(/const\s+firebaseConfig\s*=\s*/g, '')
          .replace(/var\s+firebaseConfig\s*=\s*/g, '')
          .replace(/let\s+firebaseConfig\s*=\s*/g, '')
          .replace(/;\s*$/, '')
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
          .replace(/'/g, '"');

        const parsed = JSON.parse(clean);
        if (parsed.databaseURL) {
          config = parsed;
        } else if (trimmedDbUrl) {
          config = { ...parsed, databaseURL: trimmedDbUrl };
        } else {
          // If no databaseURL in object, guess from projectId
          if (parsed.projectId) {
            config = {
              ...parsed,
              databaseURL: `https://${parsed.projectId}-default-rtdb.firebaseio.com`,
            };
          }
        }
      } catch (e: any) {
        // Fallback to regex extract
        const urlMatch = trimmedInput.match(/databaseURL\s*:\s*["']([^"']+)["']/);
        const apiKeyMatch = trimmedInput.match(/apiKey\s*:\s*["']([^"']+)["']/);
        const projectIdMatch = trimmedInput.match(/projectId\s*:\s*["']([^"']+)["']/);

        if (urlMatch && urlMatch[1]) {
          config = {
            databaseURL: urlMatch[1],
            apiKey: apiKeyMatch ? apiKeyMatch[1] : undefined,
            projectId: projectIdMatch ? projectIdMatch[1] : undefined,
          };
        } else if (trimmedDbUrl) {
          config = {
            databaseURL: trimmedDbUrl,
          };
        } else {
          setError('รูปแบบ Firebase Config ไม่ถูกต้อง กรุณาระบุ Database URL');
          return;
        }
      }
    } else if (trimmedDbUrl) {
      config = {
        databaseURL: trimmedDbUrl,
      };
    } else {
      setError('กรุณาระบุ Firebase Realtime Database URL หรือวาง Firebase Config');
      return;
    }

    if (!config || !config.databaseURL || !config.databaseURL.startsWith('http')) {
      setError('Database URL ต้องขึ้นต้นด้วย https:// (เช่น https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app)');
      return;
    }

    saveStoredFirebaseConfig(config);
    setSuccessMsg('บันทึกการเชื่อมต่อ Firebase เรียบร้อยแล้ว!');
    onConfigChanged();

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleDisconnect = () => {
    if (confirm('คุณต้องการตัดการเชื่อมต่อ Firebase และกลับไปใช้โหมด Local หรือไม่?')) {
      clearStoredFirebaseConfig();
      setConfigInput('');
      setDbUrlInput('');
      setSuccessMsg('ตัดการเชื่อมต่อแล้ว กลับสู่โหมด Local');
      onConfigChanged();
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative text-left max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-300/30 flex items-center justify-center text-amber-300">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-serif font-semibold text-stone-100">
              เชื่อมต่อ Firebase Realtime Database
            </h2>
            <p className="text-xs text-stone-400">
              สำหรับเชื่อมต่อข้ามมือถือของผู้เข้าอบรมและจอโปรเจกเตอร์บน Netlify
            </p>
          </div>
        </div>

        {/* Status Callout */}
        <div
          className={`mt-4 p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
            isCurrentlyConnected
              ? 'bg-amber-950/20 border-amber-300/30 text-amber-200'
              : 'bg-stone-950/80 border-stone-800 text-stone-300'
          }`}
        >
          <Database className="w-4 h-4 shrink-0 mt-0.5 text-amber-300" />
          <div className="flex-1">
            <div className="font-semibold">
              {isCurrentlyConnected
                ? 'สถานะ: เชื่อมต่อ Firebase Realtime Database สำเร็จ'
                : 'สถานะ: ทำงานในโหมด Local / Demo'}
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">
              {isCurrentlyConnected
                ? `เชื่อมต่อกับ: ${activeDatabaseUrl || 'Firebase Cloud'}`
                : 'Netlify เป็นเว็บ Static (ไม่มีเซิร์ฟเวอร์ Node.js) จึงต้องใส่ Firebase เพื่อให้มือถือเครื่องอื่นส่งข้อมูลขึ้นจอนี้ได้'}
            </p>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              Realtime Database URL (หรือวางโค้ด firebaseConfig ด้านล่าง)
            </label>
            <input
              type="text"
              value={dbUrlInput}
              onChange={(e) => setDbUrlInput(e.target.value)}
              placeholder="https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app"
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-300/60 focus:ring-1 focus:ring-amber-300/30"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              วางชุด <code className="text-amber-300 font-mono">firebaseConfig</code> ทั้งก้อน (ตัวเลือกเสริม):
            </label>
            <textarea
              rows={4}
              value={configInput}
              onChange={(e) => setConfigInput(e.target.value)}
              placeholder={`const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  databaseURL: "https://...-default-rtdb.firebaseio.com",\n  projectId: "..."\n};`}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs font-mono text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-300/60 focus:ring-1 focus:ring-amber-300/30"
            />
          </div>

          {error && (
            <div className="p-3 bg-stone-950 border border-rose-900/60 text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-stone-950 border border-amber-300/40 text-amber-200 rounded-xl text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-amber-300" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Quick Instructions & Link */}
        <div className="mt-5 p-3.5 bg-stone-950/70 border border-stone-800/80 rounded-xl text-xs text-stone-400 space-y-1.5">
          <div className="font-semibold text-stone-300 flex items-center justify-between">
            <span>วิธีสร้าง Realtime Database ฟรีใน 1 นาที:</span>
            <a
              href="https://console.firebase.google.com"
              target="_blank"
              rel="noreferrer"
              className="text-amber-300 hover:underline flex items-center gap-1 font-mono text-[11px]"
            >
              <span>Firebase Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed text-stone-400">
            <li>ไปที่ Firebase Console &rarr; สร้างโปรเจกต์ฟรี (Spark Plan)</li>
            <li>ไปที่ <b>Build &rarr; Realtime Database</b> &rarr; กด Create Database</li>
            <li>ไปที่แท็บ <b>Rules</b> ตั้งค่า: <code className="text-amber-200">{`{ "rules": { "responses": { ".read": true, ".write": true } } }`}</code></li>
            <li>ก๊อปปี้ <b>Database URL</b> หรือค่าใน Project Settings มาวางที่นี่ แล้วกดบันทึก</li>
          </ol>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-800">
          {isCurrentlyConnected ? (
            <button
              onClick={handleDisconnect}
              className="py-2 px-3 rounded-lg text-xs font-medium text-stone-400 hover:text-rose-400 hover:bg-stone-800 transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ตัดการเชื่อมต่อ (กลับไป Local)</span>
            </button>
          ) : (
            <div className="text-[11px] text-stone-500 font-mono">
              ข้อมูลจะถูกบันทึกในบราวเซอร์เครื่องนี้
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="py-2 px-3.5 rounded-lg text-xs font-medium text-stone-400 hover:text-stone-200 bg-stone-900 hover:bg-stone-800 border border-stone-800 transition"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              className="py-2 px-4 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-white text-stone-950 shadow transition flex items-center gap-1.5"
            >
              <span>บันทึก & เชื่อมต่อ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

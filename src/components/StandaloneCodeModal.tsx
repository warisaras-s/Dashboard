import React, { useState } from 'react';
import {
  FileCode,
  Download,
  Copy,
  Check,
  BookOpen,
  X
} from 'lucide-react';
import {
  STANDALONE_SURVEY_HTML,
  STANDALONE_DASHBOARD_HTML,
  FIREBASE_SETUP_GUIDE_MD,
} from '../data/standaloneCodes';

interface StandaloneCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StandaloneCodeModal: React.FC<StandaloneCodeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'survey' | 'dashboard' | 'guide'>('survey');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-900/90 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-serif font-semibold text-stone-100">
                โค้ด Standalone 2 ไฟล์ & วิธีตั้งค่า Firebase
              </h2>
              <span className="text-[11px] font-mono text-amber-300">
                · Ready to Deploy
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              HTML + JavaScript + Firebase Realtime Database (ใช้งานได้ทันที ไม่ต้องมี Node.js)
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher & Download Quick Bar */}
        <div className="px-6 py-3 border-b border-stone-800/80 bg-stone-950/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-stone-900 rounded-xl border border-stone-800">
            <button
              onClick={() => setActiveTab('survey')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                activeTab === 'survey'
                  ? 'bg-stone-800 text-stone-100 border border-stone-700'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>survey.html (หน้าตอบ)</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                activeTab === 'dashboard'
                  ? 'bg-stone-800 text-stone-100 border border-stone-700'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>dashboard.html (Dashboard)</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                activeTab === 'guide'
                  ? 'bg-amber-400/15 text-amber-200 border border-amber-300/40'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>คู่มือ Firebase & Deploy</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {activeTab === 'survey' && (
              <>
                <button
                  onClick={() => handleCopy(STANDALONE_SURVEY_HTML, 'survey')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 flex items-center gap-1.5 transition"
                >
                  {copiedKey === 'survey' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-amber-300" />
                      <span>คัดลอกแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอกโค้ด</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() =>
                    handleDownloadFile(STANDALONE_SURVEY_HTML, 'survey.html')
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-white text-stone-950 flex items-center gap-1.5 shadow-sm transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด survey.html</span>
                </button>
              </>
            )}

            {activeTab === 'dashboard' && (
              <>
                <button
                  onClick={() =>
                    handleCopy(STANDALONE_DASHBOARD_HTML, 'dashboard')
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 flex items-center gap-1.5 transition"
                >
                  {copiedKey === 'dashboard' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-amber-300" />
                      <span>คัดลอกแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอกโค้ด</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() =>
                    handleDownloadFile(STANDALONE_DASHBOARD_HTML, 'dashboard.html')
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-white text-stone-950 flex items-center gap-1.5 shadow-sm transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด dashboard.html</span>
                </button>
              </>
            )}

            {activeTab === 'guide' && (
              <button
                onClick={() => handleCopy(FIREBASE_SETUP_GUIDE_MD, 'guide')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 flex items-center gap-1.5 transition"
              >
                {copiedKey === 'guide' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-amber-300" />
                    <span>คัดลอกแล้ว</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>คัดลอกคู่มือ</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-950 font-mono text-xs text-stone-300">
          {activeTab === 'survey' && (
            <div className="relative">
              <div className="mb-3 p-3 bg-stone-900 border border-stone-800 rounded-xl text-stone-300 text-xs font-sans">
                แบบประเมินความพึงพอใจแบบ Mobile-first เต็มรูปแบบ
                มีระบบป้องกันการตอบซ้ำ บันทึกลง Firebase Realtime Database
              </div>
              <pre className="overflow-x-auto p-4 bg-stone-900/60 rounded-xl border border-stone-800 text-stone-300 whitespace-pre">
                <code>{STANDALONE_SURVEY_HTML}</code>
              </pre>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="relative">
              <div className="mb-3 p-3 bg-stone-900 border border-stone-800 rounded-xl text-stone-300 text-xs font-sans">
                หน้า Dashboard สำหรับฉายขึ้นจอโปรเจกเตอร์ มีกราฟ Chart.js
                คำนวณค่าเฉลี่ยรายข้อและค่าเฉลี่ยรวมแบบเรียลไทม์ แปลผลตามเกณฑ์ 5
                ระดับ
              </div>
              <pre className="overflow-x-auto p-4 bg-stone-900/60 rounded-xl border border-stone-800 text-amber-200/90 whitespace-pre">
                <code>{STANDALONE_DASHBOARD_HTML}</code>
              </pre>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="font-sans text-stone-200 space-y-5 max-w-3xl mx-auto py-2">
              <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl text-xs sm:text-sm text-stone-300 flex items-center gap-2">
                <span className="text-amber-300">✦</span>
                <span>
                  <b>Firebase Spark Plan ฟรี 100%:</b> ไม่ต้องผูกบัตรเครดิต รองรับการใช้งานในห้องอบรมได้เต็มรูปแบบ
                </span>
              </div>

              {/* Step 1 */}
              <div className="p-5 bg-stone-900/60 border border-stone-800 rounded-xl space-y-1.5">
                <div className="text-xs font-mono text-amber-300 uppercase tracking-wider">
                  ขั้นตอนที่ 1
                </div>
                <h3 className="font-semibold text-sm text-stone-100">
                  สร้าง Firebase Project ฟรี
                </h3>
                <p className="text-xs text-stone-400">
                  1. ไปที่ https://console.firebase.google.com เข้าสู่ระบบด้วยบัญชี Google<br />
                  2. คลิก <b>Add project</b> ตั้งชื่อโปรเจกต์ เช่น <code className="text-stone-200 font-mono">training-survey</code><br />
                  3. กดยืนยันสร้างโปรเจกต์ (Google Analytics สามารถปิดได้)
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-5 bg-stone-900/60 border border-stone-800 rounded-xl space-y-1.5">
                <div className="text-xs font-mono text-amber-300 uppercase tracking-wider">
                  ขั้นตอนที่ 2
                </div>
                <h3 className="font-semibold text-sm text-stone-100">
                  เปิด Realtime Database & ตั้งค่า Security Rules
                </h3>
                <p className="text-xs text-stone-400">
                  1. ที่แถบซ้ายเลือก <b>Build</b> &rarr; <b>Realtime Database</b><br />
                  2. คลิก <b>Create Database</b> เลือกตำแหน่ง Singapore (asia-southeast1)<br />
                  3. ไปที่แท็บ <b>Rules</b> และเปลี่ยนกฎเพื่อเปิดให้ผู้เรียนส่งได้โดยไม่ต้องล็อกอิน:
                </p>
                <div className="bg-stone-950 p-3 rounded-lg border border-stone-800 font-mono text-xs text-amber-200 mt-2">
                  <pre>{`{
  "rules": {
    "responses": {
      ".read": true,
      ".write": true
    }
  }
}`}</pre>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  * จากนั้นคลิกปุ่ม <b>Publish</b>
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-5 bg-stone-900/60 border border-stone-800 rounded-xl space-y-1.5">
                <div className="text-xs font-mono text-amber-300 uppercase tracking-wider">
                  ขั้นตอนที่ 3
                </div>
                <h3 className="font-semibold text-sm text-stone-100">
                  นำ firebaseConfig มาวางในโค้ด
                </h3>
                <p className="text-xs text-stone-400">
                  1. ไปที่ ⚙️ <b>Project settings</b> &rarr; หัวข้อ "Your apps" &rarr; คลิกไอคอน <b>&lt;/&gt; Web</b><br />
                  2. คัดลอกค่า <code className="text-stone-200 font-mono">firebaseConfig</code><br />
                  3. นำมาวางแทนที่ <code className="text-amber-200 font-mono">const firebaseConfig = &#123; ... &#125;</code> ในทั้งสองไฟล์
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-5 bg-stone-900/60 border border-stone-800 rounded-xl space-y-1.5">
                <div className="text-xs font-mono text-amber-300 uppercase tracking-wider">
                  ขั้นตอนที่ 4
                </div>
                <h3 className="font-semibold text-sm text-stone-100">
                  Deploy ออนไลน์ฟรี
                </h3>
                <p className="text-xs text-stone-400">
                  • <b>Netlify Drop (10 วินาที):</b> เข้า https://app.netlify.com/drop แล้วลากโฟลเดอร์ที่มีไฟล์ไปวาง<br />
                  • <b>Firebase Hosting:</b> รันคำสั่ง <code className="text-stone-200 font-mono">firebase init hosting</code> และ <code className="text-stone-200 font-mono">firebase deploy</code>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

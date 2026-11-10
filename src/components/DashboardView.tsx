import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  Download,
  Maximize2,
  Minimize2,
  QrCode as QrIcon,
  Users,
  Star,
  Sliders,
  Volume2,
  VolumeX,
  ExternalLink,
  Copy,
  Check,
  Sun,
  Moon,
  RotateCcw,
  Plus
} from 'lucide-react';
import { SurveyResponse, DashboardStats } from '../types';
import { SURVEY_QUESTIONS, getInterpretation } from '../data/questions';

interface DashboardViewProps {
  stats: DashboardStats;
  responses: SurveyResponse[];
  onResetData: () => void;
  onClearAll: () => void;
  onSimulateResponse: () => void;
  surveyUrl: string;
  onOpenQrModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  responses,
  onResetData,
  onClearAll,
  onSimulateResponse,
  surveyUrl,
  onOpenQrModal,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [lastNotification, setLastNotification] = useState<string | null>(null);

  const prevResponseCount = useRef(responses.length);

  // Generate QR code data URL
  useEffect(() => {
    QRCode.toDataURL(
      surveyUrl,
      {
        width: 240,
        margin: 1,
        color: {
          dark: '#1c1917',
          light: '#ffffff',
        },
      },
      (err, url) => {
        if (!err && url) setQrDataUrl(url);
      }
    );
  }, [surveyUrl]);

  // Audio tone & notification on new response
  useEffect(() => {
    if (responses.length > prevResponseCount.current) {
      const diff = responses.length - prevResponseCount.current;
      setLastNotification(`+${diff} ผู้ตอบรายใหม่`);

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.2, x: 0.8 },
        colors: ['#fef3c7', '#fde68a', '#d97706', '#ffffff']
      });

      if (soundEnabled && typeof window !== 'undefined') {
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        } catch {
          // AudioContext fallback
        }
      }

      const timer = setTimeout(() => {
        setLastNotification(null);
      }, 3500);

      prevResponseCount.current = responses.length;
      return () => clearTimeout(timer);
    }
    prevResponseCount.current = responses.length;
  }, [responses.length, soundEnabled]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const copySurveyLink = () => {
    navigator.clipboard.writeText(surveyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const downloadCSV = () => {
    if (responses.length === 0) {
      alert('ยังไม่มีข้อมูลผลการประเมิน');
      return;
    }

    const header = [
      'ลำดับ',
      'วันที่และเวลา',
      'ข้อ 1 ความชัดเจนเนื้อหา',
      'ข้อ 2 วิทยากรและการสอน',
      'ข้อ 3 การนำไปประยุกต์ใช้',
      'ข้อ 4 สื่อและเอกสารอบรม',
      'ข้อ 5 เวลาสถานที่และบริการ',
      'คะแนนเฉลี่ย',
      'ระดับความพึงพอใจ',
      'ข้อเสนอแนะเพิ่มเติม',
    ];

    const rows = responses.map((r, index) => {
      const dateStr = r.timestamp
        ? new Date(r.timestamp).toLocaleString('th-TH')
        : '';
      const interp = getInterpretation(r.average).level;
      const cleanFeedback = (r.feedback || '').replace(/"/g, '""');
      return [
        index + 1,
        `"${dateStr}"`,
        r.q1,
        r.q2,
        r.q3,
        r.q4,
        r.q5,
        r.average,
        `"${interp}"`,
        `"${cleanFeedback}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [header.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `training_survey_results_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const interpInfo = getInterpretation(stats.overallAverage);
  const feedbacksWithContent = responses
    .filter((r) => r.feedback && r.feedback.trim().length > 0)
    .slice()
    .reverse();

  return (
    <div
      className={`min-h-[calc(100vh-64px)] transition-colors duration-200 ${
        isLightMode
          ? 'bg-stone-100 text-stone-900'
          : 'bg-stone-950 text-stone-100'
      } p-4 sm:p-6 lg:p-8`}
    >
      <div className="max-w-[1500px] mx-auto space-y-6">
        {/* Projector Minimal Header & Control Bar */}
        <div
          className={`flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border backdrop-blur ${
            isLightMode
              ? 'bg-white/80 border-stone-200'
              : 'bg-stone-900/60 border-stone-800'
          }`}
        >
          {/* Live Telemetry Title */}
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif font-semibold tracking-wide text-stone-100">
                  <span className={isLightMode ? 'text-stone-900' : 'text-stone-100'}>
                    Executive Projector Dashboard
                  </span>
                </h2>
                <span className="text-[11px] font-mono text-stone-400">
                  · Live Stream
                </span>
              </div>
              <p
                className={`text-xs ${
                  isLightMode ? 'text-stone-500' : 'text-stone-400'
                }`}
              >
                แสดงผลคะแนนและสถิติการประเมินแบบเรียลไทม์
              </p>
            </div>
          </div>

          {/* New arrival subtle notification */}
          <AnimatePresence>
            {lastNotification && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-amber-400/20 text-amber-200 border border-amber-300/40 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-mono"
              >
                <span>✦</span>
                <span>{lastNotification}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'ปิดเสียงแจ้งเตือน' : 'เปิดเสียงแจ้งเตือน'}
              className={`p-2 rounded-lg border text-xs transition ${
                isLightMode
                  ? 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700'
                  : 'bg-stone-900 hover:bg-stone-800 border-stone-800 text-stone-400'
              }`}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-amber-300" />
              ) : (
                <VolumeX className="w-4 h-4 text-stone-500" />
              )}
            </button>

            <button
              onClick={() => setIsLightMode(!isLightMode)}
              title="สลับโหมดสว่าง/มืด"
              className={`p-2 rounded-lg border text-xs transition ${
                isLightMode
                  ? 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700'
                  : 'bg-stone-900 hover:bg-stone-800 border-stone-800 text-stone-400'
              }`}
            >
              {isLightMode ? (
                <Moon className="w-4 h-4 text-stone-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-300" />
              )}
            </button>

            <button
              onClick={toggleFullscreen}
              className="px-3 py-2 rounded-lg text-xs font-medium bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 flex items-center gap-1.5 transition"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-stone-400" />
                  <span className="hidden sm:inline">ออกเต็มจอ</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-stone-400" />
                  <span className="hidden sm:inline">เต็มจอโปรเจกเตอร์</span>
                </>
              )}
            </button>

            <button
              onClick={downloadCSV}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-white text-stone-950 transition flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-stone-800" />
              <span>ดาวน์โหลด CSV</span>
            </button>
          </div>
        </div>

        {/* Top KPI Cards & QR Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
          {/* Card 1: Total Respondents (3 cols) */}
          <div
            className={`lg:col-span-3 rounded-2xl p-6 border shadow-sm flex flex-col justify-between ${
              isLightMode
                ? 'bg-white border-stone-200'
                : 'bg-stone-900/60 border-stone-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs text-stone-400 font-medium tracking-wider uppercase">
                <span>จำนวนผู้ประเมิน</span>
                <Users className="w-4 h-4 text-stone-500" />
              </div>

              <div className="flex items-baseline gap-2 mt-4">
                <motion.span
                  key={stats.totalRespondents}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-5xl md:text-6xl font-serif font-bold tracking-tight ${
                    isLightMode ? 'text-stone-900' : 'text-stone-100'
                  }`}
                >
                  {stats.totalRespondents}
                </motion.span>
                <span className="text-stone-400 text-sm font-medium">คน</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-800/40 text-xs text-stone-400 flex items-center justify-between">
              <span>สถานะการเชื่อมต่อ</span>
              <span className="text-amber-300/90 font-mono text-[11px]">
                Active Live
              </span>
            </div>
          </div>

          {/* Card 2: Overall Satisfaction Mean & Interpretation (5 cols) */}
          <div
            className={`lg:col-span-5 rounded-2xl p-6 border shadow-sm flex flex-col justify-between ${
              isLightMode
                ? 'bg-white border-stone-200'
                : 'bg-stone-900/70 border-stone-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-400 uppercase tracking-wider font-medium">
                  คะแนนเฉลี่ยรวมทุกด้าน
                </span>
                <span
                  className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${interpInfo.badgeColor}`}
                >
                  {interpInfo.level}
                </span>
              </div>

              <div className="flex items-baseline gap-3 mt-4">
                <motion.span
                  key={stats.overallAverage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-6xl md:text-7xl font-serif font-bold text-amber-200 tracking-tight"
                >
                  {stats.overallAverage.toFixed(2)}
                </motion.span>
                <span className="text-xl md:text-2xl text-stone-500 font-serif font-normal">
                  / 5.00
                </span>
              </div>

              {/* Progress bar gauge */}
              <div className="w-full bg-stone-950 rounded-full h-2 mt-4 overflow-hidden border border-stone-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(100, (stats.overallAverage / 5) * 100)}%`,
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="bg-gradient-to-r from-stone-500 via-amber-300 to-amber-200 h-full rounded-full"
                />
              </div>
            </div>

            <p
              className={`text-xs mt-3 line-clamp-1 ${
                isLightMode ? 'text-stone-600' : 'text-stone-400'
              }`}
            >
              {interpInfo.desc}
            </p>
          </div>

          {/* Card 3: Minimal QR Code for Projector Screen (4 cols) */}
          <div
            className={`lg:col-span-4 rounded-2xl p-5 border shadow-sm flex items-center gap-4 ${
              isLightMode
                ? 'bg-white border-stone-200'
                : 'bg-stone-900/60 border-stone-800'
            }`}
          >
            {qrDataUrl ? (
              <div
                onClick={onOpenQrModal}
                className="group relative cursor-pointer shrink-0"
                title="คลิกเพื่อขยาย QR Code เต็มจอ"
              >
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  className="w-24 h-24 rounded-xl bg-white p-1 border border-stone-300 transition-transform group-hover:scale-102"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-xl bg-stone-800 animate-pulse shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                <QrIcon className="w-3.5 h-3.5 text-amber-300" />
                <span>สแกนตอบจากมือถือ</span>
              </span>
              <p
                className={`text-xs mt-1 leading-snug line-clamp-2 ${
                  isLightMode ? 'text-stone-600' : 'text-stone-400'
                }`}
              >
                เปิดกล้องมือถือสแกนเพื่อร่วมประเมิน
              </p>

              <div className="mt-3 flex items-center gap-1.5">
                <button
                  onClick={copySurveyLink}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-stone-800/80 hover:bg-stone-800 text-stone-300 border border-stone-700/80 flex items-center gap-1 transition"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-amber-300" />
                      <span>คัดลอกแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอกลิงก์</span>
                    </>
                  )}
                </button>

                <button
                  onClick={onOpenQrModal}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-200 hover:text-amber-100 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-300/30 transition flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>ขยายเต็มจอ</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Charts & Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: 5 Questions Detailed Bar (8 cols) */}
          <div
            className={`lg:col-span-8 rounded-2xl p-6 border shadow-sm ${
              isLightMode
                ? 'bg-white border-stone-200'
                : 'bg-stone-900/60 border-stone-800'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
              <div>
                <h3
                  className={`text-base sm:text-lg font-serif font-semibold flex items-center gap-2 ${
                    isLightMode ? 'text-stone-900' : 'text-stone-100'
                  }`}
                >
                  <Sliders className="w-4 h-4 text-amber-300" />
                  <span>คะแนนเฉลี่ยรายหัวข้อ (สเกล 1 - 5)</span>
                </h3>
                <p
                  className={`text-xs mt-0.5 ${
                    isLightMode ? 'text-stone-500' : 'text-stone-400'
                  }`}
                >
                  คำนวณแบบถ่วงน้ำหนักตามเวลาจริง พร้อมจำแนกตามเกณฑ์มาตรฐาน
                </p>
              </div>

              <div className="text-xs text-stone-400 font-mono">
                เต็ม 5.00 คะแนน
              </div>
            </div>

            {/* Questions Progress Bars */}
            <div className="space-y-4">
              {SURVEY_QUESTIONS.map((q, idx) => {
                const score = stats.questionAverages[idx] || 0;
                const percentage = (score / 5) * 100;
                const qInterp = getInterpretation(score);

                return (
                  <div key={q.key} className="space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-stone-500 text-xs">
                          0{q.id}.
                        </span>
                        <span
                          className={`font-medium ${
                            isLightMode ? 'text-stone-800' : 'text-stone-200'
                          }`}
                        >
                          {q.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full border ${qInterp.badgeColor}`}
                        >
                          {qInterp.level}
                        </span>
                        <span className="font-serif font-bold text-base text-amber-200 w-12 text-right">
                          {score.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div
                      className={`h-2.5 rounded-full overflow-hidden border ${
                        isLightMode
                          ? 'bg-stone-100 border-stone-200'
                          : 'bg-stone-950 border-stone-800'
                      }`}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.05 }}
                        className="h-full rounded-full bg-gradient-to-r from-stone-500 to-amber-300"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scale Legend (Zero-Pill, Unboxed Metadata) */}
            <div
              className={`mt-6 pt-4 border-t grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] ${
                isLightMode
                  ? 'border-stone-200 text-stone-500'
                  : 'border-stone-800 text-stone-400'
              }`}
            >
              <div>4.51–5.00: มากที่สุด</div>
              <div>3.51–4.50: มาก</div>
              <div>2.51–3.50: ปานกลาง</div>
              <div>1.51–2.50: น้อย</div>
              <div>1.00–1.50: น้อยที่สุด</div>
            </div>
          </div>

          {/* Right Column: Star Breakdown & Controls (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Star Distribution */}
            <div
              className={`rounded-2xl p-6 border shadow-sm ${
                isLightMode
                  ? 'bg-white border-stone-200'
                  : 'bg-stone-900/60 border-stone-800'
              }`}
            >
              <h3
                className={`text-base font-serif font-semibold mb-4 flex items-center gap-2 ${
                  isLightMode ? 'text-stone-900' : 'text-stone-100'
                }`}
              >
                <Star className="w-4 h-4 text-amber-300" />
                <span>สัดส่วนการให้คะแนนดาว</span>
              </h3>

              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count =
                    stats.starDistribution[star as 1 | 2 | 3 | 4 | 5] || 0;
                  const totalRatings = Object.values(
                    stats.starDistribution
                  ).reduce((a, b) => a + b, 0);
                  const pct =
                    totalRatings > 0
                      ? Math.round((count / totalRatings) * 100)
                      : 0;

                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <div className="w-10 font-mono text-stone-300 flex items-center justify-end gap-1">
                        <span>{star}</span>
                        <span className="text-amber-300">★</span>
                      </div>

                      <div
                        className={`flex-1 h-2 rounded-full overflow-hidden ${
                          isLightMode ? 'bg-stone-100' : 'bg-stone-950'
                        }`}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.4 }}
                          className="bg-amber-300/90 h-full rounded-full"
                        />
                      </div>

                      <span className="w-10 text-right font-mono text-stone-400">
                        {pct}%
                      </span>
                      <span className="w-8 text-right text-stone-500 font-mono">
                        ({count})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Test Simulation Controls */}
            <div
              className={`rounded-2xl p-5 border shadow-sm ${
                isLightMode
                  ? 'bg-white border-stone-200'
                  : 'bg-stone-900/60 border-stone-800'
              }`}
            >
              <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider block mb-3">
                การทดสอบระบบสำหรับผู้บรรยาย
              </span>

              <div className="space-y-2">
                <button
                  onClick={onSimulateResponse}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-white text-stone-950 shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-stone-900" />
                  <span>จำลองผลประเมิน 1 รายการ (Live Test)</span>
                </button>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={onResetData}
                    className="py-2 px-3 rounded-xl text-xs font-medium bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3 text-stone-500" />
                    <span>รีเซ็ตตัวอย่าง</span>
                  </button>

                  <button
                    onClick={onClearAll}
                    className="py-2 px-3 rounded-xl text-xs font-medium text-stone-400 hover:text-stone-300 bg-stone-900 hover:bg-stone-800 border border-stone-800 transition flex items-center justify-center"
                  >
                    <span>ล้างข้อมูล</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Feedback Quotes Wall */}
        <div
          className={`rounded-2xl p-6 border shadow-sm ${
            isLightMode
              ? 'bg-white border-stone-200'
              : 'bg-stone-900/60 border-stone-800'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3
                className={`text-base sm:text-lg font-serif font-semibold ${
                  isLightMode ? 'text-stone-900' : 'text-stone-100'
                }`}
              >
                ข้อเสนอแนะล่าสุดจากผู้เข้าร่วมอบรม
              </h3>
              <p
                className={`text-xs ${
                  isLightMode ? 'text-stone-500' : 'text-stone-400'
                }`}
              >
                ความคิดเห็นจริงแบบนิรนามจากห้องอบรม
              </p>
            </div>

            <div className="text-xs font-mono text-stone-400">
              {feedbacksWithContent.length} ข้อความ
            </div>
          </div>

          {feedbacksWithContent.length === 0 ? (
            <div className="text-center py-10 text-stone-500 text-xs">
              ยังไม่มีข้อเสนอแนะเพิ่มเติม
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {feedbacksWithContent.map((f, i) => {
                  const dateStr = f.timestamp
                    ? new Date(f.timestamp).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '';

                  return (
                    <motion.div
                      key={f.id || i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border transition ${
                        isLightMode
                          ? 'bg-stone-50 border-stone-200'
                          : 'bg-stone-950/70 border-stone-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-2 pb-1.5 border-b border-stone-800/40">
                        <span className="font-serif font-bold text-amber-200 flex items-center gap-1">
                          <span>{f.average.toFixed(1)}</span>
                          <span className="text-[10px]">★</span>
                        </span>
                        <span className="text-stone-400 text-[11px] font-mono">
                          {dateStr}
                        </span>
                      </div>
                      <p
                        className={`text-xs md:text-sm leading-relaxed ${
                          isLightMode ? 'text-stone-700' : 'text-stone-300'
                        }`}
                      >
                        "{f.feedback}"
                      </p>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

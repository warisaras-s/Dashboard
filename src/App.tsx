import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { SurveyView } from './components/SurveyView';
import { DashboardView } from './components/DashboardView';
import { QrCodeModal } from './components/QrCodeModal';
import { StandaloneCodeModal } from './components/StandaloneCodeModal';
import { AppView, SurveyResponse, DashboardStats } from './types';
import { getInterpretation } from './data/questions';

const defaultStats: DashboardStats = {
  totalRespondents: 0,
  overallAverage: 0,
  interpretation: 'รอข้อมูล',
  questionAverages: [0, 0, 0, 0, 0],
  starDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
};

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [surveyUrl, setSurveyUrl] = useState<string>('');

  // Handle URL query parameter ?view=survey or ?view=dashboard
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam === 'survey') {
      setCurrentView('survey');
    } else if (viewParam === 'guide' || viewParam === 'code') {
      setCurrentView('code-guide');
    } else {
      setCurrentView('dashboard');
    }

    const base = window.location.origin + window.location.pathname;
    setSurveyUrl(`${base}?view=survey`);
  }, []);

  // Connect to SSE stream for live real-time updates
  useEffect(() => {
    // Initial fetch
    fetch('/api/responses')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.stats) setStats(data.stats);
          if (data.responses) setResponses(data.responses);
        }
      })
      .catch((err) => console.error('Fetch responses error:', err));

    // Connect to Server-Sent Events stream
    const eventSource = new EventSource('/api/stream');

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.stats) setStats(payload.stats);
        if (payload.responses) setResponses(payload.responses);
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    eventSource.onerror = () => {
      // Reconnect handled automatically by EventSource
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleResetData = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      const data = await res.json();
      if (data.stats) setStats(data.stats);
      fetch('/api/responses')
        .then((r) => r.json())
        .then((d) => d.responses && setResponses(d.responses));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลการประเมินทั้งหมด (0 รายการ)?')) {
      try {
        const res = await fetch('/api/clear-all', { method: 'POST' });
        const data = await res.json();
        if (data.stats) setStats(data.stats);
        setResponses([]);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSimulateResponse = async () => {
    // Generate realistic attendee responses
    const sampleFeedbacks = [
      'ประทับใจความตั้งใจของวิทยากร อธิบายชัดเจนมากครับ',
      'Workshop สนุกมาก ได้ทำ Hands-on จริงและเข้าใจระบบได้รวดเร็ว',
      'เอกสารและการดำเนินรายการกระชับดีมาก นำไปใช้งานต่อยอดได้เลย',
      'อยากให้มีเวลาทำแบบฝึกหัดเพิ่มขึ้นอีกนิด โดยรวมเยี่ยมยอดมากครับ',
      'วิทยากรตอบคำถามได้ตรงจุด ให้คำแนะนำเครื่องมือเสริมที่มีประโยชน์มาก',
      'ระบบการอบรมราบรื่น เสียงและภาพคมชัด ทีมงานดูแลดีมาก',
    ];

    // Skew towards positive scores 4-5
    const randomScore = () => (Math.random() > 0.35 ? 5 : 4);
    const q1 = randomScore();
    const q2 = 5;
    const q3 = randomScore();
    const q4 = Math.random() > 0.4 ? 5 : 4;
    const q5 = Math.random() > 0.5 ? 5 : 4;

    const feedback =
      sampleFeedbacks[Math.floor(Math.random() * sampleFeedbacks.length)];

    try {
      await fetch('/api/responses?allowDuplicate=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q1,
          q2,
          q3,
          q4,
          q5,
          feedback,
          deviceId: 'simulated_' + Math.random().toString(36).substring(2, 7),
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadCSV = () => {
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
    link.download = `training_feedback_results_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSelectView = (view: AppView) => {
    if (view === 'code-guide') {
      setIsCodeModalOpen(true);
    } else {
      setCurrentView(view);
      // update URL query parameter without full reload
      const url = new URL(window.location.href);
      url.searchParams.set('view', view);
      window.history.replaceState({}, '', url.toString());
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      <Navbar
        currentView={currentView}
        onSelectView={handleSelectView}
        onOpenQrModal={() => setIsQrModalOpen(true)}
        onDownloadCSV={handleDownloadCSV}
        totalRespondents={stats.totalRespondents}
      />

      <main className="flex-1">
        {currentView === 'survey' ? (
          <SurveyView
            onGoToDashboard={() => handleSelectView('dashboard')}
            onSubmittedSuccess={() => {
              // Real-time broadcast automatically triggers update
            }}
          />
        ) : (
          <DashboardView
            stats={stats}
            responses={responses}
            onResetData={handleResetData}
            onClearAll={handleClearAll}
            onSimulateResponse={handleSimulateResponse}
            surveyUrl={surveyUrl}
            onOpenQrModal={() => setIsQrModalOpen(true)}
          />
        )}
      </main>

      {/* Large Projector QR Code Modal */}
      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        surveyUrl={surveyUrl}
      />

      {/* Standalone Code & Firebase Guide Modal */}
      <StandaloneCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />
    </div>
  );
}

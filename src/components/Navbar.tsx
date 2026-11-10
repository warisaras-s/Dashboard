import React from 'react';
import {
  BarChart3,
  Smartphone,
  QrCode,
  Download,
  Code2,
  Flame,
  Database
} from 'lucide-react';
import { AppView } from '../types';

interface NavbarProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  onOpenQrModal: () => void;
  onDownloadCSV: () => void;
  totalRespondents: number;
  onOpenFirebaseModal: () => void;
  isFirebaseConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  onOpenQrModal,
  onDownloadCSV,
  totalRespondents,
  onOpenFirebaseModal,
  isFirebaseConnected,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-stone-950/90 border-b border-stone-800/80 backdrop-blur-md">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Zone: Clean minimal wordmark */}
        <button
          onClick={() => onSelectView('dashboard')}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-700/80 flex items-center justify-center text-amber-200">
            <span className="font-serif text-base font-bold">L</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-semibold text-base sm:text-lg text-stone-100 tracking-wide">
                LiveFeedback
              </span>
              <span className="text-[11px] text-stone-400 font-mono">
                · Executive
              </span>
            </div>
            <span className="text-[10px] text-stone-400 block -mt-0.5 tracking-wider uppercase">
              Training Evaluation
            </span>
          </div>
        </button>

        {/* View Switcher: Refined Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-stone-900/90 rounded-xl border border-stone-800">
          <button
            onClick={() => onSelectView('survey')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide flex items-center gap-1.5 transition-colors ${
              currentView === 'survey'
                ? 'bg-stone-800 text-stone-100 shadow-sm border border-stone-700/60'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-stone-400" />
            <span>หน้าตอบ (ผู้เรียน)</span>
          </button>

          <button
            onClick={() => onSelectView('dashboard')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide flex items-center gap-1.5 transition-colors ${
              currentView === 'dashboard'
                ? 'bg-stone-800 text-stone-100 shadow-sm border border-stone-700/60'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-300" />
            <span>Dashboard</span>
            <span className="text-[10px] text-stone-400 font-mono ml-0.5">
              ({totalRespondents})
            </span>
          </button>

          <button
            onClick={() => onSelectView('code-guide')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide flex items-center gap-1.5 transition-colors ${
              currentView === 'code-guide'
                ? 'bg-amber-400/15 text-amber-200 border border-amber-300/40'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-amber-300/80" />
            <span className="hidden sm:inline">โค้ด Standalone</span>
            <span className="sm:hidden">โค้ด</span>
          </button>
        </div>

        {/* Action Controls & Firebase Status */}
        <div className="flex items-center gap-2">
          {/* Firebase Connection Button */}
          <button
            onClick={onOpenFirebaseModal}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition ${
              isFirebaseConnected
                ? 'bg-amber-400/10 border-amber-300/30 text-amber-200 hover:bg-amber-400/20'
                : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
            title="ตั้งค่าเชื่อมต่อ Firebase Realtime Database"
          >
            <Flame className={`w-3.5 h-3.5 ${isFirebaseConnected ? 'text-amber-300' : 'text-stone-500'}`} />
            <span>{isFirebaseConnected ? 'Firebase เชื่อมต่อแล้ว' : 'ตั้งค่า Firebase'}</span>
          </button>

          <button
            onClick={onOpenQrModal}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-stone-300 hover:text-stone-100 bg-stone-900 hover:bg-stone-800/80 border border-stone-800 transition flex items-center gap-1.5"
            title="ขยาย QR Code"
          >
            <QrCode className="w-3.5 h-3.5 text-stone-400" />
            <span className="hidden sm:inline">QR Code</span>
          </button>

          <button
            onClick={onDownloadCSV}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-stone-900 bg-stone-100 hover:bg-white transition flex items-center gap-1.5 shadow-sm"
            title="ส่งออกผลการประเมินเป็นไฟล์ CSV"
          >
            <Download className="w-3.5 h-3.5 text-stone-800" />
            <span>ดาวน์โหลด CSV</span>
          </button>
        </div>
      </div>
    </header>
  );
};

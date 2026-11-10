import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, ExternalLink, Printer } from 'lucide-react';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  surveyUrl: string;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  surveyUrl,
}) => {
  const [qrSrc, setQrSrc] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (surveyUrl) {
      QRCode.toDataURL(
        surveyUrl,
        {
          width: 480,
          margin: 1,
          color: {
            dark: '#1c1917',
            light: '#ffffff',
          },
        },
        (err, url) => {
          if (!err && url) setQrSrc(url);
        }
      );
    }
  }, [surveyUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(surveyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code แบบประเมินการอบรม</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Prompt:wght@400;600&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Prompt', sans-serif; text-align: center; padding: 48px; color: #1c1917; background: #ffffff; }
            .kicker { font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase; color: #78716c; margin-bottom: 8px; }
            h1 { font-family: 'Cormorant Garamond', serif; font-size: 36px; margin: 0 0 8px 0; color: #1c1917; }
            p { font-size: 15px; color: #57534e; margin: 0 auto 24px auto; max-width: 400px; }
            img { max-width: 320px; border: 1px solid #e7e5e4; border-radius: 16px; padding: 12px; }
            .url { font-family: monospace; font-size: 13px; color: #44403c; margin-top: 16px; }
          </style>
        </head>
        <body>
          <div class="kicker">Executive Training</div>
          <h1>สแกนเพื่อร่วมประเมินการอบรม</h1>
          <p>เปิดกล้องโทรศัพท์มือถือแล้วสแกน QR Code เพื่อให้คะแนนและข้อเสนอแนะ</p>
          <img src="${qrSrc}" alt="QR Code" />
          <div class="url">${surveyUrl}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-[11px] font-mono text-stone-400 uppercase tracking-wider mb-1">
          Projector Display · ห้องอบรม
        </div>

        <h3 className="text-xl sm:text-2xl font-serif font-semibold text-stone-100">
          สแกนเพื่อทำแบบประเมิน
        </h3>
        <p className="text-xs text-stone-400 mt-1">
          เปิดกล้องโทรศัพท์มือถือเพื่อประเมินผลการอบรม (ไม่ต้องล็อกอิน)
        </p>

        {/* QR Code Container */}
        <div className="mt-5 p-2 bg-white rounded-xl shadow-md inline-block border border-stone-200">
          {qrSrc ? (
            <img
              src={qrSrc}
              alt="Survey QR Code"
              className="w-60 h-60 sm:w-68 sm:h-68 object-contain"
            />
          ) : (
            <div className="w-60 h-60 bg-stone-100 animate-pulse rounded-lg" />
          )}
        </div>

        {/* URL Pill */}
        <div className="mt-4 bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 flex items-center justify-between gap-2 text-left">
          <span className="text-xs font-mono text-stone-300 truncate">
            {surveyUrl}
          </span>
          <button
            onClick={handleCopy}
            className="text-xs font-medium px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 shrink-0 flex items-center gap-1 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-amber-300" />
                <span>คัดลอกแล้ว</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>คัดลอก</span>
              </>
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={handlePrint}
            className="py-2.5 px-3 rounded-xl text-xs font-medium bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 flex items-center justify-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5 text-stone-400" />
            <span>พิมพ์โปสเตอร์</span>
          </button>

          <a
            href={surveyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-white text-stone-950 flex items-center justify-center gap-1.5 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>เปิดหน้าตอบ</span>
          </a>
        </div>
      </div>
    </div>
  );
};

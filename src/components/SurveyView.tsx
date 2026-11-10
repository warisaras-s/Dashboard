import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Send, 
  AlertCircle, 
  RotateCcw, 
  Award,
  Check
} from 'lucide-react';
import { SURVEY_QUESTIONS, RATING_SCALE, getInterpretation } from '../data/questions';
import { SurveyResponse } from '../types';
import { submitSurveyResponse } from '../services/surveyStore';

interface SurveyViewProps {
  onSubmittedSuccess?: (res: SurveyResponse) => void;
  onGoToDashboard?: () => void;
}

export const SurveyView: React.FC<SurveyViewProps> = ({
  onSubmittedSuccess,
  onGoToDashboard,
}) => {
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    average: number;
    timestamp: number;
  } | null>(null);

  // Check duplicate submission in local storage
  useEffect(() => {
    const savedStatus = localStorage.getItem('training_survey_submitted_at');
    const savedAvg = localStorage.getItem('training_survey_submitted_avg');
    if (savedStatus) {
      setHasSubmitted(true);
      if (savedAvg) {
        setSubmittedData({
          average: parseFloat(savedAvg),
          timestamp: parseInt(savedStatus, 10),
        });
      }
    }
  }, []);

  const handleSelectScore = (questionKey: string, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionKey]: score }));
    if (errorMessage) setErrorMessage(null);
  };

  const answeredCount = Object.keys(answers).length;
  const isAllAnswered = answeredCount === SURVEY_QUESTIONS.length;

  const currentAverage = isAllAnswered
    ? Number(
        (
          Object.values(answers).reduce((a, b) => a + b, 0) /
          SURVEY_QUESTIONS.length
        ).toFixed(2)
      )
    : null;

  const getDeviceId = () => {
    let id = localStorage.getItem('training_survey_device_id');
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      localStorage.setItem('training_survey_device_id', id);
    }
    return id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAllAnswered) {
      const unanswered = SURVEY_QUESTIONS.filter((q) => !answers[q.key]).map(
        (q) => `ข้อ ${q.id}`
      );
      setErrorMessage(
        `กรุณาประเมินให้ครบทุกหัวข้อ (ยังไม่ได้ให้คะแนน: ${unanswered.join(', ')})`
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const deviceId = getDeviceId();

    try {
      const saved = await submitSurveyResponse({
        q1: answers.q1,
        q2: answers.q2,
        q3: answers.q3,
        q4: answers.q4,
        q5: answers.q5,
        feedback: feedback.trim(),
        deviceId,
      });

      // Celebratory soft confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#fef3c7', '#fde68a', '#d97706', '#ffffff']
      });

      const now = Date.now();
      localStorage.setItem('training_survey_submitted_at', now.toString());
      localStorage.setItem(
        'training_survey_submitted_avg',
        (saved.average || currentAverage || 5).toString()
      );

      setHasSubmitted(true);
      setSubmittedData({
        average: saved.average || currentAverage || 5,
        timestamp: now,
      });

      if (onSubmittedSuccess) {
        onSubmittedSuccess(saved);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForTesting = () => {
    localStorage.removeItem('training_survey_submitted_at');
    localStorage.removeItem('training_survey_submitted_avg');
    setHasSubmitted(false);
    setSubmittedData(null);
    setAnswers({});
    setFeedback('');
    setErrorMessage(null);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 md:py-12">
      {/* Editorial Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-2 text-xs text-stone-400 font-medium mb-3 tracking-wider uppercase">
          <span>ระบบประเมินนิรนาม</span>
          <span aria-hidden="true" className="text-stone-600">·</span>
          <span>ไม่บันทึกข้อมูลส่วนตัว</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-serif font-semibold text-stone-100 tracking-tight">
          แบบประเมินความพึงพอใจการอบรม
        </h1>
        <p className="text-xs md:text-sm text-stone-400 mt-2 max-w-md mx-auto leading-relaxed">
          ความคิดเห็นของท่านคือข้อมูลสำคัญในการยกระดับคุณภาพหลักสูตรและการจัดอบรม
        </p>

        {/* Minimal Progress Indicator */}
        {!hasSubmitted && (
          <div className="mt-5 pt-4 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
            <div className="flex items-center gap-2">
              <span className="font-mono text-stone-300">ความคืบหน้า</span>
              <span aria-hidden="true" className="text-stone-600">·</span>
              <span className="text-stone-200 font-mono">
                {answeredCount} / {SURVEY_QUESTIONS.length}
              </span>
            </div>

            {currentAverage !== null && (
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-stone-400">เฉลี่ย</span>
                <span className="text-amber-300 font-bold">
                  {currentAverage.toFixed(2)}
                </span>
                <span className="text-stone-500">/ 5.00</span>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Already Submitted State */}
      <AnimatePresence>
        {hasSubmitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-stone-900/70 border border-stone-800 rounded-2xl p-6 md:p-8 text-center shadow-lg relative backdrop-blur"
          >
            <div className="w-14 h-14 bg-amber-400/10 border border-amber-300/30 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-300">
              <Check className="w-6 h-6 stroke-[2.5]" />
            </div>

            <h2 className="text-xl md:text-2xl font-serif font-semibold text-stone-100">
              บันทึกข้อมูลเรียบร้อยแล้ว
            </h2>
            <p className="text-stone-400 text-xs md:text-sm mt-2 max-w-md mx-auto leading-relaxed">
              ขอขอบพระคุณสำหรับข้อเสนอแนะอันมีค่า ข้อมูลของท่านได้แสดงผลบนหน้าจอ Dashboard สดเรียบร้อยแล้ว
            </p>

            {submittedData && (
              <div className="mt-6 bg-stone-950/80 border border-stone-800/80 rounded-xl p-4 max-w-xs mx-auto">
                <div className="text-[11px] text-stone-500 uppercase tracking-wider">
                  คะแนนเฉลี่ยที่ท่านมอบให้
                </div>
                <div className="text-4xl font-serif font-bold text-amber-200 mt-1">
                  {submittedData.average.toFixed(2)}
                  <span className="text-xs text-stone-500 font-sans font-normal ml-1">
                    / 5.00
                  </span>
                </div>
                <div className="mt-2 text-[11px] font-medium text-stone-300 pt-2 border-t border-stone-800/60">
                  {getInterpretation(submittedData.average).level}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-2.5 justify-center items-center">
              {onGoToDashboard && (
                <button
                  type="button"
                  onClick={onGoToDashboard}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-white text-stone-950 shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <Award className="w-4 h-4 text-stone-800" />
                  <span>ดูหน้าจอ Dashboard</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleResetForTesting}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-medium text-stone-400 hover:text-stone-200 bg-stone-900 hover:bg-stone-800 border border-stone-800 transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                <span>ทดสอบตอบใหม่อีกครั้ง</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Survey Questions Form */}
      {!hasSubmitted && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {SURVEY_QUESTIONS.map((q, index) => {
            const currentScore = answers[q.key];
            const isAnswered = currentScore !== undefined;

            return (
              <motion.div
                key={q.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`bg-stone-900/50 border rounded-2xl p-4 md:p-5 backdrop-blur transition-all ${
                  isAnswered
                    ? 'border-stone-700/80 bg-stone-900/80'
                    : 'border-stone-800/80 hover:border-stone-700/60'
                }`}
              >
                {/* Question Info */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1 text-[11px] text-stone-400 font-mono">
                      <span>0{q.id}.</span>
                      <span className="uppercase tracking-wider">เกณฑ์การประเมิน</span>
                    </div>
                    <h3 className="text-sm md:text-base font-semibold text-stone-100 leading-snug">
                      {q.title}
                    </h3>
                    <p className="text-xs text-stone-400 mt-1">{q.subtitle}</p>
                  </div>

                  {currentScore && (
                    <div className="shrink-0 px-2.5 py-1 rounded-lg bg-stone-800/90 border border-stone-700 text-center font-mono">
                      <span className="text-sm font-bold text-amber-200">
                        {currentScore}
                      </span>
                      <span className="text-[10px] text-stone-500 block -mt-0.5">
                        / 5
                      </span>
                    </div>
                  )}
                </div>

                {/* Refined Rating Scale 1-5 */}
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mt-4">
                  {RATING_SCALE.map((scale) => {
                    const isSelected = currentScore === scale.score;
                    return (
                      <button
                        key={scale.score}
                        type="button"
                        onClick={() => handleSelectScore(q.key, scale.score)}
                        className={`group relative flex flex-col items-center justify-between py-3 px-1 rounded-xl transition-all duration-150 transform active:scale-95 border ${
                          isSelected
                            ? `${scale.activeBg} font-semibold`
                            : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:bg-stone-800/50 hover:text-stone-200'
                        }`}
                      >
                        <span className="text-xs sm:text-sm font-mono opacity-80 group-hover:scale-110 transition-transform">
                          {scale.emoji}
                        </span>
                        <span
                          className={`text-sm sm:text-base font-mono font-bold mt-1 ${
                            isSelected ? 'text-amber-200' : 'text-stone-300'
                          }`}
                        >
                          {scale.score}
                        </span>
                        <span
                          className={`text-[10px] sm:text-[11px] leading-tight text-center mt-0.5 truncate max-w-full px-0.5 ${
                            isSelected ? 'text-stone-200 font-medium' : 'text-stone-500'
                          }`}
                        >
                          {scale.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}

          {/* Feedback Textarea */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-stone-900/50 border border-stone-800/80 rounded-2xl p-4 md:p-5 backdrop-blur"
          >
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="feedback-input"
                className="text-xs md:text-sm font-semibold text-stone-200 tracking-wide"
              >
                ข้อเสนอแนะเพิ่มเติม / สิ่งที่ประทับใจ
              </label>
              <span className="text-[11px] text-stone-500 font-mono">
                (ไม่บังคับ)
              </span>
            </div>
            <textarea
              id="feedback-input"
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="ระบุความคิดเห็นหรือข้อเสนอแนะเพื่อพัฒนาการจัดอบรมในโอกาสต่อไป..."
              className="w-full bg-stone-950/80 border border-stone-800 rounded-xl p-3 text-xs md:text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-300/60 focus:ring-1 focus:ring-amber-300/30 transition"
            />
          </motion.div>

          {/* Error Notice */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-stone-900 border border-rose-900/60 rounded-xl p-3 text-xs text-rose-300 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3.5 px-6 rounded-xl font-medium text-sm md:text-base flex items-center justify-center gap-2 transition-all ${
              isAllAnswered
                ? 'bg-stone-100 hover:bg-white text-stone-950 shadow-md cursor-pointer'
                : 'bg-stone-900 text-stone-500 border border-stone-800 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-stone-400 border-t-stone-950 rounded-full animate-spin" />
                <span>กำลังบันทึกข้อมูล...</span>
              </>
            ) : (
              <>
                <span>ส่งผลการประเมิน</span>
                <Send className="w-4 h-4 text-stone-800" />
              </>
            )}
          </motion.button>
        </form>
      )}
    </div>
  );
};

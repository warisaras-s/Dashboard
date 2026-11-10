import { QuestionItem } from '../types';

export const SURVEY_QUESTIONS: QuestionItem[] = [
  {
    id: 1,
    key: 'q1',
    title: '1. ความชัดเจนและประโยชน์ของเนื้อหาหลักสูตร',
    subtitle: 'เนื้อหาเรียบเรียงเป็นขั้นตอน ตรงตามวัตถุประสงค์ และนำไปใช้งานได้จริง',
    shortLabel: 'เนื้อหาหลักสูตร',
  },
  {
    id: 2,
    key: 'q2',
    title: '2. ความรู้ความสามารถและเทคนิคการถ่ายทอดของวิทยากร',
    subtitle: 'อธิบายเข้าใจง่าย ยกตัวอย่างชัดเจน เปิดโอกาสให้ซักถาม และดูแลผู้เรียนอย่างทั่วถึง',
    shortLabel: 'วิทยากรและการถ่ายทอด',
  },
  {
    id: 3,
    key: 'q3',
    title: '3. การนำความรู้และทักษะไปประยุกต์ใช้ในการทำงาน',
    subtitle: 'หลักสูตรช่วยเพิ่มประสิทธิภาพและสามารถต่อยอดกับภาระงานจริงได้ทันที',
    shortLabel: 'การนำไปประยุกต์ใช้',
  },
  {
    id: 4,
    key: 'q4',
    title: '4. คุณภาพของสื่อ สไลด์ เอกสาร และเครื่องมือประกอบการอบรม',
    subtitle: 'สื่อการสอนทันสมัย เข้าใจง่าย และเครื่องมือ/แล็บพร้อมใช้งาน',
    shortLabel: 'สื่อและเอกสารอบรม',
  },
  {
    id: 5,
    key: 'q5',
    title: '5. ความเหมาะสมของเวลา สถานที่/ระบบ และการประสานงาน',
    subtitle: 'ระยะเวลาเหมาะสม บรรยากาศเอื้อต่อการเรียนรู้ และทีมงานดูแลประสานงานดี',
    shortLabel: 'เวลา สถานที่ และบริการ',
  },
];

export const RATING_SCALE = [
  { score: 5, label: 'มากที่สุด', emoji: '✦', color: 'from-amber-200 to-amber-400', activeBg: 'bg-amber-400/15 text-amber-200 border-amber-300/80 shadow-[0_0_15px_rgba(251,191,36,0.12)]' },
  { score: 4, label: 'มาก', emoji: '◇', color: 'from-stone-200 to-stone-400', activeBg: 'bg-stone-200/15 text-stone-100 border-stone-300/80 shadow-[0_0_15px_rgba(255,255,255,0.06)]' },
  { score: 3, label: 'ปานกลาง', emoji: '―', color: 'from-stone-400 to-stone-500', activeBg: 'bg-stone-500/15 text-stone-200 border-stone-400/70' },
  { score: 2, label: 'น้อย', emoji: '▽', color: 'from-stone-500 to-stone-600', activeBg: 'bg-stone-600/15 text-stone-300 border-stone-500/60' },
  { score: 1, label: 'น้อยที่สุด', emoji: '·', color: 'from-stone-600 to-stone-700', activeBg: 'bg-stone-700/15 text-stone-400 border-stone-600/50' },
];

export function getInterpretation(average: number): {
  level: string;
  badgeColor: string;
  desc: string;
} {
  if (average >= 4.51) {
    return {
      level: 'มากที่สุด (ดีเยี่ยม)',
      badgeColor: 'bg-amber-950/40 text-amber-200 border-amber-300/40 tracking-wider',
      desc: 'ผู้เข้าร่วมอบรมมีความพึงพอใจในระดับสูงสุดตามเกณฑ์มาตรฐานสากล',
    };
  }
  if (average >= 3.51) {
    return {
      level: 'มาก (ดี)',
      badgeColor: 'bg-stone-900/50 text-stone-200 border-stone-400/40 tracking-wider',
      desc: 'ผู้เข้าร่วมอบรมมีความพึงพอใจในเกณฑ์ดี บรรลุเป้าหมายหลักของการจัดอบรม',
    };
  }
  if (average >= 2.51) {
    return {
      level: 'ปานกลาง',
      badgeColor: 'bg-stone-900/50 text-stone-300 border-stone-600/40 tracking-wider',
      desc: 'ผลการประเมินอยู่ในเกณฑ์มาตรฐาน พร้อมจุดที่สามารถพัฒนาเพิ่มเติมได้',
    };
  }
  if (average >= 1.51) {
    return {
      level: 'น้อย (ควรปรับปรุง)',
      badgeColor: 'bg-stone-900/50 text-stone-400 border-stone-700/50 tracking-wider',
      desc: 'ควรทบทวนแนวทางการบรรยายและเนื้อหาเพื่อปรับปรุงให้ตรงเป้าหมาย',
    };
  }
  return {
    level: 'น้อยที่สุด (ต้องเร่งแก้ไข)',
    badgeColor: 'bg-stone-900/50 text-stone-500 border-stone-800 tracking-wider',
    desc: 'ผลประเมินต่ำกว่าเกณฑ์มาตรฐาน จำเป็นต้องปรับปรุงโครงสร้างการอบรม',
  };
}

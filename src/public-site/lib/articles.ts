export interface Article {
  id: string;
  slug: string;
  tagTh: string;
  tagEn: string;
  titleTh: string;
  titleEn: string;
  excerptTh: string;
  excerptEn: string;
  readMinutes: number;
}

/** บทความบนหน้าแรก (Feature 9) – ข้อมูลตัวอย่าง */
export const ARTICLES: Article[] = [
  {
    id: 'a1',
    slug: 'interview-questions-hr',
    tagTh: 'เตรียมตัวสัมภาษณ์',
    tagEn: 'Interview prep',
    titleTh: '5 คำถามยอดฮิตตอนสัมภาษณ์งาน พร้อมวิธีตอบให้ได้ใจ HR',
    titleEn: '5 common interview questions and how to answer them well',
    excerptTh:
      'สรุปคำถามที่พบบ่อยในการสัมภาษณ์งาน กับเทคนิคการตอบคำถามที่ทำให้คุณโดดเด่นกว่าใคร',
    excerptEn:
      'The questions that come up most often — and answer structures that make you stand out.',
    readMinutes: 6,
  },
  {
    id: 'a2',
    slug: 'resume-for-tech',
    tagTh: 'การเขียนเรซูเม่',
    tagEn: 'Resume tips',
    titleTh: 'เขียน Resume อย่างไรให้โดนใจสาย Tech ในปี 2026',
    titleEn: 'How to write a resume that lands tech interviews in 2026',
    excerptTh:
      'จัดโครงสร้างเรซูเม่ให้อ่านง่าย เน้นผลลัพธ์ที่วัดผลได้ และคีย์เวิร์ดที่ระบบ ATS มองเห็น',
    excerptEn:
      'Structure your resume for skim-reading, lead with measurable results, and pass the ATS.',
    readMinutes: 8,
  },
  {
    id: 'a3',
    slug: 'hybrid-work-balance',
    tagTh: 'ไลฟ์สไตล์การทำงาน',
    tagEn: 'Work life',
    titleTh: 'ทำงานแบบ Hybrid: บาลานซ์ชีวิตและการทำงานให้ลงตัว',
    titleEn: 'Hybrid work: finding a balance that actually holds',
    excerptTh:
      'เปรียบเทียบข้อดีข้อเสียของการทำงานแต่ละรูปแบบ พร้อมวิธีจัดตารางเวลาที่ยั่งยืน',
    excerptEn:
      'The trade-offs of each work style, plus a scheduling approach that lasts.',
    readMinutes: 5,
  },
];


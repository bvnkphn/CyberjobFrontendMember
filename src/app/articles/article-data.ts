export interface ArticleSection {
  heading: string;
  headingEn?: string;
  paragraphs: string[];
  bullets?: string[];
  callout?: string;
}

export interface ArticleItem {
  slug: string;
  category: string;
  categoryEn: string;
  title: string;
  titleEn: string;
  excerpt: string;
  excerptEn: string;
  image: string;
  date: string;
  dateEn: string;
  readMinutes: number;
  views: number;
  featured?: boolean;
  author: {
    name: string;
    nameEn: string;
    role: string;
    roleEn: string;
    avatar: string;
  };
  tags: string[];
  content: {
    intro: string;
    introEn?: string;
    sections: ArticleSection[];
    conclusion: string;
    conclusionEn?: string;
  };
}

export const articleCategories: string[] = [
  'ทั้งหมด',
  'เรซูเม่',
  'เทรนด์การทำงาน',
  'สมัครงาน',
  'การทำงาน',
  'สายงานไอที',
  'พัฒนาตนเอง',
];

/**
 * รายการบทความในระบบ
 * หมายเหตุ: บทความจริงจะถูกสร้างสรรค์โดยผู้ประกอบการ (Owner)
 * และผ่านการตรวจสอบอนุมัติโดยผู้ดูแลระบบ (Admin) ก่อนเผยแพร่สู่สาธารณะ
 * ในระบบปัจจุบันยังไม่มีบทความจริงที่ผ่านการอนุมัติ จึงเป็นรายการว่าง []
 */
export const articles: ArticleItem[] = [];

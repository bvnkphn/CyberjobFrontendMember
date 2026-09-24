'use client';

import { useI18n } from '@/public-site/i18n/LanguageProvider';

interface Partner {
  name: string;
  src: string;
  alt: string;
}

const PARTNERS: Partner[] = [
  {
    name: 'ธนาคารออมสิน',
    alt: 'ธนาคารออมสิน Government Savings Bank',
    src: '/images/partners/gsb.png',
  },
  {
    name: 'SCB ไทยพาณิชย์',
    alt: 'ธนาคารไทยพาณิชย์ Siam Commercial Bank',
    src: '/images/partners/scb.png',
  },
  {
    name: 'KBank กสิกรไทย',
    alt: 'ธนาคารกสิกรไทย Kasikornbank',
    src: '/images/partners/kbank.png',
  },
  {
    name: 'krungsri กรุงศรี',
    alt: 'ธนาคารกรุงศรีอยุธยา Bank of Ayudhya',
    src: '/images/partners/krungsri.png',
  },
  {
    name: 'Krungthai กรุงไทย',
    alt: 'ธนาคารกรุงไทย Krungthai Bank',
    src: '/images/partners/krungthai.png',
  },
  {
    name: 'Bangkok Bank ธนาคารกรุงเทพ',
    alt: 'ธนาคารกรุงเทพ Bangkok Bank',
    src: '/images/partners/bangkokbank.png',
  },
  {
    name: 'NIA สำนักงานนวัตกรรมแห่งชาติ',
    alt: 'สำนักงานนวัตกรรมแห่งชาติ National Innovation Agency',
    src: '/images/partners/nia.png',
  },
  {
    name: 'TED FUND',
    alt: 'กองทุนพัฒนาผู้ประกอบการเทคโนโลยีและนวัตกรรม TED FUND',
    src: '/images/partners/tedfund.png',
  },
  {
    name: 'Pay Solutions',
    alt: 'Pay Solutions ผู้ให้บริการระบบรับชำระเงินออนไลน์',
    src: '/images/partners/paysolutions.png',
  },
  {
    name: 'CYBERNETICS+',
    alt: 'CYBERNETICS+ Group of Digital Specialist',
    src: '/images/partners/cybernetics.png',
  },
];

export function PartnersSection() {
  const { lang } = useI18n();

  return (
    <section className="border-y border-blue-100/60 bg-blue-50/40 py-16">
      <div className="container-page">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-brand-900 sm:text-3xl">
            {lang === 'en' ? 'Strategic Partner Network' : 'เครือข่ายความร่วมมือและพันธมิตร'}
          </h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            {lang === 'en'
              ? 'Collaborating with premier financial institutions, innovation funds, and digital pioneers'
              : 'ความร่วมมือกับสถาบันการเงิน กองทุนนวัตกรรม และองค์กรเทคโนโลยีชั้นนำ'}
          </p>
        </div>

        {/* 10 Partners Grid (5 cols desktop, 2-3 mobile) */}
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 md:gap-5">
          {PARTNERS.map((partner) => (
            <div
              key={partner.name}
              className="flex h-24 sm:h-28 items-center justify-center rounded-2xl border border-blue-100/80 bg-white p-3.5 shadow-sm transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-md"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={partner.src}
                alt={partner.alt}
                className="max-h-12 sm:max-h-14 w-auto max-w-[85%] object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

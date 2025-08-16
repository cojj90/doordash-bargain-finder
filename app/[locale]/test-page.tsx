'use client';

import { useTranslations } from 'next-intl';

export default function TestPage() {
  const t = useTranslations();
  
  return (
    <div>
      <h1>{t('app.title')}</h1>
      <p>Test page is working!</p>
    </div>
  );
}

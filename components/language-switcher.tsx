'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import { locales } from '@/i18n';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    // Remove the current locale from the pathname if it exists
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    
    // Navigate to the new locale
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-100">
      <Globe className="w-4 h-4 text-gray-500" />
      <select
        value={locale}
        onChange={(e) => handleLocaleChange(e.target.value)}
        className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
      >
        <option value="en">English</option>
        <option value="ko">한국어</option>
      </select>
    </div>
  );
}

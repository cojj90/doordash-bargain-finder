'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Check } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', nativeName: '한국어' },
];

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
    <div className="space-y-1">
      {languages.map((language) => (
        <button
          key={language.code}
          onClick={() => handleLocaleChange(language.code)}
          className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-all ${
            locale === language.code
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">{language.flag}</span>
            <span className="text-sm">{language.nativeName}</span>
          </div>
          {locale === language.code && (
            <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
          )}
        </button>
      ))}
    </div>
  );
}

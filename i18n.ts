import {getRequestConfig} from 'next-intl/server';

// Can be imported from a shared config
export const locales = ['en', 'ko'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({requestLocale}) => {
  const locale = await requestLocale || 'en';

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
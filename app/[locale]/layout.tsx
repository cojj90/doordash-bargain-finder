import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {locales, type Locale} from '@/i18n';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DoorDash Bargain Finder | Find the Best Deals",
  description: "Discover amazing discounts and savings on DoorDash products. Browse through thousands of deals, track price drops, and never miss a bargain!",
  keywords: "doordash, deals, discounts, bargains, savings, shopping, groceries",
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  // Await the params as required in Next.js 15
  const { locale } = await params;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${inter.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
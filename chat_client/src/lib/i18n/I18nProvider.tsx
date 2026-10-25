import { getLocales } from 'expo-localization';
import { createContext, useEffect, useState, type PropsWithChildren } from 'react';

import { secureStorage } from '@/lib/storage';

import { en, type Translations } from './translations/en';
import { ru } from './translations/ru';
import type { Language, TranslateFn, TranslationKey } from './types';

const LANGUAGE_KEY = 'app.language';

const dictionaries: Record<Language, Translations> = { en, ru };

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
];

const isLanguage = (value: unknown): value is Language => value === 'en' || value === 'ru';

const detectDeviceLanguage = (): Language => {
  try {
    return getLocales()[0].languageCode === 'ru' ? 'ru' : 'en';
  } catch {
    // No locale information available (e.g. during server rendering)
    return 'en';
  }
};

const lookup = (dictionary: Translations, key: TranslationKey): string => {
  const value = key
    .split('.')
    .reduce<unknown>((node, part) => (node as Record<string, unknown>)?.[part], dictionary);
  return typeof value === 'string' ? value : key;
};

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: TranslateFn;
};

export const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider = ({ children }: PropsWithChildren) => {
  const [language, setLanguageState] = useState<Language>(detectDeviceLanguage);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    secureStorage
      .getItem(LANGUAGE_KEY)
      .then((stored) => {
        if (isLanguage(stored)) {
          setLanguageState(stored);
        }
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    secureStorage.setItem(LANGUAGE_KEY, next).catch(() => undefined);
  };

  const t: TranslateFn = (key, params) => {
    const template = lookup(dictionaries[language], key);
    if (!params) {
      return template;
    }
    return template.replace(/\{(\w+)\}/g, (match, name: string) => String(params[name] ?? match));
  };

  // Keep the splash screen up until the saved language is known, so text does not flicker
  if (!ready) {
    return null;
  }

  return <I18nContext value={{ language, setLanguage, t }}>{children}</I18nContext>;
};

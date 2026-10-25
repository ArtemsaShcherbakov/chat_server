import { use } from 'react';

import { I18nContext } from './I18nProvider';

export const useTranslation = () => {
  const value = use(I18nContext);
  if (!value) {
    throw new Error('useTranslation must be used inside <I18nProvider>');
  }
  return value;
};

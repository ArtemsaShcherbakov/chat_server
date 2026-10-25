import { useState } from 'react';

import { useTranslation, type TranslationKey } from '@/lib/i18n';

import type { FormErrors } from '../validation';

type AuthFormOptions<Values extends Record<string, string>> = {
  initialValues: Values;
  validate: (values: Values) => FormErrors<Values>;
  onSubmit: (values: Values) => Promise<void>;
  getErrorKey: (error: unknown) => TranslationKey;
  // Fields emptied after a failed submit, e.g. passwords
  clearOnError?: (keyof Values)[];
};

type Touched<Values> = Partial<Record<keyof Values, boolean>>;

// State shared by the auth forms: values, per-field errors shown after blur, submit status
export const useAuthForm = <Values extends Record<string, string>>({
  initialValues,
  validate,
  onSubmit,
  getErrorKey,
  clearOnError = [],
}: AuthFormOptions<Values>) => {
  const { t } = useTranslation();
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState<Touched<Values>>({});
  const [submitError, setSubmitError] = useState<TranslationKey | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errors = validate(values);

  const setField = (field: keyof Values) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setSubmitError(null);
  };

  const touchField = (field: keyof Values) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const getFieldError = (field: keyof Values) => {
    const error = errors[field];
    if (!touched[field] || !error) {
      return undefined;
    }
    return t(error.key, error.params);
  };

  // Builds { [field]: value } for several fields at once
  const fieldsTo = <T>(fields: (keyof Values)[], value: T) => {
    const entries = fields.map((field) => [field, value] as const);
    return Object.fromEntries(entries) as Partial<Record<keyof Values, T>>;
  };

  const submit = async () => {
    setTouched(fieldsTo(Object.keys(values), true));

    if (Object.values(errors).some(Boolean) || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(values);
    } catch (error) {
      setSubmitError(getErrorKey(error));
      setValues((prev) => ({ ...prev, ...fieldsTo(clearOnError, '') }));
      setTouched((prev) => ({ ...prev, ...fieldsTo(clearOnError, false) }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    isSubmitting,
    submitError: submitError ? t(submitError) : null,
    setField,
    touchField,
    getFieldError,
    submit,
  };
};

// JSON helpers that never throw: invalid input yields null instead of an exception

export const parseJson = <T>(raw: string | null): T | null => {
  if (raw === null) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

// JSON.stringify throws on circular structures and BigInt values
export const stringifyJson = (value: unknown): string | null => {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
};

import type { TextStyle } from 'react-native';

export const typography = {
  body: { fontSize: 16, lineHeight: 24, fontWeight: 500 },
  label: { fontSize: 14, lineHeight: 20, fontWeight: 600 },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: 500 },
  button: { fontSize: 16, lineHeight: 24, fontWeight: 600 },
} as const satisfies Record<string, TextStyle>;

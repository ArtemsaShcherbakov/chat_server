// Black & violet palette, used regardless of the system color scheme
export const Colors = {
  text: '#F5F3FF',
  background: '#000000',
  backgroundElement: '#16121F',
  backgroundSelected: '#251C3A',
  textSecondary: '#A89BC8',
} as const;

export type ThemeColor = keyof typeof Colors;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const MaxContentWidth = 800;

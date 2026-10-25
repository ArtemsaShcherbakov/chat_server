import { StyleSheet, Text, type TextProps } from 'react-native';

import { Colors, ThemeColor } from '@/constants/theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'subtitle';
  themeColor?: ThemeColor;
};

export const ThemedText = ({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) => (
  <Text style={[{ color: Colors[themeColor ?? 'text'] }, styles[type], style]} {...rest} />
);

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500,
  },
  subtitle: {
    fontSize: 32,
    lineHeight: 44,
    fontWeight: 600,
  },
});

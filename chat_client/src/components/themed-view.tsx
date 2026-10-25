import { View, type ViewProps } from 'react-native';

import { Colors, ThemeColor } from '@/constants/theme';

export type ThemedViewProps = ViewProps & {
  type?: ThemeColor;
};

export const ThemedView = ({ style, type, ...rest }: ThemedViewProps) => (
  <View style={[{ backgroundColor: Colors[type ?? 'background'] }, style]} {...rest} />
);

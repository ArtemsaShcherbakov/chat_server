import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/ui';

type AuthLinkProps = {
  prompt: string;
  action: string;
  href: Href;
};

// "No account yet? Sign up" — switches between the login and registration screens
export const AuthLink = ({ prompt, action, href }: AuthLinkProps) => (
  <View style={styles.container}>
    <Text style={[typography.caption, styles.prompt]}>{prompt}</Text>
    {/* replace: switching between the two screens should not grow the back stack */}
    <Link href={href} replace asChild>
      <Pressable role="link">
        <Text style={[typography.label, styles.action]}>{action}</Text>
      </Pressable>
    </Link>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.one,
  },
  prompt: {
    color: colors.textSecondary,
  },
  action: {
    color: colors.primary,
  },
});

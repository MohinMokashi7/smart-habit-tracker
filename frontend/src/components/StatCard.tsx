import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../theme';
import { IconName } from '../utils/habitVisuals';
import { AppText } from './AppText';

interface StatCardProps {
  icon: IconName;
  iconColor?: string;
  value: string;
  label: string;
}

/** Compact tile used for streaks, minutes, rates, etc. */
export function StatCard({ icon, iconColor = colors.primary, value, label }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Ionicons name={icon} size={22} color={iconColor} />
      <AppText variant="h2" style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </AppText>
      <AppText variant="tiny" color={colors.textMuted} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  value: { marginTop: 6 },
});

import { StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing } from '../theme';
import { AppText } from './AppText';
import { ProgressBar } from './ProgressBar';

interface ProgressCardProps {
  title: string;
  completed: number;
  total: number;
}

export function ProgressCard({ title, completed, total }: ProgressCardProps) {
  const ratio = total === 0 ? 0 : completed / total;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <AppText variant="h3">{title}</AppText>
        <AppText variant="h2" color={colors.primary}>
          {completed} / {total}
        </AppText>
      </View>
      <View style={styles.barRow}>
        <View style={styles.bar}>
          <ProgressBar value={ratio} height={10} />
        </View>
        <AppText variant="label" color={colors.textMuted} style={styles.percent}>
          {Math.round(ratio * 100)}%
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.card,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  barRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg },
  bar: { flex: 1 },
  percent: { width: 44, textAlign: 'right' },
});

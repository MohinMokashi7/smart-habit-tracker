import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../theme';
import { AppText } from './AppText';
import { PrimaryButton } from './PrimaryButton';
import { IconName } from '../utils/habitVisuals';

export function LoadingIndicator({ label, fill = true }: { label?: string; fill?: boolean }) {
  return (
    <View style={[styles.center, fill && styles.fill]}>
      <ActivityIndicator size="large" color={colors.primary} />
      {label ? (
        <AppText variant="caption" color={colors.textMuted} style={styles.gap}>
          {label}
        </AppText>
      ) : null}
    </View>
  );
}

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = 'leaf-outline', title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.center}>
      <View style={styles.badge}>
        <Ionicons name={icon} size={30} color={colors.primary} />
      </View>
      <AppText variant="h3" style={styles.centerText}>
        {title}
      </AppText>
      {message ? (
        <AppText variant="body" color={colors.textMuted} style={[styles.centerText, styles.gap]}>
          {message}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <PrimaryButton label={actionLabel} onPress={onAction} style={styles.action} />
      ) : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <View style={[styles.badge, { backgroundColor: colors.dangerSoft }]}>
        <Ionicons name="cloud-offline-outline" size={30} color={colors.danger} />
      </View>
      <AppText variant="h3" style={styles.centerText}>
        Something went wrong
      </AppText>
      <AppText variant="body" color={colors.textMuted} style={[styles.centerText, styles.gap]}>
        {message}
      </AppText>
      {onRetry ? <PrimaryButton label="Try again" icon="refresh" onPress={onRetry} style={styles.action} /> : null}
    </View>
  );
}

export function InlineBanner({
  message,
  tone = 'error',
  onDismiss,
}: {
  message: string;
  tone?: 'error' | 'info';
  onDismiss?: () => void;
}) {
  const isError = tone === 'error';
  return (
    <View style={[styles.banner, { backgroundColor: isError ? colors.dangerSoft : colors.primarySoft }]}>
      <Ionicons
        name={isError ? 'alert-circle' : 'information-circle'}
        size={18}
        color={isError ? colors.danger : colors.primary}
      />
      <AppText variant="caption" color={colors.text} style={styles.bannerText}>
        {message}
      </AppText>
      {onDismiss ? (
        <Ionicons name="close" size={18} color={colors.textMuted} onPress={onDismiss} suppressHighlighting />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  centerText: { textAlign: 'center' },
  gap: { marginTop: spacing.sm },
  badge: {
    width: 68,
    height: 68,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  action: { marginTop: spacing.xl, alignSelf: 'stretch' },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  bannerText: { flex: 1, marginHorizontal: spacing.sm },
});

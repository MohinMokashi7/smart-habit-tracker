import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { getWeeklyAnalytics } from '../../api/historyApi';
import { getBaseUrl } from '../../api/config';
import { AppText } from '../../components/AppText';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { FadeIn } from '../../components/FadeIn';
import { Screen } from '../../components/Screen';
import { StatCard } from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import { useFocusData } from '../../hooks/useFocusData';
import { useAppNavigation } from '../../navigation/types';
import { colors, radius, spacing } from '../../theme';
import { formatMinutes, percent } from '../../utils/format';
import { IconName } from '../../utils/habitVisuals';

export function ProfileScreen() {
  const navigation = useAppNavigation();
  const { displayName, email, signOut } = useAuth();
  const { data: weekly, refreshing, refresh } = useFocusData(getWeeklyAnalytics);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const logout = async () => {
    setLoggingOut(true);
    await signOut();
  };

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <View style={styles.titleRow}>
        <AppText variant="h1">Profile</AppText>
      </View>

      <FadeIn>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <AppText variant="h1" color={colors.onPrimary}>
              {displayName.charAt(0).toUpperCase()}
            </AppText>
          </View>
          <View style={styles.profileText}>
            <AppText variant="h2" numberOfLines={1}>
              {displayName}
            </AppText>
            <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
              {email}
            </AppText>
          </View>
        </View>
      </FadeIn>

      {weekly && (
        <FadeIn delay={80}>
          <AppText variant="h3" style={styles.sectionTitle}>
            This week
          </AppText>
          <View style={styles.stats}>
            <StatCard icon="pie-chart-outline" value={percent(weekly.completionRate)} label="Completion" />
            <View style={styles.gap} />
            <StatCard
              icon="checkmark-done-circle-outline"
              value={`${weekly.totalCompleted}/${weekly.totalScheduled}`}
              label="Habits done"
            />
            <View style={styles.gap} />
            <StatCard icon="timer-outline" value={formatMinutes(weekly.productiveMinutes)} label="Productive" />
          </View>
        </FadeIn>
      )}

      <FadeIn delay={140} style={styles.menu}>
        <MenuRow
          icon="list-outline"
          label="Manage habits"
          onPress={() => navigation.navigate('Tabs', { screen: 'Habits' })}
        />
        <MenuRow icon="server-outline" label="Server" value={getBaseUrl()} />
        <MenuRow icon="log-out-outline" label="Logout" danger onPress={() => setConfirmLogout(true)} last />
      </FadeIn>

      <ConfirmationModal
        visible={confirmLogout}
        title="Log out?"
        message="You'll need to sign in again to see your habits."
        confirmLabel="Logout"
        destructive
        loading={loggingOut}
        onConfirm={logout}
        onCancel={() => setConfirmLogout(false)}
      />
    </Screen>
  );
}

function MenuRow({
  icon,
  label,
  value,
  onPress,
  danger,
  last,
}: {
  icon: IconName;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  last?: boolean;
}) {
  const tint = danger ? colors.danger : colors.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      style={({ pressed }) => [styles.row, !last && styles.rowBorder, pressed && { opacity: 0.7 }]}
    >
      <Ionicons name={icon} size={20} color={danger ? colors.danger : colors.primary} />
      <AppText variant="body" color={tint} style={styles.rowLabel}>
        {label}
      </AppText>
      {value ? (
        <AppText variant="caption" color={colors.textFaint} numberOfLines={1} style={styles.rowValue}>
          {value}
        </AppText>
      ) : null}
      {onPress && !danger ? <Ionicons name="chevron-forward" size={18} color={colors.textFaint} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  titleRow: { marginBottom: spacing.lg },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  profileText: { flex: 1 },
  sectionTitle: { marginTop: spacing.xl, marginBottom: spacing.md },
  stats: { flexDirection: 'row' },
  gap: { width: spacing.md },
  menu: {
    marginTop: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { flex: 1, marginLeft: spacing.md },
  rowValue: { maxWidth: '55%', marginLeft: spacing.sm },
});

import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../components/AppText';
import { colors, radius, shadows } from '../theme';
import { IconName } from '../utils/habitVisuals';
import { AppStackParamList } from './types';

const TABS: Record<string, { label: string; icon: IconName; iconActive: IconName }> = {
  Home: { label: 'Home', icon: 'home-outline', iconActive: 'home' },
  History: { label: 'History', icon: 'stats-chart-outline', iconActive: 'stats-chart' },
  Habits: { label: 'Habits', icon: 'list-outline', iconActive: 'list' },
  Profile: { label: 'Profile', icon: 'person-outline', iconActive: 'person' },
};

/**
 * Bottom navigation with a centre "+" button that opens the create-habit screen.
 * Layout: Home · History · (+) · Habits · Profile
 */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const appNavigation = navigation as unknown as NativeStackNavigationProp<AppStackParamList>;

  const items = state.routes.map((route, index) => {
    const meta = TABS[route.name];
    const focused = state.index === index;

    const onPress = () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
    };

    return (
      <Pressable
        key={route.key}
        onPress={onPress}
        style={styles.tab}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={meta.label}
      >
        <Ionicons name={focused ? meta.iconActive : meta.icon} size={22} color={focused ? colors.primary : colors.textFaint} />
        <AppText variant="tiny" color={focused ? colors.primary : colors.textFaint} style={styles.tabLabel}>
          {meta.label}
        </AppText>
      </Pressable>
    );
  });

  const fab = (
    <View key="fab" style={styles.fabSlot}>
      <Pressable
        onPress={() => appNavigation.navigate('HabitForm')}
        accessibilityRole="button"
        accessibilityLabel="Add a new habit"
        style={({ pressed }) => [styles.fab, shadows.glow, pressed && { transform: [{ scale: 0.94 }] }]}
      >
        <Ionicons name="add" size={32} color={colors.onPrimary} />
      </Pressable>
    </View>
  );

  const ordered = [...items.slice(0, 2), fab, ...items.slice(2)];

  return <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>{ordered}</View>;
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  tabLabel: { marginTop: 3 },
  fabSlot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fab: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
  },
});

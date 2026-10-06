import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius } from '../theme';
import { DayOfWeek } from '../types/api';
import { DAYS, DAY_SHORT } from '../utils/format';
import { AppText } from './AppText';

interface WeekdayPickerProps {
  selected: DayOfWeek[];
  onToggle: (day: DayOfWeek) => void;
}

export function WeekdayPicker({ selected, onToggle }: WeekdayPickerProps) {
  return (
    <View style={styles.row}>
      {DAYS.map((day) => {
        const active = selected.includes(day);
        return (
          <Pressable
            key={day}
            onPress={() => onToggle(day)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: active }}
            accessibilityLabel={day.charAt(0) + day.slice(1).toLowerCase()}
            style={[styles.chip, active && styles.chipActive]}
          >
            <AppText variant="tiny" color={active ? colors.onPrimary : colors.textMuted} style={styles.chipText}>
              {DAY_SHORT[day]}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  chip: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 48,
    marginHorizontal: 2,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontWeight: '700' },
});

import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { colors, radius } from '../theme';
import { AppText } from './AppText';

export interface BarDatum {
  label: string;
  /** 0..100 */
  value: number;
  /** false when nothing was scheduled that day (drawn as a faint stub) */
  hasData: boolean;
  highlight?: boolean;
}

interface BarChartProps {
  data: BarDatum[];
  height?: number;
}

export function BarChart({ data, height = 120 }: BarChartProps) {
  return (
    <View style={styles.row}>
      {data.map((d) => (
        <View key={d.label} style={styles.col}>
          <View style={[styles.well, { height }]}>
            <Bar datum={d} height={height} />
          </View>
          <AppText variant="tiny" color={d.highlight ? colors.primary : colors.textMuted} style={styles.label}>
            {d.label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

function Bar({ datum, height }: { datum: BarDatum; height: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const target = datum.hasData ? Math.max(0.06, Math.min(1, datum.value / 100)) : 0.04;

  useEffect(() => {
    Animated.timing(anim, { toValue: target, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [anim, target]);

  const barHeight = anim.interpolate({ inputRange: [0, 1], outputRange: [0, height] });
  const color = !datum.hasData ? colors.border : datum.highlight ? colors.primary : colors.primaryDim;

  return <Animated.View style={[styles.bar, { height: barHeight, backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { flex: 1, alignItems: 'center' },
  well: {
    width: '46%',
    minWidth: 12,
    maxWidth: 30,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: { width: '100%', borderRadius: radius.sm },
  label: { marginTop: 8 },
});

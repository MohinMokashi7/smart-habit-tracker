import { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';

import { colors } from '../theme';
import { HistoryDay } from '../types/api';
import { addDays, mondayOf } from '../utils/dates';
import { AppText } from './AppText';

interface HeatmapProps {
  history: HistoryDay[];
  weeks?: number;
}

type CellState = 'done' | 'missed' | 'pending' | 'off' | 'none';

const CELL_COLORS: Record<CellState, string> = {
  done: colors.primary,
  missed: 'rgba(255, 93, 93, 0.35)',
  pending: colors.borderStrong,
  off: colors.bgElevated,
  none: 'transparent',
};

const ROW_LABELS = ['M', '', 'W', '', 'F', '', 'S'];
const GAP = 4;
const LABEL_WIDTH = 16;

/** Calendar-style grid: one column per week (Mon..Sun), most recent week on the right. */
export function Heatmap({ history, weeks = 12 }: HeatmapProps) {
  const [width, setWidth] = useState(0);

  const columns = useMemo(() => {
    const byDate = new Map(history.map((d) => [d.date, d]));
    const last = history.length > 0 ? history[history.length - 1].date : null;
    if (!last) return [] as CellState[][];
    const firstMonday = addDays(mondayOf(last), -7 * (weeks - 1));

    const cols: CellState[][] = [];
    for (let w = 0; w < weeks; w += 1) {
      const col: CellState[] = [];
      for (let d = 0; d < 7; d += 1) {
        const date = addDays(firstMonday, w * 7 + d);
        const entry = byDate.get(date);
        if (!entry) col.push('none');
        else if (!entry.scheduled) col.push('off');
        else if (entry.completed) col.push('done');
        else if (date === last) col.push('pending');
        else col.push('missed');
      }
      cols.push(col);
    }
    return cols;
  }, [history, weeks]);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const cell = width > 0 ? Math.max(8, Math.min(26, (width - LABEL_WIDTH - GAP * weeks) / weeks)) : 0;

  return (
    <View onLayout={onLayout}>
      {cell > 0 && (
        <View style={styles.grid}>
          <View style={[styles.labels, { marginRight: GAP }]}>
            {ROW_LABELS.map((l, i) => (
              <View key={i} style={{ height: cell, marginBottom: GAP, justifyContent: 'center' }}>
                <AppText variant="tiny" color={colors.textFaint}>
                  {l}
                </AppText>
              </View>
            ))}
          </View>
          {columns.map((col, ci) => (
            <View key={ci} style={{ marginRight: ci === columns.length - 1 ? 0 : GAP }}>
              {col.map((state, ri) => (
                <View
                  key={ri}
                  style={{
                    width: cell,
                    height: cell,
                    marginBottom: GAP,
                    borderRadius: 4,
                    backgroundColor: CELL_COLORS[state],
                    borderWidth: state === 'pending' ? 1 : 0,
                    borderColor: colors.primary,
                  }}
                />
              ))}
            </View>
          ))}
        </View>
      )}
      <View style={styles.legend}>
        <LegendItem color={colors.primary} label="Done" />
        <LegendItem color={CELL_COLORS.missed} label="Missed" />
        <LegendItem color={CELL_COLORS.off} label="Not scheduled" />
      </View>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <AppText variant="tiny" color={colors.textMuted}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', alignItems: 'flex-start' },
  labels: { width: LABEL_WIDTH },
  legend: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 3, marginRight: 6 },
});
